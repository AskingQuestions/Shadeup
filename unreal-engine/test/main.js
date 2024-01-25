
((defineFunc) => {
	let define = (deps, func) => defineFunc("/main.js", deps, func);
	__shadeup_gen_shader("shd_6515406754369975000349600057000435695077700680380", {
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
`, software: () => {}}, [[2826,2861,21,38],[2935,2968,38,53],[3044,3078,53,69],[3158,3194,69,87],[3238,3280,87,108],[3285,3327,108,129],[3396,3422,129,140],[3498,3528,140,155],[3605,3640,155,169],[3686,3716,169,186],[3764,3796,186,205],[3875,3906,205,223],[3952,3982,223,240],[4047,4070,240,261],[4119,4140,261,280],[2724,4279,0,284],[4367,4405,306,323],[4440,4473,323,338],[4509,4543,338,354],[4581,4617,354,372],[4651,4677,372,383],[4710,4745,383,397],[4305,4865,284,401],[0,0,503,509],[0,0,510,515],[0,0,503,515],[1882,1888,551,554],[0,0,555,556],[0,0,551,557],[0,0,523,558],[0,0,503,559],[0,0,503,561],[57,87,401,605],[1839,1903,0,605]]);

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
define(["require", "exports", "/std_math", "/std___std_all", "/_std/drawIndexed"], function (require, exports, __, std___std_all_1, drawIndexed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.giveFloat = exports.main = void 0;
    __ = __importStar(__);
    var globalVarGet = std___std_all_1.globalVarGet;
    function main() {
        var _this = this;
        (0, drawIndexed_1.draw)(__shadeup_make_shader_inst("shd_6515406754369975000349600057000435695077700680380", {}, /**@shadeup=shader*/ function (__in, __out) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                __out.color = (_a = (1 | 0), [_a, _a, _a, _a]);
                return [2 /*return*/];
            });
        }); }));
    }
    exports.main = main;
    function giveFloat() { return 1.0; }
    exports.giveFloat = giveFloat;
    ;
});

})(define);
