import { bindShadeupEngine } from "shadeup";

export const makeShadeupInstance = bindShadeupEngine((define, localEngineContext) => {
  const __shadeup_gen_shader =
    localEngineContext.__shadeup_gen_shader.bind(localEngineContext);
  const __shadeup_make_shader_inst =
    localEngineContext.__shadeup_make_shader_inst.bind(localEngineContext);
  const __shadeup_register_struct =
    localEngineContext.__shadeup_register_struct.bind(localEngineContext);
  const env = localEngineContext.env;
((defineFunc) => {
    let define = (deps, func) => defineFunc("/__meta.js", deps, func);
  define(["require", "exports"], function (require, exports, __, std___std_all_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.files = ["main"];
  });
})(define);

((defineFunc) => {
	let define = (deps, func) => defineFunc("/main.js", deps, func);
	__shadeup_gen_shader("shd_000710086052666091061257200756375023002800009", {
					webgl: {_ext_uniform_global_tex: {"type":"primitive","name":"texture2d"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["tex",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"sample"}}]]}
				}, {webgpu: `struct ShaderInput {
 @align(16)  position: vec3<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  clipPosition: vec4<f32>,
 @align(16)  realPosition: vec4<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  screen: vec2<f32>,
 @align(16)  color: vec4<f32>,
 @align(16)  groupId: vec3<i32>,
 @align(16)  groupSize: vec3<i32>,
 @align(16)  globalId: vec3<i32>,
 @align(16)  localId: vec3<i32>,
 @align(16)  instanceIndex: i32,
 @align(16)  vertexIndex: i32,
};
struct ShaderOutput {
 @align(16)  position: vec4<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  color: vec4<f32>,
// %SHADER_ShaderOutput%
};
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_global_tex_size: vec2<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var _ext_uniform_global_tex_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_tex: sampler;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var normal: vec3<f32> = normalize(_i_in.normal);
var lightDir: vec3<f32> = normalize(vec3<f32>(f32(i32(2)), f32(4), f32(0.5)));
var diffuse: vec4<f32> = max(dot(normal, lightDir), f32(0)) * textureSample(_ext_uniform_global_tex_texture, _ext_uniform_global_tex, vec2(_i_in.uv));
_i_out.color = vec4<f32>(diffuse.xyz, f32(i32(1)));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`struct ShaderInput {
  vec3 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec4 clipPosition;
  vec4 realPosition;
  vec2 uv;
  vec2 screen;
  vec4 color;
  ivec3 groupId;
  ivec3 groupSize;
  ivec3 globalId;
  ivec3 localId;
  int instanceIndex;
  int vertexIndex;

};
struct ShaderOutput {
  vec4 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec2 uv;
  vec4 color;

};
uniform sampler2D _ext_uniform_global_tex;
uniform vec2 _ext_uniform_global_tex_size;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
vec3 normal = normalize(_i_in.normal);
vec3 lightDir = normalize(vec3(int(2), float(4), float(0.5)));
vec4 diffuse = max(dot(normal, lightDir), float(0)) * texture(_ext_uniform_global_tex, vec2(_i_in.uv));
_i_out.color = vec4(diffuse.xyz, int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[1922,2081,401,444],[1922,2081,444,487],[2951,2960,603,612],[0,0,613,618],[0,0,619,625],[0,0,613,625],[0,0,603,626],[0,0,589,626],[0,0,589,628],[3031,3040,644,653],[3055,3061,659,662],[0,0,663,664],[0,0,659,665],[3066,3074,667,672],[0,0,673,674],[0,0,667,675],[3081,3089,677,682],[0,0,683,686],[0,0,677,687],[0,0,654,688],[0,0,644,689],[0,0,628,689],[0,0,628,691],[3155,3158,706,709],[3159,3162,710,713],[0,0,714,720],[0,0,722,730],[0,0,710,731],[3182,3190,733,738],[0,0,739,740],[0,0,733,741],[0,0,706,742],[0,0,753,776],[0,0,783,788],[0,0,789,791],[0,0,783,791],[0,0,745,793],[0,0,706,793],[0,0,691,793],[0,0,691,795],[0,0,795,801],[0,0,802,807],[0,0,795,807],[0,0,815,822],[0,0,815,826],[3298,3304,828,831],[0,0,832,833],[0,0,828,834],[0,0,810,835],[0,0,795,835],[0,0,795,837],[569,926,487,881],[2880,3311,0,881]]);

__shadeup_gen_shader("shd_00667600000009006100070265644461005607603718", {
					webgl: {_ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"camera":{"type":"struct","name":"str_i_iistd_common_ts_10681_Camera","fields":{"position":{"type":"primitive","name":"float3"},"rotation":{"type":"primitive","name":"float4"},"width":{"type":"primitive","name":"float"},"height":{"type":"primitive","name":"float"},"fov":{"type":"primitive","name":"float"},"near":{"type":"primitive","name":"float"},"far":{"type":"primitive","name":"float"}}}}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["camera",{"type":"struct","name":"str_i_iistd_common_ts_10681_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}]]}}]]}
				}, {webgpu: `fn matrix_inversefloat4x4(m: mat4x4<f32>) -> mat4x4<f32>{
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

struct ShaderInput {
 @align(16)  position: vec3<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  clipPosition: vec4<f32>,
 @align(16)  realPosition: vec4<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  screen: vec2<f32>,
 @align(16)  color: vec4<f32>,
 @align(16)  groupId: vec3<i32>,
 @align(16)  groupSize: vec3<i32>,
 @align(16)  globalId: vec3<i32>,
 @align(16)  localId: vec3<i32>,
 @align(16)  instanceIndex: i32,
 @align(16)  vertexIndex: i32,
};
struct ShaderOutput {
 @align(16)  position: vec4<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  color: vec4<f32>,
// %SHADER_ShaderOutput%
};
struct str_i_iistd_common_ts_10681_Camera {
 @align(16)  position: vec3<f32>,
 @align(16)  rotation: vec4<f32>,
 @align(16)  width: f32,
 @align(16)  height: f32,
 @align(16)  fov: f32,
 @align(16)  near: f32,
 @align(16)  far: f32,

};
fn _make_struct_str_i_iistd_common_ts_10681_Camera(  far: f32,  fov: f32,  height: f32,  near: f32,  position: vec3<f32>,  rotation: vec4<f32>,  width: f32,) -> str_i_iistd_common_ts_10681_Camera {
var _s: str_i_iistd_common_ts_10681_Camera;
  _s.far = far;
  _s.fov = fov;
  _s.height = height;
  _s.near = near;
  _s.position = position;
  _s.rotation = rotation;
  _s.width = width;

return _s; 
}
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
//  @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
  camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  camera: str_i_iistd_common_ts_10681_Camera,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.camera = camera;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
fn fn_ii_std_common_ts_7975_quat_static_toMatrix(quaternion_const: vec4<f32>) -> mat4x4<f32> {
var quaternion = quaternion_const;
var x: f32 = quaternion.x;
var y: f32 = quaternion.y;
var z: f32 = quaternion.z;
var w: f32 = quaternion.w;
var x2: f32 = x + x;
var y2: f32 = y + y;
var z2: f32 = z + z;
var xx: f32 = x * x2;
var xy: f32 = x * y2;
var xz: f32 = x * z2;
var yy: f32 = y * y2;
var yz: f32 = y * z2;
var zz: f32 = z * z2;
var wx: f32 = w * x2;
var wy: f32 = w * y2;
var wz: f32 = w * z2;
var m: mat4x4<f32> = mat4x4<f32>(f32(1) - (yy + zz), xy + wz, xz - wy, f32(i32(0)), xy - wz, f32(1) - (xx + zz), yz + wx, f32(i32(0)), xz + wy, yz - wx, f32(1) - (xx + yy), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(1));
return m;

}

fn fn_ii_std_common_ts_47518_matrix_static_perspective(fov_const: f32, aspect_const: f32, near_const: f32, far_const: f32) -> mat4x4<f32> {
var fov = fov_const;
var aspect = aspect_const;
var near = near_const;
var far = far_const;
var fovRad: f32 = radians(fov);
var tanFov: f32 = tan(fovRad * f32(0.5));
var matrx: mat4x4<f32> = mat4x4<f32>(f32(1) / (tanFov * aspect), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(1) / tanFov, f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(0)), -(((far + near) / (far - near))), f32(-(i32(1))), f32(i32(0)), f32(i32(0)), -(((f32(i32(2)) * (near * far)) / (far - near))), f32(i32(0)));
return matrx;

}

fn fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(_this: str_i_iistd_common_ts_10681_Camera) -> mat4x4<f32> {
var shader_self_temp: str_i_iistd_common_ts_10681_Camera = _this;
var rotationMatrix: mat4x4<f32> = fn_ii_std_common_ts_7975_quat_static_toMatrix(_this.rotation);
var translationMatrix: mat4x4<f32> = mat4x4<f32>(f32(i32(1)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(1)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(0)), f32(i32(1)), f32(i32(0)), _this.position.x, _this.position.y, _this.position.z, f32(i32(1)));
return matrix_inversefloat4x4(translationMatrix * rotationMatrix);

}

fn fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(_this: str_i_iistd_common_ts_10681_Camera) -> mat4x4<f32> {
var shader_self_temp: str_i_iistd_common_ts_10681_Camera = _this;
return fn_ii_std_common_ts_47518_matrix_static_perspective(_this.fov, _this.width / _this.height, _this.near, _this.far);

}

fn fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_this: str_i_iistd_common_ts_10681_Camera) -> mat4x4<f32> {
var shader_self_temp: str_i_iistd_common_ts_10681_Camera = _this;
return fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(_this) * fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(_this);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_in_uniforms._ext_uniform_global_env.camera) * vec4<f32>(_i_in.position, f32(i32(1)));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`mat4 matrix_inversefloat4x4(mat4 m) {
	return inverse(m);
}

struct ShaderInput {
  vec3 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec4 clipPosition;
  vec4 realPosition;
  vec2 uv;
  vec2 screen;
  vec4 color;
  ivec3 groupId;
  ivec3 groupSize;
  ivec3 globalId;
  ivec3 localId;
  int instanceIndex;
  int vertexIndex;

};
struct ShaderOutput {
  vec4 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec2 uv;
  vec4 color;

};
struct str_i_iistd_common_ts_10681_Camera {
  vec3 position;
  vec4 rotation;
  float width;
  float height;
  float fov;
  float near;
  float far;

};
str_i_iistd_common_ts_10681_Camera _make_struct_str_i_iistd_common_ts_10681_Camera(vec3 position, vec4 rotation, float width, float height, float fov, float near, float far) {
str_i_iistd_common_ts_10681_Camera _s;  _s.position = position;
  _s.rotation = rotation;
  _s.width = width;
  _s.height = height;
  _s.fov = fov;
  _s.near = near;
  _s.far = far;
  return _s;
}
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
//   float time;
//   vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
  str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(str_i_iistd_common_ts_10681_Camera camera) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.camera = camera;
  return _s;
}
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
mat4 fn_ii_std_common_ts_7975_quat_static_toMatrix(vec4 quaternion) {
float x = quaternion.x;
float y = quaternion.y;
float z = quaternion.z;
float w = quaternion.w;
float x2 = x + x;
float y2 = y + y;
float z2 = z + z;
float xx = x * x2;
float xy = x * y2;
float xz = x * z2;
float yy = y * y2;
float yz = y * z2;
float zz = z * z2;
float wx = w * x2;
float wy = w * y2;
float wz = w * z2;
mat4 m = mat4(float(1) - (yy + zz), xy + wz, xz - wy, int(0), xy - wz, float(1) - (xx + zz), yz + wx, int(0), xz + wy, yz - wx, float(1) - (xx + yy), int(0), int(0), int(0), int(0), float(1));
return m;

}

mat4 fn_ii_std_common_ts_47518_matrix_static_perspective(float fov, float aspect, float near, float far) {
float fovRad = radians(fov);
float tanFov = tan(fovRad * float(0.5));
mat4 matrx = mat4(float(1) / (tanFov * aspect), int(0), int(0), int(0), int(0), float(1) / tanFov, int(0), int(0), int(0), int(0), -(((far + near) / (far - near))), -(int(1)), int(0), int(0), -(((float(int(2)) * (near * far)) / (far - near))), int(0));
return matrx;

}

mat4 fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(str_i_iistd_common_ts_10681_Camera _this) {
str_i_iistd_common_ts_10681_Camera shader_self_temp = _this;
mat4 rotationMatrix = fn_ii_std_common_ts_7975_quat_static_toMatrix(_this.rotation);
mat4 translationMatrix = mat4(int(1), int(0), int(0), int(0), int(0), int(1), int(0), int(0), int(0), int(0), int(1), int(0), _this.position.x, _this.position.y, _this.position.z, int(1));
return matrix_inversefloat4x4(translationMatrix * rotationMatrix);

}

mat4 fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(str_i_iistd_common_ts_10681_Camera _this) {
str_i_iistd_common_ts_10681_Camera shader_self_temp = _this;
return fn_ii_std_common_ts_47518_matrix_static_perspective(_this.fov, _this.width / _this.height, _this.near, _this.far);

}

mat4 fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(str_i_iistd_common_ts_10681_Camera _this) {
str_i_iistd_common_ts_10681_Camera shader_self_temp = _this;
return fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(_this) * fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(_this);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_ext_uniform_global_env.camera) * vec4(_i_in.position, int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[14920,14947,445,462],[14949,14976,462,479],[14978,15001,479,494],[15003,15027,494,510],[15029,15050,510,523],[15052,15074,523,537],[15076,15097,537,550],[10681,15372,401,554],[10681,15372,554,927],[493,510,975,997],[577,589,997,1014],[623,642,1014,1036],[674,685,1036,1052],[745,792,1052,1107],[842,898,1107,1168],[972,1002,1168,1213],[1007,1043,1213,1264],[387,1715,927,1268],[387,1715,1268,1483],[16316,16333,1483,1555],[0,0,1606,1621],[0,0,1635,1645],[0,0,1635,1647],[0,0,1625,1647],[0,0,1625,1649],[0,0,1659,1669],[0,0,1659,1671],[0,0,1649,1671],[0,0,1649,1673],[0,0,1683,1693],[0,0,1683,1695],[0,0,1673,1695],[0,0,1673,1697],[0,0,1707,1717],[0,0,1707,1719],[0,0,1697,1719],[0,0,1697,1721],[0,0,1732,1733],[0,0,1736,1737],[0,0,1732,1737],[0,0,1721,1737],[0,0,1721,1739],[0,0,1750,1751],[0,0,1754,1755],[0,0,1750,1755],[0,0,1739,1755],[0,0,1739,1757],[0,0,1768,1769],[0,0,1772,1773],[0,0,1768,1773],[0,0,1757,1773],[0,0,1757,1775],[0,0,1786,1787],[0,0,1790,1792],[0,0,1786,1792],[0,0,1775,1792],[0,0,1775,1794],[0,0,1805,1806],[0,0,1809,1811],[0,0,1805,1811],[0,0,1794,1811],[0,0,1794,1813],[0,0,1824,1825],[0,0,1828,1830],[0,0,1824,1830],[0,0,1813,1830],[0,0,1813,1832],[0,0,1843,1844],[0,0,1847,1849],[0,0,1843,1849],[0,0,1832,1849],[0,0,1832,1851],[0,0,1862,1863],[0,0,1866,1868],[0,0,1862,1868],[0,0,1851,1868],[0,0,1851,1870],[0,0,1881,1882],[0,0,1885,1887],[0,0,1881,1887],[0,0,1870,1887],[0,0,1870,1889],[0,0,1900,1901],[0,0,1904,1906],[0,0,1900,1906],[0,0,1889,1906],[0,0,1889,1908],[0,0,1919,1920],[0,0,1923,1925],[0,0,1919,1925],[0,0,1908,1925],[0,0,1908,1927],[0,0,1938,1939],[0,0,1942,1944],[0,0,1938,1944],[0,0,1927,1944],[0,0,1927,1946],[8499,8507,1960,1965],[0,0,1966,1967],[0,0,1960,1968],[0,0,1972,1974],[0,0,1977,1979],[0,0,1972,1979],[0,0,1971,1980],[0,0,1960,1980],[0,0,1982,1984],[0,0,1987,1989],[0,0,1982,1989],[0,0,1991,1993],[0,0,1996,1998],[0,0,1991,1998],[8572,8578,2000,2003],[0,0,2004,2005],[0,0,2000,2006],[0,0,2008,2010],[0,0,2013,2015],[0,0,2008,2015],[8609,8617,2017,2022],[0,0,2023,2024],[0,0,2017,2025],[0,0,2029,2031],[0,0,2034,2036],[0,0,2029,2036],[0,0,2028,2037],[0,0,2017,2037],[0,0,2039,2041],[0,0,2044,2046],[0,0,2039,2046],[8664,8670,2048,2051],[0,0,2052,2053],[0,0,2048,2054],[0,0,2056,2058],[0,0,2061,2063],[0,0,2056,2063],[0,0,2065,2067],[0,0,2070,2072],[0,0,2065,2072],[8719,8727,2074,2079],[0,0,2080,2081],[0,0,2074,2082],[0,0,2086,2088],[0,0,2091,2093],[0,0,2086,2093],[0,0,2085,2094],[0,0,2074,2094],[8756,8762,2096,2099],[0,0,2100,2101],[0,0,2096,2102],[8767,8773,2104,2107],[0,0,2108,2109],[0,0,2104,2110],[8778,8784,2112,2115],[0,0,2116,2117],[0,0,2112,2118],[8789,8795,2120,2123],[0,0,2124,2125],[0,0,2120,2126],[8800,8808,2128,2133],[0,0,2134,2135],[0,0,2128,2136],[0,0,1955,2137],[0,0,1946,2137],[0,0,1946,2139],[0,0,2146,2147],[0,0,2139,2149],[682,696,1555,2153],[0,0,2210,2219],[0,0,2221,2233],[0,0,2235,2245],[0,0,2247,2256],[48073,48080,2275,2282],[0,0,2283,2286],[0,0,2275,2287],[0,0,2260,2287],[0,0,2260,2289],[48100,48103,2304,2307],[0,0,2308,2314],[48120,48128,2317,2322],[0,0,2323,2326],[0,0,2317,2327],[0,0,2308,2327],[0,0,2304,2328],[0,0,2289,2328],[0,0,2289,2330],[48170,48178,2348,2353],[0,0,2354,2355],[0,0,2348,2356],[0,0,2360,2366],[0,0,2369,2375],[0,0,2360,2375],[0,0,2359,2376],[0,0,2348,2376],[48215,48221,2378,2381],[0,0,2382,2383],[0,0,2378,2384],[48226,48232,2386,2389],[0,0,2390,2391],[0,0,2386,2392],[48237,48243,2394,2397],[0,0,2398,2399],[0,0,2394,2400],[48248,48254,2402,2405],[0,0,2406,2407],[0,0,2402,2408],[48267,48275,2410,2415],[0,0,2416,2417],[0,0,2410,2418],[0,0,2421,2427],[0,0,2410,2427],[48292,48298,2429,2432],[0,0,2433,2434],[0,0,2429,2435],[48303,48309,2437,2440],[0,0,2441,2442],[0,0,2437,2443],[48314,48320,2445,2448],[0,0,2449,2450],[0,0,2445,2451],[48325,48331,2453,2456],[0,0,2457,2458],[0,0,2453,2459],[0,0,2465,2468],[0,0,2471,2475],[0,0,2465,2475],[0,0,2464,2476],[0,0,2480,2483],[0,0,2486,2490],[0,0,2480,2490],[0,0,2479,2491],[0,0,2464,2491],[0,0,2463,2492],[0,0,2461,2493],[48415,48421,2497,2500],[0,0,2501,2502],[0,0,2497,2503],[0,0,2495,2504],[48427,48433,2506,2509],[0,0,2510,2511],[0,0,2506,2512],[48438,48444,2514,2517],[0,0,2518,2519],[0,0,2514,2520],[48477,48483,2532,2535],[0,0,2536,2537],[0,0,2532,2538],[0,0,2526,2539],[0,0,2543,2547],[0,0,2550,2553],[0,0,2543,2553],[0,0,2542,2554],[0,0,2526,2554],[0,0,2525,2555],[0,0,2559,2562],[0,0,2565,2569],[0,0,2559,2569],[0,0,2558,2570],[0,0,2525,2570],[0,0,2524,2571],[0,0,2522,2572],[48541,48547,2574,2577],[0,0,2578,2579],[0,0,2574,2580],[0,0,2343,2581],[0,0,2330,2581],[0,0,2330,2583],[0,0,2590,2595],[0,0,2583,2597],[33022,33038,2153,2601],[0,0,2765,2770],[0,0,2711,2770],[0,0,2711,2772],[12885,12898,2794,2839],[0,0,2840,2845],[0,0,2846,2854],[0,0,2840,2854],[0,0,2794,2855],[0,0,2772,2855],[0,0,2772,2857],[12951,12957,2887,2890],[0,0,2891,2892],[0,0,2887,2893],[12962,12968,2895,2898],[0,0,2899,2900],[0,0,2895,2901],[12973,12979,2903,2906],[0,0,2907,2908],[0,0,2903,2909],[12984,12990,2911,2914],[0,0,2915,2916],[0,0,2911,2917],[12995,13001,2919,2922],[0,0,2923,2924],[0,0,2919,2925],[13006,13012,2927,2930],[0,0,2931,2932],[0,0,2927,2933],[13017,13023,2935,2938],[0,0,2939,2940],[0,0,2935,2941],[13028,13034,2943,2946],[0,0,2947,2948],[0,0,2943,2949],[13039,13045,2951,2954],[0,0,2955,2956],[0,0,2951,2957],[13050,13056,2959,2962],[0,0,2963,2964],[0,0,2959,2965],[13061,13067,2967,2970],[0,0,2971,2972],[0,0,2967,2973],[13072,13078,2975,2978],[0,0,2979,2980],[0,0,2975,2981],[0,0,2983,2988],[0,0,2989,2997],[0,0,2983,2997],[0,0,2983,2999],[0,0,3001,3006],[0,0,3007,3015],[0,0,3001,3015],[0,0,3001,3017],[0,0,3019,3024],[0,0,3025,3033],[0,0,3019,3033],[0,0,3019,3035],[13179,13185,3037,3040],[0,0,3041,3042],[0,0,3037,3043],[0,0,2882,3044],[0,0,2857,3044],[0,0,2857,3046],[13198,13205,3053,3075],[0,0,3076,3093],[0,0,3096,3110],[0,0,3076,3110],[0,0,3053,3111],[0,0,3046,3113],[8125,8367,2601,3117],[0,0,3281,3286],[0,0,3227,3286],[0,0,3227,3288],[13462,13480,3295,3346],[0,0,3347,3352],[0,0,3353,3356],[0,0,3347,3356],[0,0,3358,3363],[0,0,3364,3369],[0,0,3358,3369],[0,0,3372,3377],[0,0,3378,3384],[0,0,3372,3384],[0,0,3358,3384],[0,0,3386,3391],[0,0,3392,3396],[0,0,3386,3396],[0,0,3398,3403],[0,0,3404,3407],[0,0,3398,3407],[0,0,3295,3408],[0,0,3288,3410],[8125,8367,3117,3414],[0,0,3575,3580],[0,0,3521,3580],[0,0,3521,3582],[12612,12637,3589,3649],[0,0,3650,3655],[0,0,3589,3656],[12641,12666,3659,3719],[0,0,3720,3725],[0,0,3659,3726],[0,0,3589,3726],[0,0,3582,3728],[9276,9402,3414,3732],[0,0,3834,3840],[0,0,3841,3849],[0,0,3834,3849],[2702,2730,3852,3909],[0,0,3910,3933],[0,0,3934,3940],[0,0,3910,3940],[0,0,3852,3941],[0,0,3949,3954],[0,0,3955,3963],[0,0,3949,3963],[2763,2769,3965,3968],[0,0,3969,3970],[0,0,3965,3971],[0,0,3944,3972],[0,0,3852,3972],[0,0,3834,3972],[0,0,3834,3974],[466,564,3732,4018],[2659,2778,0,4018]]);

__shadeup_gen_shader("shd_1701801860004512470030001480000000600500422857", {
					webgl: {},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[]}
				}, {webgpu: `fn shadeup_up_swizzle_xxxx_i32(n: i32) -> vec4<i32>{
	return vec4<i32>(n, n, n, n);
}

struct ShaderInput {
 @align(16)  position: vec3<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  clipPosition: vec4<f32>,
 @align(16)  realPosition: vec4<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  screen: vec2<f32>,
 @align(16)  color: vec4<f32>,
 @align(16)  groupId: vec3<i32>,
 @align(16)  groupSize: vec3<i32>,
 @align(16)  globalId: vec3<i32>,
 @align(16)  localId: vec3<i32>,
 @align(16)  instanceIndex: i32,
 @align(16)  vertexIndex: i32,
};
struct ShaderOutput {
 @align(16)  position: vec4<f32>,
 @align(16)  normal: vec3<f32>,
 @align(16)  tangent: vec3<f32>,
 @align(16)  bitangent: vec3<f32>,
 @align(16)  uv: vec2<f32>,
 @align(16)  color: vec4<f32>,
// %SHADER_ShaderOutput%
};
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
dummy: vec4<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.color = vec4f(shadeup_up_swizzle_xxxx_i32(i32(1)));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`ivec4 shadeup_up_swizzle_xxxx_int(int n) {
	return ivec4(n, n, n, n);
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

struct ShaderInput {
  vec3 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec4 clipPosition;
  vec4 realPosition;
  vec2 uv;
  vec2 screen;
  vec4 color;
  ivec3 groupId;
  ivec3 groupSize;
  ivec3 globalId;
  ivec3 localId;
  int instanceIndex;
  int vertexIndex;

};
struct ShaderOutput {
  vec4 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;
  vec2 uv;
  vec4 color;

};

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.color = vec4(shadeup_up_swizzle_xxxx_int(int(1)));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[0,0,503,509],[0,0,510,515],[0,0,503,515],[2234,2240,551,554],[0,0,555,556],[0,0,551,557],[0,0,523,558],[0,0,503,559],[0,0,503,561],[166,199,401,605],[2191,2255,0,605]]);

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "/std_math", "/std_math", "/std___std_all", "/_std/drawIndexed", "/_std/common", "/_std/mesh"], function (require, exports, __, std_math_1, std___std_all_1, drawIndexed_1, common_1, mesh_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = exports.setModel = exports.setTexture = void 0;
    __ = __importStar(__);
    var globalVarGet = std___std_all_1.globalVarGet;
    // with a size of 100 units (100.xyz)
    var cube = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "cube", function () { var _a, _b; return mesh_1.mesh.box((_a = (0 | 0), [_a, _a, _a]), (_b = (100 | 0), [_b, _b, _b])); }, function () { return cube; });
    var tex = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "tex", function () { var _a; return (0, common_1.texture2d)((_a = (10 | 0), [_a, _a]), "auto", "float4"); }, function () { return tex; });
    tex.draw(__shadeup_make_shader_inst("shd_1701801860004512470030001480000000600500422857", {}, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            __out.color = (_a = (1 | 0), [_a, _a, _a, _a]);
            return [2 /*return*/];
        });
    }); }));
    function setTexture(newTex) {
        tex = newTex;
    }
    exports.setTexture = setTexture;
    ;
    function setModel(newModel) {
        cube = newModel.parts[(0 | 0)].mesh.scale((20 | 0));
        tex = newModel.parts[(0 | 0)].material.color;
    }
    exports.setModel = setModel;
    ;
    function main() {
        var _this = this;
        common_1.ui.button("Hello, world!");
        (0, drawIndexed_1.draw)(cube, __shadeup_make_shader_inst("shd_00667600000009006100070265644461005607603718", { _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                __out.position = __.mul(env.camera.getCombinedMatrix(), __.makeVector(__in.position, (1 | 0)));
                return [2 /*return*/];
            });
        }); }), __shadeup_make_shader_inst("shd_000710086052666091061257200756375023002800009", { _ext_uniform_global_tex: globalVarGet("_slash_main_dot_ts", "tex") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var normal, lightDir, diffuse;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                normal = (0, std_math_1.normalize)(__in.normal);
                lightDir = (0, std_math_1.normalize)(__.makeVector((2 | 0), 4.0, 0.5));
                diffuse = (_a = (0, std_math_1.max)((0, std_math_1.dot)(normal, lightDir), 0.0), _b = tex.sample(__in.uv), [_a * _b[0], _a * _b[1], _a * _b[2], _a * _b[3]]);
                // Output the color
                __out.color = __.makeVector((_c = diffuse, [_c[0], _c[1], _c[2]]), (1 | 0));
                return [2 /*return*/];
            });
        }); }));
    }
    exports.main = main;
});

})(define);

});