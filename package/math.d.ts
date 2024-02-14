export type bool = boolean;
export type float = number & { _opaque_float: 2 };
export type int = number & { _opaque_int: 1 } & float;
export type uint = number & { _opaque_uint: 1 };
type scalar = float | int | uint;

export type float2 = [float, float] & { _opaque_vector_float_2: 2; length: 2 };
export type float3 = [float, float, float] & {
  _opaque_vector_float_3: 3;
  length: 3;
};
export type float4 = [float, float, float, float] & {
  _opaque_vector_float_4: 4;
  length: 4;
};
export type int2 = [int, int] & { _opaque_vector_int_2: 2 } & float2;
export type int3 = [int, int, int] & { _opaque_vector_int_3: 3 } & float3;
export type int4 = [int, int, int, int] & { _opaque_vector_int_4: 4 } & float4;

export type uint2 = [uint, uint] & { _opaque_vector_uint_2: 2 } & float2;
export type uint3 = [uint, uint, uint] & { _opaque_vector_uint_3: 3 } & float3;
export type uint4 = [uint, uint, uint, uint] & {
  _opaque_vector_uint_4: 4;
} & float4;

export type uint8 = number & { _opaque_uint8: 1 };

export interface float2x2
  extends Omit<[float, float, float, float], "__index"> {
  __matrix: 2;
  [index: int]: float;
  __index(index: number): [float, float];
}

export interface float3x3
  extends Omit<
    [float, float, float, float, float, float, float, float, float],
    "__index"
  > {
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
    "__index"
  > {
  __matrix: 4;
  [index: int]: float;
  __index(index: number): [float, float, float, float];
}
