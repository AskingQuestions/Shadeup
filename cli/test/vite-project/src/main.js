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
	let define = (deps, func) => defineFunc("/logoPath.js", deps, func);
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
define(["require", "exports", "/std_math", "/std___std_all"], function (require, exports, __, std___std_all_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logoPath2 = exports.logoPath = void 0;
    __ = __importStar(__);
    var globalVarGet = std___std_all_1.globalVarGet;
    exports.logoPath = [__.makeVector(331.8819682214535, 309.37499982761074), __.makeVector(371.32282194357356, 303.64633707500263), __.makeVector(407.46032126878504, 286.8163539059281), __.makeVector(437.274252663429, 260.35535066551427), __.makeVector(458.29984831576394, 226.50580234284354), __.makeVector(468.7136104513537, 188.03532791839726), __.makeVector(467.7118086191006, 148.17574354216006), __.makeVector(455.35191297112505, 110.29043620450224), __.makeVector(432.6263207130228, 77.53229396479205), __.makeVector(401.5178156140271, 52.615834986960536), __.makeVector(364.58359174118056, 37.654862578958394), __.makeVector(324.8932794340484, 33.92378272686386), __.makeVector(285.7795001390052, 41.64769023829373), __.makeVector(250.56380617643717, 60.281665182363334), __.makeVector(222.1106045175098, 88.2185302598852), __.makeVector(202.82739785088438, 123.09151777807875), __.makeVector(194.38489856271633, 162.05350582157), __.makeVector(197.38939677012752, 201.79863233626673), __.makeVector(211.66487429790584, 239.00609777264683), __.makeVector(236.00990811938493, 270.56874343985766), __.makeVector(268.34764758612255, 293.8916209452305), __.makeVector(305.99793844636343, 306.94940550263783)];
    ;
    exports.logoPath2 = [__.makeVector(451.87140094230557, 602.1619078110434), __.makeVector(486.29251847854266, 622.2323459015123), __.makeVector(525.0474675157033, 631.5641981376127), __.makeVector(564.852311019554, 629.356639856118), __.makeVector(602.3248780708933, 615.8045994091574), __.makeVector(634.3309736404595, 592.0422272891796), __.makeVector(658.1539457850712, 560.0779291620549), __.makeVector(671.7748167680887, 522.6324487372781), __.makeVector(674.0564197042156, 482.83741996002925), __.makeVector(664.802513049373, 444.0747441577281), __.makeVector(644.7848636535293, 409.5942420839993), __.makeVector(615.7020857431386, 382.3322773053413), __.makeVector(580.0140772066509, 364.5860070980618), __.makeVector(540.7286331849546, 357.84918467153614), __.makeVector(501.165415783651, 362.6925101786735), __.makeVector(464.6647081529237, 378.70718806257287), __.makeVector(432.3072593603389, 402.199889140537), __.makeVector(398.2575592626505, 423.1228910326879), __.makeVector(360.9127940340042, 437.14799612337356), __.makeVector(321.174878646251, 438.4183448188125), __.makeVector(283.2521603337715, 426.1623983366661), __.makeVector(248.70900986328027, 406.05151673315385), __.makeVector(216.43777559524344, 382.4456871602924), __.makeVector(180.8200178325316, 364.5371472183075), __.makeVector(141.5630951779306, 357.6283420525193), __.makeVector(101.9834477806449, 362.29764865112304), __.makeVector(65.40326447164699, 378.15686103433126), __.makeVector(34.94644591589244, 403.8478116568671), __.makeVector(13.153800354272045, 437.21996187233935), __.makeVector(1.8759296978847086, 475.4505834586918), __.makeVector(2.066709423006884, 515.3093933970973), __.makeVector(13.710149187603491, 553.4309022236707), __.makeVector(35.820909042632074, 586.5925166847115), __.makeVector(66.5392314406395, 612.0011914315223), __.makeVector(103.252336820272, 627.4988351532799), __.makeVector(142.8763750292417, 631.7887844293851), __.makeVector(182.0634692296343, 624.5048369401586), __.makeVector(217.51107280796145, 606.2551520383203), __.makeVector(249.81667583724186, 582.6938662902708), __.makeVector(284.49393762749804, 562.8132021128339), __.makeVector(322.56195677111145, 551.0072036701465), __.makeVector(362.2746942768097, 552.8769284491539), __.makeVector(399.45542942085626, 567.3067293377287), __.makeVector(433.38932465259774, 588.460027547873)];
    ;
});

})(define);


((defineFunc) => {
	let define = (deps, func) => defineFunc("/main.js", deps, func);
	__shadeup_gen_shader("shd_00890360012200000000600490212005400000", {
					webgl: {_ext_uniform_local_instances: {"type":"primitive","name":"int"}, _ext_uniform_local_numTargets: {"type":"primitive","name":"int"}, _ext_uniform_global_tex: {"type":"primitive","name":"texture2d"}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"screenSize":{"type":"primitive","name":"float2"}}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["instances",{"type":"primitive","name":"int"}],["numTargets",{"type":"primitive","name":"int"}]],"globals":[["tex",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"sample"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["screenSize",{"type":"primitive","name":"float2"}]]}}]]}
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
//  @align(16)  time: f32,
 @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  screenSize: vec2<f32>,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.screenSize = screenSize;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_instances: i32,
@align(16) _ext_uniform_local_numTargets: i32,
@align(16) _ext_uniform_global_tex_size: vec2<f32>,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var _ext_uniform_global_tex_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_tex: sampler;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var c: vec4<f32> = textureSample(_ext_uniform_global_tex_texture, _ext_uniform_global_tex, vec2(_i_in.uv));
var sc: vec2<f32> = _i_in.uv * _in_uniforms._ext_uniform_global_env.screenSize;
var fac: f32 = f32(1);
fac = fac * ((f32(_i_in.instanceIndex) / f32(_in_uniforms._ext_uniform_local_instances))) / f32(2);
if ((c.r < c.b * f32(0.6))) 
{
fac = f32(0);

}
if ((_in_uniforms._ext_uniform_local_numTargets > i32(0))) 
{
fac = f32(0);

}
if ((_i_in.instanceIndex == _in_uniforms._ext_uniform_local_instances - i32(1))) 
{
fac = f32(1);

}
_i_out.color = c * fac;

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
//   float time;
  vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(vec2 screenSize) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.screenSize = screenSize;
  return _s;
}
uniform sampler2D _ext_uniform_global_tex;
uniform vec2 _ext_uniform_global_tex_size;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform int _ext_uniform_local_instances;
uniform int _ext_uniform_local_numTargets;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
vec4 c = texture(_ext_uniform_global_tex, vec2(_i_in.uv));
vec2 sc = _i_in.uv * _ext_uniform_global_env.screenSize;
float fac = float(1);
fac = fac * ((float(_i_in.instanceIndex) / float(_ext_uniform_local_instances))) / float(2);
if ((c.r < c.b * float(0.6))){
fac = float(0);

}if ((float(_ext_uniform_local_numTargets) > float(int(0)))){
fac = float(0);

}if ((_i_in.instanceIndex == _ext_uniform_local_instances - int(1))){
fac = float(1);

}_i_out.color = c * fac;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[493,510,449,471],[577,589,471,488],[623,642,488,507],[674,685,507,523],[745,792,523,578],[842,898,578,639],[972,1002,639,687],[1007,1043,687,738],[387,1715,401,742],[387,1715,742,939],[3753,3898,939,982],[3753,3898,982,1025],[16316,16333,1025,1097],[19083,19104,1097,1139],[7751,7777,1139,1182],[0,0,1301,1324],[0,0,1331,1336],[0,0,1337,1339],[0,0,1331,1339],[0,0,1293,1341],[0,0,1284,1341],[0,0,1284,1343],[0,0,1353,1358],[0,0,1359,1361],[0,0,1353,1361],[0,0,1364,1387],[0,0,1388,1398],[0,0,1364,1398],[0,0,1353,1398],[0,0,1343,1398],[0,0,1343,1400],[19666,19674,1412,1417],[0,0,1418,1419],[0,0,1412,1420],[0,0,1400,1420],[0,0,1400,1422],[0,0,1422,1425],[0,0,1428,1431],[0,0,1442,1447],[0,0,1448,1461],[0,0,1442,1461],[0,0,1436,1462],[19835,19843,1465,1470],[0,0,1471,1499],[0,0,1465,1500],[0,0,1436,1500],[0,0,1435,1501],[0,0,1434,1502],[19860,19868,1505,1510],[0,0,1511,1512],[0,0,1505,1513],[0,0,1434,1513],[0,0,1428,1513],[0,0,1422,1513],[0,0,1422,1515],[0,0,1520,1521],[0,0,1520,1523],[0,0,1526,1527],[0,0,1526,1529],[19937,19945,1532,1537],[0,0,1538,1541],[0,0,1532,1542],[0,0,1526,1542],[0,0,1519,1543],[0,0,1546,1549],[19962,19970,1552,1557],[0,0,1558,1559],[0,0,1552,1560],[0,0,1546,1560],[0,0,1546,1562],[0,0,1544,1564],[0,0,1564,1564],[0,0,1515,1564],[0,0,1575,1604],[0,0,1569,1605],[20001,20007,1614,1617],[0,0,1618,1619],[0,0,1614,1620],[0,0,1608,1621],[0,0,1568,1622],[0,0,1625,1628],[20020,20028,1631,1636],[0,0,1637,1638],[0,0,1631,1639],[0,0,1625,1639],[0,0,1625,1641],[0,0,1623,1643],[0,0,1643,1643],[0,0,1564,1643],[0,0,1648,1653],[0,0,1654,1667],[0,0,1648,1667],[0,0,1671,1699],[20086,20092,1702,1705],[0,0,1706,1707],[0,0,1702,1708],[0,0,1671,1708],[0,0,1647,1709],[0,0,1712,1715],[20107,20115,1718,1723],[0,0,1724,1725],[0,0,1718,1726],[0,0,1712,1726],[0,0,1712,1728],[0,0,1710,1730],[0,0,1730,1730],[0,0,1643,1730],[0,0,1730,1736],[0,0,1737,1742],[0,0,1730,1742],[0,0,1745,1746],[0,0,1749,1752],[0,0,1745,1752],[0,0,1730,1752],[0,0,1730,1754],[9794,10285,1182,1798],[19565,20186,0,1798]]);

__shadeup_gen_shader("shd_06000000951000000000000780140000900940", {
					webgl: {_ext_uniform_local_mat: {"type":"primitive","name":"float4x4"}, _ext_uniform_local_instances: {"type":"primitive","name":"int"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["mat",{"type":"primitive","name":"float4x4"}],["instances",{"type":"primitive","name":"int"}]],"globals":[]}
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
_ext_uniform_local_mat: mat4x4<f32>,
@align(16) _ext_uniform_local_instances: i32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _in_uniforms._ext_uniform_local_mat * vec4<f32>(_i_in.position + vec3<f32>(f32(i32(0)), f32(i32(0)), -((f32(50))) * f32(((_in_uniforms._ext_uniform_local_instances - i32(1)) - _i_in.instanceIndex))), f32(i32(1)));

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
uniform mat4 _ext_uniform_local_mat;
uniform int _ext_uniform_local_instances;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _ext_uniform_local_mat * vec4(_i_in.position + vec3(int(0), int(0), -((float(50))) * float(((_ext_uniform_local_instances - int(1)) - _i_in.instanceIndex))), int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[18138,18167,401,438],[19083,19104,438,480],[0,0,582,588],[0,0,589,597],[0,0,582,597],[0,0,600,622],[0,0,630,635],[0,0,636,644],[0,0,630,644],[19325,19331,652,655],[0,0,656,657],[0,0,652,658],[19336,19342,660,663],[0,0,664,665],[0,0,660,666],[19366,19374,671,676],[0,0,677,679],[0,0,671,680],[0,0,670,681],[0,0,668,682],[0,0,693,721],[19413,19419,724,727],[0,0,728,729],[0,0,724,730],[0,0,693,730],[0,0,692,731],[0,0,734,739],[0,0,740,753],[0,0,734,753],[0,0,692,753],[0,0,691,754],[0,0,685,755],[0,0,668,755],[0,0,647,756],[0,0,630,756],[19455,19461,758,761],[0,0,762,763],[0,0,758,764],[0,0,625,765],[0,0,600,765],[0,0,582,765],[0,0,582,767],[9681,9792,480,811],[19226,19470,0,811]]);

__shadeup_gen_shader("shd_0045010050110268436008600090058007300880000", {
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
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[9435,9515,401,547],[18780,18863,0,547]]);

__shadeup_gen_shader("shd_070320052000028790087932500120013360204818950", {
					webgl: {_ext_uniform_local_mat: {"type":"primitive","name":"float4x4"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["mat",{"type":"primitive","name":"float4x4"}]],"globals":[]}
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
_ext_uniform_local_mat: mat4x4<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _in_uniforms._ext_uniform_local_mat * vec4<f32>(_i_in.position, f32(i32(1)));

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
uniform mat4 _ext_uniform_local_mat;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_i_out.position = _ext_uniform_local_mat * vec4(_i_in.position, int(1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[18138,18167,401,438],[0,0,540,546],[0,0,547,555],[0,0,540,555],[0,0,558,580],[0,0,588,593],[0,0,594,602],[0,0,588,602],[18665,18671,604,607],[0,0,608,609],[0,0,604,610],[0,0,583,611],[0,0,558,611],[0,0,540,611],[0,0,540,613],[9379,9433,438,657],[18588,18680,0,657]]);

__shadeup_gen_shader("shd_0005900044000151533001000000860800600000", {
					webgl: {_ext_uniform_local_overrideColor: {"type":"primitive","name":"float4"}, _ext_uniform_global_particles: {"type":"array","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":{"position":{"type":"primitive","name":"float2"},"angle":{"type":"primitive","name":"float"},"velocity":{"type":"primitive","name":"float"},"age":{"type":"primitive","name":"float"},"alive":{"type":"primitive","name":"int"},"goal":{"type":"primitive","name":"float"},"timeline":{"type":"primitive","name":"float"}}}}, _ext_uniform_global_tex2: {"type":"primitive","name":"texture2d"}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"screenSize":{"type":"primitive","name":"float2"}}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["overrideColor",{"type":"primitive","name":"float4"}]],"globals":[["particles",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":[["position",{"type":"primitive","name":"float2"}],["angle",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["age",{"type":"primitive","name":"float"}],["alive",{"type":"primitive","name":"int"}],["goal",{"type":"primitive","name":"float"}],["timeline",{"type":"primitive","name":"float"}]]},"staticSize":1,"access":"read"}}],["tex2",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"sample"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["screenSize",{"type":"primitive","name":"float2"}]]}}]]}
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
struct str_i_main_ts_2739_Particle {
 @align(16)  position: vec2<f32>,
 @align(16)  angle: f32,
 @align(16)  velocity: f32,
 @align(16)  age: f32,
 @align(16)  alive: i32,
 @align(16)  goal: f32,
 @align(16)  timeline: f32,

};
fn _make_struct_str_i_main_ts_2739_Particle(  age: f32,  alive: i32,  angle: f32,  goal: f32,  position: vec2<f32>,  timeline: f32,  velocity: f32,) -> str_i_main_ts_2739_Particle {
var _s: str_i_main_ts_2739_Particle;
  _s.age = age;
  _s.alive = alive;
  _s.angle = angle;
  _s.goal = goal;
  _s.position = position;
  _s.timeline = timeline;
  _s.velocity = velocity;

return _s; 
}
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
//  @align(16)  time: f32,
 @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  screenSize: vec2<f32>,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.screenSize = screenSize;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_overrideColor: vec4<f32>,
@align(16) _ext_uniform_global_particles_size: i32,
@align(16) _ext_uniform_global_tex2_size: vec2<f32>,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read> _ext_uniform_global_particles: array<str_i_main_ts_2739_Particle>;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_tex2_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(4) var _ext_uniform_global_tex2: sampler;
fn fn_iistd_math_ts_40366_rand(seed_const: f32) -> f32 {
var seed = seed_const;
if (0 == 0) 
{
return fract(sin(seed * f32(91.3458)) * f32(47453.5453));

}
else 
{
return 0.0;

}

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var p: str_i_main_ts_2739_Particle = _ext_uniform_global_particles[_i_in.instanceIndex];
var c1: vec4<f32> = vec4<f32>(f32(0.2), f32(0.3), f32(0.6), f32(i32(1)));
var c2: vec4<f32> = vec4<f32>(f32(0.6), f32(0.2), f32(0.9), f32(i32(1)));
var c: vec4<f32> = mix(c1, c2, min(p.age / f32(5), fn_iistd_math_ts_40366_rand(f32(_i_in.instanceIndex) / f32(10526)) * f32(i32(2))));
if ((length(_in_uniforms._ext_uniform_local_overrideColor) > f32(0.01))) 
{
c = mix(c1, _in_uniforms._ext_uniform_local_overrideColor, p.age / f32(3));

}
var base: vec4<f32> = textureSample(_ext_uniform_global_tex2_texture, _ext_uniform_global_tex2, vec2(_i_in.screen / _in_uniforms._ext_uniform_global_env.screenSize));
_i_out.attachment0 = vec4<f32>(base.xyz / f32(1.5) + c.xyz, base.w + f32(0.1));

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
struct str_i_main_ts_2739_Particle {
//   vec2 position;
//   float angle;
//   float velocity;
  float age;
//   int alive;
//   float goal;
//   float timeline;

};
str_i_main_ts_2739_Particle _make_struct_str_i_main_ts_2739_Particle(float age) {
str_i_main_ts_2739_Particle _s;  _s.age = age;
  return _s;
}
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
//   float time;
  vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(vec2 screenSize) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.screenSize = screenSize;
  return _s;
}
uniform str_i_main_ts_2739_Particle[0] _ext_uniform_global_particles;
uniform vec4 _ext_uniform_local_overrideColor;
uniform sampler2D _ext_uniform_global_tex2;
uniform vec2 _ext_uniform_global_tex2_size;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
float fn_iistd_math_ts_40366_rand(float seed) {
if (0 == 0){
return fract(sin(seed * float(91.3458)) * float(47453.5453));

}else 
{
return 0.0;

}

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
str_i_main_ts_2739_Particle p = _ext_uniform_global_particles[_i_in.instanceIndex];
vec4 c1 = vec4(float(0.2), float(0.3), float(0.6), int(1));
vec4 c2 = vec4(float(0.6), float(0.2), float(0.9), int(1));
vec4 c = mix(c1, c2, min(p.age / float(5), fn_iistd_math_ts_40366_rand(float(_i_in.instanceIndex) / float(10526)) * float(int(2))));
if ((length(_ext_uniform_local_overrideColor) > float(0.01))){
c = mix(c1, _ext_uniform_local_overrideColor, p.age / float(3));

}vec4 base = texture(_ext_uniform_global_tex2, vec2(_i_in.screen / _ext_uniform_global_env.screenSize));
_i_out.attachment0 = vec4(base.xyz / float(1.5) + c.xyz, base.w + float(0.1));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[3283,3310,321,341],[3312,3335,341,359],[3337,3363,359,380],[3365,3386,380,393],[3388,3409,393,409],[3411,3433,409,426],[3435,3461,426,447],[2739,3748,284,451],[2739,3748,451,595],[493,510,643,665],[577,589,665,682],[623,642,682,701],[674,685,701,717],[745,792,717,772],[842,898,772,833],[972,1002,833,881],[1007,1043,881,932],[387,1715,595,936],[387,1715,936,1133],[4058,4231,1133,1203],[7641,7745,1203,1250],[3904,4052,1250,1294],[3904,4052,1294,1338],[16316,16333,1338,1410],[0,0,1444,1454],[0,0,1462,1463],[0,0,1467,1468],[0,0,1462,1468],[40454,40458,1478,1483],[40463,40466,1484,1487],[0,0,1488,1492],[40477,40482,1495,1500],[0,0,1501,1508],[0,0,1495,1509],[0,0,1488,1509],[0,0,1484,1510],[40495,40500,1513,1518],[0,0,1519,1529],[0,0,1513,1530],[0,0,1484,1530],[0,0,1478,1531],[0,0,1471,1533],[0,0,1469,1535],[0,0,1550,1553],[0,0,1543,1555],[0,0,1541,1557],[0,0,1535,1558],[0,0,1458,1558],[0,0,1410,1562],[0,0,1696,1725],[0,0,1696,1725],[0,0,1726,1731],[0,0,1732,1745],[0,0,1726,1745],[0,0,1696,1746],[0,0,1664,1746],[0,0,1664,1748],[17055,17063,1763,1768],[0,0,1769,1772],[0,0,1763,1773],[17070,17078,1775,1780],[0,0,1781,1784],[0,0,1775,1785],[17085,17093,1787,1792],[0,0,1793,1796],[0,0,1787,1797],[17100,17106,1799,1802],[0,0,1803,1804],[0,0,1799,1805],[0,0,1758,1806],[0,0,1748,1806],[0,0,1748,1808],[17135,17143,1823,1828],[0,0,1829,1832],[0,0,1823,1833],[17150,17158,1835,1840],[0,0,1841,1844],[0,0,1835,1845],[17165,17173,1847,1852],[0,0,1853,1856],[0,0,1847,1857],[17180,17186,1859,1862],[0,0,1863,1864],[0,0,1859,1865],[0,0,1818,1866],[0,0,1808,1866],[0,0,1808,1868],[17200,17204,1877,1880],[0,0,1881,1883],[0,0,1885,1887],[17213,17216,1889,1892],[0,0,1893,1894],[0,0,1895,1898],[0,0,1893,1898],[17232,17240,1901,1906],[0,0,1907,1908],[0,0,1901,1909],[0,0,1893,1909],[17257,17261,1911,1938],[0,0,1945,1950],[0,0,1951,1964],[0,0,1945,1964],[0,0,1939,1965],[17290,17298,1968,1973],[0,0,1974,1979],[0,0,1968,1980],[0,0,1939,1980],[0,0,1911,1981],[17312,17318,1990,1993],[0,0,1994,1995],[0,0,1990,1996],[0,0,1984,1997],[0,0,1911,1997],[0,0,1889,1998],[0,0,1877,1999],[0,0,1868,1999],[0,0,1868,2001],[17338,17344,2006,2012],[0,0,2013,2045],[0,0,2006,2046],[17361,17369,2049,2054],[0,0,2055,2059],[0,0,2049,2060],[0,0,2005,2061],[0,0,2064,2065],[17383,17387,2068,2071],[0,0,2072,2074],[0,0,2076,2108],[0,0,2110,2111],[0,0,2112,2115],[0,0,2110,2115],[17422,17430,2118,2123],[0,0,2124,2125],[0,0,2118,2126],[0,0,2110,2126],[0,0,2068,2127],[0,0,2064,2127],[0,0,2064,2129],[0,0,2062,2131],[0,0,2131,2131],[0,0,2001,2131],[0,0,2151,2175],[0,0,2182,2187],[0,0,2188,2194],[0,0,2182,2194],[0,0,2197,2220],[0,0,2221,2231],[0,0,2197,2231],[0,0,2182,2231],[0,0,2143,2233],[0,0,2131,2233],[0,0,2131,2235],[0,0,2235,2241],[0,0,2242,2253],[0,0,2235,2253],[0,0,2261,2265],[0,0,2261,2269],[17579,17587,2272,2277],[0,0,2278,2281],[0,0,2272,2282],[0,0,2261,2282],[0,0,2285,2286],[0,0,2285,2290],[0,0,2261,2290],[0,0,2292,2296],[0,0,2292,2298],[17651,17659,2301,2306],[0,0,2307,2310],[0,0,2301,2311],[0,0,2292,2311],[0,0,2256,2312],[0,0,2235,2312],[0,0,2235,2314],[8482,8907,1562,2358],[16967,17670,0,2358]]);

__shadeup_gen_shader("shd_00821606432096000132571910900898440480000000", {
					webgl: {_ext_uniform_local_scroll: {"type":"primitive","name":"float"}, _ext_uniform_global_particles: {"type":"array","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":{"position":{"type":"primitive","name":"float2"},"angle":{"type":"primitive","name":"float"},"velocity":{"type":"primitive","name":"float"},"age":{"type":"primitive","name":"float"},"alive":{"type":"primitive","name":"int"},"goal":{"type":"primitive","name":"float"},"timeline":{"type":"primitive","name":"float"}}}}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"screenSize":{"type":"primitive","name":"float2"}}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["scroll",{"type":"primitive","name":"float"}]],"globals":[["particles",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":[["position",{"type":"primitive","name":"float2"}],["angle",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["age",{"type":"primitive","name":"float"}],["alive",{"type":"primitive","name":"int"}],["goal",{"type":"primitive","name":"float"}],["timeline",{"type":"primitive","name":"float"}]]},"staticSize":1,"access":"read"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["screenSize",{"type":"primitive","name":"float2"}]]}}]]}
				}, {webgpu: `fn shadeup_up_swizzle_xxxx_i32(n: i32) -> vec4<i32>{
	return vec4<i32>(n, n, n, n);
}

fn shadeup_up_swizzle_xy_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
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
struct str_i_main_ts_2739_Particle {
 @align(16)  position: vec2<f32>,
 @align(16)  angle: f32,
 @align(16)  velocity: f32,
 @align(16)  age: f32,
 @align(16)  alive: i32,
 @align(16)  goal: f32,
 @align(16)  timeline: f32,

};
fn _make_struct_str_i_main_ts_2739_Particle(  age: f32,  alive: i32,  angle: f32,  goal: f32,  position: vec2<f32>,  timeline: f32,  velocity: f32,) -> str_i_main_ts_2739_Particle {
var _s: str_i_main_ts_2739_Particle;
  _s.age = age;
  _s.alive = alive;
  _s.angle = angle;
  _s.goal = goal;
  _s.position = position;
  _s.timeline = timeline;
  _s.velocity = velocity;

return _s; 
}
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
//  @align(16)  time: f32,
 @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  screenSize: vec2<f32>,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.screenSize = screenSize;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_scroll: f32,
@align(16) _ext_uniform_global_particles_size: i32,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read> _ext_uniform_global_particles: array<str_i_main_ts_2739_Particle>;
fn fn_ii_std_common_ts_1512_pixelToClip(pixelPosition_const: vec2<f32>) -> vec2<f32> {
var pixelPosition = pixelPosition_const;
var zeroToOne: vec2<f32> = pixelPosition / _in_uniforms._ext_uniform_global_env.screenSize;
var zeroToTwo: vec2<f32> = zeroToOne * f32(2);
var clipSpace: vec2<f32> = zeroToTwo - shadeup_up_swizzle_xy_f32(f32(1));
return vec2<f32>(clipSpace.x, clipSpace.y * -(f32(1)));

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var p: str_i_main_ts_2739_Particle = _ext_uniform_global_particles[_i_in.instanceIndex];
if ((p.alive == i32(0))) 
{
_i_out.position = vec4f(shadeup_up_swizzle_xxxx_i32(i32(0)));

}
else 
{
var mat: mat2x2<f32> = mat2x2<f32>(cos(p.angle), sin(-(p.angle)), sin(p.angle), cos(p.angle));
;_i_out.position = vec4<f32>(fn_ii_std_common_ts_1512_pixelToClip((p.position + vec2<f32>(f32(i32(0)), -(_in_uniforms._ext_uniform_local_scroll))) + _i_in.position.xy * mat), f32(i32(0)), f32(i32(1)));

}

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

vec2 shadeup_up_swizzle_xy_float(float n) {
	return vec2(n, n);
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
struct str_i_main_ts_2739_Particle {
  vec2 position;
  float angle;
//   float velocity;
//   float age;
  int alive;
//   float goal;
//   float timeline;

};
str_i_main_ts_2739_Particle _make_struct_str_i_main_ts_2739_Particle(vec2 position, float angle, int alive) {
str_i_main_ts_2739_Particle _s;  _s.position = position;
  _s.angle = angle;
  _s.alive = alive;
  return _s;
}
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
//   float time;
  vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(vec2 screenSize) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.screenSize = screenSize;
  return _s;
}
uniform str_i_main_ts_2739_Particle[0] _ext_uniform_global_particles;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform float _ext_uniform_local_scroll;
vec2 fn_ii_std_common_ts_1512_pixelToClip(vec2 pixelPosition) {
vec2 zeroToOne = pixelPosition / _ext_uniform_global_env.screenSize;
vec2 zeroToTwo = zeroToOne * float(2);
vec2 clipSpace = zeroToTwo - shadeup_up_swizzle_xy_float(float(1));
return vec2(clipSpace.x, clipSpace.y * -(float(1)));

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
str_i_main_ts_2739_Particle p = _ext_uniform_global_particles[_i_in.instanceIndex];
if ((p.alive == int(0))){
_i_out.position = vec4(shadeup_up_swizzle_xxxx_int(int(0)));

}else 
{
mat2 mat = mat2(cos(p.angle), sin(-(p.angle)), sin(p.angle), cos(p.angle));
;_i_out.position = vec4(fn_ii_std_common_ts_1512_pixelToClip((p.position + vec2(int(0), -(_ext_uniform_local_scroll))) + _i_in.position.xy * mat), int(0), int(1));

}

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[3283,3310,438,455],[3312,3335,455,470],[3337,3363,470,491],[3365,3386,491,507],[3388,3409,507,520],[3411,3433,520,537],[3435,3461,537,558],[2739,3748,401,562],[2739,3748,562,784],[493,510,832,854],[577,589,854,871],[623,642,871,890],[674,685,890,906],[745,792,906,961],[842,898,961,1022],[972,1002,1022,1070],[1007,1043,1070,1121],[387,1715,784,1125],[387,1715,1125,1322],[4058,4231,1322,1392],[16316,16333,1392,1464],[7462,7505,1464,1505],[0,0,1547,1565],[0,0,1586,1599],[0,0,1602,1625],[0,0,1626,1636],[0,0,1602,1636],[0,0,1586,1636],[0,0,1569,1636],[0,0,1569,1638],[0,0,1655,1664],[1670,1678,1667,1672],[0,0,1673,1674],[0,0,1667,1675],[0,0,1655,1675],[0,0,1638,1675],[0,0,1638,1677],[0,0,1694,1703],[1733,1741,1734,1739],[0,0,1740,1741],[0,0,1734,1742],[0,0,1706,1743],[0,0,1694,1743],[0,0,1677,1743],[0,0,1677,1745],[0,0,1757,1766],[0,0,1757,1768],[0,0,1770,1779],[0,0,1770,1781],[1852,1860,1786,1791],[0,0,1792,1793],[0,0,1786,1794],[0,0,1784,1795],[0,0,1770,1795],[0,0,1752,1796],[0,0,1745,1798],[231,466,1505,1802],[0,0,1936,1965],[0,0,1936,1965],[0,0,1966,1971],[0,0,1972,1985],[0,0,1966,1985],[0,0,1936,1986],[0,0,1904,1986],[0,0,1904,1988],[0,0,1993,1994],[0,0,1995,2000],[0,0,1993,2000],[16504,16510,2004,2007],[0,0,2008,2009],[0,0,2004,2010],[0,0,1992,2011],[0,0,2014,2020],[0,0,2021,2029],[0,0,2014,2029],[16545,16551,2065,2068],[0,0,2069,2070],[0,0,2065,2071],[0,0,2037,2072],[0,0,2014,2073],[0,0,2014,2075],[0,0,2012,2077],[16595,16598,2101,2104],[0,0,2105,2106],[0,0,2107,2112],[0,0,2105,2112],[0,0,2101,2113],[16609,16612,2115,2118],[0,0,2121,2122],[0,0,2123,2128],[0,0,2121,2128],[0,0,2119,2129],[0,0,2115,2130],[16634,16637,2132,2135],[0,0,2136,2137],[0,0,2138,2143],[0,0,2136,2143],[0,0,2132,2144],[16648,16651,2146,2149],[0,0,2150,2151],[0,0,2152,2157],[0,0,2150,2157],[0,0,2146,2158],[0,0,2096,2159],[0,0,2085,2159],[0,0,2085,2161],[0,0,2162,2168],[0,0,2169,2177],[0,0,2162,2177],[16694,16705,2185,2221],[0,0,2223,2224],[0,0,2225,2233],[0,0,2223,2233],[16749,16755,2241,2244],[0,0,2245,2246],[0,0,2241,2247],[0,0,2251,2276],[0,0,2249,2277],[0,0,2236,2278],[0,0,2223,2278],[0,0,2222,2279],[0,0,2282,2287],[0,0,2288,2296],[0,0,2282,2296],[0,0,2282,2299],[0,0,2302,2305],[0,0,2282,2305],[0,0,2222,2305],[0,0,2185,2306],[16834,16840,2308,2311],[0,0,2312,2313],[0,0,2308,2314],[16845,16851,2316,2319],[0,0,2320,2321],[0,0,2316,2322],[0,0,2180,2323],[0,0,2162,2323],[0,0,2162,2325],[0,0,2083,2327],[0,0,2077,2328],[0,0,1988,2328],[8150,8467,1802,2372],[16419,16860,0,2372]]);

__shadeup_gen_shader("shd_6900259035000093023000000095000000001196", {
					webgl: {_ext_uniform_local_scroll: {"type":"primitive","name":"float"}, _ext_uniform_local_deltaTime: {"type":"primitive","name":"float"}, _ext_uniform_global_tex2: {"type":"primitive","name":"texture2d"}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"}}}, _ext_uniform_global_PI: {"type":"primitive","name":"float"}, _ext_uniform_global_lastScroll: {"type":"primitive","name":"float"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["scroll",{"type":"primitive","name":"float"}],["deltaTime",{"type":"primitive","name":"float"}]],"globals":[["tex2",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"sample"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}]]}}],["PI",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}],["lastScroll",{"fileName":"/main.ts","structure":{"type":"primitive","name":"float"}}]]}
				}, {webgpu: `fn shadeup_up_swizzle_xy_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
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
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
 @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_scroll: f32,
@align(16) _ext_uniform_local_deltaTime: f32,
@align(16) _ext_uniform_global_tex2_size: vec2<f32>,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
@align(16) _ext_uniform_global_PI: f32,
@align(16) _ext_uniform_global_lastScroll: f32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var _ext_uniform_global_tex2_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_tex2: sampler;
fn fn_iistd_math_ts_40366_rand(seed_const: f32) -> f32 {
var seed = seed_const;
if (0 == 0) 
{
return fract(sin(seed * f32(91.3458)) * f32(47453.5453));

}
else 
{
return 0.0;

}

}

fn fn_iistd_math_ts_40744_rand2(seed_const: vec2<f32>) -> f32 {
var seed = seed_const;
return fract(sin(dot(seed, vec2<f32>(12.9898, 4.1414))) * f32(43758.5453));

}

fn fn_iistd_math_ts_41039_rand3(seed_const: vec3<f32>) -> f32 {
var seed = seed_const;
return fn_iistd_math_ts_40744_rand2(seed.xy + fn_iistd_math_ts_40366_rand(seed.z));

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var pixelDist: vec2<f32> = (shadeup_up_swizzle_xy_f32(f32(1)) / vec2<f32>(textureDimensions(_ext_uniform_global_tex2_texture)));
var angle: f32 = fn_iistd_math_ts_41039_rand3(vec3<f32>(_i_in.screen, _in_uniforms._ext_uniform_global_env.time)) * _in_uniforms._ext_uniform_global_PI * f32(i32(2));
var dir: vec2<f32> = vec2<f32>(cos(angle), sin(angle));
var off: vec2<f32> = vec2<f32>(f32(i32(0)), (_in_uniforms._ext_uniform_local_scroll - _in_uniforms._ext_uniform_global_lastScroll)) * pixelDist;
var val1: vec4<f32> = textureSample(_ext_uniform_global_tex2_texture, _ext_uniform_global_tex2, vec2(_i_in.uv + off + dir * pixelDist));
var val2: vec4<f32> = textureSample(_ext_uniform_global_tex2_texture, _ext_uniform_global_tex2, vec2(_i_in.uv + off));
_i_out.color = ((val1 + val2) / f32(2)) * (f32(1) - _in_uniforms._ext_uniform_local_deltaTime * f32(8));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`vec2 shadeup_up_swizzle_xy_float(float n) {
	return vec2(n, n);
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
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
  float time;
//   vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  return _s;
}
uniform sampler2D _ext_uniform_global_tex2;
uniform vec2 _ext_uniform_global_tex2_size;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform float _ext_uniform_global_PI;
uniform float _ext_uniform_local_scroll;
uniform float _ext_uniform_global_lastScroll;
uniform float _ext_uniform_local_deltaTime;
float fn_iistd_math_ts_40366_rand(float seed) {
if (0 == 0){
return fract(sin(seed * float(91.3458)) * float(47453.5453));

}else 
{
return 0.0;

}

}

float fn_iistd_math_ts_40744_rand2(vec2 seed) {
return fract(sin(dot(seed, vec2(12.9898, 4.1414))) * float(43758.5453));

}

float fn_iistd_math_ts_41039_rand3(vec3 seed) {
return fn_iistd_math_ts_40744_rand2(seed.xy + fn_iistd_math_ts_40366_rand(seed.z));

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
vec2 pixelDist = (shadeup_up_swizzle_xy_float(float(1)) / _ext_uniform_global_tex2_size);
float angle = fn_iistd_math_ts_41039_rand3(vec3(_i_in.screen, _ext_uniform_global_env.time)) * _ext_uniform_global_PI * float(int(2));
vec2 dir = vec2(cos(angle), sin(angle));
vec2 off = vec2(int(0), (_ext_uniform_local_scroll - _ext_uniform_global_lastScroll)) * pixelDist;
vec4 val1 = texture(_ext_uniform_global_tex2, vec2(_i_in.uv + off + dir * pixelDist));
vec4 val2 = texture(_ext_uniform_global_tex2, vec2(_i_in.uv + off));
_i_out.color = ((val1 + val2) / float(2)) * (float(1) - _ext_uniform_local_deltaTime * float(8));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[493,510,449,471],[577,589,471,485],[623,642,485,507],[674,685,507,523],[745,792,523,578],[842,898,578,639],[972,1002,639,687],[1007,1043,687,738],[387,1715,401,742],[387,1715,742,922],[3904,4052,922,966],[3904,4052,966,1010],[16316,16333,1010,1082],[1922,2070,1082,1120],[7462,7505,1120,1161],[6952,7077,1161,1207],[7264,7289,1207,1251],[0,0,1285,1295],[0,0,1303,1304],[0,0,1308,1309],[0,0,1303,1309],[40454,40458,1319,1324],[40463,40466,1325,1328],[0,0,1329,1333],[40477,40482,1336,1341],[0,0,1342,1349],[0,0,1336,1350],[0,0,1329,1350],[0,0,1325,1351],[40495,40500,1354,1359],[0,0,1360,1370],[0,0,1354,1371],[0,0,1325,1371],[0,0,1319,1372],[0,0,1312,1374],[0,0,1310,1376],[0,0,1391,1394],[0,0,1384,1396],[0,0,1382,1398],[0,0,1376,1399],[0,0,1299,1399],[0,0,1251,1403],[0,0,1438,1447],[40798,40802,1458,1463],[40807,40810,1464,1467],[40811,40814,1468,1471],[0,0,1472,1476],[0,0,1483,1490],[0,0,1492,1498],[0,0,1478,1499],[0,0,1468,1500],[0,0,1464,1501],[40848,40853,1504,1509],[0,0,1510,1520],[0,0,1504,1521],[0,0,1464,1521],[0,0,1458,1522],[0,0,1451,1524],[0,0,1403,1528],[0,0,1563,1572],[41093,41098,1583,1611],[0,0,1612,1616],[0,0,1612,1619],[41124,41128,1622,1649],[0,0,1650,1654],[0,0,1650,1656],[0,0,1622,1657],[0,0,1612,1657],[0,0,1583,1658],[0,0,1576,1660],[0,0,1528,1664],[15533,15541,1812,1817],[0,0,1818,1819],[0,0,1812,1820],[0,0,1784,1821],[0,0,1824,1848],[0,0,1824,1853],[0,0,1784,1853],[0,0,1783,1854],[0,0,1766,1854],[0,0,1766,1856],[15597,15602,1870,1898],[0,0,1904,1909],[0,0,1910,1916],[0,0,1904,1916],[0,0,1918,1941],[0,0,1942,1946],[0,0,1918,1946],[0,0,1899,1947],[0,0,1870,1948],[0,0,1951,1973],[0,0,1870,1973],[15648,15654,1982,1985],[0,0,1986,1987],[0,0,1982,1988],[0,0,1976,1989],[0,0,1870,1989],[0,0,1856,1989],[0,0,1856,1991],[15685,15688,2007,2010],[0,0,2011,2016],[0,0,2007,2017],[15697,15700,2019,2022],[0,0,2023,2028],[0,0,2019,2029],[0,0,2002,2030],[0,0,1991,2030],[0,0,1991,2032],[15742,15748,2048,2051],[0,0,2052,2053],[0,0,2048,2054],[0,0,2057,2082],[0,0,2085,2115],[0,0,2057,2115],[0,0,2056,2116],[0,0,2043,2117],[0,0,2120,2129],[0,0,2043,2129],[0,0,2032,2129],[0,0,2032,2131],[0,0,2151,2175],[0,0,2182,2187],[0,0,2188,2190],[0,0,2182,2190],[0,0,2193,2196],[0,0,2182,2196],[0,0,2199,2202],[0,0,2205,2214],[0,0,2199,2214],[0,0,2182,2214],[0,0,2143,2216],[0,0,2131,2216],[0,0,2131,2218],[0,0,2238,2262],[0,0,2269,2274],[0,0,2275,2277],[0,0,2269,2277],[0,0,2280,2283],[0,0,2269,2283],[0,0,2230,2285],[0,0,2218,2285],[0,0,2218,2287],[0,0,2287,2293],[0,0,2294,2299],[0,0,2287,2299],[0,0,2304,2308],[0,0,2311,2315],[0,0,2304,2315],[0,0,2303,2316],[15986,15994,2319,2324],[0,0,2325,2326],[0,0,2319,2327],[0,0,2303,2327],[0,0,2302,2328],[16013,16021,2332,2337],[0,0,2338,2339],[0,0,2332,2340],[0,0,2343,2371],[16047,16055,2374,2379],[0,0,2380,2381],[0,0,2374,2382],[0,0,2343,2382],[0,0,2332,2382],[0,0,2331,2383],[0,0,2302,2383],[0,0,2287,2383],[0,0,2287,2385],[7567,7999,1664,2429],[15479,16131,0,2429]]);

__shadeup_gen_shader("shd_08708500520000900005000007802065008012", {
					webgl: {_ext_uniform_local_numTargets: {"type":"primitive","name":"int"}, _ext_uniform_local_scroll: {"type":"primitive","name":"float"}, _ext_uniform_local_deltaTime: {"type":"primitive","name":"float"}, _ext_uniform_local_mouse: {"type":"primitive","name":"float2"}, _ext_uniform_global_particles: {"type":"array","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":{"position":{"type":"primitive","name":"float2"},"angle":{"type":"primitive","name":"float"},"velocity":{"type":"primitive","name":"float"},"age":{"type":"primitive","name":"float"},"alive":{"type":"primitive","name":"int"},"goal":{"type":"primitive","name":"float"},"timeline":{"type":"primitive","name":"float"}}}}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"},"screenSize":{"type":"primitive","name":"float2"}}}, _ext_uniform_global_logoBuf: {"type":"array","element":{"type":"primitive","name":"float2"}}, _ext_uniform_global_logoBuf2: {"type":"array","element":{"type":"primitive","name":"float2"}}, _ext_uniform_global_targetsBuf: {"type":"array","element":{"type":"primitive","name":"float2"}}, _ext_uniform_global_numLogoPoints2: {"type":"primitive","name":"int"}, _ext_uniform_global_numLogoPoints: {"type":"primitive","name":"int"}, _ext_uniform_global_deathNear: {"type":"primitive","name":"float"}, _ext_uniform_global_deadCounter: {"type":"array","element":{"type":"primitive","name":"atomic"}}, _ext_uniform_global_dead: {"type":"array","element":{"type":"primitive","name":"uint"}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["numTargets",{"type":"primitive","name":"int"}],["scroll",{"type":"primitive","name":"float"}],["deltaTime",{"type":"primitive","name":"float"}],["mouse",{"type":"primitive","name":"float2"}]],"globals":[["particles",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":[["position",{"type":"primitive","name":"float2"}],["angle",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["age",{"type":"primitive","name":"float"}],["alive",{"type":"primitive","name":"int"}],["goal",{"type":"primitive","name":"float"}],["timeline",{"type":"primitive","name":"float"}]]},"staticSize":1,"access":"write"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}],["screenSize",{"type":"primitive","name":"float2"}]]}}],["logoBuf",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float2"},"staticSize":1,"access":"read"}}],["logoBuf2",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float2"},"staticSize":1,"access":"read"}}],["targetsBuf",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"float2"},"staticSize":1,"access":"read"}}],["numLogoPoints2",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["numLogoPoints",{"fileName":"/main.ts","structure":{"type":"primitive","name":"int"}}],["deathNear",{"fileName":"/main.ts","structure":{"type":"primitive","name":"float"}}],["deadCounter",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"atomic","element":"i32"},"staticSize":1,"access":"write"}}],["dead",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"uint"},"staticSize":1,"access":"write"}}]]}
				}, {webgpu: `fn shadeup_up_swizzle_xx_f32(n: f32) -> vec2<f32>{
	return vec2<f32>(n, n);
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
struct str_i_main_ts_2739_Particle {
 @align(16)  position: vec2<f32>,
 @align(16)  angle: f32,
 @align(16)  velocity: f32,
 @align(16)  age: f32,
 @align(16)  alive: i32,
 @align(16)  goal: f32,
 @align(16)  timeline: f32,

};
fn _make_struct_str_i_main_ts_2739_Particle(  age: f32,  alive: i32,  angle: f32,  goal: f32,  position: vec2<f32>,  timeline: f32,  velocity: f32,) -> str_i_main_ts_2739_Particle {
var _s: str_i_main_ts_2739_Particle;
  _s.age = age;
  _s.alive = alive;
  _s.angle = angle;
  _s.goal = goal;
  _s.position = position;
  _s.timeline = timeline;
  _s.velocity = velocity;

return _s; 
}
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
 @align(16)  time: f32,
 @align(16)  screenSize: vec2<f32>,
//  @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  screenSize: vec2<f32>,  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.screenSize = screenSize;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_numTargets: i32,
@align(16) _ext_uniform_local_scroll: f32,
@align(16) _ext_uniform_local_deltaTime: f32,
@align(16) _ext_uniform_local_mouse: vec2<f32>,
@align(16) _ext_uniform_global_particles_size: i32,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
@align(16) _ext_uniform_global_logoBuf_size: i32,
@align(16) _ext_uniform_global_logoBuf2_size: i32,
@align(16) _ext_uniform_global_targetsBuf_size: i32,
@align(16) _ext_uniform_global_numLogoPoints2: i32,
@align(16) _ext_uniform_global_numLogoPoints: i32,
@align(16) _ext_uniform_global_deathNear: f32,
@align(16) _ext_uniform_global_deadCounter_size: i32,
@align(16) _ext_uniform_global_dead_size: i32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read_write> _ext_uniform_global_particles: array<str_i_main_ts_2739_Particle>;
@group(%GROUP_INDEX%) @binding(3) var<storage, read> _ext_uniform_global_logoBuf: array<vec2<f32>>;
@group(%GROUP_INDEX%) @binding(4) var<storage, read> _ext_uniform_global_logoBuf2: array<vec2<f32>>;
@group(%GROUP_INDEX%) @binding(5) var<storage, read> _ext_uniform_global_targetsBuf: array<vec2<f32>>;
@group(%GROUP_INDEX%) @binding(6) var<storage, read_write> _ext_uniform_global_deadCounter: array<atomic<i32>>;
@group(%GROUP_INDEX%) @binding(7) var<storage, read_write> _ext_uniform_global_dead: array<u32>;
fn fn_iistd_math_ts_40744_rand2(seed_const: vec2<f32>) -> f32 {
var seed = seed_const;
return fract(sin(dot(seed, vec2<f32>(12.9898, 4.1414))) * f32(43758.5453));

}

fn fn_iimain_ts_6579_lerpAngle(a_const: f32, b_const: f32, t_const: f32) -> f32 {
var a = a_const;
var b = b_const;
var t = t_const;
var av: vec2<f32> = vec2<f32>(cos(a), sin(a));
var bv: vec2<f32> = vec2<f32>(cos(b), sin(b));
var cv: vec2<f32> = normalize(mix(av, bv, t));
return atan2(cv.y, cv.x);

}

fn fn_iistd_math_ts_39781_wrap(x_const: f32, low_const: f32, high_const: f32) -> f32 {
var x = x_const;
var low = low_const;
var high = high_const;
if ((x < low)) 
{
var rng: f32 = high - low;
;var s1: f32 = low - x;
;var ms: f32 = s1 % rng;
;return high - ms;

}
else 
if ((x >= high)) 
{
var rng: f32 = high - low;
;var s1: f32 = x - high;
;var ms: f32 = s1 % rng;
;return low + ms;

}
else 
{
return x;

}


}

fn fn_iistd_math_ts_40366_rand(seed_const: f32) -> f32 {
var seed = seed_const;
if (0 == 0) 
{
return fract(sin(seed * f32(91.3458)) * f32(47453.5453));

}
else 
{
return 0.0;

}

}

fn fn_iistd_math_ts_41039_rand3(seed_const: vec3<f32>) -> f32 {
var seed = seed_const;
return fn_iistd_math_ts_40744_rand2(seed.xy + fn_iistd_math_ts_40366_rand(seed.z));

}

fn fn_iimain_ts_9718_trans(p_const: vec2<f32>) -> vec2<f32> {
var p = p_const;
var tt: f32 = _in_uniforms._ext_uniform_local_scroll / f32(500);
var mat3: mat2x2<f32> = mat2x2<f32>(cos(tt), -(sin(tt)), sin(tt), cos(tt));
return (p - f32(0.5)) * mat3 + f32(0.5);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
@compute @workgroup_size(32, 1, 1)
fn main(/*__SHADEUP_TEMPLATE_INPUT*/){
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
var p: str_i_main_ts_2739_Particle = _ext_uniform_global_particles[_i_in.globalId.x];
if ((p.alive == i32(0))) 
{
return;

}
if ((_in_uniforms._ext_uniform_local_numTargets > i32(0))) 
{
p.goal = p.goal + f32(0.5);

}
var deathOffset: f32 = fn_iistd_math_ts_40366_rand(f32(_i_in.globalId.x) / f32(15325)) * f32(i32(1));
p.age = p.age + _in_uniforms._ext_uniform_local_deltaTime;
p.position = p.position + vec2<f32>(cos(p.angle), sin(p.angle)) * p.velocity * _in_uniforms._ext_uniform_local_deltaTime;
var targetPos: vec2<f32> = _in_uniforms._ext_uniform_local_mouse;
var hit: bool = false;
var angleAmount: f32 = f32(7.5);
if ((p.goal >= f32(0.5))) 
{
targetPos = _in_uniforms._ext_uniform_global_env.screenSize;
;angleAmount = f32(10);
;var basePos: vec2<f32> = vec2<f32>(_in_uniforms._ext_uniform_global_env.screenSize.x / f32(1.5), _in_uniforms._ext_uniform_global_env.screenSize.y / f32(i32(8)));
;var size: vec2<f32> = shadeup_up_swizzle_xx_f32((_in_uniforms._ext_uniform_global_env.screenSize.y / f32(1.2)));
;var tempVal_10598 = _in_uniforms._ext_uniform_global_env.screenSize.x - size.x - f32(i32(150));
basePos.x = tempVal_10598;
;
;var use2: bool = (fn_iistd_math_ts_40366_rand(f32(_i_in.globalId.x) / f32(105320)) < f32(0.67));
;var logoSize: vec2<i32> = vec2<i32>(i32(675), i32(675));
;var firstPos: vec2<f32> = basePos + fn_iimain_ts_9718_trans(_ext_uniform_global_logoBuf[i32(0)].xy / vec2<f32>(vec2<f32>(logoSize))) * size;
;if (use2) 
{
firstPos = basePos + fn_iimain_ts_9718_trans(_ext_uniform_global_logoBuf2[i32(0)].xy / vec2<f32>(vec2<f32>(logoSize))) * size;

}
;if ((_in_uniforms._ext_uniform_local_numTargets > i32(0))) 
{
firstPos = _ext_uniform_global_targetsBuf[i32(0)];

}
;if ((p.timeline < f32(i32(0)))) 
{
targetPos = firstPos;
;targetPos = targetPos + vec2<f32>(fn_iistd_math_ts_41039_rand3(vec3<f32>(f32(_i_in.globalId.x) / f32(14502.4), f32(132.52), f32(i32(55)))), fn_iistd_math_ts_41039_rand3(vec3<f32>(f32(_i_in.globalId.x) / f32(5325.3), f32(5123.2), f32(i32(234))))) * f32(i32(50));
;if ((distance(targetPos, p.position) < f32(i32(100)))) 
{
p.timeline = f32(1);

}
;if ((_in_uniforms._ext_uniform_local_numTargets == i32(0))) 
{
if (use2) 
{
p.angle = p.angle + (cos((f32(_i_in.globalId.x) + p.age) / f32(5000)) * _in_uniforms._ext_uniform_local_deltaTime * f32(10));

}
else 
{
p.angle = p.angle + (sin((f32(_i_in.globalId.x) + p.age) / f32(2400)) * _in_uniforms._ext_uniform_local_deltaTime * f32(6));

}

}

}
else 
{
var t: f32 = fn_iistd_math_ts_39781_wrap(p.timeline, f32(i32(0)), f32(select(_in_uniforms._ext_uniform_global_numLogoPoints, _in_uniforms._ext_uniform_global_numLogoPoints2, use2)));
;if ((_in_uniforms._ext_uniform_local_numTargets > i32(0))) 
{
t = fn_iistd_math_ts_39781_wrap(p.timeline, f32(i32(0)), f32(_in_uniforms._ext_uniform_local_numTargets));

}
;var index: i32 = i32(t * f32(1));
;var sub: f32 = t * f32(1) - f32(index);
;var a: vec2<f32> = _ext_uniform_global_logoBuf[index];
;var b: vec2<f32> = _ext_uniform_global_logoBuf[(index + i32(1)) % _in_uniforms._ext_uniform_global_numLogoPoints];
;if (use2) 
{
a = _ext_uniform_global_logoBuf2[index];
;b = _ext_uniform_global_logoBuf2[(index + i32(1)) % _in_uniforms._ext_uniform_global_numLogoPoints2];

}
;targetPos = basePos + fn_iimain_ts_9718_trans(mix(a, b, sub).xy / vec2<f32>(vec2<f32>(logoSize))) * size;
;if ((_in_uniforms._ext_uniform_local_numTargets > i32(0))) 
{
angleAmount = f32(20);
;a = _ext_uniform_global_targetsBuf[index];
;b = _ext_uniform_global_targetsBuf[(index + i32(1)) % _in_uniforms._ext_uniform_local_numTargets];
;targetPos = mix(a, b, sub).xy;
;if ((p.timeline >= f32(i32(6)))) 
{
angleAmount = f32(7);

}
;if ((p.timeline >= f32(_in_uniforms._ext_uniform_local_numTargets))) 
{
targetPos = vec2<f32>(_in_uniforms._ext_uniform_global_env.screenSize.x + f32(i32(400)), f32(-(i32(400))) + _in_uniforms._ext_uniform_local_scroll);

}

}
;if ((distance(targetPos, p.position) < f32(i32(100)))) 
{
p.timeline = p.timeline + f32(1);

}
;if ((_in_uniforms._ext_uniform_local_numTargets == i32(0))) 
{
if ((p.age < _in_uniforms._ext_uniform_global_deathNear + deathOffset)) 
{
p.angle = p.angle + (cos(f32(_i_in.globalId.x) + p.timeline)) * _in_uniforms._ext_uniform_local_deltaTime * f32(1);
;p.angle = p.angle + (sin(f32(_i_in.globalId.x) + _in_uniforms._ext_uniform_global_env.time)) * _in_uniforms._ext_uniform_local_deltaTime * f32(10);

}

}
else 
{
p.angle = p.angle + (sin(f32(_i_in.globalId.x) + _in_uniforms._ext_uniform_global_env.time)) * _in_uniforms._ext_uniform_local_deltaTime * f32(4);

}

}

}
var d: f32 = distance(targetPos, p.position);
if ((d < f32(200))) 
{
p.goal = p.goal + _in_uniforms._ext_uniform_local_deltaTime;

}
var targetVelocity: f32 = d * f32(6);
if (hit) 
{
targetVelocity = f32(100);

}
var deltaPos: vec2<f32> = targetPos - p.position;
var targetAngle: f32 = atan2(deltaPos.y, deltaPos.x);
if ((p.age < _in_uniforms._ext_uniform_global_deathNear + deathOffset)) 
{
p.angle = fn_iimain_ts_6579_lerpAngle(p.angle, targetAngle, _in_uniforms._ext_uniform_local_deltaTime * angleAmount * p.age / f32(2));

}
else 
{
p.velocity = p.velocity * (f32(1) - _in_uniforms._ext_uniform_local_deltaTime * f32(i32(2)));

}
var shouldKill: bool = false;
if ((p.age > f32(7) + deathOffset)) 
{
shouldKill = true;

}
if (((((p.position.x > _in_uniforms._ext_uniform_global_env.screenSize.x) || (p.position.x < f32(i32(0)))) || (p.position.y > _in_uniforms._ext_uniform_global_env.screenSize.y)) || (p.position.y < f32(i32(0))))) 
{

}
if (shouldKill) 
{
p.alive = i32(0);
;var idx: i32 = atomicAdd(&_ext_uniform_global_deadCounter[i32(0)], i32(1));
;_ext_uniform_global_dead[idx] = u32(_i_in.globalId.x);

}
_ext_uniform_global_particles[_i_in.globalId.x] = p;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`,webgl:`vec2 shadeup_up_swizzle_xx_float(float n) {
	return vec2(n, n);
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
struct str_i_main_ts_2739_Particle {
  vec2 position;
  float angle;
  float velocity;
  float age;
  int alive;
  float goal;
  float timeline;

};
str_i_main_ts_2739_Particle _make_struct_str_i_main_ts_2739_Particle(vec2 position, float angle, float velocity, float age, int alive, float goal, float timeline) {
str_i_main_ts_2739_Particle _s;  _s.position = position;
  _s.angle = angle;
  _s.velocity = velocity;
  _s.age = age;
  _s.alive = alive;
  _s.goal = goal;
  _s.timeline = timeline;
  return _s;
}
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
  float time;
  vec2 screenSize;
//   int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time, vec2 screenSize) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  _s.screenSize = screenSize;
  return _s;
}
uniform str_i_main_ts_2739_Particle[0] _ext_uniform_global_particles;
uniform int _ext_uniform_local_numTargets;
uniform float _ext_uniform_local_scroll;
uniform float _ext_uniform_local_deltaTime;
uniform vec2 _ext_uniform_local_mouse;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform vec2[0] _ext_uniform_global_logoBuf;
uniform vec2[0] _ext_uniform_global_logoBuf2;
uniform vec2[0] _ext_uniform_global_targetsBuf;
uniform int _ext_uniform_global_numLogoPoints2;
uniform int _ext_uniform_global_numLogoPoints;
uniform float _ext_uniform_global_deathNear;
uniform atomic_int[0] _ext_uniform_global_deadCounter;
uniform uint[0] _ext_uniform_global_dead;
float fn_iistd_math_ts_40744_rand2(vec2 seed) {
return fract(sin(dot(seed, vec2(12.9898, 4.1414))) * float(43758.5453));

}

float fn_iimain_ts_6579_lerpAngle(float a, float b, float t) {
vec2 av = vec2(cos(a), sin(a));
vec2 bv = vec2(cos(b), sin(b));
vec2 cv = normalize(mix(av, bv, t));
return atan2(cv.y, cv.x);

}

float fn_iistd_math_ts_39781_wrap(float x, float low, float high) {
if ((x < low)){
float rng = high - low;
;float s1 = low - x;
;float ms = mod(s1, rng);
;return high - ms;

}else 
if ((x >= high)){
float rng = high - low;
;float s1 = x - high;
;float ms = mod(s1, rng);
;return low + ms;

}else 
{
return x;

}


}

float fn_iistd_math_ts_40366_rand(float seed) {
if (0 == 0){
return fract(sin(seed * float(91.3458)) * float(47453.5453));

}else 
{
return 0.0;

}

}

float fn_iistd_math_ts_41039_rand3(vec3 seed) {
return fn_iistd_math_ts_40744_rand2(seed.xy + fn_iistd_math_ts_40366_rand(seed.z));

}

vec2 fn_iimain_ts_9718_trans(vec2 p) {
float tt = _ext_uniform_local_scroll / float(500);
mat2 mat3 = mat2(cos(tt), -(sin(tt)), sin(tt), cos(tt));
return (p - float(0.5)) * mat3 + float(0.5);

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
str_i_main_ts_2739_Particle p = _ext_uniform_global_particles[_i_in.globalId.x];
if ((p.alive == int(0))){
return;

}if ((float(_ext_uniform_local_numTargets) > float(int(0)))){
p.goal = p.goal + float(0.5);

}vec2 fn_iimain_ts_9718_trans(vec2 p) {
float tt = _ext_uniform_local_scroll / float(500);
mat2 mat3 = mat2(cos(tt), -(sin(tt)), sin(tt), cos(tt));
return (p - float(0.5)) * mat3 + float(0.5);

}

float deathOffset = fn_iistd_math_ts_40366_rand(float(_i_in.globalId.x) / float(15325)) * float(int(1));
p.age = p.age + _ext_uniform_local_deltaTime;
p.position = p.position + vec2(cos(p.angle), sin(p.angle)) * p.velocity * _ext_uniform_local_deltaTime;
vec2 targetPos = _ext_uniform_local_mouse;
bool hit = false;
float angleAmount = float(7.5);
if ((p.goal >= float(0.5))){
targetPos = _ext_uniform_global_env.screenSize;
;angleAmount = float(10);
;vec2 basePos = vec2(_ext_uniform_global_env.screenSize.x / float(1.5), _ext_uniform_global_env.screenSize.y / float(int(8)));
;vec2 size = shadeup_up_swizzle_xx_float((_ext_uniform_global_env.screenSize.y / float(1.2)));
;basePos.x;
;bool use2 = (fn_iistd_math_ts_40366_rand(float(_i_in.globalId.x) / float(105320)) < float(0.67));
;ivec2 logoSize = ivec2(int(675), int(675));
;vec2 firstPos = basePos + fn_iimain_ts_9718_trans(_ext_uniform_global_logoBuf[int(0)].xy / vec2(vec2(logoSize))) * size;
;if (use2){
firstPos = basePos + fn_iimain_ts_9718_trans(_ext_uniform_global_logoBuf2[int(0)].xy / vec2(vec2(logoSize))) * size;

};if ((float(_ext_uniform_local_numTargets) > float(int(0)))){
firstPos = _ext_uniform_global_targetsBuf[int(0)];

};if ((p.timeline < float(float(int(0))))){
targetPos = firstPos;
;targetPos = targetPos + vec2(fn_iistd_math_ts_41039_rand3(vec3(float(_i_in.globalId.x) / float(14502.4), float(132.52), int(55))), fn_iistd_math_ts_41039_rand3(vec3(float(_i_in.globalId.x) / float(5325.3), float(5123.2), int(234)))) * float(float(int(50)));
;if ((distance(targetPos, p.position) < float(float(int(100))))){
p.timeline = float(1);

};if ((_ext_uniform_local_numTargets == int(0))){
if (use2){
p.angle = p.angle + (cos((float(_i_in.globalId.x) + p.age) / float(5000)) * _ext_uniform_local_deltaTime * float(10));

}else 
{
p.angle = p.angle + (sin((float(_i_in.globalId.x) + p.age) / float(2400)) * _ext_uniform_local_deltaTime * float(6));

}

}
}else 
{
float t = fn_iistd_math_ts_39781_wrap(p.timeline, float(int(0)), float(use2 ? _ext_uniform_global_numLogoPoints2 : _ext_uniform_global_numLogoPoints));
;if ((float(_ext_uniform_local_numTargets) > float(int(0)))){
t = fn_iistd_math_ts_39781_wrap(p.timeline, float(int(0)), float(_ext_uniform_local_numTargets));

};int index = int(t * float(1));
;float sub = t * float(1) - float(index);
;vec2 a = _ext_uniform_global_logoBuf[index];
;vec2 b = _ext_uniform_global_logoBuf[mod((index + int(1)), _ext_uniform_global_numLogoPoints)];
;if (use2){
a = _ext_uniform_global_logoBuf2[index];
;b = _ext_uniform_global_logoBuf2[mod((index + int(1)), _ext_uniform_global_numLogoPoints2)];

};targetPos = basePos + fn_iimain_ts_9718_trans(mix(a, b, sub).xy / vec2(vec2(logoSize))) * size;
;if ((float(_ext_uniform_local_numTargets) > float(int(0)))){
angleAmount = float(20);
;a = _ext_uniform_global_targetsBuf[index];
;b = _ext_uniform_global_targetsBuf[mod((index + int(1)), _ext_uniform_local_numTargets)];
;targetPos = mix(a, b, sub).xy;
;if ((p.timeline >= float(float(int(6))))){
angleAmount = float(7);

};if ((p.timeline >= float(float(_ext_uniform_local_numTargets)))){
targetPos = vec2(_ext_uniform_global_env.screenSize.x + float(int(400)), float(-(int(400))) + _ext_uniform_local_scroll);

}
};if ((distance(targetPos, p.position) < float(float(int(100))))){
p.timeline = p.timeline + float(1);

};if ((_ext_uniform_local_numTargets == int(0))){
if ((p.age < _ext_uniform_global_deathNear + deathOffset)){
p.angle = p.angle + (cos(float(_i_in.globalId.x) + p.timeline)) * _ext_uniform_local_deltaTime * float(1);
;p.angle = p.angle + (sin(float(_i_in.globalId.x) + _ext_uniform_global_env.time)) * _ext_uniform_local_deltaTime * float(10);

}
}else 
{
p.angle = p.angle + (sin(float(_i_in.globalId.x) + _ext_uniform_global_env.time)) * _ext_uniform_local_deltaTime * float(4);

}

}

}float d = distance(targetPos, p.position);
if ((d < float(200))){
p.goal = p.goal + _ext_uniform_local_deltaTime;

}float targetVelocity = d * float(6);
if (hit){
targetVelocity = float(100);

}vec2 deltaPos = targetPos - p.position;
float targetAngle = atan2(deltaPos.y, deltaPos.x);
if ((p.age < _ext_uniform_global_deathNear + deathOffset)){
p.angle = fn_iimain_ts_6579_lerpAngle(p.angle, targetAngle, _ext_uniform_local_deltaTime * angleAmount * p.age / float(2));

}else 
{
p.velocity = p.velocity * (float(1) - _ext_uniform_local_deltaTime * float(int(2)));

}
bool shouldKill = false;
if ((p.age > float(7) + deathOffset)){
shouldKill = true;

}if (((((p.position.x > _ext_uniform_global_env.screenSize.x) || (p.position.x < float(float(int(0))))) || (p.position.y > _ext_uniform_global_env.screenSize.y)) || (p.position.y < float(float(int(0)))))){

}if (shouldKill){
p.alive = int(0);
;int idx = atomicAdd(&_ext_uniform_global_deadCounter[int(0)], int(1));
;_ext_uniform_global_dead[idx] = uint(_i_in.globalId.x);

}_ext_uniform_global_particles[_i_in.globalId.x] = p;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[3283,3310,321,338],[3312,3335,338,353],[3337,3363,353,371],[3365,3386,371,384],[3388,3409,384,397],[3411,3433,397,411],[3435,3461,411,429],[2739,3748,284,433],[2739,3748,433,796],[493,510,844,866],[577,589,866,880],[623,642,880,899],[674,685,899,915],[745,792,915,970],[842,898,970,1031],[972,1002,1031,1079],[1007,1043,1079,1130],[387,1715,796,1134],[387,1715,1134,1361],[4058,4231,1361,1431],[7751,7777,1431,1474],[7462,7505,1474,1515],[7264,7289,1515,1559],[7412,7456,1559,1598],[16316,16333,1598,1670],[1722,1868,1670,1715],[1874,2024,1715,1761],[7083,7235,1761,1809],[2579,2717,1809,1857],[2420,2554,1857,1904],[2055,2177,1904,1949],[4237,4403,1949,2004],[4559,4693,2004,2046],[0,0,2081,2090],[40798,40802,2101,2106],[40807,40810,2107,2110],[40811,40814,2111,2114],[0,0,2115,2119],[0,0,2126,2133],[0,0,2135,2141],[0,0,2121,2142],[0,0,2111,2143],[0,0,2107,2144],[40848,40853,2147,2152],[0,0,2153,2163],[0,0,2147,2164],[0,0,2107,2164],[0,0,2101,2165],[0,0,2094,2167],[0,0,2046,2171],[0,0,2205,2212],[0,0,2214,2221],[0,0,2223,2230],[6660,6663,2249,2252],[0,0,2253,2254],[0,0,2249,2255],[6668,6671,2257,2260],[0,0,2261,2262],[0,0,2257,2263],[0,0,2244,2264],[0,0,2234,2264],[0,0,2234,2266],[6700,6703,2281,2284],[0,0,2285,2286],[0,0,2281,2287],[6708,6711,2289,2292],[0,0,2293,2294],[0,0,2289,2295],[0,0,2276,2296],[0,0,2266,2296],[0,0,2266,2298],[6726,6735,2308,2317],[6736,6740,2318,2321],[0,0,2322,2324],[0,0,2326,2328],[0,0,2330,2331],[0,0,2318,2332],[0,0,2308,2333],[0,0,2298,2333],[0,0,2298,2335],[6761,6766,2342,2347],[0,0,2348,2350],[0,0,2348,2352],[0,0,2354,2356],[0,0,2354,2358],[0,0,2342,2359],[0,0,2335,2361],[1921,2093,2171,2365],[0,0,2399,2406],[0,0,2408,2417],[0,0,2419,2429],[0,0,2438,2439],[0,0,2442,2445],[0,0,2437,2446],[0,0,2461,2465],[0,0,2468,2471],[0,0,2461,2471],[0,0,2449,2471],[0,0,2449,2473],[0,0,2485,2488],[0,0,2491,2492],[0,0,2485,2492],[0,0,2474,2492],[0,0,2474,2494],[0,0,2510,2512],[0,0,2514,2517],[0,0,2506,2518],[0,0,2495,2518],[0,0,2495,2520],[0,0,2528,2532],[0,0,2535,2537],[0,0,2528,2537],[0,0,2521,2539],[0,0,2447,2541],[0,0,2552,2553],[0,0,2557,2561],[0,0,2551,2562],[0,0,2577,2581],[0,0,2584,2587],[0,0,2577,2587],[0,0,2565,2587],[0,0,2565,2589],[0,0,2601,2602],[0,0,2605,2609],[0,0,2601,2609],[0,0,2590,2609],[0,0,2590,2611],[0,0,2627,2629],[0,0,2631,2634],[0,0,2623,2635],[0,0,2612,2635],[0,0,2612,2637],[0,0,2645,2648],[0,0,2651,2653],[0,0,2645,2653],[0,0,2638,2655],[0,0,2563,2657],[0,0,2672,2673],[0,0,2665,2675],[0,0,2663,2677],[0,0,2657,2678],[0,0,2547,2678],[0,0,2541,2679],[0,0,2433,2679],[0,0,2365,2683],[0,0,2717,2727],[0,0,2735,2736],[0,0,2740,2741],[0,0,2735,2741],[40454,40458,2751,2756],[40463,40466,2757,2760],[0,0,2761,2765],[40477,40482,2768,2773],[0,0,2774,2781],[0,0,2768,2782],[0,0,2761,2782],[0,0,2757,2783],[40495,40500,2786,2791],[0,0,2792,2802],[0,0,2786,2803],[0,0,2757,2803],[0,0,2751,2804],[0,0,2744,2806],[0,0,2742,2808],[0,0,2823,2826],[0,0,2816,2828],[0,0,2814,2830],[0,0,2808,2831],[0,0,2731,2831],[0,0,2683,2835],[0,0,2870,2879],[41093,41098,2890,2918],[0,0,2919,2923],[0,0,2919,2926],[41124,41128,2929,2956],[0,0,2957,2961],[0,0,2957,2963],[0,0,2929,2964],[0,0,2919,2964],[0,0,2890,2965],[0,0,2883,2967],[0,0,2835,2971],[0,0,3000,3006],[0,0,3021,3046],[9772,9780,3049,3054],[0,0,3055,3058],[0,0,3049,3059],[0,0,3021,3059],[0,0,3010,3059],[0,0,3010,3061],[9814,9817,3078,3081],[0,0,3082,3084],[0,0,3078,3085],[9833,9836,3089,3092],[0,0,3093,3095],[0,0,3089,3096],[0,0,3087,3097],[9843,9846,3099,3102],[0,0,3103,3105],[0,0,3099,3106],[9852,9855,3108,3111],[0,0,3112,3114],[0,0,3108,3115],[0,0,3073,3116],[0,0,3061,3116],[0,0,3061,3118],[0,0,3126,3127],[9897,9905,3130,3135],[0,0,3136,3139],[0,0,3130,3140],[0,0,3126,3140],[0,0,3125,3141],[0,0,3144,3148],[0,0,3125,3148],[9923,9931,3151,3156],[0,0,3157,3160],[0,0,3151,3161],[0,0,3125,3161],[0,0,3118,3163],[3530,3700,2971,3167],[0,0,3301,3330],[0,0,3301,3330],[0,0,3331,3336],[0,0,3337,3345],[0,0,3331,3345],[0,0,3331,3347],[0,0,3301,3348],[0,0,3269,3348],[0,0,3269,3350],[0,0,3355,3356],[0,0,3357,3362],[0,0,3355,3362],[9620,9626,3366,3369],[0,0,3370,3371],[0,0,3366,3372],[0,0,3354,3373],[0,0,3376,3384],[0,0,3374,3386],[0,0,3386,3386],[0,0,3350,3386],[0,0,3397,3426],[0,0,3391,3427],[9664,9670,3436,3439],[0,0,3440,3441],[0,0,3436,3442],[0,0,3430,3443],[0,0,3390,3444],[0,0,3447,3448],[0,0,3449,3453],[0,0,3447,3453],[0,0,3456,3457],[0,0,3458,3462],[0,0,3456,3462],[9701,9709,3465,3470],[0,0,3471,3474],[0,0,3465,3475],[0,0,3456,3475],[0,0,3447,3475],[0,0,3447,3477],[0,0,3445,3479],[0,0,3479,3479],[0,0,3386,3479],[0,0,3508,3514],[0,0,3529,3554],[9772,9780,3557,3562],[0,0,3563,3566],[0,0,3557,3567],[0,0,3529,3567],[0,0,3518,3567],[0,0,3518,3569],[9814,9817,3586,3589],[0,0,3590,3592],[0,0,3586,3593],[9833,9836,3597,3600],[0,0,3601,3603],[0,0,3597,3604],[0,0,3595,3605],[9843,9846,3607,3610],[0,0,3611,3613],[0,0,3607,3614],[9852,9855,3616,3619],[0,0,3620,3622],[0,0,3616,3623],[0,0,3581,3624],[0,0,3569,3624],[0,0,3569,3626],[0,0,3634,3635],[9897,9905,3638,3643],[0,0,3644,3647],[0,0,3638,3648],[0,0,3634,3648],[0,0,3633,3649],[0,0,3652,3656],[0,0,3633,3656],[9923,9931,3659,3664],[0,0,3665,3668],[0,0,3659,3669],[0,0,3633,3669],[0,0,3626,3671],[0,0,3479,3675],[9967,9971,3695,3722],[0,0,3729,3734],[0,0,3735,3743],[0,0,3729,3743],[0,0,3729,3745],[0,0,3723,3746],[10012,10020,3749,3754],[0,0,3755,3760],[0,0,3749,3761],[0,0,3723,3761],[0,0,3695,3762],[10034,10040,3771,3774],[0,0,3775,3776],[0,0,3771,3777],[0,0,3765,3778],[0,0,3695,3778],[0,0,3675,3778],[0,0,3675,3780],[0,0,3780,3781],[0,0,3782,3785],[0,0,3780,3785],[0,0,3788,3789],[0,0,3790,3793],[0,0,3788,3793],[0,0,3796,3824],[0,0,3788,3824],[0,0,3780,3824],[0,0,3780,3826],[0,0,3826,3827],[0,0,3828,3836],[0,0,3826,3836],[0,0,3839,3840],[0,0,3841,3849],[0,0,3839,3849],[10143,10146,3857,3860],[0,0,3861,3862],[0,0,3863,3868],[0,0,3861,3868],[0,0,3857,3869],[10157,10160,3871,3874],[0,0,3875,3876],[0,0,3877,3882],[0,0,3875,3882],[0,0,3871,3883],[0,0,3852,3884],[0,0,3887,3888],[0,0,3889,3897],[0,0,3887,3897],[0,0,3852,3897],[0,0,3900,3928],[0,0,3852,3928],[0,0,3839,3928],[0,0,3826,3928],[0,0,3826,3930],[0,0,3947,3971],[0,0,3930,3971],[0,0,3930,3973],[0,0,3984,3989],[0,0,3973,3989],[0,0,3973,3991],[10258,10266,4011,4016],[0,0,4017,4020],[0,0,4011,4021],[0,0,3991,4021],[0,0,3991,4023],[0,0,4028,4029],[0,0,4030,4034],[0,0,4028,4034],[10293,10301,4038,4043],[0,0,4044,4047],[0,0,4038,4048],[0,0,4027,4049],[0,0,4052,4061],[0,0,4064,4087],[0,0,4088,4098],[0,0,4064,4098],[0,0,4052,4098],[0,0,4052,4100],[0,0,4101,4112],[10352,10360,4115,4120],[0,0,4121,4123],[0,0,4115,4124],[0,0,4101,4124],[0,0,4101,4126],[0,0,4147,4170],[0,0,4171,4181],[0,0,4147,4181],[0,0,4147,4183],[10437,10445,4186,4191],[0,0,4192,4195],[0,0,4186,4196],[0,0,4147,4196],[0,0,4198,4221],[0,0,4222,4232],[0,0,4198,4232],[0,0,4198,4234],[10495,10501,4243,4246],[0,0,4247,4248],[0,0,4243,4249],[0,0,4237,4250],[0,0,4198,4250],[0,0,4142,4251],[0,0,4127,4251],[0,0,4127,4253],[0,0,4295,4318],[0,0,4319,4329],[0,0,4295,4329],[0,0,4295,4331],[10573,10581,4334,4339],[0,0,4340,4343],[0,0,4334,4344],[0,0,4295,4344],[0,0,4294,4345],[0,0,4266,4346],[0,0,4254,4346],[0,0,4254,4348],[0,0,4349,4356],[0,0,4349,4358],[0,0,4349,4360],[10731,10735,4374,4401],[0,0,4408,4413],[0,0,4414,4422],[0,0,4408,4422],[0,0,4408,4424],[0,0,4402,4425],[10776,10784,4428,4433],[0,0,4434,4440],[0,0,4428,4441],[0,0,4402,4441],[0,0,4374,4442],[10799,10807,4445,4450],[0,0,4451,4455],[0,0,4445,4456],[0,0,4373,4457],[0,0,4361,4457],[0,0,4361,4459],[10846,10852,4483,4486],[0,0,4487,4490],[0,0,4483,4491],[10859,10865,4493,4496],[0,0,4497,4500],[0,0,4493,4501],[0,0,4477,4502],[0,0,4460,4502],[0,0,4460,4504],[0,0,4521,4528],[10913,10918,4531,4554],[0,0,4555,4582],[0,0,4555,4582],[10954,10960,4583,4586],[0,0,4587,4588],[0,0,4583,4589],[0,0,4555,4590],[0,0,4555,4593],[0,0,4606,4614],[0,0,4601,4615],[0,0,4596,4616],[0,0,4555,4616],[0,0,4531,4617],[0,0,4620,4624],[0,0,4531,4624],[0,0,4521,4624],[0,0,4505,4624],[0,0,4505,4626],[0,0,4631,4635],[0,0,4638,4646],[0,0,4649,4656],[11042,11047,4659,4682],[0,0,4683,4711],[0,0,4683,4711],[11084,11090,4712,4715],[0,0,4716,4717],[0,0,4712,4718],[0,0,4683,4719],[0,0,4683,4722],[0,0,4735,4743],[0,0,4730,4744],[0,0,4725,4745],[0,0,4683,4745],[0,0,4659,4746],[0,0,4749,4753],[0,0,4659,4753],[0,0,4649,4753],[0,0,4638,4753],[0,0,4638,4755],[0,0,4636,4757],[0,0,4757,4757],[0,0,4627,4757],[0,0,4769,4798],[0,0,4763,4799],[11150,11156,4808,4811],[0,0,4812,4813],[0,0,4808,4814],[0,0,4802,4815],[0,0,4762,4816],[0,0,4819,4827],[0,0,4830,4860],[0,0,4830,4860],[11193,11199,4861,4864],[0,0,4865,4866],[0,0,4861,4867],[0,0,4830,4868],[0,0,4819,4868],[0,0,4819,4870],[0,0,4817,4872],[0,0,4872,4872],[0,0,4758,4872],[0,0,4878,4879],[0,0,4880,4888],[0,0,4878,4888],[11229,11235,4903,4906],[0,0,4907,4908],[0,0,4903,4909],[0,0,4897,4910],[0,0,4891,4911],[0,0,4877,4912],[0,0,4915,4924],[0,0,4927,4935],[0,0,4915,4935],[0,0,4915,4937],[0,0,4938,4947],[0,0,4950,4959],[11316,11321,4967,4995],[0,0,5007,5012],[0,0,5013,5021],[0,0,5007,5021],[0,0,5007,5023],[0,0,5001,5024],[11376,11384,5027,5032],[0,0,5033,5040],[0,0,5027,5041],[0,0,5001,5041],[11397,11405,5043,5048],[0,0,5049,5055],[0,0,5043,5056],[11415,11421,5058,5061],[0,0,5062,5064],[0,0,5058,5065],[0,0,4996,5066],[0,0,4967,5067],[11429,11434,5069,5097],[0,0,5109,5114],[0,0,5115,5123],[0,0,5109,5123],[0,0,5109,5125],[0,0,5103,5126],[11489,11497,5129,5134],[0,0,5135,5141],[0,0,5129,5142],[0,0,5103,5142],[11509,11517,5144,5149],[0,0,5150,5156],[0,0,5144,5157],[11527,11533,5159,5162],[0,0,5163,5166],[0,0,5159,5167],[0,0,5098,5168],[0,0,5069,5169],[0,0,4962,5170],[11543,11549,5185,5188],[0,0,5189,5191],[0,0,5185,5192],[0,0,5179,5193],[0,0,5173,5194],[0,0,4962,5194],[0,0,4950,5194],[0,0,4938,5194],[0,0,4938,5196],[11569,11573,5202,5210],[0,0,5211,5220],[0,0,5222,5223],[0,0,5224,5232],[0,0,5222,5232],[0,0,5202,5233],[11598,11604,5248,5251],[0,0,5252,5255],[0,0,5248,5256],[0,0,5242,5257],[0,0,5236,5258],[0,0,5201,5259],[0,0,5262,5263],[0,0,5264,5272],[0,0,5262,5272],[11626,11634,5275,5280],[0,0,5281,5282],[0,0,5275,5283],[0,0,5262,5283],[0,0,5262,5285],[0,0,5260,5287],[0,0,5287,5287],[0,0,5197,5287],[0,0,5293,5322],[11665,11671,5326,5329],[0,0,5330,5331],[0,0,5326,5332],[0,0,5292,5333],[0,0,5340,5344],[0,0,5347,5348],[0,0,5349,5354],[0,0,5347,5354],[0,0,5357,5358],[0,0,5359,5364],[0,0,5357,5364],[11731,11734,5368,5371],[0,0,5379,5384],[0,0,5385,5393],[0,0,5379,5393],[0,0,5379,5395],[0,0,5373,5396],[0,0,5399,5400],[0,0,5401,5404],[0,0,5399,5404],[0,0,5373,5404],[0,0,5372,5405],[11794,11802,5408,5413],[0,0,5414,5418],[0,0,5408,5419],[0,0,5372,5419],[0,0,5368,5420],[0,0,5423,5451],[0,0,5368,5451],[11828,11836,5454,5459],[0,0,5460,5462],[0,0,5454,5463],[0,0,5368,5463],[0,0,5367,5464],[0,0,5357,5464],[0,0,5347,5464],[0,0,5347,5466],[0,0,5345,5468],[0,0,5476,5477],[0,0,5478,5483],[0,0,5476,5483],[0,0,5486,5487],[0,0,5488,5493],[0,0,5486,5493],[11899,11902,5497,5500],[0,0,5508,5513],[0,0,5514,5522],[0,0,5508,5522],[0,0,5508,5524],[0,0,5502,5525],[0,0,5528,5529],[0,0,5530,5533],[0,0,5528,5533],[0,0,5502,5533],[0,0,5501,5534],[11962,11970,5537,5542],[0,0,5543,5547],[0,0,5537,5548],[0,0,5501,5548],[0,0,5497,5549],[0,0,5552,5580],[0,0,5497,5580],[11996,12004,5583,5588],[0,0,5589,5590],[0,0,5583,5591],[0,0,5497,5591],[0,0,5496,5592],[0,0,5486,5592],[0,0,5476,5592],[0,0,5476,5594],[0,0,5474,5596],[0,0,5468,5597],[0,0,5336,5597],[0,0,5334,5599],[0,0,5599,5599],[0,0,5288,5599],[0,0,4913,5601],[12068,12072,5619,5646],[0,0,5647,5648],[0,0,5649,5657],[0,0,5647,5657],[12085,12091,5665,5668],[0,0,5669,5670],[0,0,5665,5671],[0,0,5659,5672],[0,0,5680,5684],[0,0,5687,5721],[0,0,5724,5757],[0,0,5680,5757],[0,0,5674,5758],[0,0,5619,5759],[0,0,5609,5759],[0,0,5609,5761],[0,0,5773,5802],[0,0,5767,5803],[12159,12165,5812,5815],[0,0,5816,5817],[0,0,5812,5818],[0,0,5806,5819],[0,0,5766,5820],[0,0,5823,5824],[12176,12180,5827,5854],[0,0,5855,5856],[0,0,5857,5865],[0,0,5855,5865],[12193,12199,5873,5876],[0,0,5877,5878],[0,0,5873,5879],[0,0,5867,5880],[0,0,5888,5917],[0,0,5882,5918],[0,0,5827,5919],[0,0,5823,5919],[0,0,5823,5921],[0,0,5821,5923],[0,0,5923,5923],[0,0,5762,5923],[12230,12236,5936,5939],[0,0,5940,5941],[12248,12256,5944,5949],[0,0,5950,5951],[0,0,5944,5952],[0,0,5940,5952],[0,0,5936,5953],[0,0,5924,5953],[0,0,5924,5955],[0,0,5968,5969],[12295,12303,5972,5977],[0,0,5978,5979],[0,0,5972,5980],[0,0,5968,5980],[0,0,5989,5994],[0,0,5983,5995],[0,0,5968,5995],[0,0,5956,5995],[0,0,5956,5997],[0,0,6007,6034],[0,0,6007,6034],[0,0,6035,6040],[0,0,6007,6041],[0,0,5998,6041],[0,0,5998,6043],[0,0,6053,6080],[0,0,6053,6080],[0,0,6086,6091],[12401,12407,6094,6097],[0,0,6098,6099],[0,0,6094,6100],[0,0,6086,6100],[0,0,6085,6101],[0,0,6103,6136],[0,0,6081,6137],[0,0,6053,6138],[0,0,6044,6138],[0,0,6044,6140],[0,0,6145,6149],[0,0,6152,6153],[0,0,6156,6184],[0,0,6156,6184],[0,0,6185,6190],[0,0,6156,6191],[0,0,6152,6191],[0,0,6152,6193],[0,0,6194,6195],[0,0,6198,6226],[0,0,6198,6226],[0,0,6232,6237],[12517,12523,6240,6243],[0,0,6244,6245],[0,0,6240,6246],[0,0,6232,6246],[0,0,6231,6247],[0,0,6249,6283],[0,0,6227,6284],[0,0,6198,6285],[0,0,6194,6285],[0,0,6194,6287],[0,0,6150,6289],[0,0,6289,6289],[0,0,6141,6289],[0,0,6290,6299],[0,0,6302,6309],[12588,12593,6312,6335],[12613,12617,6336,6339],[0,0,6340,6341],[0,0,6343,6344],[0,0,6346,6349],[0,0,6336,6350],[0,0,6336,6353],[0,0,6366,6374],[0,0,6361,6375],[0,0,6356,6376],[0,0,6336,6376],[0,0,6312,6377],[0,0,6380,6384],[0,0,6312,6384],[0,0,6302,6384],[0,0,6290,6384],[0,0,6290,6386],[0,0,6398,6427],[0,0,6392,6428],[12683,12689,6437,6440],[0,0,6441,6442],[0,0,6437,6443],[0,0,6431,6444],[0,0,6391,6445],[0,0,6448,6459],[12710,12718,6462,6467],[0,0,6468,6470],[0,0,6462,6471],[0,0,6448,6471],[0,0,6448,6473],[0,0,6474,6475],[0,0,6478,6508],[0,0,6478,6508],[0,0,6509,6514],[0,0,6478,6515],[0,0,6474,6515],[0,0,6474,6517],[0,0,6518,6519],[0,0,6522,6552],[0,0,6522,6552],[0,0,6558,6563],[12804,12810,6566,6569],[0,0,6570,6571],[0,0,6566,6572],[0,0,6558,6572],[0,0,6557,6573],[0,0,6575,6604],[0,0,6553,6605],[0,0,6522,6606],[0,0,6518,6606],[0,0,6518,6608],[0,0,6609,6618],[12856,12860,6621,6624],[0,0,6625,6626],[0,0,6628,6629],[0,0,6631,6634],[0,0,6621,6635],[0,0,6621,6638],[0,0,6609,6638],[0,0,6609,6640],[0,0,6646,6647],[0,0,6648,6656],[0,0,6646,6656],[12904,12910,6672,6675],[0,0,6676,6677],[0,0,6672,6678],[0,0,6666,6679],[0,0,6660,6680],[0,0,6645,6681],[0,0,6684,6695],[12931,12939,6698,6703],[0,0,6704,6705],[0,0,6698,6706],[0,0,6684,6706],[0,0,6684,6708],[0,0,6682,6710],[0,0,6710,6710],[0,0,6641,6710],[0,0,6716,6717],[0,0,6718,6726],[0,0,6716,6726],[0,0,6742,6771],[0,0,6736,6772],[0,0,6730,6773],[0,0,6715,6774],[0,0,6777,6786],[0,0,6794,6817],[0,0,6818,6828],[0,0,6794,6828],[0,0,6794,6830],[13123,13129,6839,6842],[0,0,6843,6846],[0,0,6839,6847],[0,0,6833,6848],[0,0,6794,6848],[13156,13162,6858,6861],[0,0,6862,6865],[0,0,6858,6866],[0,0,6856,6867],[0,0,6850,6868],[0,0,6871,6896],[0,0,6850,6896],[0,0,6789,6897],[0,0,6777,6897],[0,0,6777,6899],[0,0,6775,6901],[0,0,6901,6901],[0,0,6711,6901],[0,0,6446,6903],[0,0,6903,6903],[0,0,6387,6903],[13327,13331,6909,6917],[0,0,6918,6927],[0,0,6929,6930],[0,0,6931,6939],[0,0,6929,6939],[0,0,6909,6940],[13356,13362,6955,6958],[0,0,6959,6962],[0,0,6955,6963],[0,0,6949,6964],[0,0,6943,6965],[0,0,6908,6966],[0,0,6969,6970],[0,0,6971,6979],[0,0,6969,6979],[0,0,6982,6983],[0,0,6984,6992],[0,0,6982,6992],[13403,13411,6995,7000],[0,0,7001,7002],[0,0,6995,7003],[0,0,6982,7003],[0,0,6969,7003],[0,0,6969,7005],[0,0,6967,7007],[0,0,7007,7007],[0,0,6904,7007],[0,0,7013,7042],[13540,13546,7046,7049],[0,0,7050,7051],[0,0,7046,7052],[0,0,7012,7053],[0,0,7061,7062],[0,0,7063,7066],[0,0,7061,7066],[0,0,7069,7098],[0,0,7101,7112],[0,0,7069,7112],[0,0,7060,7113],[0,0,7116,7117],[0,0,7118,7123],[0,0,7116,7123],[0,0,7126,7127],[0,0,7128,7133],[0,0,7126,7133],[13650,13653,7137,7140],[0,0,7147,7152],[0,0,7153,7161],[0,0,7147,7161],[0,0,7147,7163],[0,0,7141,7164],[0,0,7167,7168],[0,0,7169,7177],[0,0,7167,7177],[0,0,7141,7177],[0,0,7137,7178],[0,0,7136,7179],[0,0,7182,7210],[0,0,7136,7210],[13723,13731,7213,7218],[0,0,7219,7220],[0,0,7213,7221],[0,0,7136,7221],[0,0,7126,7221],[0,0,7116,7221],[0,0,7116,7223],[0,0,7224,7225],[0,0,7226,7231],[0,0,7224,7231],[0,0,7234,7235],[0,0,7236,7241],[0,0,7234,7241],[13784,13787,7245,7248],[0,0,7255,7260],[0,0,7261,7269],[0,0,7255,7269],[0,0,7255,7271],[0,0,7249,7272],[0,0,7275,7298],[0,0,7299,7303],[0,0,7275,7303],[0,0,7249,7303],[0,0,7245,7304],[0,0,7244,7305],[0,0,7308,7336],[0,0,7244,7336],[13855,13863,7339,7344],[0,0,7345,7347],[0,0,7339,7348],[0,0,7244,7348],[0,0,7234,7348],[0,0,7224,7348],[0,0,7224,7350],[0,0,7114,7352],[0,0,7352,7352],[0,0,7056,7352],[0,0,7054,7354],[0,0,7362,7363],[0,0,7364,7369],[0,0,7362,7369],[0,0,7372,7373],[0,0,7374,7379],[0,0,7372,7379],[13926,13929,7383,7386],[0,0,7393,7398],[0,0,7399,7407],[0,0,7393,7407],[0,0,7393,7409],[0,0,7387,7410],[0,0,7413,7436],[0,0,7437,7441],[0,0,7413,7441],[0,0,7387,7441],[0,0,7383,7442],[0,0,7382,7443],[0,0,7446,7474],[0,0,7382,7474],[13997,14005,7477,7482],[0,0,7483,7484],[0,0,7477,7485],[0,0,7382,7485],[0,0,7372,7485],[0,0,7362,7485],[0,0,7362,7487],[0,0,7360,7489],[0,0,7354,7490],[0,0,7008,7490],[0,0,5607,7492],[0,0,5601,7493],[0,0,4873,7493],[0,0,4050,7495],[0,0,7495,7495],[0,0,4023,7495],[14028,14032,7505,7513],[0,0,7514,7523],[0,0,7525,7526],[0,0,7527,7535],[0,0,7525,7535],[0,0,7505,7536],[0,0,7495,7536],[0,0,7495,7538],[0,0,7543,7544],[14071,14079,7547,7552],[0,0,7553,7556],[0,0,7547,7557],[0,0,7542,7558],[0,0,7561,7562],[0,0,7563,7567],[0,0,7561,7567],[0,0,7570,7571],[0,0,7572,7576],[0,0,7570,7576],[0,0,7579,7607],[0,0,7570,7607],[0,0,7561,7607],[0,0,7561,7609],[0,0,7559,7611],[0,0,7611,7611],[0,0,7538,7611],[0,0,7634,7635],[14159,14167,7638,7643],[0,0,7644,7645],[0,0,7638,7646],[0,0,7634,7646],[0,0,7611,7646],[0,0,7611,7648],[0,0,7652,7655],[0,0,7658,7672],[14202,14210,7675,7680],[0,0,7681,7684],[0,0,7675,7685],[0,0,7658,7685],[0,0,7658,7687],[0,0,7656,7689],[0,0,7689,7689],[0,0,7648,7689],[0,0,7705,7714],[0,0,7717,7718],[0,0,7719,7727],[0,0,7717,7727],[0,0,7705,7727],[0,0,7689,7727],[0,0,7689,7729],[14353,14358,7749,7754],[0,0,7755,7763],[0,0,7755,7765],[0,0,7767,7775],[0,0,7767,7777],[0,0,7749,7778],[0,0,7729,7778],[0,0,7729,7780],[0,0,7785,7786],[0,0,7787,7790],[0,0,7785,7790],[0,0,7793,7822],[0,0,7825,7836],[0,0,7793,7836],[0,0,7784,7837],[0,0,7840,7841],[0,0,7842,7847],[0,0,7840,7847],[14478,14487,7850,7877],[0,0,7878,7879],[0,0,7880,7885],[0,0,7878,7885],[0,0,7887,7898],[0,0,7900,7928],[0,0,7931,7942],[0,0,7900,7942],[0,0,7945,7946],[0,0,7947,7950],[0,0,7945,7950],[0,0,7900,7950],[14569,14577,7953,7958],[0,0,7959,7960],[0,0,7953,7961],[0,0,7900,7961],[0,0,7850,7962],[0,0,7840,7962],[0,0,7840,7964],[0,0,7838,7966],[0,0,7974,7975],[0,0,7976,7984],[0,0,7974,7984],[0,0,7987,7988],[0,0,7989,7997],[0,0,7987,7997],[14636,14644,8001,8006],[0,0,8007,8008],[0,0,8001,8009],[0,0,8012,8040],[14670,14676,8049,8052],[0,0,8053,8054],[0,0,8049,8055],[0,0,8043,8056],[0,0,8012,8056],[0,0,8001,8056],[0,0,8000,8057],[0,0,7987,8057],[0,0,7974,8057],[0,0,7974,8059],[0,0,7972,8061],[0,0,7966,8062],[0,0,7780,8062],[0,0,8080,8085],[0,0,8062,8085],[0,0,8062,8087],[0,0,8092,8093],[0,0,8094,8097],[0,0,8092,8097],[14739,14747,8100,8105],[0,0,8106,8107],[0,0,8100,8108],[0,0,8111,8122],[0,0,8100,8122],[0,0,8091,8123],[0,0,8126,8136],[0,0,8139,8143],[0,0,8126,8143],[0,0,8126,8145],[0,0,8124,8147],[0,0,8147,8147],[0,0,8087,8147],[0,0,8155,8156],[0,0,8157,8165],[0,0,8155,8165],[0,0,8155,8167],[0,0,8170,8193],[0,0,8194,8204],[0,0,8170,8204],[0,0,8170,8206],[0,0,8154,8207],[0,0,8212,8213],[0,0,8214,8222],[0,0,8212,8222],[0,0,8212,8224],[14923,14929,8239,8242],[0,0,8243,8244],[0,0,8239,8245],[0,0,8233,8246],[0,0,8227,8247],[0,0,8211,8248],[0,0,8153,8249],[0,0,8254,8255],[0,0,8256,8264],[0,0,8254,8264],[0,0,8254,8266],[0,0,8269,8292],[0,0,8293,8303],[0,0,8269,8303],[0,0,8269,8305],[0,0,8253,8306],[0,0,8152,8307],[0,0,8312,8313],[0,0,8314,8322],[0,0,8312,8322],[0,0,8312,8324],[15047,15053,8339,8342],[0,0,8343,8344],[0,0,8339,8345],[0,0,8333,8346],[0,0,8327,8347],[0,0,8311,8348],[0,0,8151,8349],[0,0,8350,8354],[0,0,8354,8354],[0,0,8147,8354],[0,0,8358,8368],[0,0,8371,8372],[0,0,8373,8378],[0,0,8371,8378],[15111,15117,8381,8384],[0,0,8385,8386],[0,0,8381,8387],[0,0,8371,8387],[0,0,8371,8389],[0,0,8411,8442],[0,0,8411,8442],[15152,15158,8443,8446],[0,0,8447,8448],[0,0,8443,8449],[0,0,8411,8450],[15167,15173,8452,8455],[0,0,8456,8457],[0,0,8452,8458],[0,0,8400,8459],[0,0,8390,8459],[0,0,8390,8461],[0,0,8462,8486],[0,0,8487,8490],[15204,15211,8494,8498],[0,0,8499,8504],[0,0,8505,8513],[0,0,8499,8513],[0,0,8499,8515],[0,0,8494,8516],[0,0,8494,8516],[0,0,8462,8516],[0,0,8462,8518],[0,0,8369,8520],[0,0,8520,8520],[0,0,8354,8520],[0,0,8520,8549],[0,0,8550,8555],[0,0,8556,8564],[0,0,8550,8564],[0,0,8550,8566],[0,0,8570,8571],[0,0,8570,8571],[0,0,8520,8571],[0,0,8520,8573],[3375,7550,3167,8617],[9506,15309,0,8617]]);

__shadeup_gen_shader("shd_5749083002000000000000006242000000005772", {
					webgl: {_ext_uniform_global_deadReader: {"type":"array","element":{"type":"primitive","name":"int"}}, _ext_uniform_global_deadCounter: {"type":"array","element":{"type":"primitive","name":"atomic"}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["deadReader",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"int"},"staticSize":1,"access":"write"}}],["deadCounter",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"atomic","element":"i32"},"staticSize":1,"access":"write"}}]]}
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
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_global_deadReader_size: i32,
@align(16) _ext_uniform_global_deadCounter_size: i32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read_write> _ext_uniform_global_deadReader: array<i32>;
@group(%GROUP_INDEX%) @binding(3) var<storage, read_write> _ext_uniform_global_deadCounter: array<atomic<i32>>;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
@compute @workgroup_size(1, 1, 1)
fn main(/*__SHADEUP_TEMPLATE_INPUT*/){
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_ext_uniform_global_deadReader[i32(0)] = atomicLoad(&_ext_uniform_global_deadCounter[i32(0)]);

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
uniform int[0] _ext_uniform_global_deadReader;
uniform atomic_int[0] _ext_uniform_global_deadCounter;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_ext_uniform_global_deadReader[int(0)] = atomicLoad(&_ext_uniform_global_deadCounter[int(0)]);

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4409,4553,284,331],[4237,4403,331,386],[0,0,488,518],[9112,9118,519,522],[0,0,523,524],[0,0,519,525],[0,0,541,572],[0,0,541,572],[9143,9149,573,576],[0,0,577,578],[0,0,573,579],[0,0,541,580],[0,0,529,581],[0,0,529,581],[0,0,488,581],[0,0,488,583],[3155,3219,386,627],[9051,9164,0,627]]);

__shadeup_gen_shader("shd_585386095968817081280000007085053678100007900028", {
					webgl: {_ext_uniform_local_emitter: {"type":"primitive","name":"float2"}, _ext_uniform_global_deadCounter: {"type":"array","element":{"type":"primitive","name":"atomic"}}, _ext_uniform_global_dead: {"type":"array","element":{"type":"primitive","name":"uint"}}, _ext_uniform_global_particles: {"type":"array","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":{"position":{"type":"primitive","name":"float2"},"angle":{"type":"primitive","name":"float"},"velocity":{"type":"primitive","name":"float"},"age":{"type":"primitive","name":"float"},"alive":{"type":"primitive","name":"int"},"goal":{"type":"primitive","name":"float"},"timeline":{"type":"primitive","name":"float"}}}}, _ext_uniform_global_env: {"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":{"time":{"type":"primitive","name":"float"},"frame":{"type":"primitive","name":"int"}}}, _ext_uniform_global_PI: {"type":"primitive","name":"float"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[["emitter",{"type":"primitive","name":"float2"}]],"globals":[["deadCounter",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"atomic","element":"i32"},"staticSize":1,"access":"write"}}],["dead",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"uint"},"staticSize":1,"access":"write"}}],["particles",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"struct","name":"str_i_main_ts_2739_Particle","fields":[["position",{"type":"primitive","name":"float2"}],["angle",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["age",{"type":"primitive","name":"float"}],["alive",{"type":"primitive","name":"int"}],["goal",{"type":"primitive","name":"float"}],["timeline",{"type":"primitive","name":"float"}]]},"staticSize":1,"access":"write"}}],["env",{"fileName":"/_std/native.ts","structure":{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["time",{"type":"primitive","name":"float"}],["frame",{"type":"primitive","name":"int"}]]}}],["PI",{"fileName":"/_std/common.ts","structure":{"type":"primitive","name":"float"}}]]}
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
struct str_i_main_ts_2739_Particle {
 @align(16)  position: vec2<f32>,
 @align(16)  angle: f32,
 @align(16)  velocity: f32,
 @align(16)  age: f32,
 @align(16)  alive: i32,
 @align(16)  goal: f32,
 @align(16)  timeline: f32,

};
fn _make_struct_str_i_main_ts_2739_Particle(  age: f32,  alive: i32,  angle: f32,  goal: f32,  position: vec2<f32>,  timeline: f32,  velocity: f32,) -> str_i_main_ts_2739_Particle {
var _s: str_i_main_ts_2739_Particle;
  _s.age = age;
  _s.alive = alive;
  _s.angle = angle;
  _s.goal = goal;
  _s.position = position;
  _s.timeline = timeline;
  _s.velocity = velocity;

return _s; 
}
struct str_i_iistd_native_ts_387_FrameContext {
//  @align(16)  deltaTime: f32,
 @align(16)  time: f32,
//  @align(16)  screenSize: vec2<f32>,
 @align(16)  frame: i32,
//   mouse: str_i_iistd_native_ts_1719_MouseInputState,
//   keyboard: str_i_iistd_native_ts_3334_KeyboardInputState,
//   camera: str_i_iistd_common_ts_10681_Camera,
//   camera2d: str_i_iistd_common_ts_9656_Camera2d,

};
fn _make_struct_str_i_iistd_native_ts_387_FrameContext(  frame: i32,  time: f32,) -> str_i_iistd_native_ts_387_FrameContext {
var _s: str_i_iistd_native_ts_387_FrameContext;
  _s.frame = frame;
  _s.time = time;

return _s; 
}
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_local_emitter: vec2<f32>,
@align(16) _ext_uniform_global_deadCounter_size: i32,
@align(16) _ext_uniform_global_dead_size: i32,
@align(16) _ext_uniform_global_particles_size: i32,
_ext_uniform_global_env: str_i_iistd_native_ts_387_FrameContext,
@align(16) _ext_uniform_global_PI: f32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read_write> _ext_uniform_global_deadCounter: array<atomic<i32>>;
@group(%GROUP_INDEX%) @binding(3) var<storage, read_write> _ext_uniform_global_dead: array<u32>;
@group(%GROUP_INDEX%) @binding(4) var<storage, read_write> _ext_uniform_global_particles: array<str_i_main_ts_2739_Particle>;
fn fn_iistd_math_ts_40744_rand2(seed_const: vec2<f32>) -> f32 {
var seed = seed_const;
return fract(sin(dot(seed, vec2<f32>(12.9898, 4.1414))) * f32(43758.5453));

}

fn fn_iimain_ts_6181_spawnParticle(p_const: str_i_main_ts_2739_Particle) {
var p = p_const;
var idx: i32 = atomicAdd(&_ext_uniform_global_deadCounter[i32(0)], -(i32(1)));
atomicMax(&_ext_uniform_global_deadCounter[i32(0)], i32(0));
if ((idx < i32(0))) 
{
return;

}
var realIndex: u32 = _ext_uniform_global_dead[idx];
_ext_uniform_global_dead[idx] = u32(0);
p.alive = i32(1);
p.age = f32(i32(0));
p.goal = f32(i32(0));
p.timeline = f32(-(i32(1)));
_ext_uniform_global_particles[realIndex] = p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
@compute @workgroup_size(16, 1, 1)
fn main(/*__SHADEUP_TEMPLATE_INPUT*/){
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
fn_iimain_ts_6181_spawnParticle(_make_struct_str_i_main_ts_2739_Particle(
/* age: */ f32(0.0)
, /* alive: */ i32(0)
, /* angle: */ f32(i32(0)) * fn_iistd_math_ts_40744_rand2(vec2<f32>(f32(_i_in.globalId.x) / f32(1452), _in_uniforms._ext_uniform_global_env.time)) * _in_uniforms._ext_uniform_global_PI / f32(i32(14))
, /* goal: */ f32(0.0)
, /* position: */ _in_uniforms._ext_uniform_local_emitter + vec2<f32>(f32(i32(0)), fn_iistd_math_ts_40744_rand2(vec2<f32>(f32(_i_in.globalId.x) / f32(103), f32(_in_uniforms._ext_uniform_global_env.frame))) * f32(20) - f32(30))
, /* timeline: */ f32(0.0)
, /* velocity: */ f32(i32(1250)) + fn_iistd_math_ts_40744_rand2(vec2<f32>(f32(_i_in.globalId.x) / f32(1452), _in_uniforms._ext_uniform_global_env.time / f32(i32(4512)))) * f32(i32(200))

));

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
struct str_i_main_ts_2739_Particle {
//   vec2 position;
//   float angle;
//   float velocity;
  float age;
  int alive;
  float goal;
  float timeline;

};
str_i_main_ts_2739_Particle _make_struct_str_i_main_ts_2739_Particle(float age, int alive, float goal, float timeline) {
str_i_main_ts_2739_Particle _s;  _s.age = age;
  _s.alive = alive;
  _s.goal = goal;
  _s.timeline = timeline;
  return _s;
}
struct str_i_iistd_native_ts_387_FrameContext {
//   float deltaTime;
  float time;
//   vec2 screenSize;
  int frame;
//   str_i_iistd_native_ts_1719_MouseInputState mouse;
//   str_i_iistd_native_ts_3334_KeyboardInputState keyboard;
//   str_i_iistd_common_ts_10681_Camera camera;
//   str_i_iistd_common_ts_9656_Camera2d camera2d;

};
str_i_iistd_native_ts_387_FrameContext _make_struct_str_i_iistd_native_ts_387_FrameContext(float time, int frame) {
str_i_iistd_native_ts_387_FrameContext _s;  _s.time = time;
  _s.frame = frame;
  return _s;
}
uniform atomic_int[0] _ext_uniform_global_deadCounter;
uniform uint[0] _ext_uniform_global_dead;
uniform str_i_main_ts_2739_Particle[0] _ext_uniform_global_particles;
uniform vec2 _ext_uniform_local_emitter;
uniform str_i_iistd_native_ts_387_FrameContext _ext_uniform_global_env;
uniform float _ext_uniform_global_PI;
float fn_iistd_math_ts_40744_rand2(vec2 seed) {
return fract(sin(dot(seed, vec2(12.9898, 4.1414))) * float(43758.5453));

}

void fn_iimain_ts_6181_spawnParticle(str_i_main_ts_2739_Particle p) {
int idx = atomicAdd(&_ext_uniform_global_deadCounter[int(0)], -(int(1)));
atomicMax(&_ext_uniform_global_deadCounter[int(0)], int(0));
if ((float(idx) < float(int(0)))){
return;

}uint realIndex = _ext_uniform_global_dead[idx];
_ext_uniform_global_dead[idx] = uint(0);
p.alive = int(1);
p.age = int(0);
p.goal = int(0);
p.timeline = -(int(1));
_ext_uniform_global_particles[realIndex] = p;

}


/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
fn_iimain_ts_6181_spawnParticle(_make_struct_str_i_main_ts_2739_Particle(
/* age: */ float(0.0)
, /* alive: */ int(0)
, /* angle: */ float(int(0)) * fn_iistd_math_ts_40744_rand2(vec2(float(_i_in.globalId.x) / float(1452), _ext_uniform_global_env.time)) * _ext_uniform_global_PI / float(int(14))
, /* goal: */ float(0.0)
, /* position: */ _ext_uniform_local_emitter + vec2(int(0), fn_iistd_math_ts_40744_rand2(vec2(float(_i_in.globalId.x) / float(103), _ext_uniform_global_env.frame)) * float(20) - float(30))
, /* timeline: */ float(0.0)
, /* velocity: */ float(int(1250)) + fn_iistd_math_ts_40744_rand2(vec2(float(_i_in.globalId.x) / float(1452), _ext_uniform_global_env.time / float(int(4512)))) * float(int(200))

));

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[3283,3310,321,341],[3312,3335,341,359],[3337,3363,359,380],[3365,3386,380,393],[3388,3409,393,406],[3411,3433,406,420],[3435,3461,420,438],[2739,3748,284,442],[2739,3748,442,689],[493,510,737,759],[577,589,759,773],[623,642,773,795],[674,685,795,808],[745,792,808,863],[842,898,863,924],[972,1002,924,972],[1007,1043,972,1023],[387,1715,689,1027],[387,1715,1027,1238],[4237,4403,1238,1293],[4559,4693,1293,1335],[4058,4231,1335,1405],[7564,7635,1405,1446],[16316,16333,1446,1518],[1922,2070,1518,1556],[0,0,1591,1600],[40798,40802,1611,1616],[40807,40810,1617,1620],[40811,40814,1621,1624],[0,0,1625,1629],[0,0,1636,1643],[0,0,1645,1651],[0,0,1631,1652],[0,0,1621,1653],[0,0,1617,1654],[40848,40853,1657,1662],[0,0,1663,1673],[0,0,1657,1674],[0,0,1617,1674],[0,0,1611,1675],[0,0,1604,1677],[0,0,1556,1681],[0,0,1718,1747],[0,0,1772,1803],[0,0,1772,1803],[6247,6253,1804,1807],[0,0,1808,1809],[0,0,1804,1810],[0,0,1772,1811],[6272,6278,1815,1818],[0,0,1819,1820],[0,0,1815,1821],[0,0,1813,1822],[0,0,1761,1823],[0,0,1751,1823],[0,0,1751,1825],[0,0,1836,1867],[0,0,1836,1867],[6305,6311,1868,1871],[0,0,1872,1873],[0,0,1868,1874],[0,0,1836,1875],[6320,6326,1877,1880],[0,0,1881,1882],[0,0,1877,1883],[0,0,1825,1884],[0,0,1825,1886],[0,0,1897,1900],[0,0,1891,1901],[6348,6354,1910,1913],[0,0,1914,1915],[0,0,1910,1916],[0,0,1904,1917],[0,0,1890,1918],[0,0,1921,1929],[0,0,1919,1931],[0,0,1931,1931],[0,0,1886,1931],[0,0,1948,1972],[0,0,1948,1972],[0,0,1973,1976],[0,0,1948,1977],[0,0,1931,1977],[0,0,1931,1979],[0,0,1979,2003],[0,0,2004,2007],[6429,6436,2011,2015],[0,0,2016,2017],[0,0,2011,2018],[0,0,2011,2018],[0,0,1979,2018],[0,0,1979,2020],[0,0,2020,2021],[0,0,2022,2027],[0,0,2020,2027],[6452,6458,2030,2033],[0,0,2034,2035],[0,0,2030,2036],[0,0,2020,2036],[0,0,2020,2038],[0,0,2038,2039],[0,0,2040,2043],[0,0,2038,2043],[6471,6477,2046,2049],[0,0,2050,2051],[0,0,2046,2052],[0,0,2038,2052],[0,0,2038,2054],[0,0,2054,2055],[0,0,2056,2060],[0,0,2054,2060],[6491,6497,2063,2066],[0,0,2067,2068],[0,0,2063,2069],[0,0,2054,2069],[0,0,2054,2071],[0,0,2071,2072],[0,0,2073,2081],[0,0,2071,2081],[6525,6531,2086,2089],[0,0,2090,2091],[0,0,2086,2092],[0,0,2084,2093],[0,0,2071,2093],[0,0,2071,2095],[0,0,2095,2124],[0,0,2125,2134],[0,0,2138,2139],[0,0,2138,2139],[0,0,2095,2139],[0,0,2095,2141],[1654,1917,1681,2145],[8244,8257,2247,2278],[0,0,2321,2343],[0,0,2345,2365],[8675,8681,2386,2389],[0,0,2390,2391],[0,0,2386,2392],[0,0,2380,2393],[8686,8691,2396,2424],[0,0,2436,2441],[0,0,2442,2450],[0,0,2436,2450],[0,0,2436,2452],[0,0,2430,2453],[8746,8754,2456,2461],[0,0,2462,2466],[0,0,2456,2467],[0,0,2430,2467],[0,0,2469,2492],[0,0,2493,2497],[0,0,2469,2497],[0,0,2425,2498],[0,0,2396,2499],[0,0,2380,2499],[0,0,2502,2524],[0,0,2380,2524],[8786,8792,2533,2536],[0,0,2537,2539],[0,0,2533,2540],[0,0,2527,2541],[0,0,2380,2541],[0,0,2367,2542],[0,0,2544,2567],[0,0,2585,2611],[8313,8319,2619,2622],[0,0,2623,2624],[0,0,2619,2625],[8340,8345,2627,2655],[0,0,2667,2672],[0,0,2673,2681],[0,0,2667,2681],[0,0,2667,2683],[0,0,2661,2684],[8400,8408,2687,2692],[0,0,2693,2696],[0,0,2687,2697],[0,0,2661,2697],[0,0,2699,2722],[0,0,2723,2728],[0,0,2699,2728],[0,0,2656,2729],[0,0,2627,2730],[8432,8440,2733,2738],[0,0,2739,2741],[0,0,2733,2742],[0,0,2627,2742],[8450,8458,2745,2750],[0,0,2751,2753],[0,0,2745,2754],[0,0,2627,2754],[0,0,2614,2755],[0,0,2585,2755],[0,0,2569,2756],[0,0,2758,2785],[8489,8495,2809,2812],[0,0,2813,2817],[0,0,2809,2818],[0,0,2803,2819],[8511,8516,2822,2850],[0,0,2862,2867],[0,0,2868,2876],[0,0,2862,2876],[0,0,2862,2878],[0,0,2856,2879],[8571,8579,2882,2887],[0,0,2888,2892],[0,0,2882,2893],[0,0,2856,2893],[0,0,2895,2918],[0,0,2919,2923],[0,0,2895,2923],[8609,8615,2932,2935],[0,0,2936,2940],[0,0,2932,2941],[0,0,2926,2942],[0,0,2895,2942],[0,0,2851,2943],[0,0,2822,2944],[8627,8633,2953,2956],[0,0,2957,2960],[0,0,2953,2961],[0,0,2947,2962],[0,0,2822,2962],[0,0,2803,2962],[0,0,2787,2963],[0,0,2279,2965],[0,0,2247,2966],[0,0,2247,2968],[2815,3104,2145,3012],[8209,8804,0,3012]]);

__shadeup_gen_shader("shd_000202361802900000310029009614880000071542498", {
					webgl: {_ext_uniform_global_dead: {"type":"array","element":{"type":"primitive","name":"uint"}}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["dead",{"fileName":"/main.ts","structure":{"type":"buffer","element":{"type":"primitive","name":"uint"},"staticSize":1,"access":"write"}}]]}
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
struct _InUniformsStruct {
/*SHADEUP_UNIFORM_STRUCT_START*/
@align(16) _ext_uniform_global_dead_size: i32,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(2) var<storage, read_write> _ext_uniform_global_dead: array<u32>;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
@compute @workgroup_size(32, 1, 1)
fn main(/*__SHADEUP_TEMPLATE_INPUT*/){
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_ext_uniform_global_dead[_i_in.globalId.x] = u32(_i_in.globalId.x);

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
uniform uint[0] _ext_uniform_global_dead;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
_ext_uniform_global_dead[_i_in.globalId.x] = uint(_i_in.globalId.x);

/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4559,4693,284,326],[0,0,428,452],[0,0,453,458],[0,0,459,467],[0,0,453,467],[0,0,453,469],[5972,5979,473,477],[0,0,478,483],[0,0,484,492],[0,0,478,492],[0,0,478,494],[0,0,473,495],[0,0,473,495],[0,0,428,495],[0,0,428,497],[1512,1579,326,541],[5885,6015,0,541]]);

__shadeup_gen_shader("shd_1000000400760000600950170270320255400369800", {
					webgl: {_ext_uniform_global_tex: {"type":"primitive","name":"texture2d"}, _ext_uniform_global_tex2: {"type":"primitive","name":"texture2d"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["tex",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"read"}}],["tex2",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"read"}}]]}
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
@align(16) _ext_uniform_global_tex2_size: vec2<f32>,
};
@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;
@group(%GROUP_INDEX%) @binding(3) var _ext_uniform_global_tex2_texture: texture_2d<f32>;
@group(%GROUP_INDEX%) @binding(4) var _ext_uniform_global_tex2: sampler;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
fn main(/*__SHADEUP_TEMPLATE_INPUT*/)-> /*__SHADEUP_TEMPLATE_OUTPUT*/{
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
if (((_i_in.screen.x < vec2<f32>(textureDimensions(_ext_uniform_global_tex_texture)).x) && (_i_in.screen.y < vec2<f32>(textureDimensions(_ext_uniform_global_tex_texture)).y))) 
{
_i_out.color = textureLoad(_ext_uniform_global_tex2_texture, vec2<u32>(_i_in.screen), 0).xyzw;

}

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
uniform sampler2D _ext_uniform_global_tex2;
uniform vec2 _ext_uniform_global_tex2_size;

/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/
void main() {
/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/
if (((_i_in.screen.x < _ext_uniform_global_tex_size.x) && (_i_in.screen.y < _ext_uniform_global_tex_size.y))){
_i_out.color = texelFetch(_ext_uniform_global_tex2, ivec2(_i_in.screen), 0).xyzw;

}
/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[3753,3898,401,444],[3753,3898,444,487],[3904,4052,487,531],[3904,4052,531,575],[0,0,683,688],[0,0,689,695],[0,0,683,695],[0,0,683,697],[0,0,700,723],[0,0,700,728],[0,0,700,730],[0,0,682,731],[0,0,736,741],[0,0,742,748],[0,0,736,748],[0,0,736,750],[0,0,753,776],[0,0,753,781],[0,0,753,783],[0,0,735,784],[0,0,681,785],[0,0,788,794],[0,0,795,800],[0,0,788,800],[0,0,814,838],[0,0,846,851],[0,0,852,858],[0,0,846,858],[0,0,803,868],[0,0,788,868],[0,0,788,870],[0,0,786,872],[0,0,872,872],[0,0,677,872],[1267,1384,575,916],[5427,5634,0,916]]);

__shadeup_gen_shader("shd_00900000000740000460000000035000000", {
					webgl: {_ext_uniform_global_tex: {"type":"primitive","name":"texture2d"}},
					webgpu: {"attributeInput":"","attributeOutput":"","locals":[],"globals":[["tex",{"fileName":"/main.ts","structure":{"type":"primitive","name":"texture2d","access":"read"}}]]}
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
if (((_i_in.screen.x < vec2<f32>(textureDimensions(_ext_uniform_global_tex_texture)).x) && (_i_in.screen.y < vec2<f32>(textureDimensions(_ext_uniform_global_tex_texture)).y))) 
{
_i_out.color = textureLoad(_ext_uniform_global_tex_texture, vec2<u32>(_i_in.screen), 0).xyzw;

}

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
if (((_i_in.screen.x < _ext_uniform_global_tex_size.x) && (_i_in.screen.y < _ext_uniform_global_tex_size.y))){
_i_out.color = texelFetch(_ext_uniform_global_tex, ivec2(_i_in.screen), 0).xyzw;

}
/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/
}
`, software: () => {}}, [[2830,2865,21,38],[2939,2972,38,53],[3048,3082,53,69],[3162,3198,69,87],[3242,3284,87,108],[3289,3331,108,129],[3400,3426,129,140],[3502,3532,140,155],[3609,3644,155,169],[3690,3720,169,186],[3768,3800,186,205],[3879,3910,205,223],[3956,3986,223,240],[4051,4074,240,261],[4123,4144,261,280],[2728,4283,0,284],[4371,4409,306,323],[4444,4477,323,338],[4513,4547,338,354],[4585,4621,354,372],[4655,4681,372,383],[4714,4749,383,397],[4309,4869,284,401],[3753,3898,401,444],[3753,3898,444,487],[0,0,595,600],[0,0,601,607],[0,0,595,607],[0,0,595,609],[0,0,612,635],[0,0,612,640],[0,0,612,642],[0,0,594,643],[0,0,648,653],[0,0,654,660],[0,0,648,660],[0,0,648,662],[0,0,665,688],[0,0,665,693],[0,0,665,695],[0,0,647,696],[0,0,593,697],[0,0,700,706],[0,0,707,712],[0,0,700,712],[0,0,726,749],[0,0,757,762],[0,0,763,769],[0,0,757,769],[0,0,715,779],[0,0,700,779],[0,0,700,781],[0,0,698,783],[0,0,783,783],[0,0,589,783],[1130,1246,487,827],[5107,5313,0,827]]);

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
define(["require", "exports", "/std_math", "/std_math", "/std___std_all", "/_std/drawIndexed", "/_std/common", "/_std/mesh", "./logoPath"], function (require, exports, __, std_math_1, std___std_all_1, drawIndexed_1, common_1, mesh_1, logoPath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    __ = __importStar(__);
    var globalVarGet = std___std_all_1.globalVarGet;
    var logoBuf = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "logoBuf", function () { return (0, common_1.buffer)((logoPath_1.logoPath.len() | 0), "float2", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"float2\"}"))); }, function () { return logoBuf; });
    var logoBuf2 = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "logoBuf2", function () { return (0, common_1.buffer)((logoPath_1.logoPath2.len() | 0), "float2", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"float2\"}"))); }, function () { return logoBuf2; });
    //let xy = "abc" + 124;
    var deathNear = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "deathNear", function () { return 6.9; }, function () { return deathNear; });
    for (var i = (0 | 0); i < (logoBuf.len() | 0); i++) {
        logoBuf.__index_assign(i, logoPath_1.logoPath[i]);
    }
    for (var i = (0 | 0); i < (logoBuf2.len() | 0); i++) {
        logoBuf2.__index_assign(i, logoPath_1.logoPath2[i]);
    }
    logoBuf.upload();
    var numLogoPoints = ((0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "numLogoPoints", function () { return (logoBuf.len() | 0); }, function () { return numLogoPoints; }) | 0);
    logoBuf2.upload();
    var numLogoPoints2 = ((0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "numLogoPoints2", function () { return (logoBuf2.len() | 0); }, function () { return numLogoPoints2; }) | 0);
    /**@shadeup=struct*/ var Particle = /** @class */ (function () {
        function Particle(data) {
            var _a, _b, _c, _d, _e, _f, _g;
            this.position = ((_a = data.position) !== null && _a !== void 0 ? _a : __.FM.float_2_1_1(0.0, 0.0));
            this.angle = ((_b = data.angle) !== null && _b !== void 0 ? _b : 0.0);
            this.velocity = ((_c = data.velocity) !== null && _c !== void 0 ? _c : 0.0);
            this.age = ((_d = data.age) !== null && _d !== void 0 ? _d : 0.0);
            this.alive = ((_e = data.alive) !== null && _e !== void 0 ? _e : (0 | 0));
            this.goal = ((_f = data.goal) !== null && _f !== void 0 ? _f : 0.0);
            this.timeline = ((_g = data.timeline) !== null && _g !== void 0 ? _g : 0.0);
        }
        Particle.prototype.clone = function () {
            return new Particle({
                position: (0, std___std_all_1.__deepClone)(this.position),
                angle: (0, std___std_all_1.__deepClone)(this.angle),
                velocity: (0, std___std_all_1.__deepClone)(this.velocity),
                age: (0, std___std_all_1.__deepClone)(this.age),
                alive: (0, std___std_all_1.__deepClone)(this.alive),
                goal: (0, std___std_all_1.__deepClone)(this.goal),
                timeline: (0, std___std_all_1.__deepClone)(this.timeline),
            });
        };
        Particle.prototype._getStructure = function () {
            return JSON.parse("{\"type\":\"struct\",\"name\":\"str_i_main_ts_2739_Particle\",\"fields\":[[\"position\",{\"type\":\"primitive\",\"name\":\"float2\"}],[\"angle\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"velocity\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"age\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"alive\",{\"type\":\"primitive\",\"name\":\"int\"}],[\"goal\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"timeline\",{\"type\":\"primitive\",\"name\":\"float\"}]]}");
        };
        return Particle;
    }());
    __shadeup_register_struct(JSON.parse("{\"type\":\"struct\",\"name\":\"str_i_main_ts_2739_Particle\",\"fields\":[[\"position\",{\"type\":\"primitive\",\"name\":\"float2\"}],[\"angle\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"velocity\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"age\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"alive\",{\"type\":\"primitive\",\"name\":\"int\"}],[\"goal\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"timeline\",{\"type\":\"primitive\",\"name\":\"float\"}]]}"), Particle)
    var tex = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "tex", function () { return (0, common_1.texture2d)(env.screenSize, "auto", "float4"); }, function () { return tex; });
    var tex2 = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "tex2", function () { return (0, common_1.texture2d)(env.screenSize, "auto", "float4"); }, function () { return tex2; });
    var particles = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "particles", function () { return (0, common_1.buffer)((1024 | 0) * (32 | 0), "Particle", __assign(__assign({}, JSON.parse("{\"type\":\"struct\",\"name\":\"str_i_main_ts_2739_Particle\",\"fields\":[[\"position\",{\"type\":\"primitive\",\"name\":\"float2\"}],[\"angle\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"velocity\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"age\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"alive\",{\"type\":\"primitive\",\"name\":\"int\"}],[\"goal\",{\"type\":\"primitive\",\"name\":\"float\"}],[\"timeline\",{\"type\":\"primitive\",\"name\":\"float\"}]]}")), { __type: Particle })); }, function () { return particles; });
    var deadCounter = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "deadCounter", function () { return (0, common_1.buffer)((1 | 0), "atomic<int>", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"atomic\",\"element\":\"i32\"}"))); }, function () { return deadCounter; });
    var deadReader = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "deadReader", function () { return (0, common_1.buffer)((1 | 0), "int", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"int\"}"))); }, function () { return deadReader; });
    var dead = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "dead", function () { return (0, common_1.buffer)((particles.len() | 0), "uint", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"uint\"}"))); }, function () { return dead; });
    function checkTex() {
        var _this = this;
        if (__.or(tex.size[0] != env.screenSize[0], tex.size[1] != env.screenSize[1])) {
            var newTex = (0, common_1.texture2d)(env.screenSize, "auto", "float4");
            var newTex2 = (0, common_1.texture2d)(env.screenSize, "auto", "float4");
            newTex.draw(__shadeup_make_shader_inst("shd_00900000000740000460000000035000000", { _ext_uniform_global_tex: globalVarGet("_slash_main_dot_ts", "tex") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (__.and(__in.screen[0] < tex.size[0], __in.screen[1] < tex.size[1])) {
                        __out.color = tex.__index(__in.screen);
                    }
                    return [2 /*return*/];
                });
            }); }));
            newTex2.draw(__shadeup_make_shader_inst("shd_1000000400760000600950170270320255400369800", { _ext_uniform_global_tex: globalVarGet("_slash_main_dot_ts", "tex"), _ext_uniform_global_tex2: globalVarGet("_slash_main_dot_ts", "tex2") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (__.and(__in.screen[0] < tex.size[0], __in.screen[1] < tex.size[1])) {
                        __out.color = tex2.__index(__in.screen);
                    }
                    return [2 /*return*/];
                });
            }); }));
            tex.destroy();
            tex = newTex;
            tex2.destroy();
            tex2 = newTex2;
        }
    }
    (0, std___std_all_1.compute)(__.intifyVector(__.makeVector((particles.len() | 0) / (32 | 0), (1 | 0), (1 | 0))), __shadeup_make_shader_inst("shd_000202361802900000310029009614880000071542498", { _ext_uniform_global_dead: globalVarGet("_slash_main_dot_ts", "dead") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            dead.__index_assign(__in.globalId[0], (__.swizzle(__in.globalId, 'x') >>> 0));
            return [2 /*return*/];
        });
    }); }));
    deadCounter.__index((0 | 0)).store((particles.len() | 0) - (1 | 0));
    deadCounter.upload();
    function spawnParticle(p) {
        var idx = (deadCounter.__index((0 | 0)).add((__.FM.negate_1((1 | 0)))) | 0);
        (deadCounter.__index((0 | 0)).max((0 | 0)) | 0);
        if (idx < (0 | 0)) {
            return;
        }
        var realIndex = dead.uintArray[idx];
        dead.__index_assign(idx, (0 >>> 0));
        p.alive = (1 | 0);
        p.age = (0 | 0);
        p.goal = (0 | 0);
        p.timeline = (__.FM.negate_1((1 | 0)));
        particles.__index_assign(realIndex, p);
    }
    function lerpAngle(a, b, t) {
        var av = __.makeVector(Math.cos(a), Math.sin(a));
        var bv = __.makeVector(Math.cos(b), Math.sin(b));
        var cv = (0, std_math_1.normalize)((0, std_math_1.lerp)(av, bv, t));
        return (0, std_math_1.atan2)(cv[1], cv[0]);
    }
    var totalToSpawn = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "totalToSpawn", function () { return 0.0; }, function () { return totalToSpawn; });
    var lastScroll = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "lastScroll", function () { return 0.0; }, function () { return lastScroll; });
    var targetsBuf = (0, std___std_all_1.globalVarInit)("_slash_main_dot_ts", "targetsBuf", function () { return (0, common_1.buffer)((100 | 0), "float2", __assign({}, JSON.parse("{\"type\":\"primitive\",\"name\":\"float2\"}"))); }, function () { return targetsBuf; });
    function main() {
        var _this = this;
        var _a, _b, _c, _d;
        var deltaTime = env.deltaTime;
        if (deltaTime > ((1 | 0) / (60 | 0))) {
            deltaTime = (1 | 0) / (60 | 0);
        }
        checkTex();
        var mouse = env.input("mouse", env.mouse.screen);
        var scroll = env.input("scroll", 0.0);
        var targets = env.input("targets", []);
        var emitter = __.makeVector(0.0, env.screenSize[1]);
        var overrideColor = env.input("color", __.intifyVector(__.makeVector((0 | 0), (0 | 0), (0 | 0), (0 | 0))));
        var numTargets = (targets.len() | 0);
        if (numTargets > (0 | 0)) {
            for (var i = (0 | 0); i < numTargets; i++) {
                targetsBuf.__index_assign(i, targets[i]);
            }
        }
        totalToSpawn = totalToSpawn + (4 | 0) * (144 | 0) * deltaTime;
        var thisFrame = Math.floor(totalToSpawn);
        (0, std___std_all_1.compute)(__.intifyVector(__.makeVector((2 | 0), (1 | 0), (1 | 0))), __shadeup_make_shader_inst("shd_585386095968817081280000007085053678100007900028", { _ext_uniform_local_emitter: emitter, _ext_uniform_global_deadCounter: globalVarGet("_slash_main_dot_ts", "deadCounter"), _ext_uniform_global_dead: globalVarGet("_slash_main_dot_ts", "dead"), _ext_uniform_global_particles: globalVarGet("_slash_main_dot_ts", "particles"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env"), _ext_uniform_global_PI: globalVarGet("_slash__std_slash_common_dot_ts", "PI") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var _e, _f;
            return __generator(this, function (_g) {
                spawnParticle(new Particle({ position: (_e = emitter, _f = __.makeVector((0 | 0), (0, std_math_1.rand2)(__.makeVector(__in.globalId[0] / 103.0, env.frame)) * 20.0 - 30.0), [_e[0] + _f[0], _e[1] + _f[1]]), velocity: (1250 | 0) + (0, std_math_1.rand2)(__.makeVector(__in.globalId[0] / 1452.0, env.time / (4512 | 0))) * (200 | 0), angle: (0 | 0) * (0, std_math_1.rand2)(__.makeVector(__in.globalId[0] / 1452.0, env.time)) * common_1.PI / (14 | 0) }));
                return [2 /*return*/];
            });
        }); }));
        totalToSpawn = totalToSpawn - thisFrame;
        (0, std___std_all_1.compute)((_a = (1 | 0), [_a, _a, _a]), __shadeup_make_shader_inst("shd_5749083002000000000000006242000000005772", { _ext_uniform_global_deadReader: globalVarGet("_slash_main_dot_ts", "deadReader"), _ext_uniform_global_deadCounter: globalVarGet("_slash_main_dot_ts", "deadCounter") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                deadReader.__index_assign((0 | 0), (deadCounter.__index((0 | 0)).load() | 0));
                return [2 /*return*/];
            });
        }); }));
        //deadReader.download();
        //stat("pool", deadReader[0]);
        var mat2 = env.camera.getCombinedMatrix();
        (0, std___std_all_1.compute)(__.intifyVector(__.makeVector((particles.len() | 0) / (32 | 0), (1 | 0), (1 | 0))), __shadeup_make_shader_inst("shd_08708500520000900005000007802065008012", { _ext_uniform_local_numTargets: numTargets, _ext_uniform_local_scroll: scroll, _ext_uniform_local_deltaTime: deltaTime, _ext_uniform_local_mouse: mouse, _ext_uniform_global_particles: globalVarGet("_slash_main_dot_ts", "particles"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env"), _ext_uniform_global_logoBuf: globalVarGet("_slash_main_dot_ts", "logoBuf"), _ext_uniform_global_logoBuf2: globalVarGet("_slash_main_dot_ts", "logoBuf2"), _ext_uniform_global_targetsBuf: globalVarGet("_slash_main_dot_ts", "targetsBuf"), _ext_uniform_global_numLogoPoints2: globalVarGet("_slash_main_dot_ts", "numLogoPoints2"), _ext_uniform_global_numLogoPoints: globalVarGet("_slash_main_dot_ts", "numLogoPoints"), _ext_uniform_global_deathNear: globalVarGet("_slash_main_dot_ts", "deathNear"), _ext_uniform_global_deadCounter: globalVarGet("_slash_main_dot_ts", "deadCounter"), _ext_uniform_global_dead: globalVarGet("_slash_main_dot_ts", "dead") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            function trans(p) {
                var _a, _b, _c, _d;
                var tt = scroll / 500.0;
                var mat3 = __.float2x2(Math.cos(tt), (__.FM.negate_1(Math.sin(tt))), Math.sin(tt), Math.cos(tt));
                return _a = __.mul((_c = p, _d = 0.5, [_c[0] - _d, _c[1] - _d]), mat3), _b = 0.5, [_a[0] + _b, _a[1] + _b];
            }
            var p, deathOffset, targetPos, hit, angleAmount, basePos, size, use2, logoSize, firstPos, t, index, sub, a, b, d, targetVelocity, deltaPos, targetAngle, shouldKill, idx;
            var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
            return __generator(this, function (_15) {
                p = particles.__index(__in.globalId[0]);
                if (p.alive == (0 | 0)) {
                    return [2 /*return*/];
                }
                if (numTargets > (0 | 0)) {
                    p.goal = p.goal + 0.5;
                }
                deathOffset = (0, std_math_1.rand)(__in.globalId[0] / 15325.0) * (1 | 0);
                p.age = p.age + deltaTime;
                p.position = (_e = p.position, _f = (_g = (_j = __.makeVector(Math.cos(p.angle), Math.sin(p.angle)), _k = p.velocity, [_j[0] * _k, _j[1] * _k]), _h = deltaTime, [_g[0] * _h, _g[1] * _h]), [_e[0] + _f[0], _e[1] + _f[1]]);
                targetPos = mouse;
                hit = false;
                angleAmount = 7.5;
                if (p.goal >= 0.5) {
                    targetPos = env.screenSize;
                    angleAmount = 10.0;
                    basePos = __.makeVector(env.screenSize[0] / 1.5, env.screenSize[1] / (8 | 0));
                    size = (_l = (env.screenSize[1] / 1.2), [_l, _l]);
                    __.swizzle(basePos, 'x', env.screenSize[0] - size[0] - (150 | 0));
                    use2 = (0, std_math_1.rand)(__in.globalId[0] / 105320.0) < 0.67;
                    logoSize = __.intifyVector(__.makeVector((675 | 0), (675 | 0)));
                    firstPos = (_m = basePos, _o = (_p = trans((_r = (_t = logoBuf.__index((0 | 0)), [_t[0], _t[1]]), _s = logoSize, [_r[0] / _s[0], _r[1] / _s[1]])), _q = size, [_p[0] * _q[0], _p[1] * _q[1]]), [_m[0] + _o[0], _m[1] + _o[1]]);
                    if (use2) {
                        firstPos = (_u = basePos, _v = (_w = trans((_y = (_0 = logoBuf2.__index((0 | 0)), [_0[0], _0[1]]), _z = logoSize, [_y[0] / _z[0], _y[1] / _z[1]])), _x = size, [_w[0] * _x[0], _w[1] * _x[1]]), [_u[0] + _v[0], _u[1] + _v[1]]);
                    }
                    if (numTargets > (0 | 0)) {
                        firstPos = targetsBuf.__index((0 | 0));
                    }
                    if (p.timeline < (0 | 0)) {
                        targetPos = firstPos;
                        targetPos = (_1 = targetPos, _2 = (_3 = __.makeVector((0, std_math_1.rand3)(__.makeVector(__in.globalId[0] / 14502.4, 132.52, (55 | 0))), (0, std_math_1.rand3)(__.makeVector(__in.globalId[0] / 5325.3, 5123.2, (234 | 0)))), _4 = (50 | 0), [_3[0] * _4, _3[1] * _4]), [_1[0] + _2[0], _1[1] + _2[1]]);
                        if ((0, std_math_1.dist)(targetPos, p.position) < (100 | 0)) {
                            p.timeline = 1.0;
                        }
                        if (numTargets == (0 | 0)) {
                            if (use2) {
                                p.angle = p.angle + (Math.cos((__in.globalId[0] + p.age) / 5000.0) * deltaTime * 10.0);
                            }
                            else {
                                p.angle = p.angle + (Math.sin((__in.globalId[0] + p.age) / 2400.0) * deltaTime * 6.0);
                            }
                        }
                    }
                    else { //p.timeline += deltaTime * 5.0;
                        t = (0, std_math_1.wrap)(p.timeline, (0 | 0), use2 ? numLogoPoints2 : numLogoPoints);
                        if (numTargets > (0 | 0)) {
                            t = (0, std_math_1.wrap)(p.timeline, (0 | 0), numTargets);
                        }
                        index = (__.mul(t, 1.0) | 0);
                        sub = t * 1.0 - index;
                        a = logoBuf.__index(index);
                        b = logoBuf.__index((index + (1 | 0)) % numLogoPoints);
                        if (use2) {
                            a = logoBuf2.__index(index);
                            b = logoBuf2.__index((index + (1 | 0)) % numLogoPoints2);
                        }
                        targetPos = (_5 = basePos, _6 = (_7 = trans((_9 = (_11 = (0, std_math_1.lerp)(a, b, sub), [_11[0], _11[1]]), _10 = logoSize, [_9[0] / _10[0], _9[1] / _10[1]])), _8 = size, [_7[0] * _8[0], _7[1] * _8[1]]), [_5[0] + _6[0], _5[1] + _6[1]]);
                        if (numTargets > (0 | 0)) {
                            angleAmount = 20.0;
                            a = targetsBuf.__index(index);
                            b = targetsBuf.__index((index + (1 | 0)) % numTargets);
                            targetPos = (_12 = (0, std_math_1.lerp)(a, b, sub), [_12[0], _12[1]]);
                            if (p.timeline >= (6 | 0)) {
                                angleAmount = 7.0;
                            } //if (p.timeline >= numTargets * rand(in.globalId.x / 100.0) * 1.5) {
                            if (p.timeline >= numTargets) {
                                targetPos = __.makeVector(env.screenSize[0] + (400 | 0), (__.FM.negate_1((400 | 0))) + scroll);
                            }
                        } //p.velocity += (1 + dot(normalize(b - a), (cos(p.angle), sin(p.angle)))) * deltaTime * 100.0;
                        //p.velocity += deltaTime * 1000.0;
                        if ((0, std_math_1.dist)(targetPos, p.position) < (100 | 0)) {
                            p.timeline = p.timeline + 1.0;
                        } //p.angle += (rand2((in.globalId.x / 100.0, env.time)) * 2 - 1) * deltaTime * p.timeline * 2.0;
                        if (numTargets == (0 | 0)) {
                            if (p.age < deathNear + deathOffset) {
                                p.angle = p.angle + (Math.cos(__in.globalId[0] + p.timeline)) * deltaTime * 1.0;
                                p.angle = p.angle + (Math.sin(__in.globalId[0] + env.time)) * deltaTime * 10.0;
                            }
                        }
                        else {
                            p.angle = p.angle + (Math.sin(__in.globalId[0] + env.time)) * deltaTime * 4.0;
                        }
                    }
                }
                d = (0, std_math_1.dist)(targetPos, p.position);
                if (d < 200.0) {
                    p.goal = p.goal + deltaTime;
                }
                targetVelocity = d * 6.0;
                if (hit) {
                    targetVelocity = 100.0;
                    //p.velocity = lerp(p.velocity, targetVelocity, deltaTime * 2.0);
                }
                deltaPos = (_13 = targetPos, _14 = p.position, [_13[0] - _14[0], _13[1] - _14[1]]);
                targetAngle = (0, std_math_1.atan2)(deltaPos[1], deltaPos[0]);
                if (p.age < deathNear + deathOffset) {
                    p.angle = lerpAngle(p.angle, targetAngle, deltaTime * angleAmount * p.age / 2.0);
                }
                else {
                    p.velocity = p.velocity * (1.0 - deltaTime * (2 | 0));
                }
                shouldKill = false;
                if (p.age > 7.0 + deathOffset) {
                    shouldKill = true;
                }
                if (__.or(__.or(__.or(p.position[0] > env.screenSize[0], p.position[0] < (0 | 0)), p.position[1] > env.screenSize[1]), p.position[1] < (0 | 0))) { //shouldKill = true;
                }
                if (shouldKill) {
                    p.alive = (0 | 0);
                    idx = (deadCounter.__index((0 | 0)).add((1 | 0)) | 0);
                    dead.__index_assign(idx, (__.swizzle(__in.globalId, 'x') >>> 0));
                }
                particles.__index_assign(__in.globalId[0], p);
                return [2 /*return*/];
            });
        }); }));
        tex.draw(__shadeup_make_shader_inst("shd_6900259035000093023000000095000000001196", { _ext_uniform_local_scroll: scroll, _ext_uniform_local_deltaTime: deltaTime, _ext_uniform_global_tex2: globalVarGet("_slash_main_dot_ts", "tex2"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env"), _ext_uniform_global_PI: globalVarGet("_slash__std_slash_common_dot_ts", "PI"), _ext_uniform_global_lastScroll: globalVarGet("_slash_main_dot_ts", "lastScroll") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var pixelDist, angle, dir, off, val1, val2;
            var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            return __generator(this, function (_z) {
                pixelDist = (_e = (_g = 1.0, [_g, _g]), _f = tex2.size, [_e[0] / _f[0], _e[1] / _f[1]]);
                angle = (0, std_math_1.rand3)(__.makeVector(__in.screen, env.time)) * common_1.PI * (2 | 0);
                dir = __.makeVector(Math.cos(angle), Math.sin(angle));
                off = (_h = __.makeVector((0 | 0), (scroll - lastScroll)), _j = pixelDist, [_h[0] * _j[0], _h[1] * _j[1]]);
                val1 = tex2.sample((_k = (_m = __in.uv, _o = off, [_m[0] + _o[0], _m[1] + _o[1]]), _l = (_p = dir, _q = pixelDist, [_p[0] * _q[0], _p[1] * _q[1]]), [_k[0] + _l[0], _k[1] + _l[1]]));
                val2 = tex2.sample((_r = __in.uv, _s = off, [_r[0] + _s[0], _r[1] + _s[1]]));
                __out.color = (_t = (_v = (_x = val1, _y = val2, [_x[0] + _y[0], _x[1] + _y[1], _x[2] + _y[2], _x[3] + _y[3]]), _w = 2.0, [_v[0] / _w, _v[1] / _w, _v[2] / _w, _v[3] / _w]), _u = (1.0 - deltaTime * 8.0), [_t[0] * _u, _t[1] * _u, _t[2] * _u, _t[3] * _u]);
                return [2 /*return*/];
            });
        }); }));
        lastScroll = scroll;
        (0, drawIndexed_1.drawAdvanced)({ instances: (particles.len() | 0), mesh: mesh_1.mesh.box((_b = (0 | 0), [_b, _b, _b]), __.intifyVector(__.makeVector((15 | 0), (1 | 0), (1 | 0)))), attachments: [tex], vertex: __shadeup_make_shader_inst("shd_00821606432096000132571910900898440480000000", { _ext_uniform_local_scroll: scroll, _ext_uniform_global_particles: globalVarGet("_slash_main_dot_ts", "particles"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                var p, mat_1;
                var _e, _f, _g, _h, _j, _k;
                return __generator(this, function (_l) {
                    p = particles.__index(__in.instanceIndex);
                    if (p.alive == (0 | 0)) {
                        __out.position = (_e = (0 | 0), [_e, _e, _e, _e]);
                    }
                    else {
                        mat_1 = __.float2x2(Math.cos(p.angle), Math.sin((__.FM.negate_1(p.angle))), Math.sin(p.angle), Math.cos(p.angle));
                        __out.position = __.makeVector((0, common_1.pixelToClip)((_f = (_h = p.position, _j = __.makeVector((0 | 0), (__.FM.negate_1(scroll))), [_h[0] + _j[0], _h[1] + _j[1]]), _g = __.mul((_k = __in.position, [_k[0], _k[1]]), mat_1), [_f[0] + _g[0], _f[1] + _g[1]])), (0 | 0), (1 | 0));
                    }
                    return [2 /*return*/];
                });
            }); }), fragment: __shadeup_make_shader_inst("shd_0005900044000151533001000000860800600000", { _ext_uniform_local_overrideColor: overrideColor, _ext_uniform_global_particles: globalVarGet("_slash_main_dot_ts", "particles"), _ext_uniform_global_tex2: globalVarGet("_slash_main_dot_ts", "tex2"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
                var p, c1, c2, c, base;
                var _e, _f, _g, _h, _j, _k, _l, _m;
                return __generator(this, function (_o) {
                    p = particles.__index(__in.instanceIndex);
                    c1 = __.makeVector(0.2, 0.3, 0.6, (1 | 0));
                    c2 = __.makeVector(0.6, 0.2, 0.9, (1 | 0));
                    c = (0, std_math_1.lerp)(c1, c2, (0, std_math_1.min)(p.age / 5.0, (0, std_math_1.rand)(__in.instanceIndex / 10526.0) * (2 | 0)));
                    if ((0, std_math_1.length)(overrideColor) > 0.01) {
                        c = (0, std_math_1.lerp)(c1, overrideColor, p.age / 3.0);
                    }
                    base = tex2.sample((_e = __in.screen, _f = env.screenSize, [_e[0] / _f[0], _e[1] / _f[1]]));
                    __out.attachment0 = __.makeVector((_g = (_j = (_l = base, [_l[0], _l[1], _l[2]]), _k = 1.5, [_j[0] / _k, _j[1] / _k, _j[2] / _k]), _h = (_m = c, [_m[0], _m[1], _m[2]]), [_g[0] + _h[0], _g[1] + _h[1], _g[2] + _h[2]]), base[3] + 0.1);
                    return [2 /*return*/];
                });
            }); }), depthTest: false });
        var cam = new common_1.Camera({ position: __.makeVector((0 | 0), (0 | 0), env.screenSize[1] / ((2 | 0) * Math.tan(common_1.PI / (2 | 0) / 2.0))), rotation: common_1.quat.fromEulerAngles(__.intifyVector(__.makeVector((0 | 0), (0 | 0), (0 | 0)))), width: env.screenSize[0], height: env.screenSize[1], fov: (90 | 0), near: 0.1, far: (100009 | 0) });
        var refLen = 2.0;
        var mat = cam.getCombinedMatrix();
        (0, drawIndexed_1.draw)(mesh_1.mesh.plane(__.makeVector((0 | 0), (__.FM.negate_1(env.screenSize[1])) / (2 | 0), (__.FM.negate_1((env.screenSize[1] / (2 | 0)))) * refLen), __.makeVector(env.screenSize[0], env.screenSize[1] * refLen), (_c = (4 | 0), [_c, _c])), __shadeup_make_shader_inst("shd_070320052000028790087932500120013360204818950", { _ext_uniform_local_mat: mat }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                __out.position = __.mul(mat, __.makeVector(__in.position, (1 | 0)));
                return [2 /*return*/];
            });
        }); }), __shadeup_make_shader_inst("shd_0045010050110268436008600090058007300880000", {}, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                return [2 /*return*/];
            });
        }); }));
        var tv = mesh_1.mesh.plane(__.intifyVector(__.makeVector((0 | 0), (0 | 0), (0 | 0))), (env.screenSize), (_d = (4 | 0), [_d, _d]));
        tv.rotate(common_1.quat.fromEulerAngles(__.makeVector(common_1.PI / (2 | 0), (0 | 0), (0 | 0))));
        var instances = (7 | 0);
        (0, drawIndexed_1.drawInstanced)(tv, instances, __shadeup_make_shader_inst("shd_06000000951000000000000780140000900940", { _ext_uniform_local_mat: mat, _ext_uniform_local_instances: instances }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var _e, _f;
            return __generator(this, function (_g) {
                __out.position = __.mul(mat, __.makeVector((_e = __in.position, _f = __.makeVector((0 | 0), (0 | 0), (__.FM.negate_1((50.0))) * ((instances - (1 | 0)) - __in.instanceIndex)), [_e[0] + _f[0], _e[1] + _f[1], _e[2] + _f[2]]), (1 | 0)));
                return [2 /*return*/];
            });
        }); }), __shadeup_make_shader_inst("shd_00890360012200000000600490212005400000", { _ext_uniform_local_instances: instances, _ext_uniform_local_numTargets: numTargets, _ext_uniform_global_tex: globalVarGet("_slash_main_dot_ts", "tex"), _ext_uniform_global_env: globalVarGet("_slash__std_slash_native_dot_ts", "env") }, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var c, sc, fac;
            var _e, _f, _g, _h;
            return __generator(this, function (_j) {
                c = tex.sample(__in.uv);
                sc = (_e = __in.uv, _f = env.screenSize, [_e[0] * _f[0], _e[1] * _f[1]]);
                fac = 1.0;
                //saturate(sdf::boxFrame((sc, 0), (env.screenSize / 2, 0), (env.screenSize, 0), 200.0) / 200.0);
                fac = fac * (((__in.instanceIndex / instances)) / 2.0);
                if (c[0] < c[2] * 0.6) {
                    fac = 0.0;
                }
                if (numTargets > (0 | 0)) {
                    fac = 0.0;
                }
                if (__in.instanceIndex == instances - (1 | 0)) {
                    fac = 1.0;
                }
                __out.color = (_g = c, _h = fac, [_g[0] * _h, _g[1] * _h, _g[2] * _h, _g[3] * _h]);
                return [2 /*return*/];
            });
        }); }));
        var swap = tex;
        tex = tex2;
        tex2 = swap;
    }
    exports.main = main;
});

})(define);

});