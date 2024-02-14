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
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[1922,2081,401,444],[1922,2081,444,487],[3054,3063,603,612],[0,0,613,618],[0,0,619,625],[0,0,613,625],[0,0,603,626],[0,0,589,626],[0,0,589,628],[3134,3143,644,653],[3158,3164,659,662],[0,0,663,664],[0,0,659,665],[3169,3177,667,672],[0,0,673,674],[0,0,667,675],[3184,3192,677,682],[0,0,683,686],[0,0,677,687],[0,0,654,688],[0,0,644,689],[0,0,628,689],[0,0,628,691],[3258,3261,706,709],[3262,3265,710,713],[0,0,714,720],[0,0,722,730],[0,0,710,731],[3285,3293,733,738],[0,0,739,740],[0,0,733,741],[0,0,706,742],[0,0,753,776],[0,0,783,788],[0,0,789,791],[0,0,783,791],[0,0,745,793],[0,0,706,793],[0,0,691,793],[0,0,691,795],[0,0,795,801],[0,0,802,807],[0,0,795,807],[0,0,815,822],[0,0,815,826],[3401,3407,828,831],[0,0,832,833],[0,0,828,834],[0,0,810,835],[0,0,795,835],[0,0,795,837],[628,985,487,881],[2983,3414,0,881]]);

__shadeup_gen_shader("shd_0012035060108500265800533466056020000547600000", {
					webgl: {_ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"},"camera":{"type":"struct","name":"str_i_iistd_common_ts_10681_Camera","fields":{"position":{"type":"primitive","name":"float3"},"rotation":{"type":"primitive","name":"float4"},"width":{"type":"primitive","name":"float"},"height":{"type":"primitive","name":"float"},"fov":{"type":"primitive","name":"float"},"near":{"type":"primitive","name":"float"},"far":{"type":"primitive","name":"float"}}}}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}],["camera",{"type":"struct","name":"str_i_iistd_common_ts_10681_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}]]}}]]}
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
 @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
  camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  camera: str_i_iistd_common_ts_10681_Camera,  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.camera = camera;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
fn fn_ii_std_common_ts_3330_quat_static_conjugate(quaternion_const: vec4<f32>) -> vec4<f32> {
var quaternion = quaternion_const;
return vec4<f32>(-(quaternion.xyz), quaternion.w);

}

fn fn_ii_std_common_ts_2513_quat_static_mul(a_const: vec4<f32>, b_const: vec4<f32>) -> vec4<f32> {
var a = a_const;
var b = b_const;
return vec4<f32>(b.xyz * a.w + a.xyz * b.w + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));

}

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

fn fn_ii_std_common_ts_8827_quat_static_fromEulerAngles(angles_const: vec3<f32>) -> vec4<f32> {
var angles = angles_const;
var cr: f32 = cos(angles.x * f32(0.5));
var sr: f32 = sin(angles.x * f32(0.5));
var cp: f32 = cos(angles.y * f32(0.5));
var sp: f32 = sin(angles.y * f32(0.5));
var cy: f32 = cos(angles.z * f32(0.5));
var sy: f32 = sin(angles.z * f32(0.5));
return vec4<f32>(sr * cp * cy - cr * sp * sy, cr * sp * cy + sr * cp * sy, cr * cp * sy - sr * sp * cy, cr * cp * cy + sr * sp * sy);

}

fn fn_ii_std_common_ts_2939_quat_static_rotate(quaternion_const: vec4<f32>, vector_const: vec3<f32>) -> vec3<f32> {
var quaternion = quaternion_const;
var vector = vector_const;
var q: vec4<f32> = fn_ii_std_common_ts_2513_quat_static_mul(fn_ii_std_common_ts_2513_quat_static_mul(quaternion, vec4<f32>(vector, f32(i32(0)))), fn_ii_std_common_ts_3330_quat_static_conjugate(quaternion));
return q.xyz;

}

fn fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_this: str_i_iistd_common_ts_10681_Camera) -> mat4x4<f32> {
var shader_self_temp: str_i_iistd_common_ts_10681_Camera = _this;
return fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(_this) * fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(_this);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_in_uniforms._ext_uniform_global_env.camera) * vec4<f32>(fn_ii_std_common_ts_2939_quat_static_rotate(fn_ii_std_common_ts_8827_quat_static_fromEulerAngles(vec3<f32>(f32(i32(0)), _in_uniforms._ext_uniform_global_env.time, f32(i32(0)))), _i_in.position), f32(i32(1)));

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
  float time;
//   vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
  str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time, str_i_iistd_common_ts_10681_Camera camera) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  _s.camera = camera;
  return _s;
}
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
vec4 fn_ii_std_common_ts_3330_quat_static_conjugate(vec4 quaternion) {
return vec4(-(quaternion.xyz), quaternion.w);

}

vec4 fn_ii_std_common_ts_2513_quat_static_mul(vec4 a, vec4 b) {
return vec4(b.xyz * a.w + a.xyz * b.w + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));

}

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

vec4 fn_ii_std_common_ts_8827_quat_static_fromEulerAngles(vec3 angles) {
float cr = cos(angles.x * float(0.5));
float sr = sin(angles.x * float(0.5));
float cp = cos(angles.y * float(0.5));
float sp = sin(angles.y * float(0.5));
float cy = cos(angles.z * float(0.5));
float sy = sin(angles.z * float(0.5));
return vec4(sr * cp * cy - cr * sp * sy, cr * sp * cy + sr * cp * sy, cr * cp * sy - sr * sp * cy, cr * cp * cy + sr * sp * sy);

}

vec3 fn_ii_std_common_ts_2939_quat_static_rotate(vec4 quaternion, vec3 vector) {
vec4 q = fn_ii_std_common_ts_2513_quat_static_mul(fn_ii_std_common_ts_2513_quat_static_mul(quaternion, vec4(vector, int(0))), fn_ii_std_common_ts_3330_quat_static_conjugate(quaternion));
return q.xyz;

}

mat4 fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(str_i_iistd_common_ts_10681_Camera _this) {
str_i_iistd_common_ts_10681_Camera shader_self_temp = _this;
return fn_ii_std_common_ts_13404_Camera_static_getPerspectiveMatrix(_this) * fn_ii_std_common_ts_12813_Camera_static_getWorldToViewMatrix(_this);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = fn_ii_std_common_ts_12549_Camera_static_getCombinedMatrix(_ext_uniform_global_env.camera) * vec4(fn_ii_std_common_ts_2939_quat_static_rotate(fn_ii_std_common_ts_8827_quat_static_fromEulerAngles(vec3(int(0), _ext_uniform_global_env.time, int(0))), _i_in.position), int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[14920,14947,445,462],[14949,14976,462,479],[14978,15001,479,494],[15003,15027,494,510],[15029,15050,510,523],[15052,15074,523,537],[15076,15097,537,550],[10681,15372,401,554],[10681,15372,554,927],[493,510,975,997],[577,589,997,1011],[623,642,1011,1033],[674,685,1033,1049],[745,792,1049,1104],[842,898,1104,1165],[972,1002,1165,1210],[1007,1043,1210,1261],[387,1715,927,1265],[387,1715,1265,1510],[16316,16333,1510,1582],[0,0,1634,1649],[0,0,1667,1677],[0,0,1667,1681],[0,0,1665,1682],[0,0,1684,1694],[0,0,1684,1696],[0,0,1660,1697],[0,0,1653,1699],[682,696,1582,1703],[0,0,1749,1755],[0,0,1757,1763],[0,0,1779,1780],[0,0,1779,1784],[0,0,1787,1788],[0,0,1787,1790],[0,0,1779,1790],[0,0,1793,1794],[0,0,1793,1798],[0,0,1801,1802],[0,0,1801,1804],[0,0,1793,1804],[0,0,1779,1804],[0,0,1807,1812],[0,0,1813,1814],[0,0,1813,1818],[0,0,1820,1821],[0,0,1820,1825],[0,0,1807,1826],[0,0,1779,1826],[0,0,1828,1829],[0,0,1828,1831],[0,0,1834,1835],[0,0,1834,1837],[0,0,1828,1837],[2802,2805,1840,1843],[0,0,1844,1845],[0,0,1844,1849],[0,0,1851,1852],[0,0,1851,1856],[0,0,1840,1857],[0,0,1828,1857],[0,0,1774,1858],[0,0,1767,1860],[682,696,1703,1864],[0,0,1915,1930],[0,0,1944,1954],[0,0,1944,1956],[0,0,1934,1956],[0,0,1934,1958],[0,0,1968,1978],[0,0,1968,1980],[0,0,1958,1980],[0,0,1958,1982],[0,0,1992,2002],[0,0,1992,2004],[0,0,1982,2004],[0,0,1982,2006],[0,0,2016,2026],[0,0,2016,2028],[0,0,2006,2028],[0,0,2006,2030],[0,0,2041,2042],[0,0,2045,2046],[0,0,2041,2046],[0,0,2030,2046],[0,0,2030,2048],[0,0,2059,2060],[0,0,2063,2064],[0,0,2059,2064],[0,0,2048,2064],[0,0,2048,2066],[0,0,2077,2078],[0,0,2081,2082],[0,0,2077,2082],[0,0,2066,2082],[0,0,2066,2084],[0,0,2095,2096],[0,0,2099,2101],[0,0,2095,2101],[0,0,2084,2101],[0,0,2084,2103],[0,0,2114,2115],[0,0,2118,2120],[0,0,2114,2120],[0,0,2103,2120],[0,0,2103,2122],[0,0,2133,2134],[0,0,2137,2139],[0,0,2133,2139],[0,0,2122,2139],[0,0,2122,2141],[0,0,2152,2153],[0,0,2156,2158],[0,0,2152,2158],[0,0,2141,2158],[0,0,2141,2160],[0,0,2171,2172],[0,0,2175,2177],[0,0,2171,2177],[0,0,2160,2177],[0,0,2160,2179],[0,0,2190,2191],[0,0,2194,2196],[0,0,2190,2196],[0,0,2179,2196],[0,0,2179,2198],[0,0,2209,2210],[0,0,2213,2215],[0,0,2209,2215],[0,0,2198,2215],[0,0,2198,2217],[0,0,2228,2229],[0,0,2232,2234],[0,0,2228,2234],[0,0,2217,2234],[0,0,2217,2236],[0,0,2247,2248],[0,0,2251,2253],[0,0,2247,2253],[0,0,2236,2253],[0,0,2236,2255],[8499,8507,2269,2274],[0,0,2275,2276],[0,0,2269,2277],[0,0,2281,2283],[0,0,2286,2288],[0,0,2281,2288],[0,0,2280,2289],[0,0,2269,2289],[0,0,2291,2293],[0,0,2296,2298],[0,0,2291,2298],[0,0,2300,2302],[0,0,2305,2307],[0,0,2300,2307],[8572,8578,2309,2312],[0,0,2313,2314],[0,0,2309,2315],[0,0,2317,2319],[0,0,2322,2324],[0,0,2317,2324],[8609,8617,2326,2331],[0,0,2332,2333],[0,0,2326,2334],[0,0,2338,2340],[0,0,2343,2345],[0,0,2338,2345],[0,0,2337,2346],[0,0,2326,2346],[0,0,2348,2350],[0,0,2353,2355],[0,0,2348,2355],[8664,8670,2357,2360],[0,0,2361,2362],[0,0,2357,2363],[0,0,2365,2367],[0,0,2370,2372],[0,0,2365,2372],[0,0,2374,2376],[0,0,2379,2381],[0,0,2374,2381],[8719,8727,2383,2388],[0,0,2389,2390],[0,0,2383,2391],[0,0,2395,2397],[0,0,2400,2402],[0,0,2395,2402],[0,0,2394,2403],[0,0,2383,2403],[8756,8762,2405,2408],[0,0,2409,2410],[0,0,2405,2411],[8767,8773,2413,2416],[0,0,2417,2418],[0,0,2413,2419],[8778,8784,2421,2424],[0,0,2425,2426],[0,0,2421,2427],[8789,8795,2429,2432],[0,0,2433,2434],[0,0,2429,2435],[8800,8808,2437,2442],[0,0,2443,2444],[0,0,2437,2445],[0,0,2264,2446],[0,0,2255,2446],[0,0,2255,2448],[0,0,2455,2456],[0,0,2448,2458],[682,696,1864,2462],[0,0,2519,2528],[0,0,2530,2542],[0,0,2544,2554],[0,0,2556,2565],[48073,48080,2584,2591],[0,0,2592,2595],[0,0,2584,2596],[0,0,2569,2596],[0,0,2569,2598],[48100,48103,2613,2616],[0,0,2617,2623],[48120,48128,2626,2631],[0,0,2632,2635],[0,0,2626,2636],[0,0,2617,2636],[0,0,2613,2637],[0,0,2598,2637],[0,0,2598,2639],[48170,48178,2657,2662],[0,0,2663,2664],[0,0,2657,2665],[0,0,2669,2675],[0,0,2678,2684],[0,0,2669,2684],[0,0,2668,2685],[0,0,2657,2685],[48215,48221,2687,2690],[0,0,2691,2692],[0,0,2687,2693],[48226,48232,2695,2698],[0,0,2699,2700],[0,0,2695,2701],[48237,48243,2703,2706],[0,0,2707,2708],[0,0,2703,2709],[48248,48254,2711,2714],[0,0,2715,2716],[0,0,2711,2717],[48267,48275,2719,2724],[0,0,2725,2726],[0,0,2719,2727],[0,0,2730,2736],[0,0,2719,2736],[48292,48298,2738,2741],[0,0,2742,2743],[0,0,2738,2744],[48303,48309,2746,2749],[0,0,2750,2751],[0,0,2746,2752],[48314,48320,2754,2757],[0,0,2758,2759],[0,0,2754,2760],[48325,48331,2762,2765],[0,0,2766,2767],[0,0,2762,2768],[0,0,2774,2777],[0,0,2780,2784],[0,0,2774,2784],[0,0,2773,2785],[0,0,2789,2792],[0,0,2795,2799],[0,0,2789,2799],[0,0,2788,2800],[0,0,2773,2800],[0,0,2772,2801],[0,0,2770,2802],[48415,48421,2806,2809],[0,0,2810,2811],[0,0,2806,2812],[0,0,2804,2813],[48427,48433,2815,2818],[0,0,2819,2820],[0,0,2815,2821],[48438,48444,2823,2826],[0,0,2827,2828],[0,0,2823,2829],[48477,48483,2841,2844],[0,0,2845,2846],[0,0,2841,2847],[0,0,2835,2848],[0,0,2852,2856],[0,0,2859,2862],[0,0,2852,2862],[0,0,2851,2863],[0,0,2835,2863],[0,0,2834,2864],[0,0,2868,2871],[0,0,2874,2878],[0,0,2868,2878],[0,0,2867,2879],[0,0,2834,2879],[0,0,2833,2880],[0,0,2831,2881],[48541,48547,2883,2886],[0,0,2887,2888],[0,0,2883,2889],[0,0,2652,2890],[0,0,2639,2890],[0,0,2639,2892],[0,0,2899,2904],[0,0,2892,2906],[33022,33038,2462,2910],[0,0,3074,3079],[0,0,3020,3079],[0,0,3020,3081],[12885,12898,3103,3148],[0,0,3149,3154],[0,0,3155,3163],[0,0,3149,3163],[0,0,3103,3164],[0,0,3081,3164],[0,0,3081,3166],[12951,12957,3196,3199],[0,0,3200,3201],[0,0,3196,3202],[12962,12968,3204,3207],[0,0,3208,3209],[0,0,3204,3210],[12973,12979,3212,3215],[0,0,3216,3217],[0,0,3212,3218],[12984,12990,3220,3223],[0,0,3224,3225],[0,0,3220,3226],[12995,13001,3228,3231],[0,0,3232,3233],[0,0,3228,3234],[13006,13012,3236,3239],[0,0,3240,3241],[0,0,3236,3242],[13017,13023,3244,3247],[0,0,3248,3249],[0,0,3244,3250],[13028,13034,3252,3255],[0,0,3256,3257],[0,0,3252,3258],[13039,13045,3260,3263],[0,0,3264,3265],[0,0,3260,3266],[13050,13056,3268,3271],[0,0,3272,3273],[0,0,3268,3274],[13061,13067,3276,3279],[0,0,3280,3281],[0,0,3276,3282],[13072,13078,3284,3287],[0,0,3288,3289],[0,0,3284,3290],[0,0,3292,3297],[0,0,3298,3306],[0,0,3292,3306],[0,0,3292,3308],[0,0,3310,3315],[0,0,3316,3324],[0,0,3310,3324],[0,0,3310,3326],[0,0,3328,3333],[0,0,3334,3342],[0,0,3328,3342],[0,0,3328,3344],[13179,13185,3346,3349],[0,0,3350,3351],[0,0,3346,3352],[0,0,3191,3353],[0,0,3166,3353],[0,0,3166,3355],[13198,13205,3362,3384],[0,0,3385,3402],[0,0,3405,3419],[0,0,3385,3419],[0,0,3362,3420],[0,0,3355,3422],[8125,8367,2910,3426],[0,0,3590,3595],[0,0,3536,3595],[0,0,3536,3597],[13462,13480,3604,3655],[0,0,3656,3661],[0,0,3662,3665],[0,0,3656,3665],[0,0,3667,3672],[0,0,3673,3678],[0,0,3667,3678],[0,0,3681,3686],[0,0,3687,3693],[0,0,3681,3693],[0,0,3667,3693],[0,0,3695,3700],[0,0,3701,3705],[0,0,3695,3705],[0,0,3707,3712],[0,0,3713,3716],[0,0,3707,3716],[0,0,3604,3717],[0,0,3597,3719],[8125,8367,3426,3723],[0,0,3781,3792],[8878,8881,3807,3810],[0,0,3811,3817],[0,0,3811,3819],[8915,8923,3822,3827],[0,0,3828,3831],[0,0,3822,3832],[0,0,3811,3832],[0,0,3807,3833],[0,0,3796,3833],[0,0,3796,3835],[8942,8945,3846,3849],[0,0,3850,3856],[0,0,3850,3858],[8979,8987,3861,3866],[0,0,3867,3870],[0,0,3861,3871],[0,0,3850,3871],[0,0,3846,3872],[0,0,3835,3872],[0,0,3835,3874],[9006,9009,3885,3888],[0,0,3889,3895],[0,0,3889,3897],[9043,9051,3900,3905],[0,0,3906,3909],[0,0,3900,3910],[0,0,3889,3910],[0,0,3885,3911],[0,0,3874,3911],[0,0,3874,3913],[9070,9073,3924,3927],[0,0,3928,3934],[0,0,3928,3936],[9107,9115,3939,3944],[0,0,3945,3948],[0,0,3939,3949],[0,0,3928,3949],[0,0,3924,3950],[0,0,3913,3950],[0,0,3913,3952],[9134,9137,3963,3966],[0,0,3967,3973],[0,0,3967,3975],[9171,9179,3978,3983],[0,0,3984,3987],[0,0,3978,3988],[0,0,3967,3988],[0,0,3963,3989],[0,0,3952,3989],[0,0,3952,3991],[9198,9201,4002,4005],[0,0,4006,4012],[0,0,4006,4014],[9235,9243,4017,4022],[0,0,4023,4026],[0,0,4017,4027],[0,0,4006,4027],[0,0,4002,4028],[0,0,3991,4028],[0,0,3991,4030],[0,0,4042,4044],[0,0,4047,4049],[0,0,4042,4049],[0,0,4052,4054],[0,0,4042,4054],[0,0,4057,4059],[0,0,4062,4064],[0,0,4057,4064],[0,0,4067,4069],[0,0,4057,4069],[0,0,4042,4069],[0,0,4071,4073],[0,0,4076,4078],[0,0,4071,4078],[0,0,4081,4083],[0,0,4071,4083],[0,0,4086,4088],[0,0,4091,4093],[0,0,4086,4093],[0,0,4096,4098],[0,0,4086,4098],[0,0,4071,4098],[0,0,4100,4102],[0,0,4105,4107],[0,0,4100,4107],[0,0,4110,4112],[0,0,4100,4112],[0,0,4115,4117],[0,0,4120,4122],[0,0,4115,4122],[0,0,4125,4127],[0,0,4115,4127],[0,0,4100,4127],[0,0,4129,4131],[0,0,4134,4136],[0,0,4129,4136],[0,0,4139,4141],[0,0,4129,4141],[0,0,4144,4146],[0,0,4149,4151],[0,0,4144,4151],[0,0,4154,4156],[0,0,4144,4156],[0,0,4129,4156],[0,0,4037,4157],[0,0,4030,4159],[682,696,3723,4163],[0,0,4212,4227],[0,0,4229,4240],[3003,3011,4253,4293],[3012,3020,4294,4334],[0,0,4335,4345],[0,0,4352,4358],[3051,3057,4360,4363],[0,0,4364,4365],[0,0,4360,4366],[0,0,4347,4367],[0,0,4294,4368],[3064,3078,4370,4416],[0,0,4417,4427],[0,0,4370,4428],[0,0,4253,4429],[0,0,4244,4429],[0,0,4244,4431],[0,0,4438,4439],[0,0,4438,4443],[0,0,4431,4445],[682,696,4163,4449],[0,0,4610,4615],[0,0,4556,4615],[0,0,4556,4617],[12612,12637,4624,4684],[0,0,4685,4690],[0,0,4624,4691],[12641,12666,4694,4754],[0,0,4755,4760],[0,0,4694,4761],[0,0,4624,4761],[0,0,4617,4763],[9276,9402,4449,4767],[0,0,4869,4875],[0,0,4876,4884],[0,0,4869,4884],[2723,2751,4887,4944],[0,0,4945,4968],[0,0,4969,4975],[0,0,4945,4975],[0,0,4887,4976],[2769,2780,4984,5027],[2781,2801,5028,5080],[2816,2822,5086,5089],[0,0,5090,5091],[0,0,5086,5092],[0,0,5094,5117],[0,0,5118,5122],[0,0,5094,5122],[2837,2843,5124,5127],[0,0,5128,5129],[0,0,5124,5130],[0,0,5081,5131],[0,0,5028,5132],[0,0,5134,5139],[0,0,5140,5148],[0,0,5134,5148],[0,0,4984,5149],[2866,2872,5151,5154],[0,0,5155,5156],[0,0,5151,5157],[0,0,4979,5158],[0,0,4887,5158],[0,0,4869,5158],[0,0,4869,5160],[470,623,4767,5204],[2680,2881,0,5204]]);

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
        var _a;
        cube = newModel.parts[(0 | 0)].mesh.scale((_a = (20 | 0), [_a, _a, _a]));
        tex = newModel.parts[(0 | 0)].material.color;
    }
    exports.setModel = setModel;
    ;
    function main() {
        var _this = this;
        common_1.ui.button("Hello, world!");
        (0, drawIndexed_1.draw)(cube, __shadeup_make_shader_inst("shd_0012035060108500265800533466056020000547600000", { _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                __out.position = __.mul(env.camera.getCombinedMatrix(), __.makeVector(common_1.quat.rotate(common_1.quat.fromEulerAngles(__.makeVector((0 | 0), env.time, (0 | 0))), __in.position), (1 | 0)));
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