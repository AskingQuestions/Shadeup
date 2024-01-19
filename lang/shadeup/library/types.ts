export type bool = boolean;
export type float = number & { _opaque_float: 2 };
export type int = number & { _opaque_int: 1 } & float;
export type uint = number & { _opaque_uint: 1 } & float & int;
type scalar = float | int;

export type float2 = [float, float];
export type float3 = [float, float, float];
export type float4 = [float, float, float, float];
export type int2 = [int, int];
export type int3 = [int, int, int];
export type int4 = [int, int, int, int];

type anyFloat = float2 | float3 | float4;
type anyInt = int2 | int3 | int4;

type vector2 = float2 | int2;
type vector3 = float3 | int3;
type vector4 = float4 | int4;

type vector = vector2 | vector3 | vector4;

type vectorOrScalar = vector | scalar;

type float2x2 = [float, float, float, float];
type float3x3 = [float, float, float, float, float, float, float, float, float];
type float4x4 = [
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
];
