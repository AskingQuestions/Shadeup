export type bool = boolean;
export type float = number & { _opaque_float: 2 };
export type int = number & { _opaque_int: 1 } & float;
export type uint = number & { _opaque_uint: 1 };
type scalar = float | int | uint;

export type float2 = [float, float] & { _opaque_vector_float_2: 2; length: 2 };
export type float3 = [float, float, float] & { _opaque_vector_float_3: 3; length: 3 };
export type float4 = [float, float, float, float] & { _opaque_vector_float_4: 4; length: 4 };
export type int2 = [int, int] & { _opaque_vector_int_2: 2 } & float2;
export type int3 = [int, int, int] & { _opaque_vector_int_3: 3 } & float3;
export type int4 = [int, int, int, int] & { _opaque_vector_int_4: 4 } & float4;

export type uint2 = [uint, uint] & { _opaque_vector_uint_2: 2 } & float2;
export type uint3 = [uint, uint, uint] & { _opaque_vector_uint_3: 3 } & float3;
export type uint4 = [uint, uint, uint, uint] & { _opaque_vector_uint_4: 4 } & float4;

export type uint8 = number & { _opaque_uint8: 1 };

type anyFloat = float2 | float3 | float4;
type anyInt = int2 | int3 | int4;
type anyUint = uint2 | uint3 | uint4;

type vector2 = float2 | int2 | uint2;
type vector3 = float3 | int3 | uint3;
type vector4 = float4 | int4 | uint4;

type vector = vector2 | vector3 | vector4;

type vectorOrScalar = vector | scalar;

export interface float2x2 extends Omit<[float, float, float, float], '__index'> {
	__matrix: 2;
	[index: int]: float;
	__index(index: number): [float, float];
}

export interface float3x3
	extends Omit<[float, float, float, float, float, float, float, float, float], '__index'> {
	__matrix: 3;
	[index: int]: float;
	__index(index: number): [float, float, float];
}

export interface float4x4
	extends Omit<
		[
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float,
			float
		],
		'__index'
	> {
	__matrix: 4;
	[index: int]: float;
	__index(index: number): [float, float, float, float];
}

function isVector(v: vectorOrScalar): v is vector {
	return Array.isArray(v);
}

function isScalar(v: vectorOrScalar): v is scalar {
	return typeof v === 'number';
}

function isMatrix(v: number[]): v is float2x2 | float3x3 | float4x4 {
	return !!(v as any).__matrix;
}

/** @shadeup=glsl(!mat2(0)) @shadeup=wgsl(mat2x2<f32>) */
export function float2x2(): float2x2;
/** @shadeup=glsl(mat2) @shadeup=wgsl(mat2x2<f32>) */
export function float2x2(m00: number, m01: number, m10: number, m11: number): float2x2;
/** @shadeup=glsl(mat2) @shadeup=wgsl(mat2x2<f32>) */
export function float2x2(...args: float[]): float2x2 {
	let arr = [0, 0, 0, 0] as any as float2x2;
	if (args.length === 4) {
		arr = [...args] as any as float2x2;
	}

	applyMatrix2x2Methods(arr);

	return arr;
}

/** @shadeup=glsl(!mat3(0)) @shadeup=wgsl(mat3x3<f32>) */
export function float3x3(): float3x3;
/** @shadeup=glsl(mat3) @shadeup=wgsl(mat3x3<f32>) */
export function float3x3(
	m00: number,
	m01: number,
	m02: number,
	m10: number,
	m11: number,
	m12: number,
	m20: number,
	m21: number,
	m22: number
): float3x3;
/** @shadeup=glsl(mat3) @shadeup=wgsl(mat3x3<f32>) */
export function float3x3(...args: float[]): float3x3 {
	let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0] as any as float3x3;
	if (args.length === 9) {
		arr = [...args] as any as float3x3;
	}

	applyMatrix3x3Methods(arr);

	return arr;
}

function applyMatrix4x4Methods(arr: float4x4): void {
	(arr as any).__matrix = 4;

	(arr as any).__index = function (index: number) {
		let out_arr = [arr[index * 4], arr[index * 4 + 1], arr[index * 4 + 2], arr[index * 4 + 3]];
		out_arr.__index = (index_inner: int) => {
			return out_arr[index_inner];
		};
		out_arr.__index_assign = (index_inner: int, value: float) => {
			arr[index * 4 + index_inner] = value;
		};

		out_arr.__index_assign_op = function (
			op_fn: (a: any, b: any) => any,
			index_inner: int,
			value: any
		) {
			arr[index * 4 + index_inner] = op_fn(arr[index * 4 + index_inner], value);
		};

		return out_arr;
	};

	(arr as any).__index_assign = function (index: int, value: float4) {
		arr[index * 4] = value[0];
		arr[index * 4 + 1] = value[1];
		arr[index * 4 + 2] = value[2];
		arr[index * 4 + 3] = value[3];
	};

	(arr as any).__index_assign_op = function (
		op_fn: (a: any, b: any) => any,
		index: int,
		value: any
	) {
		arr[index * 4] = op_fn(arr[index * 4], value[0]);
		arr[index * 4 + 1] = op_fn(arr[index * 4 + 1], value[1]);
		arr[index * 4 + 2] = op_fn(arr[index * 4 + 2], value[2]);
		arr[index * 4 + 3] = op_fn(arr[index * 4 + 3], value[3]);
	};
}
(window as any).applyMatrix4x4Methods = applyMatrix4x4Methods;

function applyMatrix3x3Methods(arr: float3x3): void {
	(arr as any).__matrix = 3;

	(arr as any).__index = function (index: number) {
		let out_arr = [arr[index * 3], arr[index * 3 + 1], arr[index * 3 + 2]];
		out_arr.__index = (index_inner: int) => {
			return out_arr[index_inner];
		};
		out_arr.__index_assign = (index_inner: int, value: float) => {
			arr[index * 3 + index_inner] = value;
		};

		out_arr.__index_assign_op = function (
			op_fn: (a: any, b: any) => any,
			index_inner: int,
			value: any
		) {
			arr[index * 3 + index_inner] = op_fn(arr[index * 3 + index_inner], value);
		};

		return out_arr;
	};

	(arr as any).__index_assign = function (index: int, value: float3) {
		arr[index * 3] = value[0];
		arr[index * 3 + 1] = value[1];
		arr[index * 3 + 2] = value[2];
	};

	(arr as any).__index_assign_op = function (
		op_fn: (a: any, b: any) => any,
		index: int,
		value: any
	) {
		arr[index * 3] = op_fn(arr[index * 3], value[0]);
		arr[index * 3 + 1] = op_fn(arr[index * 3 + 1], value[1]);
		arr[index * 3 + 2] = op_fn(arr[index * 3 + 2], value[2]);
	};
}

(window as any).applyMatrix3x3Methods = applyMatrix3x3Methods;

function applyMatrix2x2Methods(arr: float2x2): void {
	(arr as any).__matrix = 2;

	(arr as any).__index = function (index: number) {
		let out_arr = [arr[index * 2], arr[index * 2 + 1]];
		out_arr.__index = (index_inner: int) => {
			return out_arr[index_inner];
		};
		out_arr.__index_assign = (index_inner: int, value: float) => {
			arr[index * 2 + index_inner] = value;
		};

		out_arr.__index_assign_op = function (
			op_fn: (a: any, b: any) => any,
			index_inner: int,
			value: any
		) {
			arr[index * 2 + index_inner] = op_fn(arr[index * 2 + index_inner], value);
		};

		return out_arr;
	};

	(arr as any).__index_assign = function (index: int, value: float3) {
		arr[index * 2] = value[0];
		arr[index * 2 + 1] = value[1];
	};

	(arr as any).__index_assign_op = function (
		op_fn: (a: any, b: any) => any,
		index: int,
		value: any
	) {
		arr[index * 2] = op_fn(arr[index * 2], value[0]);
		arr[index * 2 + 1] = op_fn(arr[index * 2 + 1], value[1]);
	};
}

(window as any).applyMatrix2x2Methods = applyMatrix2x2Methods;

/** @shadeup=glsl(!mat4(0)) @shadeup=wgsl(mat4x4<f32>) */
export function float4x4(): float4x4;
/** @shadeup=glsl(mat4) @shadeup=wgsl(mat4x4<f32>) */
export function float4x4(
	m00: number,
	m01: number,
	m02: number,
	m03: number,
	m10: number,
	m11: number,
	m12: number,
	m13: number,
	m20: number,
	m21: number,
	m22: number,
	m23: number,
	m30: number,
	m31: number,
	m32: number,
	m33: number
): float4x4;
/** @shadeup=glsl(mat4) @shadeup=wgsl(mat4x4<f32>) */
export function float4x4(...args: float[]): float4x4 {
	let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any as float4x4;
	if (args.length === 16) {
		arr = [...args] as any as float4x4;
	}

	applyMatrix4x4Methods(arr);

	return arr;
}

/** @shadeup=glsl(float) @shadeup=wgsl(f32) */
export function float(x: number): float {
	return x as float;
}

/** @shadeup=glsl(int) @shadeup=wgsl(i32) */
export function int(x: number): int {
	return (x | 0) as int;
}

/** @shadeup=glsl(uint) @shadeup=wgsl(u32) */
export function uint(x: number): uint {
	return (x >>> 0) as uint;
}

/** @shadeup=glsl(float2) @shadeup=wgsl(vec2<f32>) */
export function float2(x: number, y: number): float2;
/** @shadeup=glsl(float2) @shadeup=wgsl(vec2<f32>) */
export function float2(xy: vector2): float2;

/** @shadeup=glsl(float2) @shadeup=wgsl(vec2<f32>) */
export function float2(...args: (vectorOrScalar | number)[]): float2 {
	return args.flat() as float2;
}

/** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
export function float3(x: number, y: number, z: number): float3;
/** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
export function float3(xy: vector2, z: number): float3;
/** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
export function float3(x: number, yz: vector2): float3;
/** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
export function float3(xyz: vector3): float3;
/** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
export function float3(...args: (vectorOrScalar | number)[]): float3 {
	return args.flat() as float3;
}

/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(x: number, y: number, z: number, w: number): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(x: number, yz: vector2, w: number): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(xy: vector2, z: number, w: number): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(x: number, y: number, zw: vector2): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(xy: vector2, zw: vector2): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(xyz: vector3, w: number): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(x: number, yzw: vector3): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(xyzw: int4): float4;
export function float4(xyzw: float4): float4;
/** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
export function float4(...args: (vectorOrScalar | number)[]): float4 {
	return args.flat() as float4;
}

/** @shadeup=glsl(int2) @shadeup=wgsl(vec2<i32>) */
export function int2(x: number, y: number): int2;
/** @shadeup=glsl(int2) @shadeup=wgsl(vec2<i32>) */
export function int2(xy: vector2): int2;

/** @shadeup=glsl(int2) @shadeup=wgsl(vec2<i32>) */
export function int2(...args: (vectorOrScalar | number)[]): int2 {
	return args.flat().map((x) => x | 0) as int2;
}

/** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
export function int3(x: number, y: number, z: number): int3;
/** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
export function int3(xy: vector2, z: number): int3;
/** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
export function int3(x: number, yz: vector2): int3;
/** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
export function int3(xyz: vector3): int3;
/** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
export function int3(...args: (vectorOrScalar | number)[]): int3 {
	return args.flat().map((x) => x | 0) as int3;
}

/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(x: number, y: number, z: number, w: number): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(x: number, yz: vector2, w: number): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(xy: vector2, z: number, w: number): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(x: number, y: number, zw: vector2): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(xy: vector2, zw: vector2): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(xyz: vector3, w: number): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(x: number, yzw: vector3): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(xyzw: float4): int4;
export function int4(xyzw: int4): int4;
/** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
export function int4(...args: (vectorOrScalar | number)[]): int4 {
	return args.flat().map((x) => x | 0) as int4;
}

/** @shadeup=glsl(uint2) @shadeup=wgsl(vec2<u32>) */
export function uint2(x: number, y: number): uint2;
/** @shadeup=glsl(uint2) @shadeup=wgsl(vec2<u32>) */
export function uint2(xy: vector2): uint2;
export function uint2(...args: (vectorOrScalar | number)[]): uint2 {
	return args.flat().map((x) => x >>> 0) as uint2;
}

/** @shadeup=glsl(uint3) @shadeup=wgsl(vec3<u32>) */
export function uint3(x: number, y: number, z: number): uint3;
/** @shadeup=glsl(uint3) @shadeup=wgsl(vec3<u32>) */
export function uint3(xy: vector2, z: number): uint3;
/** @shadeup=glsl(uint3) @shadeup=wgsl(vec3<u32>) */
export function uint3(x: number, yz: vector2): uint3;
/** @shadeup=glsl(uint3) @shadeup=wgsl(vec3<u32>) */
export function uint3(xyz: vector3): uint3;
export function uint3(...args: (vectorOrScalar | number)[]): uint3 {
	return args.flat().map((x) => x >>> 0) as uint3;
}

/** @shadeup=glsl(uint4) @shadeup=wgsl(vec4<u32>) */
export function uint4(x: number, y: number, z: number, w: number): uint4;
/** @shadeup=glsl(uint4) @shadeup=wgsl(vec4<u32>) */
export function uint4(x: number, yz: vector2, w: number): uint4;
/** @shadeup=glsl(uint4) @shadeup=wgsl(vec4<u32>) */
export function uint4(xy: vector2, z: number, w: number): uint4;
/** @shadeup=glsl(uint4) @shadeup=wgsl(vec4<u32>) */
export function uint4(x: number, y: number, zw: vector2): uint4;
/** @shadeup=glsl(uint4) @shadeup=wgsl(vec4<u32>) */
export function uint4(xy: vector2, zw: vector2): uint4;
export function uint4(xyz: vector3, w: number): uint4;
export function uint4(x: number, yzw: vector3): uint4;
export function uint4(xyzw: float4): uint4;
export function uint4(xyzw: uint4): uint4;
export function uint4(...args: (vectorOrScalar | number)[]): uint4 {
	return args.flat().map((x) => x >>> 0) as uint4;
}

export function uint8(x: number): uint8 {
	return ((x >>> 0) & 0xff) as uint8;
}

function componentMath(a: any, b: any, f: (a: number, b: number) => number): vectorOrScalar {
	let aIsScalar = isScalar(a);
	let bIsScalar = isScalar(b);
	if (aIsScalar && bIsScalar) {
		return f(a, b) as scalar;
	}
	if (!aIsScalar && !bIsScalar) {
		if (a.length !== b.length) {
			throw new Error('Cannot perform component-wise math on vectors of different lengths');
		}
		// return a.map((a, i) => f(a, b[i])) as vector;
		if (a.length == 2) {
			return [f(a[0], b[0]), f(a[1], b[1])] as vector;
		} else if (a.length == 3) {
			return [f(a[0], b[0]), f(a[1], b[1]), f(a[2], b[2])] as vector;
		} else if (a.length == 4) {
			return [f(a[0], b[0]), f(a[1], b[1]), f(a[2], b[2]), f(a[3], b[3])] as vector;
		}
	} else if (!aIsScalar && bIsScalar) {
		if (a.length == 2) {
			return [f(a[0], b), f(a[1], b)] as vector;
		} else if (a.length == 3) {
			return [f(a[0], b), f(a[1], b), f(a[2], b)] as vector;
		} else if (a.length == 4) {
			return [f(a[0], b), f(a[1], b), f(a[2], b), f(a[3], b)] as vector;
		}
	} else if (!bIsScalar && aIsScalar) {
		if (b.length == 2) {
			return [f(a, b[0]), f(a, b[1])] as vector;
		} else if (b.length == 3) {
			return [f(a, b[0]), f(a, b[1]), f(a, b[2])] as vector;
		} else if (b.length == 4) {
			return [f(a, b[0]), f(a, b[1]), f(a, b[2]), f(a, b[3])] as vector;
		}
	}

	throw new Error('Cannot perform component-wise math on a scalar and a vector');
}

function componentMathSingular(a: vectorOrScalar, f: (a: number) => number): vectorOrScalar {
	if (isScalar(a)) {
		return f(a) as scalar;
	}
	if (isVector(a)) {
		return a.map((a, i) => f(a)) as vector;
	}

	throw new Error('Cannot perform component-wise math on a scalar and a vector');
}

type cCallCb = (a: number, b: number) => number;
type cCallCbSingle = (a: number) => number;

function cCall(cb: cCallCb, a: scalar, b: scalar): scalar;
function cCall(cb: cCallCb, a: vector, b: scalar): vector;
function cCall(cb: cCallCb, a: vector2, b: vector2): vector2;
function cCall(cb: cCallCb, a: vector3, b: vector3): vector3;
function cCall(cb: cCallCb, a: vector4, b: vector4): vector4;
function cCall(cb: cCallCb, a: vectorOrScalar, b: vectorOrScalar): vectorOrScalar {
	return componentMath(a, b, (a, b) => a + b);
}

export type vectorOverload_2to1_3to3 = {
	(a: float2, b: float2): float;
	(a: float3, b: float3): float3;

	(a: int2, b: int2): int;
	(a: int3, b: int3): int3;

	(a: float2, b: int2): float;
	(a: float3, b: int3): float3;

	(a: int2, b: float2): float;
	(a: int3, b: float3): float3;
};
export type vectorOverload_2to1_3to3_4to4 = {
	(a: float2, b: float2): float;
	(a: float3, b: float3): float3;
	(a: float4, b: float4): float4;

	(a: int2, b: int2): int;
	(a: int3, b: int3): int3;
	(a: int4, b: int4): int4;

	(a: float2, b: int2): float;
	(a: float3, b: int3): float3;
	(a: float4, b: int4): float4;

	(a: int2, b: float2): float;
	(a: int3, b: float3): float3;
	(a: int4, b: float4): float4;
};
export type vectorOverload_2to1_3to1_4to1 = {
	(a: float2, b: float2): float;
	(a: float3, b: float3): float;
	(a: float4, b: float4): float;

	(a: int2, b: int2): int;
	(a: int3, b: int3): int;
	(a: int4, b: int4): int;

	(a: float2, b: int2): float;
	(a: float3, b: int3): float;
	(a: float4, b: int4): float;

	(a: int2, b: float2): float;
	(a: int3, b: float3): float;
	(a: int4, b: float4): float;
};

export type componentOverload = {
	(a: int, b: int): int;
	(a: int2, b: int2): int2;
	(a: int3, b: int3): int3;
	(a: int4, b: int4): int4;

	(a: int, b: float): float;
	(a: float, b: int): float;

	(a: float, b: float): float;

	(a: float2, b: float): float2;
	(a: float3, b: float): float3;
	(a: float4, b: float): float4;

	(a: int2, b: int): int2;
	(a: int3, b: int): int3;
	(a: int4, b: int): int4;

	(a: int2, b: float): float2;
	(a: int3, b: float): float3;
	(a: int4, b: float): float4;

	(a: float2, b: int): float2;
	(a: float3, b: int): float3;
	(a: float4, b: int): float4;
	(a: float2, b: float): float2;

	(a: float, b: float2): float2;
	(a: float, b: float3): float3;
	(a: float, b: float4): float4;

	(a: int, b: int2): int2;
	(a: int, b: int3): int3;
	(a: int, b: int4): int4;

	(a: float, b: int2): float2;
	(a: float, b: int3): float3;
	(a: float, b: int4): float4;

	(a: int, b: float2): float2;
	(a: int, b: float3): float3;
	(a: int, b: float4): float4;

	(a: float2, b: float2): float2;
	(a: float3, b: float3): float3;
	(a: float4, b: float4): float4;

	(a: float2, b: int2): float2;
	(a: float3, b: int3): float3;
	(a: float4, b: int4): float4;

	(a: int2, b: float2): float2;
	(a: int3, b: float3): float3;
	(a: int4, b: float4): float4;

	(a: uint, b: uint): uint;
	(a: uint2, b: uint2): uint2;
	(a: uint3, b: uint3): uint3;
	(a: uint4, b: uint4): uint4;
};

export type componentOverloadMatch = {
	(a: uint, b: uint): uint;
	(a: uint2, b: uint2): uint2;
	(a: uint3, b: uint3): uint3;
	(a: uint4, b: uint4): uint4;
	(a: uint2, b: uint): uint2;
	(a: uint3, b: uint): uint3;
	(a: uint4, b: uint): uint4;

	(a: int, b: int): int;
	(a: int2, b: int2): int2;
	(a: int3, b: int3): int3;
	(a: int4, b: int4): int4;
	(a: int2, b: int): int2;
	(a: int3, b: int): int3;
	(a: int4, b: int): int4;

	(a: float, b: float): float;
	(a: float2, b: float2): float2;
	(a: float3, b: float3): float3;
	(a: float4, b: float4): float4;
	(a: float2, b: float): float2;
	(a: float3, b: float): float3;
	(a: float4, b: float): float4;
};

export type componentOverloadSingular = {
	(a: int): int;
	(a: float): float;

	(a: float2): float2;
	(a: float3): float3;
	(a: float4): float4;

	(a: int2): int2;
	(a: int3): int3;
	(a: int4): int4;

	(a: uint): uint;
	(a: uint2): uint2;
	(a: uint3): uint3;
	(a: uint4): uint4;
};

export type componentOverloadSingularFloat = {
	// (a: int): int;
	(a: float): float;

	(a: float2): float2;
	(a: float3): float3;
	(a: float4): float4;

	// (a: int2): int2;
	// (a: int3): int3;
	// (a: int4): int4;
};

export type componentOverloadMatrix = {
	(a: float2x2, b: float2): float2;
	(a: float3x3, b: float3): float3;
	(a: float4x4, b: float4): float4;

	(a: float2, b: float2x2): float2;
	(a: float3, b: float3x3): float3;
	(a: float4, b: float4x4): float4;

	(a: float2x2, b: float2x2): float2x2;
	(a: float3x3, b: float3x3): float3x3;
	(a: float4x4, b: float4x4): float4x4;

	(a: float2x2, b: float): float2x2;
	(a: float3x3, b: float): float3x3;
	(a: float4x4, b: float): float4x4;

	(a: float, b: float2x2): float2x2;
	(a: float, b: float3x3): float3x3;
	(a: float, b: float4x4): float4x4;
};

function componentOp(cb: cCallCb): componentOverload;

function componentOp(cb: cCallCb) {
	return (a: any, b: any) => componentMath(a, b, cb);
}

function componentOpMatch(cb: cCallCb): componentOverloadMatch;
function componentOpMatch(cb: cCallCb) {
	return (a: any, b: any) => componentMath(a, b, cb);
}

function componentOpSingular(cb: cCallCbSingle): componentOverloadSingular;

function componentOpSingular(cb: cCallCbSingle) {
	return (a: any) => componentMathSingular(a, cb);
}

function componentOpSingularFloat(cb: cCallCbSingle): componentOverloadSingularFloat;

function componentOpSingularFloat(cb: cCallCbSingle) {
	return (a: any) => componentMathSingular(a, cb);
}

/** @shadeup=univ(!$0$ + $1$)*/
export const add: componentOverload & ((a: string, b: string) => string) = (
	a: any,
	b: any
): any => {
	if (typeof a === 'string' && typeof b === 'string') {
		return `${a}${b}`;
	} else {
		let addOp: (a: any, b: any) => any = componentOp((a, b) => a + b);
		let v: any = addOp(a, b);
		return v;
	}
};

/** @shadeup=univ(!$0$ - $1$)*/
export const sub = componentOp((a, b) => a - b);

type matrix = float2x2 | float3x3 | float4x4;

function matrixMul(a: matrix, b: matrix): matrix {
	// Multiply two square matrices of the same dimension row-major

	let dimension = a.__matrix;

	let out: float2x2 | float3x3 | float4x4;
	if (dimension === 2) {
		out = float2x2();
	} else if (dimension === 3) {
		out = float3x3();
	} else if (dimension === 4) {
		var a00 = a[0 * 4 + 0];
		var a01 = a[0 * 4 + 1];
		var a02 = a[0 * 4 + 2];
		var a03 = a[0 * 4 + 3];
		var a10 = a[1 * 4 + 0];
		var a11 = a[1 * 4 + 1];
		var a12 = a[1 * 4 + 2];
		var a13 = a[1 * 4 + 3];
		var a20 = a[2 * 4 + 0];
		var a21 = a[2 * 4 + 1];
		var a22 = a[2 * 4 + 2];
		var a23 = a[2 * 4 + 3];
		var a30 = a[3 * 4 + 0];
		var a31 = a[3 * 4 + 1];
		var a32 = a[3 * 4 + 2];
		var a33 = a[3 * 4 + 3];
		var b00 = b[0 * 4 + 0];
		var b01 = b[0 * 4 + 1];
		var b02 = b[0 * 4 + 2];
		var b03 = b[0 * 4 + 3];
		var b10 = b[1 * 4 + 0];
		var b11 = b[1 * 4 + 1];
		var b12 = b[1 * 4 + 2];
		var b13 = b[1 * 4 + 3];
		var b20 = b[2 * 4 + 0];
		var b21 = b[2 * 4 + 1];
		var b22 = b[2 * 4 + 2];
		var b23 = b[2 * 4 + 3];
		var b30 = b[3 * 4 + 0];
		var b31 = b[3 * 4 + 1];
		var b32 = b[3 * 4 + 2];
		var b33 = b[3 * 4 + 3];
		return float4x4(
			b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
			b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
			b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
			b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
			b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
			b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
			b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
			b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
			b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
			b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
			b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
			b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
			b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
			b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
			b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
			b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
		);
		out = float4x4();
	}

	for (let i = 0; i < dimension; i++) {
		for (let j = 0; j < dimension; j++) {
			let sum: float = float(0);
			for (let k = 0; k < dimension; k++) {
				sum += float(a[i * dimension + k] * b[k * dimension + j]);
			}
			out[i * dimension + j] = sum;
		}
	}

	return out;

	if (a.__matrix === 2 && b.__matrix === 2) {
		let a00 = a[0];
		let a01 = a[1];
		let a10 = a[2];
		let a11 = a[3];

		let b00 = b[0];
		let b01 = b[1];
		let b10 = b[2];
		let b11 = b[3];

		let v = float2x2(
			a00 * b00 + a01 * b10,
			a00 * b01 + a01 * b11,
			a10 * b00 + a11 * b10,
			a10 * b01 + a11 * b11
		);

		return v;
	} else if (a.__matrix === 3 && b.__matrix === 3) {
		let a00 = a[0];
		let a01 = a[1];
		let a02 = a[2];
		let a10 = a[3];
		let a11 = a[4];
		let a12 = a[5];
		let a20 = a[6];
		let a21 = a[7];
		let a22 = a[8];

		let b00 = b[0];
		let b01 = b[1];
		let b02 = b[2];
		let b10 = b[3];
		let b11 = b[4];
		let b12 = b[5];
		let b20 = b[6];
		let b21 = b[7];
		let b22 = b[8];

		let v = float3x3(
			a00 * b00 + a01 * b10 + a02 * b20,
			a00 * b01 + a01 * b11 + a02 * b21,
			a00 * b02 + a01 * b12 + a02 * b22,
			a10 * b00 + a11 * b10 + a12 * b20,
			a10 * b01 + a11 * b11 + a12 * b21,
			a10 * b02 + a11 * b12 + a12 * b22,
			a20 * b00 + a21 * b10 + a22 * b20,
			a20 * b01 + a21 * b11 + a22 * b21,
			a20 * b02 + a21 * b12 + a22 * b22
		);
		return v;
	} else if (a.__matrix === 4 && b.__matrix === 4) {
		let a00 = a[0];
		let a01 = a[1];
		let a02 = a[2];
		let a03 = a[3];
		let a10 = a[4];
		let a11 = a[5];
		let a12 = a[6];
		let a13 = a[7];
		let a20 = a[8];
		let a21 = a[9];
		let a22 = a[10];
		let a23 = a[11];
		let a30 = a[12];
		let a31 = a[13];
		let a32 = a[14];
		let a33 = a[15];

		let b00 = b[0];
		let b01 = b[1];
		let b02 = b[2];
		let b03 = b[3];
		let b10 = b[4];
		let b11 = b[5];
		let b12 = b[6];
		let b13 = b[7];
		let b20 = b[8];
		let b21 = b[9];
		let b22 = b[10];
		let b23 = b[11];
		let b30 = b[12];
		let b31 = b[13];
		let b32 = b[14];
		let b33 = b[15];

		let v = float4x4(
			a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
			a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
			a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
			a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
			a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
			a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
			a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
			a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
			a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
			a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
			a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
			a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
			a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
			a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
			a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
			a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
		);

		return v;
	} else {
		throw new Error('Invalid matrix multiplication');
	}
}

function matrixInversefloat2x2(m: float2x2): float2x2 {
	let a = m.__index(0).__index(0),
		b = m.__index(1).__index(0),
		c = m.__index(0).__index(1),
		d = m.__index(1).__index(1);
	let det = a * d - b * c;
	if (det === 0) {
		throw new Error('Matrix determinant is zero');
	}
	let detInv = 1.0 / det;
	return float2x2(d * detInv, -b * detInv, -c * detInv, a * detInv);
}
function matrixInversefloat3x3(m: float3x3): float3x3 {
	let n11 = m.__index(0).__index(0),
		n12 = m.__index(1).__index(0),
		n13 = m.__index(2).__index(0);
	let n21 = m.__index(0).__index(1),
		n22 = m.__index(1).__index(1),
		n23 = m.__index(2).__index(1);
	let n31 = m.__index(0).__index(2),
		n32 = m.__index(1).__index(2),
		n33 = m.__index(2).__index(2);
	let t11 = n33 * n22 - n32 * n23,
		t12 = n32 * n13 - n33 * n12,
		t13 = n23 * n12 - n22 * n13;
	let det = n11 * t11 + n21 * t12 + n31 * t13;
	if (det === 0) {
		throw new Error('Invalid matrix inverse');
	}
	let detInv = 1 / det;
	let v = float3x3(
		t11 * detInv,
		(n31 * n23 - n33 * n21) * detInv,
		(n32 * n21 - n31 * n22) * detInv,
		t12 * detInv,
		(n33 * n11 - n31 * n13) * detInv,
		(n31 * n12 - n32 * n11) * detInv,
		t13 * detInv,
		(n21 * n13 - n23 * n11) * detInv,
		(n22 * n11 - n21 * n12) * detInv
	);
	return v;
}
function matrixInversefloat4x4(m: float4x4): float4x4 {
	var m00 = m[0 * 4 + 0];
	var m01 = m[0 * 4 + 1];
	var m02 = m[0 * 4 + 2];
	var m03 = m[0 * 4 + 3];
	var m10 = m[1 * 4 + 0];
	var m11 = m[1 * 4 + 1];
	var m12 = m[1 * 4 + 2];
	var m13 = m[1 * 4 + 3];
	var m20 = m[2 * 4 + 0];
	var m21 = m[2 * 4 + 1];
	var m22 = m[2 * 4 + 2];
	var m23 = m[2 * 4 + 3];
	var m30 = m[3 * 4 + 0];
	var m31 = m[3 * 4 + 1];
	var m32 = m[3 * 4 + 2];
	var m33 = m[3 * 4 + 3];
	var tmp_0 = m22 * m33;
	var tmp_1 = m32 * m23;
	var tmp_2 = m12 * m33;
	var tmp_3 = m32 * m13;
	var tmp_4 = m12 * m23;
	var tmp_5 = m22 * m13;
	var tmp_6 = m02 * m33;
	var tmp_7 = m32 * m03;
	var tmp_8 = m02 * m23;
	var tmp_9 = m22 * m03;
	var tmp_10 = m02 * m13;
	var tmp_11 = m12 * m03;
	var tmp_12 = m20 * m31;
	var tmp_13 = m30 * m21;
	var tmp_14 = m10 * m31;
	var tmp_15 = m30 * m11;
	var tmp_16 = m10 * m21;
	var tmp_17 = m20 * m11;
	var tmp_18 = m00 * m31;
	var tmp_19 = m30 * m01;
	var tmp_20 = m00 * m21;
	var tmp_21 = m20 * m01;
	var tmp_22 = m00 * m11;
	var tmp_23 = m10 * m01;

	var t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
	var t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
	var t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
	var t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

	var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
	if (d === 0) {
		throw new Error('Invalid matrix inverse');
	}
	return float4x4(
		d * t0,
		d * t1,
		d * t2,
		d * t3,
		d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
		d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
		d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
		d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
		d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
		d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
		d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
		d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
		d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
		d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
		d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
		d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
	);
}

function matrixTransposefloat2x2(m: float2x2): float2x2 {
	return float2x2(
		m.__index(0).__index(0),
		m.__index(1).__index(0),
		m.__index(0).__index(1),
		m.__index(1).__index(1)
	);
}

function matrixTransposefloat3x3(m: float3x3): float3x3 {
	return float3x3(
		m.__index(0).__index(0),
		m.__index(1).__index(0),
		m.__index(2).__index(0),
		m.__index(0).__index(1),
		m.__index(1).__index(1),
		m.__index(2).__index(1),
		m.__index(0).__index(2),
		m.__index(1).__index(2),
		m.__index(2).__index(2)
	);
}

function matrixTransposefloat4x4(m: float4x4): float4x4 {
	return float4x4(
		m.__index(0).__index(0),
		m.__index(1).__index(0),
		m.__index(2).__index(0),
		m.__index(3).__index(0),
		m.__index(0).__index(1),
		m.__index(1).__index(1),
		m.__index(2).__index(1),
		m.__index(3).__index(1),
		m.__index(0).__index(2),
		m.__index(1).__index(2),
		m.__index(2).__index(2),
		m.__index(3).__index(2),
		m.__index(0).__index(3),
		m.__index(1).__index(3),
		m.__index(2).__index(3),
		m.__index(3).__index(3)
	);
}

function matrixMul2x2float2(a: float2x2, b: float2): float2 {
	let c: number[] = [0 as scalar, 0 as scalar];

	for (let j = 0; j < 2; j++) {
		for (let i = 0; i < 2; i++) {
			c[i] += a[j * 2 + i] * b[j];
		}
	}

	return c as float2;
}

function matrixMul3x3float3(a: float3x3, b: float3): float3 {
	let c: number[] = [0 as scalar, 0 as scalar, 0 as scalar];

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			c[i] += a[j * 3 + i] * b[j];
		}
	}

	return c as float3;
}

function matrixMul4x4float4(a: float4x4, b: float4): float4 {
	let c: number[] = [0 as scalar, 0 as scalar, 0 as scalar, 0 as scalar];

	for (let j = 0; j < 4; j++) {
		for (let i = 0; i < 4; i++) {
			c[i] += a[j * 4 + i] * b[j];
		}
	}

	return c as float4;
}

function matrixMulfloat22x2(a: float2, b: float2x2): float2 {
	let c: number[] = [0 as scalar, 0 as scalar];

	for (let j = 0; j < 2; j++) {
		for (let i = 0; i < 2; i++) {
			c[i] += a[j] * b[i * 2 + j];
		}
	}

	return c as float2;
}

function matrixMulfloat33x3(a: float3, b: float3x3): float3 {
	let c: number[] = [0 as scalar, 0 as scalar, 0 as scalar];

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			c[i] += a[j] * b[i * 3 + j];
		}
	}

	return c as float3;
}

function matrixMulfloat44x4(a: float4, b: float4x4): float4 {
	let c: number[] = [0 as scalar, 0 as scalar, 0 as scalar, 0 as scalar];

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			c[i] += a[j] * b[i * 4 + j];
		}
	}

	return c as float4;
}

let mulFunc: (a: any, b: any) => any = componentOp((a, b) => a * b);

/** @shadeup=univ(#matrix_inverse)*/
export function inverse(a: float2x2): float2x2;
export function inverse(a: float3x3): float3x3;
export function inverse(a: float4x4): float4x4;
export function inverse(a: float2x2 | float3x3 | float4x4): float2x2 | float3x3 | float4x4 {
	if (a.__matrix == 2) {
		return matrixInversefloat2x2(a as float2x2);
	} else if (a.__matrix == 3) {
		return matrixInversefloat3x3(a as float3x3);
	} else if (a.__matrix == 4) {
		return matrixInversefloat4x4(a as float4x4);
	}
}

/** @shadeup=univ(#matrix_transpose)*/
export function transpose(a: float2x2): float2x2;
export function transpose(a: float3x3): float3x3;
export function transpose(a: float4x4): float4x4;
export function transpose(a: float2x2 | float3x3 | float4x4): float2x2 | float3x3 | float4x4 {
	if (a.__matrix == 2) {
		return matrixTransposefloat2x2(a as float2x2);
	} else if (a.__matrix == 3) {
		return matrixTransposefloat3x3(a as float3x3);
	} else if (a.__matrix == 4) {
		return matrixTransposefloat4x4(a as float4x4);
	}
}

/** @shadeup=univ(!$0$ * $1$)*/
export const mul: componentOverload & componentOverloadMatrix = (a: any, b: any): any => {
	if (isMatrix(a) || isMatrix(b)) {
		if (isMatrix(a) && isMatrix(b)) {
			return matrixMul(a, b);
		} else {
			if (isMatrix(a) && typeof b == 'number') {
				return componentMath(b as scalar, a as any, (a, b) => a * b);
			} else if (isMatrix(b) && typeof a == 'number') {
				return componentMath(a as scalar, b as any, (a, b) => a * b);
			} else {
				if (isMatrix(a)) {
					if (a.length == 4) {
						return matrixMul2x2float2(a as float2x2, b as float2);
					} else if (a.length == 9) {
						return matrixMul3x3float3(a as float3x3, b as float3);
					} else if (a.length == 16) {
						return matrixMul4x4float4(a as float4x4, b as float4);
					}
				} else if (isMatrix(b)) {
					if (b.length == 4) {
						return matrixMulfloat22x2(a as float2, b as float2x2);
					} else if (b.length == 9) {
						return matrixMulfloat33x3(a as float3, b as float3x3);
					} else if (b.length == 16) {
						return matrixMulfloat44x4(a as float4, b as float4x4);
					}
				}
			}
		}
	} else {
		return mulFunc(a, b);
	}
};

/** @shadeup=univ(!$0$ / $1$)*/
export const div = componentOp((a, b) => a / b);

/** @shadeup=glsl(!$0$ ** $1$) @shadeup=wgsl(!pow($0$, $1$))*/
export const pow = componentOp((a, b) => Math.pow(a, b));

/** @shadeup=wgsl(!$0$ % $1$) @shadeup=glsl(!mod($0$, $1$))*/
export const mod = componentOpMatch((a, b) => a - b * Math.floor(a / b));

/** @shadeup=univ(!$0$ & $1$)*/
export const bitand = componentOp((a, b) => a & b);

/** @shadeup=univ(!$0$ | $1$)*/
export const bitor = componentOp((a, b) => a | b);

/** @shadeup=univ(!$0$ ^ $1$)*/
export const bitxor = componentOp((a, b) => a ^ b);

/** @shadeup=glsl(!$0$ << $1$) @shadeup=wgsl(!$0$ << u32($1$))*/
export const lshift = componentOp((a, b) => a << b);

/** @shadeup=glsl(!$0$ >> $1$) @shadeup=wgsl(!$0$ >> u32($1$))*/
export const rshift = componentOp((a, b) => a >> b);

/** @shadeup=univ(!~$0$)*/
export const bitnot = componentOpSingular((a) => ~a);

/** @shadeup=univ(!-($0$))*/
export const negate = componentOpSingular((a) => -a);

/** @shadeup=univ(!+($0$))*/
export const positive = componentOpSingular((a) => Math.abs(a));

/** @shadeup=univ(abs)*/
export const abs = componentOpSingular((a) => Math.abs(a));

/**  @shadeup=glsl(floor) @shadeup=wgsl(!floor(f32(1.0) * $0$))*/
export const floor = componentOpSingular(Math.floor);

/** @shadeup=glsl(ceil) @shadeup=wgsl(!ceil(f32(1.0) * $0$))*/
export const ceil = componentOpSingular(Math.ceil);

/** @shadeup=univ(round)*/
export const round = componentOpSingular(Math.round);

/** @shadeup=univ(sign)*/
export const sign = componentOpSingular(Math.sign);

/** @shadeup=univ(cos) */
export const cos = componentOpSingular(Math.cos);

/** @shadeup=univ(sin) */
export const sin = componentOpSingularFloat(Math.sin);

/** @shadeup=univ(tan) */
export const tan = componentOpSingular(Math.tan);

/** @shadeup=univ(acos) */
export const acos = componentOpSingular(Math.acos);

/** @shadeup=univ(asin) */
export const asin = componentOpSingular(Math.asin);

/** @shadeup=univ(atan) */
export const atan = componentOpSingular(Math.atan);

/** @shadeup=univ(atan2) */
export const atan2: (dy: float, dx: float) => float = Math.atan2 as any;

/** @shadeup=univ(cosh) */
export const cosh = componentOpSingular(Math.cosh);

/** @shadeup=univ(sinh) */
export const sinh = componentOpSingular(Math.sinh);

/** @shadeup=univ(tanh) */
export const tanh = componentOpSingular(Math.tanh);

/** @shadeup=univ(acosh) */
export const acosh = componentOpSingular(Math.acosh);

/** @shadeup=univ(asinh) */
export const asinh = componentOpSingular(Math.asinh);

/** @shadeup=univ(atanh) */
export const atanh = componentOpSingular(Math.atanh);

/** @shadeup=univ(exp) */
export const exp = componentOpSingular(Math.exp);

/** @shadeup=univ(log) */
export const log = componentOpSingular(Math.log);

/** @shadeup=univ(log2) */
export const log2 = componentOpSingular(Math.log2);

/** @shadeup=univ(log10) */
export const log10 = componentOpSingular(Math.log10);

/** @shadeup=univ(sqrt) */
export const sqrt = componentOpSingular(Math.sqrt);

/** @shadeup=univ(inversesqrt) */
export const inversesqrt = componentOpSingular((a) => 1 / Math.sqrt(a));

/** @shadeup=univ(fract)*/
export const frac = componentOpSingular((a) => a - Math.floor(a));

export function wrap(x: float, low: float, high: float): float {
	if (lt(x, low)) {
		let rng = sub(high, low);
		let s1 = sub(low, x);
		let ms = mod(s1, rng);
		return sub(high, ms);
	} else if (gte(x, high)) {
		let rng = sub(high, low);
		let s1 = sub(x, high);
		let ms = mod(s1, rng);
		return add(low, ms);
	} else {
		return x;
	}
	// return add(mod(sub(x, low), sub(high, low)), low) as T;
}

/**
 * Returns a deterministic (same seed = same output) random float between 0-1
 *
 * **Note:** See the noise package for more advanced random functions
 */

export function rand(seed?: float): float {
	if (typeof seed === 'number') {
		return frac(mul(sin(mul(seed, float(91.3458))), float(47453.5453))) as float;
	} else {
		return Math.random() as float;
	}
}

/**
 * Returns a deterministic (same seed = same output) random float between 0-1
 *
 * **Note:** See the noise package for more advanced random functions
 */
export function rand2(seed: float2): float {
	return frac(mul(sin(dot(seed, float2(12.9898, 4.1414))), float(43758.5453)));
}

/**
 * Returns a deterministic (same seed = same output) random float between 0-1
 *
 * **Note:** See the noise package for more advanced random functions
 */
export function rand3(seed: float3): float {
	return rand2(add(swizzle(seed, 'xy'), rand(swizzle(seed, 'z'))));
}

// export function remap(x: float, low1: float, high1: float, low2: float, high2: float): float {
// 	return add(low2, mul(div(sub(x, low1), sub(high1, low1)), sub(high2, low2)));
// }

export function pingpong(x: float, length: float): float {
	const t = mod(x, mul(length, float(2)));
	return sub(length, abs(sub(t, length)));
}

function vectorMath_2to1_3to3(
	cb2: (a: vector2, b: vector2) => scalar,
	cb3: (a: vector3, b: vector3) => vector3
): vectorOverload_2to1_3to3 {
	return (a: any, b: any): any => {
		if (a.length === 2 && b.length === 2) {
			return cb2(a, b);
		} else if (a.length === 3 && b.length === 3) {
			return cb3(a, b);
		} else {
			throw new Error('Invalid vector length');
		}
	};
}

function vectorMath_2to1_3to3_4to4(
	cb2: (a: vector2, b: vector2) => scalar,
	cb3: (a: vector3, b: vector3) => vector3,
	cb4: (a: vector4, b: vector4) => vector4
): vectorOverload_2to1_3to3_4to4 {
	return (a: any, b: any): any => {
		if (a.length === 2 && b.length === 2) {
			return cb2(a, b);
		} else if (a.length === 3 && b.length === 3) {
			return cb3(a, b);
		} else if (a.length === 4 && b.length === 4) {
			return cb4(a, b);
		} else {
			throw new Error('Invalid vector length');
		}
	};
}
function vectorMath_2to1_3to1_4to1(
	cb2: (a: vector2, b: vector2) => scalar,
	cb3: (a: vector3, b: vector3) => scalar,
	cb4: (a: vector4, b: vector4) => scalar
): vectorOverload_2to1_3to1_4to1 {
	return (a: any, b: any): any => {
		if (a.length === 2 && b.length === 2) {
			return cb2(a, b);
		} else if (a.length === 3 && b.length === 3) {
			return cb3(a, b);
		} else if (a.length === 4 && b.length === 4) {
			return cb4(a, b);
		} else {
			throw new Error('Invalid vector length');
		}
	};
}

function cross2(a: float2, b: float2): any {
	return a[0] * b[1] - a[1] * b[0];
}

function cross3(a: float3, b: float3): any {
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export const cross = vectorMath_2to1_3to3(cross2, cross3);

function dot2(a: float2, b: float2): any {
	return a[0] * b[0] + a[1] * b[1];
}

function dot3(a: float3, b: float3): any {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function dot4(a: float4, b: float4): any {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/** @shadeup=univ(dot)*/
export const dot = vectorMath_2to1_3to1_4to1(dot2, dot3, dot4);

function lerp1(a: float, b: float, t: float): float {
	return (a + (b - a) * t) as float;
}

function lerp2(a: float2, b: float2, t: float): float2 {
	return [lerp1(a[0], b[0], t), lerp1(a[1], b[1], t)] as float2;
}

function lerp3(a: float3, b: float3, t: float): float3 {
	return [lerp1(a[0], b[0], t), lerp1(a[1], b[1], t), lerp1(a[2], b[2], t)] as float3;
}

function lerp4(a: float4, b: float4, t: float): float4 {
	return [
		lerp1(a[0], b[0], t),
		lerp1(a[1], b[1], t),
		lerp1(a[2], b[2], t),
		lerp1(a[3], b[3], t)
	] as float4;
}

function lerp2x2(a: float2x2, b: float2x2, t: float): float2x2 {
	return float2x2(
		lerp1(a[0], b[0], t),
		lerp1(a[1], b[1], t),
		lerp1(a[2], b[2], t),
		lerp1(a[3], b[3], t)
	);
}

function lerp3x3(a: float3x3, b: float3x3, t: float): float3x3 {
	return float3x3(
		lerp1(a[0], b[0], t),
		lerp1(a[1], b[1], t),
		lerp1(a[2], b[2], t),
		lerp1(a[3], b[3], t),
		lerp1(a[4], b[4], t),
		lerp1(a[5], b[5], t),
		lerp1(a[6], b[6], t),
		lerp1(a[7], b[7], t),
		lerp1(a[8], b[8], t)
	);
}

function lerp4x4(a: float4x4, b: float4x4, t: float): float4x4 {
	return float4x4(
		lerp1(a[0], b[0], t),
		lerp1(a[1], b[1], t),
		lerp1(a[2], b[2], t),
		lerp1(a[3], b[3], t),
		lerp1(a[4], b[4], t),
		lerp1(a[5], b[5], t),
		lerp1(a[6], b[6], t),
		lerp1(a[7], b[7], t),
		lerp1(a[8], b[8], t),
		lerp1(a[9], b[9], t),
		lerp1(a[10], b[10], t),
		lerp1(a[11], b[11], t),
		lerp1(a[12], b[12], t),
		lerp1(a[13], b[13], t),
		lerp1(a[14], b[14], t),
		lerp1(a[15], b[15], t)
	);
}

/** @shadeup=univ(mix)*/
export function lerp(a: float, b: float, t: float): float;
export function lerp(a: float2, b: float2, t: float): float2;
export function lerp(a: float3, b: float3, t: float): float3;
export function lerp(a: float4, b: float4, t: float): float4;
export function lerp(a: float2x2, b: float2x2, t: float): float2x2;
export function lerp(a: float3x3, b: float3x3, t: float): float3x3;
export function lerp(a: float4x4, b: float4x4, t: float): float4x4;
/** @shadeup=univ(mix)*/
export function lerp(a: any, b: any, t: float): any {
	if (typeof a === 'number' && typeof b === 'number' && typeof t === 'number') {
		return lerp1(a as float, b as float, t);
	} else if (isMatrix(a) && isMatrix(b)) {
		if (a.length === 4 && b.length === 4) {
			return lerp2x2(a as float2x2, b as float2x2, t);
		} else if (a.length === 9 && b.length === 9) {
			return lerp3x3(a as float3x3, b as float3x3, t);
		} else if (a.length === 16 && b.length === 16) {
			return lerp4x4(a as float4x4, b as float4x4, t);
		} else {
			throw new Error('Invalid matrix length');
		}
	} else if (a.length === 2 && b.length === 2 && typeof t === 'number') {
		return lerp2(a, b, t as float);
	} else if (a.length === 3 && b.length === 3 && typeof t === 'number') {
		return lerp3(a, b, t);
	} else if (a.length === 4 && b.length === 4 && typeof t === 'number') {
		return lerp4(a, b, t);
	} else {
		throw new Error('Invalid vector length');
	}
}

/** @shadeup=univ(!bilerp_`0`($0$, $1$, $2$, $3$, $4$, $5$)) */
export function bilerp(a: float, b: float, c: float, d: float, u: float, v: float): float;
export function bilerp(a: float2, b: float2, c: float2, d: float2, u: float, v: float): float2;
export function bilerp(a: float3, b: float3, c: float3, d: float3, u: float, v: float): float3;
export function bilerp(a: float4, b: float4, c: float4, d: float4, u: float, v: float): float4;
export function bilerp(
	a: float2x2,
	b: float2x2,
	c: float2x2,
	d: float2x2,
	u: float,
	v: float
): float2x2;
export function bilerp(
	a: float3x3,
	b: float3x3,
	c: float3x3,
	d: float3x3,
	u: float,
	v: float
): float3x3;
export function bilerp(
	a: float4x4,
	b: float4x4,
	c: float4x4,
	d: float4x4,
	u: float,
	v: float
): float4x4;
/** @shadeup=univ(!bilerp_`0`($0$, $1$, $2$, $3$, $4$, $5$)) */
export function bilerp(a: any, b: any, c: any, d: any, u: float, v: float): any {
	return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

/** @shadeup=univ(length)*/
export function length(a: float): float;
export function length(a: float2): float;
export function length(a: float3): float;
export function length(a: float4): float;
/** @shadeup=univ(length)*/
export function length(a: any): any {
	if (typeof a === 'number') {
		return Math.abs(a);
	} else if (a.length === 2) {
		return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2));
	} else if (a.length === 3) {
		return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2));
	} else if (a.length === 4) {
		return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
	} else {
		throw new Error('Invalid vector length');
	}
}

/** @shadeup=univ(distance)*/
export function dist(a: float, b: float): float;
export function dist(a: float2, b: float2): float;
export function dist(a: float3, b: float3): float;
export function dist(a: float4, b: float4): float;
export function dist<T extends vectorOrScalar>(a: T, b: T): float {
	return length(sub(a, b));
}

/** @shadeup=univ(distance)*/
export const distance = dist;

/** @shadeup=univ(normalize)*/
export function normalize(a: float2): float2;
export function normalize(a: float3): float3;
export function normalize(a: float4): float4;
/** @shadeup=univ(normalize)*/
export function normalize(a: any): any {
	if (a.length === 2) {
		let l = length(a);
		return [a[0] / l, a[1] / l];
	} else if (a.length === 3) {
		let l = length(a);
		return [a[0] / l, a[1] / l, a[2] / l];
	} else if (a.length === 4) {
		let l = length(a);
		return [a[0] / l, a[1] / l, a[2] / l, a[3] / l];
	} else {
		throw new Error('Invalid vector length');
	}
}

/** @shadeup=univ(reflect)*/
export function reflect(a: float2, b: float2): float2;
export function reflect(a: float3, b: float3): float3;
export function reflect(a: float4, b: float4): float4;
/** @shadeup=univ(reflect)*/
export function reflect(a: any, b: any): any {
	if (a.length === 2 && b.length === 2) {
		return reflect2(a, b);
	} else if (a.length === 3 && b.length === 3) {
		return reflect3(a, b);
	} else if (a.length === 4 && b.length === 4) {
		return reflect4(a, b);
	} else {
		throw new Error('Invalid vector length');
	}
}

function reflect2(b, a) {
	let dot = dot2(a, b);
	return [b[0] - 2 * dot * a[0], b[1] - 2 * dot * a[1]];
}

function reflect3(b, a) {
	let dot = dot3(a, b);
	return [b[0] - 2 * dot * a[0], b[1] - 2 * dot * a[1], b[2] - 2 * dot * a[2]];
}

function reflect4(b, a) {
	let dot = dot4(a, b);
	return [
		b[0] - 2 * dot * a[0],
		b[1] - 2 * dot * a[1],
		b[2] - 2 * dot * a[2],
		b[3] - 2 * dot * a[3]
	];
}

/** @shadeup=univ(refract)*/
export function refract(a: float2, b: float2, eta: float): float2;
export function refract(a: float3, b: float3, eta: float): float3;
export function refract(a: float4, b: float4, eta: float): float4;
/** @shadeup=univ(refract)*/
export function refract(a: any, b: any, eta: number): any {
	if (a.length === 2 && b.length === 2) {
		return refract2(a, b, eta);
	} else if (a.length === 3 && b.length === 3) {
		return refract3(a, b, eta);
	} else if (a.length === 4 && b.length === 4) {
		return refract4(a, b, eta);
	} else {
		throw new Error('Invalid vector length');
	}
}

function refract2(b, a, eta) {
	let dot = dot2(a, b);
	let k = 1 - eta * eta * (1 - dot * dot);
	return k < 0
		? [0, 0]
		: [
				eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
				eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1]
		  ];
}

function refract3(b, a, eta) {
	let dot = dot3(a, b);
	let k = 1 - eta * eta * (1 - dot * dot);
	return k < 0
		? [0, 0, 0]
		: [
				eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
				eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1],
				eta * b[2] - (eta * dot + Math.sqrt(k)) * a[2]
		  ];
}

function refract4(b, a, eta) {
	let dot = dot4(a, b);
	let k = 1 - eta * eta * (1 - dot * dot);
	return k < 0
		? [0, 0, 0, 0]
		: [
				eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
				eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1],
				eta * b[2] - (eta * dot + Math.sqrt(k)) * a[2],
				eta * b[3] - (eta * dot + Math.sqrt(k)) * a[3]
		  ];
}

/** @shadeup=univ(degrees)*/
export function degrees(a: float): float {
	return float((a * 180) / Math.PI);
}

/** @shadeup=univ(radians)*/
export function radians(a: float): float {
	return float((a * Math.PI) / 180);
}

/** @shadeup=univ(step)*/
export function step(edge: float, x: float): float;
export function step(edge: int, x: float): float;
export function step<T extends vector>(edge: T, x: T): T;
export function step<T extends vector>(edge: float, x: T): T;
export function step<T extends vector>(edge: int, x: T): T;
/** @shadeup=univ(step)*/
export function step(edge: any, x: any): any {
	if (typeof edge === 'number') {
		if (typeof x === 'number') {
			return x < edge ? 0 : 1;
		} else {
			return x.map((v) => (v < edge ? 0 : 1));
		}
	} else {
		if (typeof x === 'number') {
			return edge.map((v) => (x < v ? 0 : 1));
		} else {
			return edge.map((v, i) => (x[i] < v ? 0 : 1));
		}
	}
}

function _smoothstep(a, b, x) {
	let t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
}

/** @shadeup=univ(smoothstep)*/
export function smoothstep(a: float, b: float, x: float): float;
export function smoothstep(a: float2, b: float2, x: float2): float2;
export function smoothstep(a: float3, b: float3, x: float3): float3;
export function smoothstep(a: float4, b: float4, x: float4): float4;
/** @shadeup=univ(smoothstep)*/
export function smoothstep(a: any, b: any, x: any): any {
	if (typeof a === 'number' && typeof b === 'number' && typeof x === 'number') {
		return _smoothstep(a, b, x);
	} else if (typeof a === 'number' && typeof b === 'number') {
		return x.map((v) => _smoothstep(a, b, v));
	} else {
		return a.map((v, i) => _smoothstep(v, b[i], x[i]));
	}
}

function componentReduce(vectors: vector[], cb: (a: scalar[]) => scalar) {
	let result: scalar[] = [];
	for (let i = 0; i < vectors[0].length; i++) {
		result.push(cb(vectors.map((v) => v[i])));
	}
	return result;
}

/** @shadeup=univ(min)*/

export function min(a: int, ...b: int[]): int;
export function min(a: int2, ...b: int2[]): int2;
export function min(a: int3, ...b: int3[]): int3;
export function min(a: int4, ...b: int4[]): int4;
export function min(a: float, ...b: float[]): float;
export function min(a: float2, ...b: float2[]): float2;
export function min(a: float3, ...b: float3[]): float3;
export function min(a: float4, ...b: float4[]): float4;

export function min<T extends float2 | float3 | float4>(a: float, b: T): T;
export function min<T extends float2 | float3 | float4>(a: T, b: float): T;
export function min<T extends int2 | int3 | int4>(a: int, b: T): T;
export function min<T extends int2 | int3 | int4>(a: T, b: int): T;

/** @shadeup=univ(min)*/
export function min<T extends vectorOrScalar>(...args: T[]): T {
	if (args.length == 1) {
		if (Array.isArray(args[0])) {
			return Math.min(...args[0]) as T;
		} else {
			return args[0];
		}
	} else {
		if (Array.isArray(args[0]) && !Array.isArray(args[1])) {
			let minTo = args[1] as float;
			return args[0].map((v) => Math.min(v, minTo)) as T;
		} else if (!Array.isArray(args[0]) && Array.isArray(args[1])) {
			let minFrom = args[0] as float;
			return args[1].map((v) => Math.min(minFrom, v)) as T;
		} else if (Array.isArray(args[0])) {
			return componentReduce(args as vector[], (a) => Math.min(...a) as scalar) as T;
		} else {
			return Math.min(...(args as number[])) as T;
		}
	}
}

/** @shadeup=univ(max)*/

export function max(a: int, ...b: int[]): int;
export function max(a: float, ...b: int[]): float;
export function max(a: int, ...b: float[]): float;
export function max(a: int2, ...b: int2[]): int2;
export function max(a: int3, ...b: int3[]): int3;
export function max(a: int4, ...b: int4[]): int4;
export function max(a: float, ...b: float[]): float;
export function max(a: float2, ...b: float2[]): float2;
export function max(a: float3, ...b: float3[]): float3;
export function max(a: float4, ...b: float4[]): float4;

export function max<T extends float2 | float3 | float4>(a: float, b: T): T;
export function max<T extends float2 | float3 | float4>(a: T, b: float): T;
export function max<T extends int2 | int3 | int4>(a: int, b: T): T;
export function max<T extends int2 | int3 | int4>(a: T, b: int): T;
/** @shadeup=univ(max)*/
export function max<T extends vectorOrScalar>(...args: T[]): T {
	if (args.length == 1) {
		if (Array.isArray(args[0])) {
			return Math.max(...args[0]) as T;
		} else {
			return args[0];
		}
	} else {
		if (Array.isArray(args[0]) && !Array.isArray(args[1])) {
			let maxTo = args[1] as float;
			return args[0].map((v) => Math.max(v, maxTo)) as T;
		} else if (!Array.isArray(args[0]) && Array.isArray(args[1])) {
			let maxFrom = args[0] as float;
			return args[1].map((v) => Math.max(maxFrom, v)) as T;
		} else if (Array.isArray(args[0])) {
			return componentReduce(args as vector[], (a) => Math.max(...a) as scalar) as T;
		} else {
			return Math.max(...(args as number[])) as T;
		}
	}
}

/** @shadeup=univ(clamp)*/
export function clamp(arg: int, min: int, max: int): int;
export function clamp(arg: int2, min: int, max: int): int2;
export function clamp(arg: int3, min: int, max: int): int3;
export function clamp(arg: int4, min: int, max: int): int4;

export function clamp(arg: int2, min: int2, max: int2): int2;
export function clamp(arg: int3, min: int3, max: int3): int3;
export function clamp(arg: int4, min: int3, max: int3): int4;

export function clamp(arg: float, min: float, max: float): float;
export function clamp(arg: float2, min: float, max: float): float2;
export function clamp(arg: float3, min: float, max: float): float3;
export function clamp(arg: float4, min: float, max: float): float4;

export function clamp(arg: float2, min: float2, max: float2): float2;
export function clamp(arg: float3, min: float3, max: float3): float3;
export function clamp(arg: float4, min: float4, max: float4): float4;
/** @shadeup=univ(clamp)*/
export function clamp(arg: any, min: any, max: any): any {
	if (Array.isArray(arg)) {
		if (Array.isArray(min) && Array.isArray(max)) {
			return arg.map((a, i) => Math.min(Math.max(a, min[i]), max[i]));
		} else {
			return arg.map((a) => Math.min(Math.max(a, min), max));
		}
	} else {
		return Math.min(Math.max(arg, min), max);
	}
}

/** @shadeup=glsl(!clamp($0$, 0.0, 1.0)) @shadeup=wgsl(saturate)*/
export function saturate(arg: float): float;
export function saturate(arg: float2): float2;
export function saturate(arg: float3): float3;
export function saturate(arg: float4): float4;
/** @shadeup=glsl(!clamp($0$, 0.0, 1.0)) @shadeup=wgsl(saturate) */
export function saturate(arg: any): any {
	return clamp(arg, float(0), float(1));
}

/** @shadeup=univ(!($0$ == $1$))*/
export function eq<T extends vectorOrScalar | string>(a: T, b: T): bool;
export function eq(a: any, b: any): bool {
	let ta = typeof a;
	let tb = typeof b;
	if (ta != tb) {
		return false;
	} else if (
		(ta == 'number' && tb == 'number') ||
		(ta == 'string' && tb == 'string') ||
		(ta == 'boolean' && tb == 'boolean') ||
		(ta == 'undefined' && tb == 'undefined')
	) {
		return a == b;
	} else if (ta == 'object' && tb == 'object') {
		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length != b.length) {
				return false;
			}
			for (let i = 0; i < a.length; i++) {
				if (!eq(a[i], b[i])) {
					return false;
				}
			}
			return true;
		} else {
			return a == b;
		}
	}
}

/** @shadeup=univ(!($0$ != $1$))*/
export const neq = (a, b) => !eq(a, b);

/** @shadeup=univ(!($0$ < $1$))*/
export const lt = (a: scalar, b: scalar) => a < b;

/** @shadeup=univ(!($0$ <= $1$))*/
export const lte = (a: scalar, b: scalar) => a <= b;

/** @shadeup=univ(!($0$ > $1$))*/
export const gt = (a: scalar, b: scalar) => a > b;

/** @shadeup=univ(!($0$ >= $1$))*/
export const gte = (a: scalar, b: scalar) => a >= b;

/** @shadeup=univ(!($0$ && $1$))*/
export const and = (a: boolean, b: boolean) => a && b;

/** @shadeup=univ(!($0$ || $1$))*/
export const or = (a: boolean, b: boolean) => a || b;

/** @shadeup=univ(!(!$0$))*/
export const not = (a: boolean) => !a;

/** @shadeup=univ(~)*/
export function makeVector(x: int, y: int): int2;
export function makeVector(x: float, y: int): float2;
export function makeVector(x: int, y: float): float2;
export function makeVector(x: float, y: float): float2;

export function makeVector(x: int, y: int, z: int): int3;
export function makeVector(xy: int2, z: int): int3;
export function makeVector(x: int, yz: int2): int3;

export function makeVector(x: float, y: int, z: int): float3;
export function makeVector(x: int, y: float, z: int): float3;
export function makeVector(x: int, y: int, z: float): float3;
export function makeVector(x: float, y: float, z: int): float3;
export function makeVector(x: float, y: int, z: float): float3;
export function makeVector(x: int, y: float, z: float): float3;
export function makeVector(x: float, y: float, z: float): float3;
export function makeVector(xy: float2, z: float): float3;
export function makeVector(x: float, yz: float2): float3;
export function makeVector(xy: int2, z: float): float3;
export function makeVector(x: int, yz: float2): float3;
export function makeVector(xy: float2, z: int): float3;
export function makeVector(x: float, yz: int2): float3;

export function makeVector(x: int, y: int, z: int, w: int): int4;
export function makeVector(xyz: int3, w: int): int4;
export function makeVector(x: int, yzw: int3): int4;

export function makeVector(x: int, y: int, zw: int2): int4;
export function makeVector(xy: int2, z: int, w: int): int4;
export function makeVector(x: int, yz: int2, w: int): int4;

export function makeVector(xy: int2, zw: int2): int4;

export function makeVector(x: float, y: int, z: int, w: int): float4;
export function makeVector(x: int, y: float, z: int, w: int): float4;
export function makeVector(x: int, y: int, z: float, w: int): float4;
export function makeVector(x: int, y: int, z: int, w: float): float4;
export function makeVector(x: float, y: float, z: int, w: int): float4;
export function makeVector(x: float, y: int, z: float, w: int): float4;
export function makeVector(x: float, y: int, z: int, w: float): float4;
export function makeVector(x: int, y: float, z: float, w: int): float4;
export function makeVector(x: int, y: float, z: int, w: float): float4;
export function makeVector(x: int, y: int, z: float, w: float): float4;
export function makeVector(x: float, y: float, z: float, w: int): float4;
export function makeVector(x: float, y: float, z: int, w: float): float4;
export function makeVector(x: float, y: int, z: float, w: float): float4;
export function makeVector(x: int, y: float, z: float, w: float): float4;
export function makeVector(xyz: float3, w: float): float4;
export function makeVector(x: float, yzw: float3): float4;
export function makeVector(xyz: int3, w: float): float4;
export function makeVector(x: int, yzw: float3): float4;
export function makeVector(xyz: float3, w: int): float4;
export function makeVector(x: float, yzw: int3): float4;
export function makeVector(x: float, yz: float2, w: int): float4;
export function makeVector(x: float, yz: int2, w: float): float4;
export function makeVector(x: int, yz: float2, w: float): float4;
export function makeVector(x: float, y: float, zw: float2): float4;
export function makeVector(x: float, y: int, zw: float2): float4;
export function makeVector(x: float, y: int, zw: int2): float4;
export function makeVector(x: int, y: float, zw: float2): float4;
export function makeVector(x: int, y: float, zw: int2): float4;
export function makeVector(x: int, y: int, zw: float2): float4;
export function makeVector(x: float, y: float, z: float, w: float): float4;
export function makeVector(xy: float2, z: float, w: float): float4;
export function makeVector(x: float, yz: float2, w: float): float4;
export function makeVector(x: float, y: float, zw: float2): float4;
export function makeVector(xy: int2, z: float, w: float): float4;
export function makeVector(x: int, yz: float2, w: float): float4;
export function makeVector(x: int, y: float, zw: float2): float4;
export function makeVector(xy: float2, z: int, w: float): float4;
export function makeVector(x: float, yz: int2, w: float): float4;
export function makeVector(x: float, y: int, zw: float2): float4;
export function makeVector(xy: int2, z: float, w: int): float4;
export function makeVector(x: int, yz: float2, w: int): float4;
export function makeVector(x: int, y: float, zw: int2): float4;
export function makeVector(xy: float2, z: int, w: int): float4;
export function makeVector(x: float, yz: int2, w: int): float4;
export function makeVector(x: float, y: int, zw: int2): float4;
export function makeVector(xy: int2, z: int, w: float): float4;
export function makeVector(x: int, yz: int2, w: float): float4;
export function makeVector(x: int, y: int, zw: float2): float4;
export function makeVector(xy: int2, z: int, w: int): int4;
/** @shadeup=univ()*/
export function makeVector() {
	let out = [];
	for (let i = 0; i < arguments.length; i++) {
		let a = arguments[i];
		if (typeof a === 'number') {
			out.push(a);
		} else {
			for (let j = 0; j < a.length; j++) {
				out.push(a[j]);
			}
		}
	}
	return out;

	throw new Error('Invalid vector length');
}

// add('test', int(1));

type swizChar = 'x' | 'y' | 'z' | 'w' | 'r' | 'g' | 'b' | 'a';
type swizStr4 = `${swizChar}${swizChar}${swizChar}${swizChar}`;
type swizStr3 = `${swizChar}${swizChar}${swizChar}`;
type swizStr2 = `${swizChar}${swizChar}`;
type swizStr1 = `${swizChar}`;
type swizStr4Ord = `xyzw` | `rgba` | `xxxx` | `rrrr`;
type swizStr3Ord = `xyz` | `rgb` | `xxx` | `rrr`;
type swizStr2Ord = `xy` | `rg` | `xx` | `rr`;
type swizStr1Ord = `x` | `r`;

const swizIndex: { [key: string]: number } = {
	x: 0,
	y: 1,
	z: 2,
	w: 3,
	r: 0,
	g: 1,
	b: 2,
	a: 3
};

const getSwizIndexFast = (swiz: string) => {
	switch (swiz) {
		case 'x':
			return 0;
		case 'y':
			return 1;
		case 'z':
			return 2;
		case 'w':
			return 3;
		case 'r':
			return 0;
		case 'g':
			return 1;
		case 'b':
			return 2;
		case 'a':
			return 3;
	}
};

/** @shadeup=shader */
export function testDocComment() {
	return 1;
}

/** @shadeup=univ(~)*/
export function swizzle<S extends swizStr4Ord, T extends int>(v: T, swiz: S, assign?: T): int4;

export function swizzle<S extends swizStr4Ord, T extends uint>(v: T, swiz: S, assign?: T): uint4;

export function swizzle<S extends swizStr4Ord, T extends float>(v: T, swiz: S, assign?: T): float4;

export function swizzle<S extends swizStr3Ord, T extends int>(v: T, swiz: S, assign?: T): int3;

export function swizzle<S extends swizStr3Ord, T extends uint>(v: T, swiz: S, assign?: T): uint3;

export function swizzle<S extends swizStr3Ord, T extends float>(v: T, swiz: S, assign?: T): float3;

export function swizzle<S extends swizStr2Ord, T extends int>(v: T, swiz: S, assign?: T): int2;

export function swizzle<S extends swizStr2Ord, T extends uint>(v: T, swiz: S, assign?: T): uint2;

export function swizzle<S extends swizStr2Ord, T extends float>(v: T, swiz: S, assign?: T): float2;

export function swizzle<S extends swizStr1Ord, T extends int>(v: T, swiz: S, assign?: T): int;

export function swizzle<S extends swizStr1Ord, T extends uint>(v: T, swiz: S, assign?: T): uint;

export function swizzle<S extends swizStr1Ord, T extends float>(v: T, swiz: S, assign?: T): float;

export function swizzle<S extends swizStr4, T extends anyInt>(v: T, swiz: S, assign?: int4): int4;

export function swizzle<S extends swizStr4, T extends anyUint>(
	v: T,
	swiz: S,
	assign?: uint4
): uint4;

export function swizzle<S extends swizStr4, T extends anyFloat>(
	v: T,
	swiz: S,
	assign?: float4
): float4;

export function swizzle<S extends swizStr3, T extends anyInt>(v: T, swiz: S, assign?: int3): int3;

export function swizzle<S extends swizStr3, T extends anyUint>(
	v: T,
	swiz: S,
	assign?: uint3
): uint3;

export function swizzle<S extends swizStr3, T extends anyFloat>(
	v: T,
	swiz: S,
	assign?: float3
): float3;

export function swizzle<S extends swizStr2, T extends anyInt>(v: T, swiz: S, assign?: int2): int2;

export function swizzle<S extends swizStr2, T extends anyUint>(
	v: T,
	swiz: S,
	assign?: uint2
): uint2;

export function swizzle<S extends swizStr2, T extends anyFloat>(
	v: T,
	swiz: S,
	assign?: float2
): float2;

export function swizzle<S extends swizStr1, T extends anyInt>(v: T, swiz: S, assign?: int): int;

export function swizzle<S extends swizStr1, T extends anyUint>(v: T, swiz: S, assign?: uint): uint;

export function swizzle<S extends swizStr1, T extends anyFloat>(
	v: T,
	swiz: S,
	assign?: float
): float;

export function swizzle<S extends string, T, A extends keyof T>(v: T, swiz: A, assign?: T): T[A];

export function swizzle(v: any, swiz: string, assign?: any) {
	if (typeof v === 'number') {
		if (swiz.length === 1) {
			return v;
		} else if (swiz.length === 2) {
			return [v, v];
		} else if (swiz.length === 3) {
			return [v, v, v];
		} else if (swiz.length === 4) {
			return [v, v, v, v];
		}
	} else if (Array.isArray(v)) {
		if (typeof assign !== 'undefined') {
			for (let i = 0; i < swiz.length; i++) {
				v[getSwizIndexFast(swiz[i])] = assign[i] ?? assign;
			}
			return v;
		}
		if (swiz.length === 1) {
			return v[getSwizIndexFast(swiz)];
		} else if (swiz.length === 2) {
			return [v[getSwizIndexFast(swiz[0])], v[getSwizIndexFast(swiz[1])]];
		} else if (swiz.length === 3) {
			return [
				v[getSwizIndexFast(swiz[0])],
				v[getSwizIndexFast(swiz[1])],
				v[getSwizIndexFast(swiz[2])]
			];
		} else if (swiz.length === 4) {
			return [
				v[getSwizIndexFast(swiz[0])],
				v[getSwizIndexFast(swiz[1])],
				v[getSwizIndexFast(swiz[2])],
				v[getSwizIndexFast(swiz[3])]
			];
		}
	} else {
		return (v as any)[swiz];
	}
}

export function intifyVector(v: vector) {
	if (typeof v === 'number') {
		return v;
	} else if (Array.isArray(v)) {
		return v.map((v) => v | 0);
	} else {
		return v;
	}
}

import { FM as FastMath } from './static-math';
export const FM = FastMath;

// type f32 = number & { __float: never };
// type i32 = number & { __int: never };
// type num = f32 | i32;

// function f32(a: number): f32 {
// 	return a as f32;
// }

// function i32(a: number): i32 {
// 	return a as i32;
// }

// type numeric2 = <A extends num, B extends num>(a: A, b: B) => (A extends f32 ? f32 : (B extends f32 ? f32 : i32));
// type numeric3 = <A extends num, B extends num, C extends num>(a: A, b: B, c: C) => (A extends f32 ? f32 : (B extends f32 ? f32 : (C extends f32 ? f32 : i32)));

// export const abc: numeric2 = (a, b, c) => a + b + c;

// abc(f32(1), i32(2));

export class atomic_internal<T extends uint | int> {
	private __type: T;
	private __value: number;
	constructor(value: T) {
		this.__value = value;
	}

	private $mutate?: (to: value) => void;

	/** @shadeup=univ(!atomicLoad(&$self$))*/
	load(): T {
		return this.__value as T;
	}
	/** @shadeup=univ(!atomicStore(&$self$, $0$))*/
	store(value: T): void {
		this.__value = value as any;
		if (this.$mutate) this.$mutate(this.__value);
	}

	/** @shadeup=univ(!atomicAdd(&$self$, $0$))*/
	add(value: T): T {
		let old = this.__value;
		this.__value += value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicSub(&$self$, $0$))*/
	sub(value: T): T {
		let old = this.__value;
		this.__value -= value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicMax(&$self$, $0$))*/
	max(value: T): T {
		let old = this.__value;
		this.__value = Math.max(value, this.__value);
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicMin(&$self$, $0$))*/
	min(value: T): T {
		let old = this.__value;
		this.__value = Math.min(value, this.__value);
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicAnd(&$self$, $0$))*/
	and(value: T): T {
		let old = this.__value;
		this.__value = value & this.__value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicOr(&$self$, $0$))*/
	or(value: T): T {
		let old = this.__value;
		this.__value = value | this.__value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicXor(&$self$, $0$))*/
	xor(value: T): T {
		let old = this.__value;
		this.__value = value ^ this.__value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicExchange(&$self$, $0$))*/
	exchange(value: T): T {
		let old = this.__value;
		this.__value = value;
		if (this.$mutate) this.$mutate(this.__value);
		return old as T;
	}
	/** @shadeup=univ(!atomicCompareExchangeWeak(&$self$, $0$, $1$))*/
	compareExchangeWeak(compare: T, value: T): __atomic_compare_exchange_result<T> {
		let old = this.__value;
		if (old == compare) {
			this.__value = value;
		}
		if (this.$mutate) this.$mutate(this.__value);
		return {
			old_value: old as T,
			exchanged: old == compare
		};
	}
}

export type __atomic_compare_exchange_result<T extends uint | int> = {
	old_value: T;
	exchanged: boolean;
};

export type atomic<T extends uint | int> = atomic_internal<T>;

export function atomic<T extends uint | int>(value: T): atomic<T> {
	return new atomic_internal(value);
}

(window as any).makeAtomic = atomic;

/**
 * Executes a control barrier synchronization function that affects memory and atomic operations in the workgroup address space.
 *
 * See: https://www.w3.org/TR/WGSL/#workgroupBarrier-builtin
 *
 * @shadeup=univ(!workgroupBarrier())
 */
export function workgroupBarrier() {}

/**
 * Executes a storage barrier synchronization function that affects memory and atomic operations in the workgroup address space.
 *
 * See: https://www.w3.org/TR/WGSL/#storageBarrier-builtin
 *
 * @shadeup=univ(!storageBarrier())
 */
export function storageBarrier() {}

/**
 * See: https://www.w3.org/TR/WGSL/#workgroupUniformLoad-builtin
 *
 * @shadeup=univ(!workgroupUniformLoad(&$0$))
 */
export function workgroupUniformLoad<T>(p: T): T {
	return p;
}

/**
 * Discards the current fragment.
 *
 * A discard statement converts the invocation into a helper invocation and throws away the fragment. The discard statement must only be used in a fragment shader stage.
 *
 * See: https://www.w3.org/TR/WGSL/#discard-statement
 *
 * @shadeup=univ(!discard;)
 */
export function discard() {}

/**
 * Returns the derivative of the input value with respect to the window-space x coordinate.
 * @param value - The input value.
 * @returns The derivative of the input value with respect to the window-space x coordinate.
 * @shadeup=glsl(!dFdx($0$))
 * @shadeup=wgsl(!dpdx($0$))
 */
export function ddx<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * Returns the derivative of the input value with respect to the window-space y coordinate.
 * @param value - The input value.
 *
 * @returns The derivative of the input value with respect to the window-space y coordinate.
 * @shadeup=glsl(!dFdy($0$))
 * @shadeup=wgsl(!dpdy($0$))
 */
export function ddy<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * @shadeup=glsl(!dFdxFine($0$))
 * @shadeup=wgsl(!dpdxFine($0$))
 */
export function ddxFine<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * @shadeup=glsl(!dFdyFine($0$))
 * @shadeup=wgsl(!dpdyFine($0$))
 */
export function ddyFine<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * @shadeup=glsl(!dFdxCoarse($0$))
 * @shadeup=wgsl(!dpdxCoarse($0$))
 */
export function ddxCoarse<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * @shadeup=glsl(!dFdyCoarse($0$))
 * @shadeup=wgsl(!dpdyCoarse($0$))
 */
export function ddyCoarse<T extends scalar | vector>(value: T): T {
	return 0 as T;
}

/**
 * @shadeup=glsl(!$0$)
 * @shadeup=wgsl(!bitcast<$[0]$>($0$))
 */
export function bitcast<T extends scalar>(value: scalar): T {
	return 0 as T;
}
