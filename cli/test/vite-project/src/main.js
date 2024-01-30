
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
	let define = (deps, func) => defineFunc("/main.js", deps, func);
	__shadeup_gen_shader("shd_026080640000000011000000097066000024020", {
					webgl: {},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[]}
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
dummy: vec4<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/

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

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[3352,3444,401,547],[7965,8062,0,547]]);

__shadeup_gen_shader("shd_468600940132506707176461900000000951000670000", {
					webgl: {_ext_uniform_local_sunViewProjMatrix: {"type":"primitive","name":"float4x4"}, _ext_uniform_local_sun: {"type":"primitive","name":"float3"}, _ext_uniform_global_shadowMapSize: {"type":"primitive","name":"int"}, _ext_uniform_global_shadow: {"type":"primitive","name":"texture2d"}, _ext_uniform_global_sqNum: {"type":"primitive","name":"int"}, _ext_uniform_global_perlin_octaves: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PI: {"type":"primitive","name":"float"}, _ext_uniform_global_perlin: {"type":"array","element":{"type":"primitive","name":"float"}}, _ext_uniform_global_PERLIN_SIZE: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_perlin_amp_falloff: {"type":"primitive","name":"float"}},
					webgpu: {"attributeInput":"@location(7) @interpolate(perspective) custom0: vec3<f32>,\n","attributeOutput":"","locals":[["sunViewProjMatrix",{"type":"primitive","name":"float4x4"}],["sun",{"type":"primitive","name":"float3"}]],"globals":[["shadowMapSize",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["shadow",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"sample"}}],["sqNum",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["perlin_octaves",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PI",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}],["perlin",{"fileName":"/_std/common.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float"},"staticSize":1,"access":"read"}}],["PERLIN_SIZE",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["perlin_amp_falloff",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}]]}
				}, {webgpu: `fn shadeup_up_swizzle_xy_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
}

fn shadeup_up_swizzle_xyz_f32(n: f32) -> vec3<f32>{
	return vec3<f32>(n, n, n);
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
@location(7) @interpolate(perspective) custom0: vec3<f32>,
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
_ext_uniform_local_sunViewProjMatrix: mat4x4<f32>,
@align(16) _ext_uniform_local_sun: vec3<f32>,
@align(16) _ext_uniform_global_shadowMapSize: i32,
@align(16) _ext_uniform_global_shadow_size: vec2<f32>,
@align(16) _ext_uniform_global_sqNum: i32,
@align(16) _ext_uniform_global_perlin_octaves: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAPB: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAPB: i32,
@align(16) _ext_uniform_global_PI: f32,
@align(16) _ext_uniform_global_perlin_size: i32,
@align(16) _ext_uniform_global_PERLIN_SIZE: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAP: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAP: i32,
@align(16) _ext_uniform_global_perlin_amp_falloff: f32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var _ext_uniform_global_shadow_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_shadow: sampler;
@group(%GROUP_INDEX%) @binding(4) var<storage, read> _ext_uniform_global_perlin: array<f32>;
fn fn_ii_std_common_ts_42195_scaled_cosine(i_const: f32) -> f32 {
var i = i_const;
return f32(0.5) * (f32(1) - cos(i * _in_uniforms._ext_uniform_global_PI));

}

fn fn_ii_std_common_ts_32873_noise_static_perlin2(v_const: vec2<f32>) -> f32 {
var v = v_const;
var x: f32 = v.x;
var y: f32 = v.y;
var z: f32 = f32(0);
if ((x < f32(i32(0)))) 
{
x = -(x);

}
if ((y < f32(i32(0)))) 
{
y = -(y);

}
if ((z < f32(i32(0)))) 
{
z = -(z);

}
var xi: i32 = i32(floor(f32(1.0) * x));
var yi: i32 = i32(floor(f32(1.0) * y));
var zi: i32 = i32(floor(f32(1.0) * z));
var xf: f32 = x - f32(xi);
var yf: f32 = y - f32(yi);
var zf: f32 = z - f32(zi);
var rxf: f32 = f32(0);
var ryf: f32 = f32(0);
var r: f32 = f32(0);
var ampl: f32 = f32(0.5);
var n1: f32 = f32(0);
var n2: f32 = f32(0);
var n3: f32 = f32(0);
for (var o: i32 = i32(0);(o < _in_uniforms._ext_uniform_global_perlin_octaves);o++){
var of1: i32 = xi + (yi << u32(_in_uniforms._ext_uniform_global_PERLIN_YWRAPB)) + (zi << u32(_in_uniforms._ext_uniform_global_PERLIN_ZWRAPB));
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _in_uniforms._ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _in_uniforms._ext_uniform_global_perlin_amp_falloff;
;xi = xi << u32(i32(1));
;xf = xf * f32(2);
;yi = yi << u32(i32(1));
;yf = yf * f32(2);
;zi = zi << u32(i32(1));
;zf = zf * f32(2);
;if ((xf >= f32(1))) 
{
xi++;
;xf = xf - f32(1);

}
;if ((yf >= f32(1))) 
{
yi++;
;yf = yf - f32(1);

}
;if ((zf >= f32(1))) 
{
zi++;
;zf = zf - f32(1);

}

}return r;

}

fn fn_iimain_ts_3675_calcColor(instanceIndex_const: i32, inNormal_const: vec3<f32>) -> vec4<f32> {
var instanceIndex = instanceIndex_const;
var inNormal = inNormal_const;
var yFrac: f32 = f32(instanceIndex) / f32(_in_uniforms._ext_uniform_global_sqNum);
var x: f32 = f32(instanceIndex) - f32(floor(f32(1.0) * yFrac) * f32(_in_uniforms._ext_uniform_global_sqNum));
var y: f32 = floor(f32(1.0) * yFrac);
var h: f32 = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2<f32>(x, y) / f32(30));
var c: vec4<f32> = vec4<f32>(f32(0), f32(i32(0)), f32(i32(1)), f32(i32(1)));
if ((h > f32(0.2))) 
{
c = vec4<f32>(f32(0.9), f32(0.7), f32(0.7), f32(i32(1)));

}
if ((h > f32(0.25))) 
{
c = vec4<f32>(f32(0.1), f32(0.7), f32(0.1), f32(i32(1)));

}
if ((h > f32(0.6))) 
{
c = vec4<f32>(f32(0.6), f32(0.6), f32(0.6), f32(i32(1)));

}
if ((h > f32(0.7))) 
{
c = vec4<f32>(f32(0.9), f32(0.9), f32(0.9), f32(i32(1)));

}
return vec4<f32>(shadeup_up_swizzle_xyz_f32(((f32(i32(1)) + dot(inNormal, vec3<f32>(vec3<i32>(i32(0), i32(1), i32(0))))) / f32(2))), f32(i32(1))) * c;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var realPosition: vec3<f32> = _i_in.custom0;
var posFromLight: vec4<f32> = _in_uniforms._ext_uniform_local_sunViewProjMatrix * vec4<f32>(realPosition, f32(1));
posFromLight = posFromLight / posFromLight.w;
var shadowPos: vec3<f32> = vec3<f32>(posFromLight.xy * vec2<f32>(f32(0.5), -(f32(0.5))) + shadeup_up_swizzle_xy_f32(f32(0.5)), posFromLight.z);
var visibility: f32 = f32(0);
for (var y: i32 = -(i32(1));(y <= i32(1));y++){
for (var x: i32 = -(i32(1));(x <= i32(1));x++){
var offset: vec2<f32> = vec2<f32>(f32(x), f32(y)) * (f32(1) / f32(_in_uniforms._ext_uniform_global_shadowMapSize));
;var sampVal: f32 = textureSample(_ext_uniform_global_shadow_texture, _ext_uniform_global_shadow, vec2(shadowPos.xy + offset)).x;
;var compVal: f32 = shadowPos.z - f32(0.000003);
;visibility = visibility + f32(select(i32(0), i32(1), (compVal < sampVal)));

}
}visibility = visibility / f32(9);
var lambertFactor: f32 = max(dot(normalize(_in_uniforms._ext_uniform_local_sun - _i_in.position), _i_in.normal), f32(0));
var lightingFactor: f32 = min(f32(0.2) + visibility * lambertFactor, f32(1));
return vec4<f32>((fn_iimain_ts_3675_calcColor(_i_in.instanceIndex, _i_in.normal) * lightingFactor).xyz, f32(i32(1)));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`vec2 shadeup_up_swizzle_xy_float(float n) {
	return vec2(n, n);
}

vec3 shadeup_up_swizzle_xyz_float(float n) {
	return vec3(n, n, n);
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
uniform mat4 _ext_uniform_local_sunViewProjMatrix;
uniform int _ext_uniform_global_shadowMapSize;
uniform sampler2D _ext_uniform_global_shadow;
uniform vec2 _ext_uniform_global_shadow_size;
uniform vec3 _ext_uniform_local_sun;
uniform int _ext_uniform_global_sqNum;
uniform int _ext_uniform_global_perlin_octaves;
uniform int _ext_uniform_global_PERLIN_YWRAPB;
uniform int _ext_uniform_global_PERLIN_ZWRAPB;
uniform float _ext_uniform_global_PI;
uniform float[0] _ext_uniform_global_perlin;
uniform int _ext_uniform_global_PERLIN_SIZE;
uniform int _ext_uniform_global_PERLIN_YWRAP;
uniform int _ext_uniform_global_PERLIN_ZWRAP;
uniform float _ext_uniform_global_perlin_amp_falloff;
float fn_ii_std_common_ts_42195_scaled_cosine(float i) {
return float(0.5) * (float(1) - cos(i * _ext_uniform_global_PI));

}

float fn_ii_std_common_ts_32873_noise_static_perlin2(vec2 v) {
float x = v.x;
float y = v.y;
float z = float(0);
if ((x < float(float(int(0))))){
x = -(x);

}if ((y < float(float(int(0))))){
y = -(y);

}if ((z < float(float(int(0))))){
z = -(z);

}int xi = int(floor(x));
int yi = int(floor(y));
int zi = int(floor(z));
float xf = x - float(xi);
float yf = y - float(yi);
float zf = z - float(zi);
float rxf = float(0);
float ryf = float(0);
float r = float(0);
float ampl = float(0.5);
float n1 = float(0);
float n2 = float(0);
float n3 = float(0);
for (int o = int(0);(float(o) < float(_ext_uniform_global_perlin_octaves));o++){
int of1 = xi + (yi << _ext_uniform_global_PERLIN_YWRAPB) + (zi << _ext_uniform_global_PERLIN_ZWRAPB);
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _ext_uniform_global_perlin_amp_falloff;
;xi = xi << int(1);
;xf = xf * float(2);
;yi = yi << int(1);
;yf = yf * float(2);
;zi = zi << int(1);
;zf = zf * float(2);
;if ((xf >= float(1))){
xi++;
;xf = xf - float(1);

};if ((yf >= float(1))){
yi++;
;yf = yf - float(1);

};if ((zf >= float(1))){
zi++;
;zf = zf - float(1);

}
}return r;

}

vec4 fn_iimain_ts_3675_calcColor(int instanceIndex, vec3 inNormal) {
float yFrac = float(instanceIndex) / float(_ext_uniform_global_sqNum);
float x = float(instanceIndex) - float(floor(yFrac) * float(_ext_uniform_global_sqNum));
float y = floor(yFrac);
float h = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2(x, y) / float(30));
vec4 c = vec4(float(0), int(0), int(1), int(1));
if ((h > float(0.2))){
c = vec4(float(0.9), float(0.7), float(0.7), int(1));

}if ((h > float(0.25))){
c = vec4(float(0.1), float(0.7), float(0.1), int(1));

}if ((h > float(0.6))){
c = vec4(float(0.6), float(0.6), float(0.6), int(1));

}if ((h > float(0.7))){
c = vec4(float(0.9), float(0.9), float(0.9), int(1));

}return vec4(shadeup_up_swizzle_xyz_float(((float(int(1)) + dot(inNormal, vec3(ivec3(int(0), int(1), int(0))))) / float(2))), int(1)) * c;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
vec3 realPosition = fn_ii_std_drawIndexed_ts_4178_ShaderInput_static_attr(_i_in, int(0));
vec4 posFromLight = _ext_uniform_local_sunViewProjMatrix * vec4(realPosition, float(1));
posFromLight = posFromLight / posFromLight.w;
vec3 shadowPos = vec3(posFromLight.xy * vec2(float(0.5), -(float(0.5))) + shadeup_up_swizzle_xy_float(float(0.5)), posFromLight.z);
float visibility = float(0);
for (int y = -(int(1));(float(y) <= float(int(1)));y++){
for (int x = -(int(1));(float(x) <= float(int(1)));x++){
vec2 offset = vec2(x, y) * (float(1) / float(_ext_uniform_global_shadowMapSize));
;float sampVal = texture(_ext_uniform_global_shadow, vec2(shadowPos.xy + offset)).x;
;float compVal = shadowPos.z - float(0.000003);
;visibility = visibility + float((compVal < sampVal) ? int(1) : int(0));

}
}visibility = visibility / float(9);
float lambertFactor = max(dot(normalize(_ext_uniform_local_sun - _i_in.position), _i_in.normal), float(0));
float lightingFactor = min(float(0.2) + visibility * lambertFactor, float(1));
return vec4((fn_iimain_ts_3675_calcColor(_i_in.instanceIndex, _i_in.normal) * lightingFactor).xyz, int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[5436,5500,401,452],[1810,1943,452,499],[2271,2444,499,545],[2271,2444,545,591],[5004,5127,591,628],[2721,2834,628,667],[41825,41971,667,715],[41033,41176,715,762],[41356,41499,762,809],[1922,2070,809,847],[42328,42500,847,892],[41679,41819,892,937],[41182,41350,937,983],[41505,41673,983,1029],[42006,42168,1029,1083],[0,0,1129,1136],[42257,42265,1147,1152],[0,0,1153,1156],[0,0,1147,1157],[42281,42289,1161,1166],[0,0,1167,1168],[0,0,1161,1169],[42296,42299,1172,1175],[0,0,1176,1177],[0,0,1180,1202],[0,0,1176,1202],[0,0,1172,1203],[0,0,1161,1203],[0,0,1160,1204],[0,0,1147,1204],[0,0,1140,1206],[19720,19799,1083,1210],[0,0,1263,1269],[0,0,1283,1284],[0,0,1283,1286],[0,0,1273,1286],[0,0,1273,1288],[0,0,1298,1299],[0,0,1298,1301],[0,0,1288,1301],[0,0,1288,1303],[32966,32974,1313,1318],[0,0,1319,1320],[0,0,1313,1321],[0,0,1303,1321],[0,0,1303,1323],[0,0,1328,1329],[32995,33001,1344,1347],[0,0,1348,1349],[0,0,1344,1350],[0,0,1338,1351],[0,0,1332,1352],[0,0,1327,1353],[0,0,1356,1357],[0,0,1362,1363],[0,0,1360,1364],[0,0,1356,1364],[0,0,1356,1366],[0,0,1354,1368],[0,0,1368,1368],[0,0,1323,1368],[0,0,1373,1374],[33041,33047,1389,1392],[0,0,1393,1394],[0,0,1389,1395],[0,0,1383,1396],[0,0,1377,1397],[0,0,1372,1398],[0,0,1401,1402],[0,0,1407,1408],[0,0,1405,1409],[0,0,1401,1409],[0,0,1401,1411],[0,0,1399,1413],[0,0,1413,1413],[0,0,1368,1413],[0,0,1418,1419],[33087,33093,1434,1437],[0,0,1438,1439],[0,0,1434,1440],[0,0,1428,1441],[0,0,1422,1442],[0,0,1417,1443],[0,0,1446,1447],[0,0,1452,1453],[0,0,1450,1454],[0,0,1446,1454],[0,0,1446,1456],[0,0,1444,1458],[0,0,1458,1458],[0,0,1413,1458],[33128,33134,1467,1470],[33135,33140,1471,1476],[0,0,1477,1478],[0,0,1471,1479],[0,0,1467,1480],[0,0,1458,1480],[0,0,1458,1482],[33155,33161,1491,1494],[33162,33167,1495,1500],[0,0,1501,1502],[0,0,1495,1503],[0,0,1491,1504],[0,0,1482,1504],[0,0,1482,1506],[33182,33188,1515,1518],[33189,33194,1519,1524],[0,0,1525,1526],[0,0,1519,1527],[0,0,1515,1528],[0,0,1506,1528],[0,0,1506,1530],[0,0,1541,1542],[0,0,1551,1553],[0,0,1545,1554],[0,0,1541,1554],[0,0,1530,1554],[0,0,1530,1556],[0,0,1567,1568],[0,0,1577,1579],[0,0,1571,1580],[0,0,1567,1580],[0,0,1556,1580],[0,0,1556,1582],[0,0,1593,1594],[0,0,1603,1605],[0,0,1597,1606],[0,0,1593,1606],[0,0,1582,1606],[0,0,1582,1608],[33288,33296,1620,1625],[0,0,1626,1627],[0,0,1620,1628],[0,0,1608,1628],[0,0,1608,1630],[33313,33321,1642,1647],[0,0,1648,1649],[0,0,1642,1650],[0,0,1630,1650],[0,0,1630,1652],[33336,33344,1662,1667],[0,0,1668,1669],[0,0,1662,1670],[0,0,1652,1670],[0,0,1652,1672],[33362,33370,1685,1690],[0,0,1691,1694],[0,0,1685,1695],[0,0,1672,1695],[0,0,1672,1697],[33386,33394,1708,1713],[0,0,1714,1715],[0,0,1708,1716],[0,0,1697,1716],[0,0,1697,1718],[33410,33418,1729,1734],[0,0,1735,1736],[0,0,1729,1737],[0,0,1718,1737],[0,0,1718,1739],[33434,33442,1750,1755],[0,0,1756,1757],[0,0,1750,1758],[0,0,1739,1758],[0,0,1739,1760],[33462,33468,1773,1776],[0,0,1777,1778],[0,0,1773,1779],[0,0,1765,1779],[0,0,1787,1788],[0,0,1781,1789],[0,0,1798,1832],[0,0,1792,1833],[0,0,1780,1834],[0,0,1835,1836],[0,0,1835,1838],[0,0,1851,1853],[0,0,1857,1859],[0,0,1863,1896],[0,0,1857,1896],[0,0,1856,1897],[0,0,1851,1897],[0,0,1901,1903],[0,0,1907,1940],[0,0,1901,1940],[0,0,1900,1941],[0,0,1851,1941],[0,0,1841,1941],[0,0,1841,1943],[0,0,1944,1947],[33625,33638,1950,1989],[0,0,1990,1992],[0,0,1950,1993],[0,0,1944,1993],[0,0,1944,1995],[0,0,1996,1999],[33650,33663,2002,2041],[0,0,2042,2044],[0,0,2002,2045],[0,0,1996,2045],[0,0,1996,2047],[0,0,2048,2050],[0,0,2053,2079],[0,0,2053,2079],[0,0,2080,2083],[0,0,2086,2117],[0,0,2080,2117],[0,0,2053,2118],[0,0,2048,2118],[0,0,2048,2120],[0,0,2121,2123],[0,0,2126,2128],[0,0,2131,2134],[0,0,2138,2164],[0,0,2138,2164],[0,0,2166,2169],[33799,33805,2172,2175],[0,0,2176,2177],[0,0,2172,2178],[0,0,2166,2178],[0,0,2165,2179],[0,0,2182,2213],[0,0,2165,2213],[0,0,2138,2214],[0,0,2217,2219],[0,0,2138,2219],[0,0,2137,2220],[0,0,2131,2220],[0,0,2126,2220],[0,0,2121,2220],[0,0,2121,2222],[0,0,2223,2225],[0,0,2228,2254],[0,0,2228,2254],[0,0,2256,2259],[0,0,2262,2294],[0,0,2256,2294],[0,0,2255,2295],[0,0,2298,2329],[0,0,2255,2329],[0,0,2228,2330],[0,0,2223,2330],[0,0,2223,2332],[0,0,2333,2335],[0,0,2338,2340],[0,0,2343,2346],[0,0,2350,2376],[0,0,2350,2376],[0,0,2378,2381],[0,0,2384,2416],[0,0,2378,2416],[34019,34025,2419,2422],[0,0,2423,2424],[0,0,2419,2425],[0,0,2378,2425],[0,0,2377,2426],[0,0,2429,2460],[0,0,2377,2460],[0,0,2350,2461],[0,0,2464,2466],[0,0,2350,2466],[0,0,2349,2467],[0,0,2343,2467],[0,0,2338,2467],[0,0,2333,2467],[0,0,2333,2469],[0,0,2470,2472],[0,0,2475,2477],[0,0,2480,2483],[0,0,2487,2489],[0,0,2492,2494],[0,0,2487,2494],[0,0,2486,2495],[0,0,2480,2495],[0,0,2475,2495],[0,0,2470,2495],[0,0,2470,2497],[0,0,2498,2501],[0,0,2504,2507],[0,0,2510,2542],[0,0,2504,2542],[0,0,2498,2542],[0,0,2498,2544],[0,0,2545,2547],[0,0,2550,2576],[0,0,2550,2576],[0,0,2577,2580],[0,0,2583,2614],[0,0,2577,2614],[0,0,2550,2615],[0,0,2545,2615],[0,0,2545,2617],[0,0,2618,2620],[0,0,2623,2625],[0,0,2628,2631],[0,0,2635,2661],[0,0,2635,2661],[0,0,2663,2666],[34274,34280,2669,2672],[0,0,2673,2674],[0,0,2669,2675],[0,0,2663,2675],[0,0,2662,2676],[0,0,2679,2710],[0,0,2662,2710],[0,0,2635,2711],[0,0,2714,2716],[0,0,2635,2716],[0,0,2634,2717],[0,0,2628,2717],[0,0,2623,2717],[0,0,2618,2717],[0,0,2618,2719],[0,0,2720,2722],[0,0,2725,2751],[0,0,2725,2751],[0,0,2753,2756],[0,0,2759,2791],[0,0,2753,2791],[0,0,2752,2792],[0,0,2795,2826],[0,0,2752,2826],[0,0,2725,2827],[0,0,2720,2827],[0,0,2720,2829],[0,0,2830,2832],[0,0,2835,2837],[0,0,2840,2843],[0,0,2847,2873],[0,0,2847,2873],[0,0,2875,2878],[0,0,2881,2913],[0,0,2875,2913],[34494,34500,2916,2919],[0,0,2920,2921],[0,0,2916,2922],[0,0,2875,2922],[0,0,2874,2923],[0,0,2926,2957],[0,0,2874,2957],[0,0,2847,2958],[0,0,2961,2963],[0,0,2847,2963],[0,0,2846,2964],[0,0,2840,2964],[0,0,2835,2964],[0,0,2830,2964],[0,0,2830,2966],[0,0,2967,2969],[0,0,2972,2974],[0,0,2977,2980],[0,0,2984,2986],[0,0,2989,2991],[0,0,2984,2991],[0,0,2983,2992],[0,0,2977,2992],[0,0,2972,2992],[0,0,2967,2992],[0,0,2967,2994],[0,0,2995,2997],[0,0,3000,3002],[34610,34623,3005,3044],[0,0,3045,3047],[0,0,3005,3048],[0,0,3052,3054],[0,0,3057,3059],[0,0,3052,3059],[0,0,3051,3060],[0,0,3005,3060],[0,0,3000,3060],[0,0,2995,3060],[0,0,2995,3062],[0,0,3063,3064],[0,0,3067,3068],[0,0,3071,3073],[0,0,3076,3080],[0,0,3071,3080],[0,0,3067,3080],[0,0,3063,3080],[0,0,3063,3082],[0,0,3083,3087],[0,0,3090,3094],[0,0,3097,3135],[0,0,3090,3135],[0,0,3083,3135],[0,0,3083,3137],[0,0,3138,3140],[0,0,3143,3145],[34748,34754,3149,3152],[0,0,3153,3154],[0,0,3149,3155],[0,0,3143,3155],[0,0,3138,3155],[0,0,3138,3157],[0,0,3158,3160],[0,0,3163,3165],[34777,34785,3168,3173],[0,0,3174,3175],[0,0,3168,3176],[0,0,3163,3176],[0,0,3158,3176],[0,0,3158,3178],[0,0,3179,3181],[0,0,3184,3186],[34813,34819,3190,3193],[0,0,3194,3195],[0,0,3190,3196],[0,0,3184,3196],[0,0,3179,3196],[0,0,3179,3198],[0,0,3199,3201],[0,0,3204,3206],[34842,34850,3209,3214],[0,0,3215,3216],[0,0,3209,3217],[0,0,3204,3217],[0,0,3199,3217],[0,0,3199,3219],[0,0,3220,3222],[0,0,3225,3227],[34878,34884,3231,3234],[0,0,3235,3236],[0,0,3231,3237],[0,0,3225,3237],[0,0,3220,3237],[0,0,3220,3239],[0,0,3240,3242],[0,0,3245,3247],[34907,34915,3250,3255],[0,0,3256,3257],[0,0,3250,3258],[0,0,3245,3258],[0,0,3240,3258],[0,0,3240,3260],[0,0,3266,3268],[34939,34947,3272,3277],[0,0,3278,3279],[0,0,3272,3280],[0,0,3265,3281],[0,0,3284,3286],[0,0,3284,3288],[0,0,3284,3290],[0,0,3291,3293],[0,0,3296,3298],[34978,34986,3301,3306],[0,0,3307,3308],[0,0,3301,3309],[0,0,3296,3309],[0,0,3291,3309],[0,0,3291,3311],[0,0,3282,3313],[0,0,3313,3313],[0,0,3261,3313],[0,0,3319,3321],[35011,35019,3325,3330],[0,0,3331,3332],[0,0,3325,3333],[0,0,3318,3334],[0,0,3337,3339],[0,0,3337,3341],[0,0,3337,3343],[0,0,3344,3346],[0,0,3349,3351],[35050,35058,3354,3359],[0,0,3360,3361],[0,0,3354,3362],[0,0,3349,3362],[0,0,3344,3362],[0,0,3344,3364],[0,0,3335,3366],[0,0,3366,3366],[0,0,3314,3366],[0,0,3372,3374],[35083,35091,3378,3383],[0,0,3384,3385],[0,0,3378,3386],[0,0,3371,3387],[0,0,3390,3392],[0,0,3390,3394],[0,0,3390,3396],[0,0,3397,3399],[0,0,3402,3404],[35122,35130,3407,3412],[0,0,3413,3414],[0,0,3407,3415],[0,0,3402,3415],[0,0,3397,3415],[0,0,3397,3417],[0,0,3388,3419],[0,0,3419,3419],[0,0,3367,3419],[0,0,1839,3421],[0,0,1760,3421],[0,0,3428,3429],[0,0,3421,3431],[19421,19436,1210,3435],[0,0,3468,3485],[0,0,3487,3500],[0,0,3524,3537],[0,0,3518,3538],[3785,3793,3541,3546],[0,0,3547,3572],[0,0,3541,3573],[0,0,3518,3573],[0,0,3504,3573],[0,0,3504,3575],[0,0,3591,3604],[0,0,3585,3605],[3835,3843,3608,3613],[3852,3857,3614,3619],[0,0,3620,3625],[0,0,3614,3626],[0,0,3635,3660],[0,0,3629,3661],[0,0,3614,3661],[0,0,3608,3662],[0,0,3585,3662],[0,0,3575,3662],[0,0,3575,3664],[3886,3891,3674,3679],[0,0,3680,3685],[0,0,3674,3686],[0,0,3664,3686],[0,0,3664,3688],[3908,3921,3698,3744],[0,0,3750,3751],[0,0,3753,3754],[0,0,3745,3755],[3951,3959,3758,3763],[0,0,3764,3766],[0,0,3758,3767],[0,0,3745,3767],[0,0,3698,3768],[0,0,3688,3768],[0,0,3688,3770],[3992,4000,3784,3789],[0,0,3790,3791],[0,0,3784,3792],[4007,4013,3794,3797],[0,0,3798,3799],[0,0,3794,3800],[4018,4024,3802,3805],[0,0,3806,3807],[0,0,3802,3808],[4029,4035,3810,3813],[0,0,3814,3815],[0,0,3810,3816],[0,0,3779,3817],[0,0,3770,3817],[0,0,3770,3819],[0,0,3824,3825],[4055,4063,3828,3833],[0,0,3834,3837],[0,0,3828,3838],[0,0,3823,3839],[0,0,3842,3843],[4090,4098,3851,3856],[0,0,3857,3860],[0,0,3851,3861],[4105,4113,3863,3868],[0,0,3869,3872],[0,0,3863,3873],[4120,4128,3875,3880],[0,0,3881,3884],[0,0,3875,3885],[4135,4141,3887,3890],[0,0,3891,3892],[0,0,3887,3893],[0,0,3846,3894],[0,0,3842,3894],[0,0,3842,3896],[0,0,3840,3898],[0,0,3898,3898],[0,0,3819,3898],[0,0,3903,3904],[4162,4170,3907,3912],[0,0,3913,3917],[0,0,3907,3918],[0,0,3902,3919],[0,0,3922,3923],[4198,4206,3931,3936],[0,0,3937,3940],[0,0,3931,3941],[4213,4221,3943,3948],[0,0,3949,3952],[0,0,3943,3953],[4228,4236,3955,3960],[0,0,3961,3964],[0,0,3955,3965],[4243,4249,3967,3970],[0,0,3971,3972],[0,0,3967,3973],[0,0,3926,3974],[0,0,3922,3974],[0,0,3922,3976],[0,0,3920,3978],[0,0,3978,3978],[0,0,3898,3978],[0,0,3983,3984],[4270,4278,3987,3992],[0,0,3993,3996],[0,0,3987,3997],[0,0,3982,3998],[0,0,4001,4002],[4305,4313,4010,4015],[0,0,4016,4019],[0,0,4010,4020],[4320,4328,4022,4027],[0,0,4028,4031],[0,0,4022,4032],[4335,4343,4034,4039],[0,0,4040,4043],[0,0,4034,4044],[4350,4356,4046,4049],[0,0,4050,4051],[0,0,4046,4052],[0,0,4005,4053],[0,0,4001,4053],[0,0,4001,4055],[0,0,3999,4057],[0,0,4057,4057],[0,0,3978,4057],[0,0,4062,4063],[4377,4385,4066,4071],[0,0,4072,4075],[0,0,4066,4076],[0,0,4061,4077],[0,0,4080,4081],[4412,4420,4089,4094],[0,0,4095,4098],[0,0,4089,4099],[4427,4435,4101,4106],[0,0,4107,4110],[0,0,4101,4111],[4442,4450,4113,4118],[0,0,4119,4122],[0,0,4113,4123],[4457,4463,4125,4128],[0,0,4129,4130],[0,0,4125,4131],[0,0,4084,4132],[0,0,4080,4132],[0,0,4080,4134],[0,0,4078,4136],[0,0,4136,4136],[0,0,4057,4136],[4528,4534,4185,4188],[0,0,4189,4190],[0,0,4185,4191],[0,0,4179,4192],[4539,4542,4195,4198],[0,0,4199,4207],[4567,4573,4220,4223],[0,0,4224,4225],[0,0,4220,4226],[4578,4584,4228,4231],[0,0,4232,4233],[0,0,4228,4234],[4589,4595,4236,4239],[0,0,4240,4241],[0,0,4236,4242],[0,0,4214,4243],[0,0,4209,4244],[0,0,4195,4245],[0,0,4179,4245],[0,0,4178,4246],[4605,4613,4249,4254],[0,0,4255,4256],[0,0,4249,4257],[0,0,4178,4257],[0,0,4177,4258],[0,0,4148,4259],[4631,4637,4261,4264],[0,0,4265,4266],[0,0,4261,4267],[0,0,4143,4268],[0,0,4271,4272],[0,0,4143,4272],[0,0,4136,4274],[894,1403,3435,4278],[6583,6592,4400,4453],[0,0,4454,4459],[6604,6610,4461,4464],[0,0,4465,4466],[0,0,4461,4467],[0,0,4400,4468],[0,0,4380,4468],[0,0,4380,4470],[0,0,4490,4526],[0,0,4534,4546],[6690,6698,4548,4553],[0,0,4554,4555],[0,0,4548,4556],[0,0,4529,4557],[0,0,4490,4557],[0,0,4470,4557],[0,0,4470,4559],[0,0,4559,4571],[0,0,4574,4586],[0,0,4589,4601],[0,0,4589,4603],[0,0,4574,4603],[0,0,4559,4603],[0,0,4559,4605],[0,0,4627,4639],[0,0,4627,4642],[6868,6876,4650,4655],[0,0,4656,4659],[0,0,4650,4660],[6893,6901,4664,4669],[0,0,4670,4673],[0,0,4664,4674],[0,0,4662,4675],[0,0,4645,4676],[0,0,4627,4676],[6923,6931,4707,4712],[0,0,4713,4716],[0,0,4707,4717],[0,0,4679,4718],[0,0,4627,4718],[0,0,4720,4732],[0,0,4720,4734],[0,0,4622,4735],[0,0,4605,4735],[0,0,4605,4737],[6996,7004,4756,4761],[0,0,4762,4763],[0,0,4756,4764],[0,0,4737,4764],[0,0,4737,4766],[7034,7040,4781,4784],[0,0,4785,4786],[0,0,4781,4787],[0,0,4779,4788],[0,0,4771,4788],[0,0,4796,4797],[0,0,4790,4798],[7058,7064,4808,4811],[0,0,4812,4813],[0,0,4808,4814],[0,0,4802,4815],[0,0,4789,4816],[0,0,4817,4818],[0,0,4817,4820],[7101,7107,4838,4841],[0,0,4842,4843],[0,0,4838,4844],[0,0,4836,4845],[0,0,4828,4845],[0,0,4853,4854],[0,0,4847,4855],[7125,7131,4865,4868],[0,0,4869,4870],[0,0,4865,4871],[0,0,4859,4872],[0,0,4846,4873],[0,0,4874,4875],[0,0,4874,4877],[0,0,4899,4900],[0,0,4902,4903],[0,0,4894,4904],[7192,7200,4908,4913],[0,0,4914,4915],[0,0,4908,4916],[0,0,4925,4958],[0,0,4919,4959],[0,0,4908,4959],[0,0,4907,4960],[0,0,4894,4960],[0,0,4880,4960],[0,0,4880,4962],[0,0,4987,5013],[0,0,5020,5029],[0,0,5020,5032],[0,0,5035,5041],[0,0,5020,5041],[0,0,4979,5043],[0,0,4979,5045],[0,0,4963,5045],[0,0,4963,5047],[0,0,5064,5073],[0,0,5064,5075],[7370,7378,5078,5083],[0,0,5084,5092],[0,0,5078,5093],[0,0,5064,5093],[0,0,5048,5093],[0,0,5048,5095],[0,0,5096,5106],[0,0,5109,5119],[0,0,5129,5136],[0,0,5139,5146],[0,0,5128,5147],[7452,7458,5150,5153],[0,0,5154,5155],[0,0,5150,5156],[7464,7470,5159,5162],[0,0,5163,5164],[0,0,5159,5165],[0,0,5128,5165],[0,0,5122,5166],[0,0,5109,5166],[0,0,5096,5166],[0,0,5096,5168],[0,0,4878,5170],[0,0,4823,5170],[0,0,4821,5172],[0,0,4766,5172],[0,0,5172,5182],[0,0,5185,5195],[7510,7518,5198,5203],[0,0,5204,5205],[0,0,5198,5206],[0,0,5185,5206],[0,0,5172,5206],[0,0,5172,5208],[7556,7559,5230,5233],[7560,7563,5234,5237],[7564,7573,5238,5247],[0,0,5248,5270],[0,0,5273,5278],[0,0,5279,5287],[0,0,5273,5287],[0,0,5248,5287],[0,0,5238,5288],[0,0,5290,5295],[0,0,5296,5302],[0,0,5290,5302],[0,0,5234,5303],[7619,7627,5305,5310],[0,0,5311,5312],[0,0,5305,5313],[0,0,5230,5314],[0,0,5208,5314],[0,0,5208,5316],[7656,7659,5339,5342],[7668,7676,5343,5348],[0,0,5349,5352],[0,0,5343,5353],[0,0,5356,5366],[0,0,5369,5382],[0,0,5356,5382],[0,0,5343,5382],[7722,7730,5384,5389],[0,0,5390,5391],[0,0,5384,5392],[0,0,5339,5393],[0,0,5316,5393],[0,0,5316,5395],[7779,7788,5408,5435],[0,0,5436,5441],[0,0,5442,5455],[0,0,5436,5455],[0,0,5457,5462],[0,0,5463,5469],[0,0,5457,5469],[0,0,5408,5470],[0,0,5473,5487],[0,0,5408,5487],[0,0,5407,5488],[0,0,5407,5492],[7850,7856,5494,5497],[0,0,5498,5499],[0,0,5494,5500],[0,0,5402,5501],[0,0,5395,5503],[2500,3336,4278,5547],[6546,7862,0,5547]]);

__shadeup_gen_shader("shd_00006405900710000000088000759302300086039", {
					webgl: {_ext_uniform_local_viewProjMatrix: {"type":"primitive","name":"float4x4"}, _ext_uniform_global_sqNum: {"type":"primitive","name":"int"}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"}}}, _ext_uniform_global_perlin_octaves: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PI: {"type":"primitive","name":"float"}, _ext_uniform_global_perlin: {"type":"array","element":{"type":"primitive","name":"float"}}, _ext_uniform_global_PERLIN_SIZE: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_perlin_amp_falloff: {"type":"primitive","name":"float"}},
					webgpu: {"attributeInput":"","attributeOutput":"@location(7) @interpolate(perspective) custom0: vec3<f32>,\n","locals":[["viewProjMatrix",{"type":"primitive","name":"float4x4"}]],"globals":[["sqNum",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}]]}}],["perlin_octaves",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PI",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}],["perlin",{"fileName":"/_std/common.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float"},"staticSize":1,"access":"read"}}],["PERLIN_SIZE",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["perlin_amp_falloff",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}]]}
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
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
 @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10663_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
_ext_uniform_local_viewProjMatrix: mat4x4<f32>,
@align(16) _ext_uniform_global_sqNum: i32,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
@align(16) _ext_uniform_global_perlin_octaves: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAPB: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAPB: i32,
@align(16) _ext_uniform_global_PI: f32,
@align(16) _ext_uniform_global_perlin_size: i32,
@align(16) _ext_uniform_global_PERLIN_SIZE: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAP: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAP: i32,
@align(16) _ext_uniform_global_perlin_amp_falloff: f32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read> _ext_uniform_global_perlin: array<f32>;
fn fn_ii_std_common_ts_42195_scaled_cosine(i_const: f32) -> f32 {
var i = i_const;
return f32(0.5) * (f32(1) - cos(i * _in_uniforms._ext_uniform_global_PI));

}

fn fn_ii_std_common_ts_32873_noise_static_perlin2(v_const: vec2<f32>) -> f32 {
var v = v_const;
var x: f32 = v.x;
var y: f32 = v.y;
var z: f32 = f32(0);
if ((x < f32(i32(0)))) 
{
x = -(x);

}
if ((y < f32(i32(0)))) 
{
y = -(y);

}
if ((z < f32(i32(0)))) 
{
z = -(z);

}
var xi: i32 = i32(floor(f32(1.0) * x));
var yi: i32 = i32(floor(f32(1.0) * y));
var zi: i32 = i32(floor(f32(1.0) * z));
var xf: f32 = x - f32(xi);
var yf: f32 = y - f32(yi);
var zf: f32 = z - f32(zi);
var rxf: f32 = f32(0);
var ryf: f32 = f32(0);
var r: f32 = f32(0);
var ampl: f32 = f32(0.5);
var n1: f32 = f32(0);
var n2: f32 = f32(0);
var n3: f32 = f32(0);
for (var o: i32 = i32(0);(o < _in_uniforms._ext_uniform_global_perlin_octaves);o++){
var of1: i32 = xi + (yi << u32(_in_uniforms._ext_uniform_global_PERLIN_YWRAPB)) + (zi << u32(_in_uniforms._ext_uniform_global_PERLIN_ZWRAPB));
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _in_uniforms._ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _in_uniforms._ext_uniform_global_perlin_amp_falloff;
;xi = xi << u32(i32(1));
;xf = xf * f32(2);
;yi = yi << u32(i32(1));
;yf = yf * f32(2);
;zi = zi << u32(i32(1));
;zf = zf * f32(2);
;if ((xf >= f32(1))) 
{
xi++;
;xf = xf - f32(1);

}
;if ((yf >= f32(1))) 
{
yi++;
;yf = yf - f32(1);

}
;if ((zf >= f32(1))) 
{
zi++;
;zf = zf - f32(1);

}

}return r;

}

fn fn_iimain_ts_2866_calcPosition(instanceIndex_const: i32, inPos_const: vec3<f32>) -> vec3<f32> {
var instanceIndex = instanceIndex_const;
var inPos = inPos_const;
var yFrac: f32 = f32(instanceIndex) / f32(_in_uniforms._ext_uniform_global_sqNum);
var x: f32 = f32(instanceIndex) - f32(floor(f32(1.0) * yFrac) * f32(_in_uniforms._ext_uniform_global_sqNum));
var y: f32 = floor(f32(1.0) * yFrac);
var t: f32 = _in_uniforms._ext_uniform_global_env.time / f32(200);
var h: f32 = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2<f32>(x, y) / f32(30));
if ((h > f32(0.6))) 
{
h = h + (h - f32(0.6)) * f32(1.5);

}
var p: vec3<f32> = inPos * vec3<f32>(f32(i32(1)), f32(1), f32(i32(1))) + vec3<f32>(x * f32(i32(100)), round((h * f32(i32(3000))) / f32(100)) * f32(100), y * f32(i32(100)));
if ((inPos.y < f32(i32(0)))) 
{
p = p * vec3<f32>(vec3<f32>(vec3<i32>(i32(1), i32(0), i32(1))));

}
return p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var realPosition: vec3<f32> = fn_iimain_ts_2866_calcPosition(_i_in.instanceIndex, _i_in.position);
_i_out.custom0 = realPosition;
_i_out.position = _in_uniforms._ext_uniform_local_viewProjMatrix * vec4<f32>(realPosition, f32(i32(1)));

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
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
  float time;
//   vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10663_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  return _s;
}
uniform int _ext_uniform_global_sqNum;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform int _ext_uniform_global_perlin_octaves;
uniform int _ext_uniform_global_PERLIN_YWRAPB;
uniform int _ext_uniform_global_PERLIN_ZWRAPB;
uniform float _ext_uniform_global_PI;
uniform float[0] _ext_uniform_global_perlin;
uniform int _ext_uniform_global_PERLIN_SIZE;
uniform int _ext_uniform_global_PERLIN_YWRAP;
uniform int _ext_uniform_global_PERLIN_ZWRAP;
uniform float _ext_uniform_global_perlin_amp_falloff;
uniform mat4 _ext_uniform_local_viewProjMatrix;
float fn_ii_std_common_ts_42195_scaled_cosine(float i) {
return float(0.5) * (float(1) - cos(i * _ext_uniform_global_PI));

}

float fn_ii_std_common_ts_32873_noise_static_perlin2(vec2 v) {
float x = v.x;
float y = v.y;
float z = float(0);
if ((x < float(float(int(0))))){
x = -(x);

}if ((y < float(float(int(0))))){
y = -(y);

}if ((z < float(float(int(0))))){
z = -(z);

}int xi = int(floor(x));
int yi = int(floor(y));
int zi = int(floor(z));
float xf = x - float(xi);
float yf = y - float(yi);
float zf = z - float(zi);
float rxf = float(0);
float ryf = float(0);
float r = float(0);
float ampl = float(0.5);
float n1 = float(0);
float n2 = float(0);
float n3 = float(0);
for (int o = int(0);(float(o) < float(_ext_uniform_global_perlin_octaves));o++){
int of1 = xi + (yi << _ext_uniform_global_PERLIN_YWRAPB) + (zi << _ext_uniform_global_PERLIN_ZWRAPB);
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _ext_uniform_global_perlin_amp_falloff;
;xi = xi << int(1);
;xf = xf * float(2);
;yi = yi << int(1);
;yf = yf * float(2);
;zi = zi << int(1);
;zf = zf * float(2);
;if ((xf >= float(1))){
xi++;
;xf = xf - float(1);

};if ((yf >= float(1))){
yi++;
;yf = yf - float(1);

};if ((zf >= float(1))){
zi++;
;zf = zf - float(1);

}
}return r;

}

vec3 fn_iimain_ts_2866_calcPosition(int instanceIndex, vec3 inPos) {
float yFrac = float(instanceIndex) / float(_ext_uniform_global_sqNum);
float x = float(instanceIndex) - float(floor(yFrac) * float(_ext_uniform_global_sqNum));
float y = floor(yFrac);
float t = _ext_uniform_global_env.time / float(200);
float h = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2(x, y) / float(30));
if ((h > float(0.6))){
h = h + (h - float(0.6)) * float(1.5);

}vec3 p = inPos * vec3(int(1), float(1), int(1)) + vec3(x * float(int(100)), round((h * float(int(3000))) / float(100)) * float(100), y * float(int(100)));
if ((inPos.y < float(float(int(0))))){
p = p * vec3(vec3(ivec3(int(1), int(0), int(1))));

}return p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
vec3 realPosition = fn_iimain_ts_2866_calcPosition(_i_in.instanceIndex, _i_in.position);
fn_ii_std_drawIndexed_ts_4783_ShaderOutput_static_attr(_i_out, int(0), realPosition);
_i_out.position = _ext_uniform_local_viewProjMatrix * vec4(realPosition, int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[493,510,449,471],[577,589,471,485],[623,642,485,507],[674,685,507,523],[745,792,523,578],[842,898,578,639],[972,1002,639,687],[1007,1043,687,738],[387,1715,401,742],[387,1715,742,922],[2721,2834,922,961],[16316,16333,961,1033],[41825,41971,1033,1081],[41033,41176,1081,1128],[41356,41499,1128,1175],[1922,2070,1175,1213],[42328,42500,1213,1258],[41679,41819,1258,1303],[41182,41350,1303,1349],[41505,41673,1349,1395],[42006,42168,1395,1449],[5506,5601,1449,1497],[0,0,1543,1550],[42257,42265,1561,1566],[0,0,1567,1570],[0,0,1561,1571],[42281,42289,1575,1580],[0,0,1581,1582],[0,0,1575,1583],[42296,42299,1586,1589],[0,0,1590,1591],[0,0,1594,1616],[0,0,1590,1616],[0,0,1586,1617],[0,0,1575,1617],[0,0,1574,1618],[0,0,1561,1618],[0,0,1554,1620],[19720,19799,1497,1624],[0,0,1677,1683],[0,0,1697,1698],[0,0,1697,1700],[0,0,1687,1700],[0,0,1687,1702],[0,0,1712,1713],[0,0,1712,1715],[0,0,1702,1715],[0,0,1702,1717],[32966,32974,1727,1732],[0,0,1733,1734],[0,0,1727,1735],[0,0,1717,1735],[0,0,1717,1737],[0,0,1742,1743],[32995,33001,1758,1761],[0,0,1762,1763],[0,0,1758,1764],[0,0,1752,1765],[0,0,1746,1766],[0,0,1741,1767],[0,0,1770,1771],[0,0,1776,1777],[0,0,1774,1778],[0,0,1770,1778],[0,0,1770,1780],[0,0,1768,1782],[0,0,1782,1782],[0,0,1737,1782],[0,0,1787,1788],[33041,33047,1803,1806],[0,0,1807,1808],[0,0,1803,1809],[0,0,1797,1810],[0,0,1791,1811],[0,0,1786,1812],[0,0,1815,1816],[0,0,1821,1822],[0,0,1819,1823],[0,0,1815,1823],[0,0,1815,1825],[0,0,1813,1827],[0,0,1827,1827],[0,0,1782,1827],[0,0,1832,1833],[33087,33093,1848,1851],[0,0,1852,1853],[0,0,1848,1854],[0,0,1842,1855],[0,0,1836,1856],[0,0,1831,1857],[0,0,1860,1861],[0,0,1866,1867],[0,0,1864,1868],[0,0,1860,1868],[0,0,1860,1870],[0,0,1858,1872],[0,0,1872,1872],[0,0,1827,1872],[33128,33134,1881,1884],[33135,33140,1885,1890],[0,0,1891,1892],[0,0,1885,1893],[0,0,1881,1894],[0,0,1872,1894],[0,0,1872,1896],[33155,33161,1905,1908],[33162,33167,1909,1914],[0,0,1915,1916],[0,0,1909,1917],[0,0,1905,1918],[0,0,1896,1918],[0,0,1896,1920],[33182,33188,1929,1932],[33189,33194,1933,1938],[0,0,1939,1940],[0,0,1933,1941],[0,0,1929,1942],[0,0,1920,1942],[0,0,1920,1944],[0,0,1955,1956],[0,0,1965,1967],[0,0,1959,1968],[0,0,1955,1968],[0,0,1944,1968],[0,0,1944,1970],[0,0,1981,1982],[0,0,1991,1993],[0,0,1985,1994],[0,0,1981,1994],[0,0,1970,1994],[0,0,1970,1996],[0,0,2007,2008],[0,0,2017,2019],[0,0,2011,2020],[0,0,2007,2020],[0,0,1996,2020],[0,0,1996,2022],[33288,33296,2034,2039],[0,0,2040,2041],[0,0,2034,2042],[0,0,2022,2042],[0,0,2022,2044],[33313,33321,2056,2061],[0,0,2062,2063],[0,0,2056,2064],[0,0,2044,2064],[0,0,2044,2066],[33336,33344,2076,2081],[0,0,2082,2083],[0,0,2076,2084],[0,0,2066,2084],[0,0,2066,2086],[33362,33370,2099,2104],[0,0,2105,2108],[0,0,2099,2109],[0,0,2086,2109],[0,0,2086,2111],[33386,33394,2122,2127],[0,0,2128,2129],[0,0,2122,2130],[0,0,2111,2130],[0,0,2111,2132],[33410,33418,2143,2148],[0,0,2149,2150],[0,0,2143,2151],[0,0,2132,2151],[0,0,2132,2153],[33434,33442,2164,2169],[0,0,2170,2171],[0,0,2164,2172],[0,0,2153,2172],[0,0,2153,2174],[33462,33468,2187,2190],[0,0,2191,2192],[0,0,2187,2193],[0,0,2179,2193],[0,0,2201,2202],[0,0,2195,2203],[0,0,2212,2246],[0,0,2206,2247],[0,0,2194,2248],[0,0,2249,2250],[0,0,2249,2252],[0,0,2265,2267],[0,0,2271,2273],[0,0,2277,2310],[0,0,2271,2310],[0,0,2270,2311],[0,0,2265,2311],[0,0,2315,2317],[0,0,2321,2354],[0,0,2315,2354],[0,0,2314,2355],[0,0,2265,2355],[0,0,2255,2355],[0,0,2255,2357],[0,0,2358,2361],[33625,33638,2364,2403],[0,0,2404,2406],[0,0,2364,2407],[0,0,2358,2407],[0,0,2358,2409],[0,0,2410,2413],[33650,33663,2416,2455],[0,0,2456,2458],[0,0,2416,2459],[0,0,2410,2459],[0,0,2410,2461],[0,0,2462,2464],[0,0,2467,2493],[0,0,2467,2493],[0,0,2494,2497],[0,0,2500,2531],[0,0,2494,2531],[0,0,2467,2532],[0,0,2462,2532],[0,0,2462,2534],[0,0,2535,2537],[0,0,2540,2542],[0,0,2545,2548],[0,0,2552,2578],[0,0,2552,2578],[0,0,2580,2583],[33799,33805,2586,2589],[0,0,2590,2591],[0,0,2586,2592],[0,0,2580,2592],[0,0,2579,2593],[0,0,2596,2627],[0,0,2579,2627],[0,0,2552,2628],[0,0,2631,2633],[0,0,2552,2633],[0,0,2551,2634],[0,0,2545,2634],[0,0,2540,2634],[0,0,2535,2634],[0,0,2535,2636],[0,0,2637,2639],[0,0,2642,2668],[0,0,2642,2668],[0,0,2670,2673],[0,0,2676,2708],[0,0,2670,2708],[0,0,2669,2709],[0,0,2712,2743],[0,0,2669,2743],[0,0,2642,2744],[0,0,2637,2744],[0,0,2637,2746],[0,0,2747,2749],[0,0,2752,2754],[0,0,2757,2760],[0,0,2764,2790],[0,0,2764,2790],[0,0,2792,2795],[0,0,2798,2830],[0,0,2792,2830],[34019,34025,2833,2836],[0,0,2837,2838],[0,0,2833,2839],[0,0,2792,2839],[0,0,2791,2840],[0,0,2843,2874],[0,0,2791,2874],[0,0,2764,2875],[0,0,2878,2880],[0,0,2764,2880],[0,0,2763,2881],[0,0,2757,2881],[0,0,2752,2881],[0,0,2747,2881],[0,0,2747,2883],[0,0,2884,2886],[0,0,2889,2891],[0,0,2894,2897],[0,0,2901,2903],[0,0,2906,2908],[0,0,2901,2908],[0,0,2900,2909],[0,0,2894,2909],[0,0,2889,2909],[0,0,2884,2909],[0,0,2884,2911],[0,0,2912,2915],[0,0,2918,2921],[0,0,2924,2956],[0,0,2918,2956],[0,0,2912,2956],[0,0,2912,2958],[0,0,2959,2961],[0,0,2964,2990],[0,0,2964,2990],[0,0,2991,2994],[0,0,2997,3028],[0,0,2991,3028],[0,0,2964,3029],[0,0,2959,3029],[0,0,2959,3031],[0,0,3032,3034],[0,0,3037,3039],[0,0,3042,3045],[0,0,3049,3075],[0,0,3049,3075],[0,0,3077,3080],[34274,34280,3083,3086],[0,0,3087,3088],[0,0,3083,3089],[0,0,3077,3089],[0,0,3076,3090],[0,0,3093,3124],[0,0,3076,3124],[0,0,3049,3125],[0,0,3128,3130],[0,0,3049,3130],[0,0,3048,3131],[0,0,3042,3131],[0,0,3037,3131],[0,0,3032,3131],[0,0,3032,3133],[0,0,3134,3136],[0,0,3139,3165],[0,0,3139,3165],[0,0,3167,3170],[0,0,3173,3205],[0,0,3167,3205],[0,0,3166,3206],[0,0,3209,3240],[0,0,3166,3240],[0,0,3139,3241],[0,0,3134,3241],[0,0,3134,3243],[0,0,3244,3246],[0,0,3249,3251],[0,0,3254,3257],[0,0,3261,3287],[0,0,3261,3287],[0,0,3289,3292],[0,0,3295,3327],[0,0,3289,3327],[34494,34500,3330,3333],[0,0,3334,3335],[0,0,3330,3336],[0,0,3289,3336],[0,0,3288,3337],[0,0,3340,3371],[0,0,3288,3371],[0,0,3261,3372],[0,0,3375,3377],[0,0,3261,3377],[0,0,3260,3378],[0,0,3254,3378],[0,0,3249,3378],[0,0,3244,3378],[0,0,3244,3380],[0,0,3381,3383],[0,0,3386,3388],[0,0,3391,3394],[0,0,3398,3400],[0,0,3403,3405],[0,0,3398,3405],[0,0,3397,3406],[0,0,3391,3406],[0,0,3386,3406],[0,0,3381,3406],[0,0,3381,3408],[0,0,3409,3411],[0,0,3414,3416],[34610,34623,3419,3458],[0,0,3459,3461],[0,0,3419,3462],[0,0,3466,3468],[0,0,3471,3473],[0,0,3466,3473],[0,0,3465,3474],[0,0,3419,3474],[0,0,3414,3474],[0,0,3409,3474],[0,0,3409,3476],[0,0,3477,3478],[0,0,3481,3482],[0,0,3485,3487],[0,0,3490,3494],[0,0,3485,3494],[0,0,3481,3494],[0,0,3477,3494],[0,0,3477,3496],[0,0,3497,3501],[0,0,3504,3508],[0,0,3511,3549],[0,0,3504,3549],[0,0,3497,3549],[0,0,3497,3551],[0,0,3552,3554],[0,0,3557,3559],[34748,34754,3563,3566],[0,0,3567,3568],[0,0,3563,3569],[0,0,3557,3569],[0,0,3552,3569],[0,0,3552,3571],[0,0,3572,3574],[0,0,3577,3579],[34777,34785,3582,3587],[0,0,3588,3589],[0,0,3582,3590],[0,0,3577,3590],[0,0,3572,3590],[0,0,3572,3592],[0,0,3593,3595],[0,0,3598,3600],[34813,34819,3604,3607],[0,0,3608,3609],[0,0,3604,3610],[0,0,3598,3610],[0,0,3593,3610],[0,0,3593,3612],[0,0,3613,3615],[0,0,3618,3620],[34842,34850,3623,3628],[0,0,3629,3630],[0,0,3623,3631],[0,0,3618,3631],[0,0,3613,3631],[0,0,3613,3633],[0,0,3634,3636],[0,0,3639,3641],[34878,34884,3645,3648],[0,0,3649,3650],[0,0,3645,3651],[0,0,3639,3651],[0,0,3634,3651],[0,0,3634,3653],[0,0,3654,3656],[0,0,3659,3661],[34907,34915,3664,3669],[0,0,3670,3671],[0,0,3664,3672],[0,0,3659,3672],[0,0,3654,3672],[0,0,3654,3674],[0,0,3680,3682],[34939,34947,3686,3691],[0,0,3692,3693],[0,0,3686,3694],[0,0,3679,3695],[0,0,3698,3700],[0,0,3698,3702],[0,0,3698,3704],[0,0,3705,3707],[0,0,3710,3712],[34978,34986,3715,3720],[0,0,3721,3722],[0,0,3715,3723],[0,0,3710,3723],[0,0,3705,3723],[0,0,3705,3725],[0,0,3696,3727],[0,0,3727,3727],[0,0,3675,3727],[0,0,3733,3735],[35011,35019,3739,3744],[0,0,3745,3746],[0,0,3739,3747],[0,0,3732,3748],[0,0,3751,3753],[0,0,3751,3755],[0,0,3751,3757],[0,0,3758,3760],[0,0,3763,3765],[35050,35058,3768,3773],[0,0,3774,3775],[0,0,3768,3776],[0,0,3763,3776],[0,0,3758,3776],[0,0,3758,3778],[0,0,3749,3780],[0,0,3780,3780],[0,0,3728,3780],[0,0,3786,3788],[35083,35091,3792,3797],[0,0,3798,3799],[0,0,3792,3800],[0,0,3785,3801],[0,0,3804,3806],[0,0,3804,3808],[0,0,3804,3810],[0,0,3811,3813],[0,0,3816,3818],[35122,35130,3821,3826],[0,0,3827,3828],[0,0,3821,3829],[0,0,3816,3829],[0,0,3811,3829],[0,0,3811,3831],[0,0,3802,3833],[0,0,3833,3833],[0,0,3781,3833],[0,0,2253,3835],[0,0,2174,3835],[0,0,3842,3843],[0,0,3835,3845],[19421,19436,1624,3849],[0,0,3885,3902],[0,0,3904,3914],[0,0,3938,3951],[0,0,3932,3952],[2976,2984,3955,3960],[0,0,3961,3986],[0,0,3955,3987],[0,0,3932,3987],[0,0,3918,3987],[0,0,3918,3989],[0,0,4005,4018],[0,0,3999,4019],[3026,3034,4022,4027],[3043,3048,4028,4033],[0,0,4034,4039],[0,0,4028,4040],[0,0,4049,4074],[0,0,4043,4075],[0,0,4028,4075],[0,0,4022,4076],[0,0,3999,4076],[0,0,3989,4076],[0,0,3989,4078],[3077,3082,4088,4093],[0,0,4094,4099],[0,0,4088,4100],[0,0,4078,4100],[0,0,4078,4102],[0,0,4112,4135],[0,0,4136,4140],[0,0,4112,4140],[3117,3125,4143,4148],[0,0,4149,4152],[0,0,4143,4153],[0,0,4112,4153],[0,0,4102,4153],[0,0,4102,4155],[3144,3157,4165,4211],[0,0,4217,4218],[0,0,4220,4221],[0,0,4212,4222],[3187,3195,4225,4230],[0,0,4231,4233],[0,0,4225,4234],[0,0,4212,4234],[0,0,4165,4235],[0,0,4155,4235],[0,0,4155,4237],[0,0,4242,4243],[3220,3228,4246,4251],[0,0,4252,4255],[0,0,4246,4256],[0,0,4241,4257],[0,0,4260,4261],[0,0,4264,4265],[0,0,4269,4270],[3271,3279,4273,4278],[0,0,4279,4282],[0,0,4273,4283],[0,0,4269,4283],[0,0,4268,4284],[3289,3297,4287,4292],[0,0,4293,4296],[0,0,4287,4297],[0,0,4268,4297],[0,0,4264,4297],[0,0,4260,4297],[0,0,4260,4299],[0,0,4258,4301],[0,0,4301,4301],[0,0,4237,4301],[0,0,4310,4315],[3353,3359,4323,4326],[0,0,4327,4328],[0,0,4323,4329],[3364,3372,4331,4336],[0,0,4337,4338],[0,0,4331,4339],[3379,3385,4341,4344],[0,0,4345,4346],[0,0,4341,4347],[0,0,4318,4348],[0,0,4310,4348],[0,0,4356,4357],[3418,3424,4366,4369],[0,0,4370,4373],[0,0,4366,4374],[0,0,4360,4375],[0,0,4356,4375],[3441,3446,4377,4382],[0,0,4384,4385],[3467,3473,4394,4397],[0,0,4398,4402],[0,0,4394,4403],[0,0,4388,4404],[0,0,4384,4404],[0,0,4383,4405],[3484,3492,4408,4413],[0,0,4414,4417],[0,0,4408,4418],[0,0,4383,4418],[0,0,4377,4419],[3504,3512,4422,4427],[0,0,4428,4431],[0,0,4422,4432],[0,0,4377,4432],[0,0,4434,4435],[3534,3540,4444,4447],[0,0,4448,4451],[0,0,4444,4452],[0,0,4438,4453],[0,0,4434,4453],[0,0,4351,4454],[0,0,4310,4454],[0,0,4301,4454],[0,0,4301,4456],[0,0,4461,4466],[0,0,4461,4468],[3587,3593,4483,4486],[0,0,4487,4488],[0,0,4483,4489],[0,0,4477,4490],[0,0,4471,4491],[0,0,4460,4492],[0,0,4495,4496],[0,0,4499,4500],[3628,3634,4519,4522],[0,0,4523,4524],[0,0,4519,4525],[3639,3645,4527,4530],[0,0,4531,4532],[0,0,4527,4533],[3650,3656,4535,4538],[0,0,4539,4540],[0,0,4535,4541],[0,0,4513,4542],[0,0,4508,4543],[0,0,4503,4544],[0,0,4499,4544],[0,0,4495,4544],[0,0,4495,4546],[0,0,4493,4548],[0,0,4548,4548],[0,0,4456,4548],[0,0,4555,4556],[0,0,4548,4558],[419,890,3849,4562],[6253,6265,4684,4714],[0,0,4715,4720],[0,0,4721,4734],[0,0,4715,4734],[0,0,4736,4741],[0,0,4742,4750],[0,0,4736,4750],[0,0,4684,4751],[0,0,4664,4751],[0,0,4664,4753],[6302,6312,4753,4807],[0,0,4808,4814],[6324,6330,4816,4819],[0,0,4820,4821],[0,0,4816,4822],[0,0,4824,4836],[0,0,4753,4837],[0,0,4753,4839],[0,0,4839,4845],[0,0,4846,4854],[0,0,4839,4854],[0,0,4857,4890],[0,0,4898,4910],[6419,6425,4912,4915],[0,0,4916,4917],[0,0,4912,4918],[0,0,4893,4919],[0,0,4857,4919],[0,0,4839,4919],[0,0,4839,4921],[2310,2485,4562,4965],[6216,6434,0,4965]]);

__shadeup_gen_shader("shd_44130055067011460160064094000000831006000000", {
					webgl: {},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[]}
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
dummy: vec4<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/

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

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[2230,2239,401,547],[6050,6069,0,547]]);

__shadeup_gen_shader("shd_6700026809507899063930060096151892028000990000", {
					webgl: {_ext_uniform_local_sunViewProjMatrix: {"type":"primitive","name":"float4x4"}, _ext_uniform_global_sqNum: {"type":"primitive","name":"int"}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"}}}, _ext_uniform_global_perlin_octaves: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAPB: {"type":"primitive","name":"int"}, _ext_uniform_global_PI: {"type":"primitive","name":"float"}, _ext_uniform_global_perlin: {"type":"array","element":{"type":"primitive","name":"float"}}, _ext_uniform_global_PERLIN_SIZE: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_YWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_PERLIN_ZWRAP: {"type":"primitive","name":"int"}, _ext_uniform_global_perlin_amp_falloff: {"type":"primitive","name":"float"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["sunViewProjMatrix",{"type":"primitive","name":"float4x4"}]],"globals":[["sqNum",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}]]}}],["perlin_octaves",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAPB",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PI",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}],["perlin",{"fileName":"/_std/common.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float"},"staticSize":1,"access":"read"}}],["PERLIN_SIZE",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_YWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["PERLIN_ZWRAP",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"int"}}],["perlin_amp_falloff",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}]]}
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
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
 @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10663_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
_ext_uniform_local_sunViewProjMatrix: mat4x4<f32>,
@align(16) _ext_uniform_global_sqNum: i32,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
@align(16) _ext_uniform_global_perlin_octaves: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAPB: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAPB: i32,
@align(16) _ext_uniform_global_PI: f32,
@align(16) _ext_uniform_global_perlin_size: i32,
@align(16) _ext_uniform_global_PERLIN_SIZE: i32,
@align(16) _ext_uniform_global_PERLIN_YWRAP: i32,
@align(16) _ext_uniform_global_PERLIN_ZWRAP: i32,
@align(16) _ext_uniform_global_perlin_amp_falloff: f32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read> _ext_uniform_global_perlin: array<f32>;
fn fn_ii_std_common_ts_42195_scaled_cosine(i_const: f32) -> f32 {
var i = i_const;
return f32(0.5) * (f32(1) - cos(i * _in_uniforms._ext_uniform_global_PI));

}

fn fn_ii_std_common_ts_32873_noise_static_perlin2(v_const: vec2<f32>) -> f32 {
var v = v_const;
var x: f32 = v.x;
var y: f32 = v.y;
var z: f32 = f32(0);
if ((x < f32(i32(0)))) 
{
x = -(x);

}
if ((y < f32(i32(0)))) 
{
y = -(y);

}
if ((z < f32(i32(0)))) 
{
z = -(z);

}
var xi: i32 = i32(floor(f32(1.0) * x));
var yi: i32 = i32(floor(f32(1.0) * y));
var zi: i32 = i32(floor(f32(1.0) * z));
var xf: f32 = x - f32(xi);
var yf: f32 = y - f32(yi);
var zf: f32 = z - f32(zi);
var rxf: f32 = f32(0);
var ryf: f32 = f32(0);
var r: f32 = f32(0);
var ampl: f32 = f32(0.5);
var n1: f32 = f32(0);
var n2: f32 = f32(0);
var n3: f32 = f32(0);
for (var o: i32 = i32(0);(o < _in_uniforms._ext_uniform_global_perlin_octaves);o++){
var of1: i32 = xi + (yi << u32(_in_uniforms._ext_uniform_global_PERLIN_YWRAPB)) + (zi << u32(_in_uniforms._ext_uniform_global_PERLIN_ZWRAPB));
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _in_uniforms._ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP) & _in_uniforms._ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _in_uniforms._ext_uniform_global_PERLIN_YWRAP + i32(1)) & _in_uniforms._ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _in_uniforms._ext_uniform_global_perlin_amp_falloff;
;xi = xi << u32(i32(1));
;xf = xf * f32(2);
;yi = yi << u32(i32(1));
;yf = yf * f32(2);
;zi = zi << u32(i32(1));
;zf = zf * f32(2);
;if ((xf >= f32(1))) 
{
xi++;
;xf = xf - f32(1);

}
;if ((yf >= f32(1))) 
{
yi++;
;yf = yf - f32(1);

}
;if ((zf >= f32(1))) 
{
zi++;
;zf = zf - f32(1);

}

}return r;

}

fn fn_iimain_ts_2866_calcPosition(instanceIndex_const: i32, inPos_const: vec3<f32>) -> vec3<f32> {
var instanceIndex = instanceIndex_const;
var inPos = inPos_const;
var yFrac: f32 = f32(instanceIndex) / f32(_in_uniforms._ext_uniform_global_sqNum);
var x: f32 = f32(instanceIndex) - f32(floor(f32(1.0) * yFrac) * f32(_in_uniforms._ext_uniform_global_sqNum));
var y: f32 = floor(f32(1.0) * yFrac);
var t: f32 = _in_uniforms._ext_uniform_global_env.time / f32(200);
var h: f32 = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2<f32>(x, y) / f32(30));
if ((h > f32(0.6))) 
{
h = h + (h - f32(0.6)) * f32(1.5);

}
var p: vec3<f32> = inPos * vec3<f32>(f32(i32(1)), f32(1), f32(i32(1))) + vec3<f32>(x * f32(i32(100)), round((h * f32(i32(3000))) / f32(100)) * f32(100), y * f32(i32(100)));
if ((inPos.y < f32(i32(0)))) 
{
p = p * vec3<f32>(vec3<f32>(vec3<i32>(i32(1), i32(0), i32(1))));

}
return p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _in_uniforms._ext_uniform_local_sunViewProjMatrix * vec4<f32>(fn_iimain_ts_2866_calcPosition(_i_in.instanceIndex, _i_in.position), f32(i32(1)));

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
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
  float time;
//   vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10663_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  return _s;
}
uniform mat4 _ext_uniform_local_sunViewProjMatrix;
uniform int _ext_uniform_global_sqNum;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform int _ext_uniform_global_perlin_octaves;
uniform int _ext_uniform_global_PERLIN_YWRAPB;
uniform int _ext_uniform_global_PERLIN_ZWRAPB;
uniform float _ext_uniform_global_PI;
uniform float[0] _ext_uniform_global_perlin;
uniform int _ext_uniform_global_PERLIN_SIZE;
uniform int _ext_uniform_global_PERLIN_YWRAP;
uniform int _ext_uniform_global_PERLIN_ZWRAP;
uniform float _ext_uniform_global_perlin_amp_falloff;
float fn_ii_std_common_ts_42195_scaled_cosine(float i) {
return float(0.5) * (float(1) - cos(i * _ext_uniform_global_PI));

}

float fn_ii_std_common_ts_32873_noise_static_perlin2(vec2 v) {
float x = v.x;
float y = v.y;
float z = float(0);
if ((x < float(float(int(0))))){
x = -(x);

}if ((y < float(float(int(0))))){
y = -(y);

}if ((z < float(float(int(0))))){
z = -(z);

}int xi = int(floor(x));
int yi = int(floor(y));
int zi = int(floor(z));
float xf = x - float(xi);
float yf = y - float(yi);
float zf = z - float(zi);
float rxf = float(0);
float ryf = float(0);
float r = float(0);
float ampl = float(0.5);
float n1 = float(0);
float n2 = float(0);
float n3 = float(0);
for (int o = int(0);(float(o) < float(_ext_uniform_global_perlin_octaves));o++){
int of1 = xi + (yi << _ext_uniform_global_PERLIN_YWRAPB) + (zi << _ext_uniform_global_PERLIN_ZWRAPB);
;rxf = fn_ii_std_common_ts_42195_scaled_cosine(xf);
;ryf = fn_ii_std_common_ts_42195_scaled_cosine(yf);
;n1 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n1 = n1 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n1);
;n2 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n1 = n1 + ryf * (n2 - n1);
;of1 = of1 + _ext_uniform_global_PERLIN_ZWRAP;
;n2 = _ext_uniform_global_perlin[of1 & _ext_uniform_global_PERLIN_SIZE];
;n2 = n2 + rxf * (_ext_uniform_global_perlin[(of1 + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n2);
;n3 = _ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP) & _ext_uniform_global_PERLIN_SIZE];
;n3 = n3 + rxf * (_ext_uniform_global_perlin[(of1 + _ext_uniform_global_PERLIN_YWRAP + int(1)) & _ext_uniform_global_PERLIN_SIZE] - n3);
;n2 = n2 + ryf * (n3 - n2);
;n1 = n1 + fn_ii_std_common_ts_42195_scaled_cosine(zf) * (n2 - n1);
;r = r + n1 * ampl;
;ampl = ampl * _ext_uniform_global_perlin_amp_falloff;
;xi = xi << int(1);
;xf = xf * float(2);
;yi = yi << int(1);
;yf = yf * float(2);
;zi = zi << int(1);
;zf = zf * float(2);
;if ((xf >= float(1))){
xi++;
;xf = xf - float(1);

};if ((yf >= float(1))){
yi++;
;yf = yf - float(1);

};if ((zf >= float(1))){
zi++;
;zf = zf - float(1);

}
}return r;

}

vec3 fn_iimain_ts_2866_calcPosition(int instanceIndex, vec3 inPos) {
float yFrac = float(instanceIndex) / float(_ext_uniform_global_sqNum);
float x = float(instanceIndex) - float(floor(yFrac) * float(_ext_uniform_global_sqNum));
float y = floor(yFrac);
float t = _ext_uniform_global_env.time / float(200);
float h = fn_ii_std_common_ts_32873_noise_static_perlin2(vec2(x, y) / float(30));
if ((h > float(0.6))){
h = h + (h - float(0.6)) * float(1.5);

}vec3 p = inPos * vec3(int(1), float(1), int(1)) + vec3(x * float(int(100)), round((h * float(int(3000))) / float(100)) * float(100), y * float(int(100)));
if ((inPos.y < float(float(int(0))))){
p = p * vec3(vec3(ivec3(int(1), int(0), int(1))));

}return p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _ext_uniform_local_sunViewProjMatrix * vec4(fn_iimain_ts_2866_calcPosition(_i_in.instanceIndex, _i_in.position), int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[493,510,449,471],[577,589,471,485],[623,642,485,507],[674,685,507,523],[745,792,523,578],[842,898,578,639],[972,1002,639,687],[1007,1043,687,738],[387,1715,401,742],[387,1715,742,922],[5436,5500,922,973],[2721,2834,973,1012],[16316,16333,1012,1084],[41825,41971,1084,1132],[41033,41176,1132,1179],[41356,41499,1179,1226],[1922,2070,1226,1264],[42328,42500,1264,1309],[41679,41819,1309,1354],[41182,41350,1354,1400],[41505,41673,1400,1446],[42006,42168,1446,1500],[0,0,1546,1553],[42257,42265,1564,1569],[0,0,1570,1573],[0,0,1564,1574],[42281,42289,1578,1583],[0,0,1584,1585],[0,0,1578,1586],[42296,42299,1589,1592],[0,0,1593,1594],[0,0,1597,1619],[0,0,1593,1619],[0,0,1589,1620],[0,0,1578,1620],[0,0,1577,1621],[0,0,1564,1621],[0,0,1557,1623],[19720,19799,1500,1627],[0,0,1680,1686],[0,0,1700,1701],[0,0,1700,1703],[0,0,1690,1703],[0,0,1690,1705],[0,0,1715,1716],[0,0,1715,1718],[0,0,1705,1718],[0,0,1705,1720],[32966,32974,1730,1735],[0,0,1736,1737],[0,0,1730,1738],[0,0,1720,1738],[0,0,1720,1740],[0,0,1745,1746],[32995,33001,1761,1764],[0,0,1765,1766],[0,0,1761,1767],[0,0,1755,1768],[0,0,1749,1769],[0,0,1744,1770],[0,0,1773,1774],[0,0,1779,1780],[0,0,1777,1781],[0,0,1773,1781],[0,0,1773,1783],[0,0,1771,1785],[0,0,1785,1785],[0,0,1740,1785],[0,0,1790,1791],[33041,33047,1806,1809],[0,0,1810,1811],[0,0,1806,1812],[0,0,1800,1813],[0,0,1794,1814],[0,0,1789,1815],[0,0,1818,1819],[0,0,1824,1825],[0,0,1822,1826],[0,0,1818,1826],[0,0,1818,1828],[0,0,1816,1830],[0,0,1830,1830],[0,0,1785,1830],[0,0,1835,1836],[33087,33093,1851,1854],[0,0,1855,1856],[0,0,1851,1857],[0,0,1845,1858],[0,0,1839,1859],[0,0,1834,1860],[0,0,1863,1864],[0,0,1869,1870],[0,0,1867,1871],[0,0,1863,1871],[0,0,1863,1873],[0,0,1861,1875],[0,0,1875,1875],[0,0,1830,1875],[33128,33134,1884,1887],[33135,33140,1888,1893],[0,0,1894,1895],[0,0,1888,1896],[0,0,1884,1897],[0,0,1875,1897],[0,0,1875,1899],[33155,33161,1908,1911],[33162,33167,1912,1917],[0,0,1918,1919],[0,0,1912,1920],[0,0,1908,1921],[0,0,1899,1921],[0,0,1899,1923],[33182,33188,1932,1935],[33189,33194,1936,1941],[0,0,1942,1943],[0,0,1936,1944],[0,0,1932,1945],[0,0,1923,1945],[0,0,1923,1947],[0,0,1958,1959],[0,0,1968,1970],[0,0,1962,1971],[0,0,1958,1971],[0,0,1947,1971],[0,0,1947,1973],[0,0,1984,1985],[0,0,1994,1996],[0,0,1988,1997],[0,0,1984,1997],[0,0,1973,1997],[0,0,1973,1999],[0,0,2010,2011],[0,0,2020,2022],[0,0,2014,2023],[0,0,2010,2023],[0,0,1999,2023],[0,0,1999,2025],[33288,33296,2037,2042],[0,0,2043,2044],[0,0,2037,2045],[0,0,2025,2045],[0,0,2025,2047],[33313,33321,2059,2064],[0,0,2065,2066],[0,0,2059,2067],[0,0,2047,2067],[0,0,2047,2069],[33336,33344,2079,2084],[0,0,2085,2086],[0,0,2079,2087],[0,0,2069,2087],[0,0,2069,2089],[33362,33370,2102,2107],[0,0,2108,2111],[0,0,2102,2112],[0,0,2089,2112],[0,0,2089,2114],[33386,33394,2125,2130],[0,0,2131,2132],[0,0,2125,2133],[0,0,2114,2133],[0,0,2114,2135],[33410,33418,2146,2151],[0,0,2152,2153],[0,0,2146,2154],[0,0,2135,2154],[0,0,2135,2156],[33434,33442,2167,2172],[0,0,2173,2174],[0,0,2167,2175],[0,0,2156,2175],[0,0,2156,2177],[33462,33468,2190,2193],[0,0,2194,2195],[0,0,2190,2196],[0,0,2182,2196],[0,0,2204,2205],[0,0,2198,2206],[0,0,2215,2249],[0,0,2209,2250],[0,0,2197,2251],[0,0,2252,2253],[0,0,2252,2255],[0,0,2268,2270],[0,0,2274,2276],[0,0,2280,2313],[0,0,2274,2313],[0,0,2273,2314],[0,0,2268,2314],[0,0,2318,2320],[0,0,2324,2357],[0,0,2318,2357],[0,0,2317,2358],[0,0,2268,2358],[0,0,2258,2358],[0,0,2258,2360],[0,0,2361,2364],[33625,33638,2367,2406],[0,0,2407,2409],[0,0,2367,2410],[0,0,2361,2410],[0,0,2361,2412],[0,0,2413,2416],[33650,33663,2419,2458],[0,0,2459,2461],[0,0,2419,2462],[0,0,2413,2462],[0,0,2413,2464],[0,0,2465,2467],[0,0,2470,2496],[0,0,2470,2496],[0,0,2497,2500],[0,0,2503,2534],[0,0,2497,2534],[0,0,2470,2535],[0,0,2465,2535],[0,0,2465,2537],[0,0,2538,2540],[0,0,2543,2545],[0,0,2548,2551],[0,0,2555,2581],[0,0,2555,2581],[0,0,2583,2586],[33799,33805,2589,2592],[0,0,2593,2594],[0,0,2589,2595],[0,0,2583,2595],[0,0,2582,2596],[0,0,2599,2630],[0,0,2582,2630],[0,0,2555,2631],[0,0,2634,2636],[0,0,2555,2636],[0,0,2554,2637],[0,0,2548,2637],[0,0,2543,2637],[0,0,2538,2637],[0,0,2538,2639],[0,0,2640,2642],[0,0,2645,2671],[0,0,2645,2671],[0,0,2673,2676],[0,0,2679,2711],[0,0,2673,2711],[0,0,2672,2712],[0,0,2715,2746],[0,0,2672,2746],[0,0,2645,2747],[0,0,2640,2747],[0,0,2640,2749],[0,0,2750,2752],[0,0,2755,2757],[0,0,2760,2763],[0,0,2767,2793],[0,0,2767,2793],[0,0,2795,2798],[0,0,2801,2833],[0,0,2795,2833],[34019,34025,2836,2839],[0,0,2840,2841],[0,0,2836,2842],[0,0,2795,2842],[0,0,2794,2843],[0,0,2846,2877],[0,0,2794,2877],[0,0,2767,2878],[0,0,2881,2883],[0,0,2767,2883],[0,0,2766,2884],[0,0,2760,2884],[0,0,2755,2884],[0,0,2750,2884],[0,0,2750,2886],[0,0,2887,2889],[0,0,2892,2894],[0,0,2897,2900],[0,0,2904,2906],[0,0,2909,2911],[0,0,2904,2911],[0,0,2903,2912],[0,0,2897,2912],[0,0,2892,2912],[0,0,2887,2912],[0,0,2887,2914],[0,0,2915,2918],[0,0,2921,2924],[0,0,2927,2959],[0,0,2921,2959],[0,0,2915,2959],[0,0,2915,2961],[0,0,2962,2964],[0,0,2967,2993],[0,0,2967,2993],[0,0,2994,2997],[0,0,3000,3031],[0,0,2994,3031],[0,0,2967,3032],[0,0,2962,3032],[0,0,2962,3034],[0,0,3035,3037],[0,0,3040,3042],[0,0,3045,3048],[0,0,3052,3078],[0,0,3052,3078],[0,0,3080,3083],[34274,34280,3086,3089],[0,0,3090,3091],[0,0,3086,3092],[0,0,3080,3092],[0,0,3079,3093],[0,0,3096,3127],[0,0,3079,3127],[0,0,3052,3128],[0,0,3131,3133],[0,0,3052,3133],[0,0,3051,3134],[0,0,3045,3134],[0,0,3040,3134],[0,0,3035,3134],[0,0,3035,3136],[0,0,3137,3139],[0,0,3142,3168],[0,0,3142,3168],[0,0,3170,3173],[0,0,3176,3208],[0,0,3170,3208],[0,0,3169,3209],[0,0,3212,3243],[0,0,3169,3243],[0,0,3142,3244],[0,0,3137,3244],[0,0,3137,3246],[0,0,3247,3249],[0,0,3252,3254],[0,0,3257,3260],[0,0,3264,3290],[0,0,3264,3290],[0,0,3292,3295],[0,0,3298,3330],[0,0,3292,3330],[34494,34500,3333,3336],[0,0,3337,3338],[0,0,3333,3339],[0,0,3292,3339],[0,0,3291,3340],[0,0,3343,3374],[0,0,3291,3374],[0,0,3264,3375],[0,0,3378,3380],[0,0,3264,3380],[0,0,3263,3381],[0,0,3257,3381],[0,0,3252,3381],[0,0,3247,3381],[0,0,3247,3383],[0,0,3384,3386],[0,0,3389,3391],[0,0,3394,3397],[0,0,3401,3403],[0,0,3406,3408],[0,0,3401,3408],[0,0,3400,3409],[0,0,3394,3409],[0,0,3389,3409],[0,0,3384,3409],[0,0,3384,3411],[0,0,3412,3414],[0,0,3417,3419],[34610,34623,3422,3461],[0,0,3462,3464],[0,0,3422,3465],[0,0,3469,3471],[0,0,3474,3476],[0,0,3469,3476],[0,0,3468,3477],[0,0,3422,3477],[0,0,3417,3477],[0,0,3412,3477],[0,0,3412,3479],[0,0,3480,3481],[0,0,3484,3485],[0,0,3488,3490],[0,0,3493,3497],[0,0,3488,3497],[0,0,3484,3497],[0,0,3480,3497],[0,0,3480,3499],[0,0,3500,3504],[0,0,3507,3511],[0,0,3514,3552],[0,0,3507,3552],[0,0,3500,3552],[0,0,3500,3554],[0,0,3555,3557],[0,0,3560,3562],[34748,34754,3566,3569],[0,0,3570,3571],[0,0,3566,3572],[0,0,3560,3572],[0,0,3555,3572],[0,0,3555,3574],[0,0,3575,3577],[0,0,3580,3582],[34777,34785,3585,3590],[0,0,3591,3592],[0,0,3585,3593],[0,0,3580,3593],[0,0,3575,3593],[0,0,3575,3595],[0,0,3596,3598],[0,0,3601,3603],[34813,34819,3607,3610],[0,0,3611,3612],[0,0,3607,3613],[0,0,3601,3613],[0,0,3596,3613],[0,0,3596,3615],[0,0,3616,3618],[0,0,3621,3623],[34842,34850,3626,3631],[0,0,3632,3633],[0,0,3626,3634],[0,0,3621,3634],[0,0,3616,3634],[0,0,3616,3636],[0,0,3637,3639],[0,0,3642,3644],[34878,34884,3648,3651],[0,0,3652,3653],[0,0,3648,3654],[0,0,3642,3654],[0,0,3637,3654],[0,0,3637,3656],[0,0,3657,3659],[0,0,3662,3664],[34907,34915,3667,3672],[0,0,3673,3674],[0,0,3667,3675],[0,0,3662,3675],[0,0,3657,3675],[0,0,3657,3677],[0,0,3683,3685],[34939,34947,3689,3694],[0,0,3695,3696],[0,0,3689,3697],[0,0,3682,3698],[0,0,3701,3703],[0,0,3701,3705],[0,0,3701,3707],[0,0,3708,3710],[0,0,3713,3715],[34978,34986,3718,3723],[0,0,3724,3725],[0,0,3718,3726],[0,0,3713,3726],[0,0,3708,3726],[0,0,3708,3728],[0,0,3699,3730],[0,0,3730,3730],[0,0,3678,3730],[0,0,3736,3738],[35011,35019,3742,3747],[0,0,3748,3749],[0,0,3742,3750],[0,0,3735,3751],[0,0,3754,3756],[0,0,3754,3758],[0,0,3754,3760],[0,0,3761,3763],[0,0,3766,3768],[35050,35058,3771,3776],[0,0,3777,3778],[0,0,3771,3779],[0,0,3766,3779],[0,0,3761,3779],[0,0,3761,3781],[0,0,3752,3783],[0,0,3783,3783],[0,0,3731,3783],[0,0,3789,3791],[35083,35091,3795,3800],[0,0,3801,3802],[0,0,3795,3803],[0,0,3788,3804],[0,0,3807,3809],[0,0,3807,3811],[0,0,3807,3813],[0,0,3814,3816],[0,0,3819,3821],[35122,35130,3824,3829],[0,0,3830,3831],[0,0,3824,3832],[0,0,3819,3832],[0,0,3814,3832],[0,0,3814,3834],[0,0,3805,3836],[0,0,3836,3836],[0,0,3784,3836],[0,0,2256,3838],[0,0,2177,3838],[0,0,3845,3846],[0,0,3838,3848],[19421,19436,1627,3852],[0,0,3888,3905],[0,0,3907,3917],[0,0,3941,3954],[0,0,3935,3955],[2976,2984,3958,3963],[0,0,3964,3989],[0,0,3958,3990],[0,0,3935,3990],[0,0,3921,3990],[0,0,3921,3992],[0,0,4008,4021],[0,0,4002,4022],[3026,3034,4025,4030],[3043,3048,4031,4036],[0,0,4037,4042],[0,0,4031,4043],[0,0,4052,4077],[0,0,4046,4078],[0,0,4031,4078],[0,0,4025,4079],[0,0,4002,4079],[0,0,3992,4079],[0,0,3992,4081],[3077,3082,4091,4096],[0,0,4097,4102],[0,0,4091,4103],[0,0,4081,4103],[0,0,4081,4105],[0,0,4115,4138],[0,0,4139,4143],[0,0,4115,4143],[3117,3125,4146,4151],[0,0,4152,4155],[0,0,4146,4156],[0,0,4115,4156],[0,0,4105,4156],[0,0,4105,4158],[3144,3157,4168,4214],[0,0,4220,4221],[0,0,4223,4224],[0,0,4215,4225],[3187,3195,4228,4233],[0,0,4234,4236],[0,0,4228,4237],[0,0,4215,4237],[0,0,4168,4238],[0,0,4158,4238],[0,0,4158,4240],[0,0,4245,4246],[3220,3228,4249,4254],[0,0,4255,4258],[0,0,4249,4259],[0,0,4244,4260],[0,0,4263,4264],[0,0,4267,4268],[0,0,4272,4273],[3271,3279,4276,4281],[0,0,4282,4285],[0,0,4276,4286],[0,0,4272,4286],[0,0,4271,4287],[3289,3297,4290,4295],[0,0,4296,4299],[0,0,4290,4300],[0,0,4271,4300],[0,0,4267,4300],[0,0,4263,4300],[0,0,4263,4302],[0,0,4261,4304],[0,0,4304,4304],[0,0,4240,4304],[0,0,4313,4318],[3353,3359,4326,4329],[0,0,4330,4331],[0,0,4326,4332],[3364,3372,4334,4339],[0,0,4340,4341],[0,0,4334,4342],[3379,3385,4344,4347],[0,0,4348,4349],[0,0,4344,4350],[0,0,4321,4351],[0,0,4313,4351],[0,0,4359,4360],[3418,3424,4369,4372],[0,0,4373,4376],[0,0,4369,4377],[0,0,4363,4378],[0,0,4359,4378],[3441,3446,4380,4385],[0,0,4387,4388],[3467,3473,4397,4400],[0,0,4401,4405],[0,0,4397,4406],[0,0,4391,4407],[0,0,4387,4407],[0,0,4386,4408],[3484,3492,4411,4416],[0,0,4417,4420],[0,0,4411,4421],[0,0,4386,4421],[0,0,4380,4422],[3504,3512,4425,4430],[0,0,4431,4434],[0,0,4425,4435],[0,0,4380,4435],[0,0,4437,4438],[3534,3540,4447,4450],[0,0,4451,4454],[0,0,4447,4455],[0,0,4441,4456],[0,0,4437,4456],[0,0,4354,4457],[0,0,4313,4457],[0,0,4304,4457],[0,0,4304,4459],[0,0,4464,4469],[0,0,4464,4471],[3587,3593,4486,4489],[0,0,4490,4491],[0,0,4486,4492],[0,0,4480,4493],[0,0,4474,4494],[0,0,4463,4495],[0,0,4498,4499],[0,0,4502,4503],[3628,3634,4522,4525],[0,0,4526,4527],[0,0,4522,4528],[3639,3645,4530,4533],[0,0,4534,4535],[0,0,4530,4536],[3650,3656,4538,4541],[0,0,4542,4543],[0,0,4538,4544],[0,0,4516,4545],[0,0,4511,4546],[0,0,4506,4547],[0,0,4502,4547],[0,0,4498,4547],[0,0,4498,4549],[0,0,4496,4551],[0,0,4551,4551],[0,0,4459,4551],[0,0,4558,4559],[0,0,4551,4561],[419,890,3852,4565],[0,0,4667,4673],[0,0,4674,4682],[0,0,4667,4682],[0,0,4685,4721],[5875,5887,4729,4759],[0,0,4760,4765],[0,0,4766,4779],[0,0,4760,4779],[0,0,4781,4786],[0,0,4787,4795],[0,0,4781,4795],[0,0,4729,4796],[5924,5930,4798,4801],[0,0,4802,4803],[0,0,4798,4804],[0,0,4724,4805],[0,0,4685,4805],[0,0,4667,4805],[0,0,4667,4807],[2113,2215,4565,4851],[5799,5939,0,4851]]);

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
    exports.main = void 0;
    __ = __importStar(__);
    var globalVarGet = std___std_all_1.globalVarGet;
    env.configureCamera({ spinning: false, orbitDistance: (10000 | 0), orbitTarget: __.intifyVector(__.makeVector((5000 | 0), (0 | 0), (5000 | 0))) });
    var shadowMapSize = ((0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "shadowMapSize", function () { return (8192 | 0); }, function () { return shadowMapSize; }) | 0);
    var albedo = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "albedo", function () { return (0, common_1.texture2d)(env.screenSize, "16bit", "float4"); }, function () { return albedo; });
    var normal = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "normal", function () { return (0, common_1.texture2d)(env.screenSize, "16bit", "float4"); }, function () { return normal; });
    var shadow = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "shadow", function () { var _a; return (0, common_1.texture2d)((_a = shadowMapSize, [_a, _a]), "depth-32", "float"); }, function () { return shadow; });
    var num = ((0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "num", function () { return (30000 | 0); }, function () { return num; }) | 0);
    var m = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "m", function () { var _a, _b; return mesh_1.mesh.box((_a = (0 | 0), [_a, _a, _a]), (_b = (100 | 0), [_b, _b, _b])); }, function () { return m; });
    var sqNum = ((0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "sqNum", function () { return Math.floor(Math.sqrt(num)); }, function () { return sqNum; }) | 0);
    num = sqNum * sqNum;
    function calcPosition(instanceIndex, inPos) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var yFrac = instanceIndex / sqNum;
        var x = instanceIndex - __.mul(Math.floor(yFrac), sqNum);
        var y = Math.floor(yFrac);
        var t = env.time / 200.0;
        var h = common_1.noise.perlin2((_a = __.makeVector(x, y), _b = 30.0, [_a[0] / _b, _a[1] / _b]));
        if (h > 0.6) {
            h = h + (h - 0.6) * 1.5;
        }
        var p = (_c = (_e = inPos, _f = __.makeVector((1 | 0), 1.0, (1 | 0)), [_e[0] * _f[0], _e[1] * _f[1], _e[2] * _f[2]]), _d = __.makeVector(x * (100 | 0), Math.round((h * (3000 | 0)) / 100.0) * 100.0, y * (100 | 0)), [_c[0] + _d[0], _c[1] + _d[1], _c[2] + _d[2]]);
        if (inPos[1] < (0 | 0)) {
            p = (_g = p, _h = __.intifyVector(__.makeVector((1 | 0), (0 | 0), (1 | 0))), [_g[0] * _h[0], _g[1] * _h[1], _g[2] * _h[2]]);
        }
        return p;
    }
    function calcColor(instanceIndex, inNormal) {
        var _a, _b, _c, _d, _e;
        var yFrac = instanceIndex / sqNum;
        var x = instanceIndex - __.mul(Math.floor(yFrac), sqNum);
        var y = Math.floor(yFrac);
        var h = common_1.noise.perlin2((_a = __.makeVector(x, y), _b = 30.0, [_a[0] / _b, _a[1] / _b]));
        var c = __.makeVector(0.0, (0 | 0), (1 | 0), (1 | 0));
        if (h > 0.2) {
            c = __.makeVector(0.9, 0.7, 0.7, (1 | 0));
        }
        if (h > 0.25) {
            c = __.makeVector(0.1, 0.7, 0.1, (1 | 0));
        }
        if (h > 0.6) {
            c = __.makeVector(0.6, 0.6, 0.6, (1 | 0));
        }
        if (h > 0.7) {
            c = __.makeVector(0.9, 0.9, 0.9, (1 | 0));
        }
        return _c = __.makeVector((_e = (((1 | 0) + (0, std_math_1.dot)(inNormal, __.intifyVector(__.makeVector((0 | 0), (1 | 0), (0 | 0))))) / 2.0), [_e, _e, _e]), (1 | 0)), _d = c, [_c[0] * _d[0], _c[1] * _d[1], _c[2] * _d[2], _c[3] * _d[3]];
    }
    var sunDist = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "sunDist", function () { return 39.0; }, function () { return sunDist; });
    var sunAngle = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "sunAngle", function () { return common_1.PI / (4 | 0); }, function () { return sunAngle; });
    function main() {
        var _this = this;
        var _a, _b, _c;
        common_1.ui.label("Sun angle");
        //sunAngle = ui::slider(sunAngle, 0, PI * 2);
        var sun = (_a = __.FM.float_3_1_1_1(__.mul(Math.cos(sunAngle), (500 | 0)), __.int(300), __.mul(Math.sin(sunAngle), (500 | 0))), _b = sunDist, [_a[0] * _b, _a[1] * _b, _a[2] * _b]);
        env.camera.near = 20.0;
        env.camera.far = 200000.0;
        var sunProjectionMatrix = common_1.matrix.perspective(90.0, 1.0, env.camera.near, env.camera.far);
        var sunViewMatrix = common_1.matrix.lookAt(sun, (_c = (0 | 0), [_c, _c, _c]), __.makeVector((0 | 0), 1.0, (0 | 0)));
        var sunViewProjMatrix = __.mul(sunProjectionMatrix, sunViewMatrix);
        var viewProjMatrix = __.mul(env.camera.getPerspectiveMatrix(), env.camera.getWorldToViewMatrix());
        var t = env.time;
        (0, drawIndexed_1.drawAdvanced)({ mesh: m, depth: shadow, depthOnly: true, instances: num, vertex: __shadeup_make_shader_inst("shd_6700026809507899063930060096151892028000990000", { _ext_uniform_local_sunViewProjMatrix: sunViewProjMatrix, _ext_uniform_global_sqNum: globalVarGet("_slash_main_dot_ts", "sqNum"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env"), _ext_uniform_global_perlin_octaves: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_octaves"), _ext_uniform_global_PERLIN_YWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAPB"), _ext_uniform_global_PERLIN_ZWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAPB"), _ext_uniform_global_PI: globalVarGet("_slash__std_slash_common_dot_ts", "PI"), _ext_uniform_global_perlin: globalVarGet("_slash__std_slash_common_dot_ts", "perlin"), _ext_uniform_global_PERLIN_SIZE: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_SIZE"), _ext_uniform_global_PERLIN_YWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAP"), _ext_uniform_global_PERLIN_ZWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAP"), _ext_uniform_global_perlin_amp_falloff: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_amp_falloff") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_d) {
                    __out.position = __.mul(sunViewProjMatrix, __.makeVector(calcPosition(__in.instanceIndex, __in.position), (1 | 0)));
                    return [2 /*return*/];
                });
            }); }), fragment: __shadeup_make_shader_inst("shd_44130055067011460160064094000000831006000000", {}, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_d) {
                return [2 /*return*/];
            }); }); }) });
        (0, drawIndexed_1.drawAdvanced)({ mesh: m, instances: num, vertex: __shadeup_make_shader_inst("shd_00006405900710000000088000759302300086039", { _ext_uniform_local_viewProjMatrix: viewProjMatrix, _ext_uniform_global_sqNum: globalVarGet("_slash_main_dot_ts", "sqNum"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env"), _ext_uniform_global_perlin_octaves: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_octaves"), _ext_uniform_global_PERLIN_YWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAPB"), _ext_uniform_global_PERLIN_ZWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAPB"), _ext_uniform_global_PI: globalVarGet("_slash__std_slash_common_dot_ts", "PI"), _ext_uniform_global_perlin: globalVarGet("_slash__std_slash_common_dot_ts", "perlin"), _ext_uniform_global_PERLIN_SIZE: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_SIZE"), _ext_uniform_global_PERLIN_YWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAP"), _ext_uniform_global_PERLIN_ZWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAP"), _ext_uniform_global_perlin_amp_falloff: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_amp_falloff") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                var realPosition;
                return __generator(this, function (_d) {
                    realPosition = calcPosition(__in.instanceIndex, __in.position);
                    __out.attr((0 | 0), realPosition);
                    __out.position = __.mul(viewProjMatrix, __.makeVector(realPosition, (1 | 0)));
                    return [2 /*return*/];
                });
            }); }), fragment: __shadeup_make_shader_inst("shd_468600940132506707176461900000000951000670000", { _ext_uniform_local_sunViewProjMatrix: sunViewProjMatrix, _ext_uniform_local_sun: sun, _ext_uniform_global_shadowMapSize: globalVarGet("_slash_main_dot_ts", "shadowMapSize"), _ext_uniform_global_shadow: globalVarGet("_slash_main_dot_ts", "shadow"), _ext_uniform_global_sqNum: globalVarGet("_slash_main_dot_ts", "sqNum"), _ext_uniform_global_perlin_octaves: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_octaves"), _ext_uniform_global_PERLIN_YWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAPB"), _ext_uniform_global_PERLIN_ZWRAPB: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAPB"), _ext_uniform_global_PI: globalVarGet("_slash__std_slash_common_dot_ts", "PI"), _ext_uniform_global_perlin: globalVarGet("_slash__std_slash_common_dot_ts", "perlin"), _ext_uniform_global_PERLIN_SIZE: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_SIZE"), _ext_uniform_global_PERLIN_YWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_YWRAP"), _ext_uniform_global_PERLIN_ZWRAP: globalVarGet("_slash__std_slash_common_dot_ts", "PERLIN_ZWRAP"), _ext_uniform_global_perlin_amp_falloff: globalVarGet("_slash__std_slash_common_dot_ts", "perlin_amp_falloff") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                var realPosition, posFromLight, shadowPos, visibility, y, x, offset, sampVal, compVal, lambertFactor, lightingFactor;
                var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                return __generator(this, function (_x) {
                    realPosition = __in.attr((0 | 0));
                    posFromLight = __.mul(sunViewProjMatrix, __.makeVector(realPosition, 1.0));
                    posFromLight = (_d = posFromLight, _e = posFromLight[3], [_d[0] / _e, _d[1] / _e, _d[2] / _e, _d[3] / _e]);
                    shadowPos = __.makeVector((_f = (_h = (_k = posFromLight, [_k[0], _k[1]]), _j = __.makeVector(0.5, (__.FM.negate_1(0.5))), [_h[0] * _j[0], _h[1] * _j[1]]), _g = (_l = 0.5, [_l, _l]), [_f[0] + _g[0], _f[1] + _g[1]]), posFromLight[2]);
                    visibility = 0.0;
                    for (y = (__.FM.negate_1((1 | 0))); y <= (1 | 0); y++) {
                        for (x = (__.FM.negate_1((1 | 0))); x <= (1 | 0); x++) {
                            offset = (_m = __.FM.float_2_1_1(x, y), _o = (1.0 / shadowMapSize), [_m[0] * _o, _m[1] * _o]);
                            sampVal = shadow.sample((_p = (_r = shadowPos, [_r[0], _r[1]]), _q = offset, [_p[0] + _q[0], _p[1] + _q[1]]))[0];
                            compVal = shadowPos[2] - 0.000003;
                            visibility = visibility + (compVal < sampVal ? (1 | 0) : (0 | 0));
                        }
                    }
                    visibility = visibility / 9.0;
                    lambertFactor = (0, std_math_1.max)((0, std_math_1.dot)((0, std_math_1.normalize)((_s = sun, _t = __in.position, [_s[0] - _t[0], _s[1] - _t[1], _s[2] - _t[2]])), __in.normal), 0.0);
                    lightingFactor = (0, std_math_1.min)(0.2 + visibility * lambertFactor, 1.0);
                    return [2 /*return*/, __.makeVector((_u = (_v = calcColor(__in.instanceIndex, __in.normal), _w = lightingFactor, [_v[0] * _w, _v[1] * _w, _v[2] * _w, _v[3] * _w]), [_u[0], _u[1], _u[2]]), (1 | 0))];
                });
            }); }) });
        (0, drawIndexed_1.draw)(__shadeup_make_shader_inst("shd_026080640000000011000000097066000024020", {}, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_d) {
                return [2 /*return*/];
            });
        }); }));
        albedo.clear();
        normal.clear();
        shadow.clear();
    }
    exports.main = main;
});

})(define);

});
