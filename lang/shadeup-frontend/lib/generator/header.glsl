uint shadeup_up_swizzle_x_uint(uint n) {
	return n;
}

uvec2 shadeup_up_swizzle_xx_uint(uint n) {
	return uvec2(n, n);
}

uvec3 shadeup_up_swizzle_xxx_uint(uint n) {
	return uvec3(n, n, n);
}

uvec4 shadeup_up_swizzle_xxxx_uint(uint n) {
	return uvec4(n, n, n, n);
}

ivec2 shadeup_up_swizzle_xy_uint(uint n) {
	return uvec2(n, n);
}

uvec3 shadeup_up_swizzle_xyz_uint(uint n) {
	return uvec3(n, n, n);
}

uvec4 shadeup_up_swizzle_xyzw_uint(uint n) {
	return uvec4(n, n, n, n);
}

int shadeup_up_swizzle_x_int(int n) {
	return n;
}

ivec2 shadeup_up_swizzle_xx_int(int n) {
	return ivec2(n, n);
}

ivec3 shadeup_up_swizzle_xxx_int(int n) {
	return ivec3(n, n, n);
}

ivec4 shadeup_up_swizzle_xxxx_int(int n) {
	return ivec4(n, n, n, n);
}

ivec2 shadeup_up_swizzle_xy_int(int n) {
	return ivec2(n, n);
}

ivec3 shadeup_up_swizzle_xyz_int(int n) {
	return ivec3(n, n, n);
}

ivec4 shadeup_up_swizzle_xyzw_int(int n) {
	return ivec4(n, n, n, n);
}

ivec4 shadeup_up_swizzle_xxxx_int(int n) {
	return ivec4(n, n, n, n);
}

float shadeup_up_swizzle_x_float(float n) {
	return n;
}

vec2 shadeup_up_swizzle_xx_float(float n) {
	return vec2(n, n);
}

vec3 shadeup_up_swizzle_xxx_float(float n) {
	return vec3(n, n, n);
}

vec4 shadeup_up_swizzle_xxxx_float(float n) {
	return vec4(n, n, n, n);
}

vec2 shadeup_up_swizzle_xy_float(float n) {
	return vec2(n, n);
}

vec3 shadeup_up_swizzle_xyz_float(float n) {
	return vec3(n, n, n);
}

vec4 shadeup_up_swizzle_xyzw_float(float n) {
	return vec4(n, n, n, n);
}

mat4 matrix_inversefloat4x4(mat4 m) {
	return inverse(m);
}

mat3 matrix_inversefloat3x3(mat3 m) {
	return inverse(m);
}

mat2 matrix_inversefloat2x2(mat2 m) {
	return inverse(m);
}

float bilerp_float(float a, float b, float c, float d, float u, float v) {
	return mix(mix(a, b, u), mix(c, d, u), v);
}

vec2 bilerp_float2(vec2 a, vec2 b, vec2 c, vec2 d, float u, float v) {
	return mix(mix(a, b, u), mix(c, d, u), v);
}

vec3 bilerp_float3(vec3 a, vec3 b, vec3 c, vec3 d, float u, float v) {
	return mix(mix(a, b, u), mix(c, d, u), v);
}

vec4 bilerp_float4(vec4 a, vec4 b, vec4 c, vec4 d, float u, float v) {
	return mix(mix(a, b, u), mix(c, d, u), v);
}

mat2 bilerp_float2x2(mat2 a, mat2 b, mat2 c, mat2 d, float u, float v) {
	return mat2(bilerp_float2(a[0], b[0], c[0], d[0], u, v), bilerp_float2(a[1], b[1], c[1], d[1], u, v));
}

mat3 bilerp_float3x3(mat3 a, mat3 b, mat3 c, mat3 d, float u, float v) {
	return mat3(bilerp_float3(a[0], b[0], c[0], d[0], u, v), bilerp_float3(a[1], b[1], c[1], d[1], u, v), bilerp_float3(a[2], b[2], c[2], d[2], u, v));
}

mat4 bilerp_float4x4(mat4 a, mat4 b, mat4 c, mat4 d, float u, float v) {
	return mat4(bilerp_float4(a[0], b[0], c[0], d[0], u, v), bilerp_float4(a[1], b[1], c[1], d[1], u, v), bilerp_float4(a[2], b[2], c[2], d[2], u, v), bilerp_float4(a[3], b[3], c[3], d[3], u, v));
}