import {
	float4,
	float3,
	float,
	float2,
	bool,
	int,
	int2,
	int3,
	int4,
	uint,
	uint2,
	uint3,
	uint4,
	uint8
} from '/std_math';

import {
	ShaderInput,
	ShaderOutput,
	shader,
	draw,
	drawInstanced,
	drawAdvanced,
	drawIndexed
} from '/_std/drawIndexed';

import { Mesh } from '/_std/mesh';
import { PaintingContext } from '/_std/paint';

export class texture2d_internal_empty<T> {
	__opaque_texture2d: true = true;

	/** @shadeup=glsl(!texture($self$, $0$)) */
	__index(index: int2 | uint2): T {
		return null as any;
	}

	__index_assign(index: int2 | uint2, value: T): void {
		return null as any;
	}

	getFast(index: int2 | uint2): T {
		return null as any;
	}

	setFast(index: int2 | uint2, value: T): void {
		return null as any;
	}

	/** @shadeup=tag(async) */
	download(): void {}

	downloadAsync(): Promise<void> {
		return null as any;
	}

	/**
	 * Returns the underlying cpu buffer as a typed array.
	 *
	 * Note that this is considerably faster than using the raw index [] operator.
	 *
	 * ```shadeup
	 * let tex = texture2d<float4>();
	 * let data = tex.getData();
	 *
	 * for (let i = 0; i < data.length; i += 4) {
	 * 	let r = data[i];
	 * 	let g = data[i + 1];
	 * 	let b = data[i + 2];
	 * 	let a = data[i + 3];
	 *
	 * 	// Do something with the pixel
	 * }
	 * ```
	 */
	getData(): Uint32Array | Float32Array | Uint8Array | Int32Array {
		return new Uint32Array(0);
	}

	upload(): void {}

	size: float2 = [0, 0];

	paint: PaintingContext = null as any;

	sample(position: float2): float4 {}

	clear(color: float | float4 | 'auto' = 'auto'): void {}
	flush(): void {}
	// draw(
	// 	geometry: Mesh,
	// 	vertexShader: shader<ShaderInput, ShaderOutput>,
	// 	pixelShader: shader<ShaderInput, ShaderOutput>
	// ): void;
	// draw(fullScreenPixelShader: shader<ShaderInput, ShaderOutput>): void;
	// draw() {
	// 	throw new Error('Not implemented');
	// }

	draw: typeof draw;

	drawIndexed: typeof drawIndexed;
	drawAdvanced: typeof drawAdvanced;
	drawInstanced: typeof drawInstanced;

	/** Release the texture */
	destroy() {}
}

export type texture2d<T> = texture2d_internal_empty<T>;
export type TextureFormat = '32bit' | '16bit' | '8bit' | 'depth' | 'depth-32' | 'auto';
export function texture2d<T = uint8>(
	size: float2,
	format: TextureFormat,
	type: string
): texture2d<T> {
	return (window as any).shadeupMakeTextureInternal(size, format, type) as texture2d<T>;
}

export class texture3d_internal_empty<T> {
	__opaque_texture3d: true = true;

	/** @shadeup=glsl(!texture($self$, $0$)) */
	__index(index: int3): T {
		return null as any;
	}
	__index_assign(index: int3, value: T): void {}
	size: float3 = [0, 0, 0];

	sample(position: float3): float4 {}
}

export type texture3d<T> = texture3d_internal_empty<T>;

export function texture3d<T>(size: float3, type: string): texture3d<T> {
	return (window as any).shadeupMakeTextureInternal(size, type) as texture3d<T>;
}
