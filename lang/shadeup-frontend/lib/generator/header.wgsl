fn shadeup_up_swizzle_x_u32(n: u32) -> u32{
	return n;
}
fn shadeup_up_swizzle_xx_u32(n: u32) -> vec2<u32>{
	return vec2<u32>(n, n);
}
fn shadeup_up_swizzle_xxx_u32(n: u32) -> vec3<u32>{
	return vec3<u32>(n, n, n);
}
fn shadeup_up_swizzle_xxxx_u32(n: u32) -> vec4<u32>{
	return vec4<u32>(n, n, n, n);
}

fn shadeup_up_swizzle_xy_u32(n: u32) -> vec2<u32>{
	return vec2<u32>(n, n);
}

fn shadeup_up_swizzle_xyz_u32(n: u32) -> vec3<u32>{
	return vec3<u32>(n, n, n);
}

fn shadeup_up_swizzle_xyzw_u32(n: u32) -> vec4<u32>{
	return vec4<u32>(n, n, n, n);
}

fn shadeup_up_swizzle_x_i32(n: i32) -> i32{
	return n;
}

fn shadeup_up_swizzle_xx_i32(n: i32) -> vec2<i32>{
	return vec2<i32>(n, n);
}

fn shadeup_up_swizzle_xxx_i32(n: i32) -> vec3<i32>{
	return vec3<i32>(n, n, n);
}

fn shadeup_up_swizzle_xxxx_i32(n: i32) -> vec4<i32>{
	return vec4<i32>(n, n, n, n);
}

fn shadeup_up_swizzle_xy_i32(n: i32) -> vec2<i32>{
	return vec2<i32>(n, n);
}

fn shadeup_up_swizzle_xyz_i32(n: i32) -> vec3<i32>{
	return vec3<i32>(n, n, n);
}

fn shadeup_up_swizzle_xyzw_i32(n: i32) -> vec4<i32>{
	return vec4<i32>(n, n, n, n);
}

fn shadeup_up_swizzle_x_f32(n: f32) -> f32{
	return n;
}

fn shadeup_up_swizzle_xx_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
}

fn shadeup_up_swizzle_xxx_f32(n: f32) -> vec3<f32>{
	return vec3<f32>(n, n, n);
}

fn shadeup_up_swizzle_xxxx_f32(n: f32) -> vec4<f32>{
	return vec4<f32>(n, n, n, n);
}

fn shadeup_up_swizzle_xy_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
}

fn shadeup_up_swizzle_xyz_f32(n: f32) -> vec3<f32>{
	return vec3<f32>(n, n, n);
}

fn shadeup_up_swizzle_xyzw_f32(n: f32) -> vec4<f32>{
	return vec4<f32>(n, n, n, n);
}

fn squash_bool_vec2(n: vec2<bool>) -> bool {
	return n.x && n.y;
}

fn squash_bool_vec3(n: vec3<bool>) -> bool {
	return n.x && n.y && n.z;
}

fn squash_bool_vec4(n: vec4<bool>) -> bool {
	return n.x && n.y && n.z && n.w;
}

fn matrix_inversefloat4x4(m: mat4x4<f32>) -> mat4x4<f32>{
	let n11 = m[0][0];
	let n12 = m[1][0];
	let n13 = m[2][0];
	let n14 = m[3][0];
	let n21 = m[0][1];
	let n22 = m[1][1];
	let n23 = m[2][1];
	let n24 = m[3][1];
	let n31 = m[0][2];
	let n32 = m[1][2];
	let n33 = m[2][2];
	let n34 = m[3][2];
	let n41 = m[0][3];
	let n42 = m[1][3];
	let n43 = m[2][3];
	let n44 = m[3][3];

	let t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
	let t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
	let t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
	let t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

	let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
	let idet = 1.0 / det;

	var ret: mat4x4<f32> = mat4x4<f32>();

	ret[0][0] = t11 * idet;
	ret[0][1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * idet;
	ret[0][2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * idet;
	ret[0][3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * idet;

	ret[1][0] = t12 * idet;
	ret[1][1] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * idet;
	ret[1][2] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * idet;
	ret[1][3] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * idet;

	ret[2][0] = t13 * idet;
	ret[2][1] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * idet;
	ret[2][2] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * idet;
	ret[2][3] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * idet;

	ret[3][0] = t14 * idet;
	ret[3][1] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * idet;
	ret[3][2] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * idet;
	ret[3][3] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * idet;

	return ret;
}

fn matrix_inversefloat3x3(m: mat3x3<f32>) -> mat3x3<f32>{
	let n11 = m[0][0];
	let n12 = m[1][0];
	let n13 = m[2][0];
	let n21 = m[0][1];
	let n22 = m[1][1];
	let n23 = m[2][1];
	let n31 = m[0][2];
	let n32 = m[1][2];
	let n33 = m[2][2];

	let t11 = n22 * n33 - n23 * n32;
	let t12 = n13 * n32 - n12 * n33;
	let t13 = n12 * n23 - n13 * n22;

	let det = n11 * t11 + n21 * t12 + n31 * t13;
	let idet = 1.0 / det;

	var ret: mat3x3<f32> = mat3x3<f32>();

	ret[0][0] = t11 * idet;
	ret[0][1] = (n23 * n31 - n21 * n33) * idet;
	ret[0][2] = (n21 * n32 - n22 * n31) * idet;

	ret[1][0] = t12 * idet;
	ret[1][1] = (n11 * n33 - n13 * n31) * idet;
	ret[1][2] = (n12 * n31 - n11 * n32) * idet;

	ret[2][0] = t13 * idet;
	ret[2][1] = (n13 * n21 - n11 * n23) * idet;
	ret[2][2] = (n11 * n22 - n12 * n21) * idet;

	return ret;
}

fn matrix_inversefloat2x2(m: mat2x2<f32>) -> mat2x2<f32> {
	let n11 = m[0][0];
	let n12 = m[1][0];
	let n21 = m[0][1];
	let n22 = m[1][1];

	let det = n11 * n22 - n12 * n21;
	let idet = 1.0 / det;

	var ret: mat2x2<f32> = mat2x2<f32>();

	ret[0][0] = n22 * idet;
	ret[0][1] = -n12 * idet;
	ret[1][0] = -n21 * idet;
	ret[1][1] = n11 * idet;

	return ret;
}

fn matrix_transposefloat2x2(m: mat2x2<f32>) -> mat2x2<f32> {
	return mat2x2<f32>(m[0][0], m[1][0], m[0][1], m[1][1]);
}

fn matrix_transposefloat3x3(m: mat3x3<f32>) -> mat3x3<f32> {
	return mat3x3<f32>
	(
		m[0][0], m[1][0], m[2][0],
		m[0][1], m[1][1], m[2][1],
		m[0][2], m[1][2], m[2][2]
	);
}

fn matrix_transposefloat4x4(m: mat4x4<f32>) -> mat4x4<f32> {
	return mat4x4<f32>
	(
		m[0][0], m[1][0], m[2][0], m[3][0],
		m[0][1], m[1][1], m[2][1], m[3][1],
		m[0][2], m[1][2], m[2][2], m[3][2],
		m[0][3], m[1][3], m[2][3], m[3][3]
	);
}

fn bilerp_float(a: f32, b: f32, c: f32, d: f32, x: f32, y: f32) -> f32 {
	return mix(mix(a, b, x), mix(c, d, x), y);
}

fn bilerp_float2(a: vec2<f32>, b: vec2<f32>, c: vec2<f32>, d: vec2<f32>, x: f32, y: f32) -> vec2<f32> {
	return mix(mix(a, b, x), mix(c, d, x), y);
}

fn bilerp_float3(a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>, x: f32, y: f32) -> vec3<f32> {
	return mix(mix(a, b, x), mix(c, d, x), y);
}

fn bilerp_float4(a: vec4<f32>, b: vec4<f32>, c: vec4<f32>, d: vec4<f32>, x: f32, y: f32) -> vec4<f32> {
	return mix(mix(a, b, x), mix(c, d, x), y);
}

fn bilerp_float2x2(a: mat2x2<f32>, b: mat2x2<f32>, c: mat2x2<f32>, d: mat2x2<f32>, x: f32, y: f32) -> mat2x2<f32> {
	return mat2x2<f32>
	(
		bilerp_float(a[0][0], b[0][0], c[0][0], d[0][0], x, y),
		bilerp_float(a[0][1], b[0][1], c[0][1], d[0][1], x, y),
		bilerp_float(a[1][0], b[1][0], c[1][0], d[1][0], x, y),
		bilerp_float(a[1][1], b[1][1], c[1][1], d[1][1], x, y)
	);
}

fn bilerp_float3x3(a: mat3x3<f32>, b: mat3x3<f32>, c: mat3x3<f32>, d: mat3x3<f32>, x: f32, y: f32) -> mat3x3<f32> {
	return mat3x3<f32>
	(
		bilerp_float(a[0][0], b[0][0], c[0][0], d[0][0], x, y),
		bilerp_float(a[0][1], b[0][1], c[0][1], d[0][1], x, y),
		bilerp_float(a[0][2], b[0][2], c[0][2], d[0][2], x, y),
		bilerp_float(a[1][0], b[1][0], c[1][0], d[1][0], x, y),
		bilerp_float(a[1][1], b[1][1], c[1][1], d[1][1], x, y),
		bilerp_float(a[1][2], b[1][2], c[1][2], d[1][2], x, y),
		bilerp_float(a[2][0], b[2][0], c[2][0], d[2][0], x, y),
		bilerp_float(a[2][1], b[2][1], c[2][1], d[2][1], x, y),
		bilerp_float(a[2][2], b[2][2], c[2][2], d[2][2], x, y)
	);
}

fn bilerp_float4x4(a: mat4x4<f32>, b: mat4x4<f32>, c: mat4x4<f32>, d: mat4x4<f32>, x: f32, y: f32) -> mat4x4<f32> {
	return mat4x4<f32>
	(
		bilerp_float(a[0][0], b[0][0], c[0][0], d[0][0], x, y),
		bilerp_float(a[0][1], b[0][1], c[0][1], d[0][1], x, y),
		bilerp_float(a[0][2], b[0][2], c[0][2], d[0][2], x, y),
		bilerp_float(a[0][3], b[0][3], c[0][3], d[0][3], x, y),
		bilerp_float(a[1][0], b[1][0], c[1][0], d[1][0], x, y),
		bilerp_float(a[1][1], b[1][1], c[1][1], d[1][1], x, y),
		bilerp_float(a[1][2], b[1][2], c[1][2], d[1][2], x, y),
		bilerp_float(a[1][3], b[1][3], c[1][3], d[1][3], x, y),
		bilerp_float(a[2][0], b[2][0], c[2][0], d[2][0], x, y),
		bilerp_float(a[2][1], b[2][1], c[2][1], d[2][1], x, y),
		bilerp_float(a[2][2], b[2][2], c[2][2], d[2][2], x, y),
		bilerp_float(a[2][3], b[2][3], c[2][3], d[2][3], x, y),
		bilerp_float(a[3][0], b[3][0], c[3][0], d[3][0], x, y),
		bilerp_float(a[3][1], b[3][1], c[3][1], d[3][1], x, y),
		bilerp_float(a[3][2], b[3][2], c[3][2], d[3][2], x, y),
		bilerp_float(a[3][3], b[3][3], c[3][3], d[3][3], x, y)
	);
}