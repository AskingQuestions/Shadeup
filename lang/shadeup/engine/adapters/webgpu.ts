import type { buffer, buffer_internal } from '../../library/buffer';
import type { Mesh } from '../../../../../shadeup-frontend/lib/std/all';
import { ShadeupTexture2d, type TextureComponentType } from '../engine';
import type { ShadeupShaderInstance } from '../shader';
import {
	Float16Array,
	isFloat16Array,
	isTypedArray,
	getFloat16,
	setFloat16,
	f16round
} from '@petamoriken/float16';

import {
	GenericShader,
	GraphicsAdapter,
	ShaderDispatch,
	type ShaderCodeMapping,
	type ShaderType,
	UniformPayload,
	type UniformValueType,
	type UniformKeyValuePair,
	UniformValue,
	type ShaderBindingOptions
} from './adapter';

import { LRUCache } from 'lru-cache';

const CACHE_PIPELINES = false;

const FormatCapabilities: {
	[key in GPUTextureFormat]: {
		blendable: boolean;
		sampleTypes: string[];
	};
} = {
	r8unorm: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	r8snorm: {
		blendable: false,
		sampleTypes: ['float', 'unfilterable-float']
	},
	r8uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	r8sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rg8unorm: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rg8snorm: {
		blendable: false,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rg8uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rg8sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rgba8unorm: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	'rgba8unorm-srgb': {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rgba8snorm: {
		blendable: false,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rgba8uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rgba8sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	bgra8unorm: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	'bgra8unorm-srgb': {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	r16uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	r16sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	r16float: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rg16uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rg16sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rg16float: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rgba16uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rgba16sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rgba16float: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	r32uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	r32sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	r32float: {
		blendable: false,
		sampleTypes: [
			'unfilterable-float',
			'float',
			'float32-filterable',
			'float',
			'float32-filterable'
		]
	},
	rg32uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rg32sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rg32float: {
		blendable: false,
		sampleTypes: [
			'unfilterable-float',
			'float',
			'float32-filterable',
			'float',
			'float32-filterable'
		]
	},
	rgba32uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rgba32sint: {
		blendable: false,
		sampleTypes: ['sint']
	},
	rgba32float: {
		blendable: false,
		sampleTypes: [
			'unfilterable-float',
			'float',
			'float32-filterable',
			'float',
			'float32-filterable'
		]
	},
	rgb10a2uint: {
		blendable: false,
		sampleTypes: ['uint']
	},
	rgb10a2unorm: {
		blendable: true,
		sampleTypes: ['float', 'unfilterable-float']
	},
	rg11b10ufloat: {
		blendable: false,
		sampleTypes: ['float', 'unfilterable-float']
	}
};

class WebGPUMeshData {
	sourceMesh: Mesh;
	vertexBuffer: GPUBuffer;
	indexBuffer: GPUBuffer;
	vertexCount: number;
	indexCount: number;

	constructor(
		sourceMesh: Mesh,
		vertexBuffer: GPUBuffer,
		indexBuffer: GPUBuffer,
		vertexCount: number,
		indexCount: number
	) {
		this.sourceMesh = sourceMesh;
		this.vertexBuffer = vertexBuffer;
		this.indexBuffer = indexBuffer;
		this.vertexCount = vertexCount;
		this.indexCount = indexCount;
	}
}

const lruCacheOptions = {
	max: 500
};

let lruUniformOptions = {
	max: 128
};

type ShaderUniformCachePayload = {
	key: (number | string)[];
	bindGroupLayout: GPUBindGroupLayout;
	bindGroup: GPUBindGroup;
	uniformBuffer: GPUBuffer;
	specialBuffers: GPUBuffer[];
	cachedUniforms: ArrayBuffer;
	specialsKey: (number | string | Symbol)[];
	specialEntries: GPUBindGroupEntry[];
};

type PipelinePreDispatchCommands = ((encoder: GPUCommandEncoder) => void)[];

type DrawPipelinePayload = {
	pipeline: GPURenderPipeline;
	bindGroupFragment: GPUBindGroup;
	bindGroupVertex: GPUBindGroup;
	baseUniformBuffer: GPUBuffer;
	fragmentUniformBuffer: GPUBuffer;
	vertexUniformBuffer: GPUBuffer;
	specialBuffersFragment: GPUBuffer[];
	specialBuffersVertex: GPUBuffer[];
	commands: PipelinePreDispatchCommands;
};

type ComputePipelinePayload = {
	pipeline: GPUComputePipeline;
	bindGroup: GPUBindGroup;
	baseUniformBuffer: GPUBuffer;
	uniformBuffer: GPUBuffer;
	specialBuffers: GPUBuffer[];

	commands: PipelinePreDispatchCommands;
};

const vertexLayout: GPUVertexBufferLayout[] = [
	{
		// Position
		arrayStride:
			(3 + // Position
				3 + // Normal
				3 + // Tangent
				3 + // Bitangent
				2 + // UV
				4) * // Color
			4,
		stepMode: 'vertex',
		attributes: [
			{
				shaderLocation: 0,
				offset: 0,
				format: 'float32x3'
			},
			{
				shaderLocation: 1,
				offset: 3 * 4,
				format: 'float32x3'
			},
			{
				shaderLocation: 2,
				offset: (3 + 3) * 4,
				format: 'float32x3'
			},
			{
				shaderLocation: 3,
				offset: (3 + 3 + 3) * 4,
				format: 'float32x3'
			},
			{
				shaderLocation: 4,
				offset: (3 + 3 + 3 + 3) * 4,
				format: 'float32x2'
			},
			{
				shaderLocation: 5,
				offset: (3 + 3 + 3 + 3 + 2) * 4,
				format: 'float32x4'
			}
		]
	}
];
const FORMATS: { [key in TextureComponentType]: GPUTextureFormat } & { uint8: GPUTextureFormat } = {
	float: 'r32float',
	int: 'r32sint',
	uint: 'r32uint',
	float2: 'rg32float',
	int2: 'rg32sint',
	uint2: 'rg32uint',
	float3: 'rgba32float',
	int3: 'rgba32sint',
	uint3: 'rgba32uint',
	float4: 'rgba32float',
	int4: 'rgba32sint',
	uint4: 'rgba32uint',
	uint8: 'rgba8unorm'
};
const CAN_BLEND: { [key in TextureComponentType]: boolean } & { uint8: boolean } = {
	float: false,
	int: false,
	uint: false,
	float2: false,
	int2: false,
	uint2: false,
	float3: false,
	int3: false,
	uint3: false,
	float4: false,
	int4: false,
	uint4: false,
	uint8: true
};
export class WebGPUAdapter extends GraphicsAdapter {
	ctx: GPUCanvasContext | null = null;
	texture: GPUTexture | null = null;
	storageTexture: GPUTexture | null = null;
	storageDirty = false;
	pendingWrites: number = 0;
	adapter: GPUAdapter | null = null;
	device: GPUDevice | null = null;

	headless = false;
	headlessDimensions: 2 | 3 = 2;
	headlessWidth = 1024;
	headlessHeight = 1024;
	headlessDepth = 1024;

	baseUniformBufferSize = 2 * 4; // _vtex_canvas
	baseUniformValues = new Float32Array(this.baseUniformBufferSize / 4);
	baseUniformBuffer: GPUBuffer | null = null;

	pipelineCache: LRUCache<string, DrawPipelinePayload | ComputePipelinePayload> = new LRUCache(
		lruCacheOptions
	);

	ready = false;

	catchGPUErrors = true;

	gpuMeshData: Map<Symbol, WebGPUMeshData> = new Map();

	depthTexture: GPUTexture | null = null;
	textureFormat: TextureComponentType | 'uint8' = 'float4';
	gpuTextureFormat: GPUTextureFormat = 'rgba8unorm';

	clearEnqueued = false;

	getValueSize(vt: UniformValueType) {
		return getValueSize(vt);
	}

	init() {
		this.ready = false;
		this.adapter = (window as any).shadeupWebGPUAdapter;
		this.device = (window as any).shadeupWebGPUDevice;
		if (!this.adapter || !this.device) {
			throw new Error('WebGPU is not supported');
		}

		this.addEventListener('context', (to: string) => {
			if (to == 'paint') {
				if (!this.clearEnqueued) {
					this.beforeScreenDraw();
				}
			}
		});

		this.baseUniformBuffer = this.device.createBuffer({
			size: this.baseUniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		// this.adapter = await navigator.gpu.requestAdapter();
		// if (!this.adapter) {
		// 	throw new Error('WebGPU is not supported');
		// }

		// this.device = await this.adapter.requestDevice();

		// if (!this.device) {
		// 	throw new Error('WebGPU is not supported');
		// }

		if (this.headless) {
			if (this.headlessDimensions == 2) {
				this.startDispatch();
				this.texture = this.device.createTexture({
					size: {
						width: this.headlessWidth,
						height: this.headlessHeight
					},
					format: this.gpuTextureFormat,
					dimension: '2d',
					viewFormats: [this.gpuTextureFormat],
					usage:
						GPUTextureUsage.RENDER_ATTACHMENT |
						GPUTextureUsage.TEXTURE_BINDING |
						GPUTextureUsage.COPY_SRC |
						GPUTextureUsage.COPY_DST
				});
				this.endDispatch();
			} else {
				this.startDispatch();
				this.texture = this.device.createTexture({
					size: {
						width: this.headlessWidth,
						height: this.headlessHeight,
						depthOrArrayLayers: this.headlessDepth
					},
					format: this.gpuTextureFormat,
					dimension: '3d',
					usage:
						GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
				});
				this.endDispatch();
			}
		} else {
			this.textureFormat = 'uint8';
			this.ctx = this.canvas!.getContext('webgpu');

			if (!this.ctx) {
				throw new Error('WebGPU is not supported');
			}

			this.ctx.configure({
				device: this.device,
				format: 'rgba8unorm',
				alphaMode: 'premultiplied',
				usage:
					GPUTextureUsage.RENDER_ATTACHMENT |
					GPUTextureUsage.TEXTURE_BINDING |
					GPUTextureUsage.COPY_SRC |
					GPUTextureUsage.COPY_DST
			});
		}

		if (this.canvas) {
			this.startDispatch();
			this.depthTexture = this.device.createTexture({
				size: {
					width: this.canvas.width,
					height: this.canvas.height
				},
				format: 'depth24plus',
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
			});
			this.endDispatch();
		}

		this.ready = true;
	}

	startDispatch() {
		if (!this.device) return;
		if (this.catchGPUErrors) {
			this.device.pushErrorScope('validation');
			this.device.pushErrorScope('internal');
			this.device.pushErrorScope('out-of-memory');
		}
	}

	endDispatch() {
		if (!this.device) return;
		let handler = (e: GPUError | null) => {
			if (!e) return;
			let ignore =
				e.message.includes('[Invalid ShaderModule] is invalid.') ||
				e.message.includes('[Invalid BindGroup] is invalid.') ||
				e.message.includes('[Invalid ComputePipeline') ||
				e.message.includes('[Invalid RenderPipeline');
			if (ignore) return;
			(window as any).bubbleError(e.message);
			let stack = new Error();
			console.error(e, stack.stack);
		};
		if (this.catchGPUErrors) {
			this.device.popErrorScope().then(handler);
			this.device.popErrorScope().then(handler);
			this.device.popErrorScope().then(handler);
		}
	}

	drawImageCache: any | null;

	trace(id: string, data: any) {
		// console.log(id, data);
	}

	drawImage(image: HTMLCanvasElement, x: number, y: number, width: number, height: number): void {
		const { device } = this.getGPU();
		this.trace('drawImage', { image, x, y, width, height });

		if (!this.ready) {
			return;
		}

		this.startDispatch();

		// this.clear(true);

		let selfTexture = this.getTexture();

		// this.fill([1, 0, 0, 1], true);
		// this.fill([0, 0, 0, 0], true);
		device.queue.copyExternalImageToTexture(
			{ source: image },
			{ texture: selfTexture, premultipliedAlpha: true },
			{ width: image.width, height: image.height }
		);

		this.copyToCanvas();

		//printImage(image.toDataURL(), 10, () => console.log('Image read 0'));
		// printImage(this.canvas.toDataURL(), 10, () => console.log('canvas raed 0'));

		// let doCop = (msg: string) => {
		// 	let mapTex = this.device?.createBuffer({
		// 		size: image.width * image.height * 4 * 2,
		// 		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		// 	});
		// 	let encoder = this.device?.createCommandEncoder();

		// 	encoder.copyTextureToBuffer(
		// 		{ texture: selfTexture },
		// 		{ buffer: mapTex, bytesPerRow: image.width * 4 * 2 },
		// 		{ width: image.width, height: image.height }
		// 	);

		// 	let commandBuffer = encoder.finish();
		// 	device.queue.submit([commandBuffer]);

		// 	mapTex?.mapAsync(GPUMapMode.READ).then(() => {
		// 		let data = new Uint16Array(mapTex?.getMappedRange()!);

		// 		let buf = new Uint8Array(image.width * image.height * 4);
		// 		for (let i = 0; i < image.width * image.height * 4; i++) {
		// 			buf[i] = data[i] / 100;
		// 		}
		// 		let cnvs = document.createElement('canvas');
		// 		cnvs.width = image.width;
		// 		cnvs.height = image.height;

		// 		let ctx = cnvs.getContext('2d');

		// 		if (!ctx) return;

		// 		let imageData = ctx.createImageData(image.width, image.height);
		// 		imageData.data.set(buf);
		// 		ctx.putImageData(imageData, 0, 0);

		// 		printImage(cnvs.toDataURL(), 10, () => console.log('MAp read', msg));
		// 	});
		// };
		// setTimeout(() => doCop('5000'), 5000);
		// setTimeout(() => doCop('1000'), 1000);
		// setTimeout(() => doCop('100'), 100);
		// setTimeout(() => doCop('10'), 10);
		// setTimeout(() => doCop('1'), 1);
		// doCop('0');

		// setTimeout(() => {
		// 	printImage(image.toDataURL(), 10, () => console.log('Image read 5000'));
		// 	printImage(this.canvas.toDataURL(), 10, () => console.log('canvas raed 5000'));
		// }, 5000);
		// setTimeout(() => {
		// 	printImage(image.toDataURL(), 10, () => console.log('Image read 2500'));
		// 	printImage(this.canvas.toDataURL(), 10, () => console.log('canvas raed 2500'));
		// }, 2500);
		// setTimeout(() => {
		// 	printImage(image.toDataURL(), 10, () => console.log('Image read 10'));
		// 	printImage(this.canvas.toDataURL(), 10, () => console.log('canvas raed 10'));
		// }, 10);

		// device.queue.copyExternalImageToTexture(
		// 	{ source: image },
		// 	{ texture: this.ctx?.getCurrentTexture(), premultipliedAlpha: false },
		// 	{ width: image.width, height: image.height }
		// );

		// const data = new Uint8Array([1 * 255, 1 * 255, 0 * 255, 0 * 255]);
		// device.queue.copyExternalImageToTexture(
		// 	{ source: image },
		// 	{ texture: selfTexture, premultipliedAlpha: true },
		// 	{ width: image.width, height: image.height }
		// );
		// this.fill([1, 0, 0, 1], true);
		// device.queue.writeTexture(
		// 	{ texture: selfTexture },
		// 	data,
		// 	{},
		// 	{ width: selfTexture.width, height: selfTexture.height }
		// );
		// this.copyToCanvas();
		// device.queue.copyExternalImageToTexture(
		// 	{ source: image },
		// 	{ texture: selfTexture, premultipliedAlpha: true },
		// 	{ width: image.width, height: image.height }
		// );

		this.endDispatch();
	}

	genericBufferFlags() {
		return GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
	}

	copyBufferToBuffer<T>(from: buffer<T>, to: buffer<T>) {
		const { device } = this.getGPU();
		this.enqueueCommand((encoder) => {
			encoder.copyBufferToBuffer(
				this.getOrCreateBuffer(from, this.genericBufferFlags()),
				0,
				this.getOrCreateBuffer(to, this.genericBufferFlags()),
				0,
				from.elementCount * from.elementBytes
			);
		});
	}

	async downloadBuffer(buf: buffer<any>) {
		this.trace('downloadBuffer', { buffer: buf });
		const { device } = this.getGPU();

		let nativeBuffer = this.getOrCreateBuffer(buf, this.genericBufferFlags());

		this.startDispatch();
		let encoder = device.createCommandEncoder();

		let buffer = device.createBuffer({
			size: nativeBuffer.size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		});

		encoder.copyBufferToBuffer(nativeBuffer, 0, buffer, 0, nativeBuffer.size);

		let commandBuffer = encoder.finish();

		device.queue.submit([commandBuffer]);

		await buffer.mapAsync(GPUMapMode.READ);

		let arr = buffer.getMappedRange();

		if (!buf.structured) {
			// Simple 1-to-1 mapping

			if (buf.arrayBuffer) {
				let u8down = new Uint8Array(arr);
				let u8in = new Uint8Array(buf.arrayBuffer);
				u8in.set(u8down);
			} else {
				throw new Error('Buffer not found while downloading');
			}
		} else {
			if (buf.typeName == 'atomic<uint>') {
				// if (!buf.structArray) throw new Error('Buffer not found while downloading');
				let u32down = new Uint32Array(arr);

				buf.uintArray?.set(u32down);
			} else if (buf.typeName == 'atomic<int>') {
				// if (!buf.structArray) throw new Error('Buffer not found while downloading');
				let i32down = new Int32Array(arr);

				buf.intArray?.set(i32down);
			} else {
				// let structure = (window as any).__shadeup_structs[buf.typeName];
				// let elSize = getValueSize(structure.fields);
				// for (let i = 0; i < buf.elementCount; i++) {
				// 	buf.structArray[i] = this.readStructuredBuffer(structure.fields, arr, i * elSize);
				// }

				new Uint8Array(buf.arrayBuffer!).set(new Uint8Array(arr));
			}
		}

		buffer.destroy();

		this.endDispatch();
	}

	uploadBuffer(buf: buffer<any>) {
		const { device } = this.getGPU();
		this.trace('uploadBuffer', { buffer: buf });

		this.startDispatch();
		let nativeBuffer = this.getOrCreateBuffer(buf, this.genericBufferFlags());

		if (!buf.structured) {
			// Simple 1-to-1 mapping

			if (buf.arrayBuffer) {
				let u8in = new Uint8Array(buf.arrayBuffer);
				device.queue.writeBuffer(nativeBuffer, 0, u8in);
			} else {
				throw new Error('Buffer not found while downloading');
			}
		} else {
			if (buf.typeName == 'atomic<uint>') {
				device.queue.writeBuffer(nativeBuffer, 0, buf.arrayBuffer!);
			} else if (buf.typeName == 'atomic<int>') {
				let i32down = new Int32Array(buf.elementCount);

				device.queue.writeBuffer(nativeBuffer, 0, buf.arrayBuffer!);
			} else {
				// let structure = (window as any).__shadeup_structs[buf.typeName];
				// let size = getValueSize(structure.fields);
				// let arrayBuffer = new ArrayBuffer(buf.elementCount * size);
				// for (let i = 0; i < buf.elementCount; i++) {
				// 	this.writeStructuredBuffer(structure.fields, buf.structArray[i], arrayBuffer, i * size);
				// }

				device.queue.writeBuffer(nativeBuffer, 0, new Uint8Array(buf.arrayBuffer!));
			}
		}

		this.endDispatch();
	}

	async downloadImage() {
		const { device } = this.getGPU();

		this.flushStorage();

		this.startDispatch();

		let encoder = device.createCommandEncoder();
		let texture = this.getTexture();
		let stride = parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
		if (this.textureFormat == 'uint8') {
			stride = 4;
		}

		let bytesPerComponent = 2;
		if (this.textureFormat == 'uint8') {
			bytesPerComponent = 1;
		} else if (this.textureFormat.startsWith('float')) {
			bytesPerComponent = 4;
		} else if (this.textureFormat.startsWith('int')) {
			bytesPerComponent = 4;
		} else {
			bytesPerComponent = 4;
		}

		let alignment = 256;

		let bytesPerRow = texture.width * stride * bytesPerComponent;
		let neededAlignment = false;
		let alignmentPad = 0;
		if (bytesPerRow % alignment != 0) {
			let oldBytes = bytesPerRow;
			bytesPerRow += alignment - (bytesPerRow % alignment);

			alignmentPad = bytesPerRow - oldBytes;
			neededAlignment = true;
		}

		let buffer = device.createBuffer({
			size: bytesPerRow * texture.height,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		});

		encoder.copyTextureToBuffer({ texture: texture }, { buffer: buffer, bytesPerRow }, texture);

		let commandBuffer = encoder.finish();

		device.queue.submit([commandBuffer]);

		await buffer.mapAsync(GPUMapMode.READ);

		let arr: Uint32Array | Uint16Array | Int16Array | Int32Array | Float32Array | Uint8Array;
		let buf = new Uint8Array(buffer.getMappedRange());
		if (neededAlignment) {
			let oldBytes = bytesPerRow - alignmentPad;
			let newData = new Uint8Array(oldBytes * texture.height);

			for (let i = 0; i < texture.height; i++) {
				newData.set(new Uint8Array(buf.buffer, i * bytesPerRow, oldBytes), i * oldBytes);
			}

			buf = newData;
		}
		if (this.textureFormat == 'uint8') {
			arr = new Uint8Array(buf.buffer);
		} else if (this.textureFormat.startsWith('float')) {
			arr = new Float32Array(buf.buffer);
		} else if (this.textureFormat.startsWith('int')) {
			arr = new Uint32Array(buf.buffer);
		} else {
			arr = new Uint32Array(buf.buffer);
		}

		this.endDispatch();
		return arr;
	}

	uploadImage(
		data: Uint32Array | Uint16Array | Int16Array | Int32Array | Float32Array | Uint8Array
	): void {
		this.startDispatch();
		const { device } = this.getGPU();

		let encoder = device.createCommandEncoder();

		let texture = this.getTexture();

		let stride = parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
		if (this.textureFormat == 'uint8') {
			stride = 4;
		}

		let bytesPerComponent = 2;
		if (this.textureFormat == 'uint8') {
			bytesPerComponent = 1;
		} else if (this.textureFormat.startsWith('float')) {
			bytesPerComponent = 4;
		} else if (this.textureFormat.startsWith('int')) {
			bytesPerComponent = 4;
		} else {
			bytesPerComponent = 4;
		}

		let alignment = 256;

		let bytesPerRow = texture.width * stride * bytesPerComponent;

		if (bytesPerRow % alignment != 0) {
			let oldBytes = bytesPerRow;
			bytesPerRow += alignment - (bytesPerRow % alignment);

			let pad = bytesPerRow - oldBytes;

			// Add padding
			let newData = new Uint8Array(bytesPerRow * texture.height);

			for (let i = 0; i < texture.height; i++) {
				newData.set(new Uint8Array(data.buffer, i * oldBytes, oldBytes), i * bytesPerRow);
			}

			data = newData;
		}

		let buffer = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(buffer, 0, data);

		encoder.copyBufferToTexture(
			{ buffer: buffer, bytesPerRow },
			{ texture: texture },
			{ width: texture.width, height: texture.height }
		);

		let commandBuffer = encoder.finish();

		device.queue.submit([commandBuffer]);

		buffer.destroy();

		this.copyToCanvas();
		this.endDispatch();
	}

	getGPU(): {
		device: GPUDevice;
	} {
		if (!this.device) {
			throw new Error('WebGPU is not supported');
		}

		if (!this.ready) {
			throw new Error('WebGPU is not ready');
		}

		return {
			device: this.device
		};
	}

	setViewport(width: number, height: number) {
		if (!this.device) {
			return;
		}

		// Refresh depth tex
		this.startDispatch();
		this.depthTexture?.destroy();
		this.depthTexture = this.device.createTexture({
			size: {
				width: width,
				height: height
			},
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT
		});
		this.endDispatch();
	}

	translateFormatToGPUType(type: TextureComponentType): string {
		if (type == 'float4') {
			return 'vec4<f32>';
		}
		if (type == 'float3') {
			return 'vec3<f32>';
		}
		if (type == 'float2') {
			return 'vec2<f32>';
		}
		if (type == 'float') {
			return 'f32';
		}
		if (type == 'int4') {
			return 'vec4<i32>';
		}
		if (type == 'int3') {
			return 'vec3<i32>';
		}
		if (type == 'int2') {
			return 'vec2<i32>';
		}
		if (type == 'int') {
			return 'i32';
		}
		if (type == 'uint4') {
			return 'vec4<u32>';
		}
		if (type == 'uint3') {
			return 'vec3<u32>';
		}
		if (type == 'uint2') {
			return 'vec2<u32>';
		}
		if (type == 'uint') {
			return 'u32';
		}

		throw new Error('Invalid type');
	}

	getOrCreateShader(
		instance: ShadeupShaderInstance,
		type: ShaderType,
		config?: ShaderBindingOptions
	): GenericShader {
		const { device } = this.getGPU();

		let key: string = type;
		if (config) {
			if (config.attachments) {
				key += '|' + config.attachments.join(',');
			}
		}
		if (instance.parent.types[key]) {
			return instance.parent.types[key];
		} else {
			let base = instance.parent.code.webgpu;

			for (let param of Object.keys(instance.parent.arraySizes)) {
				base = base.replace(`%${param}_size%`, instance.parent.arraySizes[param]);
				// console.log(base, `%${param}_size%`);
			}

			if (
				instance.parent.params.webgpu.globals.length == 0 &&
				instance.parent.params.webgpu.locals.length == 0
			) {
				base = base.replace(`/*SHADEUP_UNIFORM_STRUCT_START*/`, '');
			}

			if (instance) {
				for (let key of Object.keys(instance.bindings)) {
					let value = instance.bindings[key];
					let isArrayTex = false;

					if (
						value instanceof ShadeupTexture2d ||
						(Array.isArray(value) && value.length > 0 && value[0] instanceof ShadeupTexture2d)
					) {
						if (Array.isArray(value)) {
							if (value.length == 0) {
								throw new Error('Invalid array length');
							} else {
								if (value[0] instanceof ShadeupTexture2d) {
									value = value[0];
									isArrayTex = true;
								}
							}
						}
						// Replace %WRITE_TYPE_X% with the correct type
						let name = `%WRITE_TYPE_${key}%`;
						let texFormat = (value.adapter as WebGPUAdapter).gpuTextureFormat;
						base = base.replace(name, texFormat);

						if (texFormat == 'depth24plus' || texFormat == 'depth32float') {
							base = base.replace(
								`var ${key}_texture: texture_2d${isArrayTex ? '_array' : ''}<${
									value.innerType.startsWith('float')
										? 'f32'
										: value.innerType.startsWith('int')
										? 'i32'
										: 'u32'
								}>`,
								`var ${key}_texture: texture_depth_2d${isArrayTex ? '_array' : ''}`
							);
							// .replace(
							// 	new RegExp(
							// 		`@group\\(%GROUP_INDEX%\\) @binding\\(\\d\\) var ${key}: sampler;`,
							// 		'g'
							// 	),
							// 	''
							// );

							// Replace texture loads
							let startIndexes = base.matchAll(new RegExp(`textureLoad\\(${key}_texture, `, 'g'));
							for (let match of startIndexes) {
								let balance = 0;
								let hitFirst = false;
								for (let i = match.index ?? 0; i < base.length; i++) {
									let count;
									if (base[i] == '(') {
										balance++;
										hitFirst = true;
									}
									if (base[i] == ')') {
										balance--;
									}
									if (balance == 0 && hitFirst) {
										base = base.substring(0, i + 1) + base.substring(i + 3, base.length);
										break;
									}
								}
							}

							// Replace samples
							startIndexes = base.matchAll(new RegExp(`textureSample\\(${key}_texture, `, 'g'));
							let replaces = [];
							for (let match of startIndexes) {
								let balance = 0;
								let hitFirst = false;
								for (let i = match.index ?? 0; i < base.length; i++) {
									let count;
									if (base[i] == '(') {
										balance++;
										hitFirst = true;
									}
									if (base[i] == ')') {
										balance--;
									}
									if (balance == 0 && hitFirst) {
										replaces.push(base.substring(match.index!, i));
										break;
									}
								}
							}

							for (let replace of replaces) {
								base = base.replace(replace, 'vec4<f32>(' + replace + ')');
							}
						}
					}
				}
			}

			if (type == 'compute') {
				base = base.replaceAll('%GROUP_INDEX%', '0');
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`
					
					struct _ComputeUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _compute_uniform_input: _ComputeUniformInput;

					`.replace(/\t\n/g, '')
				);
				base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `void`);
				base = base.replace(
					`/*__SHADEUP_TEMPLATE_INPUT*/`,
					`
				@builtin(workgroup_id) workgroup_id : vec3<u32>,
				@builtin(local_invocation_id) local_invocation_id : vec3<u32>,
				@builtin(global_invocation_id) global_invocation_id : vec3<u32>,
				@builtin(local_invocation_index) local_invocation_index: u32,
				@builtin(num_workgroups) num_workgroups: vec3<u32>
				`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`var _i_in: ShaderInput;
					_i_in.groupId = vec3<i32>(workgroup_id);
					_i_in.groupSize = vec3<i32>(num_workgroups);
					_i_in.localId = vec3<i32>(local_invocation_id);
					_i_in.globalId = vec3<i32>(global_invocation_id);
					`.replace(/\t\n/g, '')
				);
				base = base.replace('/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/', ``.replace(/\t\n/g, ''));
			} else if (type == 'vertex') {
				base = base.replaceAll('%GROUP_INDEX%', '1');
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeOutput}
					};
					struct _VertexUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _vertex_uniform_input: _VertexUniformInput;

					@vertex
					`.replace(/\t\n/g, '')
				);
				base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `_VertexShaderOutput`);
				base = base.replace(
					`/*__SHADEUP_TEMPLATE_INPUT*/`,
					`
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32,
				@location(0) position: vec3<f32>,
				@location(1) normal: vec3<f32>,
				@location(2) tangent: vec3<f32>,
				@location(3) bitangent: vec3<f32>,
				@location(4) uv: vec2<f32>,
				@location(5) color: vec4<f32>
				`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`var _i_out: _VertexShaderOutput;
					_i_out.position = vec4(position, 1.0);
					_i_out.normal = normal;
					_i_out.tangent = tangent;
					_i_out.bitangent = bitangent;
					_i_out.uv = uv;
					_i_out.color = color;
					_i_out.instanceIndex = instanceIndex;
					var _i_in: ShaderInput;
					_i_in.position = position;
					_i_in.normal = normal;
					_i_in.tangent = tangent;
					_i_in.bitangent = bitangent;
					_i_in.vertexIndex = i32(vertexIndex);
					_i_in.instanceIndex = i32(instanceIndex);
					_i_in.uv = uv;
					_i_in.color = color;
					_i_in.screen = vec2<f32>(0, 0);
					`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					`
					// _i_out.position = vec4<f32>(_i_out.position.x, _i_out.position.y, (1.0 + _i_out.position.z) / 2.0, _i_out.position.w);
					_i_out.worldPosition = position;
					return _i_out;`.replace(/\t\n/g, '')
				);
			} else if (type == 'vertex-indexed') {
				base = base.replaceAll('%GROUP_INDEX%', '1');
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeOutput}
					};
					struct _VertexUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _vertex_uniform_input: _VertexUniformInput;

					@vertex
					`.replace(/\t\n/g, '')
				);
				base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `_VertexShaderOutput`);
				base = base.replace(
					`/*__SHADEUP_TEMPLATE_INPUT*/`,
					`
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32,
				`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`var _i_out: _VertexShaderOutput;
					_i_out.position = vec4(0.0, 0.0, 0.0, 1.0);
					_i_out.normal = vec3(0.0, 0.0, 0.0);
					_i_out.tangent = vec3(0.0, 0.0, 0.0);
					_i_out.bitangent = vec3(0.0, 0.0, 0.0);
					_i_out.uv = vec2(0.0, 0.0);
					_i_out.color = vec4(0.0, 0.0, 0.0, 0.0);
					_i_out.instanceIndex = instanceIndex;
					var _i_in: ShaderInput;
					_i_in.position = vec3(0.0, 0.0, 0.0);
					_i_in.normal = vec3(0.0, 0.0, 0.0);
					_i_in.tangent = vec3(0.0, 0.0, 0.0);
					_i_in.bitangent = vec3(0.0, 0.0, 0.0);
					_i_in.vertexIndex = i32(vertexIndex);
					_i_in.instanceIndex = i32(instanceIndex);
					_i_in.uv = vec2(0.0, 0.0);
					_i_in.color = vec4(0.0, 0.0, 0.0, 0.0);
					_i_in.screen = vec2<f32>(0, 0);
					`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					`
					// _i_out.position = vec4<f32>(_i_out.position.x, _i_out.position.y, (1.0 + _i_out.position.z) / 2.0, _i_out.position.w);
					// _i_out.worldPosition = position;
					return _i_out;`.replace(/\t\n/g, '')
				);
			} else {
				let headerStr = '';
				if (config?.attachments) {
					let i = 0;
					headerStr += 'struct _ShaderFragmentOutput {\n';
					for (let attachment of config.attachments) {
						headerStr += `@location(${i}) attachment${i}: ${this.translateFormatToGPUType(
							attachment
						)},\n`;
						i++;
					}
					headerStr += '\n};';
				}
				base = base.replaceAll('%GROUP_INDEX%', '0');

				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeInput}
					};

					${headerStr}
					
					struct _FragmentUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _fragment_uniform_input: _FragmentUniformInput;

					@fragment
					`.replace(/\t\n/g, '')
				);
				base = base.replace(
					`/*__SHADEUP_TEMPLATE_OUTPUT*/`,
					config?.attachments ? `_ShaderFragmentOutput` : `@location(0) vec4<f32>`
				);
				base = base.replace(
					`/*__SHADEUP_TEMPLATE_INPUT*/`,
					`
				_frag_in: _VertexShaderOutput
				`.replace(/\t\n/g, '')
				);
				let writeCustoms = instance.parent.params.webgpu.attributeInput.split('@location').length;
				let extra = '';
				if (writeCustoms >= 2) {
					for (let i = 0; i < writeCustoms - 1; i++) {
						extra += `_i_in.custom${i} = _frag_in.custom${i};\n`;
					}
				}
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`var _i_out: ${config?.attachments ? '_ShaderFragmentOutput' : 'ShaderOutput'};
					var _i_in: ShaderInput;
					_i_in.position = _frag_in.worldPosition;
					_i_in.clipPosition = _frag_in.position;
					_i_in.normal = _frag_in.normal;
					_i_in.tangent = _frag_in.tangent;
					_i_in.bitangent = _frag_in.bitangent;
					_i_in.uv = _frag_in.uv;
					_i_in.color = _frag_in.color;
					_i_in.screen = vec2<f32>(_frag_in.position.x, _frag_in.position.y);
					_i_in.instanceIndex = i32(_frag_in.instanceIndex);
					${extra}
					`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					`return ${config?.attachments ? '_i_out' : '_i_out.color'};`.replace(/\t\n/g, '')
				);
			}

			this.startDispatch();

			let shader = device.createShaderModule({
				code: base
			});

			this.endDispatch();

			if (!shader) throw new Error('Failed to create shader');

			instance.version++;

			let gShader = new GenericShader(base, type);
			gShader.payload = shader;
			gShader.parent = instance.parent;

			instance.parent.types[key] = gShader;
			return gShader;
		}
	}

	createShader(code: ShaderCodeMapping, type: ShaderType) {
		const { device } = this.getGPU();

		if (type == 'compute') {
			let gComputeShader = new GenericShader(code.webgl, type);
			gComputeShader.payload = code.software;
			gComputeShader.parent = null;
			return gComputeShader;
		}

		this.startDispatch();

		let shader = device.createShaderModule({
			code: code.webgpu
		});

		// shader.getCompilationInfo().then((info) => {
		// 	console.log(info);
		// });

		this.endDispatch();

		if (!shader) {
			console.error('Failed to create shader');

			throw new Error('Failed to create shader');
		}

		let gShader = new GenericShader(code.webgpu, type);
		gShader.payload = shader;
		gShader.parent = null;

		return gShader;
	}

	clear(immediate = false, color: number | [number, number, number, number] | 'auto' = 'auto') {
		this.enqueueCommand((encoder) => {
			const { device } = this.getGPU();
			if (!this.depthTexture) return;

			const textureView = this.getTexture().createView();

			if (this.gpuTextureFormat == 'depth24plus' || this.gpuTextureFormat == 'depth32float') {
				const clearPassDesc: GPURenderPassDescriptor = {
					colorAttachments: [],
					depthStencilAttachment: {
						view: this.getTexture().createView(),
						depthClearValue: typeof color === 'number' ? color : 1.0,
						depthLoadOp: 'clear',
						depthStoreOp: 'store'
					}
				};

				const passEncoder = encoder.beginRenderPass(clearPassDesc);
				passEncoder.end();
			} else {
				const clearPassDesc: GPURenderPassDescriptor = {
					colorAttachments: [
						{
							view: textureView,
							clearValue: Array.isArray(color)
								? { r: color[0], g: color[1], b: color[2], a: color[3] }
								: { r: 0, g: 0, b: 0, a: 0 },

							storeOp: 'store',
							loadOp: 'clear'
						}
					],
					depthStencilAttachment: {
						view: this.depthTexture.createView(),
						depthClearValue: 1.0,
						depthLoadOp: 'clear',
						depthStoreOp: 'store'
					}
				};

				const passEncoder = encoder.beginRenderPass(clearPassDesc);
				passEncoder.end();
			}
		}, immediate);
	}

	fill(color: [number, number, number, number], immediate = false) {
		this.enqueueCommand((encoder) => {
			const { device } = this.getGPU();
			if (!this.depthTexture) return;

			const textureView = this.getTexture().createView({
				format: this.gpuTextureFormat
			});
			const clearPassDesc: GPURenderPassDescriptor = {
				colorAttachments: [
					{
						view: textureView,
						clearValue: { r: color[0], g: color[1], b: color[2], a: color[3] },

						storeOp: 'store',
						loadOp: 'clear'
					}
				],
				depthStencilAttachment: {
					view: this.depthTexture.createView(),
					depthClearValue: 1.0,
					depthLoadOp: 'clear',
					depthStoreOp: 'store'
				}
			};

			const passEncoder = encoder.beginRenderPass(clearPassDesc);
			passEncoder.end();
		}, immediate);
	}

	unbindTexture(texture: ShadeupTexture2d) {}

	getOrCreateMeshData(mesh: Mesh) {
		const { device } = this.getGPU();
		if (mesh.symbol == null) mesh.symbol = Symbol();
		if ((mesh as any).$__gpuMeshData) {
			return (mesh as any).$__gpuMeshData as WebGPUMeshData;
		} else {
			let meshVertices = mesh.getVertices();
			let meshIndices = mesh.getTriangles();
			let meshNormals = mesh.getNormals();
			let meshTangents = mesh.getTangents();
			let meshBitangents = mesh.getBitangents();
			let meshUVs = mesh.getUVs();
			let meshColors = mesh.getColors();

			let vertexCount = meshVertices.length;

			let vertexData = new Float32Array(vertexCount * (3 + 3 + 3 + 3 + 2 + 4));

			let indexData = new Uint32Array(meshIndices.length);
			let offset = 0;
			for (let i = 0; i < vertexCount; i++) {
				vertexData[offset++] = meshVertices[i][0];
				vertexData[offset++] = meshVertices[i][1];
				vertexData[offset++] = meshVertices[i][2];

				if (meshNormals[i]) {
					vertexData[offset++] = meshNormals[i][0];
					vertexData[offset++] = meshNormals[i][1];
					vertexData[offset++] = meshNormals[i][2];
				} else {
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
				}
				if (meshTangents[i]) {
					vertexData[offset++] = meshTangents[i][0];
					vertexData[offset++] = meshTangents[i][1];
					vertexData[offset++] = meshTangents[i][2];
				} else {
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
				}

				if (meshBitangents[i]) {
					vertexData[offset++] = meshBitangents[i][0];
					vertexData[offset++] = meshBitangents[i][1];
					vertexData[offset++] = meshBitangents[i][2];
				} else {
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
				}

				if (meshUVs[i]) {
					vertexData[offset++] = meshUVs[i][0];
					vertexData[offset++] = meshUVs[i][1];
				} else {
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
				}

				if (meshColors[i]) {
					vertexData[offset++] = meshColors[i][0];
					vertexData[offset++] = meshColors[i][1];
					vertexData[offset++] = meshColors[i][2];
					vertexData[offset++] = meshColors[i][3];
				} else {
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
					vertexData[offset++] = 0;
				}
			}

			for (let i = 0; i < meshIndices.length; i++) {
				indexData[i] = meshIndices[i];
			}

			let vertexBuffer = device.createBuffer({
				size: vertexData.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});

			let indexBuffer = device.createBuffer({
				size: indexData.byteLength,
				usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
			});

			device.queue.writeBuffer(vertexBuffer, 0, vertexData);
			device.queue.writeBuffer(indexBuffer, 0, indexData);

			let meshData = new WebGPUMeshData(
				mesh,
				vertexBuffer,
				indexBuffer,
				vertexCount,
				meshIndices.length
			);

			(mesh as any).$__gpuMeshData = meshData;

			return meshData;
		}
	}

	flushStorage() {
		const { device } = this.getGPU();
		this.startDispatch();
		if (this.storageDirty && this.texture) {
			let encoder = device.createCommandEncoder();

			encoder.copyTextureToTexture(
				{ texture: this.getStorageTexture() },
				{ texture: this.getTexture() },
				{ width: this.texture.width, height: this.texture.height }
			);

			device.queue.submit([encoder.finish()]);
			this.storageDirty = false;
		}
		this.endDispatch();
	}

	buildUniformKey(generatedUniforms: GeneratedUniforms): (number | string)[] {
		let key = [];

		const KEY_TYPES = {
			BINDING: 1241253932,
			MARK: 153925923059,
			SAMPLER: 1241253932,
			TEXTURE: 153925923059,
			BUFFER: 1241253932
		};

		key.push(KEY_TYPES.BINDING, 0, KEY_TYPES.MARK);

		if (generatedUniforms.size > 0) {
			key.push(KEY_TYPES.BINDING, 1, KEY_TYPES.MARK);
		}

		if (generatedUniforms.special)
			for (let s of generatedUniforms.special) {
				if (s.type == 'sampler2D') {
					let gpuFormat = (s.value?.texture.adapter as WebGPUAdapter).gpuTextureFormat;
					let texInner = s.value?.texture?.innerType ?? 'float4';
					let filterMode = texInner == 'uint8' ? 'filtering' : 'non-filtering';

					if (s.access == 'sample_write') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 2, KEY_TYPES.MARK);
					} else if (s.access == 'write') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 1, gpuFormat, KEY_TYPES.MARK);
					} else if (s.access == 'sample' || s.access == 'read') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
					}
				} else if (s.type == 'sampler2DArray') {
					if (!s.value?.textures[0]) continue;
					let firstTexture = s.value?.textures[0];
					let gpuFormat = (firstTexture.adapter as WebGPUAdapter).gpuTextureFormat;
					let texInner = firstTexture.innerType ?? 'float4';
					let filterMode = texInner == 'uint8' ? 'filtering' : 'non-filtering';

					if (s.access == 'sample_write') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 2, KEY_TYPES.MARK);
					} else if (s.access == 'write') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 1, gpuFormat, KEY_TYPES.MARK);
					} else if (s.access == 'sample' || s.access == 'read') {
						key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
						key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
					}
					key.push('len', s.value.textures.length);
				} else if (s.type == 'array') {
					key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 3623, KEY_TYPES.MARK);
				} else if (s.type == 'atomic') {
					key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 124, KEY_TYPES.MARK);
				} else if (s.type == 'buffer') {
					key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 111, s.access, KEY_TYPES.MARK);
				}
			}

		return key;
	}

	bindGroupLayoutCounter = 0;

	buildUniformsForPipeline(
		shader: GenericShader & {
			webgpuUniformCache?: LRUCache<string, ShaderUniformCachePayload>;
		},
		generatedUniforms: GeneratedUniforms,
		baseUniformBuffer: GPUBuffer,
		stage: number
	) {
		// We need to cache bind group layouts based on the uniforms passed in
		// Prepass will build a lightweight key for the uniforms passed in
		// If the key is the same, we can reuse the bind group layout
		// Otherwise, we need to rebuild the bind group layout and pipeline

		// We also need to cache the uniform buffer if possible
		// We can build a create a buffer locally on the cpu and compare it to the previous buffer
		// If the buffer is the same, we can reuse the buffer
		// Otherwise, we need to rebuild the buffer and bind group layout and pipeline

		let key = this.buildUniformKey(generatedUniforms).join('|');

		const { device } = this.getGPU();

		let commands: PipelinePreDispatchCommands = [];
		if (generatedUniforms.special) {
			for (let s of generatedUniforms.special) {
				if (s.type == 'sampler2D') {
					commands.push((encoder) => {
						if (s.value && 'texture' in s.value) {
							if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
								if (s.value.texture.adapter.storageDirty) {
									this.trace('copyWritableTextureToReadable', { texture: s.value.texture });
									encoder.copyTextureToTexture(
										{ texture: s.value.texture.adapter.getStorageTexture() },
										{ texture: s.value.texture.adapter.getTexture() },
										{ width: s.value.texture.size[0], height: s.value.texture.size[1] }
									);
									s.value.texture.adapter.storageDirty = false;
									s.value.texture.cpuReadDirty = true;
								}
							}
							s.value?.texture.flush(false);
						}
					});
					let texInner = s.value?.texture?.innerType ?? 'float4';
					if (s.access == 'sample_write') {
						// No op
					} else if (s.access == 'write') {
						if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
							s.value.texture.adapter.pendingWrites++;
						}
						commands.push((encoder) => {
							if (s.value && 'texture' in s.value) {
								if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
									this.trace('markWritableTextureDirty', { texture: s.value.texture });
									s.value.texture.adapter.storageDirty = true;
									s.value.texture.adapter.pendingWrites--;
								}
							}
						});
					} else if (s.access == 'sample' || s.access == 'read') {
						// No op
					}
				} else if (s.type == 'sampler2DArray') {
					let needsNewTexture = false;
					if (s.value && 'textures' in s.value) {
						if (!s.value?.textures.$arrTexture) {
							needsNewTexture = true;
						} else {
							if (
								s.value.textures[0].adapter.getTexture().usage != s.value.textures.$arrTexture.usage
							) {
								needsNewTexture = true;
							}
							if (
								s.value.textures[0].adapter.getTexture().format !=
								s.value.textures.$arrTexture.format
							) {
								needsNewTexture = true;
							}
							if (
								s.value.textures[0].adapter.getTexture().width != s.value.textures.$arrTexture.width
							) {
								needsNewTexture = true;
							}
							if (
								s.value.textures[0].adapter.getTexture().height !=
								s.value.textures.$arrTexture.height
							) {
								needsNewTexture = true;
							}
							if (s.value.textures.length != s.value.textures.$arrTexture.depthOrArrayLayers) {
								needsNewTexture = true;
							}
						}
						if (needsNewTexture) {
							if (s.value.textures.$arrTexture) {
								let oldTex = s.value.textures.$arrTexture;

								this.enqueueCleanupCommand(() => {
									this.trace('destroyMissizedArrayTexture', { texture: oldTex });
									oldTex.destroy();
								});
							}

							s.value.textures.$arrTexture = device.createTexture({
								size: [
									s.value.textures[0].size[0],
									s.value.textures[0].size[1],
									s.value.textures.length
								],
								format: (s.value.textures[0].adapter as WebGPUAdapter).gpuTextureFormat,
								usage: (s.value.textures[0].adapter as WebGPUAdapter).getTexture().usage
							});
						}
					}

					commands.push((encoder) => {
						let arrDirty = false;

						let texVersions: number[] = [];

						if (s.value && 'textures' in s.value) {
							if (s.value.textures.$arrTexture) {
								if (s.value.textures.$arrTexture.$versions) {
									texVersions = s.value.textures.$arrTexture.$versions;
								}
							}

							if (texVersions.length != s.value.textures.length) {
								texVersions = [];
								for (let i = 0; i < s.value.textures.length; i++) {
									texVersions.push(-1);
								}
							}
							for (let [i, texture] of s.value.textures.entries()) {
								if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
									if (texture.adapter.storageDirty) {
										arrDirty = true;
										encoder.copyTextureToTexture(
											{ texture: texture.adapter.getStorageTexture() },
											{ texture: texture.adapter.getTexture() },
											{ width: texture.size[0], height: texture.size[1] }
										);
										texture.adapter.storageDirty = false;
										texture.cpuReadDirty = true;
									}
									if (texture.version != texVersions[i]) {
										texVersions[i] = texture.version;
										arrDirty = true;
									}
								}
								texture.flush(false);
							}

							if (arrDirty) {
								s.value.textures.$arrTexture.$versions = texVersions;
								this.trace('copyToArrayTexture', { texture: s.value.textures.$arrTexture });

								for (let [i, texture] of s.value.textures.entries()) {
									encoder.copyTextureToTexture(
										{
											texture: (texture.adapter as WebGPUAdapter).getTexture()
										},
										{
											texture: s.value.textures.$arrTexture,
											origin: [0, 0, i]
										},
										{
											width: texture.size[0],
											height: texture.size[1],
											depthOrArrayLayers: 1
										}
									);
								}
							}
						}
					});
					if (s.value && 'textures' in s.value) {
						for (let texture of s.value.textures) {
							let texInner = texture.innerType ?? 'float4';
							if (s.access == 'sample_write') {
								// No op
							} else if (s.access == 'write') {
								if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
									texture.adapter.pendingWrites++;
								}
								commands.push((encoder) => {
									if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
										this.trace('markWritableTextureDirty', { texture: texture });
										texture.adapter.storageDirty = true;
										texture.adapter.pendingWrites--;
									}
								});
							} else if (s.access == 'sample' || s.access == 'read') {
								// No op
							}
						}
					}
				} else if (s.type == 'array') {
					// No op
				} else if (s.type == 'atomic') {
					// No op
				} else if (s.type == 'buffer') {
					if (s.value && s.access == 'write') {
						s.value.pendingWrites++;
					}
					commands.push((encoder) => {
						if (s.value) {
							let sv = s.value as any;
							if (sv.cpuWriteDirty) {
								this.trace('uploadCPUDirtyBuffer', { buffer: s.value });
								sv.upload();
							}
							if ((s as any).access == 'write') {
								this.trace('markBufferDirty', { buffer: s.value });
								sv.cpuReadDirty = true;
								sv.pendingWrites--;
							}
						}
					});
					// No op
				}
			}
		}

		let bindGroupLayout: GPUBindGroupLayout | null = null;
		let bindGroup: GPUBindGroup | null = null;
		if (!shader.webgpuUniformCache) {
			shader.webgpuUniformCache = new LRUCache({
				...lruUniformOptions,
				dispose(value, key) {
					value.uniformBuffer.destroy();
				}
			});
		}

		let cache: ShaderUniformCachePayload | undefined = undefined;

		if (shader.webgpuUniformCache) {
			cache = shader.webgpuUniformCache.get(key);
			let matches = true;
			if (!cache) {
				matches = false;
			} else {
				// for (let i = 0; i < key.length; i++) {
				// 	if (shader.webgpuUniformCache.key[i] != key[i]) {
				// 		matches = false;
				// 		break;
				// 	}
				// }
			}

			if (matches && cache) {
				bindGroupLayout = cache.bindGroupLayout;
				bindGroup = cache.bindGroup;
			}
		}

		if (!bindGroupLayout) {
			this.startDispatch();
			bindGroupLayout = device.createBindGroupLayout({
				entries: [
					{
						binding: 0,
						visibility: stage,
						buffer: {
							minBindingSize: 0
						}
					},
					...(generatedUniforms.size > 0
						? [
								{
									binding: 1,
									visibility: stage,
									buffer: {
										minBindingSize: 0
									}
								}
						  ]
						: []),
					...(generatedUniforms.special
						.map((s) => {
							if (s.type == 'sampler2D') {
								let sampleType = (t: string): GPUTextureSampleType => {
									let gpuFormat = (s.value?.texture.adapter as WebGPUAdapter).gpuTextureFormat;
									if (gpuFormat == 'depth24plus' || gpuFormat == 'depth32float') {
										return 'depth';
									}
									if (t == 'uint8') {
										return 'float';
									}
									if (t.startsWith('int')) {
										return 'sint';
									} else if (t.startsWith('uint')) {
										return 'uint';
									} else if (t.startsWith('float')) {
										return 'unfilterable-float';
									}

									return 'unfilterable-float';
								};
								let texInner = s.value?.texture?.innerType ?? 'float4';
								let filterMode = texInner == 'uint8' ? 'filtering' : 'non-filtering';
								let sampleTypeGPU = sampleType(s.value?.texture?.innerType ?? 'float4');

								if (s.access == 'sample_write') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleType(texInner),
												viewDimension: '2d',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 1,
											visibility: stage,
											sampler: {
												type: filterMode
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 2,
											visibility: stage,
											storageTexture: {
												format: (s.value?.texture.adapter as WebGPUAdapter).gpuTextureFormat,
												access: 'write-only',
												viewDimension: '2d'
											}
										} as GPUBindGroupLayoutEntry
									];
								} else if (s.access == 'write') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleTypeGPU,
												viewDimension: '2d',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 1,
											visibility: stage,
											storageTexture: {
												format: (s.value?.texture.adapter as WebGPUAdapter).gpuTextureFormat,
												access: 'write-only',
												viewDimension: '2d'
											}
										} as GPUBindGroupLayoutEntry
									];
								} else if (s.access == 'sample' || s.access == 'read') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleTypeGPU,
												viewDimension: '2d',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,

										{
											binding: s.index + 1,
											visibility: stage,
											sampler: {
												type: filterMode
											}
										} as GPUBindGroupLayoutEntry
									];
								}
							} else if (s.type == 'sampler2DArray') {
								if (!s.value?.textures[0]) return [];
								let firstTexture: ShadeupTexture2d = s.value?.textures[0]!;
								let sampleType = (t: string): GPUTextureSampleType => {
									let gpuFormat = (firstTexture.adapter as WebGPUAdapter).gpuTextureFormat;
									if (gpuFormat == 'depth24plus' || gpuFormat == 'depth32float') {
										return 'depth';
									}
									if (t == 'uint8') {
										return 'float';
									}
									if (t.startsWith('int')) {
										return 'sint';
									} else if (t.startsWith('uint')) {
										return 'uint';
									} else if (t.startsWith('float')) {
										return 'unfilterable-float';
									}

									return 'unfilterable-float';
								};
								let texInner = firstTexture.innerType ?? 'float4';
								let filterMode = texInner == 'uint8' ? 'filtering' : 'non-filtering';
								let sampleTypeGPU = sampleType(firstTexture.innerType ?? 'float4');

								if (s.access == 'sample_write') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleType(texInner),
												viewDimension: '2d-array',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 1,
											visibility: stage,
											sampler: {
												type: filterMode
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 2,
											visibility: stage,
											storageTexture: {
												format: (firstTexture.adapter as WebGPUAdapter).gpuTextureFormat,
												access: 'write-only',
												viewDimension: '2d-array'
											}
										} as GPUBindGroupLayoutEntry
									];
								} else if (s.access == 'write') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleTypeGPU,
												viewDimension: '2d-array',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,
										{
											binding: s.index + 1,
											visibility: stage,
											storageTexture: {
												format: (firstTexture.adapter as WebGPUAdapter).gpuTextureFormat,
												access: 'write-only',
												viewDimension: '2d-array'
											}
										} as GPUBindGroupLayoutEntry
									];
								} else if (s.access == 'sample' || s.access == 'read') {
									return [
										{
											binding: s.index,
											visibility: stage,
											texture: {
												sampleType: sampleTypeGPU,
												viewDimension: '2d-array',
												multisampled: false
											}
										} as GPUBindGroupLayoutEntry,

										{
											binding: s.index + 1,
											visibility: stage,
											sampler: {
												type: filterMode
											}
										} as GPUBindGroupLayoutEntry
									];
								}
							} else if (s.type == 'array') {
								return [
									{
										binding: s.index,
										visibility: stage,
										buffer: { type: 'read-only-storage' }
									}
								];
							} else if (s.type == 'atomic') {
								return [
									{
										binding: s.index,
										visibility: stage,
										buffer: { type: 'storage' }
									}
								];
							} else if (s.type == 'buffer') {
								return [
									{
										binding: s.index,
										visibility: stage,
										buffer: { type: s.access == 'read' ? 'read-only-storage' : 'storage' }
									}
								];
							}
						})
						.flat() as any)
				]
			});

			(bindGroupLayout as any).$__gpuKey = this.bindGroupLayoutCounter++;
			this.endDispatch();
		}

		let outUniformBuffer = cache?.uniformBuffer;
		let outSpecialBuffers = cache?.specialBuffers;

		if (cache) {
			if (cache.cachedUniforms) {
				let matches = generatedUniforms.data.byteLength == cache.cachedUniforms.byteLength;
				let uintView = new Uint8Array(generatedUniforms.data);
				let uintView2 = new Uint8Array(cache.cachedUniforms);

				if (matches) {
					for (let i = 0; i < uintView.length; i++) {
						if (uintView[i] != uintView2[i]) {
							matches = false;
							break;
						}
					}
				}
				if (!matches) {
					if (outUniformBuffer) {
						// Clean it up after the frame
						let oldBuffer = outUniformBuffer;
						this.enqueueCleanupCommand(() => {
							oldBuffer.destroy();
						});
					}
					bindGroup = null;
					outUniformBuffer = undefined;
				}
			}
		}

		let specialsKey: (number | string | Symbol)[] = [];

		let alwaysDirty = false;

		for (let special of generatedUniforms.special) {
			if (special.type == 'sampler2D') {
				if (!special.value || !('texture' in special.value)) continue;

				let tex = special.value.texture;

				if (tex.image) {
					let texture;
					if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
						let texCtx = tex.adapter.getTexture();

						texture = texCtx;

						if (!texture) continue;

						specialsKey.push(5623462, special.index, tex.symbol, tex.innerType, special.access);
					}
				} else {
					return;
				}
			} else if (special.type == 'sampler2DArray') {
				if (!special.value || !('textures' in special.value)) continue;

				let tex = special.value.textures[0];
				if (tex) {
					if (tex.image) {
						let texture;
						if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
							let texCtx = tex.adapter.getTexture();

							texture = texCtx;

							if (!texture) continue;

							specialsKey.push(
								5653223462,
								special.index,
								tex.symbol,
								tex.innerType,
								special.access
							);
						}
					}
				} else {
					return;
				}
			} else if (special.type == 'array' && special.value) {
				specialsKey.push(5523462, special.index);
				alwaysDirty = true;
			} else if (special.type == 'buffer' && special.value) {
				specialsKey.push(1253462, special.index, special.access, special.value.symbol);
			} else if (special.type == 'atomic' && special.value) {
				specialsKey.push(125342, special.index);
				alwaysDirty = true;
			} else {
				throw new Error(`Unknown special type ${special.type}`);
			}
		}

		let specialsDirty = false;

		if (cache) {
			if (cache.specialsKey.length != specialsKey.length) {
				specialsDirty = true;
			} else {
				for (let i = 0; i < specialsKey.length; i++) {
					if (cache.specialsKey[i] != specialsKey[i]) {
						specialsDirty = true;
						break;
					}
				}
			}
		} else {
			specialsDirty = true;
		}

		let specialEntries: GPUBindGroupEntry[] | undefined = undefined;

		if (cache) {
			specialEntries = cache.specialEntries;
		}

		if (alwaysDirty || specialsDirty) {
			outSpecialBuffers = undefined;
			specialEntries = undefined;
		}

		if (!bindGroup || !outUniformBuffer || !outSpecialBuffers || !specialEntries) {
			let outEntries: GPUBindGroupEntry[] = [
				{ binding: 0, resource: { buffer: baseUniformBuffer } }
			];

			if (!outSpecialBuffers || !specialEntries) {
				outSpecialBuffers = [];
				specialEntries = [];
				for (let special of generatedUniforms.special) {
					if (special.type == 'sampler2D') {
						// TODO: Support samplers
						// fragmentEntries.push({
						// 	binding: special.index,
						// 	resource: special.value
						// });
						if (!special.value || !('texture' in special.value)) continue;

						let tex = special.value.texture;

						if (tex.image) {
							let texture;
							if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
								let texCtx = tex.adapter.getTexture();

								texture = texCtx;

								if (!texture) continue;

								let filterable = tex.innerType == 'uint8';
								if (special.access == 'sample_write') {
									const sampler = device.createSampler(
										filterable
											? {
													magFilter: 'linear',
													minFilter: 'linear'
											  }
											: {}
									);

									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat
										})
									});

									specialEntries.push({
										binding: special.index + 1,
										resource: sampler
									});

									specialEntries.push({
										binding: special.index + 2,

										resource: tex.adapter.getStorageTexture().createView()
									});
								} else if (special.access == 'write') {
									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat
										})
									});

									specialEntries.push({
										binding: special.index + 1,

										resource: tex.adapter.getStorageTexture().createView()
									});
								} else if (special.access == 'read' || special.access == 'sample') {
									const sampler = device.createSampler(
										filterable
											? {
													magFilter: 'linear',
													minFilter: 'linear'
											  }
											: {}
									);

									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat
										})
									});

									specialEntries.push({
										binding: special.index + 1,
										resource: sampler
									});
								}
							}
						} else {
							return;
						}
					} else if (special.type == 'sampler2DArray') {
						// TODO: Support samplers
						// fragmentEntries.push({
						// 	binding: special.index,
						// 	resource: special.value
						// });
						if (!special.value || !('textures' in special.value)) continue;

						if (special.value.textures.$arrTexture) {
							if (special.value.textures.$arrTexture instanceof GPUTexture) {
								let tex = special.value.textures[0];
								if (!tex) return;
								let texture: GPUTexture = special.value.textures.$arrTexture as any;

								let filterable = tex.innerType == 'uint8';
								if (special.access == 'sample_write') {
									const sampler = device.createSampler(
										filterable
											? {
													magFilter: 'linear',
													minFilter: 'linear'
											  }
											: {}
									);

									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat
										})
									});

									specialEntries.push({
										binding: special.index + 1,
										resource: sampler
									});

									specialEntries.push({
										binding: special.index + 2,

										resource: tex.adapter.getStorageTexture().createView()
									});
									throw new Error('Writing to texture arrays is not supported yet');
								} else if (special.access == 'write') {
									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat
										})
									});

									specialEntries.push({
										binding: special.index + 1,

										resource: tex.adapter.getStorageTexture().createView()
									});
									throw new Error('Writing to texture arrays is not supported yet');
								} else if (special.access == 'read' || special.access == 'sample') {
									const sampler = device.createSampler(
										filterable
											? {
													magFilter: 'linear',
													minFilter: 'linear'
											  }
											: {}
									);

									specialEntries.push({
										binding: special.index,

										resource: texture.createView({
											format: tex.adapter.gpuTextureFormat,
											arrayLayerCount: special.value.textures.length,
											baseArrayLayer: 0,
											dimension: '2d-array'
										})
									});

									specialEntries.push({
										binding: special.index + 1,
										resource: sampler
									});
								}
							}
						}
					} else if (special.type == 'array' && special.value) {
						let buffer = device.createBuffer({
							size: special.value.size,
							usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
						});
						outSpecialBuffers.push(buffer);
						specialEntries.push({
							binding: special.index,

							resource: { buffer }
						});
					} else if (special.type == 'buffer' && special.value) {
						let buf = this.getOrCreateBuffer(special.value, this.genericBufferFlags());

						outSpecialBuffers.push(buf);
						specialEntries.push({
							binding: special.index,

							resource: { buffer: buf }
						});
					} else if (special.type == 'atomic' && special.value) {
						let buf = device.createBuffer({
							size: 4,
							usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
						});

						outSpecialBuffers.push(buf);
						specialEntries.push({
							binding: special.index,

							resource: {
								buffer: buf
							}
						});
					} else {
						throw new Error(`Unknown special type ${special.type}`);
					}
				}
			}

			let needsUniformWrite = false;
			if (!outUniformBuffer) {
				outUniformBuffer = device.createBuffer({
					size: generatedUniforms.size,
					usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
				});
				needsUniformWrite = true;
			}

			if (generatedUniforms.size > 0) {
				outEntries.push({ binding: 1, resource: { buffer: outUniformBuffer } });

				if (needsUniformWrite)
					device.queue.writeBuffer(outUniformBuffer, 0, generatedUniforms.data);
			}

			for (let i = 0; i < specialEntries.length; i++) {
				outEntries.push(specialEntries[i]);
			}

			let bufCounter = 0;
			for (let i = 0; i < generatedUniforms.special.length; i++) {
				let special = generatedUniforms.special[i];
				if (special.type == 'array' && special.value) {
					device.queue.writeBuffer(outSpecialBuffers[bufCounter++], 0, special.value.buffer);
				}
			}

			bindGroup = device.createBindGroup({
				layout: bindGroupLayout,
				entries: outEntries
			});
		}

		if (cache) {
			cache.key = key;
			cache.bindGroupLayout = bindGroupLayout;
			cache.bindGroup = bindGroup;
			cache.uniformBuffer = outUniformBuffer;
			cache.specialBuffers = outSpecialBuffers;
			cache.cachedUniforms = generatedUniforms.data;

			cache.specialsKey = specialsKey;
			cache.specialEntries = specialEntries;
		} else {
			shader.webgpuUniformCache.set(key, {
				key,
				bindGroupLayout,
				bindGroup,
				uniformBuffer: outUniformBuffer,
				specialBuffers: outSpecialBuffers,
				cachedUniforms: generatedUniforms.data,
				specialsKey,
				specialEntries
			});
		}

		return {
			bindGroupLayout,
			bindGroup,
			uniformBuffer: outUniformBuffer,
			specialBuffers: outSpecialBuffers,
			commands
		};
	}

	writeStructuredBuffer(
		structure: UniformValueType,
		raw: any,
		buffer: ArrayBuffer,
		offset: number = 0
	) {
		let rootObj: { [key: string]: any } = {
			val: raw
		};
		let queue: [UniformKeyValuePair, any, number | null][] = [[['val', structure], rootObj, null]];

		writeBufferStructure(queue, rootObj, buffer, offset);
	}

	readStructuredBuffer(structure: UniformValueType, buffer: ArrayBuffer, offset: number = 0): any {
		if (structure.type == 'array') {
			let arr = [];
			if ('staticSize' in structure && structure.staticSize != null) {
				let elSize = getValueSize(structure.element);
				for (let i = 0; i < structure.staticSize; i++) {
					arr.push(this.readStructuredBuffer(structure.element, buffer, offset));
					offset += elSize / 4;
				}
				return arr;
			} else {
				throw new Error(`Unable to read dynamic array`);
			}
		} else if (structure.type == 'primitive') {
			let uview = new Uint32Array(buffer);
			let iview = new Int32Array(buffer);
			let fview = new Float32Array(buffer);
			if (structure.name == 'uint4') {
				return [uview[offset], uview[offset + 1], uview[offset + 2], uview[offset + 3]];
			} else if (structure.name == 'int4') {
				return [iview[offset], iview[offset + 1], iview[offset + 2], iview[offset + 3]];
			} else if (structure.name == 'float4') {
				return [fview[offset], fview[offset + 1], fview[offset + 2], fview[offset + 3]];
			} else if (structure.name == 'uint3') {
				return [uview[offset], uview[offset + 1], uview[offset + 2]];
			} else if (structure.name == 'int3') {
				return [iview[offset], iview[offset + 1], iview[offset + 2]];
			} else if (structure.name == 'float3') {
				return [fview[offset], fview[offset + 1], fview[offset + 2]];
			} else if (structure.name == 'uint2') {
				return [uview[offset], uview[offset + 1]];
			} else if (structure.name == 'int2') {
				return [iview[offset], iview[offset + 1]];
			} else if (structure.name == 'float2') {
				return [fview[offset], fview[offset + 1]];
			} else if (structure.name == 'uint') {
				return uview[offset];
			} else if (structure.name == 'int') {
				return iview[offset];
			} else if (structure.name == 'float') {
				return fview[offset];
			} else if (structure.name == 'bool') {
				return uview[offset] == 1;
			} else if (structure.name == 'float2x2') {
				return (window as any).applyMatrix2x2Methods([
					[fview[offset], fview[offset + 1]],
					[fview[offset + 2], fview[offset + 3]]
				]);
			} else if (structure.name == 'float3x3') {
				return (window as any).applyMatrix3x3Methods([
					[fview[offset], fview[offset + 1], fview[offset + 2]],
					[fview[offset + 3], fview[offset + 4], fview[offset + 5]],
					[fview[offset + 6], fview[offset + 7], fview[offset + 8]]
				]);
			} else if (structure.name == 'float4x4') {
				return (window as any).applyMatrix4x4Methods([
					[fview[offset], fview[offset + 1], fview[offset + 2], fview[offset + 3]],
					[fview[offset + 4], fview[offset + 5], fview[offset + 6], fview[offset + 7]],
					[fview[offset + 8], fview[offset + 9], fview[offset + 10], fview[offset + 11]],
					[fview[offset + 12], fview[offset + 13], fview[offset + 14], fview[offset + 15]]
				]);
			} else if (structure.name == 'atomic') {
				if (structure.element.type == 'primitive') {
					if (structure.element.name == 'uint') {
						return (window as any).makeAtomic(uview[offset]);
					} else if (structure.element.name == 'int') {
						return (window as any).makeAtomic(iview[offset]);
					}
				}
			} else {
				throw new Error(`Unable to convert primitive type ${structure.name}`);
			}
		} else if (structure.type == 'struct') {
			let out: any = {};

			for (let field of structure.fields) {
				let size = getValueSize(field[1]);
				out[field[0]] = this.readStructuredBuffer(field[1], buffer, offset / 4);
				offset += size;
			}

			let clazz = (window as any).__shadeup_structs[structure.name].struct;
			if (clazz) {
				return new clazz(out);
			}
		} else {
			throw new Error(`Unable to convert type ${structure.type}`);
		}
	}

	buildComputePipeline(
		shader: GenericShader,
		computeUniform: GeneratedUniforms
	): ComputePipelinePayload | undefined {
		const { device } = this.getGPU();
		let commands: PipelinePreDispatchCommands = [];
		const baseUniformValues = this.baseUniformValues;
		const baseUniformBufferSize = this.baseUniformBufferSize;
		const baseUniformBuffer = device.createBuffer({
			size: baseUniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		const compute = this.buildUniformsForPipeline(
			shader,
			computeUniform,
			baseUniformBuffer,
			GPUShaderStage.COMPUTE
		);

		if (!compute) {
			return;
		}

		commands = compute.commands;

		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [compute.bindGroupLayout]
		});

		this.startDispatch();
		let pipeline = device.createComputePipeline({
			label: 'compute pipeline',
			layout: pipelineLayout,
			compute: {
				module: shader.payload,
				entryPoint: 'main'
			}
		});
		this.endDispatch();
		return {
			pipeline,
			bindGroup: compute.bindGroup,
			baseUniformBuffer,
			uniformBuffer: compute.uniformBuffer,
			specialBuffers: compute.specialBuffers,
			commands
		};
	}

	cachedPipelines: Map<string, GPURenderPipeline> = new Map();
	cachedPipelineLayouts: Map<string, GPUPipelineLayout> = new Map();

	setupDrawPipeline(
		shaders: { fragment: GenericShader; vertex: GenericShader },
		fragmentUniform: GeneratedUniforms,
		vertexUniform: GeneratedUniforms,
		options: DrawOptions,
		ignoreVertexLayout: boolean = false
	): DrawPipelinePayload | undefined {
		const { device } = this.getGPU();
		if (!this.baseUniformBuffer) {
			throw new Error('Base uniform buffer not initialized');
		}

		let commands: PipelinePreDispatchCommands = [];

		const fragment = this.buildUniformsForPipeline(
			shaders.fragment,
			fragmentUniform,
			this.baseUniformBuffer,
			GPUShaderStage.FRAGMENT
		);

		const vertex = this.buildUniformsForPipeline(
			shaders.vertex,
			vertexUniform,
			this.baseUniformBuffer,
			GPUShaderStage.VERTEX
		);

		if (!fragment || !vertex) {
			return;
		}

		commands.push(...fragment.commands);
		commands.push(...vertex.commands);

		let pipelineLayoutKey = `${shaders.fragment.uniqueSourceKey}_${fragment.bindGroupLayout.$__gpuKey}_${shaders.vertex.uniqueSourceKey}_${vertex.bindGroupLayout.$__gpuKey}`;

		let pipelineLayout: GPUPipelineLayout;

		if (this.cachedPipelineLayouts.has(pipelineLayoutKey)) {
			pipelineLayout = this.cachedPipelineLayouts.get(pipelineLayoutKey)!;
		} else {
			pipelineLayout = device.createPipelineLayout({
				bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout]
			});
			this.cachedPipelineLayouts.set(pipelineLayoutKey, pipelineLayout);
		}

		if (!this.depthTexture) {
			throw new Error('Depth texture not initialized');
		}

		let pipelineKey =
			pipelineLayoutKey +
			this.depthTexture.format +
			options.depthTest +
			options.depthFormat +
			options.depthOnly +
			options.backfaceCulling +
			options.depthCompare +
			options.attachments?.length;
		let pipeline: GPURenderPipeline;

		if (this.cachedPipelines.has(pipelineKey)) {
			pipeline = this.cachedPipelines.get(pipelineKey)!;
		} else {
			const generateTarget = (adap: WebGPUAdapter) => {
				return {
					format: adap.headless ? adap.gpuTextureFormat : 'rgba8unorm',
					blend: FormatCapabilities[adap.gpuTextureFormat].blendable
						? {
								alpha: {
									srcFactor: 'src-alpha',
									dstFactor: 'one-minus-src-alpha',
									operation: 'add'
								},
								color: {
									srcFactor: 'src-alpha',
									dstFactor: 'one-minus-src-alpha',
									operation: 'add'
								}
						  }
						: undefined
				} as GPUColorTargetState;
			};

			const pipelineDescriptor = {
				vertex: {
					module: shaders.vertex.payload,
					entryPoint: 'main',
					buffers: ignoreVertexLayout ? [] : vertexLayout
				},

				...(options.depthOnly
					? {}
					: {
							fragment: {
								module: shaders.fragment.payload,
								entryPoint: 'main',
								targets:
									options.attachments && options.attachments.length > 0
										? options.attachments.map((att) => generateTarget(att.adapter as WebGPUAdapter))
										: [generateTarget(this)]
							}
					  }),

				primitive: {
					topology: 'triangle-list',
					cullMode: options.backfaceCulling ? 'back' : 'none'
				},
				...(options.depthTest
					? {
							depthStencil: {
								depthWriteEnabled: true,
								depthCompare: options.depthCompare ?? 'less',
								format: options.depthFormat ?? 'depth24plus'
							}
					  }
					: {}),

				layout: pipelineLayout
			} as GPURenderPipelineDescriptor;
			this.startDispatch();
			pipeline = device.createRenderPipeline(pipelineDescriptor);
			this.endDispatch();

			this.cachedPipelines.set(pipelineKey, pipeline);
		}

		let drawData = {
			pipeline,
			bindGroupFragment: fragment.bindGroup,
			bindGroupVertex: vertex.bindGroup,
			baseUniformBuffer: this.baseUniformBuffer,
			vertexUniformBuffer: vertex.uniformBuffer,
			fragmentUniformBuffer: fragment.uniformBuffer,
			specialBuffersFragment: fragment.specialBuffers,
			specialBuffersVertex: vertex.specialBuffers,
			commands
		};

		return drawData;
	}

	buildDrawPipeline(
		shaders: { fragment: GenericShader; vertex: GenericShader },
		fragmentUniform: GeneratedUniforms,
		vertexUniform: GeneratedUniforms,
		options: DrawOptions,
		ignoreVertexLayout: boolean = false
	): DrawPipelinePayload | undefined {
		const { device } = this.getGPU();
		let commands: PipelinePreDispatchCommands = [];
		const baseUniformValues = this.baseUniformValues;
		const baseUniformBufferSize = this.baseUniformBufferSize;
		const baseUniformBuffer = device.createBuffer({
			size: baseUniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		const fragment = this.buildUniformsForPipeline(
			shaders.fragment,
			fragmentUniform,
			baseUniformBuffer,
			GPUShaderStage.FRAGMENT
		);

		const vertex = this.buildUniformsForPipeline(
			shaders.vertex,
			vertexUniform,
			baseUniformBuffer,
			GPUShaderStage.VERTEX
		);

		if (!fragment || !vertex) {
			return;
		}

		commands.push(...fragment.commands);
		commands.push(...vertex.commands);

		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout]
		});

		if (!this.depthTexture) {
			throw new Error('Depth texture not initialized');
		}
		const generateTarget = (adap: WebGPUAdapter) => {
			return {
				format: adap.headless ? adap.gpuTextureFormat : 'rgba8unorm',
				blend: FormatCapabilities[adap.gpuTextureFormat].blendable
					? {
							alpha: {
								srcFactor: 'src-alpha',
								dstFactor: 'one-minus-src-alpha',
								operation: 'add'
							},
							color: {
								srcFactor: 'src-alpha',
								dstFactor: 'one-minus-src-alpha',
								operation: 'add'
							}
					  }
					: undefined
			} as GPUColorTargetState;
		};
		const pipelineDescriptor = {
			vertex: {
				module: shaders.vertex.payload,
				entryPoint: 'main',
				buffers: ignoreVertexLayout ? [] : vertexLayout
			},

			...(options.depthOnly
				? {}
				: {
						fragment: {
							module: shaders.fragment.payload,
							entryPoint: 'main',
							targets:
								options.attachments && options.attachments.length > 0
									? options.attachments.map((att) => generateTarget(att.adapter as WebGPUAdapter))
									: [generateTarget(this)]
						}
				  }),

			primitive: {
				topology: 'triangle-list',
				cullMode: 'back'
			},
			...(options.depthTest
				? {
						depthStencil: {
							depthWriteEnabled: true,
							depthCompare: 'less',
							format: options.depthFormat ?? 'depth24plus'
						}
				  }
				: {}),

			layout: pipelineLayout
		} as GPURenderPipelineDescriptor;
		this.startDispatch();
		let pipeline = device.createRenderPipeline(pipelineDescriptor);
		this.endDispatch();

		let drawData = {
			pipeline,
			bindGroupFragment: fragment.bindGroup,
			bindGroupVertex: vertex.bindGroup,
			baseUniformBuffer,
			vertexUniformBuffer: vertex.uniformBuffer,
			fragmentUniformBuffer: fragment.uniformBuffer,
			specialBuffersFragment: fragment.specialBuffers,
			specialBuffersVertex: vertex.specialBuffers,
			commands
		};

		return drawData;
	}

	getTexture(): GPUTexture {
		if (!this.headless) {
			if (this.ctx) {
				return this.ctx.getCurrentTexture();
			} else {
				throw new Error('No context');
			}
		} else {
			return this.texture as GPUTexture;
		}
	}

	getStorageTexture(): GPUTexture {
		const { device } = this.getGPU();
		if (!this.storageTexture) {
			this.startDispatch();
			this.storageTexture = device.createTexture({
				size: {
					width: this.headlessWidth,
					height: this.headlessHeight
				},
				format: this.gpuTextureFormat,
				dimension: '2d',
				viewFormats: [this.gpuTextureFormat],
				usage:
					GPUTextureUsage.RENDER_ATTACHMENT |
					GPUTextureUsage.STORAGE_BINDING |
					GPUTextureUsage.COPY_SRC |
					GPUTextureUsage.COPY_DST
			});
			this.endDispatch();
		}

		return this.storageTexture;
	}

	commandQueue: ((encoder: GPUCommandEncoder) => void | undefined | (() => void | undefined))[] =
		[];

	cleanupCommands: ((() => void | undefined | (() => void | undefined)) & { $counter: number })[] =
		[];

	immediate = false;
	enqueueCommand(
		command: (encoder: GPUCommandEncoder) => void | undefined | (() => void | undefined),
		immediate = false
	) {
		if (this.immediate || immediate) {
			const { device } = this.getGPU();
			this.startDispatch();
			let encoder = device.createCommandEncoder();
			let result = command(encoder);
			device.queue.submit([encoder.finish()]);
			if (result) {
				result();
			}
			this.endDispatch();
		} else {
			this.commandQueue.push(command);
		}
	}

	enqueueCleanupCommand(command: () => void | undefined | (() => void | undefined)) {
		let cmd = command as any;
		cmd.$counter = 10;
		this.cleanupCommands.push(cmd);
	}

	dispatchCompute(dispatch: ShaderDispatch) {
		this.trace('enqueueCompute', { dispatch });
		const { device } = this.getGPU();

		if (!dispatch.computeShader) {
			throw new Error('Dispatch is missing compute shader');
		}

		// this.startDispatch();

		let cacheKey = `${dispatch.computeShader.uniqueSourceKey}`;
		const computeUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.computeShader);
		let output = this.buildComputePipeline(dispatch.computeShader, computeUniform);

		this.enqueueCommand((encoder) => {
			// const encoder = device.createCommandEncoder({ label: 'compute builtin encoder' });
			if (output)
				for (let command of output.commands) {
					command(encoder);
				}

			const pass = encoder.beginComputePass({ label: 'compute builtin pass' });
			let baseUniformValues = this.baseUniformValues;

			let baseUniformBufferSize = this.baseUniformBufferSize;

			baseUniformValues.set([0, 0], 0);

			let computeData: ComputePipelinePayload;

			if (CACHE_PIPELINES) {
				let cacheValue = this.pipelineCache.get(cacheKey);

				if (!cacheValue) {
					let output = this.buildComputePipeline(dispatch.computeShader, computeUniform);
					if (!output) return;
					computeData = output;
					this.pipelineCache.set(cacheKey, computeData);
				} else {
					computeData = cacheValue as ComputePipelinePayload;
				}
			} else {
				if (!output) return;
				computeData = output;
			}

			let { pipeline, bindGroup, baseUniformBuffer, uniformBuffer, specialBuffers } = computeData;

			device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);

			device.queue.writeBuffer(uniformBuffer, 0, computeUniform.data);
			let bufCounter = 0;
			for (let i = 0; i < computeUniform.special.length; i++) {
				let special = computeUniform.special[i];
				if (special.type == 'array' && special.value) {
					this.trace('writeArray', { special });
					device.queue.writeBuffer(specialBuffers[bufCounter++], 0, special.value.buffer);
				}
			}

			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroup);
			if (dispatch.indirectBuffer) {
				pass.dispatchWorkgroupsIndirect(
					this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
					dispatch.indirectOffset
				);
			} else {
				pass.dispatchWorkgroups(...dispatch.computeCount);
			}
			this.trace('dispatchCompute', { dispatch });
			pass.end();
		});

		// device.queue.submit([encoder.finish()]);

		// this.endDispatch();
	}

	writeSpecialBuffer(buffer: GPUBuffer, data: Float32Array) {
		const { device } = this.getGPU();
		this.startDispatch();
		device.queue.writeBuffer(buffer, 0, data);
		this.endDispatch();
	}

	beforeScreenDraw() {
		if (!this.clearEnqueued) {
			this.enqueueCommand((encoder) => {
				const { device } = this.getGPU();
				if (!this.depthTexture) return;
				const textureView = this.getTexture().createView();
				if (this.gpuTextureFormat == 'depth24plus' || this.gpuTextureFormat == 'depth32float') {
					const clearPassDesc: GPURenderPassDescriptor = {
						colorAttachments: [],
						depthStencilAttachment: {
							view: textureView,
							depthClearValue: 1.0,
							depthLoadOp: 'clear',
							depthStoreOp: 'store'
						}
					};
					const passEncoder = encoder.beginRenderPass(clearPassDesc);
					passEncoder.end();
				} else {
					const clearPassDesc: GPURenderPassDescriptor = {
						colorAttachments: [
							{
								view: textureView,
								clearValue: { r: 0, g: 0, b: 0, a: 0 },

								storeOp: 'store',
								loadOp: 'clear'
							}
						],
						depthStencilAttachment: {
							view: this.depthTexture.createView(),
							depthClearValue: 1.0,
							depthLoadOp: 'clear',
							depthStoreOp: 'store'
						}
					};
					const passEncoder = encoder.beginRenderPass(clearPassDesc);
					passEncoder.end();
				}

				this.clearEnqueued = false;
			});
			this.clearEnqueued = true;
		}
	}

	dispatchDraw(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		this.trace('enqueueDraw', { dispatch, options });
		const { device } = this.getGPU();

		if (!dispatch.vertexShader || !dispatch.fragmentShader) {
			throw new Error('Dispatch is missing vertex or fragment shader');
		}

		if (!dispatch.geometry && !dispatch.indirectBuffer) {
			throw new Error('Dispatch is missing geometry');
		}

		if (!this.depthTexture) {
			throw new Error('Depth texture not created');
		}

		this.startDispatch();

		if (dispatch.overrideDepth) {
			if (dispatch.overrideDepth.adapter instanceof WebGPUAdapter) {
				dispatch.overrideDepth.adapter.flush();
			}
		}

		let fragment = dispatch.fragmentShader;
		let vertex = dispatch.vertexShader;

		const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
		const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
		let cacheKey = `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
		let depthTex = dispatch.overrideDepth
			? (dispatch.overrideDepth.adapter as WebGPUAdapter).getTexture()
			: this.depthTexture;
		let output = this.setupDrawPipeline(
			{
				fragment,
				vertex
			},
			fragmentUniform,
			vertexUniform,
			{
				...options,
				depthFormat: depthTex.format,
				depthOnly: dispatch.depthOnly,
				attachments: dispatch.attachments ?? [],
				depthCompare: dispatch.depthCompare == 'auto' ? 'less' : dispatch.depthCompare,
				backfaceCulling: dispatch.backfaceCulling
			}
		);

		this.beforeScreenDraw();
		this.enqueueCommand((encoder) => {
			if (output)
				for (let command of output.commands) {
					command(encoder);
				}

			let attachments = [] as GPURenderPassColorAttachment[];
			if (!dispatch.depthOnly) {
				if (!dispatch.attachments) {
					attachments.push({
						view: this.getTexture().createView(),

						storeOp: 'store',
						loadOp: 'load'
					});
				} else {
					for (let attachment of dispatch.attachments) {
						if (attachment.adapter instanceof WebGPUAdapter) {
							let view = attachment.adapter.getTexture().createView();

							attachments.push({
								view,

								storeOp: 'store',
								loadOp: 'load'
							});
						}
					}
				}
			}

			let passDescriptor: GPURenderPassDescriptor = {
				colorAttachments: attachments,
				...(options.depthTest
					? {
							depthStencilAttachment: {
								view: depthTex.createView(),
								depthClearValue: 1.0,
								depthLoadOp: 'load',
								depthStoreOp: 'store'
							}
					  }
					: {})
			};
			const pass = encoder.beginRenderPass(passDescriptor);
			let myTex = this.getTexture();
			// pass.setViewport(0, 0, myTex.width, myTex.height, 0, 1);

			let baseUniformValues = this.baseUniformValues;
			let baseUniformBufferSize = this.baseUniformBufferSize;
			baseUniformValues.set([myTex.width, myTex.height], 0);

			let drawData: DrawPipelinePayload;

			if (!output) return;
			drawData = output;

			let {
				pipeline,
				bindGroupFragment,
				bindGroupVertex,
				baseUniformBuffer,
				vertexUniformBuffer,
				fragmentUniformBuffer,
				specialBuffersFragment,
				specialBuffersVertex
			} = drawData;

			pass.setPipeline(pipeline);

			device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);

			// device.queue.writeBuffer(fragmentUniformBuffer, 0, fragmentUniform.data);

			// let bufCounterFrag = 0;
			// for (let i = 0; i < fragmentUniform.special.length; i++) {
			// 	let special = fragmentUniform.special[i];
			// 	if (special.type == 'array' && special.value) {
			// 		device.queue.writeBuffer(
			// 			specialBuffersFragment[bufCounterFrag++],
			// 			0,
			// 			special.value.buffer
			// 		);
			// 	}
			// }

			// device.queue.writeBuffer(vertexUniformBuffer, 0, vertexUniform.data);

			// let bufCounterVert = 0;
			// for (let i = 0; i < vertexUniform.special.length; i++) {
			// 	let special = vertexUniform.special[i];
			// 	if (special.type == 'array' && special.value) {
			// 		device.queue.writeBuffer(specialBuffersVertex[bufCounterVert++], 0, special.value.buffer);
			// 	}
			// }

			pass.setBindGroup(0, bindGroupFragment);
			pass.setBindGroup(1, bindGroupVertex);

			if (dispatch.indirectBuffer) {
				if (dispatch.geometry) {
					let meshData = this.getOrCreateMeshData(dispatch.geometry);
					pass.setVertexBuffer(0, meshData.vertexBuffer);
					pass.setIndexBuffer(meshData.indexBuffer, 'uint32');
				}
				if (dispatch.indexBuffer) {
					if (dispatch.indexBuffer) {
						pass.setIndexBuffer(
							this.getOrCreateBuffer(dispatch.indexBuffer, GPUBufferUsage.INDEX),
							'uint32'
						);
					}
					if (dispatch.indirectBuffer.elementCount % 5 != 0) {
						throw new Error(
							'Indirect buffer needs to be a multiple of 5 (must be at least 5 elements for indexedIndirect)'
						);
					}
					pass.drawIndexedIndirect(
						this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
						dispatch.indirectOffset
					);
				} else {
					if (dispatch.indirectBuffer.elementCount % 4 != 0) {
						throw new Error(
							'Indirect buffer needs to be a multiple of 4 (must be at least 4 elements for indirect)'
						);
					}
					pass.drawIndirect(
						this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
						dispatch.indirectOffset
					);
				}
			} else if (dispatch.geometry) {
				let meshData = this.getOrCreateMeshData(dispatch.geometry);
				pass.setVertexBuffer(0, meshData.vertexBuffer);
				if (meshData.indexCount > 0) {
					pass.setIndexBuffer(meshData.indexBuffer, 'uint32');

					pass.drawIndexed(meshData.indexCount, dispatch.instanceCount);
				} else {
					pass.draw(meshData.vertexCount, dispatch.instanceCount);
				}
			}
			this.trace('dispatchDraw', { dispatch, options });
			pass.end();

			return () => {
				// baseUniformBuffer.destroy();
				// vertexUniformBuffer.destroy();
				// fragmentUniformBuffer.destroy();
			};
		});

		// device.queue.submit([encoder.finish()]);

		// this.endDispatch();
	}

	dispatchDrawIndexed(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		const { device } = this.getGPU();

		if (!dispatch.vertexShader || !dispatch.fragmentShader) {
			throw new Error('Dispatch is missing vertex or fragment shader');
		}

		if (!dispatch.indexBuffer) {
			throw new Error('Dispatch is missing indexBuffer');
		}

		this.startDispatch();

		let fragment = dispatch.fragmentShader;
		let vertex = dispatch.vertexShader;

		const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
		const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
		let cacheKey = `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
		let output = this.buildDrawPipeline(
			{
				fragment,
				vertex
			},
			fragmentUniform,
			vertexUniform,
			options,
			true
		);

		this.beforeScreenDraw();
		this.enqueueCommand((encoder) => {
			if (output)
				for (let command of output.commands) {
					command(encoder);
				}
			if (!this.depthTexture) {
				throw new Error('Depth texture not created');
			}
			let passDescriptor: GPURenderPassDescriptor = {
				colorAttachments: [
					{
						view: this.getTexture().createView(),

						storeOp: 'store',
						loadOp: 'load'
					}
				],
				depthStencilAttachment: {
					view: this.depthTexture.createView(),
					depthClearValue: 1.0,
					depthLoadOp: 'load',
					depthStoreOp: 'store'
				}
			};
			const pass = encoder.beginRenderPass(passDescriptor);

			let baseUniformValues = this.baseUniformValues;
			let baseUniformBufferSize = this.baseUniformBufferSize;
			let myTex = this.getTexture();
			baseUniformValues.set([myTex.width, myTex.height], 0);

			let drawData: DrawPipelinePayload;

			if (CACHE_PIPELINES) {
				let cacheValue = this.pipelineCache.get(cacheKey);

				if (!cacheValue) {
					let output = this.buildDrawPipeline(
						{
							fragment,
							vertex
						},
						fragmentUniform,
						vertexUniform,
						options
					);
					if (!output) return;
					drawData = output;
					this.pipelineCache.set(cacheKey, drawData);
				} else {
					drawData = cacheValue as DrawPipelinePayload;
				}
			} else {
				if (!output) return;
				drawData = output;
			}

			let {
				pipeline,
				bindGroupFragment,
				bindGroupVertex,
				baseUniformBuffer,
				vertexUniformBuffer,
				fragmentUniformBuffer,
				specialBuffersFragment,
				specialBuffersVertex
			} = drawData;

			pass.setPipeline(pipeline);

			device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);

			device.queue.writeBuffer(fragmentUniformBuffer, 0, fragmentUniform.data);

			let bufCounterFrag = 0;
			for (let i = 0; i < fragmentUniform.special.length; i++) {
				let special = fragmentUniform.special[i];
				if (special.type == 'array' && special.value) {
					device.queue.writeBuffer(
						specialBuffersFragment[bufCounterFrag++],
						0,
						special.value.buffer
					);
				}
			}

			device.queue.writeBuffer(vertexUniformBuffer, 0, vertexUniform.data);

			let bufCounterVert = 0;
			for (let i = 0; i < vertexUniform.special.length; i++) {
				let special = vertexUniform.special[i];
				if (special.type == 'array' && special.value) {
					device.queue.writeBuffer(specialBuffersVertex[bufCounterVert++], 0, special.value.buffer);
				}
			}

			pass.setBindGroup(0, bindGroupFragment);
			pass.setBindGroup(1, bindGroupVertex);

			pass.setIndexBuffer(
				this.getOrCreateBuffer(dispatch.indexBuffer, GPUBufferUsage.INDEX),
				'uint32'
			);

			pass.drawIndexed(dispatch.indexBuffer.len(), dispatch.instanceCount);

			pass.end();
		});

		// device.queue.submit([encoder.finish()]);

		// this.endDispatch();
	}

	dispatchDrawCount(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		const { device } = this.getGPU();

		if (!dispatch.vertexShader || !dispatch.fragmentShader) {
			throw new Error('Dispatch is missing vertex or fragment shader');
		}

		this.startDispatch();

		let fragment = dispatch.fragmentShader;
		let vertex = dispatch.vertexShader;
		let cacheKey = `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
		const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
		const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
		let output = this.buildDrawPipeline(
			{
				fragment,
				vertex
			},
			fragmentUniform,
			vertexUniform,
			options,
			true
		);

		this.beforeScreenDraw();
		this.enqueueCommand((encoder) => {
			if (output)
				for (let command of output.commands) {
					command(encoder);
				}
			if (!this.depthTexture) {
				throw new Error('Depth texture not created');
			}
			let passDescriptor: GPURenderPassDescriptor = {
				colorAttachments: [
					{
						view: this.getTexture().createView(),

						storeOp: 'store',
						loadOp: 'load'
					}
				],
				depthStencilAttachment: {
					view: this.depthTexture.createView(),
					depthClearValue: 1.0,
					depthLoadOp: 'load',
					depthStoreOp: 'store'
				}
			};
			const pass = encoder.beginRenderPass(passDescriptor);

			let baseUniformValues = this.baseUniformValues;
			let baseUniformBufferSize = this.baseUniformBufferSize;
			let myTex = this.getTexture();
			baseUniformValues.set([myTex.width, myTex.height], 0);

			let drawData: DrawPipelinePayload;

			if (CACHE_PIPELINES) {
				let cacheValue = this.pipelineCache.get(cacheKey);

				if (!cacheValue) {
					let output = this.buildDrawPipeline(
						{
							fragment,
							vertex
						},
						fragmentUniform,
						vertexUniform,
						options,
						true
					);
					if (!output) return;
					drawData = output;
					this.pipelineCache.set(cacheKey, drawData);
				} else {
					drawData = cacheValue as DrawPipelinePayload;
				}
			} else {
				if (!output) return;
				drawData = output;
			}

			let {
				pipeline,
				bindGroupFragment,
				bindGroupVertex,
				baseUniformBuffer,
				vertexUniformBuffer,
				fragmentUniformBuffer,
				specialBuffersFragment,
				specialBuffersVertex
			} = drawData;

			pass.setPipeline(pipeline);

			device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);

			device.queue.writeBuffer(fragmentUniformBuffer, 0, fragmentUniform.data);

			let bufCounterFrag = 0;
			for (let i = 0; i < fragmentUniform.special.length; i++) {
				let special = fragmentUniform.special[i];
				if (special.type == 'array' && special.value) {
					device.queue.writeBuffer(
						specialBuffersFragment[bufCounterFrag++],
						0,
						special.value.buffer
					);
				}
			}

			device.queue.writeBuffer(vertexUniformBuffer, 0, vertexUniform.data);

			let bufCounterVert = 0;
			for (let i = 0; i < vertexUniform.special.length; i++) {
				let special = vertexUniform.special[i];
				if (special.type == 'array' && special.value) {
					device.queue.writeBuffer(specialBuffersVertex[bufCounterVert++], 0, special.value.buffer);
				}
			}

			pass.setBindGroup(0, bindGroupFragment);
			pass.setBindGroup(1, bindGroupVertex);

			pass.draw(dispatch.drawCount * 3, 1, 0, 0);

			pass.end();
		});
	}

	drawCalls: GPUCommandBuffer[] = [];

	flush(): Promise<void> {
		this.trace('flush', {});
		super.flush();

		const { device } = this.getGPU();

		let needsDraw = true;
		if (this.drawCalls.length == 0 && this.commandQueue.length == 0) needsDraw = false;

		if (needsDraw) {
			if (this.drawCalls.length > 0) {
				device.queue.submit(this.drawCalls);
				this.drawCalls = [];
			}

			if (this.commandQueue.length > 0) {
				let cleanups = [];
				this.startDispatch();
				let encoder = device.createCommandEncoder();

				for (let i = 0; i < this.commandQueue.length; i++) {
					let o = this.commandQueue[i](encoder);
					if (o) {
						cleanups.push(o);
					}
				}

				device.queue.submit([encoder.finish()]);

				for (let i = this.cleanupCommands.length - 1; i >= 0; i--) {
					if (this.cleanupCommands[i].$counter > 0) {
						this.cleanupCommands[i].$counter--;
					} else {
						this.cleanupCommands[i]();
						this.cleanupCommands.splice(i, 1);
					}
				}

				for (let i = 0; i < cleanups.length; i++) {
					cleanups[i]();
				}
				this.endDispatch();

				this.commandQueue = [];
			}

			this.copyToCanvas();
		}

		return device.queue.onSubmittedWorkDone();
	}

	drawImageRender(texture: GPUTexture, toTexture: GPUTexture): void {
		const { device } = this.getGPU();

		if (!this.ready) {
			return;
		}

		if (this.drawImageCache) {
			this.drawImageCache(texture, toTexture);
			return;
		}

		const bindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: { sampleType: 'unfilterable-float' }
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: { type: 'non-filtering' }
				}
			]
		});

		let vertexShader = this.createShader(
			{
				webgl: ``,
				webgpu: `
		struct VertexOutput {
			@builtin(position) Position : vec4<f32>,
			@location(0) Normal : vec3<f32>,
			@location(1) TexCoord : vec2<f32>,
			@location(2) Color : vec4<f32>,
		};
	
		@vertex
		fn main(
			@builtin(vertex_index) VertexIndex : u32
		) -> VertexOutput {
			var x : f32 = f32((VertexIndex & 1) << 2);
			var y : f32 = f32((VertexIndex & 2) << 1);
			var output : VertexOutput;
			output.Position = vec4<f32>(x - 1.0, y - 1.0, 0, 1);
			output.Normal = vec3<f32>(1.0, 0.0, 0.0);
			output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
			output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
	
			return output;
		}
		`,
				software: () => {}
			},
			'vertex'
		);

		let fragmentShader = this.createShader(
			{
				webgl: ``,
				webgpu: `
			struct VertexOutput {
				@builtin(position) Position : vec4<f32>,
				@location(0) Normal : vec3<f32>,
				@location(1) TexCoord : vec2<f32>,
				@location(2) Color : vec4<f32>,
			};
			@group(0) @binding(1) var _sampler: sampler;
			@group(0) @binding(0) var _texture: texture_2d<f32>;

		@fragment
		fn main(
			_in: VertexOutput
		) -> @location(0) vec4<f32> {
			return textureSample(_texture, _sampler, _in.TexCoord);
		}
		`,
				software: () => {}
			},
			'fragment'
		);
		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout]
		});

		const pipelineDescriptor = {
			vertex: {
				module: vertexShader.payload,
				entryPoint: 'main',
				buffers: vertexLayout
			},
			fragment: {
				module: fragmentShader.payload,
				entryPoint: 'main',
				targets: [
					{
						format: 'rgba8unorm',

						blend: {
							alpha: {
								srcFactor: 'one',
								dstFactor: 'one-minus-src-alpha',
								operation: 'add'
							},
							color: {
								srcFactor: 'one',
								dstFactor: 'one-minus-src-alpha',
								operation: 'add'
							}
						}
					}
				]
			},
			primitive: {
				topology: 'triangle-list',
				cullMode: 'back'
			},

			layout: pipelineLayout
		} as GPURenderPipelineDescriptor;

		const pipeline = device.createRenderPipeline(pipelineDescriptor);

		let geo = {
			vertices: [
				[0, 0, 0],
				[0, 1, 0],
				[1, 1, 0],
				[1, 0, 0]
			],
			uvs: [
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0]
			],
			triangles: [0, 1, 2],
			colors: [],
			normals: [],
			tangents: [],
			bitangents: [],
			getTriangles: () => {
				return geo.triangles;
			},
			getVertices: () => {
				return geo.vertices;
			},
			getUVs: () => {
				return geo.uvs;
			},
			getNormals: (): number[][] => {
				return [];
			},
			getTangents: (): number[][] => {
				return [];
			},
			getBitangents: (): number[][] => {
				return [];
			},
			getColors: (): number[][] => {
				return [];
			},
			symbol: Symbol()
		};

		let meshData = this.getOrCreateMeshData(geo as any);

		this.drawImageCache = (texture: GPUTexture, toTexture: GPUTexture) => {
			device.pushErrorScope('internal');
			device.pushErrorScope('validation');

			const commandEncoder = device.createCommandEncoder();
			const passEncoder = commandEncoder.beginRenderPass({
				colorAttachments: [
					{
						view: toTexture.createView(),

						storeOp: 'store',
						loadOp: 'load'
					}
				]
			} as GPURenderPassDescriptor);

			const sampler = device.createSampler({});

			passEncoder.setPipeline(pipeline);

			const bindGroup = device.createBindGroup({
				layout: bindGroupLayout,
				entries: [
					{
						binding: 0,

						resource: texture.createView()
					},
					{
						binding: 1,
						resource: sampler
					}
				]
			});
			passEncoder.setBindGroup(0, bindGroup);

			passEncoder.setVertexBuffer(0, meshData.vertexBuffer);
			passEncoder.setIndexBuffer(meshData.indexBuffer, 'uint32');

			passEncoder.drawIndexed(meshData.indexCount);

			passEncoder.end();

			device.queue.submit([commandEncoder.finish()]);

			device.popErrorScope().then((error) => {
				if (error) {
					console.log('Error', error);
					(window as any).bubbleError(error.message);
					throw new Error('Failed to create shader');
				}
			});
			device.popErrorScope().then((error) => {
				if (error) {
					console.log('Error', error);
					(window as any).bubbleError(error.message);
					throw new Error('Failed to create shader');
				}
			});
		};

		this.drawImageCache(texture, toTexture);
	}

	async copyToOtherCanvas(canvas: HTMLCanvasElement): Promise<void> {
		const { device } = this.getGPU();

		let encoder = device.createCommandEncoder();
		let ctx = canvas.getContext('webgpu');
		if (!ctx) throw new Error('Could not get webgpu context');
		ctx.configure({
			device: device,
			format: 'rgba8unorm',
			alphaMode: 'premultiplied',
			usage:
				GPUTextureUsage.RENDER_ATTACHMENT |
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_SRC |
				GPUTextureUsage.COPY_DST
		});

		encoder.copyTextureToTexture(
			{ texture: this.getTexture() },
			{ texture: ctx.getCurrentTexture() },
			{ width: this.getTexture().width, height: this.getTexture().height }
		);

		device.queue.submit([encoder.finish()]);
		await device.queue.onSubmittedWorkDone();
	}

	copyToCanvas() {
		const { device } = this.getGPU();
		if (
			this.headless &&
			this.texture &&
			(this.textureFormat.endsWith('4') || this.textureFormat == 'uint8')
		) {
			// Draw to canvas
			if (!this.ctx) {
				this.ctx = this.canvas!.getContext('webgpu');
				if (!this.ctx) throw new Error('Could not get webgpu context');

				this.ctx.configure({
					device,
					format: 'rgba8unorm',
					alphaMode: 'premultiplied',
					usage:
						GPUTextureUsage.RENDER_ATTACHMENT |
						GPUTextureUsage.TEXTURE_BINDING |
						GPUTextureUsage.COPY_SRC |
						GPUTextureUsage.COPY_DST
				});
				// document.body.appendChild(this.canvas!);
			}

			this.startDispatch();

			let encoder = device.createCommandEncoder();

			if (this.texture.format == 'rgba8unorm') {
				encoder.copyTextureToTexture(
					{ texture: this.texture },
					{ texture: this.ctx.getCurrentTexture() },
					{ width: this.texture.width, height: this.texture.height }
				);
			} else {
				// Render via draw call
				this.drawImageRender(this.texture, this.ctx.getCurrentTexture());
			}

			device.queue.submit([encoder.finish()]);

			this.endDispatch();
		}
	}

	dispatch(
		dispatch: ShaderDispatch,
		options: {
			depthTest: boolean;
		} = {
			depthTest: true
		}
	): void {
		super.dispatch(dispatch, options);
		if (dispatch.type == 'draw') {
			this.activateDrawContext();
			this.triggerEvent('draw', dispatch);
			if (dispatch.drawType == 'indexed') {
				this.dispatchDrawIndexed(dispatch, options);
			} else if (dispatch.drawType == 'count') {
				this.dispatchDrawCount(dispatch, options);
			} else {
				this.dispatchDraw(dispatch, options);
			}
		}
	}

	dispose(): void {
		this.canvas?.remove();
		this.texture?.destroy();
		this.storageTexture?.destroy();
	}

	destroyBuffer(buf: buffer<any>): void {
		this.enqueueCommand((encoder) => {
			if (buf.platformPayload) {
				buf.platformPayload.destroy();
			}
		});
	}

	waitForDraw(): Promise<void> {
		const { device } = this.getGPU();

		return device.queue.onSubmittedWorkDone();
	}

	bufferCounter: number = 0;
	getOrCreateBuffer(buf: buffer<any>, extraFlags: GPUBufferUsageFlags | null): GPUBuffer {
		let useOldBuffer: GPUBuffer | null = null;
		if (buf.platformPayload) {
			let gpuBuf = buf.platformPayload as GPUBuffer;
			if (extraFlags !== null) {
				if (gpuBuf.usage & extraFlags) {
					return gpuBuf;
				}

				extraFlags |= gpuBuf.usage;
				useOldBuffer = gpuBuf;
			} else {
				return gpuBuf;
			}
		}

		const { device } = this.getGPU();
		let flags = this.genericBufferFlags();
		if (extraFlags) {
			flags |= extraFlags;
		}
		let bufferSize = buf.len() * buf.elementBytes;
		if (!buf.structured) {
			bufferSize *= buf.vectorSize;
		}
		this.startDispatch();
		let buffer = device.createBuffer({
			size: bufferSize,
			usage: flags
		});
		(buf as any).$_bufferIndex = this.bufferCounter;
		this.bufferCounter++;
		buf.symbol = Symbol();

		if (useOldBuffer) {
			let encoder = device.createCommandEncoder();
			encoder.copyBufferToBuffer(useOldBuffer, 0, buffer, 0, bufferSize);
			device.queue.submit([encoder.finish()]);
		} else if (buf.cpuWriteDirty) {
			if (buf.structured) {
				if (buf.typeName == 'atomic<uint>' || buf.typeName == 'atomic<int>') {
					let zero: Uint32Array | Int32Array;
					if (buf.typeName == 'atomic<uint>') {
						zero = new Uint32Array(buf.elementCount);
					} else {
						zero = new Int32Array(buf.elementCount);
					}
					if (buf.structArray)
						for (let i = 0; i < buf.structArray.length; i++) {
							let struct = buf.structArray[i];
							if (struct) {
								zero[i] = struct;
							}
						}
					device.queue.writeBuffer(buffer, 0, zero);
				} else {
					// let structure = (window as any).__shadeup_structs[buf.typeName];
					// let size = getValueSize(structure.fields);
					// let arrayBuffer = new ArrayBuffer(buf.elementCount * size);
					// if (buf.structArray)
					// 	for (let i = 0; i < buf.elementCount; i++) {
					// 		this.writeStructuredBuffer(structure.fields, buf.structArray[i], arrayBuffer, i * size);
					// 	}

					device.queue.writeBuffer(buffer, 0, buf.arrayBuffer!);
				}
			} else {
				device.queue.writeBuffer(
					buffer,
					0,
					buf.uintArray ?? buf.floatArray ?? buf.intArray ?? new Uint8Array(0)
				);
			}

			buf.cpuWriteDirty = false;
		}

		buf.platformPayload = buffer;
		buf.adapter = this;
		this.endDispatch();
		return buffer;
	}
}

const TYPE_SIZES_NATIVE = {
	f32: 4,
	'vec2<f32>': 8,
	'vec3<f32>': 12,
	'vec4<f32>': 16,

	'mat2x2<f32>': 16,
	'mat3x3<f32>': 36,
	'mat4x4<f32>': 64,

	u32: 4,
	'vec2<u32>': 8,
	'vec3<u32>': 12,
	'vec4<u32>': 16,

	i32: 4,
	'vec2<i32>': 8,
	'vec3<i32>': 12,
	'vec4<i32>': 16
};
const TRANSPOSE_MATRICES_UNIFORM = false;
const TYPE_SIZES = {
	atomic: [8, 8],
	texture2d: [8, 8],
	rwtexture2d: [8, 8],
	bool: [1, 15],

	float: [4, 12],
	float2: [8, 8],
	float3: [12, 4],
	float4: [16, 0],

	float2x2: [16, 0],
	float3x3: [12 + 12 + 12, 4 + 4 + 4],
	float4x4: [16 + 16 + 16 + 16, 4 + 4 + 4 + 4],

	uint: [4, 12],
	uint2: [8, 8],
	uint3: [12, 4],
	uint4: [16, 0],

	int: [4, 12],
	int2: [8, 8],
	int3: [12, 4],
	int4: [16, 0]
};

function getValueSize(val: UniformValueType): number {
	let totalSize = 0;
	if (val.type == 'struct') {
		let lastSlotPadding = 0;
		for (let member of val.fields) {
			let fieldSize = getValueSize(member[1]);
			totalSize += fieldSize;
			if (lastSlotPadding == 0) {
				lastSlotPadding = 16 - fieldSize;
			} else if (lastSlotPadding == 4 && fieldSize == 4) {
			} else if (lastSlotPadding == 8 && fieldSize == 4) {
				lastSlotPadding = 4;
			} else if (lastSlotPadding == 12 && fieldSize == 4) {
				lastSlotPadding = 0;
			}
			// if (member[1].type == 'primitive') {
			// 	lastSlotPadding = 16 - fieldSize;
			// }else{
			// 	lastSlotPadding = 0;
			// }
		}
	} else if (val.type == 'primitive') {
		let n = val.name;
		if (n == 'atomic') {
			totalSize += 4;
		} else if (n == 'texture2d' || n == 'rwtexture2d') {
			totalSize += 8;
		} else {
			let s = TYPE_SIZES[n];
			if (s[0] == 0) {
				throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
			}
			totalSize += s[0] + s[1];
		}
	} else if (val.type == 'array') {
		let elementSize = getValueSize(val.element);

		if (typeof val.staticSize !== 'undefined') {
			totalSize += val.staticSize * elementSize;
		} else {
			throw new Error(`Cannot calculate size of struct with unknown size type ${val.element}`);
		}
	}
	return totalSize;
}

function generateArrayBuffer(
	rootVt: UniformValueType,
	rawData: any,
	data?: ArrayBuffer,
	offset?: number
): {
	buffer: ArrayBuffer;
	size: number;
} {
	if (rootVt.type != 'array') {
		throw new Error(`Cannot generate array buffer for non-array type ${rootVt.type}`);
	}
	let specialCounter = 2;
	let totalSize = 0;
	let lastFieldPadding = 0;

	let vsize = getValueSize(rootVt.element);
	totalSize += vsize * rawData.value.len();

	if (totalSize == 0) {
		// Dummy data
		totalSize = 4 * 4;
	}

	if (!data) data = new ArrayBuffer(totalSize);
	let floatView = new Float32Array(data);
	let uintView = new Uint32Array(data);
	let intView = new Int32Array(data);

	if (!offset) offset = 0;
	let queue: [UniformKeyValuePair, any, number | null][] = [];
	let rootObj = rawData.value;

	for (let i = 0; i < rawData.value.len(); i++) {
		queue.unshift([[`[${i}]`, rootVt.element], rootObj, i]);
	}

	while (queue.length > 0) {
		let [uniform, obj, arrayIndex] = queue.pop() as [UniformKeyValuePair, any, number | null];
		let vt = uniform[1];
		let name = uniform[0];
		if (vt.type == 'primitive') {
			let n = vt.name;
			let s = TYPE_SIZES[n];
			if (s[0] == 0) {
				throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
			}
			let val;
			if (arrayIndex !== null) {
				val = obj[arrayIndex];
			} else {
				val = obj[name];
			}
			if (typeof val === 'undefined') {
				throw new Error(`Uniform ${name} is not defined`);
			}
			if (val instanceof UniformValue) {
				val = val.value;
			}
			let view: Float32Array | Uint32Array | Int32Array = floatView;
			if (n.startsWith('u')) {
				view = uintView;
			} else if (n.startsWith('i')) {
				view = intView;
			}
			if (n == 'float' || n == 'uint' || n == 'int') {
				if (typeof val == 'boolean') {
					val = val ? 1 : 0;
				}

				view[offset++] = val;
				offset += 3;
			} else if (n == 'float2' || n == 'uint2' || n == 'int2') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				offset += 2;
			} else if (n == 'float3' || n == 'uint3' || n == 'int3') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				view[offset++] = val[2];
				offset += 1;
			} else if (n == 'float4' || n == 'uint4' || n == 'int4') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				view[offset++] = val[2];
				view[offset++] = val[3];
			} else if (n == 'float2x2') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[2];
					view[offset++] = val[1];
					view[offset++] = val[3];
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					view[offset++] = val[3];
				}
			} else if (n == 'float3x3') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[3];
					view[offset++] = val[6];
					offset++;
					view[offset++] = val[1];
					view[offset++] = val[4];
					view[offset++] = val[7];
					offset++;
					view[offset++] = val[2];
					view[offset++] = val[5];
					view[offset++] = val[8];
					offset++;
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					offset++;
					view[offset++] = val[3];
					view[offset++] = val[4];
					view[offset++] = val[5];
					offset++;
					view[offset++] = val[6];
					view[offset++] = val[7];
					view[offset++] = val[8];
					offset++;
				}
			} else if (n == 'float4x4') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[4];
					view[offset++] = val[8];
					view[offset++] = val[12];

					view[offset++] = val[1];
					view[offset++] = val[5];
					view[offset++] = val[9];
					view[offset++] = val[13];

					view[offset++] = val[2];
					view[offset++] = val[6];
					view[offset++] = val[10];
					view[offset++] = val[14];

					view[offset++] = val[3];
					view[offset++] = val[7];
					view[offset++] = val[11];
					view[offset++] = val[15];
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					view[offset++] = val[3];

					view[offset++] = val[4];
					view[offset++] = val[5];
					view[offset++] = val[6];
					view[offset++] = val[7];

					view[offset++] = val[8];
					view[offset++] = val[9];
					view[offset++] = val[10];
					view[offset++] = val[11];

					view[offset++] = val[12];
					view[offset++] = val[13];
					view[offset++] = val[14];
					view[offset++] = val[15];
				}
			} else if (n == 'bool') {
				intView[offset++] = val ? 1 : 0;
				offset += 3;
			} else if (n == 'rwtexture2d' || n == 'texture2d') {
				floatView[offset++] = val.size[0];
				floatView[offset++] = val.size[1];
				offset += 2;
			} else if (n == 'atomic') {
				view[offset++] = val;
				offset += 3;
			} else {
				throw new Error('Invalid param type ' + n);
			}
		} else if (vt.type == 'array') {
			let val = obj[name];
			if (val instanceof UniformValue) {
				val = val.value;
			}
			if (obj == rootObj) {
				if (typeof val === 'object' && Array.isArray(val)) {
					intView[offset++] = val.length;
					offset += 3;
				}
			} else {
				for (let i = val.length - 1; i >= 0; i--) {
					queue.push([['', vt.element], val, i]);
				}
			}
		} else if (vt.type == 'buffer') {
			let val = obj[name];
			if (val instanceof UniformValue) {
				val = val.value;
			}
			if (obj == rootObj) {
				if (typeof val === 'object') {
					intView[offset++] = val.elementCount;
					offset += 3;
				}
			}
		} else if (vt.type == 'struct') {
			let val;
			if (arrayIndex !== null) {
				val = obj[arrayIndex];
			} else {
				val = obj[name];
			}
			if (typeof val === 'object') {
				for (let i = vt.fields.length - 1; i >= 0; i--) {
					let member = vt.fields[i];
					if (val instanceof UniformValue) {
						queue.push([member, val.value, null]);
					} else {
						queue.push([member, val, null]);
					}
				}
			}
		}
	}

	return {
		size: totalSize,
		buffer: data
	};
}

type WebGPUSpecialUniform =
	| {
			index: number;
			type: 'sampler2D';
			valueType: UniformValueType;
			access: 'read' | 'write' | 'sample_write' | 'sample';
			value?: {
				texture: ShadeupTexture2d;
			};
	  }
	| {
			index: number;
			type: 'sampler2DArray';
			valueType: UniformValueType;
			access: 'read' | 'write' | 'sample_write' | 'sample';
			value?: {
				textures: ShadeupTexture2d[];
			};
	  }
	| {
			index: number;
			type: 'array';
			valueType: UniformValueType;
			value?: {
				size: number;
				buffer: ArrayBuffer;
			};
	  }
	| {
			index: number;
			type: 'buffer';
			access: 'read' | 'write';
			valueType: UniformValueType;
			value?: buffer<any>;
	  }
	| {
			index: number;
			type: 'atomic';
			valueType: UniformValueType;
			value: { __value: number };
	  };

type GeneratedUniforms = {
	size: number;
	special: WebGPUSpecialUniform[];
	data: ArrayBuffer;
};

function generateUniforms(
	fragmentUniforms: UniformPayload,
	fragmentShader: GenericShader
): GeneratedUniforms {
	if (fragmentShader.parent == null) {
		return {
			size: 0,
			special: [],
			data: new ArrayBuffer(0)
		};
	}
	let orderedUniforms: UniformKeyValuePair[] = [
		...fragmentShader.parent.params.webgpu.locals.map((l) => {
			return ['_ext_uniform_local_' + l[0], l[1]] as UniformKeyValuePair;
		}),
		...fragmentShader.parent.params.webgpu.globals.map((g) => {
			return ['_ext_uniform_global_' + g[0], g[1].structure] as UniformKeyValuePair;
		})
	];

	let special: WebGPUSpecialUniform[] = [];
	let specialCounter = 2;
	let totalSize = 0;
	let lastFieldPadding = 0;

	for (let uniform of orderedUniforms) {
		let vt = uniform[1];
		if (vt.type == 'primitive' && (vt.name == 'texture2d' || vt.name == 'rwtexture2d')) {
			let texPayload = fragmentUniforms.uniforms.get(uniform[0]) as any;
			special.push({
				index: specialCounter,
				type: 'sampler2D',
				valueType: vt,
				value: {
					texture: texPayload.value
				},
				access: vt.access
			});
			specialCounter += 2;
			lastFieldPadding = 8;
			totalSize += 8 + lastFieldPadding; // Size
		} else if (vt.type == 'array') {
			if (vt.element.type == 'primitive' && vt.element.name == 'texture2d') {
				let texPayload = fragmentUniforms.uniforms.get(uniform[0]) as any;
				special.push({
					index: specialCounter,
					type: 'sampler2DArray',
					valueType: vt,
					value: {
						textures: texPayload.value
					},
					access: vt.element.access
				});
				specialCounter += 2;
				lastFieldPadding = 8;
				totalSize += 8 + lastFieldPadding; // Size
			} else {
				special.push({
					index: specialCounter,
					type: 'array',
					valueType: vt,
					value: generateArrayBuffer(vt, fragmentUniforms.uniforms.get(uniform[0]) as any)
				});
				specialCounter++;
				lastFieldPadding = 12;
				totalSize += 4 + lastFieldPadding; // Len
			}
		} else if (vt.type == 'buffer') {
			special.push({
				type: 'buffer',
				valueType: vt,
				access: vt.access,
				index: specialCounter,
				value: fragmentUniforms.uniforms.get(uniform[0])?.value as buffer_internal<any> as any
			});
			specialCounter++;
			lastFieldPadding = 12;
			totalSize += 4 + lastFieldPadding; // Len
		} else if (vt.type == 'primitive' && vt.name == 'atomic') {
			special.push({
				type: 'atomic',
				valueType: vt,
				index: specialCounter,
				value: fragmentUniforms.uniforms.get(uniform[0])?.value as any
			});
			specialCounter++;
			lastFieldPadding = 12;
			totalSize += 4 + lastFieldPadding; // Len
		} else {
			let vsize = getValueSize(vt);
			let extra = vsize % 16;
			if (vt.type == 'primitive') {
				lastFieldPadding = 16 - extra;
			} else {
				lastFieldPadding = 0;
			}

			totalSize += vsize + lastFieldPadding;
		}
	}

	if (totalSize == 0) {
		// Dummy data
		totalSize = 4 * 4;
	}

	let queue: [UniformKeyValuePair, any, number | null][] = [];
	let rootObj: { [key: string]: any } = {};
	for (let k of fragmentUniforms.uniforms.keys()) {
		rootObj[k] = fragmentUniforms.uniforms.get(k);
	}
	for (let uniform of orderedUniforms) {
		queue.unshift([uniform, rootObj, null]);
	}

	let data = new ArrayBuffer(totalSize);
	let offset = 0;

	writeBufferStructure(queue, rootObj, data, offset);

	return {
		size: totalSize,
		special,
		data
	};
}

function writeBufferStructure(
	initialQueue: [UniformKeyValuePair, any, number | null][],
	rootObj: { [key: string]: any },
	data: ArrayBuffer,
	offset: number
) {
	let floatView = new Float32Array(data);
	let uintView = new Uint32Array(data);
	let intView = new Int32Array(data);

	let queue: [UniformKeyValuePair, any, number | null][] = [...initialQueue];

	while (queue.length > 0) {
		let [uniform, obj, arrayIndex] = queue.pop() as [UniformKeyValuePair, any, number | null];
		let vt = uniform[1];
		let name = uniform[0];
		if (vt.type == 'primitive') {
			let n = vt.name;
			let s = TYPE_SIZES[n];
			if (s[0] == 0) {
				throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
			}
			let val;
			if (arrayIndex !== null) {
				val = obj[arrayIndex];
			} else {
				val = obj[name];
			}
			if (typeof val === 'undefined') {
				throw new Error(`Uniform ${name} is not defined`);
			}
			if (val instanceof UniformValue) {
				val = val.value;
			}
			let view: Float32Array | Uint32Array | Int32Array = floatView;
			if (n.startsWith('u')) {
				view = uintView;
			} else if (n.startsWith('i')) {
				view = intView;
			}
			if (n == 'float' || n == 'uint' || n == 'int') {
				if (typeof val == 'boolean') {
					val = val ? 1 : 0;
				}

				view[offset++] = val;
				offset += 3;
			} else if (n == 'float2' || n == 'uint2' || n == 'int2') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				offset += 2;
			} else if (n == 'float3' || n == 'uint3' || n == 'int3') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				view[offset++] = val[2];
				offset += 1;
			} else if (n == 'float4' || n == 'uint4' || n == 'int4') {
				view[offset++] = val[0];
				view[offset++] = val[1];
				view[offset++] = val[2];
				view[offset++] = val[3];
			} else if (n == 'float2x2') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[2];
					view[offset++] = val[1];
					view[offset++] = val[3];
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					view[offset++] = val[3];
				}
			} else if (n == 'float3x3') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[3];
					view[offset++] = val[6];
					offset++;
					view[offset++] = val[1];
					view[offset++] = val[4];
					view[offset++] = val[7];
					offset++;
					view[offset++] = val[2];
					view[offset++] = val[5];
					view[offset++] = val[8];
					offset++;
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					offset++;
					view[offset++] = val[3];
					view[offset++] = val[4];
					view[offset++] = val[5];
					offset++;
					view[offset++] = val[6];
					view[offset++] = val[7];
					view[offset++] = val[8];
					offset++;
				}
			} else if (n == 'float4x4') {
				// Column major order
				if (TRANSPOSE_MATRICES_UNIFORM) {
					view[offset++] = val[0];
					view[offset++] = val[4];
					view[offset++] = val[8];
					view[offset++] = val[12];
					view[offset++] = val[1];
					view[offset++] = val[5];
					view[offset++] = val[9];
					view[offset++] = val[13];
					view[offset++] = val[2];
					view[offset++] = val[6];
					view[offset++] = val[10];
					view[offset++] = val[14];
					view[offset++] = val[3];
					view[offset++] = val[7];
					view[offset++] = val[11];
					view[offset++] = val[15];
				} else {
					view[offset++] = val[0];
					view[offset++] = val[1];
					view[offset++] = val[2];
					view[offset++] = val[3];

					view[offset++] = val[4];
					view[offset++] = val[5];
					view[offset++] = val[6];
					view[offset++] = val[7];

					view[offset++] = val[8];
					view[offset++] = val[9];
					view[offset++] = val[10];
					view[offset++] = val[11];

					view[offset++] = val[12];
					view[offset++] = val[13];
					view[offset++] = val[14];
					view[offset++] = val[15];
				}
			} else if (n == 'bool') {
				intView[offset++] = val ? 1 : 0;
				offset += 3;
			} else if (n == 'rwtexture2d' || n == 'texture2d') {
				floatView[offset++] = val.size[0];
				floatView[offset++] = val.size[1];
				offset += 2;
			} else if (n == 'atomic') {
				if ((vt as any).element == 'uint') {
					uintView[offset++] = val;
				} else {
					intView[offset++] = val;
				}
				offset += 3;
			} else {
				throw new Error('Invalid param type ' + n);
			}
		} else if (vt.type == 'array') {
			let val = obj[name];
			if (val instanceof UniformValue) {
				val = val.value;
			}
			if (obj == rootObj) {
				if (typeof val === 'object' && Array.isArray(val)) {
					intView[offset++] = val.length;
					offset += 3;
				}
			} else {
				for (let i = val.length - 1; i >= 0; i--) {
					queue.push([['', vt.element], val, i]);
				}
			}
		} else if (vt.type == 'buffer') {
			let val = obj[name];
			if (val instanceof UniformValue) {
				val = val.value;
			}
			if (obj == rootObj) {
				if (typeof val === 'object') {
					intView[offset++] = val.elementCount;
					offset += 3;
				}
			}
		} else if (vt.type == 'struct') {
			let val;
			if (arrayIndex !== null) {
				val = obj[arrayIndex];
			} else {
				val = obj[name];
			}
			if (typeof val === 'object') {
				for (let i = vt.fields.length - 1; i >= 0; i--) {
					let member = vt.fields[i];
					if (val instanceof UniformValue) {
						queue.push([member, val.value, null]);
					} else {
						queue.push([member, val, null]);
					}
				}
			}
		}
	}
}

type DrawOptions = {
	depthFormat: GPUTextureFormat;
	depthOnly?: boolean;
	depthTest: boolean;
	attachments?: ShadeupTexture2d[];
	backfaceCulling: boolean;
	depthCompare: GPUCompareFunction;
};
function printImage(url: string, size = 10, afterRead?: () => void) {
	var image = new Image();
	image.onload = function () {
		var style = [
			'font-size: 1px;',
			'padding: ' + (this.height / 100) * size + 'px ' + (this.width / 100) * size + 'px;',
			'background: url(' + url + ') no-repeat;',
			'background-size: contain;'
		].join(' ');
		if (afterRead) {
			afterRead();
		}
		console.log('%c ', style);
	};
	image.src = url;
}
