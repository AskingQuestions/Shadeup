import type { IndexMapping } from '../../../../shadeup-frontend/lib/generator/root';
import type { ShadeupRenderedFile } from '../compiler/common';
import { globalDefine, globalRequire } from './amd';
import { initInput, normalizeWheel, type MouseState } from './input/input';
import { keyboardKeys } from './input/keyboardKeys';
import { ShadeupShaderInstance, ShadeupShaderSource } from './shader';
import { initUI } from './ui/ui';
import { parse_type, stringify_type, translateIdentifier, translateNumericToGLSL } from './util';

import { PaintingContext } from '../library/paint';
import type { Mesh } from '../../../../shadeup-frontend/lib/std/all';
import type { atomic } from '../../../../shadeup-frontend/lib/std/math';
import { WebGLAdapter } from './adapters/webgl';
import { WebGPUAdapter } from './adapters/webgpu';
import {
	ShaderDispatch,
	type ShaderCodeMapping,
	type ShaderType,
	makePrimitiveUniform,
	GraphicsAdapter,
	GenericShader,
	type UniformKeyValuePair,
	type UniformValueType,
	type ShaderParamsMapping
} from './adapters/adapter';
import type { buffer } from '../library/buffer';
import type { uint } from '../library/types';
import type { RenderOptions } from 'src/routes/(app)/farm/render/farm';
import type { AssetFileType } from '../../components/common/Asset';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import './setZero';
import type { TextureFormat, texture2d } from '../library/texture';

console.log('Engine loaded');

let registeredLibs = new Set<string>();

function __shadeup_register_libs(libs: string[]) {
	console.log('Registering libs', libs);
	for (let lib of libs) {
		registeredLibs.add(lib);
	}
}

(window as any).__shadeup_register_libs = __shadeup_register_libs;

let fpsCanvas = document.getElementById('fps') as HTMLCanvasElement;
let fpsCtx = fpsCanvas.getContext('2d');
fpsCtx.font = 12 * window.devicePixelRatio + 'px monospace';
if (fpsCanvas) fpsCanvas.style.display = 'none';
let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
let container = document.querySelector('.render-container');

if (!container) throw new Error('container not found');

let preferredAdapter = document.body.dataset.renderingMode ?? 'webgl';

if (navigator.gpu) {
	(window as any).shadeupWebGPUAdapter = await navigator.gpu.requestAdapter({
		powerPreference: 'high-performance'
	});
	if (!(window as any).shadeupWebGPUAdapter) {
		throw new Error('WebGPU not supported');
	}
	console.log(
		'Using WebGPU adapter',
		await (window as any).shadeupWebGPUAdapter.requestAdapterInfo()
	);
	let supported = await (window as any).shadeupWebGPUAdapter.limits;
	let requiredLimits = {
		maxStorageBufferBindingSize: Math.min(
			1024 * 1024 * 1024,
			supported.maxStorageBufferBindingSize
		), // 1GB
		maxBufferSize: Math.min(1024 * 1024 * 1024, supported.maxBufferSize), // 1GB
		maxColorAttachmentBytesPerSample: Math.min(64, supported.maxColorAttachmentBytesPerSample), // 64 bytes
		maxComputeWorkgroupSizeX: Math.min(1024, supported.maxComputeWorkgroupSizeX),
		maxComputeWorkgroupSizeY: Math.min(1024, supported.maxComputeWorkgroupSizeY),
		maxComputeWorkgroupSizeZ: Math.min(64, supported.maxComputeWorkgroupSizeZ),
		maxComputeInvocationsPerWorkgroup: Math.min(1024, supported.maxComputeInvocationsPerWorkgroup)
	};
	console.log('WebGPU limits', requiredLimits);
	(window as any).shadeupWebGPUDevice = await (window as any).shadeupWebGPUAdapter.requestDevice({
		// requiredLimits: (window as any).shadeupWebGPUAdapter.limits
		requiredLimits
	});
	(window as any).shadeupWebGPUDevice.addEventListener('uncapturederror', (e) => {
		console.error('Uncaught WebGPU', e);
		(window as any).bubbleError((e as GPUUncapturedErrorEvent).error.message);
	});
}

let graphicsAdapter: GraphicsAdapter;

window.onerror = (e) => {
	console.error(e);
	(window as any).bubbleError(e.toString());
};

if (preferredAdapter == 'webgl') {
	graphicsAdapter = new WebGLAdapter(canvas);
} else if (preferredAdapter == 'webgpu') {
	graphicsAdapter = new WebGPUAdapter(canvas);
} else {
	throw new Error('No adapter found');
}
const blank = document.createElement('canvas');

blank.width = canvas.width;
blank.height = canvas.height;

function sizeCanvas() {
	let targetWidth = Math.floor(container.clientWidth * window.devicePixelRatio);
	let targetHeight = Math.floor(container.clientHeight * window.devicePixelRatio);

	if (canvas.width != targetWidth || canvas.height != targetHeight) {
		canvas.width = targetWidth;
		canvas.height = targetHeight;
		blank.width = canvas.width;
		blank.height = canvas.height;
		if (graphicsAdapter) graphicsAdapter.setViewport(canvas.width, canvas.height);
	}
	if ((window as any).env && (window as any).env.camera) {
		(window as any).env.camera.width = canvas.width;
		(window as any).env.camera.height = canvas.height;
	}
	let targetFpsWidth = Math.floor(96 * window.devicePixelRatio);
	let targetFpsHeight = Math.floor(20 * window.devicePixelRatio);
	if (fpsCanvas.width != targetFpsWidth || fpsCanvas.height != targetFpsHeight) {
		fpsCanvas.width = targetFpsWidth;
		fpsCanvas.height = targetFpsHeight;
		fpsCanvas.style.width = '96px';
		fpsCanvas.style.height = '20px';
	}

	if ((window as any)['paint']) {
		let offscreen = (window as any)['paint'].__offscreen_canvas;
		if (offscreen.width != canvas.width || offscreen.height != canvas.height) {
			offscreen.width = canvas.width;
			offscreen.height = canvas.height;
		}
	}
}

try {
	graphicsAdapter.init();

	sizeCanvas();

	(window as any)['paint'] = new PaintingContext(canvas, graphicsAdapter as any);
} catch (e) {
	console.error(e);
	if (preferredAdapter == 'webgpu') {
		console.log('Failed to initialize WebGPU, falling back to WebGL');
		preferredAdapter = 'webgl';
		rebuildAdapter();
		graphicsAdapter.init();
		(window as any)['paint'] = new PaintingContext(canvas, graphicsAdapter as any);
	}
}

function rebuildAdapter() {
	console.log('Rebuilding adapter');
	let newCanvas = document.createElement('canvas');
	newCanvas.width = canvas.width;
	newCanvas.height = canvas.height;
	newCanvas.style.maxWidth = canvas.style.maxWidth;
	newCanvas.style.borderRadius = canvas.style.borderRadius;

	container?.appendChild(newCanvas);
	canvas.remove();
	canvas = newCanvas;

	graphicsAdapter.dispose();
	if (preferredAdapter == 'webgl') {
		graphicsAdapter = new WebGLAdapter(canvas);
	} else if (preferredAdapter == 'webgpu') {
		graphicsAdapter = new WebGPUAdapter(canvas);
	}
}

(window as any).shadeupGetGraphicsAdapter = () => graphicsAdapter;

let inputValues = new Map<string, any>();

let lastFrame = performance.now();
let frameCount = 0;
let timeCounter = 0;
let errCount = 0;

let screenshotQueue: RenderOptions[] = [];
let screenshotQueueResults: { options: RenderOptions; image: string }[] = [];

let keyboardSink = new Map();
let lastFrameMousePosition = [0, 0];
let mouseState: MouseState = {
	button: [false, false, false],
	clicked: [false, false, false],
	screen: [0, 0],
	uv: [0, 0],
	startScreen: [0, 0],
	startUv: [0, 0],
	deltaUv: [0, 0],
	frameDeltaUv: [0, 0],
	deltaScreen: [0, 0],
	frameDeltaScreen: [0, 0],
	dragging: false,
	velocity: 0,
	wheel: 0,
	focused: false
};

let { getKeyboardState } = initInput(canvas, mouseState, keyboardSink);

let { frame: uiFrame, puck, slider, preFrame: uiPreFrame, controls } = initUI(canvas);

function resetFrameContext() {
	lastFrame = performance.now();
	timeCounter = 0;
	frameCount = 0;
	errCount = 0;
	cameraRotX = 0;
	cameraRotY = 0;

	if ((window as any).env.camera) {
		let cam = (window as any).env.camera;
		cam.position = [0, 0, 0];
		cam.rotation = [1, 0, 0, 0];
		cam.width = canvas.width;
		cam.height = canvas.height;
		cam.fov = 90;
		cam.near = 1;
		cam.far = 100000;

		let cam2d = (window as any).env.camera2d;
		cam2d.position = [0, 0];
		cam2d.zoom = 1;

		cameraConfig = { ...defaultCameraConfig };
		targetOrbitDistance = cameraConfig.orbitDistance;
	}
}

let cameraConfig = {
	mode: 'orbit-free',

	spinning: false,

	initialPosition: [0, 0, 0],
	initialPitch: 0,
	initialYaw: 0,

	speed: 10,

	orbitTarget: [0, 0, 0],
	orbitDistance: 650,
	orbitPitch: Math.PI / 6,
	orbitYaw: Math.PI / 4,
	orbitMinDistance: 0,
	orbitMaxDistance: 100000,
	orbitMinPitch: -Math.PI / 2,
	orbitMaxPitch: Math.PI / 2 - 0.001
};

let defaultCameraConfig = { ...cameraConfig };

function updateFrameContext() {
	let delta = performance.now() - lastFrame;
	lastFrame = performance.now();
	timeCounter += (delta / 1000) * timeMultiplier;
	frameCount += 1 * timeMultiplier;

	let lastFramePos = lastFrameMousePosition;

	mouseState.frameDeltaScreen = [
		mouseState.screen[0] - lastFramePos[0],
		mouseState.screen[1] - lastFramePos[1]
	];
	let lastFramePosUv = [lastFramePos[0] / canvas.width, lastFramePos[1] / canvas.height];
	mouseState.frameDeltaUv = [
		mouseState.uv[0] - lastFramePosUv[0],
		mouseState.uv[1] - lastFramePosUv[1]
	];

	mouseState.velocity = Math.sqrt(
		mouseState.frameDeltaScreen[0] ** 2 + mouseState.frameDeltaScreen[1] ** 2
	);

	lastFrameMousePosition = [...mouseState.screen];

	window.env = {
		camera:
			(window as any)?.env?.camera ??
			((window as any)._makeCamera ? new (window as any)._makeCamera({}) : null),
		camera2d:
			(window as any)?.env?.camera2d ??
			((window as any)._makeCamera2d ? new (window as any)._makeCamera2d({}) : null),
		deltaTime: (delta / 1000) * timeMultiplier,
		time: timeCounter,
		frame: frameCount,
		screenSize: [canvas.width, canvas.height],
		keyboard: getKeyboardState(),
		mouse: {
			...mouseState
		},
		configureCamera(options: {
			mode?: 'free' | 'orbit' | 'orbit-free';

			spinning?: boolean;

			initialPosition?: [number, number, number];
			initialPitch?: float;
			initialYaw?: float;

			speed?: float;

			orbitTarget?: [number, number, number];
			orbitDistance?: float;
			orbitPitch?: float;
			orbitYaw?: float;
			orbitMinDistance?: float;
			orbitMaxDistance?: float;
			orbitMinPitch?: float;
			orbitMaxPitch?: float;
		}) {
			cameraConfig = { ...cameraConfig, ...options };
			targetOrbitDistance = cameraConfig.orbitDistance;
		},
		input<T>(key: string, defaultValue: T): T {
			return inputValues.get(key) ?? defaultValue;
		},
		output<T>(key: string, value: T) {
			window.parent.postMessage({ type: 'output', key, value }, '*');
		}
	};

	sizeCanvas();
}

function clear() {
	try {
		graphicsAdapter.clear();
	} catch (e) {
		console.error(e);
	}
}

(window as any).flushAdapter = async () => {
	await graphicsAdapter.flush();
};

window.addEventListener('resize', sizeCanvas);
setTimeout(() => {
	sizeCanvas();
}, 1000);

let playing = true;
let timeMultiplier = 1;
let useAnimationFrame = true;

let now = performance.now();
let gatherSpeed = 1;
let fpsHistogram = new Array(fpsCanvas.width).fill(0);
let fpsHistogramIndex = 0;
let lastFps = 0;
let fps = 0;
let minFps = Infinity;
let maxFps = -Infinity;
let counter = 0;
let isFirstFrame = true;
let hasLoadedCode = false;
let frameFunc = () => {};
let initFunc = () => {};

let localLerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
async function frameLoop() {
	try {
		if (movementFrame) movementFrame();
	} catch (e) {
		console.error(e);
	}

	if (playing) {
		for (let i = screenshotQueue.length - 1; i >= 0; i--) {
			let item = screenshotQueue[i];
			let doCapture = false;
			if ('frame' in item) {
				if (item.frame <= frameCount - 1 || (timeMultiplier != 1 && frameCount - 1 > item.frame!)) {
					doCapture = true;
				}
			}

			if ('time' in item) {
				if (timeCounter >= item.time!) {
					doCapture = true;
				}
			}

			console.log('Checking screenshot', item, doCapture);

			if (doCapture) {
				// Wait for all commands to finish

				// Wait an extra event tick for the paint to finish
				performance.mark('start capture');

				performance.mark('wait cap');
				if (canvas) {
					let cacheScreenshotItem = screenshotQueue[i];
					screenshotQueue.splice(i, 1);

					performance.mark('start to url');
					// debugger;
					let data = canvas.toDataURL('image/png');

					let ctx = blank.getContext('2d');
					ctx?.drawImage(canvas, 0, 0);
					let blankData = ctx?.getImageData(0, 0, blank.width, blank.height);
					if (cacheScreenshotItem.$tries && cacheScreenshotItem.$tries > 100 && blankData) {
						blankData.data[0] = 1;
					}

					if (!blankData?.data.some((v) => v != 0)) {
						console.log('Blank screenshot, retrying', screenshotQueue);
						if (!cacheScreenshotItem.$tries) cacheScreenshotItem.$tries = 0;
						cacheScreenshotItem.$tries++;
						screenshotQueue.push(cacheScreenshotItem);
					} else {
						performance.mark('end to url');
						console.log('Screenshot captured, sending to parent');

						screenshotQueueResults.push({
							options: item,
							image: data
						});
					}
				}
			}
		}

		updateFrameContext();
		uiPreFrame();

		fps++;
		let then = now;
		now = performance.now();
		let dt = now - then;
		counter += dt;
		let smoothness = 0.2;
		if (counter >= 1000) {
			counter -= 1000;

			if (lastFps <= 1) {
				lastFps = 1 / env.deltaTime;
			}
			lastFps = Math.round(lastFps * smoothness + fps * (1 - smoothness));
			fps = 0;
		}
		if (fps >= Infinity) {
			fps = lastFps;
		}

		maxFps = localLerp(maxFps, lastFps, 0.1);
		minFps = localLerp(minFps, lastFps, 0.1);

		if (fps < minFps) minFps = lastFps;
		if (fps > maxFps) maxFps = lastFps;

		if (counter > 50) {
			fpsHistogram[fpsHistogramIndex] = 1000 / dt;
			fpsHistogramIndex = (fpsHistogramIndex + 1) % fpsHistogram.length;
		}

		// Draw fps histogram and value
		// fpsCtx.clearColor = 'transparent';
		let width = 96 * window.devicePixelRatio;
		let histwidth = 64 * window.devicePixelRatio;
		let textwidth = 32 * window.devicePixelRatio;
		let height = 20 * window.devicePixelRatio;
		fpsCtx.clearRect(0, 0, width, height);
		fpsCtx.fillStyle = 'white';

		fpsCtx?.beginPath();

		if (true) {
			for (let j = 0; j < fpsHistogram.length; j++) {
				let rev = fpsHistogramIndex - j;

				let i = rev < 0 ? fpsHistogram.length + rev : rev;
				let x = (1 - j / fpsHistogram.length) * histwidth;
				let drawHeight = 12 * window.devicePixelRatio;

				let fpsPercent = Math.min(1, fpsHistogram[i] / maxFps);

				let top = height - drawHeight * fpsPercent;

				if (isNaN(top)) {
					top = height;
				}
				if (isNaN(x)) {
					x = 0;
				}
				if (j == 0) {
					fpsCtx?.moveTo(textwidth + x, top);
				}
				// fpsCtx.fillRect(textwidth + x, top, (histwidth / fpsHistogram.length) * 2, bottom - top);
				fpsCtx.lineTo(textwidth + x, top);
			}

			fpsCtx.lineTo(textwidth, height);
			fpsCtx.lineTo(width, height);

			fpsCtx.fill();
		}

		fpsCtx.fillStyle = 'white';
		let fontStyle = 12 * window.devicePixelRatio + 'px monospace';
		if (fpsCtx.font != fontStyle) {
			fpsCtx.font = fontStyle;
		}
		// fpsCtx.font = 12 * window.devicePixelRatio + 'px monospace';
		fpsCtx.fillText(lastFps, 0, 18 * window.devicePixelRatio);
		fpsCtx.lineWidth = 1;
		// fpsCtx.strokeStyle = 'black';
		// fpsCtx.strokeText(lastFps, 0, 24);

		try {
			let now = performance.now();
			if (graphicsAdapter instanceof WebGPUAdapter) {
				// We let the adapter clear just before the first draw call to the screen
			} else {
				clear();
			}
			// performance.mark('frameStart');

			await frameFunc();

			paint.flush();
			graphicsAdapter.flush();
			if (graphicsAdapter instanceof WebGPUAdapter) {
				graphicsAdapter.trace('endFrame\n\n', {});
			}
			graphicsAdapter.switchContext('draw');

			// performance.mark('frameEnd');

			for (let tex of textureDestroyQueue) {
				if (tex.adapter) {
					tex.adapter.dispose();
				}
			}

			textureDestroyQueue = [];
		} catch (e) {
			if (errCount < 10) {
				console.error(e);
				if ((window as any).bubbleError) (window as any).bubbleError(e.toString() + e.stack);
				errCount++;
				if (errCount === 10) {
					console.warn('Too many errors, slowing logs');
				}
			} else {
				errCount++;
				if (errCount % 100 === 0) {
					if ((window as any).bubbleError) (window as any).bubbleError(e.toString() + e.stack);
					console.error(e);
				}
			}
		}

		uiFrame();

		mouseState.clicked[0] = false;
		mouseState.clicked[1] = false;
		mouseState.clicked[2] = false;

		for (let statKey of stats.keys()) {
			if ((statsMark.get(statKey) ?? 0) <= 0) {
				stats.get(statKey)?.remove();
				stats.delete(statKey);
				statsMark.delete(statKey);
			} else {
				statsMark.set(statKey, statsMark.get(statKey)! - 1);
			}
		}

		for (let statKey of statsGraph.keys()) {
			if ((statsGraphMark.get(statKey) ?? 0) <= 0) {
				statsGraph.get(statKey)?.graph.parentElement?.remove();
				statsGraph.delete(statKey);
				statsGraphMark.delete(statKey);
			} else {
				statsGraphMark.set(statKey, statsGraphMark.get(statKey)! - 1);
			}
		}

		if (screenshotQueue.length == 0 && screenshotQueueResults.length > 0) {
			console.log('Posting screenshot results');
			window.parent.postMessage({ type: 'screenshot-results', data: screenshotQueueResults }, '*');
			screenshotQueueResults = [];
		}

		if (isFirstFrame && hasLoadedCode) {
			isFirstFrame = false;
			(async () => {
				await graphicsAdapter.waitForDraw();
				window.parent.postMessage({ type: 'firstFrame' }, '*');
			})();
		}
	}
}

// frameLoop();

function __shadeup_gen_native_shader(code: ShaderCodeMapping, type: ShaderType) {
	return graphicsAdapter.createShader(code, type);
}

(window as any).__shadeup_gen_native_shader = __shadeup_gen_native_shader;

let registeredShaders = new Map<string, ShadeupShaderSource>();

function __shadeup_gen_shader(
	key: string,
	params: ShaderParamsMapping,
	code: ShaderCodeMapping,
	indexMapping: IndexMapping
) {
	registeredShaders.set(key, new ShadeupShaderSource(params, code, indexMapping));
}

(window as any).__shadeup_gen_shader = __shadeup_gen_shader;

function __shadeup_make_shader_inst(
	key: string,
	params: { [key: string]: string },
	closure: Function
) {
	let shader = registeredShaders.get(key);
	if (!shader) {
		throw new Error('Shader not found');
	}

	return shader.instance(params);
}

(window as any).__shadeup_make_shader_inst = __shadeup_make_shader_inst;

let fullscreenVertexShader: GenericShader | null = null;

export type TextureComponentType = `${'float' | 'int' | 'uint'}${'' | '2' | '3' | '4'}` | 'uint8';

export class ShadeupTexture3d {
	size: [number, number, number] = [0, 0, 0];
	width: number = 0;
	height: number = 0;
	depth: number = 0;

	adapter: GraphicsAdapter | null = null;
	innerType: TextureComponentType = 'float4';

	isBound = false;
	boundUnit = -1;

	dirty = true;

	payload: any;

	constructor() {}

	/** @shadeup=glsl(!texture($self$, $0$)) */
	__index(index: [number, number, number]): number[] {
		return [0, 0, 0, 0];
		// return (window as any).__shadeup_texture2d_index(this, index);
	}

	__index_assign(index: [number, number, number], value: number[]) {
		// (window as any).__shadeup_texture2d_index_assign(this, index, value);
	}
}

let textureDestroyQueue: ShadeupTexture2d[] = [];

let shadeupTextureCounter = 0;

export class ShadeupTexture2d {
	symbol: string;
	image: HTMLCanvasElement | null = null;
	loading: boolean = true;
	size: [number, number] = [0, 0];
	width: number = 0;
	height: number = 0;
	paint: PaintingContext | null = null;
	adapter: GraphicsAdapter | null = null;

	innerType: TextureComponentType = 'float4';

	isBound = false;
	boundUnit = -1;

	dirty = true;
	cpuReadDirty = true;
	cpuWriteDirty = false;
	cpuData: Uint8Array | Uint32Array | Int32Array | Float32Array | null = null;
	dataIndexStride = 4;
	version = 0;

	payload: any;

	data: ArrayBuffer | null = null;

	constructor() {
		this.symbol = `stx${shadeupTextureCounter++}`;
	}

	destroy() {
		textureDestroyQueue.push(this);
	}

	async download() {
		if (!this.adapter) return;

		if (this.adapter instanceof WebGPUAdapter) {
			if (this.adapter.pendingWrites > 0) {
				graphicsAdapter.flush();
			}
			if (this.adapter.storageDirty) {
				this.cpuReadDirty = true;
			}
		}
		if (this.cpuReadDirty) {
			if (this.dirty) {
				this.flush();
			}

			this.cpuReadDirty = false;

			this.cpuData = await this.adapter.downloadImage();
		}
	}

	getData(): Uint32Array | Float32Array | Uint8Array | Int32Array {
		return this.cpuData!;
	}

	downloadAsync(): Promise<void> {
		return this.download();
	}

	/** @shadeup=glsl(!texture($self$, $0$)) */
	__index(index: [number, number]): number[] | number {
		// if (this.cpuReadDirty) {
		// 	await this.download();
		// }

		if (!this.cpuData) return [0, 0, 0, 0];

		return this.getFast(index);
	}

	getFast: any;
	setFast: any;

	init() {
		this.dataIndexStride = parseInt(this.innerType[this.innerType.length - 1] as any) || 1;
		if (this.innerType == 'uint8') {
			this.dataIndexStride = 4;
		}
		let width = this.size[0];

		if (this.innerType == 'uint8') {
			this.getFast = (index: [number, number]) => {
				let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
				return [
					this.cpuData![i] / 255,
					this.cpuData![i + 1] / 255,
					this.cpuData![i + 2] / 255,
					this.cpuData![i + 3] / 255
				];
			};
		} else {
			if (this.dataIndexStride == 4) {
				this.getFast = (index: [number, number]) => {
					let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
					return [
						this.cpuData![i],
						this.cpuData![i + 1],
						this.cpuData![i + 2],
						this.cpuData![i + 3]
					];
				};
			} else if (this.dataIndexStride == 3) {
				this.getFast = (index: [number, number]) => {
					let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
					return [this.cpuData![i], this.cpuData![i + 1], this.cpuData![i + 2]];
				};
			} else if (this.dataIndexStride == 2) {
				this.getFast = (index: [number, number]) => {
					let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
					return [this.cpuData![i], this.cpuData![i + 1]];
				};
			} else if (this.dataIndexStride == 1) {
				this.getFast = (index: [number, number]) => {
					let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
					return this.cpuData![i];
				};
			}
		}

		if (this.dataIndexStride == 1) {
			this.setFast = (index: [number, number], val: any) => {
				let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
				this.cpuWriteDirty = true;
				this.cpuData![i] = val;
			};
		} else {
			if (this.innerType == 'uint8') {
				this.setFast = (index: [number, number], value: any) => {
					let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
					this.cpuWriteDirty = true;
					this.cpuData![i] = value[2] * 255;
					this.cpuData![i + 1] = value[1] * 255;
					this.cpuData![i + 2] = value[0] * 255;
					this.cpuData![i + 3] = value[3] * 255;
				};
			} else {
				if (this.dataIndexStride == 4) {
					this.setFast = (index: [number, number], value: any) => {
						let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
						this.cpuWriteDirty = true;
						this.cpuData![i] = value[0];
						this.cpuData![i + 1] = value[1];
						this.cpuData![i + 2] = value[2];
						this.cpuData![i + 3] = value[3];
					};
				} else if (this.dataIndexStride == 3) {
					this.setFast = (index: [number, number], value: any) => {
						let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
						this.cpuWriteDirty = true;
						this.cpuData![i] = value[0];
						this.cpuData![i + 1] = value[1];
						this.cpuData![i + 2] = value[2];
					};
				} else if (this.dataIndexStride == 2) {
					this.setFast = (index: [number, number], value: any) => {
						let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
						this.cpuWriteDirty = true;
						this.cpuData![i] = value[0];

						this.cpuData![i + 1] = value[1];
					};
				}
			}
		}
	}

	__index_assign(index: [number, number], value: number[] | number) {
		// if (this.cpuReadDirty) {
		// 	await this.download();
		// }

		if (!this.cpuData) this.fillCpuData();

		this.setFast(index, value);
	}

	fillCpuData() {
		let arr;
		let components = this.dataIndexStride;
		if (this.innerType.startsWith('float')) {
			arr = new Float32Array(this.width * this.height * this.dataIndexStride);
		} else if (this.innerType.startsWith('int')) {
			arr = new Int32Array(this.width * this.height * this.dataIndexStride);
		} else if (this.innerType.startsWith('uint')) {
			arr = new Uint32Array(this.width * this.height * this.dataIndexStride);
		} else if (this.innerType == 'uint8') {
			arr = new Uint8Array(this.width * this.height * this.dataIndexStride);
		} else {
			throw new Error('Unknown texture type ' + this.innerType);
		}

		this.cpuData = arr;
	}

	sample(pos: [number, number]): number[] {
		return [0, 0, 0, 0];
	}

	cpuFlush() {
		if (this.cpuData && this.cpuWriteDirty && this.adapter) {
			this.adapter.uploadImage(this.cpuData);
		}
	}
	upload() {
		this.cpuFlush();
	}

	flush(flushStorage = true) {
		this.cpuFlush();

		if (flushStorage) {
			if (this.adapter instanceof WebGPUAdapter) {
				if (this.adapter.storageDirty) {
					this.adapter.flushStorage();
					this.cpuReadDirty = true;
				}
			}
		}

		if (this.dirty) {
			this.dirty = false;
			if (this.adapter?.contextMode == 'draw') {
				this.adapter?.flush();
			} else {
				this.paint?.flush();
			}
		}
	}

	drawAdvanced(config: {
		fragment: ShadeupShaderInstance;
		vertex: ShadeupShaderInstance;
		mesh?: Mesh;
		instances?: number;
		indirect?: buffer<uint> | buffer<atomic<uint>>;
		indirectOffset?: int | uint;
		indexBuffer?: buffer<uint>;
		attachments: ShadeupTexture2d[];
		depthTest?: boolean;
		depthOnly?: boolean;
		depth?: ShadeupTexture2d;
		depthCompare?:
			| 'greater'
			| 'less'
			| 'equal'
			| 'greater-equal'
			| 'less-equal'
			| 'not-equal'
			| 'always'
			| 'never';
		backfaceCulling?: boolean;
	}) {
		if (!this.adapter) return;
		let drawCall = new ShaderDispatch('draw');
		if (config.mesh) {
			drawCall.drawType = 'geometry';
		} else if (config.indexBuffer) {
			drawCall.drawType = 'indexed';
		}

		if (config.depth) {
			drawCall.overrideDepth = config.depth;
		}

		if (config.indirect) {
			drawCall.indirectBuffer = config.indirect;
		}

		if (config.depthCompare) {
			drawCall.depthCompare = config.depthCompare;
		}

		if ('backfaceCulling' in config) {
			drawCall.backfaceCulling = config.backfaceCulling!;
		}

		if ('indirectOffset' in config) {
			drawCall.indirectOffset = config.indirectOffset!;
		}

		drawCall.instanceCount = config.instances ?? 1;

		drawCall.attachments = config.attachments ?? null;
		drawCall.depthOnly = config.depthOnly ?? false;

		let fragShader = config.fragment.get(this.adapter, 'fragment', {
			attachments: config.attachments ? config.attachments.map((a) => a.innerType) : undefined
		});
		if (!fragShader) {
			throw new Error('Fragment shader not found');
		}

		drawCall.setFragmentShader(fragShader);

		let vertShader = config.vertex.get(this.adapter, 'vertex');

		if (!vertShader) {
			throw new Error('Vertex shader not found');
		}

		drawCall.setVertexShader(vertShader);

		config.fragment.bindUniforms(drawCall.fragmentUniforms);

		config.vertex.bindUniforms(drawCall.vertexUniforms);

		if (config.mesh) {
			drawCall.setGeometry(config.mesh as any);
		} else if (config.indexBuffer) {
			drawCall.setIndexBuffer(config.indexBuffer);
		}

		this.adapter.dispatch(drawCall, {
			depthTest: config.depthTest ?? true
		});
	}

	draw(geometry: Mesh | any, vertexShader: shader<any, any>, pixelShader: shader<any, any>): void;
	draw(fullScreenPixelShader: shader<any, any>): void;
	draw(first: Mesh | any | shader<any, any>, second?: shader<any, any>, third?: shader<any, any>) {
		this.cpuFlush();

		this.dirty = true;
		this.cpuReadDirty = true;
		this.version++;
		if ('vertices' in first && second && third) {
			this._draw_geometry(first, second as any, third as any);
		} else if (first && !second && !third) {
			this._draw_fullscreen(first as any);
		}
	}
	fullscreenVertexShaderInternal: GenericShader | null = null;
	_draw_fullscreen(pixelShaderInst: ShadeupShaderInstance) {
		if (!this.adapter) return;

		if (!this.fullscreenVertexShaderInternal) {
			this.fullscreenVertexShaderInternal = this.adapter.createShader(
				{
					webgl: `#version 300 es
			
			precision highp float;
			
			in vec3 a_position;
			in vec3 a_normal;
			in vec3 a_tangent;
			in vec3 a_bitangent;
			in vec2 a_uv;
			in vec4 a_color;
	
			out vec3 _v_position;
			out vec3 _v_normal;
			out vec3 _v_tangent;
			out vec3 _v_bitangent;
			out vec2 _v_uv;
			out vec4 _v_color;
			
			void main(void) {
			float x = float((gl_VertexID & 1) << 2);
			float y = float((gl_VertexID & 2) << 1);
			_v_uv.x = x * 0.5;
			_v_uv.y = 1.f - (y * 0.5);
			gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
			}`,
					webgpu: `
				struct VertexOutput {
					@builtin(position) Position : vec4<f32>,
					@location(0) Normal : vec3<f32>,
					@location(1) Tangent : vec3<f32>,
					@location(2) Bitangent : vec3<f32>,
					@location(3) TexCoord : vec2<f32>,
					@location(4) Color : vec4<f32>,
					@location(5) @interpolate(flat) instanceIndex : u32,
					@location(6) worldPosition: vec3<f32>,
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
					output.Tangent = vec3<f32>(0.0, 1.0, 0.0);
					output.Bitangent = vec3<f32>(0.0, 0.0, 1.0);
					output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
					output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
					output.instanceIndex = 0;
			
					return output;
				}
				`,
					software: () => {}
				},
				'vertex'
			);
		}

		if (!this.fullscreenVertexShaderInternal) {
			throw new Error('Fullscreen vertex shader not found');
		}

		let drawCall = new ShaderDispatch('draw');
		drawCall.drawType = 'screen';
		drawCall.setVertexUniform(
			'_vtex_canvas',
			makePrimitiveUniform(
				{
					type: 'primitive',
					name: 'float2'
				},
				[this.size[0], this.size[1]]
			)
		);

		drawCall.setVertexShader(this.fullscreenVertexShaderInternal);
		let fragShader = pixelShaderInst.get(this.adapter, 'fragment');
		if (!fragShader) {
			throw new Error('Fragment shader not found');
		}

		drawCall.setFragmentShader(fragShader);

		pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

		if (!this.$geo) {
			this.$geo = makeFullscreenQuadGeometry();
		}

		drawCall.setGeometry(this.$geo);

		this.adapter.dispatch(drawCall, {
			depthTest: false
		});
	}

	_draw_geometry(
		geometry: Geometry,
		vertexShaderInst: ShadeupShaderInstance,
		pixelShaderInst: ShadeupShaderInstance
	) {
		this.dirty = true;
		this.cpuReadDirty = true;
		this.cpuFlush();
		this.version++;
		if (!this.adapter) return;
		let drawCall = new ShaderDispatch('draw');
		drawCall.drawType = 'geometry';
		drawCall.setVertexUniform(
			'_vtex_canvas',
			makePrimitiveUniform(
				{
					type: 'primitive',
					name: 'float2'
				},
				[this.size[0], this.size[1]]
			)
		);

		let fragShader = pixelShaderInst.get(this.adapter, 'fragment');
		if (!fragShader) {
			return;
		}

		drawCall.setFragmentShader(fragShader);

		pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

		let vertShader = vertexShaderInst.get(this.adapter, 'vertex');
		if (!vertShader) {
			return;
		}

		drawCall.setVertexShader(vertShader);

		vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

		drawCall.setGeometry(geometry);

		this.adapter.dispatch(drawCall);
	}

	drawIndexed(
		indexBuffer: buffer<uint>,
		vertexShaderInst: ShadeupShaderInstance,
		pixelShaderInst: ShadeupShaderInstance
	) {
		this.dirty = true;
		this.cpuReadDirty = true;
		this.cpuFlush();
		this.version++;
		if (!this.adapter) return;

		let drawCall = new ShaderDispatch('draw');
		drawCall.drawType = 'indexed';
		drawCall.setVertexUniform(
			'_vtex_canvas',
			makePrimitiveUniform(
				{
					type: 'primitive',
					name: 'float2'
				},
				[canvas.width, canvas.height]
			)
		);

		let fragShader = pixelShaderInst.get(this.adapter, 'fragment');
		if (!fragShader) {
			return;
		}

		drawCall.setFragmentShader(fragShader);

		pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

		let vertShader = vertexShaderInst.get(this.adapter, 'vertex-indexed');
		if (!vertShader) {
			return;
		}

		drawCall.setVertexShader(vertShader);

		vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

		drawCall.setIndexBuffer(indexBuffer);

		this.adapter.dispatch(drawCall);
	}

	clear(color: float | [number, number, number, number] | 'auto' = 'auto') {
		this.dirty = true;
		this.cpuReadDirty = true;
		this.cpuFlush();
		this.version++;
		if (!this.adapter) return;
		this.adapter.clear(false, color);
	}

	drawCount(
		count: number,
		vertexShaderInst: ShadeupShaderInstance,
		pixelShaderInst: ShadeupShaderInstance
	) {
		this.dirty = true;
		this.cpuReadDirty = true;
		this.cpuFlush();
		this.version++;
		if (!this.adapter) return;
		let drawCall = new ShaderDispatch('draw');
		drawCall.drawType = 'count';
		drawCall.drawCount = count;
		drawCall.setVertexUniform(
			'_vtex_canvas',
			makePrimitiveUniform(
				{
					type: 'primitive',
					name: 'float2'
				},
				[canvas.width, canvas.height]
			)
		);

		let fragShader = pixelShaderInst.get(this.adapter, 'fragment');
		if (!fragShader) {
			return;
		}

		drawCall.setFragmentShader(fragShader);

		pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

		let vertShader = vertexShaderInst.get(this.adapter, 'vertex-indexed');
		if (!vertShader) {
			return;
		}

		drawCall.setVertexShader(vertShader);

		vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

		this.adapter.dispatch(drawCall);
	}

	drawInstanced(
		mesh: Mesh,
		instanceCount: number,
		vertexShaderInst: ShadeupShaderInstance,
		pixelShaderInst: ShadeupShaderInstance
	) {
		if (!this.adapter) {
			return;
		}

		let drawCall = new ShaderDispatch('draw');
		drawCall.drawType = 'geometry';
		drawCall.instanceCount = instanceCount;
		drawCall.setVertexUniform(
			'_vtex_canvas',
			makePrimitiveUniform(
				{
					type: 'primitive',
					name: 'float2'
				},
				[canvas.width, canvas.height]
			)
		);

		let fragShader = pixelShaderInst.get(this.adapter, 'fragment');
		if (!fragShader) {
			return;
		}

		drawCall.setFragmentShader(fragShader);

		pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

		let vertShader = vertexShaderInst.get(this.adapter, 'vertex');
		if (!vertShader) {
			return;
		}

		drawCall.setVertexShader(vertShader);

		vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

		drawCall.setGeometry(mesh);

		this.adapter.dispatch(drawCall);
	}
}

let registeredLoads: [string, string][] = [];

(window as any).__shadeup_register_loads = (ids: [string, string][]) => {
	registeredLoads.push(...ids);
};

(window as any).load = (id: string) => {
	let asset = loadedAssets.get(id);
	if (!asset) {
		throw new Error('Asset not found');
	}

	if (asset instanceof HTMLCanvasElement) {
		if (primedTextureAssets.has(id)) {
			let a = primedTextureAssets.get(id)!;
			primedTextureAssets.delete(id);
			return a;
		}

		let tex = (window as any).shadeupMakeTextureInternal(
			[asset.width, asset.height],
			'8bit',
			'uint8'
		) as ShadeupTexture2d;
		tex.adapter?.drawImage(asset, 0, 0, asset.width, asset.height);
		tex.adapter?.flush();

		return tex;
	} else if (asset && asset.clone) {
		return asset.clone();
	}

	return asset;
};

const FormatInnerTypeMapping: {
	[key in `${Exclude<TextureFormat, 'auto'>}-${TextureComponentType}`]: GPUTextureFormat;
} = {
	'8bit-float': 'r16float',
	'8bit-float2': 'rg16float',
	'8bit-float3': 'rgba16float',
	'8bit-float4': 'rgba16float',
	'16bit-float': 'r16float',
	'16bit-float2': 'rg16float',
	'16bit-float3': 'rgba16float',
	'16bit-float4': 'rgba16float',
	'32bit-float': 'r32float',
	'32bit-float2': 'rg32float',
	'32bit-float3': 'rgba32float',
	'32bit-float4': 'rgba32float',
	'16bit-int': 'r16sint',
	'16bit-int2': 'rg16sint',
	'16bit-int3': 'rgba16sint',
	'16bit-int4': 'rgba16sint',
	'8bit-int': 'r8sint',
	'8bit-int2': 'rg8sint',
	'8bit-int3': 'rgba8sint',
	'8bit-int4': 'rgba8sint',
	'32bit-int': 'r32sint',
	'32bit-int2': 'rg32sint',
	'32bit-int3': 'rgba32sint',
	'32bit-int4': 'rgba32sint',
	'8bit-uint': 'r8uint',
	'8bit-uint2': 'rg8uint',
	'8bit-uint3': 'rgba8uint',
	'8bit-uint4': 'rgba8uint',
	'16bit-uint': 'r16uint',
	'16bit-uint2': 'rg16uint',
	'16bit-uint3': 'rgba16uint',
	'16bit-uint4': 'rgba16uint',
	'32bit-uint': 'r32uint',
	'32bit-uint2': 'rg32uint',
	'32bit-uint3': 'rgba32uint',
	'32bit-uint4': 'rgba32uint',

	'8bit-uint8': 'rgba8unorm',
	'16bit-uint8': 'rgba16uint',
	'32bit-uint8': 'rgba32float',

	'depth-uint8': 'depth24plus',
	'depth-float': 'depth24plus',
	'depth-float2': 'depth24plus',
	'depth-float3': 'depth24plus',
	'depth-float4': 'depth24plus',
	'depth-int': 'depth24plus',
	'depth-int2': 'depth24plus',
	'depth-int3': 'depth24plus',
	'depth-int4': 'depth24plus',
	'depth-uint': 'depth24plus',
	'depth-uint2': 'depth24plus',
	'depth-uint3': 'depth24plus',
	'depth-uint4': 'depth24plus',

	'depth-32-uint8': 'depth32float',
	'depth-32-float': 'depth32float',
	'depth-32-float2': 'depth32float',
	'depth-32-float3': 'depth32float',
	'depth-32-float4': 'depth32float',
	'depth-32-int': 'depth32float',
	'depth-32-int2': 'depth32float',
	'depth-32-int3': 'depth32float',
	'depth-32-int4': 'depth32float',
	'depth-32-uint': 'depth32float',
	'depth-32-uint2': 'depth32float',
	'depth-32-uint3': 'depth32float',
	'depth-32-uint4': 'depth32float'
};
function shadeupMakeTextureInternal(
	size: [number, number] | [number, number, number],
	format: TextureFormat,
	innerType: TextureComponentType = 'float4'
) {
	if (size.length == 3) {
		size = [Math.floor(size[0]), Math.floor(size[1]), Math.floor(size[2])];
		let tex = new ShadeupTexture3d();
		tex.innerType = innerType;
		tex.size = size;
		tex.width = size[0];
		tex.height = size[1];
		tex.depth = size[2];
		if (preferredAdapter == 'webgl') {
			tex.adapter = new WebGLAdapter(null);
		} else if (preferredAdapter == 'webgpu') {
			tex.adapter = new WebGPUAdapter(null);
			let webgpu = tex.adapter as WebGPUAdapter;
			webgpu.textureFormat = tex.innerType;
			webgpu.headless = true;
			webgpu.headlessHeight = tex.height;
			webgpu.headlessWidth = tex.width;
			webgpu.headlessDepth = tex.depth;
			webgpu.headlessDimensions = 3;
		} else {
			throw new Error('No adapter found');
		}

		tex.adapter.init();
		tex.adapter.setViewport(0, 0);

		return tex;
	}

	size = [Math.floor(size[0]), Math.floor(size[1])];
	let tex = new ShadeupTexture2d();
	tex.innerType = innerType;
	tex.size = size;
	tex.width = size[0];
	tex.height = size[1];
	tex.image = document.createElement('canvas');
	// document.body.appendChild(tex.image);
	tex.image.width = tex.width;
	tex.image.height = tex.height;

	if (preferredAdapter == 'webgl') {
		tex.adapter = new WebGLAdapter(tex.image);
	} else if (preferredAdapter == 'webgpu') {
		let gpuTextureFormat: GPUTextureFormat = 'rgba8unorm';
		if (format == 'auto') {
			format = innerType == 'uint8' ? '8bit' : '32bit';
		}

		gpuTextureFormat =
			FormatInnerTypeMapping[`${format as Exclude<'auto', TextureFormat>}-${innerType}`];
		tex.adapter = new WebGPUAdapter(tex.image);

		let webgpu = tex.adapter as WebGPUAdapter;
		webgpu.textureFormat = tex.innerType;
		webgpu.gpuTextureFormat = gpuTextureFormat;
		webgpu.headless = true;
		webgpu.headlessHeight = tex.height;
		webgpu.headlessWidth = tex.width;
	} else {
		throw new Error('No adapter found');
	}

	tex.init();
	tex.adapter.init();
	tex.adapter.setViewport(tex.width, tex.height);

	tex.paint = new PaintingContext(tex.image, tex.adapter as any);
	tex.paint.markDirtyCallback = () => {
		tex.cpuFlush();
		tex.dirty = true;
		tex.cpuReadDirty = true;
		tex.version++;
	};
	tex.adapter.clear(true);

	return tex;
}

(window as any)['shadeupMakeTextureInternal'] = shadeupMakeTextureInternal;

function shadeupMakeTextureFromImageLike(
	img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | HTMLVideoElement
) {
	let tex = shadeupMakeTextureInternal([img.width, img.height], '8bit', 'uint8');
	let canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	let ctx = canvas.getContext('2d');
	ctx?.drawImage(img, 0, 0);
	tex.adapter?.drawImage(canvas, 0, 0, img.width, img.height);
	tex.adapter?.flush();
	return tex;
}

(window as any)['shadeupMakeTextureFromUrlNative'] = (url: string) => {
	var image = new Image();
	image.crossOrigin = 'anonymous';
	image.src = `/images/${url}`;
	let tex = new ShadeupTexture2d();

	image.onload = function () {
		tex.image = document.createElement('canvas');
		tex.loading = false;
		tex.size = [image.width, image.height];
		if (!tex.image) return;
		tex.image.width = image.width;
		tex.image.height = image.height;

		let ctx = tex.image.getContext('2d');
		ctx?.drawImage(image, 0, 0);
		graphicsAdapter.unbindTexture(tex);
	};

	return tex;
};

let logger = document.createElement('div');
logger.style.position = 'absolute';
logger.style.pointerEvents = 'none';
logger.style.top = '0';
logger.style.left = '0';
logger.style.bottom = '0';
logger.style.width = '100%';
logger.style.overflow = 'auto';
logger.style.display = 'flex';
logger.style.flexDirection = 'column';
logger.style.justifyContent = 'flex-end';
logger.style.fontFamily = 'monospace';
logger.style.color = 'white';
logger.style.backgroundColor = 'rgba(0,0,0,0.5)';
logger.style.borderRadius = 'inherit';
logger.style.zIndex = '1000';
logger.style.display = 'none';
logger.style.paddingBottom = '0.5rem';
let realUiContainer = document.querySelector('.ui-container');
let uiContainer = document.querySelector('.render-container');
if (uiContainer) {
	uiContainer.appendChild(logger);
}

let stater = document.createElement('div');
stater.classList.add('stater');
stater.style.position = 'absolute';
stater.style.pointerEvents = 'none';
stater.style.top = '0';
stater.style.right = '0';
stater.style.width = '100%';

stater.style.display = 'flex';
stater.style.flexDirection = 'column';
stater.style.alignItems = 'flex-end';
stater.style.paddingRight = '10px';
stater.style.paddingTop = '10px';
stater.style.fontFamily = 'monospace';
stater.style.color = 'white';
stater.style.zIndex = '1001';

if (uiContainer) {
	uiContainer.appendChild(stater);
}

(window as any).__shadeup_print = (...args: any[]) => {
	logger.style.display = 'flex';
	let el = document.createElement('div');
	el.style.display = 'flex';
	el.style.alignItems = 'center';
	el.style.height = 'auto';
	el.style.lineHeight = '1em';
	el.style.flexShrink = '0';
	el.style.borderTop = '1px solid rgba(255,255,255,0.2)';
	el.style.backgroundColor = 'rgba(255,255,255,0.05)';

	let texts = [];
	for (let arg of args) {
		if (typeof arg === 'string') {
			texts.push(arg);
		} else {
			let stringified = JSON.stringify(arg);
			texts.push(stringified);
		}
	}
	el.innerText = texts.join(' ');
	if (logger.childElementCount > 50) {
		logger.removeChild(logger.children[0]);
	}
	logger.appendChild(el);
};

let stats = new Map<string, HTMLElement>();
let statsGraph = new Map<
	string,
	{
		num: HTMLElement;
		graph: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;
		min: number;
		max: number;
		index: number;
		counter: number;
		history: number[];
	}
>();
let statsMark = new Map<string, number>();
let statsGraphMark = new Map<string, number>();

function serializeValueToHtml(value: any) {
	let placesColoring = ['#9abcff', '#aadfaa', '#f0ff76', '#aeaeae'];
	let displayValue = value.toString();
	if (typeof value == 'number') {
		displayValue = `<span style="color: ${placesColoring[0]}">${splitNumberPlaces(value)}</span>`;
	} else if (typeof value == 'object') {
		if (Array.isArray(value)) {
			if (value.length == 0) {
				displayValue = `<span style="color: #a1a1a1">[]</span>`;
			} else {
				let numeric = true;
				for (let v of value) {
					if (typeof v != 'number') {
						numeric = false;
					}
				}

				if (numeric) {
					displayValue = value
						.map((v, i) => {
							let index = i % 4;
							return `<span style="color: ${placesColoring[index]}">${splitNumberPlaces(v)}</span>`;
						})
						.join(' ');
				} else {
					displayValue = `[ ${value.map(serializeValueToHtml).join(',')} ]`;
				}
			}
		} else if (typeof value == 'boolean') {
			if (value) {
				displayValue = `<span style="color: #66ffab">true</span>`;
			} else {
				displayValue = `<span style="color: #ff6666">false</span>`;
			}
		} else if (typeof value == 'string') {
			displayValue = `<span style="color: #fabb20">${value}</span>`;
		} else {
			displayValue = JSON.stringify(value);
		}
	}

	return displayValue;
}
const statTimeout = 144;

(window as any).__shadeup_stat = (name: string, value: any) => {
	if (!stats.has(name)) {
		let el = document.createElement('div');
		el.style.display = 'inline-flex';
		el.style.alignItems = 'center';
		el.style.backdropFilter = 'blur(1px)';
		el.style.borderRadius = '20px';
		el.style.padding = '2px 4px';

		el.style.background = 'rgba(0,0,0,0.5)';
		el.style.fontSize = '12px';
		el.style.lineHeight = '12px';
		el.style.flexShrink = '0';
		el.style.marginBottom = '2px';

		stats.set(name, el);
		stater.appendChild(el);
	}

	statsMark.set(name, statTimeout);

	let el = stats.get(name);
	if (!el) return;
	let htm = `<i>${name}</i> <span style="margin-left: 8px;">${serializeValueToHtml(value)}</span>`;
	if (el.innerHTML != htm) {
		el.innerHTML = htm;
	}
};

(window as any).__shadeup_statGraph = (name: string, value: any, sampleRate: number = 1) => {
	if (!statsGraph.has(name)) {
		let el = document.createElement('div');
		el.style.display = 'inline-flex';
		el.style.alignItems = 'center';
		el.style.backdropFilter = 'blur(1px)';
		el.style.borderRadius = '20px';
		el.style.padding = '2px 4px';

		let text = document.createElement('span');
		text.style.marginLeft = '8px';
		text.innerText = name;
		el.appendChild(text);

		el.style.background = 'rgba(0,0,0,0.5)';
		el.style.fontSize = '12px';
		el.style.lineHeight = '12px';
		el.style.flexShrink = '0';
		el.style.marginBottom = '2px';

		let canvas = document.createElement('canvas');
		canvas.width = 100;
		canvas.height = 20;
		canvas.style.marginLeft = '8px';
		canvas.style.borderRadius = '4px';
		canvas.style.background = 'rgba(0,0,0,0.3)';
		el.appendChild(canvas);

		let ctx = canvas.getContext('2d');
		let num = document.createElement('span');
		num.style.marginLeft = '8px';
		el.appendChild(num);

		statsGraph.set(name, {
			ctx: ctx!,
			graph: canvas,
			num,
			min: value,
			max: value,
			index: 0,
			counter: 0,
			history: new Array(canvas.width).fill(0)
		});
		stater.appendChild(el);
	}

	let statData = statsGraph.get(name)!;
	statData.counter++;

	let histMax = localLerp(statData.max, value, 0.1);
	let histMin = localLerp(statData.min, value, 0.1);

	for (let subVal of statData.history) {
		if (subVal < histMin) histMin = subVal;
		if (subVal > histMax) histMax = subVal;
	}

	statData.max = histMax;
	statData.min = histMin;

	if (statData.counter % sampleRate == 0) {
		statData.history[statData.index] = value;
		statData.index = (statData.index + 1) % statData.history.length;
	}

	// Draw fps histogram and value
	let width = statData.graph.width;
	let histwidth = width;
	let height = statData.graph.height;
	let ctx = statData.ctx;
	ctx.fillStyle = 'white';
	ctx.clearRect(0, 0, width, height);

	ctx?.beginPath();

	for (let j = 0; j < statData.history.length; j++) {
		let rev = statData.index - j;

		let i = rev < 0 ? statData.history.length + rev : rev;
		let x = (1 - j / statData.history.length) * histwidth;
		let drawHeight = height;

		let valPercent = Math.min(1, (statData.history[i] - histMin) / (histMax - histMin));

		let top = height - drawHeight * valPercent;

		if (isNaN(top)) {
			top = height;
		}
		if (isNaN(x)) {
			x = 0;
		}
		if (j == 0) {
			ctx?.moveTo(x, top);
		}

		ctx.lineTo(x, top);
	}

	ctx.lineTo(0, height);
	ctx.lineTo(width, height);

	ctx.fill();

	statsGraphMark.set(name, statTimeout);

	let lastValue = statData.history[statData.index];
	let htm = `${serializeValueToHtml(value)}`;
	if (statData.num.innerHTML != htm) {
		statData.num.innerHTML = htm;
	}
};

function splitNumberPlaces(num: number) {
	let parts = '';
	let decimalCount = 5;
	if (num > 100) {
		decimalCount = 2;
	}
	let str = num.toFixed(decimalCount);
	if (num > 100) {
		str = str.replace(/\.?0+$/, '');
	}
	let hitDecimal = !str.includes('.');
	let counter = 0;
	for (let i = str.length - 1; i >= 0; i--) {
		if (hitDecimal) {
			if (counter == 3) {
				parts = str[i] + ',' + parts;
				counter = 0;
			} else {
				parts = str[i] + parts;
			}
			counter++;
		} else {
			parts = str[i] + parts;
		}
		if (str[i] == '.') {
			hitDecimal = true;
		}
	}

	return parts;
}

const fullscreenGeo = makeFullscreenQuadGeometry();

let flying = false;
let orbiting = false;

let cameraUnlocked = false;

function activateFreeFly() {
	if (cameraConfig.mode == 'orbit-free') {
		cameraUnlocked = true;
	}
	cameraConfig.mode = 'free';
	cameraRotY = cameraConfig.orbitPitch;
	cameraRotX = cameraConfig.orbitYaw - Math.PI / 2;
}
function activateOrbit() {
	if (cameraConfig.mode == 'free') {
		cameraUnlocked = false;
	}
	cameraConfig.mode = 'orbit-free';

	// Recalc orbit target, and then pitch and yaw
	// Reproject orbit target based on our current position and free look

	let camera = (window as any).env.camera;
	let currentDist = cameraConfig.orbitDistance;
	let currentCameraPos = camera.position;

	let rotation = camera.rotation;
	let quatMulled = quaternionMul(rotation, [0, 0, 1]);
	let targetForward: [number, number, number] = [quatMulled[0], quatMulled[1], quatMulled[2]];

	cameraConfig.orbitTarget = [
		currentCameraPos[0] - targetForward[0] * currentDist,
		currentCameraPos[1] - targetForward[1] * currentDist,
		currentCameraPos[2] - targetForward[2] * currentDist
	];

	// Recalc pitch and yaw

	let target = cameraConfig.orbitTarget;
	let position = currentCameraPos;

	let dx = target[0] - position[0];
	let dy = target[1] - position[1];
	let dz = target[2] - position[2];

	let yaw = Math.atan2(dz, dx);
	let pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

	cameraConfig.orbitPitch = -pitch;
	cameraConfig.orbitYaw = yaw - Math.PI;
}

window.addEventListener('contextmenu', async (e) => {
	if (e.target == realUiContainer) {
		e.preventDefault();
		if (cameraConfig.mode == 'orbit-free' || cameraConfig.mode == 'free') {
			await canvas.requestPointerLock();
			flying = true;
			if (cameraConfig.mode == 'orbit-free') {
				activateFreeFly();
			}
			canvas.focus();
		}
	}
});

window.addEventListener('mousedown', async (e) => {
	if (e.target == realUiContainer) {
		if (e.button == 2) {
			e.preventDefault();
			if (cameraConfig.mode == 'orbit-free' || cameraConfig.mode == 'free') {
				await canvas.requestPointerLock();
				canvas.focus();
				flying = true;
				if (cameraConfig.mode == 'orbit-free') {
					activateFreeFly();
				}
			}
		} else if (e.buttons == 4) {
			e.preventDefault();
			orbiting = true;
		} else if (e.button == 0 || e.button == 1) {
			orbiting = true;
		}
	}
});

window.addEventListener('mouseup', async (e) => {
	if (e.target == realUiContainer || e.target == document.body || e.target == canvas) {
		if (e.button == 2) {
			e.preventDefault();
			if (cameraConfig.mode == 'orbit-free' || cameraConfig.mode == 'free') {
				document.exitPointerLock();
				if (cameraUnlocked) {
					activateOrbit();
				}
				flying = false;
				cameraSpeed = defaultCameraSpeed;
			}
		} else if (e.buttons == 4) {
			e.preventDefault();
			orbiting = false;
		} else if (e.button == 0 || e.button == 1) {
			orbiting = false;
		}
	}
});

function quaternionFromAxisAngle(
	axis: [number, number, number],
	angle: number
): [number, number, number, number] {
	let halfAngle = angle * 0.5;
	let sin = Math.sin(halfAngle);
	let cos = Math.cos(halfAngle);
	return [axis[0] * sin, axis[1] * sin, axis[2] * sin, cos];
}

function normalizeVector3(v: [number, number, number]): [number, number, number] {
	let len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	return [v[0] / len, v[1] / len, v[2] / len];
}

let cameraRotX = 0;
let cameraRotY = 0;
let cameraPitchVelocity = 0;
let cameraYawVelocity = 0;
window.addEventListener('mousemove', (e) => {
	if (e.target == document.body || e.target == realUiContainer || e.target == canvas) {
		if (e.buttons == 4 || e.buttons == 2) {
			let camera2d = (window as any).env.camera2d;
			if (camera2d) {
				camera2d.position[0] += e.movementX * window.devicePixelRatio;
				camera2d.position[1] += e.movementY * window.devicePixelRatio;
			}
		}

		if (flying) {
			let dx = e.movementX;
			let dy = e.movementY;

			let camera = (window as any).env.camera;
			let up: [number, number, number] = [0, 1, 0];
			let forward: [number, number, number] = [0, 0, -1];
			let right: [number, number, number] = [1, 0, 0];
			let cameraRight = quaternionRotate(camera.rotation, right);
			// Lock the cameraRight vector to the horizontal plane
			cameraRight[1] = 0;
			cameraRight = normalizeVector3(cameraRight);

			// Lock rotation to horizontal plane

			cameraRotX += dx * 0.001;
			cameraRotY += dy * 0.001;

			// let rightRot = quaternionFromAxisAngle(cameraRight, dy * 0.001);
			// camera.rotation = quaternionMulQuaternion(camera.rotation, rightRot);

			// let upRot = quaternionFromAxisAngle(up, dx * -0.001);
			// camera.rotation = quaternionMulQuaternion(camera.rotation, upRot);
		} else {
			if (cameraConfig.mode.startsWith('orbit') && orbiting) {
				if (e.buttons == 1) {
					cameraYawVelocity += e.movementX * 0.01;
					cameraPitchVelocity += e.movementY * 0.01;
					cameraConfig.spinning = false;
				} else if (e.buttons == 4) {
					cameraConfig.spinning = false;
					let camera = (window as any).env.camera;
					if (camera) {
						// Move camera cameraConfig.orbitTarget along the camera's right vector and up vector
						let up: [number, number, number] = [0, 1, 0];
						let forward: [number, number, number] = [0, 0, -1];
						let right: [number, number, number] = [1, 0, 0];
						let cameraRight = quaternionRotate(camera.rotation, right);
						// Lock the cameraRight vector to the horizontal plane

						cameraRight = normalizeVector3(cameraRight);

						let cameraUp = quaternionRotate(camera.rotation, up);

						cameraUp = normalizeVector3(cameraUp);

						let cameraForward = quaternionRotate(camera.rotation, forward);
						cameraForward[1] = 0;
						cameraForward = normalizeVector3(cameraForward);

						let cameraSpeed = 0.6 * (Math.sqrt(cameraConfig.orbitDistance) / 20);
						let cameraTarget = cameraConfig.orbitTarget;
						if (e.shiftKey) {
							cameraSpeed = 0.01;
						}

						if (e.ctrlKey) {
							cameraSpeed = 1;
						}

						cameraTarget[0] += cameraRight[0] * e.movementX * cameraSpeed * -1;
						cameraTarget[1] += cameraRight[1] * e.movementX * cameraSpeed * -1;
						cameraTarget[2] += cameraRight[2] * e.movementX * cameraSpeed * -1;

						cameraTarget[0] += cameraUp[0] * e.movementY * cameraSpeed;
						cameraTarget[1] += cameraUp[1] * e.movementY * cameraSpeed;
						cameraTarget[2] += cameraUp[2] * e.movementY * cameraSpeed;

						cameraConfig.orbitTarget = cameraTarget;
					}
				}
			}
		}
	}
});

function quaternionRotate(
	quaternion: [number, number, number, number],
	vector: [number, number, number]
): [number, number, number] {
	let [x, y, z] = vector;
	let [qx, qy, qz, qw] = quaternion;
	let ix = qw * x + qy * z - qz * y;
	let iy = qw * y + qz * x - qx * z;
	let iz = qw * z + qx * y - qy * x;
	let iw = -qx * x - qy * y - qz * z;
	return [
		ix * qw + iw * -qx + iy * -qz - iz * -qy,
		iy * qw + iw * -qy + iz * -qx - ix * -qz,
		iz * qw + iw * -qz + ix * -qy - iy * -qx
	];
}

function quaternionMul(
	quat: [number, number, number, number],
	vec: [number, number, number]
): [number, number, number, number] {
	let [qx, qy, qz, qw] = quat;
	let [vx, vy, vz] = vec;
	let ix = qw * vx + qy * vz - qz * vy;
	let iy = qw * vy + qz * vx - qx * vz;
	let iz = qw * vz + qx * vy - qy * vx;
	let iw = -qx * vx - qy * vy - qz * vz;
	return [
		ix * qw + iw * -qx + iy * -qz - iz * -qy,
		iy * qw + iw * -qy + iz * -qx - ix * -qz,
		iz * qw + iw * -qz + ix * -qy - iy * -qx,
		iw * qw - ix * -qx - iy * -qy - iz * -qz
	];
}

function quaternionMulQuaternion(
	a: [number, number, number, number],
	b: [number, number, number, number]
): [number, number, number, number] {
	let [ax, ay, az, aw] = a;
	let [bx, by, bz, bw] = b;
	let ix = aw * bx + ax * bw + ay * bz - az * by;
	let iy = aw * by + ay * bw + az * bx - ax * bz;
	let iz = aw * bz + az * bw + ax * by - ay * bx;
	let iw = aw * bw - ax * bx - ay * by - az * bz;
	return [ix, iy, iz, iw];
}

let movementForward = 0;
let movementRight = 0;
let movementUp = 0;
let movement = {
	w: 0,
	a: 0,
	s: 0,
	d: 0,
	q: 0,
	e: 0
};
let movementReal = {
	w: 0,
	a: 0,
	s: 0,
	d: 0,
	q: 0,
	e: 0
};
let fovDirection = 0;

window.addEventListener('keydown', (e) => {
	if (e.target && (e.target.closest('input') || e.target.closest('textarea'))) return;

	if (e.key == 'w') {
		movement.w = 1;
	} else if (e.key == 's') {
		movement.s = 1;
	} else if (e.key == 'a') {
		movement.a = 1;
	} else if (e.key == 'd') {
		movement.d = 1;
	} else if (e.key == 'e') {
		movement.e = 1;
	} else if (e.key == 'q') {
		movement.q = 1;
	} else if (e.key == 'c') {
		fovDirection = -1;
	} else if (e.key == 'z') {
		fovDirection = 1;
	}
});

let targetOrbitDistance = cameraConfig.orbitDistance;

window.addEventListener('wheel', (e) => {
	if (e.target == document.body || e.target == realUiContainer || e.target == canvas) {
		if (e.deltaY > 0) {
			cameraSpeed = cameraSpeed / 1.2;
		} else if (e.deltaY < 0) {
			cameraSpeed = cameraSpeed * 1.2;
		}

		let wheel = normalizeWheel(e);
		if (cameraConfig.mode.startsWith('orbit')) {
			targetOrbitDistance = Math.max(0.1, targetOrbitDistance - wheel.spinY * -100);
		}

		let camera2d = (window as any).env.camera2d;
		if (camera2d) {
			// Zoom to the center of the mouse
			let mousePos = [mouseState.screen[0], mouseState.screen[1]];
			let cameraPos = camera2d.position;
			let cameraZoom = camera2d.zoom;
			let zoomDelta = wheel.spinY * 0.1;
			// Exponential zoom
			let newZoom = Math.max(0.01, cameraZoom + zoomDelta * cameraZoom);

			let mouseWorldPos = [
				(mousePos[0] - cameraPos[0]) / cameraZoom,
				(mousePos[1] - cameraPos[1]) / cameraZoom
			];
			let mouseWorldPos2 = [
				(mousePos[0] - cameraPos[0]) / newZoom,
				(mousePos[1] - cameraPos[1]) / newZoom
			];
			let mouseWorldDelta = [
				mouseWorldPos2[0] - mouseWorldPos[0],
				mouseWorldPos2[1] - mouseWorldPos[1]
			];
			camera2d.position = [
				cameraPos[0] - mouseWorldDelta[0] * cameraZoom,
				cameraPos[1] - mouseWorldDelta[1] * cameraZoom
			];
			camera2d.zoom = newZoom;
		}
	}
});

window.addEventListener('keyup', (e) => {
	if (e.key == 'w') {
		movement.w = 0;
	} else if (e.key == 's') {
		movement.s = 0;
	} else if (e.key == 'a') {
		movement.a = 0;
	} else if (e.key == 'd') {
		movement.d = 0;
	} else if (e.key == 'e') {
		movement.e = 0;
	} else if (e.key == 'q') {
		movement.q = 0;
	} else if (e.key == 'c' || e.key == 'z') {
		fovDirection = 0;
	}
});

let lastFrameMovement = Date.now();
let defaultCameraSpeed = 1;
let cameraSpeed = defaultCameraSpeed;
function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
function quaternionFromEuler(euler: [number, number, number]): [number, number, number, number] {
	let [x, y, z] = euler;
	let c1 = Math.cos(x / 2);
	let c2 = Math.cos(y / 2);
	let c3 = Math.cos(z / 2);
	let s1 = Math.sin(x / 2);
	let s2 = Math.sin(y / 2);
	let s3 = Math.sin(z / 2);
	return [
		s1 * c2 * c3 + c1 * s2 * s3,
		c1 * s2 * c3 - s1 * c2 * s3,
		c1 * c2 * s3 + s1 * s2 * c3,
		c1 * c2 * c3 - s1 * s2 * s3
	];
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
	let [ax, ay, az] = a;
	let [bx, by, bz] = b;
	return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function movementFrame() {
	let now = Date.now();
	let dt = now - lastFrameMovement;
	lastFrameMovement = now;
	if (cameraConfig.mode == 'orbit-free' || cameraConfig.mode == 'free') {
		if (!flying) {
			if ((window as any).env.camera) {
				(window as any).env.camera.fov = lerp((window as any).env.camera.fov, 90, dt * 0.01);
			}
		}
	}
	if (cameraConfig.mode == 'orbit' || cameraConfig.mode == 'orbit-free') {
		{
			cameraConfig.orbitYaw += cameraYawVelocity * dt * 0.025;
			cameraConfig.orbitPitch += cameraPitchVelocity * dt * 0.025;
			cameraYawVelocity = lerp(cameraYawVelocity, 0, dt * 0.03);
			cameraPitchVelocity = lerp(cameraPitchVelocity, 0, dt * 0.03);
			cameraConfig.orbitPitch = Math.max(
				cameraConfig.orbitMinPitch,
				Math.min(cameraConfig.orbitMaxPitch, cameraConfig.orbitPitch)
			);
		}

		cameraConfig.orbitDistance = lerp(cameraConfig.orbitDistance, targetOrbitDistance, dt * 0.025);

		if (cameraConfig.spinning) {
			cameraConfig.orbitYaw -= dt * 0.0002;
		}
		let theta = cameraConfig.orbitYaw;
		let phi = Math.PI / 2 - cameraConfig.orbitPitch;
		let orbitTarget = cameraConfig.orbitTarget;
		let cameraPosition = [
			Math.sin(phi) * Math.cos(theta) * cameraConfig.orbitDistance + orbitTarget[0],
			Math.cos(phi) * cameraConfig.orbitDistance + orbitTarget[1],
			Math.sin(phi) * Math.sin(theta) * cameraConfig.orbitDistance + orbitTarget[2]
		];

		let camera = (window as any).env.camera;
		if (camera) {
			camera.position = cameraPosition;
			let quat = (window as any).shadeupQuat;
			if (quat) {
				camera.rotation = quat.lookAt(
					normalizeVector3([
						cameraPosition[0] - orbitTarget[0],
						cameraPosition[1] - orbitTarget[1],
						cameraPosition[2] - orbitTarget[2]
					]),
					[0, -1, 0]
				);
			}
		}
	} else if (cameraConfig.mode == 'free') {
		const damping = 60;
		movementReal = {
			w: lerp(movementReal.w, movement.w, dt / damping),
			a: lerp(movementReal.a, movement.a, dt / damping),
			s: lerp(movementReal.s, movement.s, dt / damping),
			d: lerp(movementReal.d, movement.d, dt / damping),
			q: lerp(movementReal.q, movement.q, dt / damping),
			e: lerp(movementReal.e, movement.e, dt / damping)
		};

		let camera = (window as any).env.camera;
		let up: [number, number, number] = [0, 1, 0];
		let forward: [number, number, number] = [0, 0, -1];
		let right: [number, number, number] = [1, 0, 0];

		if (camera) {
			cameraRotY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotY));
			camera.rotation = quaternionMulQuaternion(
				quaternionFromEuler([0, -cameraRotX, 0]),
				quaternionFromEuler([-cameraRotY, 0, 0])
			);
		}

		if (!flying) {
			return;
		}

		let rotation = camera.rotation;
		let quatMulled = quaternionMul(rotation, [0, 0, 1]);
		let targetForward: [number, number, number] = [quatMulled[0], quatMulled[1], quatMulled[2]];
		// targetForward[0] = 2 * (rotation[0] * rotation[2] - rotation[3] * rotation[1]);
		// targetForward[1] = 2 * (rotation[1] * rotation[2] + rotation[3] * rotation[0]);
		// targetForward[2] = 1 - 2 * (rotation[0] * rotation[0] + rotation[1] * rotation[1]);
		let targetUp = up;
		let targetRight = cross(targetForward, targetUp);
		targetRight = normalizeVector3(targetRight);

		movementForward = 0;
		movementRight = 0;
		movementUp = 0;
		movementForward += movementReal.w;
		movementForward -= movementReal.s;
		movementRight += movementReal.d;
		movementRight -= movementReal.a;
		movementUp += movementReal.e;
		movementUp -= movementReal.q;

		movementRight *= -1;
		movementForward *= -1;

		let movementVector = [0, 0, 0];
		movementVector[0] += targetForward[0] * movementForward;
		movementVector[1] += targetForward[1] * movementForward;
		movementVector[2] += targetForward[2] * movementForward;
		movementVector[0] += targetRight[0] * movementRight;
		movementVector[1] += targetRight[1] * movementRight;
		movementVector[2] += targetRight[2] * movementRight;
		movementVector[0] += targetUp[0] * movementUp;
		movementVector[1] += targetUp[1] * movementUp;
		movementVector[2] += targetUp[2] * movementUp;

		// let dist = Math.sqrt(
		// 	movementVector[0] * movementVector[0] +
		// 		movementVector[1] * movementVector[1] +
		// 		movementVector[2] * movementVector[2]
		// );
		// if (dist > 0) {
		// 	movementVector[0] /= dist;
		// 	movementVector[1] /= dist;
		// 	movementVector[2] /= dist;
		// }

		camera.position = [
			camera.position[0] + movementVector[0] * dt * cameraSpeed,
			camera.position[1] + movementVector[1] * dt * cameraSpeed,
			camera.position[2] + movementVector[2] * dt * cameraSpeed
		];

		camera.fov += fovDirection * dt * 0.1;
		camera.fov = Math.max(Math.min(camera.fov, 150), 4);
	}
}

// movementFrame();

function __shadeup_dispatch_compute(
	workgroups: [number, number, number],
	shaderInst: ShadeupShaderInstance
) {
	let computeCall = new ShaderDispatch('compute');

	computeCall.computeCount = workgroups;

	let compShader = shaderInst.get(graphicsAdapter, 'compute', {
		initialDispatch: shaderInst
	});
	if (!compShader) {
		throw new Error('Fragment shader not found');
	}

	computeCall.setComputeShader(compShader);

	shaderInst.bindUniforms(computeCall.fragmentUniforms);

	if (graphicsAdapter instanceof WebGPUAdapter) {
		graphicsAdapter.dispatchCompute(computeCall);
	} else {
		throw new Error('WebGL compute not supported');
	}
}

(window as any).__shadeup_dispatch_compute = __shadeup_dispatch_compute;

function __shadeup_dispatch_compute_indirect(
	indirectBuffer: buffer<uint> | buffer<atomic<uint>>,
	indirectOffset: number,
	shaderInst: ShadeupShaderInstance
) {
	let computeCall = new ShaderDispatch('compute');

	computeCall.indirectBuffer = indirectBuffer;
	computeCall.indirectOffset = indirectOffset;

	let compShader = shaderInst.get(graphicsAdapter, 'compute', {
		initialDispatch: shaderInst
	});
	if (!compShader) {
		throw new Error('Fragment shader not found');
	}

	computeCall.setComputeShader(compShader);

	shaderInst.bindUniforms(computeCall.fragmentUniforms);

	if (graphicsAdapter instanceof WebGPUAdapter) {
		graphicsAdapter.dispatchCompute(computeCall);
	} else {
		throw new Error('WebGL compute not supported');
	}
}

(window as any).__shadeup_dispatch_compute_indirect = __shadeup_dispatch_compute_indirect;

function __shadeup_dispatch_draw_advanced(config: {
	fragment: ShadeupShaderInstance;
	vertex: ShadeupShaderInstance;
	mesh?: Mesh;
	instances?: number;
	indirect?: buffer<uint> | buffer<atomic<uint>>;
	indexBuffer?: buffer<uint>;
	attachments: ShadeupTexture2d[];
	depthTest?: boolean;
	depthOnly?: boolean;
	depth?: ShadeupTexture2d;
	depthCompare?:
		| 'greater'
		| 'less'
		| 'equal'
		| 'greater-equal'
		| 'less-equal'
		| 'not-equal'
		| 'always'
		| 'never';
	backfaceCulling?: boolean;
}) {
	let drawCall = new ShaderDispatch('draw');
	if (config.mesh) {
		drawCall.drawType = 'geometry';
	} else if (config.indexBuffer) {
		drawCall.drawType = 'indexed';
	}

	if (config.depth) {
		drawCall.overrideDepth = config.depth;
	}

	if (config.depthCompare) {
		drawCall.depthCompare = config.depthCompare;
	}

	if ('backfaceCulling' in config) {
		drawCall.backfaceCulling = config.backfaceCulling!;
	}

	if (config.indirect) {
		drawCall.indirectBuffer = config.indirect;
	}

	drawCall.instanceCount = config.instances ?? 1;

	drawCall.attachments = config.attachments ?? null;
	drawCall.depthOnly = config.depthOnly ?? false;

	let fragShader = config.fragment.get(graphicsAdapter, 'fragment', {
		attachments: config.attachments ? config.attachments.map((a) => a.innerType) : undefined
	});
	if (!fragShader) {
		throw new Error('Fragment shader not found');
	}

	drawCall.setFragmentShader(fragShader);

	let vertShader = config.vertex.get(graphicsAdapter, 'vertex');

	if (!vertShader) {
		throw new Error('Vertex shader not found');
	}

	drawCall.setVertexShader(vertShader);

	config.fragment.bindUniforms(drawCall.fragmentUniforms);

	config.vertex.bindUniforms(drawCall.vertexUniforms);

	if (config.mesh) {
		drawCall.setGeometry(config.mesh as any);
	} else if (config.indexBuffer) {
		drawCall.setIndexBuffer(config.indexBuffer);
	}

	graphicsAdapter.dispatch(drawCall, {
		depthTest: config.depthTest ?? true
	});
}

(window as any).__shadeup_dispatch_draw_advanced = __shadeup_dispatch_draw_advanced;

function __shadeup_dispatch_draw(pixelShaderInst: ShadeupShaderInstance) {
	if (!fullscreenVertexShader) {
		fullscreenVertexShader = __shadeup_gen_native_shader(
			{
				webgl: `#version 300 es
		
		precision highp float;
		
		in vec3 a_position;
		in vec3 a_normal;
		in vec3 a_tangent;
		in vec3 a_bitangent;
		in vec2 a_uv;
		in vec4 a_color;

		out vec3 _v_position;
		out vec3 _v_normal;
		out vec3 _v_tangent;
		out vec3 _v_bitangent;
		out vec2 _v_uv;
		out vec4 _v_color;
		
		void main(void) {
		float x = float((gl_VertexID & 1) << 2);
		float y = float((gl_VertexID & 2) << 1);
		_v_uv.x = x * 0.5;
		_v_uv.y = 1.f - (y * 0.5);
		gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
		}`,
				webgpu: `
			struct VertexOutput {
				@builtin(position) Position : vec4<f32>,
				@location(0) Normal : vec3<f32>,
				@location(1) Tangent : vec3<f32>,
				@location(2) Bitangent : vec3<f32>,
				@location(3) TexCoord : vec2<f32>,
				@location(4) Color : vec4<f32>,
				@location(5) @interpolate(flat) instanceIndex : u32,
				@location(6) WorldPosition : vec3<f32>,
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
				output.Tangent = vec3<f32>(0.0, 1.0, 0.0);
				output.Bitangent = vec3<f32>(0.0, 0.0, 1.0);
				output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
				output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
				output.instanceIndex = 0;
		
				return output;
			}
			`,
				software: () => {}
			},
			'vertex'
		);
	}

	if (!fullscreenVertexShader) {
		throw new Error('Fullscreen vertex shader not found');
	}

	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'screen';
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	drawCall.setVertexShader(fullscreenVertexShader);
	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment', {
		initialDispatch: pixelShaderInst
	});
	if (!fragShader) {
		throw new Error('Fragment shader not found');
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	drawCall.setGeometry(fullscreenGeo as any);

	graphicsAdapter.dispatch(drawCall, {
		depthTest: false
	});
}

function makeFullscreenQuadGeometry() {
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

	return geo;
}

(window as any).PLATFORM_WEBGL = preferredAdapter == 'webgl';
(window as any).PLATFORM_WEBGPU = preferredAdapter == 'webgpu';

(window as any).__shadeup_dispatch_draw = __shadeup_dispatch_draw;

function __shadeup_dispatch_draw_geometry(
	geometry: Mesh,
	vertexShaderInst: ShadeupShaderInstance,
	pixelShaderInst: ShadeupShaderInstance
) {
	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'geometry';
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment');
	if (!fragShader) {
		return;
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	let vertShader = vertexShaderInst.get(graphicsAdapter, 'vertex');
	if (!vertShader) {
		return;
	}

	drawCall.setVertexShader(vertShader);

	vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

	drawCall.setGeometry(geometry);

	graphicsAdapter.dispatch(drawCall);
}

(window as any).__shadeup_dispatch_draw_geometry = __shadeup_dispatch_draw_geometry;

function __shadeup_dispatch_draw_indexed(
	indexBuffer: buffer<uint>,
	vertexShaderInst: ShadeupShaderInstance,
	pixelShaderInst: ShadeupShaderInstance
) {
	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'indexed';
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment');
	if (!fragShader) {
		return;
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	let vertShader = vertexShaderInst.get(graphicsAdapter, 'vertex-indexed');
	if (!vertShader) {
		return;
	}

	drawCall.setVertexShader(vertShader);

	vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

	drawCall.setIndexBuffer(indexBuffer);

	graphicsAdapter.dispatch(drawCall);
}

(window as any).__shadeup_dispatch_draw_indexed = __shadeup_dispatch_draw_indexed;

function __shadeup_dispatch_draw_instanced_indexed(
	indexBuffer: buffer<uint>,
	instanceCount: int,
	vertexShaderInst: ShadeupShaderInstance,
	pixelShaderInst: ShadeupShaderInstance
) {
	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'indexed';
	drawCall.instanceCount = instanceCount;
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment');
	if (!fragShader) {
		return;
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	let vertShader = vertexShaderInst.get(graphicsAdapter, 'vertex-indexed');
	if (!vertShader) {
		return;
	}

	drawCall.setVertexShader(vertShader);

	vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

	drawCall.setIndexBuffer(indexBuffer);

	graphicsAdapter.dispatch(drawCall);
}

(window as any).__shadeup_dispatch_draw_instanced_indexed =
	__shadeup_dispatch_draw_instanced_indexed;

function __shadeup_dispatch_draw_instanced(
	mesh: Mesh,
	instanceCount: int,
	vertexShaderInst: ShadeupShaderInstance,
	pixelShaderInst: ShadeupShaderInstance
) {
	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'geometry';
	drawCall.instanceCount = instanceCount;
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment');
	if (!fragShader) {
		return;
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	let vertShader = vertexShaderInst.get(graphicsAdapter, 'vertex');
	if (!vertShader) {
		return;
	}

	drawCall.setVertexShader(vertShader);

	vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

	drawCall.setGeometry(mesh);

	graphicsAdapter.dispatch(drawCall);
}

(window as any).__shadeup_dispatch_draw_instanced = __shadeup_dispatch_draw_instanced;

function __shadeup_dispatch_draw_count(
	count: number,
	vertexShaderInst: ShadeupShaderInstance,
	pixelShaderInst: ShadeupShaderInstance
) {
	let drawCall = new ShaderDispatch('draw');
	drawCall.drawType = 'count';
	drawCall.drawCount = count;
	drawCall.setVertexUniform(
		'_vtex_canvas',
		makePrimitiveUniform(
			{
				type: 'primitive',
				name: 'float2'
			},
			[canvas.width, canvas.height]
		)
	);

	let fragShader = pixelShaderInst.get(graphicsAdapter, 'fragment');
	if (!fragShader) {
		return;
	}

	drawCall.setFragmentShader(fragShader);

	pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);

	let vertShader = vertexShaderInst.get(graphicsAdapter, 'vertex-indexed');
	if (!vertShader) {
		return;
	}

	drawCall.setVertexShader(vertShader);

	vertexShaderInst.bindUniforms(drawCall.vertexUniforms);

	graphicsAdapter.dispatch(drawCall);
}

(window as any).__shadeup_dispatch_draw_count = __shadeup_dispatch_draw_count;

function __shadeup_get_struct(name) {
	if (!window.__shadeup_structs) window.__shadeup_structs = {};
	return window.__shadeup_structs[name];
}

function __shadeup_register_struct(fields, cls) {
	if (!window.__shadeup_structs) window.__shadeup_structs = {};
	window.__shadeup_structs[fields.name] = { fields, struct: cls };
}

(window as any).__shadeup_register_struct = __shadeup_register_struct;

function __shadeup_error(err, context) {
	return err || context;

	if (!err.__shadeup_stack) {
		return { stack: [context], error: err, message: err.message };
	} else {
		err.stack.push(context);
		return err;
	}
}

let initFuncs = new Map<string, Function>();

let sourceWindow: MessageEventSource | null = null;
let sourceOrigin: MessageEventSource | null = null;

(window as any).bubbleError = function (err: string) {
	if (!sourceWindow || !sourceOrigin) {
		return;
	}
	sourceWindow.postMessage(err, sourceOrigin);
};

let mainRestart = () => {};

let loadedAssets = new Map<string, any>();
let primedTextureAssets = new Map<string, ShadeupTexture2d>();

async function loadLib(name: string) {
	if (name == 'rapier2d') {
		console.log('Loading rapier2d');
		(window as any).RAPIER_2D = await import('https://cdn.skypack.dev/@dimforge/rapier2d-compat');
		console.log('Loaded rapier2d');
		await (window as any).RAPIER_2D.init();
		console.log('Initialized rapier2d');
	} else if (name == 'rapier3d') {
		(window as any).RAPIER_3D = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');
		await (window as any).RAPIER_3D.init();
	}
}

async function loadLibs() {
	console.log('Loading libs', [...registeredLibs.keys()]);
	await Promise.all(
		[...registeredLibs.keys()].map(async (lib) => {
			await loadLib(lib);
		})
	);
}

async function loadAssets() {
	let promises = [];
	console.log('Loading assets', [...registeredLoads.keys()]);
	registeredLoads = registeredLoads.filter((load) => {
		return !loadedAssets.has(load[0]);
	});

	for (let load of registeredLoads) {
		promises.push(
			(async () => {
				let [key, type] = load as [string, AssetFileType];
				let baseUrl = 'https://assets.shadeup.dev/';
				// if (key.startsWith('models/') || key.startsWith('textures/')) {
				// 	baseUrl = 'localhost:5173/assets/';
				// }
				if (type == 'image') {
					await new Promise<void>((resolve) => {
						let img = new Image();
						img.crossOrigin = 'anonymous';
						img.onerror = () => {
							console.error('Failed to load image ' + key);
							resolve();
						};
						img.onload = async () => {
							let canvas = document.createElement('canvas');
							canvas.width = img.width;
							canvas.height = img.height;
							// document.body.appendChild(canvas);
							let ctx = canvas.getContext('2d');
							if (ctx) ctx.drawImage(img, 0, 0);
							loadedAssets.set(key, canvas);

							let tex = (window as any).shadeupMakeTextureInternal(
								[canvas.width, canvas.height],
								'8bit',
								'uint8'
							) as ShadeupTexture2d;
							tex.adapter?.drawImage(canvas, 0, 0, canvas.width, canvas.height);
							tex.adapter?.flush();

							if (tex.adapter instanceof WebGPUAdapter) {
								await tex.adapter.waitForDraw();
							}

							primedTextureAssets.set(key, tex);

							resolve();
						};
						img.src = baseUrl + key;
					});
				} else if (type == 'audio') {
					await new Promise<void>((resolve) => {
						let audio = new Audio();
						audio.oncanplaythrough = () => {
							loadedAssets.set(key, audio);
							resolve();
						};
						audio.src = baseUrl + key;
					});
				} else if (type == 'video') {
					await new Promise<void>((resolve) => {
						let video = document.createElement('video');
						video.oncanplaythrough = () => {
							loadedAssets.set(key, video);
							resolve();
						};
						video.src = baseUrl + key;
					});
				} else {
					let raw = fetch(baseUrl + key);
					if (type == 'binary') {
						await raw
							.then((res) => res.arrayBuffer())
							.then((res) => {
								loadedAssets.set(key, res);
							});
					} else if (type == 'text') {
						await raw
							.then((res) => res.text())
							.then((res) => {
								loadedAssets.set(key, res);
							});
					} else if (type == 'model') {
						await raw
							.then((res) => res.arrayBuffer())
							.then(async (res) => {
								const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
								const { Vector3, Mesh: THREEMesh, MeshStandardMaterial } = await import('three');

								const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');
								const dracoLoader = new DRACOLoader();
								dracoLoader.setDecoderPath('/lib/draco/');

								const loader = new GLTFLoader();

								loader.setDRACOLoader(dracoLoader);
								let out = await new Promise<GLTF>((reso, rej) => {
									loader.parse(
										res,
										'',
										(d) => {
											reso(d);
										},
										(e) => {
											rej(e);
										}
									);
								});

								let parts: any[] = [];
								let scene = out.scene;

								class SHD_Mesh {}

								function convertMesh(mesh: THREE.Mesh): SHD_Mesh {
									let positions: [number, number, number][] = [];
									let normals: [number, number, number][] = [];
									let tangents: [number, number, number][] = [];
									let bitangents: [number, number, number][] = [];
									let uvs: [number, number][] = [];
									let colors: [number, number, number, number][] = [];
									let indices: number[] = [];

									if (mesh.geometry.index) {
										for (let i = 0; i < mesh.geometry.index.count; i++) {
											indices.push(mesh.geometry.index?.array[i]);
										}
									}
									if (mesh.geometry.attributes.position) {
										for (let i = 0; i < mesh.geometry.attributes.position.array.length; i += 3) {
											positions.push([
												mesh.geometry.attributes.position.array[i],
												mesh.geometry.attributes.position.array[i + 1],
												mesh.geometry.attributes.position.array[i + 2]
											]);
										}
									}
									if (mesh.geometry.attributes.normal) {
										for (let i = 0; i < mesh.geometry.attributes.normal.array.length; i += 3) {
											normals.push([
												mesh.geometry.attributes.normal.array[i],
												mesh.geometry.attributes.normal.array[i + 1],
												mesh.geometry.attributes.normal.array[i + 2]
											]);
										}
									}
									if (mesh.geometry.attributes.tangent) {
										for (let i = 0; i < mesh.geometry.attributes.tangent.array.length; i += 4) {
											tangents.push([
												mesh.geometry.attributes.tangent.array[i],
												mesh.geometry.attributes.tangent.array[i + 1],
												mesh.geometry.attributes.tangent.array[i + 2]
											]);
										}
									}
									if (mesh.geometry.attributes.bitangent) {
										for (let i = 0; i < mesh.geometry.attributes.bitangent.array.length; i += 3) {
											bitangents.push([
												mesh.geometry.attributes.bitangent.array[i],
												mesh.geometry.attributes.bitangent.array[i + 1],
												mesh.geometry.attributes.bitangent.array[i + 2]
											]);
										}
									}
									if (mesh.geometry.attributes.uv) {
										for (let i = 0; i < mesh.geometry.attributes.uv.array.length; i += 2) {
											uvs.push([
												mesh.geometry.attributes.uv.array[i],
												mesh.geometry.attributes.uv.array[i + 1]
											]);
										}
									}
									if (mesh.geometry.attributes.color) {
										for (let i = 0; i < mesh.geometry.attributes.color.array.length; i += 4) {
											colors.push([
												mesh.geometry.attributes.color.array[i],
												mesh.geometry.attributes.color.array[i + 1],
												mesh.geometry.attributes.color.array[i + 2],
												mesh.geometry.attributes.color.array[i + 3]
											]);
										}
									}

									let m = new (window as any).SHD_Mesh({}) as any;

									m.vertices = positions;
									m.normals = normals;
									m.uvs = uvs;
									m.colors = colors;
									m.triangles = indices;

									return m;
								}
								function convertTexMap(map: THREE.Texture): ShadeupTexture2d {
									let t = shadeupMakeTextureFromImageLike(map.source.data);
									return t;
								}
								scene.traverse((obj) => {
									if (obj instanceof THREEMesh && obj.isMesh) {
										let mobj = obj as THREE.Mesh;
										let m = convertMesh(mobj);
										let mat = mobj.material;
										let part = new (window as any).SHD_ModelPart({}) as any;
										if (!Array.isArray(mat)) {
											let shdMat = new (window as any).SHD_Material({}) as any;
											if (mat instanceof MeshStandardMaterial) {
												shdMat.baseColor = [mat.color.r, mat.color.g, mat.color.b, 1];
												if (mat.normalMap) {
													shdMat.normal = convertTexMap(mat.normalMap);
													shdMat.normalScale = [mat.normalScale.x, mat.normalScale.y];
												}

												if (mat.map) {
													shdMat.color = convertTexMap(mat.map);
												}

												if (mat.metalnessMap) {
													shdMat.metallic = convertTexMap(mat.metalnessMap);
												}

												if (mat.roughnessMap) {
													shdMat.roughness = convertTexMap(mat.roughnessMap);
												}

												if (mat.emissiveMap) {
													shdMat.emissive = convertTexMap(mat.emissiveMap);
												}

												part.material = shdMat;
											}
										}
										part.mesh = m;
										let world = obj.getWorldPosition(new Vector3());
										part.position = [world.x, world.y, world.z];

										parts.push(part);
									}
								});

								let model = new (window as any).SHD_Model({}) as any;
								model.parts = parts;

								loadedAssets.set(key, model);
							});
					}
				}
			})()
		);
	}

	await Promise.all(promises);
	console.log('Loaded assets', [...loadedAssets.keys()]);
}

window.addEventListener('message', async function (e: MessageEvent) {
	var mainWindow = e.source;
	sourceWindow = mainWindow;
	sourceOrigin = e.origin;
	var result = '';

	if (e.data.type == 'frame') {
		logger.innerHTML = '';
		logger.style.display = 'none';
		fpsCanvas.style.display = 'block';
		try {
			let files: ShadeupRenderedFile[] = e.data.files;
			let hasMain = files.some((f) => f.path == '/main.js');
			registeredLoads.splice(0, registeredLoads.length);
			registeredLibs.clear();
			// loadedAssets.clear();
			// console.log(e.data);

			for (let file of files) {
				// console.log(file);
				(() => {
					let define = (deps: string[], func: Function) => {
						globalDefine(file.path, deps, func);
					};
					(window as any).define = define;
					try {
						let f = new Function(`${file.contents}`);
						f();
					} catch (e: any) {
						console.error(e);
						result = e.message;
						console.log(file.contents);
					}
				})();
			}

			globalRequire(['/_std/mesh.js'])[0];

			// Load any assets before calling main

			await loadAssets();
			await loadLibs();

			if (hasMain) {
				try {
					let outs = globalRequire(['/main.js'])[0];

					if (typeof outs.main === 'function') {
						frameFunc = outs.main;

						hasLoadedCode = true;
					} else {
						result = 'main is not a function';
					}
				} catch (e) {
					console.error(e);
					result = e.message;
				}
				mainRestart = () => {
					try {
						let outs = globalRequire(['/main.js'])[0];

						if (typeof outs.main === 'function') {
							frameFunc = outs.main;

							hasLoadedCode = true;
						} else {
							result = 'main is not a function';
						}
					} catch (e) {
						console.error(e);
					}
				};
			}
		} catch (e) {
			console.error(e);

			result = 'eval() threw an exception.';
		}
		mainWindow.postMessage(result, e.origin);
	} else if (e.data.type == 'preview') {
		console.log('preview received', e.data);
		registeredLoads.splice(0, registeredLoads.length);
		registeredLibs.clear();
		// loadedAssets.clear();

		isFirstFrame = true;
		hasLoadedCode = false;
		frameFunc = () => {};
		clear();

		(() => {
			let define = (path: string, deps: string[], func: Function) => {
				globalDefine(path, deps, func);
			};
			(window as any).define = define;
			try {
				let f = new Function(`${e.data.code}`);
				f();
			} catch (e: any) {
				console.error(e);
				result = e.message;
			}
		})();

		globalRequire(['/_std/mesh.js'])[0];

		await loadAssets();
		await loadLibs();

		try {
			let outs = globalRequire(['/main.js'])[0];

			if (typeof outs.main === 'function') {
				frameFunc = outs.main;
				hasLoadedCode = true;
			} else {
				result = 'main is not a function';
			}
		} catch (e) {
			console.log(e);
			(window as any).bubbleError(e.message);
		}

		sizeCanvas();
	} else if (e.data.type == 'focus') {
		mouseState.focused = e.data.focused;
		mouseState.button[0] = false;
		mouseState.button[1] = false;
		mouseState.button[2] = false;
		mouseState.dragging = false;
	} else if (e.data.type == 'restart') {
		registeredLoads.splice(0, registeredLoads.length);
		registeredLibs.clear();
		// loadedAssets.clear();

		resetFrameContext();
		logger.innerHTML = '';
		logger.style.display = 'none';

		sizeCanvas();

		mainRestart();
	} else if (e.data.type == 'kill') {
		registeredLoads.splice(0, registeredLoads.length);
		registeredLibs.clear();
		loadedAssets.clear();

		clear();
		frameFunc = () => {};
		isFirstFrame = true;
		hasLoadedCode = false;
		resetFrameContext();
	} else if (e.data.type == 'frameless') {
		fpsCanvas.style.display = 'none';
	} else if (e.data.type == 'meta') {
		console.log('got meta', e.data);
		lastFrame = performance.now();
		playing = e.data.playing;
		if (e.data.timeMultiplier) {
			timeMultiplier = e.data.timeMultiplier;
		}
		if ('useAnimationFrame' in e.data) {
			useAnimationFrame = e.data.useAnimationFrame;
		}
		if (e.data.roundedCorners) {
			if (!container) return;
			let containerEl = container as HTMLElement;

			if (e.data.roundedCorners.topLeft) {
				canvas.style.borderTopLeftRadius = '0.75rem';
				containerEl.style.borderTopLeftRadius = '0.75rem';
			} else {
				canvas.style.borderTopLeftRadius = '0';
				containerEl.style.borderTopLeftRadius = '0';
			}

			if (e.data.roundedCorners.topRight) {
				canvas.style.borderTopRightRadius = '0.75rem';
				containerEl.style.borderTopRightRadius = '0.75rem';
			} else {
				canvas.style.borderTopRightRadius = '0';
				containerEl.style.borderTopRightRadius = '0';
			}

			if (e.data.roundedCorners.bottomLeft) {
				canvas.style.borderBottomLeftRadius = '0.75rem';
				containerEl.style.borderBottomLeftRadius = '0.75rem';
			} else {
				canvas.style.borderBottomLeftRadius = '0';
				containerEl.style.borderBottomLeftRadius = '0';
			}

			if (e.data.roundedCorners.bottomRight) {
				canvas.style.borderBottomRightRadius = '0.75rem';
				containerEl.style.borderBottomRightRadius = '0.75rem';
			} else {
				canvas.style.borderBottomRightRadius = '0';
				containerEl.style.borderBottomRightRadius = '0';
			}
		}
		if ('transparent' in e.data) {
			if (container && container instanceof HTMLElement) {
				if (e.data.transparent) {
					container.style.backgroundColor = 'transparent';
				} else {
					container.style.backgroundColor = '#111111';
				}
			}
		}
		if (e.data.fullscreen) {
			this.document.body.classList.add('fullscreen');
		} else {
			this.document.body.classList.remove('fullscreen');
		}
	} else if (e.data.type == 'screenshot') {
		if (canvas) {
			let data = canvas.toDataURL('image/png');

			mainWindow.postMessage(
				{ type: 'screenshot', data: data, width: canvas.width, height: canvas.height },
				e.origin
			);
		} else {
			mainWindow.postMessage({ type: 'screenshot', data: null }, e.origin);
		}
	} else if (e.data.type == 'video') {
		if (canvas) {
			let framerate = e.data.framerate ?? 30;
			let duration = e.data.duration ?? 10;
			let width = e.data.width ?? canvas.width;
			let height = e.data.height ?? canvas.height;
			let format = e.data.format ?? 'webm';

			let videoStream = canvas.captureStream(framerate);
			let mediaRecorder = new MediaRecorder(videoStream, {
				videoBitsPerSecond: width * height * framerate * 4 * 8
			});

			let chunks: Blob[] = [];
			mediaRecorder.ondataavailable = function (e) {
				chunks.push(e.data);
			};
			let ogOrigin = e.origin;
			mediaRecorder.onstop = async function (e) {
				let blob = new Blob(chunks, { type: 'video/mp4' });
				chunks = [];
				let video = document.createElement('video');

				let videoURL = URL.createObjectURL(blob);
				// video.src = videoURL;
				// video.style.position = 'absolute';
				// video.style.top = '0';
				// video.style.left = '0';
				// document.body.appendChild(video);

				if (format == 'mp4') {
					let funcs = await getFfmpeg();
					let out = await funcs.transcode(videoURL);
					videoURL = out;
				}
				let elem = window.document.createElement('a');
				elem.href = videoURL; //window.URL.createObjectURL(blob);
				elem.download = 'shadeup_video_capture.' + format.toLowerCase();
				document.body.appendChild(elem);
				elem.click();
				document.body.removeChild(elem);

				if (mainWindow)
					mainWindow.postMessage(
						{
							type: 'video',
							data: videoURL,
							width: canvas.width,
							height: canvas.height,
							framerate: framerate,
							duration: duration
						},
						ogOrigin
					);
			};
			mediaRecorder.ondataavailable = function (e) {
				chunks.push(e.data);
			};

			mediaRecorder.start();
			setTimeout(function () {
				mediaRecorder.stop();
			}, duration * 1000);
		}
	} else if (e.data.type == 'enqueue-screenshots') {
		screenshotQueue.push(...e.data.items);
	} else if (e.data.type == 'get-canvas-size') {
		mainWindow.postMessage(
			{ type: 'get-canvas-size', width: canvas.width, height: canvas.height },
			e.origin
		);
	} else if (e.data.type == 'setInput') {
		if (!e.data.key) {
			console.error('No key provided for input');
			return;
		}
		inputValues.set(e.data.key, e.data.value);
	}
});

function printImage(url: string, size = 10) {
	var image = new Image();
	image.onload = function () {
		var style = [
			'font-size: 1px;',
			'padding: ' + (this.height / 100) * size + 'px ' + (this.width / 100) * size + 'px;',
			'background: url(' + url + ') no-repeat;',
			'background-size: contain;'
		].join(' ');
		console.log('%c ', style);
	};
	image.src = url;
}
(window as any)._SHADEUP_UI_PUCK = puck;
(window as any)._SHADEUP_UI_SLIDER = slider;
(window as any)._SHADEUP_UI_CONTROL = (name: string, ...args: any[]) => {
	return controls[name](...args);
};

window.parent.postMessage({ type: 'ready' }, '*');

function bubbleToParent(e: Event) {
	if (!sourceWindow || !sourceOrigin) {
		return;
	}
	sourceWindow.postMessage(
		{
			type: 'keydown',
			event: {
				key: (e as KeyboardEvent).key,
				ctrlKey: (e as KeyboardEvent).ctrlKey,
				altKey: (e as KeyboardEvent).altKey,
				metaKey: (e as KeyboardEvent).metaKey,
				shiftKey: (e as KeyboardEvent).shiftKey,
				code: (e as KeyboardEvent).code
			}
		},
		sourceOrigin
	);
}

function handleKeyDown(e: KeyboardEvent) {
	if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		bubbleToParent(e);
	}

	if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		bubbleToParent(e);
	}
}

window.addEventListener('keydown', handleKeyDown);

(async () => {
	do {
		await frameLoop();
		if (graphicsAdapter instanceof WebGPUAdapter) {
			// await graphicsAdapter.waitForDraw();
		}
		if (useAnimationFrame) {
			await new Promise(requestAnimationFrame);
		} else {
			await new Promise(setZeroTimeout);
		}
	} while (true);
})();

let ffmpegFuncs = {};
let ffmpeg = null;
let ffmpegLoaded = false;
async function getFfmpeg(): Promise<any> {
	if (!ffmpegLoaded) {
		const { FFmpeg } = await import('@ffmpeg/ffmpeg');
		const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
		const ffmpeg = new FFmpeg();
		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm';

		ffmpeg.on('log', ({ message }) => {
			console.log(message);
		});
		// toBlobURL is used to bypass CORS issue, urls with the same
		// domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
		});

		ffmpegFuncs = {
			async transcode(input: string) {
				await ffmpeg.writeFile('input.webm', await fetchFile(input));
				await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
				const data = await ffmpeg.readFile('output.mp4');
				let video = document.createElement('video');
				let outSrc = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
				video.src = outSrc;
				video.autoplay = true;
				video.loop = true;
				video.controls = true;
				document.body.appendChild(video);
				video.style.position = 'absolute';
				video.style.top = '0';
				return outSrc;
			}
		};
		ffmpegLoaded = true;
	}

	return ffmpegFuncs;
}
