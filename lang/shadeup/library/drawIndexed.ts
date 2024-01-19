import { buffer } from '/_std/buffer';
import { Mesh } from '/_std/mesh';
import { texture2d } from '/_std/texture';
import { float4, float3, float, float2, bool, int, uint, atomic, int3 } from '/std_math';

export function drawIndexed(
	indexBuffer: buffer<uint>,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_indexed(indexBuffer, vertexShader, pixelShader);
}

export function drawInstanced(
	mesh: Mesh,
	instanceCount: int,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_instanced(mesh, instanceCount, vertexShader, pixelShader);
}

export function drawInstancedIndexed(
	indexBuffer: buffer<uint>,
	instanceCount: int,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_instanced_indexed(indexBuffer, instanceCount, vertexShader, pixelShader);
}

export function drawIndexedIndirect(
	indirectBuffer: buffer<int> | buffer<atomic<int>>,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_indexed_indirect(indirectBuffer, vertexShader, pixelShader);
}

export function drawIndirect(
	mesh: Mesh,
	indirectBuffer: buffer<int> | buffer<atomic<int>>,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_indirect(mesh, indirectBuffer, vertexShader, pixelShader);
}

export function shader_start_shd_<T_IN, T_OUT, T_COMPUTE_Z>(
	s: shader<T_IN, T_OUT, T_COMPUTE_Z>,
	groupSize?: any
): shader<T_IN, T_OUT, T_COMPUTE_Z> {
	return s;
}

export type shader<T_IN = ShaderInput, T_OUT = ShaderOutput, T_COMPUTE_Z = 0> = (
	__in: Omit<T_IN, 'vertexIndex'>
) => T_OUT;
declare global {
	// function __shadeup_make_shader_inst(
	// 	key: string,
	// 	params: any,
	// 	closure: any
	// ): shader<ShaderInput, ShaderOutput>;
	// function __shadeup_dispatch_draw(fullScreenPixelShader: shader<ShaderInput, ShaderOutput>): void;
	// function __shadeup_dispatch_draw_geometry(
	// 	geometry: Mesh,
	// 	vertexShader: shader<ShaderInput, ShaderOutput>,
	// 	pixelShader: shader<ShaderInput, ShaderOutput>
	// ): void;

	interface Array<T> {
		[index: int]: T;
	}

	let window: {
		[index: string]: any;
	};
}

/**@shadeup=struct*/
export class ShaderInput {
	/** Interpolated world position (available in fragment, and vertex) */
	position: float3 = float3(0, 0, 0);

	/** Interpolated normal (fragment), Source mesh normal (vertex) */
	normal: float3 = float3(0, 0, 0);

	/** Interpolated tangent (fragment), Source mesh tangent (vertex) */
	tangent: float3 = float3(0, 0, 0);

	/** Interpolated bitangent (fragment), Source mesh bitangent (vertex) */
	bitangent: float3 = float3(0, 0, 0);

	/** Vertex shader output position */
	clipPosition: float4 = float4(0, 0, 0, 0);

	realPosition: float4 = float4(0, 0, 0, 0);

	/** UV channel 0 input (available in fragment, and vertex) */
	uv: float2 = float2(0, 0);

	/** Screen position in pixels (available in fragment, and vertex) */
	screen: float2 = float2(0, 0);

	/** Interpolated vertex color (available in fragment, and vertex)  */
	color: float4 = float4(0, 0, 0, 0);

	/** Group ID (available in compute) */
	groupId: int3 = int3(0, 0, 0);

	/** Group size (available in compute) */
	groupSize: int3 = int3(0, 0, 0);

	/** Global id (groupId * groupSize + localId) (available in compute) */
	globalId: int3 = int3(0, 0, 0);

	/** Local id (available in compute) */
	localId: int3 = int3(0, 0, 0);

	/** Instance index (available in fragment, and vertex) */
	instanceIndex: int = 0;

	/** Vertex index (available in vertex) */
	vertexIndex: int = 0;

	/** @shadeup=noemit_gpu */
	attr<T>(index: int, interpolation?: 'flat' | 'linear' | 'perspective'): T {
		return null as any;
	}
}

/**@shadeup=struct*/
export class ShaderOutput {
	/** Vertex output position */
	position: float4 = float4(0, 0, 0, 0);

	/** Vertex output normal */
	normal: float3 = float3(0, 0, 0);

	/** Vertex output tangent */
	tangent: float3 = float3(0, 0, 0);

	/** Vertex output bitangent */
	bitangent: float3 = float3(0, 0, 0);

	/** UV channel 0 output */
	uv: float2 = float2(0, 0);

	/** Pixel color output */
	color: float4 = float4(0, 0, 0, 0);

	/** @shadeup=noemit_gpu */
	attr<T>(index: int, value: T, interpolation?: 'flat' | 'linear' | 'perspective') {}
}

/** @shadeup=shader */
export function makeShader<I, O, CZ = 0>(
	key: string,
	fn: (__in: I, __out: O) => void
): shader<I, O, CZ> {
	return fn as shader<I, O, CZ>;
}

type AttachmentBindings1<A0> = {
	attachments: [texture2d<A0>];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
		}
	>;
};
type AttachmentBindings2<A0, A1> = {
	attachments: [texture2d<A0>, texture2d<A1>];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
		}
	>;
};
type AttachmentBindings3<A0, A1, A2> = {
	attachments: [texture2d<A0>, texture2d<A1>, texture2d<A2>];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
		}
	>;
};
type AttachmentBindings4<A0, A1, A2, A3> = {
	attachments: [texture2d<A0>, texture2d<A1>, texture2d<A2>, texture2d<A3>];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
			attachment3: A3;
		}
	>;
};
type AttachmentBindings5<A0, A1, A2, A3, A4> = {
	attachments: [texture2d<A0>, texture2d<A1>, texture2d<A2>, texture2d<A3>, texture2d<A4>];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
			attachment3: A3;
			attachment4: A4;
		}
	>;
};
type AttachmentBindings6<A0, A1, A2, A3, A4, A5> = {
	attachments: [
		texture2d<A0>,
		texture2d<A1>,
		texture2d<A2>,
		texture2d<A3>,
		texture2d<A4>,
		texture2d<A5>
	];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
			attachment3: A3;
			attachment4: A4;
			attachment5: A5;
		}
	>;
};
type AttachmentBindings7<A0, A1, A2, A3, A4, A5, A6> = {
	attachments: [
		texture2d<A0>,
		texture2d<A1>,
		texture2d<A2>,
		texture2d<A3>,
		texture2d<A4>,
		texture2d<A5>,
		texture2d<A6>
	];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
			attachment3: A3;
			attachment4: A4;
			attachment5: A5;
			attachment6: A6;
		}
	>;
};
type AttachmentBindings8<A0, A1, A2, A3, A4, A5, A6, A7> = {
	attachments: [
		texture2d<A0>,
		texture2d<A1>,
		texture2d<A2>,
		texture2d<A3>,
		texture2d<A4>,
		texture2d<A5>,
		texture2d<A6>,
		texture2d<A7>
	];
	vertex: shader<ShaderInput, ShaderOutput>;
	fragment: shader<
		ShaderInput,
		{
			attachment0: A0;
			attachment1: A1;
			attachment2: A2;
			attachment3: A3;
			attachment4: A4;
			attachment5: A5;
			attachment6: A6;
			attachment7: A7;
		}
	>;
};

type DrawDescriptorBase = (
	| {
			mesh: Mesh;
	  }
	| {
			indexBuffer: buffer<uint>;
	  }
	| {}
) & {
	indirect?: buffer<uint> | buffer<atomic<uint>>;
	indirectOffset?: int | uint;
	depth?: texture2d<float>;
	depthOnly?: boolean;
	depthTest?: boolean;
	depthCompare?:
		| 'greater'
		| 'less'
		| 'equal'
		| 'greater_equal'
		| 'less_equal'
		| 'not_equal'
		| 'always'
		| 'never';
	backfaceCulling?: boolean;
	instances?: int;
};

/**
 * Normal:
 * ```shadeup
 * drawAdvanced({
 *	mesh: mesh::box(0.xyz, 100.xyz),
 *	vertex: shader {
 *		// ...
 *	},
 *	fragment: shader {
 *  	// ...
 *	},
 * });
 * ```
 *
 * Instancing:
 * ```shadeup
 * drawAdvanced({
 *	mesh: mesh::box(0.xyz, 100.xyz),
 *	vertex: shader {
 *		in.instanceIndex;
 *	},
 *	fragment: shader {
 *  	// ...
 *	},
 *  instances: 100,
 * });
 * ```
 *
 * Indirect:
 * ```shadeup
 * let mesh = mesh::box(0.xyz, 100.xyz);
 *
 * let indirectBuffer = buffer<uint>(5);
 * indirectBuffer[0] = uint(m.getTriangles().len()); // indexCount
 * indirectBuffer[1] = 1; // instanceCount
 * indirectBuffer[2] = 0; // firstIndex
 * indirectBuffer[3] = 0; // vertexOffset
 * indirectBuffer[4] = 0; // firstInstance
 *
 * drawAdvanced({
 *	mesh: mesh::box(0.xyz, 100.xyz),
 *	vertex: shader {
 *		// ...
 *	},
 *	fragment: shader {
 *  	// ...
 *	},
 *  indirect: indirectBuffer,
 * });
 * ```
 *
 * Attachments:
 * ```shadeup
 * let mesh = mesh::box(0.xyz, 100.xyz);
 * let color = texture2d<float4>(100.xy);
 * let normal = texture2d<float3>(100.xy);
 * let depth = texture2d<float>(100.xy, "depth");
 *
 * drawAdvanced({
 * 	mesh: mesh,
 * 	vertex: shader {
 * 	 // ...
 * 	},
 * 	fragment: shader {
 * 	 out.attachment0 = float4(1, 0, 0, 1);
 * 	 out.attachment1 = float3(0, 0, 1);
 * 	},
 * 	depth: depth, // Override depth buffer
 * 	attachments: [color, normal],
 * });
 */
export function drawAdvanced<A0, A1, A2, A3, A4, A5, A6, A7>(
	descriptor: DrawDescriptorBase & AttachmentBindings8<A0, A1, A2, A3, A4, A5, A6, A7>
): void;
export function drawAdvanced<A0, A1, A2, A3, A4, A5, A6>(
	descriptor: DrawDescriptorBase & AttachmentBindings7<A0, A1, A2, A3, A4, A5, A6>
): void;
export function drawAdvanced<A0, A1, A2, A3, A4, A5>(
	descriptor: DrawDescriptorBase & AttachmentBindings6<A0, A1, A2, A3, A4, A5>
): void;
export function drawAdvanced<A0, A1, A2, A3, A4>(
	descriptor: DrawDescriptorBase & AttachmentBindings5<A0, A1, A2, A3, A4>
): void;
export function drawAdvanced<A0, A1, A2, A3>(
	descriptor: DrawDescriptorBase & AttachmentBindings4<A0, A1, A2, A3>
): void;
export function drawAdvanced<A0, A1, A2>(
	descriptor: DrawDescriptorBase & AttachmentBindings3<A0, A1, A2>
): void;
export function drawAdvanced<A0, A1>(
	descriptor: DrawDescriptorBase & AttachmentBindings2<A0, A1>
): void;
export function drawAdvanced<A0>(descriptor: DrawDescriptorBase & AttachmentBindings1<A0>): void;

export function drawAdvanced(
	descriptor: DrawDescriptorBase & {
		vertex: shader<ShaderInput, ShaderOutput>;
		fragment: shader<ShaderInput, ShaderOutput>;
	}
): void;
export function drawAdvanced(descriptor: any): void {
	(window as any).__shadeup_dispatch_draw_advanced(descriptor);
}

export function draw(
	geometry: Mesh,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
): void;
export function draw(fullScreenPixelShader: shader<ShaderInput, ShaderOutput>): void;
export function draw(
	first: Mesh | DrawDescriptorBase | shader<ShaderInput, ShaderOutput>,
	second?: shader<ShaderInput, ShaderOutput> | number,
	third?: shader<ShaderInput, ShaderOutput>
) {
	if ('vertices' in first && second && third) {
		(window as any).__shadeup_dispatch_draw_geometry(first, second, third);
	} else if (first && !second && !third) {
		(window as any).__shadeup_dispatch_draw(first as shader<ShaderInput, ShaderOutput>);
	}
}

export function drawFullscreen(fullScreenPixelShader: shader<ShaderInput, ShaderOutput>): void;
export function drawFullscreen(
	first: Mesh | any | shader<ShaderInput, ShaderOutput>,
	second?: shader<ShaderInput, ShaderOutput>,
	third?: shader<ShaderInput, ShaderOutput>
) {
	if ('vertices' in first && second && third) {
		(window as any).__shadeup_dispatch_draw_geometry(first, second, third);
	} else if (first && !second && !third) {
		(window as any).__shadeup_dispatch_draw(first as shader<ShaderInput, ShaderOutput>);
	}
}

export function drawAlt2(fullScreenPixelShader: shader<ShaderInput, ShaderOutput, 0>): void {}

export function drawCount(
	triCount: number,
	vertexShader: shader<ShaderInput, ShaderOutput>,
	pixelShader: shader<ShaderInput, ShaderOutput>
) {
	__shadeup_dispatch_draw_count(triCount, vertexShader, pixelShader);
}

export function drawAttributes<T extends { [key: string]: any }, X, Y>(
	indexBuffer: buffer<uint>,
	buffers:
		| Map<keyof T, buffer<any>>
		| {
				[key in keyof T]: buffer<T[key]>;
		  },
	vertexShader: shader<T, X>,
	pixelShader: shader<X, Y>
) {
	__shadeup_dispatch_draw_attributes(indexBuffer, buffer, vertexShader, pixelShader);
}
export function computeIndirect(
	indirectBuffer: buffer<uint> | buffer<atomic<uint>>,
	indirectOffset: int,
	computeShader: shader<any, any, any>
) {
	(window as any).__shadeup_dispatch_compute_indirect(
		indirectBuffer,
		indirectOffset,
		computeShader
	);
}
