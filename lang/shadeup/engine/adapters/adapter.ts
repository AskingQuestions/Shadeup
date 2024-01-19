import type { buffer } from 'src/shadeup/library/buffer';
import type { Mesh } from '../../../../../shadeup-frontend/lib/std/all';
import type { ShadeupTexture2d } from '../engine';
import type { ShadeupShaderInstance, ShadeupShaderSource } from '../shader';
import type { int } from 'src/shadeup/library/types';
import type { texture2d } from '../../library/texture';

export type ShaderType = 'vertex' | 'fragment' | 'compute' | 'vertex-indexed';
export type ShaderCodeMapping = {
	webgl: string;
	webgpu: string;
	software: () => void;
};
export type ShaderParamsMapping = {
	webgl: { [key: string]: UniformValueType };
	webgpu: {
		attributeInput: string;
		attributeOutput: string;
		globals: [string, { fileName: string; structure: UniformValueType }][];
		locals: UniformKeyValuePair[];
	};
};

export class GenericShader {
	uniqueSourceKey: string = '';
	code: string;
	type: ShaderType;
	payload: any;

	parent: ShadeupShaderSource | null = null;

	constructor(code: string, type: ShaderType) {
		this.code = code;
		this.type = type;
	}
}

export type UniformKeyValuePair = [string, UniformValueType];

export type PrimitiveVectorSizes = '' | '2' | '3' | '4';
export type PrimitiveUniformType =
	| `float${PrimitiveVectorSizes}`
	| `float2x2`
	| `float3x3`
	| `float4x4`
	| `int${PrimitiveVectorSizes}`
	| `uint${PrimitiveVectorSizes}`
	| 'bool';

export class UniformValue {
	valueType: UniformValueType;
	value: any;

	constructor(valueType: UniformValueType, value: any) {
		this.valueType = valueType;
		this.value = value;
	}
}

export type UniformValueType =
	| {
			type: 'array';
			element: UniformValueType;
			staticSize?: number;
	  }
	| {
			type: 'struct';
			fields: UniformKeyValuePair[];
			name: string;
	  }
	| {
			type: 'primitive';
			name: PrimitiveUniformType;
	  }
	| {
			type: 'primitive';
			name: 'texture2d' | 'rwtexture2d';
			element: UniformValueType;
			access: 'read' | 'write' | 'sample' | 'sample_write';
	  }
	| {
			type: 'primitive';
			name: 'atomic';
			element: UniformValueType;
	  }
	| {
			type: 'buffer';
			element: UniformValueType;
			access: 'read' | 'write';
	  };

export function makePrimitiveUniform(type: UniformValueType, value: any): UniformValue {
	return new UniformValue(type, value);
}

export class UniformPayload {
	uniforms: Map<string, UniformValue> = new Map();
}

export type ShaderTextureType =
	| `float${'' | '2' | '3' | '4'}`
	| `int${'' | '2' | '3' | '4'}`
	| `uint${'' | '2' | '3' | '4'}`
	| `uint8`;
export type ShaderBindingOptions = {
	attachments?: ShaderTextureType[];
	initialDispatch?: ShadeupShaderInstance;
};

export type ShaderDepthCompareMode =
	| 'greater'
	| 'less'
	| 'equal'
	| 'greater-equal'
	| 'less-equal'
	| 'not-equal'
	| 'always'
	| 'never';

export class ShaderDispatch {
	type: 'draw' | 'compute';
	drawType: 'indexed' | 'screen' | 'count' | 'geometry' = 'screen';
	vertexUniforms: UniformPayload;
	fragmentUniforms: UniformPayload;

	depthOnly: boolean = false;
	backfaceCulling: boolean = true;
	reverseZ: boolean = false;
	depthCompare: ShaderDepthCompareMode | 'auto' = 'auto';

	attachments: ShadeupTexture2d[] | null = null;

	vertexShader: GenericShader | null = null;
	fragmentShader: GenericShader | null = null;
	computeShader: GenericShader | null = null;

	geometry: Mesh | null = null;
	indexBuffer: buffer<int> | null = null;
	drawCount: number = 0;
	instanceCount: number = 1;

	indirectBuffer: buffer<int> | null = null;
	indirectOffset: number = 0;

	overrideDepth: ShadeupTexture2d | null = null;

	computeCount: [number, number, number] = [0, 0, 0];

	constructor(type: 'draw' | 'compute') {
		this.type = type;
		this.vertexUniforms = new UniformPayload();
		this.fragmentUniforms = new UniformPayload();
	}

	setVertexUniform(name: string, value: UniformValue) {
		this.vertexUniforms.uniforms.set(name, value);
	}

	setFragmentUniform(name: string, value: UniformValue) {
		this.fragmentUniforms.uniforms.set(name, value);
	}

	setVertexShader(shader: GenericShader) {
		this.vertexShader = shader;
	}

	setFragmentShader(shader: GenericShader) {
		this.fragmentShader = shader;
	}

	setComputeShader(shader: GenericShader) {
		this.computeShader = shader;
	}

	setGeometry(geometry: Mesh) {
		this.geometry = geometry;
	}

	setIndexBuffer(indexBuffer: buffer<int>) {
		this.indexBuffer = indexBuffer;
	}
}

export class GraphicsAdapter {
	canvas: HTMLCanvasElement | null;
	contextMode: 'paint' | 'draw' = 'draw';
	listeners: Map<string, any> = new Map();
	constructor(cnvs: HTMLCanvasElement | null) {
		this.canvas = cnvs;
	}

	clear(
		immediate: boolean = false,
		color: float | [number, number, number, number] | 'auto' = 'auto'
	) {}

	draw() {}

	init() {}

	addEventListener(name: string, callback: any) {
		let listeners = this.listeners.get(name);
		if (!listeners) {
			listeners = [];
			this.listeners.set(name, listeners);
		}
		listeners.push(callback);
	}

	removeEventListener(name: string, callback: any) {
		const listeners = this.listeners.get(name);
		if (!listeners) return;
		const index = listeners.indexOf(callback);
		if (index === -1) return;
		listeners.splice(index, 1);
	}

	triggerEvent(name: string, ...args: any[]) {
		const listeners = this.listeners.get(name);
		if (!listeners) return;
		for (const listener of listeners) {
			listener(...args);
		}
	}

	dispatch(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		this.activateDrawContext();
	}

	activateDrawContext() {
		if (this.contextMode === 'paint') {
			this.switchContext('draw');
		}
	}

	activatePaintContext() {
		if (this.contextMode === 'draw') {
			this.switchContext('paint');
			this.flush();
		}
	}

	switchContext(mode: 'paint' | 'draw') {
		this.contextMode = mode;
		this.triggerEvent('context', mode);
	}

	drawImage(image: HTMLCanvasElement, x: number, y: number, width: number, height: number) {}

	async downloadImage(): Promise<Uint32Array | Int32Array | Float32Array | Uint8Array> {
		return new Float32Array(0);
	}
	uploadImage(
		data: Uint32Array | Uint16Array | Int16Array | Int32Array | Float32Array | Uint8Array
	) {}

	setViewport(width: number, height: number) {}

	getOrCreateShader(
		instance: ShadeupShaderInstance,
		type: ShaderType,
		config?: ShaderBindingOptions
	): GenericShader {
		return new GenericShader('', 'vertex');
	}

	createShader(code: ShaderCodeMapping, type: ShaderType): GenericShader {
		return new GenericShader('', 'vertex');
	}

	unbindTexture(texture: ShadeupTexture2d) {}

	dispose() {}

	flush() {
		this.triggerEvent('flush');
	}

	waitForDraw(): Promise<void> {
		return Promise.resolve();
	}
}
