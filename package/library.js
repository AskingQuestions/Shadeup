// Generated file
export const linkShadeupLibrary = (define, localEngineContext) => {
  const __shadeup_gen_shader =
    localEngineContext.__shadeup_gen_shader.bind(localEngineContext);
  const __shadeup_make_shader_inst =
    localEngineContext.__shadeup_make_shader_inst.bind(localEngineContext);
  const __shadeup_register_struct =
    localEngineContext.__shadeup_register_struct.bind(localEngineContext);
  const env = localEngineContext.env;

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/file.js", deps, func);
    define(["require", "exports", "/std___std_all"], function (
      require,
      exports,
      std___std_all_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var globalVarGet = std___std_all_1.globalVarGet;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/std_math.js", deps, func);
    var __spreadArray =
      (this && this.__spreadArray) ||
      function (to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
    define(["require", "exports", "./static-math"], function (
      require,
      exports,
      static_math_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bitcast =
        exports.ddyCoarse =
        exports.ddxCoarse =
        exports.ddyFine =
        exports.ddxFine =
        exports.ddy =
        exports.ddx =
        exports.discard =
        exports.workgroupUniformLoad =
        exports.storageBarrier =
        exports.workgroupBarrier =
        exports.atomic =
        exports.atomic_internal =
        exports.FM =
        exports.intifyVector =
        exports.swizzle =
        exports.testDocComment =
        exports.makeVector =
        exports.not =
        exports.or =
        exports.and =
        exports.gte =
        exports.gt =
        exports.lte =
        exports.lt =
        exports.neq =
        exports.eq =
        exports.saturate =
        exports.clamp =
        exports.max =
        exports.min =
        exports.smoothstep =
        exports.step =
        exports.radians =
        exports.degrees =
        exports.refract =
        exports.reflect =
        exports.normalize =
        exports.distance =
        exports.dist =
        exports.length =
        exports.bilerp =
        exports.lerp =
        exports.dot =
        exports.cross =
        exports.pingpong =
        exports.rand3 =
        exports.rand2 =
        exports.rand =
        exports.wrap =
        exports.frac =
        exports.inversesqrt =
        exports.sqrt =
        exports.log10 =
        exports.log2 =
        exports.log =
        exports.exp =
        exports.atanh =
        exports.asinh =
        exports.acosh =
        exports.tanh =
        exports.sinh =
        exports.cosh =
        exports.atan2 =
        exports.atan =
        exports.asin =
        exports.acos =
        exports.tan =
        exports.sin =
        exports.cos =
        exports.sign =
        exports.round =
        exports.ceil =
        exports.floor =
        exports.abs =
        exports.positive =
        exports.negate =
        exports.bitnot =
        exports.rshift =
        exports.lshift =
        exports.bitxor =
        exports.bitor =
        exports.bitand =
        exports.mod =
        exports.pow =
        exports.div =
        exports.mul =
        exports.transpose =
        exports.inverse =
        exports.sub =
        exports.add =
        exports.uint8 =
        exports.uint4 =
        exports.uint3 =
        exports.uint2 =
        exports.int4 =
        exports.int3 =
        exports.int2 =
        exports.float4 =
        exports.float3 =
        exports.float2 =
        exports.uint =
        exports.int =
        exports.float =
        exports.float4x4 =
        exports.float3x3 =
        exports.float2x2 =
          void 0;
      function isVector(v) {
        return Array.isArray(v);
      }
      function isScalar(v) {
        return typeof v === "number";
      }
      function isMatrix(v) {
        return !!v.__matrix;
      }
      /** @shadeup=glsl(mat2) @shadeup=wgsl(mat2x2<f32>) */
      function float2x2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var arr = [0, 0, 0, 0];
        if (args.length === 4) {
          arr = __spreadArray([], args, true);
        }
        applyMatrix2x2Methods(arr);
        return arr;
      }
      exports.float2x2 = float2x2;
      /** @shadeup=glsl(mat3) @shadeup=wgsl(mat3x3<f32>) */
      function float3x3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (args.length === 9) {
          arr = __spreadArray([], args, true);
        }
        applyMatrix3x3Methods(arr);
        return arr;
      }
      exports.float3x3 = float3x3;
      function applyMatrix4x4Methods(arr) {
        arr.__matrix = 4;
        arr.__index = function (index) {
          var out_arr = [
            arr[index * 4],
            arr[index * 4 + 1],
            arr[index * 4 + 2],
            arr[index * 4 + 3],
          ];
          out_arr.__index = function (index_inner) {
            return out_arr[index_inner];
          };
          out_arr.__index_assign = function (index_inner, value) {
            arr[index * 4 + index_inner] = value;
          };
          out_arr.__index_assign_op = function (op_fn, index_inner, value) {
            arr[index * 4 + index_inner] = op_fn(
              arr[index * 4 + index_inner],
              value
            );
          };
          return out_arr;
        };
        arr.__index_assign = function (index, value) {
          arr[index * 4] = value[0];
          arr[index * 4 + 1] = value[1];
          arr[index * 4 + 2] = value[2];
          arr[index * 4 + 3] = value[3];
        };
        arr.__index_assign_op = function (op_fn, index, value) {
          arr[index * 4] = op_fn(arr[index * 4], value[0]);
          arr[index * 4 + 1] = op_fn(arr[index * 4 + 1], value[1]);
          arr[index * 4 + 2] = op_fn(arr[index * 4 + 2], value[2]);
          arr[index * 4 + 3] = op_fn(arr[index * 4 + 3], value[3]);
        };
      }
      window.applyMatrix4x4Methods = applyMatrix4x4Methods;
      function applyMatrix3x3Methods(arr) {
        arr.__matrix = 3;
        arr.__index = function (index) {
          var out_arr = [
            arr[index * 3],
            arr[index * 3 + 1],
            arr[index * 3 + 2],
          ];
          out_arr.__index = function (index_inner) {
            return out_arr[index_inner];
          };
          out_arr.__index_assign = function (index_inner, value) {
            arr[index * 3 + index_inner] = value;
          };
          out_arr.__index_assign_op = function (op_fn, index_inner, value) {
            arr[index * 3 + index_inner] = op_fn(
              arr[index * 3 + index_inner],
              value
            );
          };
          return out_arr;
        };
        arr.__index_assign = function (index, value) {
          arr[index * 3] = value[0];
          arr[index * 3 + 1] = value[1];
          arr[index * 3 + 2] = value[2];
        };
        arr.__index_assign_op = function (op_fn, index, value) {
          arr[index * 3] = op_fn(arr[index * 3], value[0]);
          arr[index * 3 + 1] = op_fn(arr[index * 3 + 1], value[1]);
          arr[index * 3 + 2] = op_fn(arr[index * 3 + 2], value[2]);
        };
      }
      window.applyMatrix3x3Methods = applyMatrix3x3Methods;
      function applyMatrix2x2Methods(arr) {
        arr.__matrix = 2;
        arr.__index = function (index) {
          var out_arr = [arr[index * 2], arr[index * 2 + 1]];
          out_arr.__index = function (index_inner) {
            return out_arr[index_inner];
          };
          out_arr.__index_assign = function (index_inner, value) {
            arr[index * 2 + index_inner] = value;
          };
          out_arr.__index_assign_op = function (op_fn, index_inner, value) {
            arr[index * 2 + index_inner] = op_fn(
              arr[index * 2 + index_inner],
              value
            );
          };
          return out_arr;
        };
        arr.__index_assign = function (index, value) {
          arr[index * 2] = value[0];
          arr[index * 2 + 1] = value[1];
        };
        arr.__index_assign_op = function (op_fn, index, value) {
          arr[index * 2] = op_fn(arr[index * 2], value[0]);
          arr[index * 2 + 1] = op_fn(arr[index * 2 + 1], value[1]);
        };
      }
      window.applyMatrix2x2Methods = applyMatrix2x2Methods;
      /** @shadeup=glsl(mat4) @shadeup=wgsl(mat4x4<f32>) */
      function float4x4() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (args.length === 16) {
          arr = __spreadArray([], args, true);
        }
        applyMatrix4x4Methods(arr);
        return arr;
      }
      exports.float4x4 = float4x4;
      /** @shadeup=glsl(float) @shadeup=wgsl(f32) */
      function float(x) {
        return x;
      }
      exports.float = float;
      /** @shadeup=glsl(int) @shadeup=wgsl(i32) */
      function int(x) {
        return x | 0;
      }
      exports.int = int;
      /** @shadeup=glsl(uint) @shadeup=wgsl(u32) */
      function uint(x) {
        return x >>> 0;
      }
      exports.uint = uint;
      /** @shadeup=glsl(float2) @shadeup=wgsl(vec2<f32>) */
      function float2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat();
      }
      exports.float2 = float2;
      /** @shadeup=glsl(float3) @shadeup=wgsl(vec3<f32>) */
      function float3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat();
      }
      exports.float3 = float3;
      /** @shadeup=glsl(float4) @shadeup=wgsl(vec4<f32>) */
      function float4() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat();
      }
      exports.float4 = float4;
      /** @shadeup=glsl(int2) @shadeup=wgsl(vec2<i32>) */
      function int2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x | 0;
        });
      }
      exports.int2 = int2;
      /** @shadeup=glsl(int3) @shadeup=wgsl(vec3<i32>) */
      function int3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x | 0;
        });
      }
      exports.int3 = int3;
      /** @shadeup=glsl(int4) @shadeup=wgsl(vec4<i32>) */
      function int4() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x | 0;
        });
      }
      exports.int4 = int4;
      function uint2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x >>> 0;
        });
      }
      exports.uint2 = uint2;
      function uint3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x >>> 0;
        });
      }
      exports.uint3 = uint3;
      function uint4() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return args.flat().map(function (x) {
          return x >>> 0;
        });
      }
      exports.uint4 = uint4;
      function uint8(x) {
        return (x >>> 0) & 0xff;
      }
      exports.uint8 = uint8;
      function componentMath(a, b, f) {
        var aIsScalar = isScalar(a);
        var bIsScalar = isScalar(b);
        if (aIsScalar && bIsScalar) {
          return f(a, b);
        }
        if (!aIsScalar && !bIsScalar) {
          if (a.length !== b.length) {
            throw new Error(
              "Cannot perform component-wise math on vectors of different lengths"
            );
          }
          // return a.map((a, i) => f(a, b[i])) as vector;
          if (a.length == 2) {
            return [f(a[0], b[0]), f(a[1], b[1])];
          } else if (a.length == 3) {
            return [f(a[0], b[0]), f(a[1], b[1]), f(a[2], b[2])];
          } else if (a.length == 4) {
            return [f(a[0], b[0]), f(a[1], b[1]), f(a[2], b[2]), f(a[3], b[3])];
          }
        } else if (!aIsScalar && bIsScalar) {
          if (a.length == 2) {
            return [f(a[0], b), f(a[1], b)];
          } else if (a.length == 3) {
            return [f(a[0], b), f(a[1], b), f(a[2], b)];
          } else if (a.length == 4) {
            return [f(a[0], b), f(a[1], b), f(a[2], b), f(a[3], b)];
          }
        } else if (!bIsScalar && aIsScalar) {
          if (b.length == 2) {
            return [f(a, b[0]), f(a, b[1])];
          } else if (b.length == 3) {
            return [f(a, b[0]), f(a, b[1]), f(a, b[2])];
          } else if (b.length == 4) {
            return [f(a, b[0]), f(a, b[1]), f(a, b[2]), f(a, b[3])];
          }
        }
        throw new Error(
          "Cannot perform component-wise math on a scalar and a vector"
        );
      }
      function componentMathSingular(a, f) {
        if (isScalar(a)) {
          return f(a);
        }
        if (isVector(a)) {
          return a.map(function (a, i) {
            return f(a);
          });
        }
        throw new Error(
          "Cannot perform component-wise math on a scalar and a vector"
        );
      }
      function cCall(cb, a, b) {
        return componentMath(a, b, function (a, b) {
          return a + b;
        });
      }
      function componentOp(cb) {
        return function (a, b) {
          return componentMath(a, b, cb);
        };
      }
      function componentOpMatch(cb) {
        return function (a, b) {
          return componentMath(a, b, cb);
        };
      }
      function componentOpSingular(cb) {
        return function (a) {
          return componentMathSingular(a, cb);
        };
      }
      function componentOpSingularFloat(cb) {
        return function (a) {
          return componentMathSingular(a, cb);
        };
      }
      /** @shadeup=univ(!$0$ + $1$)*/
      var add = function (a, b) {
        if (typeof a === "string" && typeof b === "string") {
          return "".concat(a).concat(b);
        } else {
          var addOp = componentOp(function (a, b) {
            return a + b;
          });
          var v = addOp(a, b);
          return v;
        }
      };
      exports.add = add;
      /** @shadeup=univ(!$0$ - $1$)*/
      exports.sub = componentOp(function (a, b) {
        return a - b;
      });
      function matrixMul(a, b) {
        // Multiply two square matrices of the same dimension row-major
        var dimension = a.__matrix;
        var out;
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
        for (var i = 0; i < dimension; i++) {
          for (var j = 0; j < dimension; j++) {
            var sum = float(0);
            for (var k = 0; k < dimension; k++) {
              sum += float(a[i * dimension + k] * b[k * dimension + j]);
            }
            out[i * dimension + j] = sum;
          }
        }
        return out;
        if (a.__matrix === 2 && b.__matrix === 2) {
          var a00_1 = a[0];
          var a01_1 = a[1];
          var a10_1 = a[2];
          var a11_1 = a[3];
          var b00_1 = b[0];
          var b01_1 = b[1];
          var b10_1 = b[2];
          var b11_1 = b[3];
          var v = float2x2(
            a00_1 * b00_1 + a01_1 * b10_1,
            a00_1 * b01_1 + a01_1 * b11_1,
            a10_1 * b00_1 + a11_1 * b10_1,
            a10_1 * b01_1 + a11_1 * b11_1
          );
          return v;
        } else if (a.__matrix === 3 && b.__matrix === 3) {
          var a00_2 = a[0];
          var a01_2 = a[1];
          var a02_1 = a[2];
          var a10_2 = a[3];
          var a11_2 = a[4];
          var a12_1 = a[5];
          var a20_1 = a[6];
          var a21_1 = a[7];
          var a22_1 = a[8];
          var b00_2 = b[0];
          var b01_2 = b[1];
          var b02_1 = b[2];
          var b10_2 = b[3];
          var b11_2 = b[4];
          var b12_1 = b[5];
          var b20_1 = b[6];
          var b21_1 = b[7];
          var b22_1 = b[8];
          var v = float3x3(
            a00_2 * b00_2 + a01_2 * b10_2 + a02_1 * b20_1,
            a00_2 * b01_2 + a01_2 * b11_2 + a02_1 * b21_1,
            a00_2 * b02_1 + a01_2 * b12_1 + a02_1 * b22_1,
            a10_2 * b00_2 + a11_2 * b10_2 + a12_1 * b20_1,
            a10_2 * b01_2 + a11_2 * b11_2 + a12_1 * b21_1,
            a10_2 * b02_1 + a11_2 * b12_1 + a12_1 * b22_1,
            a20_1 * b00_2 + a21_1 * b10_2 + a22_1 * b20_1,
            a20_1 * b01_2 + a21_1 * b11_2 + a22_1 * b21_1,
            a20_1 * b02_1 + a21_1 * b12_1 + a22_1 * b22_1
          );
          return v;
        } else if (a.__matrix === 4 && b.__matrix === 4) {
          var a00_3 = a[0];
          var a01_3 = a[1];
          var a02_2 = a[2];
          var a03_1 = a[3];
          var a10_3 = a[4];
          var a11_3 = a[5];
          var a12_2 = a[6];
          var a13_1 = a[7];
          var a20_2 = a[8];
          var a21_2 = a[9];
          var a22_2 = a[10];
          var a23_1 = a[11];
          var a30_1 = a[12];
          var a31_1 = a[13];
          var a32_1 = a[14];
          var a33_1 = a[15];
          var b00_3 = b[0];
          var b01_3 = b[1];
          var b02_2 = b[2];
          var b03_1 = b[3];
          var b10_3 = b[4];
          var b11_3 = b[5];
          var b12_2 = b[6];
          var b13_1 = b[7];
          var b20_2 = b[8];
          var b21_2 = b[9];
          var b22_2 = b[10];
          var b23_1 = b[11];
          var b30_1 = b[12];
          var b31_1 = b[13];
          var b32_1 = b[14];
          var b33_1 = b[15];
          var v = float4x4(
            a00_3 * b00_3 + a01_3 * b10_3 + a02_2 * b20_2 + a03_1 * b30_1,
            a00_3 * b01_3 + a01_3 * b11_3 + a02_2 * b21_2 + a03_1 * b31_1,
            a00_3 * b02_2 + a01_3 * b12_2 + a02_2 * b22_2 + a03_1 * b32_1,
            a00_3 * b03_1 + a01_3 * b13_1 + a02_2 * b23_1 + a03_1 * b33_1,
            a10_3 * b00_3 + a11_3 * b10_3 + a12_2 * b20_2 + a13_1 * b30_1,
            a10_3 * b01_3 + a11_3 * b11_3 + a12_2 * b21_2 + a13_1 * b31_1,
            a10_3 * b02_2 + a11_3 * b12_2 + a12_2 * b22_2 + a13_1 * b32_1,
            a10_3 * b03_1 + a11_3 * b13_1 + a12_2 * b23_1 + a13_1 * b33_1,
            a20_2 * b00_3 + a21_2 * b10_3 + a22_2 * b20_2 + a23_1 * b30_1,
            a20_2 * b01_3 + a21_2 * b11_3 + a22_2 * b21_2 + a23_1 * b31_1,
            a20_2 * b02_2 + a21_2 * b12_2 + a22_2 * b22_2 + a23_1 * b32_1,
            a20_2 * b03_1 + a21_2 * b13_1 + a22_2 * b23_1 + a23_1 * b33_1,
            a30_1 * b00_3 + a31_1 * b10_3 + a32_1 * b20_2 + a33_1 * b30_1,
            a30_1 * b01_3 + a31_1 * b11_3 + a32_1 * b21_2 + a33_1 * b31_1,
            a30_1 * b02_2 + a31_1 * b12_2 + a32_1 * b22_2 + a33_1 * b32_1,
            a30_1 * b03_1 + a31_1 * b13_1 + a32_1 * b23_1 + a33_1 * b33_1
          );
          return v;
        } else {
          throw new Error("Invalid matrix multiplication");
        }
      }
      function matrixInversefloat2x2(m) {
        var a = m.__index(0)[0],
          b = m.__index(1)[0],
          c = m.__index(0)[1],
          d = m.__index(1)[1];
        var det = a * d - b * c;
        if (det === 0) {
          throw new Error("Matrix determinant is zero");
        }
        var detInv = 1.0 / det;
        return float2x2(d * detInv, -b * detInv, -c * detInv, a * detInv);
      }
      function matrixInversefloat3x3(m) {
        var n11 = m.__index(0)[0],
          n12 = m.__index(1)[0],
          n13 = m.__index(2)[0];
        var n21 = m.__index(0)[1],
          n22 = m.__index(1)[1],
          n23 = m.__index(2)[1];
        var n31 = m.__index(0)[2],
          n32 = m.__index(1)[2],
          n33 = m.__index(2)[2];
        var t11 = n33 * n22 - n32 * n23,
          t12 = n32 * n13 - n33 * n12,
          t13 = n23 * n12 - n22 * n13;
        var det = n11 * t11 + n21 * t12 + n31 * t13;
        if (det === 0) {
          throw new Error("Invalid matrix inverse");
        }
        var detInv = 1 / det;
        var v = float3x3(
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
      function matrixInversefloat4x4(m) {
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
        var t0 =
          tmp_0 * m11 +
          tmp_3 * m21 +
          tmp_4 * m31 -
          (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 =
          tmp_1 * m01 +
          tmp_6 * m21 +
          tmp_9 * m31 -
          (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 =
          tmp_2 * m01 +
          tmp_7 * m11 +
          tmp_10 * m31 -
          (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 =
          tmp_5 * m01 +
          tmp_8 * m11 +
          tmp_11 * m21 -
          (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        if (d === 0) {
          throw new Error("Invalid matrix inverse");
        }
        return float4x4(
          d * t0,
          d * t1,
          d * t2,
          d * t3,
          d *
            (tmp_1 * m10 +
              tmp_2 * m20 +
              tmp_5 * m30 -
              (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
          d *
            (tmp_0 * m00 +
              tmp_7 * m20 +
              tmp_8 * m30 -
              (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
          d *
            (tmp_3 * m00 +
              tmp_6 * m10 +
              tmp_11 * m30 -
              (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
          d *
            (tmp_4 * m00 +
              tmp_9 * m10 +
              tmp_10 * m20 -
              (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
          d *
            (tmp_12 * m13 +
              tmp_15 * m23 +
              tmp_16 * m33 -
              (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
          d *
            (tmp_13 * m03 +
              tmp_18 * m23 +
              tmp_21 * m33 -
              (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
          d *
            (tmp_14 * m03 +
              tmp_19 * m13 +
              tmp_22 * m33 -
              (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
          d *
            (tmp_17 * m03 +
              tmp_20 * m13 +
              tmp_23 * m23 -
              (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
          d *
            (tmp_14 * m22 +
              tmp_17 * m32 +
              tmp_13 * m12 -
              (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
          d *
            (tmp_20 * m32 +
              tmp_12 * m02 +
              tmp_19 * m22 -
              (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
          d *
            (tmp_18 * m12 +
              tmp_23 * m32 +
              tmp_15 * m02 -
              (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
          d *
            (tmp_22 * m22 +
              tmp_16 * m02 +
              tmp_21 * m12 -
              (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        );
      }
      function matrixTransposefloat2x2(m) {
        return float2x2(
          m.__index(0)[0],
          m.__index(1)[0],
          m.__index(0)[1],
          m.__index(1)[1]
        );
      }
      function matrixTransposefloat3x3(m) {
        return float3x3(
          m.__index(0)[0],
          m.__index(1)[0],
          m.__index(2)[0],
          m.__index(0)[1],
          m.__index(1)[1],
          m.__index(2)[1],
          m.__index(0)[2],
          m.__index(1)[2],
          m.__index(2)[2]
        );
      }
      function matrixTransposefloat4x4(m) {
        return float4x4(
          m.__index(0)[0],
          m.__index(1)[0],
          m.__index(2)[0],
          m.__index(3)[0],
          m.__index(0)[1],
          m.__index(1)[1],
          m.__index(2)[1],
          m.__index(3)[1],
          m.__index(0)[2],
          m.__index(1)[2],
          m.__index(2)[2],
          m.__index(3)[2],
          m.__index(0)[3],
          m.__index(1)[3],
          m.__index(2)[3],
          m.__index(3)[3]
        );
      }
      function matrixMul2x2float2(a, b) {
        var c = [0, 0];
        for (var j = 0; j < 2; j++) {
          for (var i = 0; i < 2; i++) {
            c[i] += a[j * 2 + i] * b[j];
          }
        }
        return c;
      }
      function matrixMul3x3float3(a, b) {
        var c = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            c[i] += a[j * 3 + i] * b[j];
          }
        }
        return c;
      }
      function matrixMul4x4float4(a, b) {
        var c = [0, 0, 0, 0];
        for (var j = 0; j < 4; j++) {
          for (var i = 0; i < 4; i++) {
            c[i] += a[j * 4 + i] * b[j];
          }
        }
        return c;
      }
      function matrixMulfloat22x2(a, b) {
        var c = [0, 0];
        for (var j = 0; j < 2; j++) {
          for (var i = 0; i < 2; i++) {
            c[i] += a[j] * b[i * 2 + j];
          }
        }
        return c;
      }
      function matrixMulfloat33x3(a, b) {
        var c = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            c[i] += a[j] * b[i * 3 + j];
          }
        }
        return c;
      }
      function matrixMulfloat44x4(a, b) {
        var c = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            c[i] += a[j] * b[i * 4 + j];
          }
        }
        return c;
      }
      var mulFunc = componentOp(function (a, b) {
        return a * b;
      });
      function inverse(a) {
        if (a.__matrix == 2) {
          return matrixInversefloat2x2(a);
        } else if (a.__matrix == 3) {
          return matrixInversefloat3x3(a);
        } else if (a.__matrix == 4) {
          return matrixInversefloat4x4(a);
        }
      }
      exports.inverse = inverse;
      function transpose(a) {
        if (a.__matrix == 2) {
          return matrixTransposefloat2x2(a);
        } else if (a.__matrix == 3) {
          return matrixTransposefloat3x3(a);
        } else if (a.__matrix == 4) {
          return matrixTransposefloat4x4(a);
        }
      }
      exports.transpose = transpose;
      /** @shadeup=univ(!$0$ * $1$)*/
      var mul = function (a, b) {
        if (isMatrix(a) || isMatrix(b)) {
          if (isMatrix(a) && isMatrix(b)) {
            return matrixMul(a, b);
          } else {
            if (isMatrix(a) && typeof b == "number") {
              return componentMath(b, a, function (a, b) {
                return a * b;
              });
            } else if (isMatrix(b) && typeof a == "number") {
              return componentMath(a, b, function (a, b) {
                return a * b;
              });
            } else {
              if (isMatrix(a)) {
                if (a.length == 4) {
                  return matrixMul2x2float2(a, b);
                } else if (a.length == 9) {
                  return matrixMul3x3float3(a, b);
                } else if (a.length == 16) {
                  return matrixMul4x4float4(a, b);
                }
              } else if (isMatrix(b)) {
                if (b.length == 4) {
                  return matrixMulfloat22x2(a, b);
                } else if (b.length == 9) {
                  return matrixMulfloat33x3(a, b);
                } else if (b.length == 16) {
                  return matrixMulfloat44x4(a, b);
                }
              }
            }
          }
        } else {
          return mulFunc(a, b);
        }
      };
      exports.mul = mul;
      /** @shadeup=univ(!$0$ / $1$)*/
      exports.div = componentOp(function (a, b) {
        return a / b;
      });
      /** @shadeup=glsl(!$0$ ** $1$) @shadeup=wgsl(!pow($0$, $1$))*/
      exports.pow = componentOp(function (a, b) {
        return Math.pow(a, b);
      });
      /** @shadeup=wgsl(!$0$ % $1$) @shadeup=glsl(!mod($0$, $1$))*/
      exports.mod = componentOpMatch(function (a, b) {
        return a - b * Math.floor(a / b);
      });
      /** @shadeup=univ(!$0$ & $1$)*/
      exports.bitand = componentOp(function (a, b) {
        return a & b;
      });
      /** @shadeup=univ(!$0$ | $1$)*/
      exports.bitor = componentOp(function (a, b) {
        return a | b;
      });
      /** @shadeup=univ(!$0$ ^ $1$)*/
      exports.bitxor = componentOp(function (a, b) {
        return a ^ b;
      });
      /** @shadeup=glsl(!$0$ << $1$) @shadeup=wgsl(!$0$ << u32($1$))*/
      exports.lshift = componentOp(function (a, b) {
        return a << b;
      });
      /** @shadeup=glsl(!$0$ >> $1$) @shadeup=wgsl(!$0$ >> u32($1$))*/
      exports.rshift = componentOp(function (a, b) {
        return a >> b;
      });
      /** @shadeup=univ(!~$0$)*/
      exports.bitnot = componentOpSingular(function (a) {
        return ~a;
      });
      /** @shadeup=univ(!-($0$))*/
      exports.negate = componentOpSingular(function (a) {
        return -a;
      });
      /** @shadeup=univ(!+($0$))*/
      exports.positive = componentOpSingular(function (a) {
        return Math.abs(a);
      });
      /** @shadeup=univ(abs)*/
      exports.abs = componentOpSingular(function (a) {
        return Math.abs(a);
      });
      /**  @shadeup=glsl(floor) @shadeup=wgsl(!floor(f32(1.0) * $0$))*/
      exports.floor = componentOpSingular(Math.floor);
      /** @shadeup=glsl(ceil) @shadeup=wgsl(!ceil(f32(1.0) * $0$))*/
      exports.ceil = componentOpSingular(Math.ceil);
      /** @shadeup=univ(round)*/
      exports.round = componentOpSingular(Math.round);
      /** @shadeup=univ(sign)*/
      exports.sign = componentOpSingular(Math.sign);
      /** @shadeup=univ(cos) */
      exports.cos = componentOpSingular(Math.cos);
      /** @shadeup=univ(sin) */
      exports.sin = componentOpSingularFloat(Math.sin);
      /** @shadeup=univ(tan) */
      exports.tan = componentOpSingular(Math.tan);
      /** @shadeup=univ(acos) */
      exports.acos = componentOpSingular(Math.acos);
      /** @shadeup=univ(asin) */
      exports.asin = componentOpSingular(Math.asin);
      /** @shadeup=univ(atan) */
      exports.atan = componentOpSingular(Math.atan);
      /** @shadeup=univ(atan2) */
      exports.atan2 = Math.atan2;
      /** @shadeup=univ(cosh) */
      exports.cosh = componentOpSingular(Math.cosh);
      /** @shadeup=univ(sinh) */
      exports.sinh = componentOpSingular(Math.sinh);
      /** @shadeup=univ(tanh) */
      exports.tanh = componentOpSingular(Math.tanh);
      /** @shadeup=univ(acosh) */
      exports.acosh = componentOpSingular(Math.acosh);
      /** @shadeup=univ(asinh) */
      exports.asinh = componentOpSingular(Math.asinh);
      /** @shadeup=univ(atanh) */
      exports.atanh = componentOpSingular(Math.atanh);
      /** @shadeup=univ(exp) */
      exports.exp = componentOpSingular(Math.exp);
      /** @shadeup=univ(log) */
      exports.log = componentOpSingular(Math.log);
      /** @shadeup=univ(log2) */
      exports.log2 = componentOpSingular(Math.log2);
      /** @shadeup=univ(log10) */
      exports.log10 = componentOpSingular(Math.log10);
      /** @shadeup=univ(sqrt) */
      exports.sqrt = componentOpSingular(Math.sqrt);
      /** @shadeup=univ(inversesqrt) */
      exports.inversesqrt = componentOpSingular(function (a) {
        return 1 / Math.sqrt(a);
      });
      /** @shadeup=univ(fract)*/
      exports.frac = componentOpSingular(function (a) {
        return a - Math.floor(a);
      });
      function wrap(x, low, high) {
        if ((0, exports.lt)(x, low)) {
          var rng = high - low;
          var s1 = low - x;
          var ms = s1 % rng;
          return high - ms;
        } else if ((0, exports.gte)(x, high)) {
          var rng = high - low;
          var s1 = x - high;
          var ms = s1 % rng;
          return low + ms;
        } else {
          return x;
        }
        // return add(mod(sub(x, low), sub(high, low)), low) as T;
      }
      exports.wrap = wrap;
      /**
       * Returns a deterministic (same seed = same output) random float between 0-1
       *
       * **Note:** See the noise package for more advanced random functions
       */
      function rand(seed) {
        if (typeof seed === "number") {
          return (0, exports.frac)(
            Math.sin(seed * float(91.3458)) * float(47453.5453)
          );
        } else {
          return Math.random();
        }
      }
      exports.rand = rand;
      /**
       * Returns a deterministic (same seed = same output) random float between 0-1
       *
       * **Note:** See the noise package for more advanced random functions
       */
      function rand2(seed) {
        return (0, exports.frac)(
          Math.sin((0, exports.dot)(seed, float2(12.9898, 4.1414))) *
            float(43758.5453)
        );
      }
      exports.rand2 = rand2;
      /**
       * Returns a deterministic (same seed = same output) random float between 0-1
       *
       * **Note:** See the noise package for more advanced random functions
       */
      function rand3(seed) {
        var _a, _b;
        return rand2(
          ((_a = swizzle(seed, "xy")),
          (_b = rand(swizzle(seed, "z"))),
          [_a[0] + _b, _a[1] + _b])
        );
      }
      exports.rand3 = rand3;
      // export function remap(x: float, low1: float, high1: float, low2: float, high2: float): float {
      // 	return add(low2, mul(div(sub(x, low1), sub(high1, low1)), sub(high2, low2)));
      // }
      function pingpong(x, length) {
        var t = x % (length * float(2));
        return length - Math.abs(t - length);
      }
      exports.pingpong = pingpong;
      function vectorMath_2to1_3to3(cb2, cb3) {
        return function (a, b) {
          if (a.length === 2 && b.length === 2) {
            return cb2(a, b);
          } else if (a.length === 3 && b.length === 3) {
            return cb3(a, b);
          } else {
            throw new Error("Invalid vector length");
          }
        };
      }
      function vectorMath_2to1_3to3_4to4(cb2, cb3, cb4) {
        return function (a, b) {
          if (a.length === 2 && b.length === 2) {
            return cb2(a, b);
          } else if (a.length === 3 && b.length === 3) {
            return cb3(a, b);
          } else if (a.length === 4 && b.length === 4) {
            return cb4(a, b);
          } else {
            throw new Error("Invalid vector length");
          }
        };
      }
      function vectorMath_2to1_3to1_4to1(cb2, cb3, cb4) {
        return function (a, b) {
          if (a.length === 2 && b.length === 2) {
            return cb2(a, b);
          } else if (a.length === 3 && b.length === 3) {
            return cb3(a, b);
          } else if (a.length === 4 && b.length === 4) {
            return cb4(a, b);
          } else {
            throw new Error("Invalid vector length");
          }
        };
      }
      function cross2(a, b) {
        return a[0] * b[1] - a[1] * b[0];
      }
      function cross3(a, b) {
        return [
          a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0],
        ];
      }
      exports.cross = vectorMath_2to1_3to3(cross2, cross3);
      function dot2(a, b) {
        return a[0] * b[0] + a[1] * b[1];
      }
      function dot3(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      }
      function dot4(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
      }
      /** @shadeup=univ(dot)*/
      exports.dot = vectorMath_2to1_3to1_4to1(dot2, dot3, dot4);
      function lerp1(a, b, t) {
        return a + (b - a) * t;
      }
      function lerp2(a, b, t) {
        return [lerp1(a[0], b[0], t), lerp1(a[1], b[1], t)];
      }
      function lerp3(a, b, t) {
        return [
          lerp1(a[0], b[0], t),
          lerp1(a[1], b[1], t),
          lerp1(a[2], b[2], t),
        ];
      }
      function lerp4(a, b, t) {
        return [
          lerp1(a[0], b[0], t),
          lerp1(a[1], b[1], t),
          lerp1(a[2], b[2], t),
          lerp1(a[3], b[3], t),
        ];
      }
      function lerp2x2(a, b, t) {
        return float2x2(
          lerp1(a[0], b[0], t),
          lerp1(a[1], b[1], t),
          lerp1(a[2], b[2], t),
          lerp1(a[3], b[3], t)
        );
      }
      function lerp3x3(a, b, t) {
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
      function lerp4x4(a, b, t) {
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
      function lerp(a, b, t) {
        if (
          typeof a === "number" &&
          typeof b === "number" &&
          typeof t === "number"
        ) {
          return lerp1(a, b, t);
        } else if (isMatrix(a) && isMatrix(b)) {
          if (a.length === 4 && b.length === 4) {
            return lerp2x2(a, b, t);
          } else if (a.length === 9 && b.length === 9) {
            return lerp3x3(a, b, t);
          } else if (a.length === 16 && b.length === 16) {
            return lerp4x4(a, b, t);
          } else {
            throw new Error("Invalid matrix length");
          }
        } else if (a.length === 2 && b.length === 2 && typeof t === "number") {
          return lerp2(a, b, t);
        } else if (a.length === 3 && b.length === 3 && typeof t === "number") {
          return lerp3(a, b, t);
        } else if (a.length === 4 && b.length === 4 && typeof t === "number") {
          return lerp4(a, b, t);
        } else {
          throw new Error("Invalid vector length");
        }
      }
      exports.lerp = lerp;
      /** @shadeup=univ(!bilerp_`0`($0$, $1$, $2$, $3$, $4$, $5$)) */
      function bilerp(a, b, c, d, u, v) {
        return lerp(lerp(a, b, u), lerp(c, d, u), v);
      }
      exports.bilerp = bilerp;
      /** @shadeup=univ(length)*/
      function length(a) {
        if (typeof a === "number") {
          return Math.abs(a);
        } else if (a.length === 2) {
          return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2));
        } else if (a.length === 3) {
          return Math.sqrt(
            Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2)
          );
        } else if (a.length === 4) {
          return Math.sqrt(
            Math.pow(a[0], 2) +
              Math.pow(a[1], 2) +
              Math.pow(a[2], 2) +
              Math.pow(a[3], 2)
          );
        } else {
          throw new Error("Invalid vector length");
        }
      }
      exports.length = length;
      function dist(a, b) {
        return length((0, exports.sub)(a, b));
      }
      exports.dist = dist;
      /** @shadeup=univ(distance)*/
      exports.distance = dist;
      /** @shadeup=univ(normalize)*/
      function normalize(a) {
        if (a.length === 2) {
          var l = length(a);
          return [a[0] / l, a[1] / l];
        } else if (a.length === 3) {
          var l = length(a);
          return [a[0] / l, a[1] / l, a[2] / l];
        } else if (a.length === 4) {
          var l = length(a);
          return [a[0] / l, a[1] / l, a[2] / l, a[3] / l];
        } else {
          throw new Error("Invalid vector length");
        }
      }
      exports.normalize = normalize;
      /** @shadeup=univ(reflect)*/
      function reflect(a, b) {
        if (a.length === 2 && b.length === 2) {
          return reflect2(a, b);
        } else if (a.length === 3 && b.length === 3) {
          return reflect3(a, b);
        } else if (a.length === 4 && b.length === 4) {
          return reflect4(a, b);
        } else {
          throw new Error("Invalid vector length");
        }
      }
      exports.reflect = reflect;
      function reflect2(b, a) {
        var dot = dot2(a, b);
        return [b[0] - 2 * dot * a[0], b[1] - 2 * dot * a[1]];
      }
      function reflect3(b, a) {
        var dot = dot3(a, b);
        return [
          b[0] - 2 * dot * a[0],
          b[1] - 2 * dot * a[1],
          b[2] - 2 * dot * a[2],
        ];
      }
      function reflect4(b, a) {
        var dot = dot4(a, b);
        return [
          b[0] - 2 * dot * a[0],
          b[1] - 2 * dot * a[1],
          b[2] - 2 * dot * a[2],
          b[3] - 2 * dot * a[3],
        ];
      }
      /** @shadeup=univ(refract)*/
      function refract(a, b, eta) {
        if (a.length === 2 && b.length === 2) {
          return refract2(a, b, eta);
        } else if (a.length === 3 && b.length === 3) {
          return refract3(a, b, eta);
        } else if (a.length === 4 && b.length === 4) {
          return refract4(a, b, eta);
        } else {
          throw new Error("Invalid vector length");
        }
      }
      exports.refract = refract;
      function refract2(b, a, eta) {
        var dot = dot2(a, b);
        var k = 1 - eta * eta * (1 - dot * dot);
        return k < 0
          ? [0, 0]
          : [
              eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
              eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1],
            ];
      }
      function refract3(b, a, eta) {
        var dot = dot3(a, b);
        var k = 1 - eta * eta * (1 - dot * dot);
        return k < 0
          ? [0, 0, 0]
          : [
              eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
              eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1],
              eta * b[2] - (eta * dot + Math.sqrt(k)) * a[2],
            ];
      }
      function refract4(b, a, eta) {
        var dot = dot4(a, b);
        var k = 1 - eta * eta * (1 - dot * dot);
        return k < 0
          ? [0, 0, 0, 0]
          : [
              eta * b[0] - (eta * dot + Math.sqrt(k)) * a[0],
              eta * b[1] - (eta * dot + Math.sqrt(k)) * a[1],
              eta * b[2] - (eta * dot + Math.sqrt(k)) * a[2],
              eta * b[3] - (eta * dot + Math.sqrt(k)) * a[3],
            ];
      }
      /** @shadeup=univ(degrees)*/
      function degrees(a) {
        return float((a * 180) / Math.PI);
      }
      exports.degrees = degrees;
      /** @shadeup=univ(radians)*/
      function radians(a) {
        return float((a * Math.PI) / 180);
      }
      exports.radians = radians;
      /** @shadeup=univ(step)*/
      function step(edge, x) {
        if (typeof edge === "number") {
          if (typeof x === "number") {
            return x < edge ? 0 : 1;
          } else {
            return x.map(function (v) {
              return v < edge ? 0 : 1;
            });
          }
        } else {
          if (typeof x === "number") {
            return edge.map(function (v) {
              return x < v ? 0 : 1;
            });
          } else {
            return edge.map(function (v, i) {
              return x[i] < v ? 0 : 1;
            });
          }
        }
      }
      exports.step = step;
      function _smoothstep(a, b, x) {
        var t = clamp((x - a) / (b - a), 0, 1);
        return t * t * (3 - 2 * t);
      }
      /** @shadeup=univ(smoothstep)*/
      function smoothstep(a, b, x) {
        if (
          typeof a === "number" &&
          typeof b === "number" &&
          typeof x === "number"
        ) {
          return _smoothstep(a, b, x);
        } else if (typeof a === "number" && typeof b === "number") {
          return x.map(function (v) {
            return _smoothstep(a, b, v);
          });
        } else {
          return a.map(function (v, i) {
            return _smoothstep(v, b[i], x[i]);
          });
        }
      }
      exports.smoothstep = smoothstep;
      function componentReduce(vectors, cb) {
        var result = [];
        var _loop_1 = function (i) {
          result.push(
            cb(
              vectors.map(function (v) {
                return v[i];
              })
            )
          );
        };
        for (var i = 0; i < vectors[0].length; i++) {
          _loop_1(i);
        }
        return result;
      }
      /** @shadeup=univ(min)*/
      function min() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (args.length == 1) {
          if (Array.isArray(args[0])) {
            return Math.min.apply(Math, args[0]);
          } else {
            return args[0];
          }
        } else {
          if (Array.isArray(args[0]) && !Array.isArray(args[1])) {
            var minTo_1 = args[1];
            return args[0].map(function (v) {
              return Math.min(v, minTo_1);
            });
          } else if (!Array.isArray(args[0]) && Array.isArray(args[1])) {
            var minFrom_1 = args[0];
            return args[1].map(function (v) {
              return Math.min(minFrom_1, v);
            });
          } else if (Array.isArray(args[0])) {
            return componentReduce(args, function (a) {
              return Math.min.apply(Math, a);
            });
          } else {
            return Math.min.apply(Math, args);
          }
        }
      }
      exports.min = min;
      /** @shadeup=univ(max)*/
      function max() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (args.length == 1) {
          if (Array.isArray(args[0])) {
            return Math.max.apply(Math, args[0]);
          } else {
            return args[0];
          }
        } else {
          if (Array.isArray(args[0]) && !Array.isArray(args[1])) {
            var maxTo_1 = args[1];
            return args[0].map(function (v) {
              return Math.max(v, maxTo_1);
            });
          } else if (!Array.isArray(args[0]) && Array.isArray(args[1])) {
            var maxFrom_1 = args[0];
            return args[1].map(function (v) {
              return Math.max(maxFrom_1, v);
            });
          } else if (Array.isArray(args[0])) {
            return componentReduce(args, function (a) {
              return Math.max.apply(Math, a);
            });
          } else {
            return Math.max.apply(Math, args);
          }
        }
      }
      exports.max = max;
      /** @shadeup=univ(clamp)*/
      function clamp(arg, min, max) {
        if (Array.isArray(arg)) {
          if (Array.isArray(min) && Array.isArray(max)) {
            return arg.map(function (a, i) {
              return Math.min(Math.max(a, min[i]), max[i]);
            });
          } else {
            return arg.map(function (a) {
              return Math.min(Math.max(a, min), max);
            });
          }
        } else {
          return Math.min(Math.max(arg, min), max);
        }
      }
      exports.clamp = clamp;
      /** @shadeup=glsl(!clamp($0$, 0.0, 1.0)) @shadeup=wgsl(saturate) */
      function saturate(arg) {
        return clamp(arg, float(0), float(1));
      }
      exports.saturate = saturate;
      function eq(a, b) {
        var ta = typeof a;
        var tb = typeof b;
        if (ta != tb) {
          return false;
        } else if (
          (ta == "number" && tb == "number") ||
          (ta == "string" && tb == "string") ||
          (ta == "boolean" && tb == "boolean") ||
          (ta == "undefined" && tb == "undefined")
        ) {
          return a == b;
        } else if (ta == "object" && tb == "object") {
          if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length != b.length) {
              return false;
            }
            for (var i = 0; i < a.length; i++) {
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
      exports.eq = eq;
      /** @shadeup=univ(!($0$ != $1$))*/
      var neq = function (a, b) {
        return !eq(a, b);
      };
      exports.neq = neq;
      /** @shadeup=univ(!($0$ < $1$))*/
      var lt = function (a, b) {
        return a < b;
      };
      exports.lt = lt;
      /** @shadeup=univ(!($0$ <= $1$))*/
      var lte = function (a, b) {
        return a <= b;
      };
      exports.lte = lte;
      /** @shadeup=univ(!($0$ > $1$))*/
      var gt = function (a, b) {
        return a > b;
      };
      exports.gt = gt;
      /** @shadeup=univ(!($0$ >= $1$))*/
      var gte = function (a, b) {
        return a >= b;
      };
      exports.gte = gte;
      /** @shadeup=univ(!($0$ && $1$))*/
      var and = function (a, b) {
        return a && b;
      };
      exports.and = and;
      /** @shadeup=univ(!($0$ || $1$))*/
      var or = function (a, b) {
        return a || b;
      };
      exports.or = or;
      /** @shadeup=univ(!(!$0$))*/
      var not = function (a) {
        return !a;
      };
      exports.not = not;
      /** @shadeup=univ()*/
      function makeVector() {
        var out = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          if (typeof a === "number") {
            out.push(a);
          } else {
            for (var j = 0; j < a.length; j++) {
              out.push(a[j]);
            }
          }
        }
        return out;
        throw new Error("Invalid vector length");
      }
      exports.makeVector = makeVector;
      var swizIndex = {
        x: 0,
        y: 1,
        z: 2,
        w: 3,
        r: 0,
        g: 1,
        b: 2,
        a: 3,
      };
      var getSwizIndexFast = function (swiz) {
        switch (swiz) {
          case "x":
            return 0;
          case "y":
            return 1;
          case "z":
            return 2;
          case "w":
            return 3;
          case "r":
            return 0;
          case "g":
            return 1;
          case "b":
            return 2;
          case "a":
            return 3;
        }
      };
      /** @shadeup=shader */
      function testDocComment() {
        return 1;
      }
      exports.testDocComment = testDocComment;
      function swizzle(v, swiz, assign) {
        var _a;
        if (typeof v === "number") {
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
          if (typeof assign !== "undefined") {
            for (var i = 0; i < swiz.length; i++) {
              v[getSwizIndexFast(swiz[i])] =
                (_a = assign[i]) !== null && _a !== void 0 ? _a : assign;
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
              v[getSwizIndexFast(swiz[2])],
            ];
          } else if (swiz.length === 4) {
            return [
              v[getSwizIndexFast(swiz[0])],
              v[getSwizIndexFast(swiz[1])],
              v[getSwizIndexFast(swiz[2])],
              v[getSwizIndexFast(swiz[3])],
            ];
          }
        } else {
          return v[swiz];
        }
      }
      exports.swizzle = swizzle;
      function intifyVector(v) {
        if (typeof v === "number") {
          return v;
        } else if (Array.isArray(v)) {
          return v.map(function (v) {
            return v | 0;
          });
        } else {
          return v;
        }
      }
      exports.intifyVector = intifyVector;
      exports.FM = static_math_1.FM;
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
      var atomic_internal = /** @class */ (function () {
        function atomic_internal(value) {
          this.__value = value;
        }
        /** @shadeup=univ(!atomicLoad(&$self$))*/
        atomic_internal.prototype.load = function () {
          return this.__value;
        };
        /** @shadeup=univ(!atomicStore(&$self$, $0$))*/
        atomic_internal.prototype.store = function (value) {
          this.__value = value;
          if (this.$mutate) this.$mutate(this.__value);
        };
        /** @shadeup=univ(!atomicAdd(&$self$, $0$))*/
        atomic_internal.prototype.add = function (value) {
          var old = this.__value;
          this.__value += value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicSub(&$self$, $0$))*/
        atomic_internal.prototype.sub = function (value) {
          var old = this.__value;
          this.__value -= value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicMax(&$self$, $0$))*/
        atomic_internal.prototype.max = function (value) {
          var old = this.__value;
          this.__value = Math.max(value, this.__value);
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicMin(&$self$, $0$))*/
        atomic_internal.prototype.min = function (value) {
          var old = this.__value;
          this.__value = Math.min(value, this.__value);
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicAnd(&$self$, $0$))*/
        atomic_internal.prototype.and = function (value) {
          var old = this.__value;
          this.__value = value & this.__value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicOr(&$self$, $0$))*/
        atomic_internal.prototype.or = function (value) {
          var old = this.__value;
          this.__value = value | this.__value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicXor(&$self$, $0$))*/
        atomic_internal.prototype.xor = function (value) {
          var old = this.__value;
          this.__value = value ^ this.__value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicExchange(&$self$, $0$))*/
        atomic_internal.prototype.exchange = function (value) {
          var old = this.__value;
          this.__value = value;
          if (this.$mutate) this.$mutate(this.__value);
          return old;
        };
        /** @shadeup=univ(!atomicCompareExchangeWeak(&$self$, $0$, $1$))*/
        atomic_internal.prototype.compareExchangeWeak = function (
          compare,
          value
        ) {
          var old = this.__value;
          if (old == compare) {
            this.__value = value;
          }
          if (this.$mutate) this.$mutate(this.__value);
          return {
            old_value: old,
            exchanged: old == compare,
          };
        };
        atomic_internal.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_std_math_ts_71052_atomic_internal","fields":[["__type",{"type":"unknown"}],["__value",null],["$mutate",{"type":"unknown"}]]}'
          );
        };
        return atomic_internal;
      })();
      exports.atomic_internal = atomic_internal;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_std_math_ts_71052_atomic_internal","fields":[["__type",{"type":"unknown"}],["__value",null],["$mutate",{"type":"unknown"}]]}'
        ),
        atomic_internal
      );
      function atomic(value) {
        return new atomic_internal(value);
      }
      exports.atomic = atomic;
      window.makeAtomic = atomic;
      /**
       * Executes a control barrier synchronization function that affects memory and atomic operations in the workgroup address space.
       *
       * See: https://www.w3.org/TR/WGSL/#workgroupBarrier-builtin
       *
       * @shadeup=univ(!workgroupBarrier())
       */
      function workgroupBarrier() {}
      exports.workgroupBarrier = workgroupBarrier;
      /**
       * Executes a storage barrier synchronization function that affects memory and atomic operations in the workgroup address space.
       *
       * See: https://www.w3.org/TR/WGSL/#storageBarrier-builtin
       *
       * @shadeup=univ(!storageBarrier())
       */
      function storageBarrier() {}
      exports.storageBarrier = storageBarrier;
      /**
       * See: https://www.w3.org/TR/WGSL/#workgroupUniformLoad-builtin
       *
       * @shadeup=univ(!workgroupUniformLoad(&$0$))
       */
      function workgroupUniformLoad(p) {
        return p;
      }
      exports.workgroupUniformLoad = workgroupUniformLoad;
      /**
       * Discards the current fragment.
       *
       * A discard statement converts the invocation into a helper invocation and throws away the fragment. The discard statement must only be used in a fragment shader stage.
       *
       * See: https://www.w3.org/TR/WGSL/#discard-statement
       *
       * @shadeup=univ(!discard;)
       */
      function discard() {}
      exports.discard = discard;
      /**
       * Returns the derivative of the input value with respect to the window-space x coordinate.
       * @param value - The input value.
       * @returns The derivative of the input value with respect to the window-space x coordinate.
       * @shadeup=glsl(!dFdx($0$))
       * @shadeup=wgsl(!dpdx($0$))
       */
      function ddx(value) {
        return 0;
      }
      exports.ddx = ddx;
      /**
       * Returns the derivative of the input value with respect to the window-space y coordinate.
       * @param value - The input value.
       *
       * @returns The derivative of the input value with respect to the window-space y coordinate.
       * @shadeup=glsl(!dFdy($0$))
       * @shadeup=wgsl(!dpdy($0$))
       */
      function ddy(value) {
        return 0;
      }
      exports.ddy = ddy;
      /**
       * @shadeup=glsl(!dFdxFine($0$))
       * @shadeup=wgsl(!dpdxFine($0$))
       */
      function ddxFine(value) {
        return 0;
      }
      exports.ddxFine = ddxFine;
      /**
       * @shadeup=glsl(!dFdyFine($0$))
       * @shadeup=wgsl(!dpdyFine($0$))
       */
      function ddyFine(value) {
        return 0;
      }
      exports.ddyFine = ddyFine;
      /**
       * @shadeup=glsl(!dFdxCoarse($0$))
       * @shadeup=wgsl(!dpdxCoarse($0$))
       */
      function ddxCoarse(value) {
        return 0;
      }
      exports.ddxCoarse = ddxCoarse;
      /**
       * @shadeup=glsl(!dFdyCoarse($0$))
       * @shadeup=wgsl(!dpdyCoarse($0$))
       */
      function ddyCoarse(value) {
        return 0;
      }
      exports.ddyCoarse = ddyCoarse;
      /**
       * @shadeup=glsl(!$0$)
       * @shadeup=wgsl(!bitcast<$[0]$>($0$))
       */
      function bitcast(value) {
        return 0;
      }
      exports.bitcast = bitcast;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/static-math.js", deps, func);
    define(["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FM = void 0;
      ///
      /// GENERATED
      /// DO NOT EDIT THIS FILE
      /// see generate-static-math.ts
      ///
      exports.FM = {
        add_1_1: function (a, b) {
          return a + b;
        },
        add_2_1: function (a, b) {
          return [a[0] + b, a[1] + b];
        },
        add_1_2: function (a, b) {
          return [a + b[0], a + b[1]];
        },
        add_2_2: function (a, b) {
          return [a[0] + b[0], a[1] + b[1]];
        },
        add_3_1: function (a, b) {
          return [a[0] + b, a[1] + b, a[2] + b];
        },
        add_1_3: function (a, b) {
          return [a + b[0], a + b[1], a + b[2]];
        },
        add_3_3: function (a, b) {
          return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
        },
        add_4_1: function (a, b) {
          return [a[0] + b, a[1] + b, a[2] + b, a[3] + b];
        },
        add_1_4: function (a, b) {
          return [a + b[0], a + b[1], a + b[2], a + b[3]];
        },
        add_4_4: function (a, b) {
          return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
        },
        sub_1_1: function (a, b) {
          return a - b;
        },
        sub_2_1: function (a, b) {
          return [a[0] - b, a[1] - b];
        },
        sub_1_2: function (a, b) {
          return [a - b[0], a - b[1]];
        },
        sub_2_2: function (a, b) {
          return [a[0] - b[0], a[1] - b[1]];
        },
        sub_3_1: function (a, b) {
          return [a[0] - b, a[1] - b, a[2] - b];
        },
        sub_1_3: function (a, b) {
          return [a - b[0], a - b[1], a - b[2]];
        },
        sub_3_3: function (a, b) {
          return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        },
        sub_4_1: function (a, b) {
          return [a[0] - b, a[1] - b, a[2] - b, a[3] - b];
        },
        sub_1_4: function (a, b) {
          return [a - b[0], a - b[1], a - b[2], a - b[3]];
        },
        sub_4_4: function (a, b) {
          return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
        },
        div_1_1: function (a, b) {
          return a / b;
        },
        div_2_1: function (a, b) {
          return [a[0] / b, a[1] / b];
        },
        div_1_2: function (a, b) {
          return [a / b[0], a / b[1]];
        },
        div_2_2: function (a, b) {
          return [a[0] / b[0], a[1] / b[1]];
        },
        div_3_1: function (a, b) {
          return [a[0] / b, a[1] / b, a[2] / b];
        },
        div_1_3: function (a, b) {
          return [a / b[0], a / b[1], a / b[2]];
        },
        div_3_3: function (a, b) {
          return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
        },
        div_4_1: function (a, b) {
          return [a[0] / b, a[1] / b, a[2] / b, a[3] / b];
        },
        div_1_4: function (a, b) {
          return [a / b[0], a / b[1], a / b[2], a / b[3]];
        },
        div_4_4: function (a, b) {
          return [a[0] / b[0], a[1] / b[1], a[2] / b[2], a[3] / b[3]];
        },
        mul_1_1: function (a, b) {
          return a * b;
        },
        mul_2_1: function (a, b) {
          return [a[0] * b, a[1] * b];
        },
        mul_1_2: function (a, b) {
          return [a * b[0], a * b[1]];
        },
        mul_2_2: function (a, b) {
          return [a[0] * b[0], a[1] * b[1]];
        },
        mul_3_1: function (a, b) {
          return [a[0] * b, a[1] * b, a[2] * b];
        },
        mul_1_3: function (a, b) {
          return [a * b[0], a * b[1], a * b[2]];
        },
        mul_3_3: function (a, b) {
          return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
        },
        mul_4_1: function (a, b) {
          return [a[0] * b, a[1] * b, a[2] * b, a[3] * b];
        },
        mul_1_4: function (a, b) {
          return [a * b[0], a * b[1], a * b[2], a * b[3]];
        },
        mul_4_4: function (a, b) {
          return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3] * b[3]];
        },
        mod_1_1: function (a, b) {
          return a % b;
        },
        mod_2_1: function (a, b) {
          return [a[0] % b, a[1] % b];
        },
        mod_1_2: function (a, b) {
          return [a % b[0], a % b[1]];
        },
        mod_2_2: function (a, b) {
          return [a[0] % b[0], a[1] % b[1]];
        },
        mod_3_1: function (a, b) {
          return [a[0] % b, a[1] % b, a[2] % b];
        },
        mod_1_3: function (a, b) {
          return [a % b[0], a % b[1], a % b[2]];
        },
        mod_3_3: function (a, b) {
          return [a[0] % b[0], a[1] % b[1], a[2] % b[2]];
        },
        mod_4_1: function (a, b) {
          return [a[0] % b, a[1] % b, a[2] % b, a[3] % b];
        },
        mod_1_4: function (a, b) {
          return [a % b[0], a % b[1], a % b[2], a % b[3]];
        },
        mod_4_4: function (a, b) {
          return [a[0] % b[0], a[1] % b[1], a[2] % b[2], a[3] % b[3]];
        },
        bitand_1_1: function (a, b) {
          return a & b;
        },
        bitand_2_1: function (a, b) {
          return [a[0] & b, a[1] & b];
        },
        bitand_1_2: function (a, b) {
          return [a & b[0], a & b[1]];
        },
        bitand_2_2: function (a, b) {
          return [a[0] & b[0], a[1] & b[1]];
        },
        bitand_3_1: function (a, b) {
          return [a[0] & b, a[1] & b, a[2] & b];
        },
        bitand_1_3: function (a, b) {
          return [a & b[0], a & b[1], a & b[2]];
        },
        bitand_3_3: function (a, b) {
          return [a[0] & b[0], a[1] & b[1], a[2] & b[2]];
        },
        bitand_4_1: function (a, b) {
          return [a[0] & b, a[1] & b, a[2] & b, a[3] & b];
        },
        bitand_1_4: function (a, b) {
          return [a & b[0], a & b[1], a & b[2], a & b[3]];
        },
        bitand_4_4: function (a, b) {
          return [a[0] & b[0], a[1] & b[1], a[2] & b[2], a[3] & b[3]];
        },
        bitor_1_1: function (a, b) {
          return a | b;
        },
        bitor_2_1: function (a, b) {
          return [a[0] | b, a[1] | b];
        },
        bitor_1_2: function (a, b) {
          return [a | b[0], a | b[1]];
        },
        bitor_2_2: function (a, b) {
          return [a[0] | b[0], a[1] | b[1]];
        },
        bitor_3_1: function (a, b) {
          return [a[0] | b, a[1] | b, a[2] | b];
        },
        bitor_1_3: function (a, b) {
          return [a | b[0], a | b[1], a | b[2]];
        },
        bitor_3_3: function (a, b) {
          return [a[0] | b[0], a[1] | b[1], a[2] | b[2]];
        },
        bitor_4_1: function (a, b) {
          return [a[0] | b, a[1] | b, a[2] | b, a[3] | b];
        },
        bitor_1_4: function (a, b) {
          return [a | b[0], a | b[1], a | b[2], a | b[3]];
        },
        bitor_4_4: function (a, b) {
          return [a[0] | b[0], a[1] | b[1], a[2] | b[2], a[3] | b[3]];
        },
        bitxor_1_1: function (a, b) {
          return a ^ b;
        },
        bitxor_2_1: function (a, b) {
          return [a[0] ^ b, a[1] ^ b];
        },
        bitxor_1_2: function (a, b) {
          return [a ^ b[0], a ^ b[1]];
        },
        bitxor_2_2: function (a, b) {
          return [a[0] ^ b[0], a[1] ^ b[1]];
        },
        bitxor_3_1: function (a, b) {
          return [a[0] ^ b, a[1] ^ b, a[2] ^ b];
        },
        bitxor_1_3: function (a, b) {
          return [a ^ b[0], a ^ b[1], a ^ b[2]];
        },
        bitxor_3_3: function (a, b) {
          return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2]];
        },
        bitxor_4_1: function (a, b) {
          return [a[0] ^ b, a[1] ^ b, a[2] ^ b, a[3] ^ b];
        },
        bitxor_1_4: function (a, b) {
          return [a ^ b[0], a ^ b[1], a ^ b[2], a ^ b[3]];
        },
        bitxor_4_4: function (a, b) {
          return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
        },
        lshift_1_1: function (a, b) {
          return a << b;
        },
        lshift_2_1: function (a, b) {
          return [a[0] << b, a[1] << b];
        },
        lshift_1_2: function (a, b) {
          return [a << b[0], a << b[1]];
        },
        lshift_2_2: function (a, b) {
          return [a[0] << b[0], a[1] << b[1]];
        },
        lshift_3_1: function (a, b) {
          return [a[0] << b, a[1] << b, a[2] << b];
        },
        lshift_1_3: function (a, b) {
          return [a << b[0], a << b[1], a << b[2]];
        },
        lshift_3_3: function (a, b) {
          return [a[0] << b[0], a[1] << b[1], a[2] << b[2]];
        },
        lshift_4_1: function (a, b) {
          return [a[0] << b, a[1] << b, a[2] << b, a[3] << b];
        },
        lshift_1_4: function (a, b) {
          return [a << b[0], a << b[1], a << b[2], a << b[3]];
        },
        lshift_4_4: function (a, b) {
          return [a[0] << b[0], a[1] << b[1], a[2] << b[2], a[3] << b[3]];
        },
        rshift_1_1: function (a, b) {
          return a >> b;
        },
        rshift_2_1: function (a, b) {
          return [a[0] >> b, a[1] >> b];
        },
        rshift_1_2: function (a, b) {
          return [a >> b[0], a >> b[1]];
        },
        rshift_2_2: function (a, b) {
          return [a[0] >> b[0], a[1] >> b[1]];
        },
        rshift_3_1: function (a, b) {
          return [a[0] >> b, a[1] >> b, a[2] >> b];
        },
        rshift_1_3: function (a, b) {
          return [a >> b[0], a >> b[1], a >> b[2]];
        },
        rshift_3_3: function (a, b) {
          return [a[0] >> b[0], a[1] >> b[1], a[2] >> b[2]];
        },
        rshift_4_1: function (a, b) {
          return [a[0] >> b, a[1] >> b, a[2] >> b, a[3] >> b];
        },
        rshift_1_4: function (a, b) {
          return [a >> b[0], a >> b[1], a >> b[2], a >> b[3]];
        },
        rshift_4_4: function (a, b) {
          return [a[0] >> b[0], a[1] >> b[1], a[2] >> b[2], a[3] >> b[3]];
        },
        bitnot_1: function (a) {
          return ~a;
        },
        bitnot_2: function (a) {
          return [~a[0], ~a[1]];
        },
        bitnot_3: function (a) {
          return [~a[0], ~a[1], ~a[2]];
        },
        bitnot_4: function (a) {
          return [~a[0], ~a[1], ~a[2], ~a[3]];
        },
        negate_1: function (a) {
          return -a;
        },
        negate_2: function (a) {
          return [-a[0], -a[1]];
        },
        negate_3: function (a) {
          return [-a[0], -a[1], -a[2]];
        },
        negate_4: function (a) {
          return [-a[0], -a[1], -a[2], -a[3]];
        },
        positive_1: function (a) {
          return Math.abs(a);
        },
        positive_2: function (a) {
          return [Math.abs(a[0]), Math.abs(a[1])];
        },
        positive_3: function (a) {
          return [Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])];
        },
        positive_4: function (a) {
          return [
            Math.abs(a[0]),
            Math.abs(a[1]),
            Math.abs(a[2]),
            Math.abs(a[3]),
          ];
        },
        abs_1: function (a) {
          return Math.abs(a);
        },
        abs_2: function (a) {
          return [Math.abs(a[0]), Math.abs(a[1])];
        },
        abs_3: function (a) {
          return [Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])];
        },
        abs_4: function (a) {
          return [
            Math.abs(a[0]),
            Math.abs(a[1]),
            Math.abs(a[2]),
            Math.abs(a[3]),
          ];
        },
        floor_1: function (a) {
          return Math.floor(a);
        },
        floor_2: function (a) {
          return [Math.floor(a[0]), Math.floor(a[1])];
        },
        floor_3: function (a) {
          return [Math.floor(a[0]), Math.floor(a[1]), Math.floor(a[2])];
        },
        floor_4: function (a) {
          return [
            Math.floor(a[0]),
            Math.floor(a[1]),
            Math.floor(a[2]),
            Math.floor(a[3]),
          ];
        },
        ceil_1: function (a) {
          return Math.ceil(a);
        },
        ceil_2: function (a) {
          return [Math.ceil(a[0]), Math.ceil(a[1])];
        },
        ceil_3: function (a) {
          return [Math.ceil(a[0]), Math.ceil(a[1]), Math.ceil(a[2])];
        },
        ceil_4: function (a) {
          return [
            Math.ceil(a[0]),
            Math.ceil(a[1]),
            Math.ceil(a[2]),
            Math.ceil(a[3]),
          ];
        },
        round_1: function (a) {
          return Math.round(a);
        },
        round_2: function (a) {
          return [Math.round(a[0]), Math.round(a[1])];
        },
        round_3: function (a) {
          return [Math.round(a[0]), Math.round(a[1]), Math.round(a[2])];
        },
        round_4: function (a) {
          return [
            Math.round(a[0]),
            Math.round(a[1]),
            Math.round(a[2]),
            Math.round(a[3]),
          ];
        },
        sign_1: function (a) {
          return Math.sign(a);
        },
        sign_2: function (a) {
          return [Math.sign(a[0]), Math.sign(a[1])];
        },
        sign_3: function (a) {
          return [Math.sign(a[0]), Math.sign(a[1]), Math.sign(a[2])];
        },
        sign_4: function (a) {
          return [
            Math.sign(a[0]),
            Math.sign(a[1]),
            Math.sign(a[2]),
            Math.sign(a[3]),
          ];
        },
        cos_1: function (a) {
          return Math.cos(a);
        },
        cos_2: function (a) {
          return [Math.cos(a[0]), Math.cos(a[1])];
        },
        cos_3: function (a) {
          return [Math.cos(a[0]), Math.cos(a[1]), Math.cos(a[2])];
        },
        cos_4: function (a) {
          return [
            Math.cos(a[0]),
            Math.cos(a[1]),
            Math.cos(a[2]),
            Math.cos(a[3]),
          ];
        },
        sin_1: function (a) {
          return Math.sin(a);
        },
        sin_2: function (a) {
          return [Math.sin(a[0]), Math.sin(a[1])];
        },
        sin_3: function (a) {
          return [Math.sin(a[0]), Math.sin(a[1]), Math.sin(a[2])];
        },
        sin_4: function (a) {
          return [
            Math.sin(a[0]),
            Math.sin(a[1]),
            Math.sin(a[2]),
            Math.sin(a[3]),
          ];
        },
        tan_1: function (a) {
          return Math.tan(a);
        },
        tan_2: function (a) {
          return [Math.tan(a[0]), Math.tan(a[1])];
        },
        tan_3: function (a) {
          return [Math.tan(a[0]), Math.tan(a[1]), Math.tan(a[2])];
        },
        tan_4: function (a) {
          return [
            Math.tan(a[0]),
            Math.tan(a[1]),
            Math.tan(a[2]),
            Math.tan(a[3]),
          ];
        },
        acos_1: function (a) {
          return Math.acos(a);
        },
        acos_2: function (a) {
          return [Math.acos(a[0]), Math.acos(a[1])];
        },
        acos_3: function (a) {
          return [Math.acos(a[0]), Math.acos(a[1]), Math.acos(a[2])];
        },
        acos_4: function (a) {
          return [
            Math.acos(a[0]),
            Math.acos(a[1]),
            Math.acos(a[2]),
            Math.acos(a[3]),
          ];
        },
        asin_1: function (a) {
          return Math.asin(a);
        },
        asin_2: function (a) {
          return [Math.asin(a[0]), Math.asin(a[1])];
        },
        asin_3: function (a) {
          return [Math.asin(a[0]), Math.asin(a[1]), Math.asin(a[2])];
        },
        asin_4: function (a) {
          return [
            Math.asin(a[0]),
            Math.asin(a[1]),
            Math.asin(a[2]),
            Math.asin(a[3]),
          ];
        },
        atan_1: function (a) {
          return Math.atan(a);
        },
        atan_2: function (a) {
          return [Math.atan(a[0]), Math.atan(a[1])];
        },
        atan_3: function (a) {
          return [Math.atan(a[0]), Math.atan(a[1]), Math.atan(a[2])];
        },
        atan_4: function (a) {
          return [
            Math.atan(a[0]),
            Math.atan(a[1]),
            Math.atan(a[2]),
            Math.atan(a[3]),
          ];
        },
        cosh_1: function (a) {
          return Math.cosh(a);
        },
        cosh_2: function (a) {
          return [Math.cosh(a[0]), Math.cosh(a[1])];
        },
        cosh_3: function (a) {
          return [Math.cosh(a[0]), Math.cosh(a[1]), Math.cosh(a[2])];
        },
        cosh_4: function (a) {
          return [
            Math.cosh(a[0]),
            Math.cosh(a[1]),
            Math.cosh(a[2]),
            Math.cosh(a[3]),
          ];
        },
        sinh_1: function (a) {
          return Math.sinh(a);
        },
        sinh_2: function (a) {
          return [Math.sinh(a[0]), Math.sinh(a[1])];
        },
        sinh_3: function (a) {
          return [Math.sinh(a[0]), Math.sinh(a[1]), Math.sinh(a[2])];
        },
        sinh_4: function (a) {
          return [
            Math.sinh(a[0]),
            Math.sinh(a[1]),
            Math.sinh(a[2]),
            Math.sinh(a[3]),
          ];
        },
        tanh_1: function (a) {
          return Math.tanh(a);
        },
        tanh_2: function (a) {
          return [Math.tanh(a[0]), Math.tanh(a[1])];
        },
        tanh_3: function (a) {
          return [Math.tanh(a[0]), Math.tanh(a[1]), Math.tanh(a[2])];
        },
        tanh_4: function (a) {
          return [
            Math.tanh(a[0]),
            Math.tanh(a[1]),
            Math.tanh(a[2]),
            Math.tanh(a[3]),
          ];
        },
        acosh_1: function (a) {
          return Math.acosh(a);
        },
        acosh_2: function (a) {
          return [Math.acosh(a[0]), Math.acosh(a[1])];
        },
        acosh_3: function (a) {
          return [Math.acosh(a[0]), Math.acosh(a[1]), Math.acosh(a[2])];
        },
        acosh_4: function (a) {
          return [
            Math.acosh(a[0]),
            Math.acosh(a[1]),
            Math.acosh(a[2]),
            Math.acosh(a[3]),
          ];
        },
        asinh_1: function (a) {
          return Math.asinh(a);
        },
        asinh_2: function (a) {
          return [Math.asinh(a[0]), Math.asinh(a[1])];
        },
        asinh_3: function (a) {
          return [Math.asinh(a[0]), Math.asinh(a[1]), Math.asinh(a[2])];
        },
        asinh_4: function (a) {
          return [
            Math.asinh(a[0]),
            Math.asinh(a[1]),
            Math.asinh(a[2]),
            Math.asinh(a[3]),
          ];
        },
        atanh_1: function (a) {
          return Math.atanh(a);
        },
        atanh_2: function (a) {
          return [Math.atanh(a[0]), Math.atanh(a[1])];
        },
        atanh_3: function (a) {
          return [Math.atanh(a[0]), Math.atanh(a[1]), Math.atanh(a[2])];
        },
        atanh_4: function (a) {
          return [
            Math.atanh(a[0]),
            Math.atanh(a[1]),
            Math.atanh(a[2]),
            Math.atanh(a[3]),
          ];
        },
        exp_1: function (a) {
          return Math.exp(a);
        },
        exp_2: function (a) {
          return [Math.exp(a[0]), Math.exp(a[1])];
        },
        exp_3: function (a) {
          return [Math.exp(a[0]), Math.exp(a[1]), Math.exp(a[2])];
        },
        exp_4: function (a) {
          return [
            Math.exp(a[0]),
            Math.exp(a[1]),
            Math.exp(a[2]),
            Math.exp(a[3]),
          ];
        },
        log_1: function (a) {
          return Math.log(a);
        },
        log_2: function (a) {
          return [Math.log(a[0]), Math.log(a[1])];
        },
        log_3: function (a) {
          return [Math.log(a[0]), Math.log(a[1]), Math.log(a[2])];
        },
        log_4: function (a) {
          return [
            Math.log(a[0]),
            Math.log(a[1]),
            Math.log(a[2]),
            Math.log(a[3]),
          ];
        },
        log2_1: function (a) {
          return Math.log2(a);
        },
        log2_2: function (a) {
          return [Math.log2(a[0]), Math.log2(a[1])];
        },
        log2_3: function (a) {
          return [Math.log2(a[0]), Math.log2(a[1]), Math.log2(a[2])];
        },
        log2_4: function (a) {
          return [
            Math.log2(a[0]),
            Math.log2(a[1]),
            Math.log2(a[2]),
            Math.log2(a[3]),
          ];
        },
        log10_1: function (a) {
          return Math.log10(a);
        },
        log10_2: function (a) {
          return [Math.log10(a[0]), Math.log10(a[1])];
        },
        log10_3: function (a) {
          return [Math.log10(a[0]), Math.log10(a[1]), Math.log10(a[2])];
        },
        log10_4: function (a) {
          return [
            Math.log10(a[0]),
            Math.log10(a[1]),
            Math.log10(a[2]),
            Math.log10(a[3]),
          ];
        },
        sqrt_1: function (a) {
          return Math.sqrt(a);
        },
        sqrt_2: function (a) {
          return [Math.sqrt(a[0]), Math.sqrt(a[1])];
        },
        sqrt_3: function (a) {
          return [Math.sqrt(a[0]), Math.sqrt(a[1]), Math.sqrt(a[2])];
        },
        sqrt_4: function (a) {
          return [
            Math.sqrt(a[0]),
            Math.sqrt(a[1]),
            Math.sqrt(a[2]),
            Math.sqrt(a[3]),
          ];
        },
        int_2_1_1: function (a, b) {
          return [a | 0, b | 0];
        },
        int_2_2: function (a) {
          return [a[0] | 0, a[1] | 0];
        },
        int_3_1_1_1: function (a, b, c) {
          return [a | 0, b | 0, c | 0];
        },
        int_3_2_1: function (a, b) {
          return [a[0] | 0, a[1] | 0, b | 0];
        },
        int_3_1_2: function (a, b) {
          return [a | 0, b[0] | 0, b[1] | 0];
        },
        int_3_3: function (a) {
          return [a[0] | 0, a[1] | 0, a[2] | 0];
        },
        int_4_1_1_1_1: function (a, b, c, d) {
          return [a | 0, b | 0, c | 0, d | 0];
        },
        int_4_2_1_1: function (a, b, c) {
          return [a[0] | 0, a[1] | 0, b | 0, c | 0];
        },
        int_4_1_2_1: function (a, b, c) {
          return [a | 0, b[0] | 0, b[1] | 0, c | 0];
        },
        int_4_1_1_2: function (a, b, c) {
          return [a | 0, b | 0, c[0] | 0, c[1] | 0];
        },
        int_4_3_1: function (a, b) {
          return [a[0] | 0, a[1] | 0, a[2] | 0, b | 0];
        },
        int_4_1_3: function (a, b) {
          return [a | 0, b[0] | 0, b[1] | 0, b[2] | 0];
        },
        int_4_2_2: function (a, b) {
          return [a[0] | 0, a[1] | 0, b[0] | 0, b[1] | 0];
        },
        int_4_4: function (a) {
          return [a[0] | 0, a[1] | 0, a[2] | 0, a[3] | 0];
        },
        float_2_1_1: function (a, b) {
          return [a, b];
        },
        float_2_2: function (a) {
          return [a[0], a[1]];
        },
        float_3_1_1_1: function (a, b, c) {
          return [a, b, c];
        },
        float_3_2_1: function (a, b) {
          return [a[0], a[1], b];
        },
        float_3_1_2: function (a, b) {
          return [a, b[0], b[1]];
        },
        float_3_3: function (a) {
          return [a[0], a[1], a[2]];
        },
        float_4_1_1_1_1: function (a, b, c, d) {
          return [a, b, c, d];
        },
        float_4_2_1_1: function (a, b, c) {
          return [a[0], a[1], b, c];
        },
        float_4_1_2_1: function (a, b, c) {
          return [a, b[0], b[1], c];
        },
        float_4_1_1_2: function (a, b, c) {
          return [a, b, c[0], c[1]];
        },
        float_4_3_1: function (a, b) {
          return [a[0], a[1], a[2], b];
        },
        float_4_1_3: function (a, b) {
          return [a, b[0], b[1], b[2]];
        },
        float_4_2_2: function (a, b) {
          return [a[0], a[1], b[0], b[1]];
        },
        float_4_4: function (a) {
          return [a[0], a[1], a[2], a[3]];
        },
        uint_2_1_1: function (a, b) {
          return [a >>> 0, b >>> 0];
        },
        uint_2_2: function (a) {
          return [a[0] >>> 0, a[1] >>> 0];
        },
        uint_3_1_1_1: function (a, b, c) {
          return [a >>> 0, b >>> 0, c >>> 0];
        },
        uint_3_2_1: function (a, b) {
          return [a[0] >>> 0, a[1] >>> 0, b >>> 0];
        },
        uint_3_1_2: function (a, b) {
          return [a >>> 0, b[0] >>> 0, b[1] >>> 0];
        },
        uint_3_3: function (a) {
          return [a[0] >>> 0, a[1] >>> 0, a[2] >>> 0];
        },
        uint_4_1_1_1_1: function (a, b, c, d) {
          return [a >>> 0, b >>> 0, c >>> 0, d >>> 0];
        },
        uint_4_2_1_1: function (a, b, c) {
          return [a[0] >>> 0, a[1] >>> 0, b >>> 0, c >>> 0];
        },
        uint_4_1_2_1: function (a, b, c) {
          return [a >>> 0, b[0] >>> 0, b[1] >>> 0, c >>> 0];
        },
        uint_4_1_1_2: function (a, b, c) {
          return [a >>> 0, b >>> 0, c[0] >>> 0, c[1] >>> 0];
        },
        uint_4_3_1: function (a, b) {
          return [a[0] >>> 0, a[1] >>> 0, a[2] >>> 0, b >>> 0];
        },
        uint_4_1_3: function (a, b) {
          return [a >>> 0, b[0] >>> 0, b[1] >>> 0, b[2] >>> 0];
        },
        uint_4_2_2: function (a, b) {
          return [a[0] >>> 0, a[1] >>> 0, b[0] >>> 0, b[1] >>> 0];
        },
        uint_4_4: function (a) {
          return [a[0] >>> 0, a[1] >>> 0, a[2] >>> 0, a[3] >>> 0];
        },
      };
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/std___std_all.js", deps, func);
    var __awaiter =
      (this && this.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P
            ? value
            : new P(function (resolve) {
                resolve(value);
              });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done
              ? resolve(result.value)
              : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
    var __generator =
      (this && this.__generator) ||
      function (thisArg, body) {
        var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: [],
          },
          f,
          y,
          t,
          g;
        return (
          (g = { next: verb(0), throw: verb(1), return: verb(2) }),
          typeof Symbol === "function" &&
            (g[Symbol.iterator] = function () {
              return this;
            }),
          g
        );
        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while ((g && ((g = 0), op[0] && (_ = 0)), _))
            try {
              if (
                ((f = 1),
                y &&
                  (t =
                    op[0] & 2
                      ? y["return"]
                      : op[0]
                      ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                      : y.next) &&
                  !(t = t.call(y, op[1])).done)
              )
                return t;
              if (((y = 0), t)) op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (
                    !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                    (op[0] === 6 || op[0] === 2)
                  ) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2]) _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
    define(["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.time =
        exports.__deepClone =
        exports.__makeMap =
        exports.map =
        exports.array =
        exports.sleep =
        exports.hashableTypeToString =
        exports.globalVarGet =
        exports.globalVarInit =
        exports.compute =
        exports.statGraph =
        exports.stat =
        exports.flush =
        exports.print =
        exports.getShadeupLocalContext =
        exports.Mesh =
        exports.__dummy =
          void 0;
      /**__SHADEUP_STRUCT_INJECTION_HOOK__*/
      exports.__dummy = 1;
      // import { Mesh } from '/_std/mesh';
      var Mesh = /** @class */ (function () {
        function Mesh(prefils) {
          this.vertices = [];
          this.triangles = [];
          this.normals = [];
          this.tangents = [];
          this.bitangents = [];
          this.uvs = [];
          this.colors = [];
          this.symbol = Symbol();
          if (prefils.vertices) this.vertices = prefils.vertices;
          if (prefils.triangles) this.triangles = prefils.triangles;
          if (prefils.normals) this.normals = prefils.normals;
          if (prefils.tangents) this.tangents = prefils.tangents;
          if (prefils.bitangents) this.bitangents = prefils.bitangents;
          if (prefils.uvs) this.uvs = prefils.uvs;
          if (prefils.colors) this.colors = prefils.colors;
        }
        Mesh.prototype.getVertices = function () {
          return this.vertices;
        };
        Mesh.prototype.getTriangles = function () {
          return this.triangles;
        };
        Mesh.prototype.getNormals = function () {
          return this.normals;
        };
        Mesh.prototype.getTangents = function () {
          return this.tangents;
        };
        Mesh.prototype.getBitangents = function () {
          return this.bitangents;
        };
        Mesh.prototype.getUVs = function () {
          return this.uvs;
        };
        Mesh.prototype.getColors = function () {
          return this.colors;
        };
        Mesh.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_std_i_iistd_all_ts_245_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",{"type":"unknown"}]]}'
          );
        };
        return Mesh;
      })();
      exports.Mesh = Mesh;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_std_i_iistd_all_ts_245_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",{"type":"unknown"}]]}'
        ),
        Mesh
      );
      var getShadeupLocalContext = function () {
        if (typeof localEngineContext !== "undefined") {
          return localEngineContext;
        } else {
          return window;
        }
      };
      exports.getShadeupLocalContext = getShadeupLocalContext;
      /**
       * Prints a set of value(s) to the console. Values will be converted to strings before printing.
       *
       * @param args Any number of values to print to the console
       */
      function print() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
        if (
          typeof (0, exports.getShadeupLocalContext)()["__shadeup_print"] ===
          "function"
        ) {
          (_a = (0, exports.getShadeupLocalContext)())["__shadeup_print"].apply(
            _a,
            args
          );
        }
      }
      exports.print = print;
      /**
       * Flushes (executes) all queued compute or draw calls
       * @shadeup=tag(async) @shadeup=noemit_gpu
       */
      function flush() {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (
                  !(
                    typeof (0, exports.getShadeupLocalContext)()[
                      "flushAdapter"
                    ] === "function"
                  )
                )
                  return [3 /*break*/, 2];
                return [
                  4 /*yield*/,
                  (0, exports.getShadeupLocalContext)()["flushAdapter"](),
                ];
              case 1:
                return [2 /*return*/, _a.sent()];
              case 2:
                return [2 /*return*/];
            }
          });
        });
      }
      exports.flush = flush;
      /**
       * Displays a single value in the stats panel at the top right
       *
       * @param name key for this stat (e.g. "fps")
       * @param value any value
       */
      function stat(name, value) {
        if (
          typeof (0, exports.getShadeupLocalContext)()["__shadeup_stat"] ===
          "function"
        ) {
          (0, exports.getShadeupLocalContext)()["__shadeup_stat"](name, value);
        }
      }
      exports.stat = stat;
      /**
       * Display a graph of a numeric value over time
       *
       * @param name key for this stat (e.g. "fps")
       * @param value any numeric value
       * @param sampleRate how often should the graph be updated (e.g. 1 = every call, 2 = every second call, etc.)
       */
      function statGraph(name, value, sampleRate) {
        if (sampleRate === void 0) {
          sampleRate = 1;
        }
        if (
          typeof (0, exports.getShadeupLocalContext)()[
            "__shadeup_statGraph"
          ] === "function"
        ) {
          (0, exports.getShadeupLocalContext)()["__shadeup_statGraph"](
            name,
            value
          );
        }
      }
      exports.statGraph = statGraph;
      function infer(fn) {
        return fn;
      }
      // export function drawAlt(keys: shader<ShaderInput, ShaderOutput, 0>) {}
      // export function draw(fullScreenPixelShader: shader<ShaderInput, ShaderOutput, 0>): void;
      // export function draw(
      // 	first: Mesh | any | shader<ShaderInput, ShaderOutput>,
      // 	second?: shader<ShaderInput, ShaderOutput>,
      // 	third?: shader<ShaderInput, ShaderOutput>
      // ) {
      // 	if ('vertices' in first && second && third) {
      // 		__shadeup_dispatch_draw_geometry(first, second, third);
      // 	} else if (first && !second && !third) {
      // 		__shadeup_dispatch_draw(first as shader<ShaderInput, ShaderOutput>);
      // 	}
      // }
      // draw(makeShader('', (a, b) => {}));
      // drawAlt(
      // 	makeShader(
      // 		'000004808000091289258019303699031390005438610',
      // 		/**@shadeup=shader*/ (__in, __out) => {
      // 			__out.color;
      // 		}
      // 	)
      // );
      // /**
      //  *
      //  */
      function compute(workgroups, computeShader) {
        (0, exports.getShadeupLocalContext)().__shadeup_dispatch_compute(
          workgroups,
          computeShader
        );
      }
      exports.compute = compute;
      // function draww(s: shader<{ abc: 123 }, { test: 123 }>) {}
      // type x<T> = { x: T };
      // function makeTex<T>(a: T): x<T> {
      // 	return { x: a };
      // }
      // draw({
      // 	vertex: shader('abc', (__in, __out) => {}),
      // 	attachments: [
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 }),
      // 		makeTex({ abc: 123 })
      // 	],
      // 	mesh: new Mesh(),
      // 	fragment: shader('abc', (__in, __out) => {
      // 		//__out.attachment0
      // 	})
      // });
      function globalVarInit(fileName, varName, initFn, getterFn) {
        if (!(0, exports.getShadeupLocalContext)()["shadeup_globals"]) {
          (0, exports.getShadeupLocalContext)()["shadeup_globals"] = {};
        }
        if (
          !(0, exports.getShadeupLocalContext)()["shadeup_globals"][fileName]
        ) {
          (0, exports.getShadeupLocalContext)()["shadeup_globals"][fileName] =
            {};
        }
        // Disable caching for now
        var cache = false;
        if (
          !(0, exports.getShadeupLocalContext)()["shadeup_globals"][fileName][
            varName
          ] ||
          !cache
        ) {
          (0, exports.getShadeupLocalContext)()["shadeup_globals"][fileName][
            varName
          ] = initFn();
        }
        (0, exports.getShadeupLocalContext)()["shadeup_globals"][fileName][
          "$getter_" + varName
        ] = getterFn;
        return (0, exports.getShadeupLocalContext)()["shadeup_globals"][
          fileName
        ][varName];
      }
      exports.globalVarInit = globalVarInit;
      function globalVarGet(fileName, varName) {
        if (
          varName == "env" ||
          varName == "PLATFORM_WEBGPU" ||
          varName == "PLATFORM_WEBGL"
        ) {
          return (0, exports.getShadeupLocalContext)()[varName];
        }
        return (0, exports.getShadeupLocalContext)()["shadeup_globals"][
          fileName
        ]["$getter_" + varName]();
      }
      exports.globalVarGet = globalVarGet;
      function hashableTypeToString(k) {
        if (typeof k == "number") {
          return k.toString();
        } else if (typeof k == "object") {
          if (Array.isArray(k)) {
            return k.map(hashableTypeToString).join(",");
          } else {
            return k.toString();
          }
        } else {
          return k.toString();
        }
      }
      exports.hashableTypeToString = hashableTypeToString;
      Array.prototype.len = function () {
        return this.length;
      };
      Array.prototype.last = function () {
        return this[this.length - 1];
      };
      Array.prototype.first = function () {
        return this[0];
      };
      Array.prototype.append = function (items) {
        for (var i = 0; i < items.length; i++) {
          this.push(items[i]);
        }
      };
      Array.prototype.remove = function (index) {
        this.splice(index, 1);
      };
      Array.prototype.__index = function (index) {
        return this[index];
      };
      Array.prototype.__index_assign = function (index, value) {
        this[index] = value;
      };
      Array.prototype.__index_assign_op = function (op_fn, index, value) {
        this[index] = op_fn(this[index], value);
      };
      /** @shadeup=tag(async) */
      function sleep(seconds) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [
              2 /*return*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, seconds * 1000);
              }),
            ];
          });
        });
      }
      exports.sleep = sleep;
      function array(count, initializer) {
        if (initializer === void 0) {
          initializer = null;
        }
        var arr = new Array(count);
        if (initializer) {
          for (var i = 0; i < count; i++) {
            arr[i] = initializer;
          }
        }
        return arr;
      }
      exports.array = array;
      var map = /** @class */ (function () {
        function map(entries) {
          this.pairs = new Map();
          if (entries)
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
              var e = entries_1[_i];
              this.__index_assign(e[0], e[1]);
            }
        }
        map.prototype.__index = function (key) {
          if (!this.pairs.has(hashableTypeToString(key))) {
            throw new Error("Key not found: " + hashableTypeToString(key));
          }
          return this.pairs.get(hashableTypeToString(key))[1];
        };
        map.prototype.__index_assign = function (key, value) {
          this.pairs.set(hashableTypeToString(key), [key, value]);
        };
        map.prototype.__index_assign_op = function (op_fn, key, value) {
          this.pairs.set(hashableTypeToString(key), [
            key,
            op_fn(this.__index(key), value),
          ]);
        };
        map.prototype.delete = function (key) {
          this.pairs.delete(hashableTypeToString(key));
        };
        map.prototype.has = function (key) {
          return this.pairs.has(hashableTypeToString(key));
        };
        map.prototype.keys = function () {
          return Array.from(this.pairs.values()).map(function (k) {
            return k[0];
          });
        };
        map.prototype.values = function () {
          return Array.from(this.pairs.values()).map(function (k) {
            return k[1];
          });
        };
        map.new = function (entries) {
          return new map(entries);
        };
        map.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_std_i_iistd_all_ts_8543_map","fields":[["pairs",null]]}'
          );
        };
        return map;
      })();
      exports.map = map;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_std_i_iistd_all_ts_8543_map","fields":[["pairs",null]]}'
        ),
        map
      );
      function __makeMap(initial) {
        return new map(Object.entries(initial));
      }
      exports.__makeMap = __makeMap;
      function __deepClone(value) {
        if (typeof value == "object") {
          if (Array.isArray(value)) {
            var res = new Array(value.length);
            for (var i = 0; i < value.length; i++) {
              res[i] = __deepClone(value[i]);
            }
            return res;
          } else {
            if (value && typeof value.clone == "function") {
              return value.clone();
            } else {
              return value;
            }
          }
        } else {
          return value;
        }
      }
      exports.__deepClone = __deepClone;
      var time = /** @class */ (function () {
        function time() {}
        /** Saves the current time with a key of name */
        time.start = function (name) {
          performance.mark(
            (name !== null && name !== void 0 ? name : "_default") + "_start"
          );
        };
        /** Returns the difference in milliseconds between a start with the same key */
        time.stop = function (name) {
          performance.mark(
            (name !== null && name !== void 0 ? name : "_default") + "_end"
          );
          var res = performance.measure(
            (name !== null && name !== void 0 ? name : "_default") + "_diff",
            (name !== null && name !== void 0 ? name : "_default") + "_start",
            (name !== null && name !== void 0 ? name : "_default") + "_end"
          );
          return res.duration;
        };
        /**
         * This returns a decimal resolution time in milliseconds since the page started. Useful for measuring time differences
         *
         * This uses performance.now() under the hood:
         * The performance.now() method returns a high resolution timestamp in milliseconds. It represents the time elapsed since Performance.timeOrigin
         */
        time.now = function () {
          return performance.now();
        };
        time.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_std_i_iistd_all_ts_10776_time","fields":[]}'
          );
        };
        return time;
      })();
      exports.time = time;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_std_i_iistd_all_ts_10776_time","fields":[]}'
        ),
        time
      );
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/std.js", deps, func);
    var __createBinding =
      (this && this.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
    var __exportStar =
      (this && this.__exportStar) ||
      function (m, exports) {
        for (var p in m)
          if (
            p !== "default" &&
            !Object.prototype.hasOwnProperty.call(exports, p)
          )
            __createBinding(exports, m, p);
      };
    define([
      "require",
      "exports",
      "/_std/ui",
      "/_std/mesh",
      "/_std/sdf",
      "/_std/geo",
      "/_std/native",
    ], function (require, exports, ui_1, mesh_1, sdf_1, geo_1, native_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.geo =
        exports.sdf =
        exports.Mesh =
        exports.mesh =
        exports.ui =
          void 0;
      Object.defineProperty(exports, "ui", {
        enumerable: true,
        get: function () {
          return ui_1.ui;
        },
      });
      Object.defineProperty(exports, "mesh", {
        enumerable: true,
        get: function () {
          return mesh_1.mesh;
        },
      });
      Object.defineProperty(exports, "Mesh", {
        enumerable: true,
        get: function () {
          return mesh_1.Mesh;
        },
      });
      Object.defineProperty(exports, "sdf", {
        enumerable: true,
        get: function () {
          return sdf_1.sdf;
        },
      });
      Object.defineProperty(exports, "geo", {
        enumerable: true,
        get: function () {
          return geo_1.geo;
        },
      });
      __exportStar(native_1, exports);
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/ui.js", deps, func);
    define(["require", "exports", "/_std/context"], function (
      require,
      exports,
      context_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ui = void 0;
      var ui;
      (function (ui) {
        function puck(position) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_PUCK(position);
        }
        ui.puck = puck;
        function draggable(position, radius) {
          if (radius === void 0) {
            radius = 10;
          }
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_PUCK(
            position,
            radius,
            true
          );
        }
        ui.draggable = draggable;
        function textbox(value) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "textbox",
            value
          );
        }
        ui.textbox = textbox;
        function slider(value, min, max) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_SLIDER(value, {
            min: min,
            max: max,
          });
        }
        ui.slider = slider;
        function label(text) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "label",
            text
          );
        }
        ui.label = label;
        function checkbox(value) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "checkbox",
            value
          );
        }
        ui.checkbox = checkbox;
        function combo(value, options) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "combo",
            value,
            { options: options }
          );
        }
        ui.combo = combo;
        function group(text) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "group",
            text
          );
        }
        ui.group = group;
        function button(text) {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL(
            "button",
            false,
            { text: text }
          );
        }
        ui.button = button;
        function pop() {
          (0, context_1.getShadeupLocalContext)()._SHADEUP_UI_CONTROL("pop");
        }
        ui.pop = pop;
      })((ui = exports.ui || (exports.ui = {})));
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/native.js", deps, func);
    define(["require", "exports", "/_std/common", "/_std/context"], function (
      require,
      exports,
      common_1,
      context_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.KeyboardInputState =
        exports.MouseInputState =
        exports.FrameContext =
        exports.shadeupMakeTextureFromUrl =
          void 0;
      function shadeupMakeTextureFromUrl(url) {
        return (0, context_1.getShadeupLocalContext)()[
          "shadeupMakeTextureFromUrlNative"
        ](url);
      }
      exports.shadeupMakeTextureFromUrl = shadeupMakeTextureFromUrl;
      var FrameContext = /** @class */ (function () {
        function FrameContext() {
          /** Mouse/touch screen input state for this frame */
          this.mouse = new MouseInputState();
          /** Keyboard input state for this frame */
          this.keyboard = new KeyboardInputState();
          /** Controllable camera (Hold right click and use WASD to move) */
          this.camera = new common_1.Camera();
          this.camera2d = new common_1.Camera2d();
        }
        FrameContext.prototype.configureCamera = function (options) {};
        /**
         * Use external values from the host JavaScript environment.
         */
        FrameContext.prototype.input = function (key, defaultValue) {
          return defaultValue;
        };
        /**
         * Send values to the host JavaScript environment.
         */
        FrameContext.prototype.output = function (key, value) {};
        FrameContext.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["deltaTime",{"type":"primitive","name":"float"}],["time",{"type":"primitive","name":"float"}],["screenSize",{"type":"primitive","name":"float2"}],["frame",{"type":"primitive","name":"int"}],["mouse",{"type":"struct","name":"str_i_iistd_native_ts_1719_MouseInputState","fields":[["screen",{"type":"primitive","name":"float2"}],["uv",{"type":"primitive","name":"float2"}],["startScreen",{"type":"primitive","name":"float2"}],["startUv",{"type":"primitive","name":"float2"}],["deltaUv",{"type":"primitive","name":"float2"}],["frameDeltaUv",{"type":"primitive","name":"float2"}],["deltaScreen",{"type":"primitive","name":"float2"}],["frameDeltaScreen",{"type":"primitive","name":"float2"}],["button",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["clicked",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["dragging",{"type":"primitive","name":"bool"}],["wheel",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["focused",{"type":"primitive","name":"bool"}]]}],["keyboard",{"type":"struct","name":"str_i_iistd_native_ts_3334_KeyboardInputState","fields":[["backspace",{"type":"primitive","name":"bool"}],["tab",{"type":"primitive","name":"bool"}],["enter",{"type":"primitive","name":"bool"}],["shiftLeft",{"type":"primitive","name":"bool"}],["shiftRight",{"type":"primitive","name":"bool"}],["controlLeft",{"type":"primitive","name":"bool"}],["controlRight",{"type":"primitive","name":"bool"}],["altLeft",{"type":"primitive","name":"bool"}],["altRight",{"type":"primitive","name":"bool"}],["pause",{"type":"primitive","name":"bool"}],["capsLock",{"type":"primitive","name":"bool"}],["escape",{"type":"primitive","name":"bool"}],["space",{"type":"primitive","name":"bool"}],["pageUp",{"type":"primitive","name":"bool"}],["pageDown",{"type":"primitive","name":"bool"}],["end",{"type":"primitive","name":"bool"}],["home",{"type":"primitive","name":"bool"}],["arrowLeft",{"type":"primitive","name":"bool"}],["arrowUp",{"type":"primitive","name":"bool"}],["arrowRight",{"type":"primitive","name":"bool"}],["arrowDown",{"type":"primitive","name":"bool"}],["printScreen",{"type":"primitive","name":"bool"}],["insert",{"type":"primitive","name":"bool"}],["delete",{"type":"primitive","name":"bool"}],["digit0",{"type":"primitive","name":"bool"}],["digit1",{"type":"primitive","name":"bool"}],["digit2",{"type":"primitive","name":"bool"}],["digit3",{"type":"primitive","name":"bool"}],["digit4",{"type":"primitive","name":"bool"}],["digit5",{"type":"primitive","name":"bool"}],["digit6",{"type":"primitive","name":"bool"}],["digit7",{"type":"primitive","name":"bool"}],["digit8",{"type":"primitive","name":"bool"}],["digit9",{"type":"primitive","name":"bool"}],["keyA",{"type":"primitive","name":"bool"}],["keyB",{"type":"primitive","name":"bool"}],["keyC",{"type":"primitive","name":"bool"}],["keyD",{"type":"primitive","name":"bool"}],["keyE",{"type":"primitive","name":"bool"}],["keyF",{"type":"primitive","name":"bool"}],["keyG",{"type":"primitive","name":"bool"}],["keyH",{"type":"primitive","name":"bool"}],["keyI",{"type":"primitive","name":"bool"}],["keyJ",{"type":"primitive","name":"bool"}],["keyK",{"type":"primitive","name":"bool"}],["keyL",{"type":"primitive","name":"bool"}],["keyM",{"type":"primitive","name":"bool"}],["keyN",{"type":"primitive","name":"bool"}],["keyO",{"type":"primitive","name":"bool"}],["keyP",{"type":"primitive","name":"bool"}],["keyQ",{"type":"primitive","name":"bool"}],["keyR",{"type":"primitive","name":"bool"}],["keyS",{"type":"primitive","name":"bool"}],["keyT",{"type":"primitive","name":"bool"}],["keyU",{"type":"primitive","name":"bool"}],["keyV",{"type":"primitive","name":"bool"}],["keyW",{"type":"primitive","name":"bool"}],["keyX",{"type":"primitive","name":"bool"}],["keyY",{"type":"primitive","name":"bool"}],["keyZ",{"type":"primitive","name":"bool"}],["metaLeft",{"type":"primitive","name":"bool"}],["metaRight",{"type":"primitive","name":"bool"}],["contextMenu",{"type":"primitive","name":"bool"}],["numpad0",{"type":"primitive","name":"bool"}],["numpad1",{"type":"primitive","name":"bool"}],["numpad2",{"type":"primitive","name":"bool"}],["numpad3",{"type":"primitive","name":"bool"}],["numpad4",{"type":"primitive","name":"bool"}],["numpad5",{"type":"primitive","name":"bool"}],["numpad6",{"type":"primitive","name":"bool"}],["numpad7",{"type":"primitive","name":"bool"}],["numpad8",{"type":"primitive","name":"bool"}],["numpad9",{"type":"primitive","name":"bool"}],["numpadMultiply",{"type":"primitive","name":"bool"}],["numpadAdd",{"type":"primitive","name":"bool"}],["numpadSubtract",{"type":"primitive","name":"bool"}],["numpadDecimal",{"type":"primitive","name":"bool"}],["numpadDivide",{"type":"primitive","name":"bool"}],["f1",{"type":"primitive","name":"bool"}],["f2",{"type":"primitive","name":"bool"}],["f3",{"type":"primitive","name":"bool"}],["f4",{"type":"primitive","name":"bool"}],["f5",{"type":"primitive","name":"bool"}],["f6",{"type":"primitive","name":"bool"}],["f7",{"type":"primitive","name":"bool"}],["f8",{"type":"primitive","name":"bool"}],["f9",{"type":"primitive","name":"bool"}],["f10",{"type":"primitive","name":"bool"}],["f11",{"type":"primitive","name":"bool"}],["f12",{"type":"primitive","name":"bool"}],["numLock",{"type":"primitive","name":"bool"}],["scrollLock",{"type":"primitive","name":"bool"}],["semicolon",{"type":"primitive","name":"bool"}],["equal",{"type":"primitive","name":"bool"}],["comma",{"type":"primitive","name":"bool"}],["minus",{"type":"primitive","name":"bool"}],["period",{"type":"primitive","name":"bool"}],["slash",{"type":"primitive","name":"bool"}],["backquote",{"type":"primitive","name":"bool"}],["bracketLeft",{"type":"primitive","name":"bool"}],["backslash",{"type":"primitive","name":"bool"}],["bracketRight",{"type":"primitive","name":"bool"}],["quote",{"type":"primitive","name":"bool"}],["pressedBackspace",{"type":"primitive","name":"bool"}],["pressedTab",{"type":"primitive","name":"bool"}],["pressedEnter",{"type":"primitive","name":"bool"}],["pressedShiftLeft",{"type":"primitive","name":"bool"}],["pressedShiftRight",{"type":"primitive","name":"bool"}],["pressedControlLeft",{"type":"primitive","name":"bool"}],["pressedControlRight",{"type":"primitive","name":"bool"}],["pressedAltLeft",{"type":"primitive","name":"bool"}],["pressedAltRight",{"type":"primitive","name":"bool"}],["pressedPause",{"type":"primitive","name":"bool"}],["pressedCapsLock",{"type":"primitive","name":"bool"}],["pressedEscape",{"type":"primitive","name":"bool"}],["pressedSpace",{"type":"primitive","name":"bool"}],["pressedPageUp",{"type":"primitive","name":"bool"}],["pressedPageDown",{"type":"primitive","name":"bool"}],["pressedEnd",{"type":"primitive","name":"bool"}],["pressedHome",{"type":"primitive","name":"bool"}],["pressedArrowLeft",{"type":"primitive","name":"bool"}],["pressedArrowUp",{"type":"primitive","name":"bool"}],["pressedArrowRight",{"type":"primitive","name":"bool"}],["pressedArrowDown",{"type":"primitive","name":"bool"}],["pressedPrintScreen",{"type":"primitive","name":"bool"}],["pressedInsert",{"type":"primitive","name":"bool"}],["pressedDelete",{"type":"primitive","name":"bool"}],["pressedDigit0",{"type":"primitive","name":"bool"}],["pressedDigit1",{"type":"primitive","name":"bool"}],["pressedDigit2",{"type":"primitive","name":"bool"}],["pressedDigit3",{"type":"primitive","name":"bool"}],["pressedDigit4",{"type":"primitive","name":"bool"}],["pressedDigit5",{"type":"primitive","name":"bool"}],["pressedDigit6",{"type":"primitive","name":"bool"}],["pressedDigit7",{"type":"primitive","name":"bool"}],["pressedDigit8",{"type":"primitive","name":"bool"}],["pressedDigit9",{"type":"primitive","name":"bool"}],["pressedKeyA",{"type":"primitive","name":"bool"}],["pressedKeyB",{"type":"primitive","name":"bool"}],["pressedKeyC",{"type":"primitive","name":"bool"}],["pressedKeyD",{"type":"primitive","name":"bool"}],["pressedKeyE",{"type":"primitive","name":"bool"}],["pressedKeyF",{"type":"primitive","name":"bool"}],["pressedKeyG",{"type":"primitive","name":"bool"}],["pressedKeyH",{"type":"primitive","name":"bool"}],["pressedKeyI",{"type":"primitive","name":"bool"}],["pressedKeyJ",{"type":"primitive","name":"bool"}],["pressedKeyK",{"type":"primitive","name":"bool"}],["pressedKeyL",{"type":"primitive","name":"bool"}],["pressedKeyM",{"type":"primitive","name":"bool"}],["pressedKeyN",{"type":"primitive","name":"bool"}],["pressedKeyO",{"type":"primitive","name":"bool"}],["pressedKeyP",{"type":"primitive","name":"bool"}],["pressedKeyQ",{"type":"primitive","name":"bool"}],["pressedKeyR",{"type":"primitive","name":"bool"}],["pressedKeyS",{"type":"primitive","name":"bool"}],["pressedKeyT",{"type":"primitive","name":"bool"}],["pressedKeyU",{"type":"primitive","name":"bool"}],["pressedKeyV",{"type":"primitive","name":"bool"}],["pressedKeyW",{"type":"primitive","name":"bool"}],["pressedKeyX",{"type":"primitive","name":"bool"}],["pressedKeyY",{"type":"primitive","name":"bool"}],["pressedKeyZ",{"type":"primitive","name":"bool"}],["pressedMetaLeft",{"type":"primitive","name":"bool"}],["pressedMetaRight",{"type":"primitive","name":"bool"}],["pressedContextMenu",{"type":"primitive","name":"bool"}],["pressedNumpad0",{"type":"primitive","name":"bool"}],["pressedNumpad1",{"type":"primitive","name":"bool"}],["pressedNumpad2",{"type":"primitive","name":"bool"}],["pressedNumpad3",{"type":"primitive","name":"bool"}],["pressedNumpad4",{"type":"primitive","name":"bool"}],["pressedNumpad5",{"type":"primitive","name":"bool"}],["pressedNumpad6",{"type":"primitive","name":"bool"}],["pressedNumpad7",{"type":"primitive","name":"bool"}],["pressedNumpad8",{"type":"primitive","name":"bool"}],["pressedNumpad9",{"type":"primitive","name":"bool"}],["pressedNumpadMultiply",{"type":"primitive","name":"bool"}],["pressedNumpadAdd",{"type":"primitive","name":"bool"}],["pressedNumpadSubtract",{"type":"primitive","name":"bool"}],["pressedNumpadDecimal",{"type":"primitive","name":"bool"}],["pressedNumpadDivide",{"type":"primitive","name":"bool"}],["pressedF1",{"type":"primitive","name":"bool"}],["pressedF2",{"type":"primitive","name":"bool"}],["pressedF3",{"type":"primitive","name":"bool"}],["pressedF4",{"type":"primitive","name":"bool"}],["pressedF5",{"type":"primitive","name":"bool"}],["pressedF6",{"type":"primitive","name":"bool"}],["pressedF7",{"type":"primitive","name":"bool"}],["pressedF8",{"type":"primitive","name":"bool"}],["pressedF9",{"type":"primitive","name":"bool"}],["pressedF10",{"type":"primitive","name":"bool"}],["pressedF11",{"type":"primitive","name":"bool"}],["pressedF12",{"type":"primitive","name":"bool"}],["pressedNumLock",{"type":"primitive","name":"bool"}],["pressedScrollLock",{"type":"primitive","name":"bool"}],["pressedSemicolon",{"type":"primitive","name":"bool"}],["pressedEqual",{"type":"primitive","name":"bool"}],["pressedComma",{"type":"primitive","name":"bool"}],["pressedMinus",{"type":"primitive","name":"bool"}],["pressedPeriod",{"type":"primitive","name":"bool"}],["pressedSlash",{"type":"primitive","name":"bool"}],["pressedBackquote",{"type":"primitive","name":"bool"}],["pressedBracketLeft",{"type":"primitive","name":"bool"}],["pressedBackslash",{"type":"primitive","name":"bool"}],["pressedBracketRight",{"type":"primitive","name":"bool"}],["pressedQuote",{"type":"primitive","name":"bool"}],["arrowVector",{"type":"primitive","name":"float2"}]]}],["camera",{"type":"struct","name":"str_i_iistd_common_ts_10663_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}],["camera2d",{"type":"struct","name":"str_i_iistd_common_ts_9656_Camera2d","fields":[["position",{"type":"primitive","name":"float2"}],["zoom",{"type":"primitive","name":"float"}]]}]]}'
          );
        };
        return FrameContext;
      })();
      exports.FrameContext = FrameContext;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_native_ts_387_FrameContext","fields":[["deltaTime",{"type":"primitive","name":"float"}],["time",{"type":"primitive","name":"float"}],["screenSize",{"type":"primitive","name":"float2"}],["frame",{"type":"primitive","name":"int"}],["mouse",{"type":"struct","name":"str_i_iistd_native_ts_1719_MouseInputState","fields":[["screen",{"type":"primitive","name":"float2"}],["uv",{"type":"primitive","name":"float2"}],["startScreen",{"type":"primitive","name":"float2"}],["startUv",{"type":"primitive","name":"float2"}],["deltaUv",{"type":"primitive","name":"float2"}],["frameDeltaUv",{"type":"primitive","name":"float2"}],["deltaScreen",{"type":"primitive","name":"float2"}],["frameDeltaScreen",{"type":"primitive","name":"float2"}],["button",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["clicked",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["dragging",{"type":"primitive","name":"bool"}],["wheel",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["focused",{"type":"primitive","name":"bool"}]]}],["keyboard",{"type":"struct","name":"str_i_iistd_native_ts_3334_KeyboardInputState","fields":[["backspace",{"type":"primitive","name":"bool"}],["tab",{"type":"primitive","name":"bool"}],["enter",{"type":"primitive","name":"bool"}],["shiftLeft",{"type":"primitive","name":"bool"}],["shiftRight",{"type":"primitive","name":"bool"}],["controlLeft",{"type":"primitive","name":"bool"}],["controlRight",{"type":"primitive","name":"bool"}],["altLeft",{"type":"primitive","name":"bool"}],["altRight",{"type":"primitive","name":"bool"}],["pause",{"type":"primitive","name":"bool"}],["capsLock",{"type":"primitive","name":"bool"}],["escape",{"type":"primitive","name":"bool"}],["space",{"type":"primitive","name":"bool"}],["pageUp",{"type":"primitive","name":"bool"}],["pageDown",{"type":"primitive","name":"bool"}],["end",{"type":"primitive","name":"bool"}],["home",{"type":"primitive","name":"bool"}],["arrowLeft",{"type":"primitive","name":"bool"}],["arrowUp",{"type":"primitive","name":"bool"}],["arrowRight",{"type":"primitive","name":"bool"}],["arrowDown",{"type":"primitive","name":"bool"}],["printScreen",{"type":"primitive","name":"bool"}],["insert",{"type":"primitive","name":"bool"}],["delete",{"type":"primitive","name":"bool"}],["digit0",{"type":"primitive","name":"bool"}],["digit1",{"type":"primitive","name":"bool"}],["digit2",{"type":"primitive","name":"bool"}],["digit3",{"type":"primitive","name":"bool"}],["digit4",{"type":"primitive","name":"bool"}],["digit5",{"type":"primitive","name":"bool"}],["digit6",{"type":"primitive","name":"bool"}],["digit7",{"type":"primitive","name":"bool"}],["digit8",{"type":"primitive","name":"bool"}],["digit9",{"type":"primitive","name":"bool"}],["keyA",{"type":"primitive","name":"bool"}],["keyB",{"type":"primitive","name":"bool"}],["keyC",{"type":"primitive","name":"bool"}],["keyD",{"type":"primitive","name":"bool"}],["keyE",{"type":"primitive","name":"bool"}],["keyF",{"type":"primitive","name":"bool"}],["keyG",{"type":"primitive","name":"bool"}],["keyH",{"type":"primitive","name":"bool"}],["keyI",{"type":"primitive","name":"bool"}],["keyJ",{"type":"primitive","name":"bool"}],["keyK",{"type":"primitive","name":"bool"}],["keyL",{"type":"primitive","name":"bool"}],["keyM",{"type":"primitive","name":"bool"}],["keyN",{"type":"primitive","name":"bool"}],["keyO",{"type":"primitive","name":"bool"}],["keyP",{"type":"primitive","name":"bool"}],["keyQ",{"type":"primitive","name":"bool"}],["keyR",{"type":"primitive","name":"bool"}],["keyS",{"type":"primitive","name":"bool"}],["keyT",{"type":"primitive","name":"bool"}],["keyU",{"type":"primitive","name":"bool"}],["keyV",{"type":"primitive","name":"bool"}],["keyW",{"type":"primitive","name":"bool"}],["keyX",{"type":"primitive","name":"bool"}],["keyY",{"type":"primitive","name":"bool"}],["keyZ",{"type":"primitive","name":"bool"}],["metaLeft",{"type":"primitive","name":"bool"}],["metaRight",{"type":"primitive","name":"bool"}],["contextMenu",{"type":"primitive","name":"bool"}],["numpad0",{"type":"primitive","name":"bool"}],["numpad1",{"type":"primitive","name":"bool"}],["numpad2",{"type":"primitive","name":"bool"}],["numpad3",{"type":"primitive","name":"bool"}],["numpad4",{"type":"primitive","name":"bool"}],["numpad5",{"type":"primitive","name":"bool"}],["numpad6",{"type":"primitive","name":"bool"}],["numpad7",{"type":"primitive","name":"bool"}],["numpad8",{"type":"primitive","name":"bool"}],["numpad9",{"type":"primitive","name":"bool"}],["numpadMultiply",{"type":"primitive","name":"bool"}],["numpadAdd",{"type":"primitive","name":"bool"}],["numpadSubtract",{"type":"primitive","name":"bool"}],["numpadDecimal",{"type":"primitive","name":"bool"}],["numpadDivide",{"type":"primitive","name":"bool"}],["f1",{"type":"primitive","name":"bool"}],["f2",{"type":"primitive","name":"bool"}],["f3",{"type":"primitive","name":"bool"}],["f4",{"type":"primitive","name":"bool"}],["f5",{"type":"primitive","name":"bool"}],["f6",{"type":"primitive","name":"bool"}],["f7",{"type":"primitive","name":"bool"}],["f8",{"type":"primitive","name":"bool"}],["f9",{"type":"primitive","name":"bool"}],["f10",{"type":"primitive","name":"bool"}],["f11",{"type":"primitive","name":"bool"}],["f12",{"type":"primitive","name":"bool"}],["numLock",{"type":"primitive","name":"bool"}],["scrollLock",{"type":"primitive","name":"bool"}],["semicolon",{"type":"primitive","name":"bool"}],["equal",{"type":"primitive","name":"bool"}],["comma",{"type":"primitive","name":"bool"}],["minus",{"type":"primitive","name":"bool"}],["period",{"type":"primitive","name":"bool"}],["slash",{"type":"primitive","name":"bool"}],["backquote",{"type":"primitive","name":"bool"}],["bracketLeft",{"type":"primitive","name":"bool"}],["backslash",{"type":"primitive","name":"bool"}],["bracketRight",{"type":"primitive","name":"bool"}],["quote",{"type":"primitive","name":"bool"}],["pressedBackspace",{"type":"primitive","name":"bool"}],["pressedTab",{"type":"primitive","name":"bool"}],["pressedEnter",{"type":"primitive","name":"bool"}],["pressedShiftLeft",{"type":"primitive","name":"bool"}],["pressedShiftRight",{"type":"primitive","name":"bool"}],["pressedControlLeft",{"type":"primitive","name":"bool"}],["pressedControlRight",{"type":"primitive","name":"bool"}],["pressedAltLeft",{"type":"primitive","name":"bool"}],["pressedAltRight",{"type":"primitive","name":"bool"}],["pressedPause",{"type":"primitive","name":"bool"}],["pressedCapsLock",{"type":"primitive","name":"bool"}],["pressedEscape",{"type":"primitive","name":"bool"}],["pressedSpace",{"type":"primitive","name":"bool"}],["pressedPageUp",{"type":"primitive","name":"bool"}],["pressedPageDown",{"type":"primitive","name":"bool"}],["pressedEnd",{"type":"primitive","name":"bool"}],["pressedHome",{"type":"primitive","name":"bool"}],["pressedArrowLeft",{"type":"primitive","name":"bool"}],["pressedArrowUp",{"type":"primitive","name":"bool"}],["pressedArrowRight",{"type":"primitive","name":"bool"}],["pressedArrowDown",{"type":"primitive","name":"bool"}],["pressedPrintScreen",{"type":"primitive","name":"bool"}],["pressedInsert",{"type":"primitive","name":"bool"}],["pressedDelete",{"type":"primitive","name":"bool"}],["pressedDigit0",{"type":"primitive","name":"bool"}],["pressedDigit1",{"type":"primitive","name":"bool"}],["pressedDigit2",{"type":"primitive","name":"bool"}],["pressedDigit3",{"type":"primitive","name":"bool"}],["pressedDigit4",{"type":"primitive","name":"bool"}],["pressedDigit5",{"type":"primitive","name":"bool"}],["pressedDigit6",{"type":"primitive","name":"bool"}],["pressedDigit7",{"type":"primitive","name":"bool"}],["pressedDigit8",{"type":"primitive","name":"bool"}],["pressedDigit9",{"type":"primitive","name":"bool"}],["pressedKeyA",{"type":"primitive","name":"bool"}],["pressedKeyB",{"type":"primitive","name":"bool"}],["pressedKeyC",{"type":"primitive","name":"bool"}],["pressedKeyD",{"type":"primitive","name":"bool"}],["pressedKeyE",{"type":"primitive","name":"bool"}],["pressedKeyF",{"type":"primitive","name":"bool"}],["pressedKeyG",{"type":"primitive","name":"bool"}],["pressedKeyH",{"type":"primitive","name":"bool"}],["pressedKeyI",{"type":"primitive","name":"bool"}],["pressedKeyJ",{"type":"primitive","name":"bool"}],["pressedKeyK",{"type":"primitive","name":"bool"}],["pressedKeyL",{"type":"primitive","name":"bool"}],["pressedKeyM",{"type":"primitive","name":"bool"}],["pressedKeyN",{"type":"primitive","name":"bool"}],["pressedKeyO",{"type":"primitive","name":"bool"}],["pressedKeyP",{"type":"primitive","name":"bool"}],["pressedKeyQ",{"type":"primitive","name":"bool"}],["pressedKeyR",{"type":"primitive","name":"bool"}],["pressedKeyS",{"type":"primitive","name":"bool"}],["pressedKeyT",{"type":"primitive","name":"bool"}],["pressedKeyU",{"type":"primitive","name":"bool"}],["pressedKeyV",{"type":"primitive","name":"bool"}],["pressedKeyW",{"type":"primitive","name":"bool"}],["pressedKeyX",{"type":"primitive","name":"bool"}],["pressedKeyY",{"type":"primitive","name":"bool"}],["pressedKeyZ",{"type":"primitive","name":"bool"}],["pressedMetaLeft",{"type":"primitive","name":"bool"}],["pressedMetaRight",{"type":"primitive","name":"bool"}],["pressedContextMenu",{"type":"primitive","name":"bool"}],["pressedNumpad0",{"type":"primitive","name":"bool"}],["pressedNumpad1",{"type":"primitive","name":"bool"}],["pressedNumpad2",{"type":"primitive","name":"bool"}],["pressedNumpad3",{"type":"primitive","name":"bool"}],["pressedNumpad4",{"type":"primitive","name":"bool"}],["pressedNumpad5",{"type":"primitive","name":"bool"}],["pressedNumpad6",{"type":"primitive","name":"bool"}],["pressedNumpad7",{"type":"primitive","name":"bool"}],["pressedNumpad8",{"type":"primitive","name":"bool"}],["pressedNumpad9",{"type":"primitive","name":"bool"}],["pressedNumpadMultiply",{"type":"primitive","name":"bool"}],["pressedNumpadAdd",{"type":"primitive","name":"bool"}],["pressedNumpadSubtract",{"type":"primitive","name":"bool"}],["pressedNumpadDecimal",{"type":"primitive","name":"bool"}],["pressedNumpadDivide",{"type":"primitive","name":"bool"}],["pressedF1",{"type":"primitive","name":"bool"}],["pressedF2",{"type":"primitive","name":"bool"}],["pressedF3",{"type":"primitive","name":"bool"}],["pressedF4",{"type":"primitive","name":"bool"}],["pressedF5",{"type":"primitive","name":"bool"}],["pressedF6",{"type":"primitive","name":"bool"}],["pressedF7",{"type":"primitive","name":"bool"}],["pressedF8",{"type":"primitive","name":"bool"}],["pressedF9",{"type":"primitive","name":"bool"}],["pressedF10",{"type":"primitive","name":"bool"}],["pressedF11",{"type":"primitive","name":"bool"}],["pressedF12",{"type":"primitive","name":"bool"}],["pressedNumLock",{"type":"primitive","name":"bool"}],["pressedScrollLock",{"type":"primitive","name":"bool"}],["pressedSemicolon",{"type":"primitive","name":"bool"}],["pressedEqual",{"type":"primitive","name":"bool"}],["pressedComma",{"type":"primitive","name":"bool"}],["pressedMinus",{"type":"primitive","name":"bool"}],["pressedPeriod",{"type":"primitive","name":"bool"}],["pressedSlash",{"type":"primitive","name":"bool"}],["pressedBackquote",{"type":"primitive","name":"bool"}],["pressedBracketLeft",{"type":"primitive","name":"bool"}],["pressedBackslash",{"type":"primitive","name":"bool"}],["pressedBracketRight",{"type":"primitive","name":"bool"}],["pressedQuote",{"type":"primitive","name":"bool"}],["arrowVector",{"type":"primitive","name":"float2"}]]}],["camera",{"type":"struct","name":"str_i_iistd_common_ts_10663_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}],["camera2d",{"type":"struct","name":"str_i_iistd_common_ts_9656_Camera2d","fields":[["position",{"type":"primitive","name":"float2"}],["zoom",{"type":"primitive","name":"float"}]]}]]}'
        ),
        FrameContext
      );
      var MouseInputState = /** @class */ (function () {
        function MouseInputState() {
          /** , Some("Mouse button down state for buttons 0-3 (left, middle, right */
          this.button = [false, false, false];
          /** Mouse button pressed state for buttons 0-3 (left, middle, right) */
          this.clicked = [false, false, false];
        }
        MouseInputState.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_native_ts_1719_MouseInputState","fields":[["screen",{"type":"primitive","name":"float2"}],["uv",{"type":"primitive","name":"float2"}],["startScreen",{"type":"primitive","name":"float2"}],["startUv",{"type":"primitive","name":"float2"}],["deltaUv",{"type":"primitive","name":"float2"}],["frameDeltaUv",{"type":"primitive","name":"float2"}],["deltaScreen",{"type":"primitive","name":"float2"}],["frameDeltaScreen",{"type":"primitive","name":"float2"}],["button",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["clicked",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["dragging",{"type":"primitive","name":"bool"}],["wheel",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["focused",{"type":"primitive","name":"bool"}]]}'
          );
        };
        return MouseInputState;
      })();
      exports.MouseInputState = MouseInputState;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_native_ts_1719_MouseInputState","fields":[["screen",{"type":"primitive","name":"float2"}],["uv",{"type":"primitive","name":"float2"}],["startScreen",{"type":"primitive","name":"float2"}],["startUv",{"type":"primitive","name":"float2"}],["deltaUv",{"type":"primitive","name":"float2"}],["frameDeltaUv",{"type":"primitive","name":"float2"}],["deltaScreen",{"type":"primitive","name":"float2"}],["frameDeltaScreen",{"type":"primitive","name":"float2"}],["button",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["clicked",{"type":"array","element":{"type":"primitive","name":"bool"},"staticSize":3}],["dragging",{"type":"primitive","name":"bool"}],["wheel",{"type":"primitive","name":"float"}],["velocity",{"type":"primitive","name":"float"}],["focused",{"type":"primitive","name":"bool"}]]}'
        ),
        MouseInputState
      );
      var KeyboardInputState = /** @class */ (function () {
        function KeyboardInputState() {}
        KeyboardInputState.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_native_ts_3334_KeyboardInputState","fields":[["backspace",{"type":"primitive","name":"bool"}],["tab",{"type":"primitive","name":"bool"}],["enter",{"type":"primitive","name":"bool"}],["shiftLeft",{"type":"primitive","name":"bool"}],["shiftRight",{"type":"primitive","name":"bool"}],["controlLeft",{"type":"primitive","name":"bool"}],["controlRight",{"type":"primitive","name":"bool"}],["altLeft",{"type":"primitive","name":"bool"}],["altRight",{"type":"primitive","name":"bool"}],["pause",{"type":"primitive","name":"bool"}],["capsLock",{"type":"primitive","name":"bool"}],["escape",{"type":"primitive","name":"bool"}],["space",{"type":"primitive","name":"bool"}],["pageUp",{"type":"primitive","name":"bool"}],["pageDown",{"type":"primitive","name":"bool"}],["end",{"type":"primitive","name":"bool"}],["home",{"type":"primitive","name":"bool"}],["arrowLeft",{"type":"primitive","name":"bool"}],["arrowUp",{"type":"primitive","name":"bool"}],["arrowRight",{"type":"primitive","name":"bool"}],["arrowDown",{"type":"primitive","name":"bool"}],["printScreen",{"type":"primitive","name":"bool"}],["insert",{"type":"primitive","name":"bool"}],["delete",{"type":"primitive","name":"bool"}],["digit0",{"type":"primitive","name":"bool"}],["digit1",{"type":"primitive","name":"bool"}],["digit2",{"type":"primitive","name":"bool"}],["digit3",{"type":"primitive","name":"bool"}],["digit4",{"type":"primitive","name":"bool"}],["digit5",{"type":"primitive","name":"bool"}],["digit6",{"type":"primitive","name":"bool"}],["digit7",{"type":"primitive","name":"bool"}],["digit8",{"type":"primitive","name":"bool"}],["digit9",{"type":"primitive","name":"bool"}],["keyA",{"type":"primitive","name":"bool"}],["keyB",{"type":"primitive","name":"bool"}],["keyC",{"type":"primitive","name":"bool"}],["keyD",{"type":"primitive","name":"bool"}],["keyE",{"type":"primitive","name":"bool"}],["keyF",{"type":"primitive","name":"bool"}],["keyG",{"type":"primitive","name":"bool"}],["keyH",{"type":"primitive","name":"bool"}],["keyI",{"type":"primitive","name":"bool"}],["keyJ",{"type":"primitive","name":"bool"}],["keyK",{"type":"primitive","name":"bool"}],["keyL",{"type":"primitive","name":"bool"}],["keyM",{"type":"primitive","name":"bool"}],["keyN",{"type":"primitive","name":"bool"}],["keyO",{"type":"primitive","name":"bool"}],["keyP",{"type":"primitive","name":"bool"}],["keyQ",{"type":"primitive","name":"bool"}],["keyR",{"type":"primitive","name":"bool"}],["keyS",{"type":"primitive","name":"bool"}],["keyT",{"type":"primitive","name":"bool"}],["keyU",{"type":"primitive","name":"bool"}],["keyV",{"type":"primitive","name":"bool"}],["keyW",{"type":"primitive","name":"bool"}],["keyX",{"type":"primitive","name":"bool"}],["keyY",{"type":"primitive","name":"bool"}],["keyZ",{"type":"primitive","name":"bool"}],["metaLeft",{"type":"primitive","name":"bool"}],["metaRight",{"type":"primitive","name":"bool"}],["contextMenu",{"type":"primitive","name":"bool"}],["numpad0",{"type":"primitive","name":"bool"}],["numpad1",{"type":"primitive","name":"bool"}],["numpad2",{"type":"primitive","name":"bool"}],["numpad3",{"type":"primitive","name":"bool"}],["numpad4",{"type":"primitive","name":"bool"}],["numpad5",{"type":"primitive","name":"bool"}],["numpad6",{"type":"primitive","name":"bool"}],["numpad7",{"type":"primitive","name":"bool"}],["numpad8",{"type":"primitive","name":"bool"}],["numpad9",{"type":"primitive","name":"bool"}],["numpadMultiply",{"type":"primitive","name":"bool"}],["numpadAdd",{"type":"primitive","name":"bool"}],["numpadSubtract",{"type":"primitive","name":"bool"}],["numpadDecimal",{"type":"primitive","name":"bool"}],["numpadDivide",{"type":"primitive","name":"bool"}],["f1",{"type":"primitive","name":"bool"}],["f2",{"type":"primitive","name":"bool"}],["f3",{"type":"primitive","name":"bool"}],["f4",{"type":"primitive","name":"bool"}],["f5",{"type":"primitive","name":"bool"}],["f6",{"type":"primitive","name":"bool"}],["f7",{"type":"primitive","name":"bool"}],["f8",{"type":"primitive","name":"bool"}],["f9",{"type":"primitive","name":"bool"}],["f10",{"type":"primitive","name":"bool"}],["f11",{"type":"primitive","name":"bool"}],["f12",{"type":"primitive","name":"bool"}],["numLock",{"type":"primitive","name":"bool"}],["scrollLock",{"type":"primitive","name":"bool"}],["semicolon",{"type":"primitive","name":"bool"}],["equal",{"type":"primitive","name":"bool"}],["comma",{"type":"primitive","name":"bool"}],["minus",{"type":"primitive","name":"bool"}],["period",{"type":"primitive","name":"bool"}],["slash",{"type":"primitive","name":"bool"}],["backquote",{"type":"primitive","name":"bool"}],["bracketLeft",{"type":"primitive","name":"bool"}],["backslash",{"type":"primitive","name":"bool"}],["bracketRight",{"type":"primitive","name":"bool"}],["quote",{"type":"primitive","name":"bool"}],["pressedBackspace",{"type":"primitive","name":"bool"}],["pressedTab",{"type":"primitive","name":"bool"}],["pressedEnter",{"type":"primitive","name":"bool"}],["pressedShiftLeft",{"type":"primitive","name":"bool"}],["pressedShiftRight",{"type":"primitive","name":"bool"}],["pressedControlLeft",{"type":"primitive","name":"bool"}],["pressedControlRight",{"type":"primitive","name":"bool"}],["pressedAltLeft",{"type":"primitive","name":"bool"}],["pressedAltRight",{"type":"primitive","name":"bool"}],["pressedPause",{"type":"primitive","name":"bool"}],["pressedCapsLock",{"type":"primitive","name":"bool"}],["pressedEscape",{"type":"primitive","name":"bool"}],["pressedSpace",{"type":"primitive","name":"bool"}],["pressedPageUp",{"type":"primitive","name":"bool"}],["pressedPageDown",{"type":"primitive","name":"bool"}],["pressedEnd",{"type":"primitive","name":"bool"}],["pressedHome",{"type":"primitive","name":"bool"}],["pressedArrowLeft",{"type":"primitive","name":"bool"}],["pressedArrowUp",{"type":"primitive","name":"bool"}],["pressedArrowRight",{"type":"primitive","name":"bool"}],["pressedArrowDown",{"type":"primitive","name":"bool"}],["pressedPrintScreen",{"type":"primitive","name":"bool"}],["pressedInsert",{"type":"primitive","name":"bool"}],["pressedDelete",{"type":"primitive","name":"bool"}],["pressedDigit0",{"type":"primitive","name":"bool"}],["pressedDigit1",{"type":"primitive","name":"bool"}],["pressedDigit2",{"type":"primitive","name":"bool"}],["pressedDigit3",{"type":"primitive","name":"bool"}],["pressedDigit4",{"type":"primitive","name":"bool"}],["pressedDigit5",{"type":"primitive","name":"bool"}],["pressedDigit6",{"type":"primitive","name":"bool"}],["pressedDigit7",{"type":"primitive","name":"bool"}],["pressedDigit8",{"type":"primitive","name":"bool"}],["pressedDigit9",{"type":"primitive","name":"bool"}],["pressedKeyA",{"type":"primitive","name":"bool"}],["pressedKeyB",{"type":"primitive","name":"bool"}],["pressedKeyC",{"type":"primitive","name":"bool"}],["pressedKeyD",{"type":"primitive","name":"bool"}],["pressedKeyE",{"type":"primitive","name":"bool"}],["pressedKeyF",{"type":"primitive","name":"bool"}],["pressedKeyG",{"type":"primitive","name":"bool"}],["pressedKeyH",{"type":"primitive","name":"bool"}],["pressedKeyI",{"type":"primitive","name":"bool"}],["pressedKeyJ",{"type":"primitive","name":"bool"}],["pressedKeyK",{"type":"primitive","name":"bool"}],["pressedKeyL",{"type":"primitive","name":"bool"}],["pressedKeyM",{"type":"primitive","name":"bool"}],["pressedKeyN",{"type":"primitive","name":"bool"}],["pressedKeyO",{"type":"primitive","name":"bool"}],["pressedKeyP",{"type":"primitive","name":"bool"}],["pressedKeyQ",{"type":"primitive","name":"bool"}],["pressedKeyR",{"type":"primitive","name":"bool"}],["pressedKeyS",{"type":"primitive","name":"bool"}],["pressedKeyT",{"type":"primitive","name":"bool"}],["pressedKeyU",{"type":"primitive","name":"bool"}],["pressedKeyV",{"type":"primitive","name":"bool"}],["pressedKeyW",{"type":"primitive","name":"bool"}],["pressedKeyX",{"type":"primitive","name":"bool"}],["pressedKeyY",{"type":"primitive","name":"bool"}],["pressedKeyZ",{"type":"primitive","name":"bool"}],["pressedMetaLeft",{"type":"primitive","name":"bool"}],["pressedMetaRight",{"type":"primitive","name":"bool"}],["pressedContextMenu",{"type":"primitive","name":"bool"}],["pressedNumpad0",{"type":"primitive","name":"bool"}],["pressedNumpad1",{"type":"primitive","name":"bool"}],["pressedNumpad2",{"type":"primitive","name":"bool"}],["pressedNumpad3",{"type":"primitive","name":"bool"}],["pressedNumpad4",{"type":"primitive","name":"bool"}],["pressedNumpad5",{"type":"primitive","name":"bool"}],["pressedNumpad6",{"type":"primitive","name":"bool"}],["pressedNumpad7",{"type":"primitive","name":"bool"}],["pressedNumpad8",{"type":"primitive","name":"bool"}],["pressedNumpad9",{"type":"primitive","name":"bool"}],["pressedNumpadMultiply",{"type":"primitive","name":"bool"}],["pressedNumpadAdd",{"type":"primitive","name":"bool"}],["pressedNumpadSubtract",{"type":"primitive","name":"bool"}],["pressedNumpadDecimal",{"type":"primitive","name":"bool"}],["pressedNumpadDivide",{"type":"primitive","name":"bool"}],["pressedF1",{"type":"primitive","name":"bool"}],["pressedF2",{"type":"primitive","name":"bool"}],["pressedF3",{"type":"primitive","name":"bool"}],["pressedF4",{"type":"primitive","name":"bool"}],["pressedF5",{"type":"primitive","name":"bool"}],["pressedF6",{"type":"primitive","name":"bool"}],["pressedF7",{"type":"primitive","name":"bool"}],["pressedF8",{"type":"primitive","name":"bool"}],["pressedF9",{"type":"primitive","name":"bool"}],["pressedF10",{"type":"primitive","name":"bool"}],["pressedF11",{"type":"primitive","name":"bool"}],["pressedF12",{"type":"primitive","name":"bool"}],["pressedNumLock",{"type":"primitive","name":"bool"}],["pressedScrollLock",{"type":"primitive","name":"bool"}],["pressedSemicolon",{"type":"primitive","name":"bool"}],["pressedEqual",{"type":"primitive","name":"bool"}],["pressedComma",{"type":"primitive","name":"bool"}],["pressedMinus",{"type":"primitive","name":"bool"}],["pressedPeriod",{"type":"primitive","name":"bool"}],["pressedSlash",{"type":"primitive","name":"bool"}],["pressedBackquote",{"type":"primitive","name":"bool"}],["pressedBracketLeft",{"type":"primitive","name":"bool"}],["pressedBackslash",{"type":"primitive","name":"bool"}],["pressedBracketRight",{"type":"primitive","name":"bool"}],["pressedQuote",{"type":"primitive","name":"bool"}],["arrowVector",{"type":"primitive","name":"float2"}]]}'
          );
        };
        return KeyboardInputState;
      })();
      exports.KeyboardInputState = KeyboardInputState;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_native_ts_3334_KeyboardInputState","fields":[["backspace",{"type":"primitive","name":"bool"}],["tab",{"type":"primitive","name":"bool"}],["enter",{"type":"primitive","name":"bool"}],["shiftLeft",{"type":"primitive","name":"bool"}],["shiftRight",{"type":"primitive","name":"bool"}],["controlLeft",{"type":"primitive","name":"bool"}],["controlRight",{"type":"primitive","name":"bool"}],["altLeft",{"type":"primitive","name":"bool"}],["altRight",{"type":"primitive","name":"bool"}],["pause",{"type":"primitive","name":"bool"}],["capsLock",{"type":"primitive","name":"bool"}],["escape",{"type":"primitive","name":"bool"}],["space",{"type":"primitive","name":"bool"}],["pageUp",{"type":"primitive","name":"bool"}],["pageDown",{"type":"primitive","name":"bool"}],["end",{"type":"primitive","name":"bool"}],["home",{"type":"primitive","name":"bool"}],["arrowLeft",{"type":"primitive","name":"bool"}],["arrowUp",{"type":"primitive","name":"bool"}],["arrowRight",{"type":"primitive","name":"bool"}],["arrowDown",{"type":"primitive","name":"bool"}],["printScreen",{"type":"primitive","name":"bool"}],["insert",{"type":"primitive","name":"bool"}],["delete",{"type":"primitive","name":"bool"}],["digit0",{"type":"primitive","name":"bool"}],["digit1",{"type":"primitive","name":"bool"}],["digit2",{"type":"primitive","name":"bool"}],["digit3",{"type":"primitive","name":"bool"}],["digit4",{"type":"primitive","name":"bool"}],["digit5",{"type":"primitive","name":"bool"}],["digit6",{"type":"primitive","name":"bool"}],["digit7",{"type":"primitive","name":"bool"}],["digit8",{"type":"primitive","name":"bool"}],["digit9",{"type":"primitive","name":"bool"}],["keyA",{"type":"primitive","name":"bool"}],["keyB",{"type":"primitive","name":"bool"}],["keyC",{"type":"primitive","name":"bool"}],["keyD",{"type":"primitive","name":"bool"}],["keyE",{"type":"primitive","name":"bool"}],["keyF",{"type":"primitive","name":"bool"}],["keyG",{"type":"primitive","name":"bool"}],["keyH",{"type":"primitive","name":"bool"}],["keyI",{"type":"primitive","name":"bool"}],["keyJ",{"type":"primitive","name":"bool"}],["keyK",{"type":"primitive","name":"bool"}],["keyL",{"type":"primitive","name":"bool"}],["keyM",{"type":"primitive","name":"bool"}],["keyN",{"type":"primitive","name":"bool"}],["keyO",{"type":"primitive","name":"bool"}],["keyP",{"type":"primitive","name":"bool"}],["keyQ",{"type":"primitive","name":"bool"}],["keyR",{"type":"primitive","name":"bool"}],["keyS",{"type":"primitive","name":"bool"}],["keyT",{"type":"primitive","name":"bool"}],["keyU",{"type":"primitive","name":"bool"}],["keyV",{"type":"primitive","name":"bool"}],["keyW",{"type":"primitive","name":"bool"}],["keyX",{"type":"primitive","name":"bool"}],["keyY",{"type":"primitive","name":"bool"}],["keyZ",{"type":"primitive","name":"bool"}],["metaLeft",{"type":"primitive","name":"bool"}],["metaRight",{"type":"primitive","name":"bool"}],["contextMenu",{"type":"primitive","name":"bool"}],["numpad0",{"type":"primitive","name":"bool"}],["numpad1",{"type":"primitive","name":"bool"}],["numpad2",{"type":"primitive","name":"bool"}],["numpad3",{"type":"primitive","name":"bool"}],["numpad4",{"type":"primitive","name":"bool"}],["numpad5",{"type":"primitive","name":"bool"}],["numpad6",{"type":"primitive","name":"bool"}],["numpad7",{"type":"primitive","name":"bool"}],["numpad8",{"type":"primitive","name":"bool"}],["numpad9",{"type":"primitive","name":"bool"}],["numpadMultiply",{"type":"primitive","name":"bool"}],["numpadAdd",{"type":"primitive","name":"bool"}],["numpadSubtract",{"type":"primitive","name":"bool"}],["numpadDecimal",{"type":"primitive","name":"bool"}],["numpadDivide",{"type":"primitive","name":"bool"}],["f1",{"type":"primitive","name":"bool"}],["f2",{"type":"primitive","name":"bool"}],["f3",{"type":"primitive","name":"bool"}],["f4",{"type":"primitive","name":"bool"}],["f5",{"type":"primitive","name":"bool"}],["f6",{"type":"primitive","name":"bool"}],["f7",{"type":"primitive","name":"bool"}],["f8",{"type":"primitive","name":"bool"}],["f9",{"type":"primitive","name":"bool"}],["f10",{"type":"primitive","name":"bool"}],["f11",{"type":"primitive","name":"bool"}],["f12",{"type":"primitive","name":"bool"}],["numLock",{"type":"primitive","name":"bool"}],["scrollLock",{"type":"primitive","name":"bool"}],["semicolon",{"type":"primitive","name":"bool"}],["equal",{"type":"primitive","name":"bool"}],["comma",{"type":"primitive","name":"bool"}],["minus",{"type":"primitive","name":"bool"}],["period",{"type":"primitive","name":"bool"}],["slash",{"type":"primitive","name":"bool"}],["backquote",{"type":"primitive","name":"bool"}],["bracketLeft",{"type":"primitive","name":"bool"}],["backslash",{"type":"primitive","name":"bool"}],["bracketRight",{"type":"primitive","name":"bool"}],["quote",{"type":"primitive","name":"bool"}],["pressedBackspace",{"type":"primitive","name":"bool"}],["pressedTab",{"type":"primitive","name":"bool"}],["pressedEnter",{"type":"primitive","name":"bool"}],["pressedShiftLeft",{"type":"primitive","name":"bool"}],["pressedShiftRight",{"type":"primitive","name":"bool"}],["pressedControlLeft",{"type":"primitive","name":"bool"}],["pressedControlRight",{"type":"primitive","name":"bool"}],["pressedAltLeft",{"type":"primitive","name":"bool"}],["pressedAltRight",{"type":"primitive","name":"bool"}],["pressedPause",{"type":"primitive","name":"bool"}],["pressedCapsLock",{"type":"primitive","name":"bool"}],["pressedEscape",{"type":"primitive","name":"bool"}],["pressedSpace",{"type":"primitive","name":"bool"}],["pressedPageUp",{"type":"primitive","name":"bool"}],["pressedPageDown",{"type":"primitive","name":"bool"}],["pressedEnd",{"type":"primitive","name":"bool"}],["pressedHome",{"type":"primitive","name":"bool"}],["pressedArrowLeft",{"type":"primitive","name":"bool"}],["pressedArrowUp",{"type":"primitive","name":"bool"}],["pressedArrowRight",{"type":"primitive","name":"bool"}],["pressedArrowDown",{"type":"primitive","name":"bool"}],["pressedPrintScreen",{"type":"primitive","name":"bool"}],["pressedInsert",{"type":"primitive","name":"bool"}],["pressedDelete",{"type":"primitive","name":"bool"}],["pressedDigit0",{"type":"primitive","name":"bool"}],["pressedDigit1",{"type":"primitive","name":"bool"}],["pressedDigit2",{"type":"primitive","name":"bool"}],["pressedDigit3",{"type":"primitive","name":"bool"}],["pressedDigit4",{"type":"primitive","name":"bool"}],["pressedDigit5",{"type":"primitive","name":"bool"}],["pressedDigit6",{"type":"primitive","name":"bool"}],["pressedDigit7",{"type":"primitive","name":"bool"}],["pressedDigit8",{"type":"primitive","name":"bool"}],["pressedDigit9",{"type":"primitive","name":"bool"}],["pressedKeyA",{"type":"primitive","name":"bool"}],["pressedKeyB",{"type":"primitive","name":"bool"}],["pressedKeyC",{"type":"primitive","name":"bool"}],["pressedKeyD",{"type":"primitive","name":"bool"}],["pressedKeyE",{"type":"primitive","name":"bool"}],["pressedKeyF",{"type":"primitive","name":"bool"}],["pressedKeyG",{"type":"primitive","name":"bool"}],["pressedKeyH",{"type":"primitive","name":"bool"}],["pressedKeyI",{"type":"primitive","name":"bool"}],["pressedKeyJ",{"type":"primitive","name":"bool"}],["pressedKeyK",{"type":"primitive","name":"bool"}],["pressedKeyL",{"type":"primitive","name":"bool"}],["pressedKeyM",{"type":"primitive","name":"bool"}],["pressedKeyN",{"type":"primitive","name":"bool"}],["pressedKeyO",{"type":"primitive","name":"bool"}],["pressedKeyP",{"type":"primitive","name":"bool"}],["pressedKeyQ",{"type":"primitive","name":"bool"}],["pressedKeyR",{"type":"primitive","name":"bool"}],["pressedKeyS",{"type":"primitive","name":"bool"}],["pressedKeyT",{"type":"primitive","name":"bool"}],["pressedKeyU",{"type":"primitive","name":"bool"}],["pressedKeyV",{"type":"primitive","name":"bool"}],["pressedKeyW",{"type":"primitive","name":"bool"}],["pressedKeyX",{"type":"primitive","name":"bool"}],["pressedKeyY",{"type":"primitive","name":"bool"}],["pressedKeyZ",{"type":"primitive","name":"bool"}],["pressedMetaLeft",{"type":"primitive","name":"bool"}],["pressedMetaRight",{"type":"primitive","name":"bool"}],["pressedContextMenu",{"type":"primitive","name":"bool"}],["pressedNumpad0",{"type":"primitive","name":"bool"}],["pressedNumpad1",{"type":"primitive","name":"bool"}],["pressedNumpad2",{"type":"primitive","name":"bool"}],["pressedNumpad3",{"type":"primitive","name":"bool"}],["pressedNumpad4",{"type":"primitive","name":"bool"}],["pressedNumpad5",{"type":"primitive","name":"bool"}],["pressedNumpad6",{"type":"primitive","name":"bool"}],["pressedNumpad7",{"type":"primitive","name":"bool"}],["pressedNumpad8",{"type":"primitive","name":"bool"}],["pressedNumpad9",{"type":"primitive","name":"bool"}],["pressedNumpadMultiply",{"type":"primitive","name":"bool"}],["pressedNumpadAdd",{"type":"primitive","name":"bool"}],["pressedNumpadSubtract",{"type":"primitive","name":"bool"}],["pressedNumpadDecimal",{"type":"primitive","name":"bool"}],["pressedNumpadDivide",{"type":"primitive","name":"bool"}],["pressedF1",{"type":"primitive","name":"bool"}],["pressedF2",{"type":"primitive","name":"bool"}],["pressedF3",{"type":"primitive","name":"bool"}],["pressedF4",{"type":"primitive","name":"bool"}],["pressedF5",{"type":"primitive","name":"bool"}],["pressedF6",{"type":"primitive","name":"bool"}],["pressedF7",{"type":"primitive","name":"bool"}],["pressedF8",{"type":"primitive","name":"bool"}],["pressedF9",{"type":"primitive","name":"bool"}],["pressedF10",{"type":"primitive","name":"bool"}],["pressedF11",{"type":"primitive","name":"bool"}],["pressedF12",{"type":"primitive","name":"bool"}],["pressedNumLock",{"type":"primitive","name":"bool"}],["pressedScrollLock",{"type":"primitive","name":"bool"}],["pressedSemicolon",{"type":"primitive","name":"bool"}],["pressedEqual",{"type":"primitive","name":"bool"}],["pressedComma",{"type":"primitive","name":"bool"}],["pressedMinus",{"type":"primitive","name":"bool"}],["pressedPeriod",{"type":"primitive","name":"bool"}],["pressedSlash",{"type":"primitive","name":"bool"}],["pressedBackquote",{"type":"primitive","name":"bool"}],["pressedBracketLeft",{"type":"primitive","name":"bool"}],["pressedBackslash",{"type":"primitive","name":"bool"}],["pressedBracketRight",{"type":"primitive","name":"bool"}],["pressedQuote",{"type":"primitive","name":"bool"}],["arrowVector",{"type":"primitive","name":"float2"}]]}'
        ),
        KeyboardInputState
      );
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/paint.js", deps, func);
    define(["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PaintingContext = void 0;
      var PaintingContext = /** @class */ (function () {
        function PaintingContext(canvas, gl) {
          var _this = this;
          this.markDirtyCallback = function () {};
          this.__ctx = null;
          this.__gl = null;
          this.__offscreen_canvas = null;
          this.__program = null;
          this.stagedChanges = false;
          this.dirty = false;
          this.fastPoints = false;
          this.fastPointsBuffer = null;
          this.__currentColor = null;
          this.pointsCounter = 0;
          this.cacheSize = [0, 0];
          if (!gl) return;
          this.__gl = gl;
          this.__canvas = canvas;
          this.__offscreen_canvas = document.createElement("canvas");
          this.__offscreen_canvas.width = canvas.width;
          this.__offscreen_canvas.height = canvas.height;
          // document.body.appendChild(this.__offscreen_canvas);
          this.__ctx = this.__offscreen_canvas.getContext("2d", {
            willReadFrequently: true,
          });
          this.__offscreen_canvas.style.position = "absolute";
          this.__offscreen_canvas.style.zIndex = "10";
          // document.body.appendChild(this.__offscreen_canvas);
          this.__setColor([0, 0, 0, 1]);
          gl.addEventListener("context", function (toContext) {
            if (toContext == "draw") {
              _this.flush();
            }
          });
          gl.addEventListener("flush", function () {
            _this.flush();
          });
        }
        PaintingContext.prototype.flush = function () {
          if (!this.__gl) return;
          if (!this.__canvas) return;
          if (!this.__offscreen_canvas) return;
          if (!this.stagedChanges) return;
          if (this.fastPoints) this.flushPoints();
          this.__gl.drawImage(this.__offscreen_canvas);
          this.stagedChanges = false;
          if (
            this.__offscreen_canvas.width != this.__canvas.width ||
            this.__offscreen_canvas.height != this.__canvas.height
          ) {
            this.__offscreen_canvas.width = this.__canvas.width;
            this.__offscreen_canvas.height = this.__canvas.height;
          }
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.__beforeDraw = function () {
          var _a;
          if (!this.__offscreen_canvas) return;
          if (!this.__ctx) return;
          if (!this.__canvas) return;
          this.markDirtyCallback();
          (_a = this.__gl) === null || _a === void 0
            ? void 0
            : _a.activatePaintContext();
          if (!this.stagedChanges) {
            this.__ctx.clearRect(
              0,
              0,
              this.__canvas.width,
              this.__canvas.height
            );
            this.__ctx.drawImage(this.__canvas, 0, 0);
            var color = this.__currentColor;
            this.__ctx.fillStyle = "rgba("
              .concat(color[0] * 255, ", ")
              .concat(color[1] * 255, ", ")
              .concat(color[2] * 255, ", ")
              .concat(color[3], ")");
            this.__ctx.strokeStyle = "rgba("
              .concat(color[0] * 255, ", ")
              .concat(color[1] * 255, ", ")
              .concat(color[2] * 255, ", ")
              .concat(color[3], ")");
          }
        };
        PaintingContext.prototype.__afterDraw = function () {
          var gl = this.__gl;
          this.dirty = true;
          this.stagedChanges = true;
        };
        PaintingContext.prototype.__setColor = function (color) {
          if (!this.__ctx || !color) return;
          if (
            this.__currentColor &&
            this.__currentColor[0] == color[0] &&
            this.__currentColor[1] == color[1] &&
            this.__currentColor[2] == color[2] &&
            this.__currentColor[3] == color[3]
          )
            return;
          this.__ctx.strokeStyle = "rgba("
            .concat(color[0] * 255, ", ")
            .concat(color[1] * 255, ", ")
            .concat(color[2] * 255, ", ")
            .concat(color[3], ")");
          this.__ctx.fillStyle = "rgba("
            .concat(color[0] * 255, ", ")
            .concat(color[1] * 255, ", ")
            .concat(color[2] * 255, ", ")
            .concat(color[3], ")");
          this.__currentColor = [color[0], color[1], color[2], color[3]];
        };
        PaintingContext.prototype.fillRect = function (pos, size, color) {
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.fillRect(pos[0], pos[1], size[0], size[1]);
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.fillCircle = function (pos, radius, color) {
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
          this.__ctx.fill();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.fillArc = function (
          pos,
          radius,
          startAngle,
          endAngle,
          color
        ) {
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
          this.__ctx.fill();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.line = function (pos1, pos2, color, width) {
          if (width === void 0) {
            width = 1;
          }
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.__ctx.moveTo(pos1[0], pos1[1]);
          this.__ctx.lineTo(pos2[0], pos2[1]);
          this.__ctx.lineWidth = width;
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.circle = function (
          pos,
          radius,
          color,
          width
        ) {
          if (width === void 0) {
            width = 1;
          }
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
          this.__ctx.lineWidth = width;
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.arc = function (
          pos,
          radius,
          startAngle,
          endAngle,
          color,
          width
        ) {
          if (width === void 0) {
            width = 1;
          }
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
          this.__ctx.lineWidth = width;
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.text = function (pos, text, color) {
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.fillText(text, pos[0], pos[1]);
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.startPath = function (pos) {
          if (!this.__ctx) return;
          this.flushPoints();
          this.__beforeDraw();
          this.__ctx.beginPath();
          this.__ctx.moveTo(pos[0], pos[1]);
        };
        PaintingContext.prototype.lineTo = function (pos) {
          if (!this.__ctx) return;
          this.__ctx.lineTo(pos[0], pos[1]);
        };
        PaintingContext.prototype.strokePath = function (color, width) {
          if (width === void 0) {
            width = 1;
          }
          if (!this.__ctx) return;
          this.__ctx.lineWidth = width;
          this.__setColor(color);
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.fillPath = function (color) {
          if (!this.__ctx) return;
          this.__setColor(color);
          this.__ctx.fill();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.setStrokeWidth = function (width) {
          if (!this.__ctx) return;
          this.__ctx.lineWidth = width;
        };
        PaintingContext.prototype.setFont = function (font) {
          if (!this.__ctx) return;
          this.__ctx.font = font;
        };
        PaintingContext.prototype.setFontSize = function (size) {
          if (!this.__ctx) return;
          this.__ctx.font = ""
            .concat(size, "px ")
            .concat(this.__ctx.font.split(" ").slice(1).join(" "));
        };
        PaintingContext.prototype.setTextAlign = function (align) {
          if (!this.__ctx) return;
          this.__ctx.textAlign = align;
        };
        PaintingContext.prototype.setTextBaseline = function (baseline) {
          if (!this.__ctx) return;
          this.__ctx.textBaseline = baseline;
        };
        PaintingContext.prototype.setLineCap = function (cap) {
          if (!this.__ctx) return;
          this.__ctx.lineCap = cap;
        };
        PaintingContext.prototype.setLineJoin = function (join) {
          if (!this.__ctx) return;
          this.__ctx.lineJoin = join;
        };
        PaintingContext.prototype.setMiterLimit = function (limit) {
          if (!this.__ctx) return;
          this.__ctx.miterLimit = limit;
        };
        PaintingContext.prototype.setShadowColor = function (color) {
          if (!this.__ctx) return;
          this.__ctx.shadowColor = "rgba("
            .concat(color[0] * 255, ", ")
            .concat(color[1] * 255, ", ")
            .concat(color[2] * 255, ", ")
            .concat(color[3], ")");
        };
        PaintingContext.prototype.setShadowBlur = function (blur) {
          if (!this.__ctx) return;
          this.__ctx.shadowBlur = blur;
        };
        PaintingContext.prototype.setShadowOffset = function (offset) {
          if (!this.__ctx) return;
          this.__ctx.shadowOffsetX = offset[0];
          this.__ctx.shadowOffsetY = offset[1];
        };
        PaintingContext.prototype.setGlobalAlpha = function (alpha) {
          if (!this.__ctx) return;
          this.__ctx.globalAlpha = alpha;
        };
        PaintingContext.prototype.setGlobalCompositeOperation = function (op) {
          if (!this.__ctx) return;
          this.__ctx.globalCompositeOperation = op;
        };
        PaintingContext.prototype.setImageSmoothingEnabled = function (
          enabled
        ) {
          if (!this.__ctx) return;
          this.__ctx.imageSmoothingEnabled = enabled;
        };
        PaintingContext.prototype.setImageSmoothingQuality = function (
          quality
        ) {
          if (!this.__ctx) return;
          this.__ctx.imageSmoothingQuality = quality;
        };
        PaintingContext.prototype.setLineDash = function (dash) {
          if (!this.__ctx) return;
          this.__ctx.setLineDash(dash);
        };
        PaintingContext.prototype.setLineDashOffset = function (offset) {
          if (!this.__ctx) return;
          this.__ctx.lineDashOffset = offset;
        };
        PaintingContext.prototype.setTransform = function (a, b, c, d, e, f) {
          if (!this.__ctx) return;
          this.__ctx.setTransform(a, b, c, d, e, f);
        };
        PaintingContext.prototype.resetTransform = function () {
          if (!this.__ctx) return;
          this.__ctx.resetTransform();
        };
        PaintingContext.prototype.scale = function (v) {
          if (!this.__ctx) return;
          this.__ctx.scale(v[0], v[1]);
        };
        PaintingContext.prototype.rotate = function (angle) {
          if (!this.__ctx) return;
          this.__ctx.rotate(angle);
        };
        PaintingContext.prototype.translate = function (v) {
          if (!this.__ctx) return;
          this.__ctx.translate(v[0], v[1]);
        };
        PaintingContext.prototype.flushPoints = function () {
          if (!this.__ctx) return;
          if (!this.fastPoints) return;
          if (!this.fastPointsBuffer) return;
          this.__ctx.putImageData(this.fastPointsBuffer, 0, 0);
          this.fastPoints = false;
          this.fastPointsBuffer = null;
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.point = function (pos, color) {
          if (!this.__ctx) return;
          this.pointsCounter++;
          this.__beforeDraw();
          if (this.pointsCounter > 10) {
            if (!this.fastPoints) {
              this.fastPoints = true;
              this.cacheSize = [
                this.__offscreen_canvas.width,
                this.__offscreen_canvas.height,
              ];
              this.fastPointsBuffer = this.__ctx.getImageData(
                0,
                0,
                this.cacheSize[0],
                this.cacheSize[1]
              );
            }
            if (!this.fastPointsBuffer) return;
            var x = Math.floor(pos[0]);
            var y = Math.floor(pos[1]);
            var index = (y * this.cacheSize[0] + x) * 4;
            if (!color) {
              color = this.__currentColor;
            }
            var oldColorx = this.fastPointsBuffer.data[index] / 255;
            var oldColory = this.fastPointsBuffer.data[index + 1] / 255;
            var oldColorz = this.fastPointsBuffer.data[index + 2] / 255;
            var oldColora = this.fastPointsBuffer.data[index + 3] / 255;
            this.fastPointsBuffer.data[index] =
              color[0] * 255 * color[3] + oldColorx * 255 * (1 - color[3]);
            this.fastPointsBuffer.data[index + 1] =
              color[1] * 255 * color[3] + oldColory * 255 * (1 - color[3]);
            this.fastPointsBuffer.data[index + 2] =
              color[2] * 255 * color[3] + oldColorz * 255 * (1 - color[3]);
            this.fastPointsBuffer.data[index + 3] =
              color[3] * 255 + oldColora * 255 * (1 - color[3]);
          } else {
            this.__setColor(color);
            this.__ctx.fillRect(pos[0], pos[1], 1, 1);
          }
          this.__afterDraw();
        };
        PaintingContext.prototype.vector = function (pos, dir, color, width) {
          if (color === void 0) {
            color = [0.9803921568627451, 0.8, 0.08235294117647059, 1];
          }
          if (width === void 0) {
            width = 4;
          }
          if (!this.__ctx || (dir[0] == 0 && dir[1] == 0)) return;
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.setStrokeWidth(width);
          this.__ctx.moveTo(pos[0], pos[1]);
          this.__ctx.lineCap = "round";
          this.__ctx.lineTo(pos[0] + dir[0], pos[1] + dir[1]);
          this.__ctx.stroke();
          this.__ctx.beginPath();
          this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
          // Arrows
          var arrowSize = 20;
          var arrowAngle = Math.PI / 5;
          var dirAngle = Math.atan2(dir[1], dir[0]) + Math.PI;
          var arrow1 = [
            Math.cos(dirAngle + arrowAngle) * arrowSize,
            Math.sin(dirAngle + arrowAngle) * arrowSize,
          ];
          var arrow2 = [
            Math.cos(dirAngle - arrowAngle) * arrowSize,
            Math.sin(dirAngle - arrowAngle) * arrowSize,
          ];
          this.__ctx.lineTo(
            pos[0] + dir[0] + arrow1[0],
            pos[1] + dir[1] + arrow1[1]
          );
          this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
          this.__ctx.lineTo(
            pos[0] + dir[0] + arrow2[0],
            pos[1] + dir[1] + arrow2[1]
          );
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype.grid = function (
          center,
          count,
          gap,
          color,
          width
        ) {
          if (color === void 0) {
            color = [
              0.1607843137254902, 0.1450980392156863, 0.1411764705882353, 1,
            ];
          }
          if (width === void 0) {
            width = 2;
          }
          if (!this.__ctx) return;
          this.__beforeDraw();
          this.__setColor(color);
          this.__ctx.beginPath();
          this.setStrokeWidth(width);
          var start = [
            center[0] - (count[0] / 2) * gap[0],
            center[1] - (count[1] / 2) * gap[1],
          ];
          for (var i = 0; i <= count[0]; i++) {
            this.__ctx.moveTo(start[0] + i * gap[0], start[1]);
            this.__ctx.lineTo(
              start[0] + i * gap[0],
              start[1] + count[1] * gap[1]
            );
          }
          for (var i = 0; i <= count[1]; i++) {
            this.__ctx.moveTo(start[0], start[1] + i * gap[1]);
            this.__ctx.lineTo(
              start[0] + count[0] * gap[0],
              start[1] + i * gap[1]
            );
          }
          this.__ctx.stroke();
          this.__afterDraw();
          this.pointsCounter = 0;
        };
        PaintingContext.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_paint_ts_225_PaintingContext","fields":[["markDirtyCallback",{"type":"unknown"}],["__ctx",null],["__gl",null],["__offscreen_canvas",null],["__program",null],["stagedChanges",{"type":"primitive","name":"bool"}],["dirty",{"type":"primitive","name":"bool"}],["fastPoints",{"type":"primitive","name":"bool"}],["fastPointsBuffer",null],["__currentColor",null],["pointsCounter",null],["cacheSize",{"type":"array","staticSize":2}]]}'
          );
        };
        return PaintingContext;
      })();
      exports.PaintingContext = PaintingContext;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_paint_ts_225_PaintingContext","fields":[["markDirtyCallback",{"type":"unknown"}],["__ctx",null],["__gl",null],["__offscreen_canvas",null],["__program",null],["stagedChanges",{"type":"primitive","name":"bool"}],["dirty",{"type":"primitive","name":"bool"}],["fastPoints",{"type":"primitive","name":"bool"}],["fastPointsBuffer",null],["__currentColor",null],["pointsCounter",null],["cacheSize",{"type":"array","staticSize":2}]]}'
        ),
        PaintingContext
      );
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/buffer.js", deps, func);
    var __awaiter =
      (this && this.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P
            ? value
            : new P(function (resolve) {
                resolve(value);
              });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done
              ? resolve(result.value)
              : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
    var __generator =
      (this && this.__generator) ||
      function (thisArg, body) {
        var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: [],
          },
          f,
          y,
          t,
          g;
        return (
          (g = { next: verb(0), throw: verb(1), return: verb(2) }),
          typeof Symbol === "function" &&
            (g[Symbol.iterator] = function () {
              return this;
            }),
          g
        );
        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while ((g && ((g = 0), op[0] && (_ = 0)), _))
            try {
              if (
                ((f = 1),
                y &&
                  (t =
                    op[0] & 2
                      ? y["return"]
                      : op[0]
                      ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                      : y.next) &&
                  !(t = t.call(y, op[1])).done)
              )
                return t;
              if (((y = 0), t)) op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (
                    !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                    (op[0] === 6 || op[0] === 2)
                  ) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2]) _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
    define(["require", "exports", "/_std/context", "/std_math"], function (
      require,
      exports,
      context_1,
      std_math_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.buffer = exports.buffer_internal = void 0;
      var buffer_internal = /** @class */ (function () {
        function buffer_internal(size, typeName, structure) {
          var _this = this;
          this.__opaque_buffer = true;
          this.structArray = null;
          this.floatArray = null;
          this.intArray = null;
          this.uintArray = null;
          this.arrayBuffer = null;
          this.vectorSize = 0;
          this.platformPayload = null;
          this.adapter = null;
          this.dirty = false;
          this.pendingWrites = 0;
          this.cpuReadDirty = false;
          this.cpuWriteDirty = false;
          this.elementCount = 0;
          this.elementBytes = 0;
          this.structured = false;
          this.watchMutation = false;
          this.symbol = Symbol();
          this.adapter = (0,
          context_1.getShadeupLocalContext)().shadeupGetGraphicsAdapter();
          this.typeName = typeName;
          if (structure) {
            if (structure.name && !structure.name.startsWith("atomic")) {
              this.typeName = structure.name;
            }
          }
          this.elementCount = size;
          this.elementBytes = 4;
          if (
            typeName == "float4" ||
            typeName == "float3" ||
            typeName == "float2" ||
            typeName == "float"
          ) {
            this.vectorSize = 1;
            this.fastIndex = function (index) {
              return _this.floatArray[index];
            };
            this.fastIndexAssign = function (index, value) {
              _this.floatArray[index] = value;
            };
            if (typeName == "float4") {
              this.vectorSize = 4;
              this.fastIndex = function (index) {
                return (0, std_math_1.float4)(
                  _this.floatArray[index * 4],
                  _this.floatArray[index * 4 + 1],
                  _this.floatArray[index * 4 + 2],
                  _this.floatArray[index * 4 + 3]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.floatArray[index * 4] = value[0];
                _this.floatArray[index * 4 + 1] = value[1];
                _this.floatArray[index * 4 + 2] = value[2];
                _this.floatArray[index * 4 + 3] = value[3];
              };
            }
            if (typeName == "float3") {
              this.vectorSize = 3;
              this.fastIndex = function (index) {
                return (0, std_math_1.float3)(
                  _this.floatArray[index * 3],
                  _this.floatArray[index * 3 + 1],
                  _this.floatArray[index * 3 + 2]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.floatArray[index * 3] = value[0];
                _this.floatArray[index * 3 + 1] = value[1];
                _this.floatArray[index * 3 + 2] = value[2];
              };
            }
            if (typeName == "float2") {
              this.vectorSize = 2;
              this.fastIndex = function (index) {
                return (0, std_math_1.float2)(
                  _this.floatArray[index * 2],
                  _this.floatArray[index * 2 + 1]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.floatArray[index * 2] = value[0];
                _this.floatArray[index * 2 + 1] = value[1];
              };
            }
            this.floatArray = new Float32Array(size * this.vectorSize);
            this.arrayBuffer = this.floatArray.buffer;
          } else if (
            typeName == "int4" ||
            typeName == "int3" ||
            typeName == "int2" ||
            typeName == "int"
          ) {
            this.vectorSize = 1;
            this.fastIndex = function (index) {
              return _this.intArray[index];
            };
            this.fastIndexAssign = function (index, value) {
              _this.intArray[index] = value;
            };
            if (typeName == "int4") {
              this.vectorSize = 4;
              this.fastIndex = function (index) {
                return __.intifyVector(
                  (0, std_math_1.int4)(
                    _this.intArray[index * 4],
                    _this.intArray[index * 4 + 1],
                    _this.intArray[index * 4 + 2],
                    _this.intArray[index * 4 + 3]
                  )
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.intArray[index * 4] = value[0];
                _this.intArray[index * 4 + 1] = value[1];
                _this.intArray[index * 4 + 2] = value[2];
                _this.intArray[index * 4 + 3] = value[3];
              };
            }
            if (typeName == "int3") {
              this.vectorSize = 3;
              this.fastIndex = function (index) {
                return __.intifyVector(
                  (0, std_math_1.int3)(
                    _this.intArray[index * 3],
                    _this.intArray[index * 3 + 1],
                    _this.intArray[index * 3 + 2]
                  )
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.intArray[index * 3] = value[0];
                _this.intArray[index * 3 + 1] = value[1];
                _this.intArray[index * 3 + 2] = value[2];
              };
            }
            if (typeName == "int2") {
              this.vectorSize = 2;
              this.fastIndex = function (index) {
                return __.intifyVector(
                  (0, std_math_1.int2)(
                    _this.intArray[index * 2],
                    _this.intArray[index * 2 + 1]
                  )
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.intArray[index * 2] = value[0];
                _this.intArray[index * 2 + 1] = value[1];
              };
            }
            this.intArray = new Int32Array(size * this.vectorSize);
            this.arrayBuffer = this.intArray.buffer;
          } else if (
            typeName == "uint4" ||
            typeName == "uint3" ||
            typeName == "uint2" ||
            typeName == "uint"
          ) {
            this.vectorSize = 1;
            this.fastIndex = function (index) {
              return _this.uintArray[index];
            };
            this.fastIndexAssign = function (index, value) {
              _this.uintArray[index] = value;
            };
            if (typeName == "uint4") {
              this.vectorSize = 4;
              this.fastIndex = function (index) {
                return (0, std_math_1.uint4)(
                  _this.uintArray[index * 4],
                  _this.uintArray[index * 4 + 1],
                  _this.uintArray[index * 4 + 2],
                  _this.uintArray[index * 4 + 3]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.uintArray[index * 4] = value[0];
                _this.uintArray[index * 4 + 1] = value[1];
                _this.uintArray[index * 4 + 2] = value[2];
                _this.uintArray[index * 4 + 3] = value[3];
              };
            }
            if (typeName == "uint3") {
              this.vectorSize = 3;
              this.fastIndex = function (index) {
                return (0, std_math_1.uint3)(
                  _this.uintArray[index * 3],
                  _this.uintArray[index * 3 + 1],
                  _this.uintArray[index * 3 + 2]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.uintArray[index * 3] = value[0];
                _this.uintArray[index * 3 + 1] = value[1];
                _this.uintArray[index * 3 + 2] = value[2];
              };
            }
            if (typeName == "uint2") {
              this.vectorSize = 2;
              this.fastIndex = function (index) {
                return (0, std_math_1.uint2)(
                  _this.uintArray[index * 2],
                  _this.uintArray[index * 2 + 1]
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.uintArray[index * 2] = value[0];
                _this.uintArray[index * 2 + 1] = value[1];
              };
            }
            this.uintArray = new Uint32Array(size * this.vectorSize);
            this.arrayBuffer = this.uintArray.buffer;
          } else {
            this.structured = true;
            if (typeName.startsWith("atomic<")) {
              // this.structArray = new Array<T>(size);
              this.arrayBuffer = new ArrayBuffer(size * 4);
              this.watchMutation = true;
              this.vectorSize = 1;
              this.elementBytes = 4;
              this.elementCount = size;
              for (var i = 0; i < size; i++) {
                // this.structArray[i] = atomic(0) as T;
              }
              if (typeName == "atomic<uint>") {
                this.uintArray = new Uint32Array(this.arrayBuffer);
                this.fastIndex = function (index) {
                  return (0, std_math_1.atomic)(_this.uintArray[index]);
                };
                this.fastIndexAssign = function (index, value) {
                  _this.uintArray[index] = value.__value;
                };
              } else {
                this.intArray = new Int32Array(this.arrayBuffer);
                this.fastIndex = function (index) {
                  return (0, std_math_1.atomic)(_this.intArray[index]);
                };
                this.fastIndexAssign = function (index, value) {
                  _this.intArray[index] = value.__value;
                };
              }
            } else {
              var elementSize_1 = this.adapter.getValueSize(structure);
              var realSize = elementSize_1 * size;
              this.elementCount = size;
              this.elementBytes = elementSize_1;
              this.arrayBuffer = new ArrayBuffer(realSize);
              this.fastIndex = function (index) {
                return _this.adapter.readStructuredBuffer(
                  structure,
                  _this.arrayBuffer,
                  index * elementSize_1
                );
              };
              this.fastIndexAssign = function (index, value) {
                _this.cpuWriteDirty = true;
                _this.adapter.writeStructuredBuffer(
                  structure,
                  value,
                  _this.arrayBuffer,
                  index * (elementSize_1 / 4)
                );
              };
            }
          }
          this.__index = function (index) {
            // await this.download();
            if (_this.watchMutation) {
              var data = _this.fastIndex(index);
              data.$mutate = function (to) {
                _this.cpuWriteDirty = true;
                if (to !== undefined) {
                  if (_this.intArray) {
                    _this.intArray[index] = to;
                  } else {
                    _this.uintArray[index] = to;
                  }
                }
              };
              return data;
            } else {
              return _this.fastIndex(index);
            }
          };
          this.__index_assign = function (index, value) {
            // await this.download();
            _this.cpuWriteDirty = true;
            _this.fastIndexAssign(index, value);
          };
          this.__index_assign_op = function (op_fn, index, value) {
            // await this.download();
            _this.cpuWriteDirty = true;
            _this.fastIndexAssign(index, op_fn(_this.fastIndex(index), value));
          };
        }
        buffer_internal.prototype.destroy = function () {
          this.adapter.destroyBuffer(this);
        };
        buffer_internal.prototype.__index = function (index) {
          // this.download();
          // return this.fastIndex(index);
          return null;
        };
        buffer_internal.prototype.__index_assign = function (index, value) {
          // this.download();
          // this.cpuWriteDirty = true;
          // this.fastIndexAssign(index, value);
        };
        buffer_internal.prototype.__index_assign_op = function (
          op_fn,
          index,
          value
        ) {
          // this.download();
          // this.cpuWriteDirty = true;
          // this.fastIndexAssign(index, op_fn(this.fastIndex(index), value));
        };
        buffer_internal.prototype.len = function () {
          return this.elementCount;
        };
        /**
         * Returns the underlying cpu buffer as a typed array.
         *
         * > [!NOTE]
         * > This is considerably faster than using the raw index [] operator.
         *
         * > [!NOTE]
         * > If the buffer contents are structured (atomic, or a struct), this will return a normal array
         *
         * ```shadeup
         * let buf = buffer<uint>();
         * let data = buf.getData();
         *
         * for (let i = 0; i < data.length; i += 4) {
         * 	// Do something with data[i]
         * }
         * ```
         */
        buffer_internal.prototype.getData = function () {
          var _a, _b, _c;
          if (this.structured) {
            return this.structArray;
          } else {
            return (_c =
              (_b =
                (_a = this.floatArray) !== null && _a !== void 0
                  ? _a
                  : this.intArray) !== null && _b !== void 0
                ? _b
                : this.uintArray) !== null && _c !== void 0
              ? _c
              : new Uint8Array(0);
          }
        };
        buffer_internal.prototype.write = function (other) {
          if (!this.adapter) return;
          this.adapter.copyBufferToBuffer(other, this);
        };
        /** @shadeup=tag(async) @shadeup=noemit_gpu */
        buffer_internal.prototype.download = function () {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  if (!this.adapter) return [2 /*return*/];
                  if (this.pendingWrites > 0) {
                    (0, context_1.getShadeupLocalContext)().flushAdapter();
                  }
                  if (!this.cpuReadDirty) return [3 /*break*/, 2];
                  this.cpuReadDirty = false;
                  return [4 /*yield*/, this.adapter.downloadBuffer(this)];
                case 1:
                  _a.sent();
                  _a.label = 2;
                case 2:
                  return [2 /*return*/];
              }
            });
          });
        };
        buffer_internal.prototype.downloadAsync = function () {
          return this["download"]();
        };
        /** @shadeup=noemit_gpu */
        buffer_internal.prototype.upload = function () {
          if (!this.adapter) return;
          if (this.cpuWriteDirty) {
            this.cpuWriteDirty = false;
            this.adapter.uploadBuffer(this);
          }
        };
        buffer_internal.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_buffer_ts_271_buffer_internal","fields":[["__opaque_buffer",{"type":"primitive","name":"bool"}],["structArray",null],["floatArray",null],["intArray",null],["uintArray",null],["arrayBuffer",null],["vectorSize",{"type":"primitive","name":"int"}],["typeName",null],["platformPayload",null],["adapter",null],["dirty",{"type":"primitive","name":"bool"}],["pendingWrites",null],["cpuReadDirty",{"type":"primitive","name":"bool"}],["cpuWriteDirty",{"type":"primitive","name":"bool"}],["elementCount",{"type":"primitive","name":"int"}],["elementBytes",{"type":"primitive","name":"int"}],["structured",{"type":"primitive","name":"bool"}],["fastIndex",{"type":"unknown"}],["fastIndexAssign",{"type":"unknown"}],["watchMutation",{"type":"primitive","name":"bool"}],["symbol",{"type":"unknown"}]]}'
          );
        };
        return buffer_internal;
      })();
      exports.buffer_internal = buffer_internal;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_buffer_ts_271_buffer_internal","fields":[["__opaque_buffer",{"type":"primitive","name":"bool"}],["structArray",null],["floatArray",null],["intArray",null],["uintArray",null],["arrayBuffer",null],["vectorSize",{"type":"primitive","name":"int"}],["typeName",null],["platformPayload",null],["adapter",null],["dirty",{"type":"primitive","name":"bool"}],["pendingWrites",null],["cpuReadDirty",{"type":"primitive","name":"bool"}],["cpuWriteDirty",{"type":"primitive","name":"bool"}],["elementCount",{"type":"primitive","name":"int"}],["elementBytes",{"type":"primitive","name":"int"}],["structured",{"type":"primitive","name":"bool"}],["fastIndex",{"type":"unknown"}],["fastIndexAssign",{"type":"unknown"}],["watchMutation",{"type":"primitive","name":"bool"}],["symbol",{"type":"unknown"}]]}'
        ),
        buffer_internal
      );
      function buffer(e1, typeName, structure) {
        if (typeof e1 === "number") {
          var size = e1;
          var buf = new buffer_internal(size, typeName, structure);
          return buf;
        } else {
          var data = e1;
          var buf = new buffer_internal(data.length, typeName, structure);
          for (var i = 0; i < data.length; i++) {
            buf.fastIndexAssign(i, data[i]);
          }
          return buf;
        }
      }
      exports.buffer = buffer;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/texture.js", deps, func);
    define(["require", "exports", "/_std/context"], function (
      require,
      exports,
      context_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.texture3d =
        exports.texture3d_internal_empty =
        exports.texture2d =
        exports.texture2d_internal_empty =
          void 0;
      var texture2d_internal_empty = /** @class */ (function () {
        function texture2d_internal_empty() {
          this.__opaque_texture2d = true;
          this.size = [0, 0];
          this.paint = null;
        }
        /** @shadeup=glsl(!texture($self$, $0$)) */
        texture2d_internal_empty.prototype.__index = function (index) {
          return null;
        };
        texture2d_internal_empty.prototype.__index_assign = function (
          index,
          value
        ) {
          return null;
        };
        texture2d_internal_empty.prototype.getFast = function (index) {
          return null;
        };
        texture2d_internal_empty.prototype.setFast = function (index, value) {
          return null;
        };
        /** @shadeup=tag(async) */
        texture2d_internal_empty.prototype.download = function () {};
        texture2d_internal_empty.prototype.downloadAsync = function () {
          return null;
        };
        /**
         * Returns the underlying cpu buffer as a typed array.
         *
         * Note that this is considerably faster than using the raw index [] operator.
         *
         * ```shadeup
         * let tex = texture2d<float4>();
         * let data = tex.getData();
         *
         * for (let i = 0; i < data.length; i += 4) {
         * 	let r = data[i];
         * 	let g = data[i + 1];
         * 	let b = data[i + 2];
         * 	let a = data[i + 3];
         *
         * 	// Do something with the pixel
         * }
         * ```
         */
        texture2d_internal_empty.prototype.getData = function () {
          return new Uint32Array(0);
        };
        texture2d_internal_empty.prototype.upload = function () {};
        texture2d_internal_empty.prototype.sample = function (position) {};
        texture2d_internal_empty.prototype.clear = function (color) {
          if (color === void 0) {
            color = "auto";
          }
        };
        texture2d_internal_empty.prototype.flush = function () {};
        /** Release the texture */
        texture2d_internal_empty.prototype.destroy = function () {};
        texture2d_internal_empty.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_texture_ts_434_texture2d_internal_empty","fields":[["__opaque_texture2d",{"type":"primitive","name":"bool"}],["size",{"type":"primitive","name":"float2"}],["paint",{"type":"struct","name":"str_i_iistd_paint_ts_225_PaintingContext","fields":[["markDirtyCallback",{"type":"unknown"}],["__ctx",null],["__gl",null],["__offscreen_canvas",null],["__program",null],["stagedChanges",{"type":"primitive","name":"bool"}],["dirty",{"type":"primitive","name":"bool"}],["fastPoints",{"type":"primitive","name":"bool"}],["fastPointsBuffer",null],["__currentColor",null],["pointsCounter",null],["cacheSize",{"type":"array","staticSize":2}]]}],["draw",{"type":"unknown"}],["drawIndexed",{"type":"unknown"}],["drawAdvanced",{"type":"unknown"}],["drawInstanced",{"type":"unknown"}]]}'
          );
        };
        return texture2d_internal_empty;
      })();
      exports.texture2d_internal_empty = texture2d_internal_empty;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_texture_ts_434_texture2d_internal_empty","fields":[["__opaque_texture2d",{"type":"primitive","name":"bool"}],["size",{"type":"primitive","name":"float2"}],["paint",{"type":"struct","name":"str_i_iistd_paint_ts_225_PaintingContext","fields":[["markDirtyCallback",{"type":"unknown"}],["__ctx",null],["__gl",null],["__offscreen_canvas",null],["__program",null],["stagedChanges",{"type":"primitive","name":"bool"}],["dirty",{"type":"primitive","name":"bool"}],["fastPoints",{"type":"primitive","name":"bool"}],["fastPointsBuffer",null],["__currentColor",null],["pointsCounter",null],["cacheSize",{"type":"array","staticSize":2}]]}],["draw",{"type":"unknown"}],["drawIndexed",{"type":"unknown"}],["drawAdvanced",{"type":"unknown"}],["drawInstanced",{"type":"unknown"}]]}'
        ),
        texture2d_internal_empty
      );
      function texture2d(size, format, type) {
        return (0,
        context_1.getShadeupLocalContext)().shadeupMakeTextureInternal(
          size,
          format,
          type
        );
      }
      exports.texture2d = texture2d;
      var texture3d_internal_empty = /** @class */ (function () {
        function texture3d_internal_empty() {
          this.__opaque_texture3d = true;
          this.size = [0, 0, 0];
        }
        /** @shadeup=glsl(!texture($self$, $0$)) */
        texture3d_internal_empty.prototype.__index = function (index) {
          return null;
        };
        texture3d_internal_empty.prototype.__index_assign = function (
          index,
          value
        ) {};
        texture3d_internal_empty.prototype.sample = function (position) {};
        texture3d_internal_empty.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_texture_ts_2584_texture3d_internal_empty","fields":[["__opaque_texture3d",{"type":"primitive","name":"bool"}],["size",{"type":"primitive","name":"float3"}]]}'
          );
        };
        return texture3d_internal_empty;
      })();
      exports.texture3d_internal_empty = texture3d_internal_empty;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_texture_ts_2584_texture3d_internal_empty","fields":[["__opaque_texture3d",{"type":"primitive","name":"bool"}],["size",{"type":"primitive","name":"float3"}]]}'
        ),
        texture3d_internal_empty
      );
      function texture3d(size, type) {
        return (0,
        context_1.getShadeupLocalContext)().shadeupMakeTextureInternal(
          size,
          type
        );
      }
      exports.texture3d = texture3d;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/drawIndexed.js", deps, func);
    define([
      "require",
      "exports",
      "/_std/context",
      "/_std/buffer",
      "/std_math",
    ], function (require, exports, context_1, buffer_1, std_math_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.computeIndirect =
        exports.drawAttributes =
        exports.drawCount =
        exports.drawAlt2 =
        exports.drawFullscreen =
        exports.draw =
        exports.drawAdvanced =
        exports.makeShader =
        exports.ShaderOutput =
        exports.ShaderInput =
        exports.shader_start_shd_ =
        exports.drawIndirect =
        exports.drawIndexedIndirect =
        exports.drawInstancedIndexed =
        exports.drawInstanced =
        exports.drawIndexed =
          void 0;
      function drawIndexed(indexBuffer, vertexShader, pixelShader) {
        (0, context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_indexed(
          indexBuffer,
          vertexShader,
          pixelShader
        );
      }
      exports.drawIndexed = drawIndexed;
      function drawInstanced(mesh, instanceCount, vertexShader, pixelShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_instanced(
          mesh,
          instanceCount,
          vertexShader,
          pixelShader
        );
      }
      exports.drawInstanced = drawInstanced;
      function drawInstancedIndexed(
        indexBuffer,
        instanceCount,
        vertexShader,
        pixelShader
      ) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_instanced_indexed(
          indexBuffer,
          instanceCount,
          vertexShader,
          pixelShader
        );
      }
      exports.drawInstancedIndexed = drawInstancedIndexed;
      function drawIndexedIndirect(indirectBuffer, vertexShader, pixelShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_indexed_indirect(
          indirectBuffer,
          vertexShader,
          pixelShader
        );
      }
      exports.drawIndexedIndirect = drawIndexedIndirect;
      function drawIndirect(mesh, indirectBuffer, vertexShader, pixelShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_indirect(
          mesh,
          indirectBuffer,
          vertexShader,
          pixelShader
        );
      }
      exports.drawIndirect = drawIndirect;
      function shader_start_shd_(s, groupSize) {
        return s;
      }
      exports.shader_start_shd_ = shader_start_shd_;
      /**@shadeup=struct*/
      var ShaderInput = /** @class */ (function () {
        function ShaderInput() {
          /** Interpolated world position (available in fragment, and vertex) */
          this.position = (0, std_math_1.float3)(0, 0, 0);
          /** Interpolated normal (fragment), Source mesh normal (vertex) */
          this.normal = (0, std_math_1.float3)(0, 0, 0);
          /** Interpolated tangent (fragment), Source mesh tangent (vertex) */
          this.tangent = (0, std_math_1.float3)(0, 0, 0);
          /** Interpolated bitangent (fragment), Source mesh bitangent (vertex) */
          this.bitangent = (0, std_math_1.float3)(0, 0, 0);
          /** Vertex shader output position */
          this.clipPosition = (0, std_math_1.float4)(0, 0, 0, 0);
          this.realPosition = (0, std_math_1.float4)(0, 0, 0, 0);
          /** UV channel 0 input (available in fragment, and vertex) */
          this.uv = (0, std_math_1.float2)(0, 0);
          /** Screen position in pixels (available in fragment, and vertex) */
          this.screen = (0, std_math_1.float2)(0, 0);
          /** Interpolated vertex color (available in fragment, and vertex)  */
          this.color = (0, std_math_1.float4)(0, 0, 0, 0);
          /** Group ID (available in compute) */
          this.groupId = __.intifyVector((0, std_math_1.int3)(0, 0, 0));
          /** Group size (available in compute) */
          this.groupSize = __.intifyVector((0, std_math_1.int3)(0, 0, 0));
          /** Global id (groupId * groupSize + localId) (available in compute) */
          this.globalId = __.intifyVector((0, std_math_1.int3)(0, 0, 0));
          /** Local id (available in compute) */
          this.localId = __.intifyVector((0, std_math_1.int3)(0, 0, 0));
          /** Instance index (available in fragment, and vertex) */
          this.instanceIndex = 0;
          /** Vertex index (available in vertex) */
          this.vertexIndex = 0;
        }
        /** @shadeup=noemit_gpu */
        ShaderInput.prototype.attr = function (index, interpolation) {
          return null;
        };
        ShaderInput.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"ShaderInput","fields":[["position",{"type":"primitive","name":"float3"}],["normal",{"type":"primitive","name":"float3"}],["tangent",{"type":"primitive","name":"float3"}],["bitangent",{"type":"primitive","name":"float3"}],["clipPosition",{"type":"primitive","name":"float4"}],["realPosition",{"type":"primitive","name":"float4"}],["uv",{"type":"primitive","name":"float2"}],["screen",{"type":"primitive","name":"float2"}],["color",{"type":"primitive","name":"float4"}],["groupId",{"type":"primitive","name":"int3"}],["groupSize",{"type":"primitive","name":"int3"}],["globalId",{"type":"primitive","name":"int3"}],["localId",{"type":"primitive","name":"int3"}],["instanceIndex",{"type":"primitive","name":"int"}],["vertexIndex",{"type":"primitive","name":"int"}]]}'
          );
        };
        return ShaderInput;
      })();
      exports.ShaderInput = ShaderInput;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"ShaderInput","fields":[["position",{"type":"primitive","name":"float3"}],["normal",{"type":"primitive","name":"float3"}],["tangent",{"type":"primitive","name":"float3"}],["bitangent",{"type":"primitive","name":"float3"}],["clipPosition",{"type":"primitive","name":"float4"}],["realPosition",{"type":"primitive","name":"float4"}],["uv",{"type":"primitive","name":"float2"}],["screen",{"type":"primitive","name":"float2"}],["color",{"type":"primitive","name":"float4"}],["groupId",{"type":"primitive","name":"int3"}],["groupSize",{"type":"primitive","name":"int3"}],["globalId",{"type":"primitive","name":"int3"}],["localId",{"type":"primitive","name":"int3"}],["instanceIndex",{"type":"primitive","name":"int"}],["vertexIndex",{"type":"primitive","name":"int"}]]}'
        ),
        ShaderInput
      );
      /**@shadeup=struct*/
      var ShaderOutput = /** @class */ (function () {
        function ShaderOutput() {
          /** Vertex output position */
          this.position = (0, std_math_1.float4)(0, 0, 0, 0);
          /** Vertex output normal */
          this.normal = (0, std_math_1.float3)(0, 0, 0);
          /** Vertex output tangent */
          this.tangent = (0, std_math_1.float3)(0, 0, 0);
          /** Vertex output bitangent */
          this.bitangent = (0, std_math_1.float3)(0, 0, 0);
          /** UV channel 0 output */
          this.uv = (0, std_math_1.float2)(0, 0);
          /** Pixel color output */
          this.color = (0, std_math_1.float4)(0, 0, 0, 0);
        }
        /** @shadeup=noemit_gpu */
        ShaderOutput.prototype.attr = function (index, value, interpolation) {};
        ShaderOutput.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"ShaderOutput","fields":[["position",{"type":"primitive","name":"float4"}],["normal",{"type":"primitive","name":"float3"}],["tangent",{"type":"primitive","name":"float3"}],["bitangent",{"type":"primitive","name":"float3"}],["uv",{"type":"primitive","name":"float2"}],["color",{"type":"primitive","name":"float4"}]]}'
          );
        };
        return ShaderOutput;
      })();
      exports.ShaderOutput = ShaderOutput;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"ShaderOutput","fields":[["position",{"type":"primitive","name":"float4"}],["normal",{"type":"primitive","name":"float3"}],["tangent",{"type":"primitive","name":"float3"}],["bitangent",{"type":"primitive","name":"float3"}],["uv",{"type":"primitive","name":"float2"}],["color",{"type":"primitive","name":"float4"}]]}'
        ),
        ShaderOutput
      );
      /** @shadeup=shader */
      function makeShader(key, fn) {
        return fn;
      }
      exports.makeShader = makeShader;
      function drawAdvanced(descriptor) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_advanced(
          descriptor
        );
      }
      exports.drawAdvanced = drawAdvanced;
      function draw(first, second, third) {
        if ("vertices" in first && second && third) {
          (0,
          context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_geometry(
            first,
            second,
            third
          );
        } else if (first && !second && !third) {
          (0, context_1.getShadeupLocalContext)().__shadeup_dispatch_draw(
            first
          );
        }
      }
      exports.draw = draw;
      function drawFullscreen(first, second, third) {
        if ("vertices" in first && second && third) {
          (0,
          context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_geometry(
            first,
            second,
            third
          );
        } else if (first && !second && !third) {
          (0, context_1.getShadeupLocalContext)().__shadeup_dispatch_draw(
            first
          );
        }
      }
      exports.drawFullscreen = drawFullscreen;
      function drawAlt2(fullScreenPixelShader) {}
      exports.drawAlt2 = drawAlt2;
      function drawCount(triCount, vertexShader, pixelShader) {
        (0, context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_count(
          triCount,
          vertexShader,
          pixelShader
        );
      }
      exports.drawCount = drawCount;
      function drawAttributes(indexBuffer, buffers, vertexShader, pixelShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_attributes(
          indexBuffer,
          buffer_1.buffer,
          vertexShader,
          pixelShader
        );
      }
      exports.drawAttributes = drawAttributes;
      function computeIndirect(indirectBuffer, indirectOffset, computeShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_compute_indirect(
          indirectBuffer,
          indirectOffset,
          computeShader
        );
      }
      exports.computeIndirect = computeIndirect;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) =>
      defineFunc("/_std/drawAttributes.js", deps, func);
    define(["require", "exports", "/_std/context", "/_std/buffer"], function (
      require,
      exports,
      context_1,
      buffer_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.drawAttributes = void 0;
      function drawAttributes(indexBuffer, buffers, vertexShader, pixelShader) {
        (0,
        context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_attributes(
          indexBuffer,
          buffer_1.buffer,
          vertexShader,
          pixelShader
        );
      }
      exports.drawAttributes = drawAttributes;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/drawCount.js", deps, func);
    define(["require", "exports", "/_std/context"], function (
      require,
      exports,
      context_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.drawCount = void 0;
      function drawCount(triCount, vertexShader, pixelShader) {
        (0, context_1.getShadeupLocalContext)().__shadeup_dispatch_draw_count(
          triCount,
          vertexShader,
          pixelShader
        );
      }
      exports.drawCount = drawCount;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/physics.js", deps, func);
    define(["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.physics =
        exports.PhysicsEngine3d =
        exports.PhysicsEngine2d =
        exports.PhysicsRigidBody2d =
        exports.PhysicsRayCastResult2d =
        exports.PhysicsCollider2d =
          void 0;
      var PhysicsCollider2d = /** @class */ (function () {
        function PhysicsCollider2d(rapier, world, collider) {
          this.rapier = rapier;
          this.world = world;
          this.collider = collider;
        }
        PhysicsCollider2d.prototype.setTranslation = function (position) {
          this.collider.setTranslation(toVec2(position));
        };
        PhysicsCollider2d.prototype.setRotation = function (rotation) {
          this.collider.setRotation(rotation);
        };
        PhysicsCollider2d.prototype.setSensor = function (isSensor) {
          this.collider.setSensor(isSensor);
        };
        PhysicsCollider2d.prototype.setCollisionGroups = function (groups) {
          this.collider.setCollisionGroups(groups);
        };
        PhysicsCollider2d.prototype.setCollidesWith = function (groups) {
          this.collider.setActiveCollisionTypes(groups);
        };
        PhysicsCollider2d.prototype.setFriction = function (friction) {
          this.collider.setFriction(friction);
        };
        PhysicsCollider2d.prototype.setRestitution = function (restitution) {
          this.collider.setRestitution(restitution);
        };
        PhysicsCollider2d.prototype.setDensity = function (density) {
          this.collider.setDensity(density);
        };
        PhysicsCollider2d.prototype.setMass = function (mass) {
          this.collider.setMass(mass);
        };
        PhysicsCollider2d.prototype.setRadius = function (radius) {
          this.collider.setRadius(radius);
        };
        PhysicsCollider2d.prototype.setHalfExtents = function (halfExtents) {
          this.collider.setHalfExtents(toVec2(halfExtents));
        };
        PhysicsCollider2d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_physics_ts_232_PhysicsCollider2d","fields":[["rapier",null],["world",null],["collider",null]]}'
          );
        };
        return PhysicsCollider2d;
      })();
      exports.PhysicsCollider2d = PhysicsCollider2d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_physics_ts_232_PhysicsCollider2d","fields":[["rapier",null],["world",null],["collider",null]]}'
        ),
        PhysicsCollider2d
      );
      function toVec2(v) {
        return { x: v[0], y: v[1] };
      }
      function toVec3(v) {
        return { x: v[0], y: v[1], z: v[2] };
      }
      var PhysicsRayCastResult2d = /** @class */ (function () {
        function PhysicsRayCastResult2d(rapier, result) {
          this.rapier = rapier;
          this.result = result;
        }
        PhysicsRayCastResult2d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_physics_ts_1662_PhysicsRayCastResult2d","fields":[["rapier",null],["result",null]]}'
          );
        };
        return PhysicsRayCastResult2d;
      })();
      exports.PhysicsRayCastResult2d = PhysicsRayCastResult2d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_physics_ts_1662_PhysicsRayCastResult2d","fields":[["rapier",null],["result",null]]}'
        ),
        PhysicsRayCastResult2d
      );
      var PhysicsRigidBody2d = /** @class */ (function () {
        function PhysicsRigidBody2d(rapier, world, body) {
          this.rapier = rapier;
          this.world = world;
          this.body = body;
        }
        PhysicsRigidBody2d.prototype.addBallCollider = function (radius) {
          var colDesc = this.rapier.ColliderDesc.ball(radius);
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.addBoxCollider = function (halfExtents) {
          var colDesc = this.rapier.ColliderDesc.cuboid(
            halfExtents[0],
            halfExtents[1]
          );
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.addCapsuleCollider = function (
          radius,
          halfHeight
        ) {
          var colDesc = this.rapier.ColliderDesc.capsule(radius, halfHeight);
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.addTriangleCollider = function (a, b, c) {
          var colDesc = this.rapier.ColliderDesc.triangle(
            toVec2(a),
            toVec2(b),
            toVec2(c)
          );
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.addConvexCollider = function (points) {
          var floatarr = new Float32Array(points.length * 2);
          for (var i = 0; i < points.length; i++) {
            floatarr[i * 2 + 0] = points[i][0];
            floatarr[i * 2 + 1] = points[i][1];
          }
          var colDesc = this.rapier.ColliderDesc.convexHull(floatarr);
          if (!colDesc)
            throw new Error("Failed to create convex hull collider");
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.addHeightfieldCollider = function (
          heights,
          scale
        ) {
          var arr = new Float32Array(heights.length);
          for (var i = 0; i < heights.length; i++) {
            arr[i] = heights[i];
          }
          var colDesc = this.rapier.ColliderDesc.heightfield(
            arr,
            toVec2(scale)
          );
          var col = this.world.createCollider(colDesc, this.body);
          return new PhysicsCollider2d(this.rapier, this.world, col);
        };
        PhysicsRigidBody2d.prototype.setTranslation = function (position) {
          this.body.setTranslation(toVec2(position), true);
        };
        PhysicsRigidBody2d.prototype.setRotation = function (rotation) {
          this.body.setRotation(rotation, true);
        };
        PhysicsRigidBody2d.prototype.setVelocity = function (velocity) {
          this.body.setLinvel(toVec2(velocity), true);
        };
        PhysicsRigidBody2d.prototype.setAngularVelocity = function (velocity) {
          this.body.setAngvel(velocity, true);
        };
        PhysicsRigidBody2d.prototype.addForce = function (force) {
          this.body.addForce(toVec2(force), true);
        };
        PhysicsRigidBody2d.prototype.addForceAtPoint = function (force, point) {
          this.body.addForceAtPoint(toVec2(force), toVec2(point), true);
        };
        PhysicsRigidBody2d.prototype.addTorque = function (torque) {
          this.body.addTorque(torque, true);
        };
        PhysicsRigidBody2d.prototype.setAdditionalMass = function (mass) {
          this.body.setAdditionalMass(mass, true);
        };
        PhysicsRigidBody2d.prototype.setEnabled = function (enabled) {
          this.body.setEnabled(enabled);
        };
        PhysicsRigidBody2d.prototype.sleep = function () {
          this.body.sleep();
        };
        PhysicsRigidBody2d.prototype.wakeUp = function () {
          this.body.wakeUp();
        };
        PhysicsRigidBody2d.prototype.setGravityScale = function (scale) {
          this.body.setGravityScale(scale, true);
        };
        PhysicsRigidBody2d.prototype.setLinearDamping = function (damping) {
          this.body.setLinearDamping(damping);
        };
        PhysicsRigidBody2d.prototype.setAngularDamping = function (damping) {
          this.body.setAngularDamping(damping);
        };
        PhysicsRigidBody2d.prototype.isSleeping = function () {
          return this.body.isSleeping();
        };
        PhysicsRigidBody2d.prototype.mass = function () {
          return this.body.mass();
        };
        PhysicsRigidBody2d.prototype.translation = function () {
          var t = this.body.translation();
          return [t.x, t.y];
        };
        PhysicsRigidBody2d.prototype.rotation = function () {
          return this.body.rotation();
        };
        PhysicsRigidBody2d.prototype.velocity = function () {
          var t = this.body.linvel();
          return [t.x, t.y];
        };
        PhysicsRigidBody2d.prototype.angularVelocity = function () {
          return this.body.angvel();
        };
        PhysicsRigidBody2d.prototype.isMoving = function () {
          return this.body.isMoving();
        };
        PhysicsRigidBody2d.prototype.collider = function (index) {
          var collider = this.body.collider(index);
          if (!collider) throw new Error("Failed to get collider");
          return new PhysicsCollider2d(this.rapier, this.world, collider);
        };
        PhysicsRigidBody2d.prototype.applyImpulse = function (impulse) {
          this.body.applyImpulse(toVec2(impulse), true);
        };
        PhysicsRigidBody2d.prototype.applyTorqueImpulse = function (impulse) {
          this.body.applyTorqueImpulse(impulse, true);
        };
        PhysicsRigidBody2d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_physics_ts_1904_PhysicsRigidBody2d","fields":[["rapier",null],["world",null],["body",null]]}'
          );
        };
        return PhysicsRigidBody2d;
      })();
      exports.PhysicsRigidBody2d = PhysicsRigidBody2d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_physics_ts_1904_PhysicsRigidBody2d","fields":[["rapier",null],["world",null],["body",null]]}'
        ),
        PhysicsRigidBody2d
      );
      var PhysicsEngine2d = /** @class */ (function () {
        function PhysicsEngine2d(rapier) {
          this.rapier = rapier;
          this.world = new rapier.World(new rapier.Vector2(0.0, -9.81));
        }
        PhysicsEngine2d.prototype.step = function () {
          this.world.step();
        };
        PhysicsEngine2d.prototype.createRigidBody = function (
          position,
          rotation,
          mode
        ) {
          var rbDesc =
            mode == "dynamic"
              ? this.rapier.RigidBodyDesc.dynamic()
              : mode == "fixed"
              ? this.rapier.RigidBodyDesc.fixed()
              : this.rapier.RigidBodyDesc.dynamic();
          rbDesc.setTranslation(position[0], position[1]);
          rbDesc.setRotation(rotation);
          var rb = this.world.createRigidBody(rbDesc);
          return new PhysicsRigidBody2d(this.rapier, this.world, rb);
        };
        PhysicsEngine2d.prototype.bodies = function () {
          var bodies = this.world.bodies;
          var result = [];
          for (var i = 0; i < bodies.len(); i++) {
            result.push(
              new PhysicsRigidBody2d(this.rapier, this.world, bodies.get(i))
            );
          }
          return result;
        };
        PhysicsEngine2d.prototype.castRay = function (start, end, maxi) {
          var result = this.world.castRay(
            new this.rapier.Ray(toVec2(start), toVec2(end)),
            maxi,
            true
          );
          if (!result) return null;
          return new PhysicsRigidBody2d(
            this.rapier,
            this.world,
            result.collider.parent()
          );
        };
        PhysicsEngine2d.prototype.setGravity = function (gravity) {
          this.world.gravity = toVec2(gravity);
        };
        PhysicsEngine2d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_physics_ts_6278_PhysicsEngine2d","fields":[["rapier",null],["world",null]]}'
          );
        };
        return PhysicsEngine2d;
      })();
      exports.PhysicsEngine2d = PhysicsEngine2d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_physics_ts_6278_PhysicsEngine2d","fields":[["rapier",null],["world",null]]}'
        ),
        PhysicsEngine2d
      );
      var PhysicsEngine3d = /** @class */ (function () {
        function PhysicsEngine3d() {}
        PhysicsEngine3d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_physics_ts_7687_PhysicsEngine3d","fields":[]}'
          );
        };
        return PhysicsEngine3d;
      })();
      exports.PhysicsEngine3d = PhysicsEngine3d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_physics_ts_7687_PhysicsEngine3d","fields":[]}'
        ),
        PhysicsEngine3d
      );
      var physics;
      (function (physics) {
        function engine2d() {
          return new PhysicsEngine2d(window.RAPIER_2D);
        }
        physics.engine2d = engine2d;
      })((physics = exports.physics || (exports.physics = {})));
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/context.js", deps, func);
    define(["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getShadeupLocalContext = void 0;
      var getShadeupLocalContext = function () {
        if (typeof localEngineContext !== "undefined") {
          return localEngineContext;
        } else {
          return window;
        }
      };
      exports.getShadeupLocalContext = getShadeupLocalContext;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/mesh.js", deps, func);
    var __createBinding =
      (this && this.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (this && this.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (this && this.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
    define([
      "require",
      "exports",
      "/std_math",
      "/std_math",
      "/std___std_all",
      "/_std/common",
    ], function (require, exports, __, std_math_1, std___std_all_1, common_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Model =
        exports.ModelPart =
        exports.Material =
        exports.mesh =
        exports.Mesh =
          void 0;
      __ = __importStar(__);
      var globalVarGet = std___std_all_1.globalVarGet;
      var Mesh = /** @class */ (function () {
        function Mesh(data) {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          this.vertices =
            (_a = data.vertices) !== null && _a !== void 0 ? _a : [];
          this.triangles =
            (_b = data.triangles) !== null && _b !== void 0 ? _b : [];
          this.normals =
            (_c = data.normals) !== null && _c !== void 0 ? _c : [];
          this.tangents =
            (_d = data.tangents) !== null && _d !== void 0 ? _d : [];
          this.bitangents =
            (_e = data.bitangents) !== null && _e !== void 0 ? _e : [];
          this.uvs = (_f = data.uvs) !== null && _f !== void 0 ? _f : [];
          this.colors = (_g = data.colors) !== null && _g !== void 0 ? _g : [];
          this.symbol =
            (_h = data.symbol) !== null && _h !== void 0 ? _h : null;
        }
        Mesh.prototype.rect = function (size) {
          var shader_self_temp = this;
          var index = this.vertices.len() | 0;
          this.vertices.push(
            __.makeVector(
              __.FM.negate_1(size[0]) / (2 | 0),
              __.FM.negate_1(size[1]) / (2 | 0),
              0 | 0
            )
          );
          this.vertices.push(
            __.makeVector(
              size[0] / (2 | 0),
              __.FM.negate_1(size[1]) / (2 | 0),
              0 | 0
            )
          );
          this.vertices.push(
            __.makeVector(size[0] / (2 | 0), size[1] / (2 | 0), 0 | 0)
          );
          this.vertices.push(
            __.makeVector(
              __.FM.negate_1(size[0]) / (2 | 0),
              size[1] / (2 | 0),
              0 | 0
            )
          );
          this.triangles.push(index + (2 | 0));
          this.triangles.push(index + (1 | 0));
          this.triangles.push(index + (0 | 0));
          this.triangles.push(index + (0 | 0));
          this.triangles.push(index + (3 | 0));
          this.triangles.push(index + (2 | 0));
          this.normals.push(
            __.intifyVector(__.makeVector(0 | 0, 0 | 0, 1 | 0))
          );
          this.normals.push(
            __.intifyVector(__.makeVector(0 | 0, 0 | 0, 1 | 0))
          );
          this.normals.push(
            __.intifyVector(__.makeVector(0 | 0, 0 | 0, 1 | 0))
          );
          this.normals.push(
            __.intifyVector(__.makeVector(0 | 0, 0 | 0, 1 | 0))
          );
          this.tangents.push(
            __.intifyVector(__.makeVector(1 | 0, 0 | 0, 0 | 0))
          );
          this.tangents.push(
            __.intifyVector(__.makeVector(1 | 0, 0 | 0, 0 | 0))
          );
          this.tangents.push(
            __.intifyVector(__.makeVector(1 | 0, 0 | 0, 0 | 0))
          );
          this.tangents.push(
            __.intifyVector(__.makeVector(1 | 0, 0 | 0, 0 | 0))
          );
          this.bitangents.push(
            __.intifyVector(__.makeVector(0 | 0, 1 | 0, 0 | 0))
          );
          this.bitangents.push(
            __.intifyVector(__.makeVector(0 | 0, 1 | 0, 0 | 0))
          );
          this.bitangents.push(
            __.intifyVector(__.makeVector(0 | 0, 1 | 0, 0 | 0))
          );
          this.bitangents.push(
            __.intifyVector(__.makeVector(0 | 0, 1 | 0, 0 | 0))
          );
          this.uvs.push(__.intifyVector(__.makeVector(0 | 0, 0 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(1 | 0, 0 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(0 | 0, 1 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(1 | 0, 1 | 0)));
        };
        Mesh.prototype.quad = function (position, direction, right, size) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z,
            _0,
            _1,
            _2,
            _3,
            _4,
            _5,
            _6,
            _7,
            _8,
            _9;
          var shader_self_temp = this;
          var up = (0, std_math_1.normalize)(
            (0, std_math_1.cross)(right, direction)
          );
          var halfSize = ((_a = size), (_b = 2.0), [_a[0] / _b, _a[1] / _b]);
          var index = this.vertices.len() | 0;
          this.vertices.push(
            ((_c =
              ((_e = position),
              (_f =
                ((_g = right),
                (_h = __.FM.negate_1(halfSize[0])),
                [_g[0] * _h, _g[1] * _h, _g[2] * _h])),
              [_e[0] + _f[0], _e[1] + _f[1], _e[2] + _f[2]])),
            (_d =
              ((_j = up),
              (_k = halfSize[1]),
              [_j[0] * _k, _j[1] * _k, _j[2] * _k])),
            [_c[0] + _d[0], _c[1] + _d[1], _c[2] + _d[2]])
          );
          this.vertices.push(
            ((_l =
              ((_o = position),
              (_p =
                ((_q = right),
                (_r = halfSize[0]),
                [_q[0] * _r, _q[1] * _r, _q[2] * _r])),
              [_o[0] + _p[0], _o[1] + _p[1], _o[2] + _p[2]])),
            (_m =
              ((_s = up),
              (_t = halfSize[1]),
              [_s[0] * _t, _s[1] * _t, _s[2] * _t])),
            [_l[0] + _m[0], _l[1] + _m[1], _l[2] + _m[2]])
          );
          this.vertices.push(
            ((_u =
              ((_w = position),
              (_x =
                ((_y = right),
                (_z = halfSize[0]),
                [_y[0] * _z, _y[1] * _z, _y[2] * _z])),
              [_w[0] + _x[0], _w[1] + _x[1], _w[2] + _x[2]])),
            (_v =
              ((_0 = up),
              (_1 = __.FM.negate_1(halfSize[1])),
              [_0[0] * _1, _0[1] * _1, _0[2] * _1])),
            [_u[0] + _v[0], _u[1] + _v[1], _u[2] + _v[2]])
          );
          this.vertices.push(
            ((_2 =
              ((_4 = position),
              (_5 =
                ((_6 = right),
                (_7 = __.FM.negate_1(halfSize[0])),
                [_6[0] * _7, _6[1] * _7, _6[2] * _7])),
              [_4[0] + _5[0], _4[1] + _5[1], _4[2] + _5[2]])),
            (_3 =
              ((_8 = up),
              (_9 = __.FM.negate_1(halfSize[1])),
              [_8[0] * _9, _8[1] * _9, _8[2] * _9])),
            [_2[0] + _3[0], _2[1] + _3[1], _2[2] + _3[2]])
          );
          this.triangles.push(index + (0 | 0));
          this.triangles.push(index + (1 | 0));
          this.triangles.push(index + (2 | 0));
          this.triangles.push(index + (2 | 0));
          this.triangles.push(index + (3 | 0));
          this.triangles.push(index + (0 | 0));
          this.normals.push(direction);
          this.normals.push(direction);
          this.normals.push(direction);
          this.normals.push(direction);
          this.tangents.push(right);
          this.tangents.push(right);
          this.tangents.push(right);
          this.tangents.push(right);
          this.bitangents.push(up);
          this.bitangents.push(up);
          this.bitangents.push(up);
          this.bitangents.push(up);
          this.uvs.push(__.intifyVector(__.makeVector(1 | 0, 0 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(0 | 0, 0 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(0 | 0, 1 | 0)));
          this.uvs.push(__.intifyVector(__.makeVector(1 | 0, 1 | 0)));
        };
        Mesh.prototype.box = function (size) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
          var shader_self_temp = this;
          var halfSize =
            ((_a = size), (_b = 2.0), [_a[0] / _b, _a[1] / _b, _a[2] / _b]);
          var UP = __.makeVector(0 | 0, 1.0, 0 | 0);
          var DOWN = __.makeVector(0 | 0, __.FM.negate_1(1.0), 0 | 0);
          var LEFT = __.makeVector(__.FM.negate_1(1.0), 0 | 0, 0 | 0);
          var RIGHT = __.makeVector(1.0, 0 | 0, 0 | 0);
          var FORWARD = __.makeVector(0 | 0, 0 | 0, 1.0);
          var BACK = __.makeVector(0 | 0, 0 | 0, __.FM.negate_1(1.0));
          // Up
          this.quad(
            ((_c = UP),
            (_d = halfSize[1]),
            [_c[0] * _d, _c[1] * _d, _c[2] * _d]),
            UP,
            LEFT,
            __.makeVector(size[0], size[2])
          );
          // Down
          this.quad(
            ((_e = DOWN),
            (_f = halfSize[1]),
            [_e[0] * _f, _e[1] * _f, _e[2] * _f]),
            DOWN,
            RIGHT,
            __.makeVector(size[0], size[2])
          );
          // Left
          this.quad(
            ((_g = LEFT),
            (_h = halfSize[0]),
            [_g[0] * _h, _g[1] * _h, _g[2] * _h]),
            LEFT,
            BACK,
            __.makeVector(size[2], size[1])
          );
          // Right
          this.quad(
            ((_j = RIGHT),
            (_k = halfSize[0]),
            [_j[0] * _k, _j[1] * _k, _j[2] * _k]),
            RIGHT,
            FORWARD,
            __.makeVector(size[2], size[1])
          );
          // Forward
          this.quad(
            ((_l = FORWARD),
            (_m = halfSize[2]),
            [_l[0] * _m, _l[1] * _m, _l[2] * _m]),
            FORWARD,
            LEFT,
            __.makeVector(size[0], size[1])
          );
          // Back
          this.quad(
            ((_o = BACK),
            (_p = halfSize[2]),
            [_o[0] * _p, _o[1] * _p, _o[2] * _p]),
            BACK,
            RIGHT,
            __.makeVector(size[0], size[1])
          );
        };
        Mesh.prototype.rectAt = function (minPos, maxPos) {
          var _a, _b;
          var shader_self_temp = this;
          this.rect(
            ((_a = maxPos), (_b = minPos), [_a[0] - _b[0], _a[1] - _b[1]])
          );
          this.translate(__.makeVector(minPos, 0 | 0));
        };
        Mesh.prototype.circle = function (pos, radius, vertices) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
        };
        Mesh.prototype.uvSphere = function (pos, radius, vertices, rings) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
          if (rings === void 0) {
            rings = 16 | 0;
          }
          var shader_self_temp = this;
          var index = this.vertices.len() | 0;
          var verticesPerRing = vertices + (1 | 0);
          for (var i = 0 | 0; i <= rings; i++) {
            var y = i / rings;
            var angleY = y * common_1.PI;
            var posY = Math.cos(angleY);
            var radiusY = Math.sin(angleY);
            for (var j = 0 | 0; j <= vertices; j++) {
              var x = j / vertices;
              var angleX = x * common_1.PI * (2 | 0);
              var posX = Math.cos(angleX);
              var posZ = Math.sin(angleX);
              this.vertices.push(
                __.makeVector(
                  posX * radiusY * radius,
                  posY * radius,
                  posZ * radiusY * radius
                )
              );
              this.normals.push(
                (0, std_math_1.normalize)(
                  __.makeVector(posX * radiusY, posY, posZ * radiusY)
                )
              );
              var tangent = (0, std_math_1.normalize)(
                __.makeVector(posZ, 0 | 0, __.FM.negate_1(posX))
              );
              var bitangent = (0, std_math_1.normalize)(
                (0, std_math_1.cross)(
                  this.normals[(this.normals.len() | 0) - (1 | 0)],
                  tangent
                )
              );
              this.tangents.push(tangent);
              this.bitangents.push(bitangent);
              this.uvs.push(__.makeVector(x, y));
            }
          }
          for (var i = 0 | 0; i < rings; i++) {
            for (var j = 0 | 0; j < vertices; j++) {
              var i0 = i * verticesPerRing + j;
              var i1 = i0 + (1 | 0);
              var i2 = i0 + verticesPerRing;
              var i3 = i2 + (1 | 0);
              this.triangles.push(index + i0);
              this.triangles.push(index + i1);
              this.triangles.push(index + i2);
              this.triangles.push(index + i2);
              this.triangles.push(index + i1);
              this.triangles.push(index + i3);
            }
          }
          this.translate(pos);
        };
        Mesh.prototype.icoSphere = function (pos, radius, subdivisions) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v;
          if (subdivisions === void 0) {
            subdivisions = 1 | 0;
          }
          var shader_self_temp = this;
          var index = this.vertices.len() | 0;
          var t = (1.0 + Math.sqrt(5.0)) / 2.0;
          var vertices = [
            __.makeVector(__.FM.negate_1(1 | 0), t, 0 | 0),
            __.makeVector(1 | 0, t, 0 | 0),
            __.makeVector(__.FM.negate_1(1 | 0), __.FM.negate_1(t), 0 | 0),
            __.makeVector(1 | 0, __.FM.negate_1(t), 0 | 0),
            __.makeVector(0 | 0, __.FM.negate_1(1 | 0), t),
            __.makeVector(0 | 0, 1 | 0, t),
            __.makeVector(0 | 0, __.FM.negate_1(1 | 0), __.FM.negate_1(t)),
            __.makeVector(0 | 0, 1 | 0, __.FM.negate_1(t)),
            __.makeVector(t, 0 | 0, __.FM.negate_1(1 | 0)),
            __.makeVector(t, 0 | 0, 1 | 0),
            __.makeVector(__.FM.negate_1(t), 0 | 0, __.FM.negate_1(1 | 0)),
            __.makeVector(__.FM.negate_1(t), 0 | 0, 1 | 0),
          ];
          var triangles = [
            __.intifyVector(__.makeVector(0 | 0, 11 | 0, 5 | 0)),
            __.intifyVector(__.makeVector(0 | 0, 5 | 0, 1 | 0)),
            __.intifyVector(__.makeVector(0 | 0, 1 | 0, 7 | 0)),
            __.intifyVector(__.makeVector(0 | 0, 7 | 0, 10 | 0)),
            __.intifyVector(__.makeVector(0 | 0, 10 | 0, 11 | 0)),
            __.intifyVector(__.makeVector(1 | 0, 5 | 0, 9 | 0)),
            __.intifyVector(__.makeVector(5 | 0, 11 | 0, 4 | 0)),
            __.intifyVector(__.makeVector(11 | 0, 10 | 0, 2 | 0)),
            __.intifyVector(__.makeVector(10 | 0, 7 | 0, 6 | 0)),
            __.intifyVector(__.makeVector(7 | 0, 1 | 0, 8 | 0)),
            __.intifyVector(__.makeVector(3 | 0, 9 | 0, 4 | 0)),
            __.intifyVector(__.makeVector(3 | 0, 4 | 0, 2 | 0)),
            __.intifyVector(__.makeVector(3 | 0, 2 | 0, 6 | 0)),
            __.intifyVector(__.makeVector(3 | 0, 6 | 0, 8 | 0)),
            __.intifyVector(__.makeVector(3 | 0, 8 | 0, 9 | 0)),
            __.intifyVector(__.makeVector(4 | 0, 9 | 0, 5 | 0)),
            __.intifyVector(__.makeVector(2 | 0, 4 | 0, 11 | 0)),
            __.intifyVector(__.makeVector(6 | 0, 2 | 0, 10 | 0)),
            __.intifyVector(__.makeVector(8 | 0, 6 | 0, 7 | 0)),
            __.intifyVector(__.makeVector(9 | 0, 8 | 0, 1 | 0)),
          ];
          for (var i = 0 | 0; i < (vertices.len() | 0); i++) {
            this.vertices.push(
              ((_a = (0, std_math_1.normalize)(vertices[i])),
              (_b = radius),
              [_a[0] * _b, _a[1] * _b, _a[2] * _b])
            );
          }
          for (var i = 0 | 0; i < (triangles.len() | 0); i++) {
            this.triangles.push(index + triangles[i][0]);
            this.triangles.push(index + triangles[i][1]);
            this.triangles.push(index + triangles[i][2]);
          }
          for (var i = 0 | 0; i < subdivisions; i++) {
            var newTriangles = [];
            for (
              var j = 0 | 0;
              j < (this.triangles.len() | 0);
              j = j + (3 | 0)
            ) {
              var i0 = this.triangles[j + (0 | 0)];
              var i1 = this.triangles[j + (1 | 0)];
              var i2 = this.triangles[j + (2 | 0)];
              var v0 = this.vertices[i0];
              var v1 = this.vertices[i1];
              var v2 = this.vertices[i2];
              var v3 = (0, std_math_1.normalize)(
                ((_c =
                  ((_e = v0),
                  (_f = v1),
                  [_e[0] + _f[0], _e[1] + _f[1], _e[2] + _f[2]])),
                (_d = 2.0),
                [_c[0] / _d, _c[1] / _d, _c[2] / _d])
              );
              var v4 = (0, std_math_1.normalize)(
                ((_g =
                  ((_j = v1),
                  (_k = v2),
                  [_j[0] + _k[0], _j[1] + _k[1], _j[2] + _k[2]])),
                (_h = 2.0),
                [_g[0] / _h, _g[1] / _h, _g[2] / _h])
              );
              var v5 = (0, std_math_1.normalize)(
                ((_l =
                  ((_o = v2),
                  (_p = v0),
                  [_o[0] + _p[0], _o[1] + _p[1], _o[2] + _p[2]])),
                (_m = 2.0),
                [_l[0] / _m, _l[1] / _m, _l[2] / _m])
              );
              var i3 = this.vertices.len() | 0;
              var i4 = i3 + (1 | 0);
              var i5 = i3 + (2 | 0);
              this.vertices.push(
                ((_q = v3), (_r = radius), [_q[0] * _r, _q[1] * _r, _q[2] * _r])
              );
              this.vertices.push(
                ((_s = v4), (_t = radius), [_s[0] * _t, _s[1] * _t, _s[2] * _t])
              );
              this.vertices.push(
                ((_u = v5), (_v = radius), [_u[0] * _v, _u[1] * _v, _u[2] * _v])
              );
              newTriangles.push(i0, i3, i5);
              newTriangles.push(i3, i1, i4);
              newTriangles.push(i3, i4, i5);
              newTriangles.push(i5, i4, i2);
            }
            this.triangles = newTriangles;
          }
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            var normal = (0, std_math_1.normalize)(this.vertices[i]);
            var tangent = (0, std_math_1.normalize)(
              __.makeVector(normal[2], 0 | 0, __.FM.negate_1(normal[0]))
            );
            var bitangent = (0, std_math_1.normalize)(
              (0, std_math_1.cross)(normal, tangent)
            );
            this.normals.push(normal);
            this.tangents.push(tangent);
            this.bitangents.push(bitangent);
          }
          for (var i = 0 | 0; i < (this.triangles.len() | 0); i = i + (3 | 0)) {
            var i0 = this.triangles[i + (0 | 0)];
            var i1 = this.triangles[i + (1 | 0)];
            var i2 = this.triangles[i + (2 | 0)];
            var v0 = this.vertices[i0];
            var v1 = this.vertices[i1];
            var v2 = this.vertices[i2];
            var uv0 = __.FM.float_2_1_1(
              __.add(
                (0, std_math_1.atan2)(v0[2], v0[0]) / common_1.PI / 2.0,
                0.5
              ),
              __.add(Math.asin(v0[1]) / common_1.PI, 0.5)
            );
            var uv1 = __.FM.float_2_1_1(
              __.add(
                (0, std_math_1.atan2)(v1[2], v1[0]) / common_1.PI / 2.0,
                0.5
              ),
              __.add(Math.asin(v1[1]) / common_1.PI, 0.5)
            );
            var uv2 = __.FM.float_2_1_1(
              __.add(
                (0, std_math_1.atan2)(v2[2], v2[0]) / common_1.PI / 2.0,
                0.5
              ),
              __.add(Math.asin(v2[1]) / common_1.PI, 0.5)
            );
            this.uvs.push(uv0);
            this.uvs.push(uv1);
            this.uvs.push(uv2);
          }
          this.translate(pos);
        };
        Mesh.prototype.cylinder = function (pos, radius, height, vertices) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
          var shader_self_temp = this;
          this.translate(pos);
        };
        Mesh.prototype.capsule = function (pos, radius, height, vertices) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
          var shader_self_temp = this;
          this.translate(pos);
        };
        Mesh.prototype.cone = function (pos, radius, height, vertices) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
          var shader_self_temp = this;
          var index = this.vertices.len() | 0;
          this.translate(pos);
        };
        Mesh.prototype.plane = function (pos, size, subdivisions) {
          var _a, _b;
          if (subdivisions === void 0) {
            subdivisions = 1 | 0;
          }
          var shader_self_temp = this;
          var index = this.vertices.len() | 0;
          var halfSize = ((_a = size), (_b = 2.0), [_a[0] / _b, _a[1] / _b]);
          for (var i = 0 | 0; i <= subdivisions[0]; i++) {
            var x = i / __.swizzle(subdivisions, "x");
            var posX = x * size[0] - halfSize[0];
            for (var j = 0 | 0; j <= subdivisions[1]; j++) {
              var y = j / __.swizzle(subdivisions, "y");
              var posY = y * size[1] - halfSize[1];
              this.vertices.push(__.makeVector(posX, 0 | 0, posY));
              this.normals.push(
                __.intifyVector(__.makeVector(0 | 0, 1 | 0, 0 | 0))
              );
              this.tangents.push(
                __.intifyVector(__.makeVector(1 | 0, 0 | 0, 0 | 0))
              );
              this.bitangents.push(
                __.intifyVector(__.makeVector(0 | 0, 0 | 0, 1 | 0))
              );
              this.uvs.push(__.makeVector(x, y));
            }
          }
          for (var i = 0 | 0; i < subdivisions[0]; i++) {
            for (var j = 0 | 0; j < subdivisions[1]; j++) {
              var i0 = i * (subdivisions[1] + (1 | 0)) + j;
              var i1 = i0 + (1 | 0);
              var i2 = i0 + subdivisions[1] + (1 | 0);
              var i3 = i2 + (1 | 0);
              this.triangles.push(index + i0);
              this.triangles.push(index + i1);
              this.triangles.push(index + i2);
              this.triangles.push(index + i2);
              this.triangles.push(index + i1);
              this.triangles.push(index + i3);
            }
          }
          this.translate(pos);
        };
        Mesh.prototype.translate = function (pos) {
          var shader_self_temp = this;
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            this.vertices.__index_assign_op(__.add, i, pos);
          }
          return this;
        };
        Mesh.prototype.rotate = function (quaternion) {
          var shader_self_temp = this;
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            this.vertices.__index_assign(
              i,
              common_1.quat.rotate(quaternion, this.vertices[i])
            );
          }
          for (var i = 0 | 0; i < (this.normals.len() | 0); i++) {
            this.normals.__index_assign(
              i,
              common_1.quat.rotate(quaternion, this.normals[i])
            );
          }
          return this;
        };
        Mesh.prototype.transform = function (matrix) {
          var _a, _b;
          var shader_self_temp = this;
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            this.vertices.__index_assign(
              i,
              ((_a = __.mul(__.makeVector(this.vertices[i], 1 | 0), matrix)),
              [_a[0], _a[1], _a[2]])
            );
          }
          for (var i = 0 | 0; i < (this.normals.len() | 0); i++) {
            this.normals.__index_assign(
              i,
              ((_b = __.mul(__.makeVector(this.normals[i], 1 | 0), matrix)),
              [_b[0], _b[1], _b[2]])
            );
          }
          return this;
        };
        Mesh.prototype.scale = function (scale) {
          var shader_self_temp = this;
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            this.vertices.__index_assign_op(__.mul, i, scale);
          }
          return this;
        };
        Mesh.prototype.bounds = function () {
          var _a, _b, _c, _d;
          var shader_self_temp = this;
          var mn = ((_a = 0.0), [_a, _a, _a]);
          var mx = ((_b = 0.0), [_b, _b, _b]);
          for (var i = 0 | 0; i < (this.vertices.len() | 0); i++) {
            mn = (0, std_math_1.min)(mn, this.vertices[i]);
            mx = (0, std_math_1.max)(mx, this.vertices[i]);
          }
          return (
            (_c = mx), (_d = mn), [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]
          );
        };
        Mesh.prototype.center = function () {
          var _a, _b;
          var shader_self_temp = this;
          var bounds = this.bounds();
          return (
            (_a = bounds), (_b = 2.0), [_a[0] / _b, _a[1] / _b, _a[2] / _b]
          );
        };
        Mesh.new = function () {
          return new Mesh({
            vertices: [],
            triangles: [],
            tangents: [],
            bitangents: [],
            normals: [],
            uvs: [],
            colors: [],
          });
        };
        Mesh.prototype.append = function (other) {
          var shader_self_temp = this;
          var oldVertices = this.vertices.len() | 0;
          var oldTriangles = this.triangles.len() | 0;
          this.vertices.append(other.vertices);
          this.triangles.append(other.triangles);
          this.normals.append(other.normals);
          this.tangents.append(other.tangents);
          this.bitangents.append(other.bitangents);
          this.uvs.append(other.uvs);
          this.colors.append(other.colors);
          for (var i = oldTriangles; i < (this.triangles.len() | 0); i++) {
            this.triangles.__index_assign_op(__.add, i, oldVertices);
          }
        };
        Mesh.prototype.getVertices = function () {
          var shader_self_temp = this;
          return this.vertices;
        };
        Mesh.prototype.getTriangles = function () {
          var shader_self_temp = this;
          return this.triangles;
        };
        Mesh.prototype.getNormals = function () {
          var shader_self_temp = this;
          return this.normals;
        };
        Mesh.prototype.getTangents = function () {
          var shader_self_temp = this;
          return this.tangents;
        };
        Mesh.prototype.getBitangents = function () {
          var shader_self_temp = this;
          return this.bitangents;
        };
        Mesh.prototype.getUVs = function () {
          var shader_self_temp = this;
          return this.uvs;
        };
        Mesh.prototype.getColors = function () {
          var shader_self_temp = this;
          return this.colors;
        };
        Mesh.prototype.setVertices = function (vertices) {
          var shader_self_temp = this;
          this.vertices = vertices;
        };
        Mesh.prototype.setTriangles = function (triangles) {
          var shader_self_temp = this;
          this.triangles = triangles;
        };
        Mesh.prototype.setNormals = function (normals) {
          var shader_self_temp = this;
          this.normals = normals;
        };
        Mesh.prototype.setTangents = function (tangents) {
          var shader_self_temp = this;
          this.tangents = tangents;
        };
        Mesh.prototype.setBitangents = function (bitangents) {
          var shader_self_temp = this;
          this.bitangents = bitangents;
        };
        Mesh.prototype.setUVs = function (uvs) {
          var shader_self_temp = this;
          this.uvs = uvs;
        };
        Mesh.prototype.setColors = function (colors) {
          var shader_self_temp = this;
          this.colors = colors;
        };
        Mesh.prototype.clone = function () {
          return new Mesh({
            vertices: (0, std___std_all_1.__deepClone)(this.vertices),
            triangles: (0, std___std_all_1.__deepClone)(this.triangles),
            normals: (0, std___std_all_1.__deepClone)(this.normals),
            tangents: (0, std___std_all_1.__deepClone)(this.tangents),
            bitangents: (0, std___std_all_1.__deepClone)(this.bitangents),
            uvs: (0, std___std_all_1.__deepClone)(this.uvs),
            colors: (0, std___std_all_1.__deepClone)(this.colors),
            symbol: (0, std___std_all_1.__deepClone)(this.symbol),
          });
        };
        Mesh.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}'
          );
        };
        return Mesh;
      })();
      exports.Mesh = Mesh;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}'
        ),
        Mesh
      ); /* impl Mesh */
      var mesh = /** @class */ (function () {
        function mesh(data) {}
        mesh.rect = function (pos, size) {
          var _a, _b;
          var g = Mesh.new();
          g.rectAt(
            pos,
            ((_a = pos), (_b = size), [_a[0] + _b[0], _a[1] + _b[1]])
          );
          return g;
        };
        mesh.box = function (pos, size) {
          var g = Mesh.new();
          g.box(size);
          g.translate(pos);
          return g;
        };
        mesh.uvSphere = function (pos, radius, vertices, rings) {
          if (vertices === void 0) {
            vertices = 32 | 0;
          }
          if (rings === void 0) {
            rings = 16 | 0;
          }
          var g = Mesh.new();
          g.uvSphere(pos, radius, vertices, rings);
          return g;
        };
        mesh.icoSphere = function (pos, radius, subdivisions) {
          if (subdivisions === void 0) {
            subdivisions = 1 | 0;
          }
          var g = Mesh.new();
          g.icoSphere(pos, radius, subdivisions);
          return g;
        };
        mesh.plane = function (pos, size, subdivisions) {
          if (subdivisions === void 0) {
            subdivisions = 1 | 0;
          }
          var g = Mesh.new();
          g.plane(pos, size, subdivisions);
          return g;
        };
        /**
         * Returns a [-1, 1] position for a given index.
         */
        mesh.triangleFromIndex = function (index) {
          if (index == (0 | 0)) {
            return __.FM.float_2_1_1(__.negate(1 | 0), __.int(1));
          } else if (index == (1 | 0)) {
            return __.FM.float_2_1_1(__.int(1), __.int(1));
          } else if (index == (2 | 0)) {
            return __.FM.float_2_1_1(__.int(0), __.negate(1 | 0));
          } else {
            return __.FM.float_2_1_1(__.int(0), __.int(0));
          }
        };
        mesh.circleFromIndex = function (vertexIndex, vertices) {
          vertexIndex = vertices - vertexIndex;
          var numSlices = vertices / (3 | 0);
          var sliceIndex = Math.floor((vertexIndex / vertices) * numSlices);
          var incAngle = (common_1.PI * 2.0) / numSlices;
          var baseAngle = incAngle * sliceIndex;
          if (vertexIndex % (3 | 0) == (0 | 0)) {
            return __.FM.float_2_1_1(__.int(0), __.int(0));
          } else if (vertexIndex % (3 | 0) == (1 | 0)) {
            return __.FM.float_2_1_1(
              (0, std_math_1.cos)(baseAngle),
              (0, std_math_1.sin)(baseAngle)
            );
          } else {
            return __.FM.float_2_1_1(
              (0, std_math_1.cos)(baseAngle + incAngle),
              (0, std_math_1.sin)(baseAngle + incAngle)
            );
          }
        };
        mesh.rectFromIndex = function (index, vertices) {
          var _a, _b, _c, _d, _e, _f;
          var x = index % vertices;
          var y = index / vertices;
          return (
            (_a =
              ((_c =
                ((_e = __.FM.float_2_1_1(x, y)),
                (_f = vertices),
                [_e[0] / _f, _e[1] / _f])),
              (_d = 2.0),
              [_c[0] * _d, _c[1] * _d])),
            (_b = 1.0),
            [_a[0] - _b, _a[1] - _b]
          );
        };
        mesh.empty = function (numVerts) {
          var _a, _b, _c, _d, _e, _f;
          if (numVerts === void 0) {
            numVerts = 0 | 0;
          }
          var g = Mesh.new();
          if (numVerts > (0 | 0)) {
            g.setVertices(
              (0, std___std_all_1.array)(numVerts, ((_a = 0 | 0), [_a, _a, _a]))
            );
            g.setNormals(
              (0, std___std_all_1.array)(numVerts, ((_b = 0 | 0), [_b, _b, _b]))
            );
            g.setTangents(
              (0, std___std_all_1.array)(numVerts, ((_c = 0 | 0), [_c, _c, _c]))
            );
            g.setBitangents(
              (0, std___std_all_1.array)(numVerts, ((_d = 0 | 0), [_d, _d, _d]))
            );
            g.setUVs(
              (0, std___std_all_1.array)(numVerts, ((_e = 0 | 0), [_e, _e]))
            );
            g.setColors(
              (0, std___std_all_1.array)(
                numVerts,
                ((_f = 0 | 0), [_f, _f, _f, _f])
              )
            );
            var tris = (0, std___std_all_1.array)(numVerts, 0 | 0);
            for (var i = 0 | 0; i < numVerts; i++) {
              tris.__index_assign(i, i);
            }
            g.setTriangles(tris);
          }
          return g;
        };
        mesh.join = function (mesh1, mesh2) {
          var g = Mesh.new();
          g.append(mesh1);
          g.append(mesh2);
          return g;
        };
        // pub fn cylinder(pos: float3, radius: float, height: float, vertices: int = 32) -> Mesh {
        // 	let g = Mesh::new();
        // 	g.cylinder(pos, radius, height, vertices);
        // 	return g;
        // }
        // pub fn capsule(pos: float3, radius: float, height: float, vertices: int = 32) -> Mesh {
        // 	let g = Mesh::new();
        // 	g.capsule(pos, radius, height, vertices);
        // 	return g;
        // }
        // pub fn cone(pos: float3, radius: float, height: float, vertices: int = 32) -> Mesh {
        // 	let g = Mesh::new();
        // 	g.cone(pos, radius, height, vertices);
        // 	return g;
        // }
        mesh.prototype.clone = function () {
          return new mesh({});
        };
        mesh.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_mesh_ts_19639_mesh","fields":[]}'
          );
        };
        return mesh;
      })();
      exports.mesh = mesh;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_mesh_ts_19639_mesh","fields":[]}'
        ),
        mesh
      ); /* impl mesh */
      var Material = /** @class */ (function () {
        function Material(data) {
          var _a, _b, _c, _d, _e, _f, _g;
          this.baseColor =
            (_a = data.baseColor) !== null && _a !== void 0
              ? _a
              : __.FM.float_4_1_1_1_1(0.0, 0.0, 0.0, 0.0);
          this.color = (_b = data.color) !== null && _b !== void 0 ? _b : null;
          this.normal =
            (_c = data.normal) !== null && _c !== void 0 ? _c : null;
          this.normalScale =
            (_d = data.normalScale) !== null && _d !== void 0
              ? _d
              : __.FM.float_2_1_1(0.0, 0.0);
          this.roughness =
            (_e = data.roughness) !== null && _e !== void 0 ? _e : null;
          this.emissive =
            (_f = data.emissive) !== null && _f !== void 0 ? _f : null;
          this.metallic =
            (_g = data.metallic) !== null && _g !== void 0 ? _g : null;
        }
        Material.prototype.clone = function () {
          return new Material({
            baseColor: (0, std___std_all_1.__deepClone)(this.baseColor),
            color: (0, std___std_all_1.__deepClone)(this.color),
            normal: (0, std___std_all_1.__deepClone)(this.normal),
            normalScale: (0, std___std_all_1.__deepClone)(this.normalScale),
            roughness: (0, std___std_all_1.__deepClone)(this.roughness),
            emissive: (0, std___std_all_1.__deepClone)(this.emissive),
            metallic: (0, std___std_all_1.__deepClone)(this.metallic),
          });
        };
        Material.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}'
          );
        };
        return Material;
      })();
      exports.Material = Material;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}'
        ),
        Material
      );
      var ModelPart = /** @class */ (function () {
        function ModelPart(data) {
          var _a, _b, _c;
          this.mesh =
            (_a = data.mesh) !== null && _a !== void 0 ? _a : new Mesh({});
          this.material =
            (_b = data.material) !== null && _b !== void 0
              ? _b
              : new Material({});
          this.transform =
            (_c = data.transform) !== null && _c !== void 0
              ? _c
              : __.float4x4(
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0
                );
        }
        ModelPart.prototype.clone = function () {
          return new ModelPart({
            mesh: (0, std___std_all_1.__deepClone)(this.mesh),
            material: (0, std___std_all_1.__deepClone)(this.material),
            transform: (0, std___std_all_1.__deepClone)(this.transform),
          });
        };
        ModelPart.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_mesh_ts_24321_ModelPart","fields":[["mesh",{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}],["material",{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}],["transform",{"type":"primitive","name":"float4x4"}]]}'
          );
        };
        return ModelPart;
      })();
      exports.ModelPart = ModelPart;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_mesh_ts_24321_ModelPart","fields":[["mesh",{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}],["material",{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}],["transform",{"type":"primitive","name":"float4x4"}]]}'
        ),
        ModelPart
      );
      var Model = /** @class */ (function () {
        function Model(data) {
          var _a;
          this.parts = (_a = data.parts) !== null && _a !== void 0 ? _a : [];
        }
        Model.prototype.clone = function () {
          return new Model({
            parts: (0, std___std_all_1.__deepClone)(this.parts),
          });
        };
        Model.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_mesh_ts_24894_Model","fields":[["parts",{"type":"array","element":{"type":"struct","name":"str_i_iistd_mesh_ts_24321_ModelPart","fields":[["mesh",{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}],["material",{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}],["transform",{"type":"primitive","name":"float4x4"}]]},"staticSize":1}]]}'
          );
        };
        return Model;
      })();
      exports.Model = Model;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_mesh_ts_24894_Model","fields":[["parts",{"type":"array","element":{"type":"struct","name":"str_i_iistd_mesh_ts_24321_ModelPart","fields":[["mesh",{"type":"struct","name":"str_i_iistd_mesh_ts_1603_Mesh","fields":[["vertices",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["triangles",{"type":"array","element":{"type":"primitive","name":"int"},"staticSize":1}],["normals",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["tangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["bitangents",{"type":"array","element":{"type":"primitive","name":"float3"},"staticSize":1}],["uvs",{"type":"array","element":{"type":"primitive","name":"float2"},"staticSize":1}],["colors",{"type":"array","element":{"type":"primitive","name":"float4"},"staticSize":1}],["symbol",null]]}],["material",{"type":"struct","name":"str_i_iistd_mesh_ts_23155_Material","fields":[["baseColor",{"type":"primitive","name":"float4"}],["color",{"type":"primitive","name":"texture2d"}],["normal",{"type":"primitive","name":"texture2d"}],["normalScale",{"type":"primitive","name":"float2"}],["roughness",{"type":"primitive","name":"texture2d"}],["emissive",{"type":"primitive","name":"texture2d"}],["metallic",{"type":"primitive","name":"texture2d"}]]}],["transform",{"type":"primitive","name":"float4x4"}]]},"staticSize":1}]]}'
        ),
        Model
      );
      window.SHD_Mesh = Mesh;
      window.SHD_Model = Model;
      window.SHD_ModelPart = ModelPart;
      window.SHD_Material = Material;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/textures.js", deps, func);
    define(["require", "exports", "/std___std_all"], function (
      require,
      exports,
      std___std_all_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var globalVarGet = std___std_all_1.globalVarGet;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/common.js", deps, func);
    var __assign =
      (this && this.__assign) ||
      function () {
        __assign =
          Object.assign ||
          function (t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
          };
        return __assign.apply(this, arguments);
      };
    var __createBinding =
      (this && this.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (this && this.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (this && this.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
    define([
      "require",
      "exports",
      "/std_math",
      "/std_math",
      "/std___std_all",
      "/_std/buffer",
      "/_std/ui",
      "/_std/texture",
    ], function (
      require,
      exports,
      __,
      std_math_1,
      std___std_all_1,
      buffer_1,
      ui_1,
      texture_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.wrap4 =
        exports.wrap3 =
        exports.wrap2 =
        exports.color =
        exports.remap1 =
        exports.remap =
        exports.tan1 =
        exports.cos1 =
        exports.sin1 =
        exports.hexFromColor =
        exports.hex =
        exports.cmykFromColor =
        exports.cmyk =
        exports.rgbaFromColor =
        exports.rgbFromColor =
        exports.rgba =
        exports.rgb =
        exports.hsvaFromColor =
        exports.hsvFromColor =
        exports.hsva =
        exports.hsv =
        exports.hslaFromColor =
        exports.hslFromColor =
        exports.hsla =
        exports.hsl =
        exports.screenAA =
        exports.matrix =
        exports.noise =
        exports.reverseMortonCode2 =
        exports.randColor2 =
        exports.randColor =
        exports.mortonCode2 =
        exports.spatial =
        exports.bezier =
        exports.Camera =
        exports.Camera2d =
        exports.quat =
        exports.ui =
        exports.texture3d =
        exports.texture2d =
        exports.buffer =
        exports.PI =
        exports.pixelToClip =
          void 0;
      __ = __importStar(__);
      var globalVarGet = std___std_all_1.globalVarGet;
      Object.defineProperty(exports, "buffer", {
        enumerable: true,
        get: function () {
          return buffer_1.buffer;
        },
      });
      Object.defineProperty(exports, "ui", {
        enumerable: true,
        get: function () {
          return ui_1.ui;
        },
      });
      Object.defineProperty(exports, "texture2d", {
        enumerable: true,
        get: function () {
          return texture_1.texture2d;
        },
      });
      Object.defineProperty(exports, "texture3d", {
        enumerable: true,
        get: function () {
          return texture_1.texture3d;
        },
      });
      function pixelToClip(pixelPosition) {
        var _a, _b, _c, _d, _e, _f, _g;
        var zeroToOne =
          ((_a = pixelPosition),
          (_b = env.screenSize),
          [_a[0] / _b[0], _a[1] / _b[1]]);
        var zeroToTwo =
          ((_c = zeroToOne), (_d = 2.0), [_c[0] * _d, _c[1] * _d]);
        var clipSpace =
          ((_e = zeroToTwo),
          (_f = ((_g = 1.0), [_g, _g])),
          [_e[0] - _f[0], _e[1] - _f[1]]);
        return __.makeVector(clipSpace[0], clipSpace[1] * __.FM.negate_1(1.0));
      }
      exports.pixelToClip = pixelToClip;
      /**
       * Value of PI to 35 decimal places.
       */
      var PI = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "PI",
        function () {
          return 3.14159265358979323846264338327950288;
        },
        function () {
          return PI;
        }
      );
      exports.PI = PI;
      var quat = /** @class */ (function () {
        function quat(data) {}
        /**
         * Creates a quaternion from an angle and axis.
         */
        quat.fromAngleAxis = function (angle, axis) {
          return __.FM.float_4_3_1(
            __.mul(axis, Math.sin(angle * 0.5)),
            (0, std_math_1.cos)(angle * 0.5)
          );
        };
        /**
         * Multiplies two quaternions and returns the result.
         */
        quat.mul = function (a, b) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
          return __.FM.float_4_3_1(
            __.add(
              ((_a =
                ((_c = ((_e = b), [_e[0], _e[1], _e[2]])),
                (_d = a[3]),
                [_c[0] * _d, _c[1] * _d, _c[2] * _d])),
              (_b =
                ((_f = ((_h = a), [_h[0], _h[1], _h[2]])),
                (_g = b[3]),
                [_f[0] * _g, _f[1] * _g, _f[2] * _g])),
              [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2]]),
              (0, std_math_1.cross)(
                ((_j = a), [_j[0], _j[1], _j[2]]),
                ((_k = b), [_k[0], _k[1], _k[2]])
              )
            ),
            __.sub(
              a[3] * b[3],
              (0, std_math_1.dot)(
                ((_l = a), [_l[0], _l[1], _l[2]]),
                ((_m = b), [_m[0], _m[1], _m[2]])
              )
            )
          );
        };
        /**
         * Rotates a vector by a quaternion and returns the rotated vector.
         */
        quat.rotate = function (quaternion, vector) {
          var _a;
          var q = quat.mul(
            quat.mul(quaternion, __.FM.float_4_3_1(vector, __.int(0))),
            quat.conjugate(quaternion)
          );
          return (_a = q), [_a[0], _a[1], _a[2]];
        };
        /**
         * Returns the conjugate of the input quaternion.
         *
         * The conjugate of a quaternion number is a quaternion with the same magnitudes but with the sign of the imaginary parts changed
         */
        quat.conjugate = function (quaternion) {
          var _a;
          return __.FM.float_4_3_1(
            __.negate(((_a = quaternion), [_a[0], _a[1], _a[2]])),
            __.swizzle(quaternion, "w")
          );
        };
        /**
         * Returns the inverse of the input quaternion.
         */
        quat.inverse = function (quaternion) {
          var _a, _b;
          return (
            (_a = quat.conjugate(quaternion)),
            (_b = (0, std_math_1.dot)(quaternion, quaternion)),
            [_a[0] / _b, _a[1] / _b, _a[2] / _b, _a[3] / _b]
          );
        };
        /**
         * Generates a quaternion that rotates from one direction to another via the shortest path.
         */
        quat.fromToRotation = function (from, to) {
          var _a;
          var q = ((_a = 0.0), [_a, _a, _a, _a]);
          var d = (0, std_math_1.dot)(from, to);
          if (d < __.FM.negate_1(0.999999)) {
            var right = __.FM.float_3_1_1_1(__.int(1), __.int(0), __.int(0));
            var up = __.FM.float_3_1_1_1(__.int(0), __.int(1), __.int(0));
            var tmp = (0, std_math_1.cross)(right, from);
            if ((0, std_math_1.length)(tmp) < 0.000001) {
              tmp = (0, std_math_1.cross)(up, from);
            }
            tmp = (0, std_math_1.normalize)(tmp);
            q = quat.fromAngleAxis(PI, tmp);
          } else if (d > 0.999999) {
            q = __.FM.float_4_1_1_1_1(
              __.int(0),
              __.int(0),
              __.int(0),
              __.int(1)
            );
          } else {
            q = __.FM.float_4_3_1(
              (0, std_math_1.cross)(from, to),
              __.add(1 | 0, d)
            );
            q = (0, std_math_1.normalize)(q);
          }
          return q;
        };
        quat.diff = function (a, b) {
          var _a, _b;
          return (
            (_a = a),
            (_b = quat.inverse(b)),
            [_a[0] * _b[0], _a[1] * _b[1], _a[2] * _b[2], _a[3] * _b[3]]
          );
        };
        /**
         * Generates lookAt quaternion.
         */
        quat.lookAt = function (forward, up) {
          var right = (0, std_math_1.normalize)(
            (0, std_math_1.cross)(forward, up)
          );
          up = (0, std_math_1.normalize)((0, std_math_1.cross)(forward, right));
          var m00 = right[0];
          var m01 = right[1];
          var m02 = right[2];
          var m10 = up[0];
          var m11 = up[1];
          var m12 = up[2];
          var m20 = forward[0];
          var m21 = forward[1];
          var m22 = forward[2];
          var num8 = m00 + m11 + m22;
          var q = __.FM.float_4_1_1_1_1(
            __.int(0),
            __.int(0),
            __.int(0),
            __.int(1)
          );
          if (num8 > 0.0) {
            var num = Math.sqrt(num8 + 1.0);
            var w_1 = num * 0.5;
            num = 0.5 / num;
            var x_1 = (m12 - m21) * num;
            var y_1 = (m20 - m02) * num;
            var z_1 = (m01 - m10) * num;
            return __.FM.float_4_1_1_1_1(x_1, y_1, z_1, w_1);
          }
          if (__.and(m00 >= m11, m00 >= m22)) {
            var num7 = Math.sqrt(1.0 + m00 - m11 - m22);
            var num4 = 0.5 / num7;
            var x_2 = 0.5 * num7;
            var y_2 = (m01 + m10) * num4;
            var z_2 = (m02 + m20) * num4;
            var w_2 = (m12 - m21) * num4;
            return __.FM.float_4_1_1_1_1(x_2, y_2, z_2, w_2);
          }
          if (m11 > m22) {
            var num6 = Math.sqrt(1.0 + m11 - m00 - m22);
            var num3 = 0.5 / num6;
            var x_3 = (m10 + m01) * num3;
            var y_3 = 0.5 * num6;
            var z_3 = (m21 + m12) * num3;
            var w_3 = (m20 - m02) * num3;
            return __.FM.float_4_1_1_1_1(x_3, y_3, z_3, w_3);
          }
          var num5 = Math.sqrt(1.0 + m22 - m00 - m11);
          var num2 = 0.5 / num5;
          var x = (m20 + m02) * num2;
          var y = (m21 + m12) * num2;
          var z = 0.5 * num5;
          var w = (m01 - m10) * num2;
          return __.FM.float_4_1_1_1_1(x, y, z, w);
        };
        /**
         * Smooth interpolation between two quaternions.
         */
        quat.slerp = function (a, b, t) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
          if ((0, std_math_1.length)(a) == 0.0) {
            if ((0, std_math_1.length)(b) == 0.0) {
              return __.FM.float_4_1_1_1_1(
                __.int(0),
                __.int(0),
                __.int(0),
                __.int(1)
              );
            }
            return b;
          } else if ((0, std_math_1.length)(b) == 0.0) {
            return a;
          }
          var cosHalfAngle =
            a[3] * b[3] +
            (0, std_math_1.dot)(
              ((_a = a), [_a[0], _a[1], _a[2]]),
              ((_b = b), [_b[0], _b[1], _b[2]])
            );
          if (__.or(cosHalfAngle >= 1.0, cosHalfAngle <= __.FM.negate_1(1.0))) {
            return a;
          } else if (cosHalfAngle < 0.0) {
            b =
              ((_c = b),
              (_d = __.FM.negate_1(1.0)),
              [_c[0] * _d, _c[1] * _d, _c[2] * _d, _c[3] * _d]);
            cosHalfAngle = __.FM.negate_1(cosHalfAngle);
          }
          var blendA = 0.0;
          var blendB = 0.0;
          if (cosHalfAngle < 0.99) {
            var halfAngle = Math.acos(cosHalfAngle);
            var sinHalfAngle = Math.sin(halfAngle);
            var oneOverSinHalfAngle = 1.0 / sinHalfAngle;
            blendA = Math.sin(halfAngle * (1.0 - t)) * oneOverSinHalfAngle;
            blendB = Math.sin(halfAngle * t) * oneOverSinHalfAngle;
          } else {
            blendA = 1.0 - t;
            blendB = t;
          }
          var result = __.FM.float_4_3_1(
            __.add(
              ((_e = blendA),
              (_f = ((_g = a), [_g[0], _g[1], _g[2]])),
              [_e * _f[0], _e * _f[1], _e * _f[2]]),
              ((_h = blendB),
              (_j = ((_k = b), [_k[0], _k[1], _k[2]])),
              [_h * _j[0], _h * _j[1], _h * _j[2]])
            ),
            __.add(blendA * a[3], blendB * b[3])
          );
          if ((0, std_math_1.length)(result) > 0.0) {
            return (0, std_math_1.normalize)(result);
          }
          return __.FM.float_4_1_1_1_1(
            __.int(0),
            __.int(0),
            __.int(0),
            __.int(1)
          );
        };
        /**
         * Converts quaternion to matrix.
         */
        quat.toMatrix = function (quaternion) {
          var x = quaternion[0];
          var y = quaternion[1];
          var z = quaternion[2];
          var w = quaternion[3];
          var x2 = x + x;
          var y2 = y + y;
          var z2 = z + z;
          var xx = x * x2;
          var xy = x * y2;
          var xz = x * z2;
          var yy = y * y2;
          var yz = y * z2;
          var zz = z * z2;
          var wx = w * x2;
          var wy = w * y2;
          var wz = w * z2;
          var m = __.float4x4(
            1.0 - (yy + zz),
            xy + wz,
            xz - wy,
            0 | 0,
            xy - wz,
            1.0 - (xx + zz),
            yz + wx,
            0 | 0,
            xz + wy,
            yz - wx,
            1.0 - (xx + yy),
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            1.0
          );
          return m;
        };
        quat.fromEulerAngles = function (angles) {
          var cr = Math.cos(angles[0] * 0.5);
          var sr = Math.sin(angles[0] * 0.5);
          var cp = Math.cos(angles[1] * 0.5);
          var sp = Math.sin(angles[1] * 0.5);
          var cy = Math.cos(angles[2] * 0.5);
          var sy = Math.sin(angles[2] * 0.5);
          return __.FM.float_4_1_1_1_1(
            __.sub(sr * cp * cy, cr * sp * sy),
            __.add(cr * sp * cy, sr * cp * sy),
            __.sub(cr * cp * sy, sr * sp * cy),
            __.add(cr * cp * cy, sr * sp * sy)
          );
        };
        quat.prototype.clone = function () {
          return new quat({});
        };
        quat.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_2148_quat","fields":[]}'
          );
        };
        return quat;
      })();
      exports.quat = quat;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_2148_quat","fields":[]}'
        ),
        quat
      ); /* impl quat */
      window.shadeupQuat = quat;
      var Camera2d = /** @class */ (function () {
        function Camera2d(data) {
          var _a, _b;
          this.position =
            (_a = data.position) !== null && _a !== void 0
              ? _a
              : __.FM.float_2_1_1(__.int(0), __.int(0));
          this.zoom = (_b = data.zoom) !== null && _b !== void 0 ? _b : 1 | 0;
        }
        Camera2d.prototype.transform = function (position) {
          var _a, _b, _c, _d;
          var shader_self_temp = this;
          return (
            (_a =
              ((_c = position),
              (_d = this.position),
              [_c[0] - _d[0], _c[1] - _d[1]])),
            (_b = this.zoom),
            [_a[0] * _b, _a[1] * _b]
          );
        };
        /**
         * Moves and zooms the camera to fit the given size. (centers the camera in the viewport)
         */
        Camera2d.prototype.fit = function (size) {
          var _a, _b, _c, _d, _e, _f;
          var shader_self_temp = this;
          var zoom =
            (1 | 0) /
            (0, std_math_1.min)(
              env.screenSize[0] / size[0],
              env.screenSize[1] / size[1]
            );
          var position =
            ((_a =
              ((_c = env.screenSize),
              (_d =
                ((_e = size), (_f = (1 | 0) / zoom), [_e[0] * _f, _e[1] * _f])),
              [_c[0] - _d[0], _c[1] - _d[1]])),
            (_b = 2 | 0),
            [_a[0] / _b, _a[1] / _b]);
          this.position = position;
          this.zoom = zoom;
        };
        Camera2d.prototype.clone = function () {
          return new Camera2d({
            position: (0, std___std_all_1.__deepClone)(this.position),
            zoom: (0, std___std_all_1.__deepClone)(this.zoom),
          });
        };
        Camera2d.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_9656_Camera2d","fields":[["position",{"type":"primitive","name":"float2"}],["zoom",{"type":"primitive","name":"float"}]]}'
          );
        };
        return Camera2d;
      })();
      exports.Camera2d = Camera2d;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_9656_Camera2d","fields":[["position",{"type":"primitive","name":"float2"}],["zoom",{"type":"primitive","name":"float"}]]}'
        ),
        Camera2d
      ); /* impl Camera2d */
      var Camera = /** @class */ (function () {
        function Camera(data) {
          var _a, _b, _c, _d, _e, _f, _g;
          this.position =
            (_a = data.position) !== null && _a !== void 0
              ? _a
              : __.FM.float_3_1_1_1(__.int(0), __.int(0), __.int(0));
          this.rotation =
            (_b = data.rotation) !== null && _b !== void 0
              ? _b
              : __.FM.float_4_1_1_1_1(
                  __.int(1),
                  __.int(0),
                  __.int(0),
                  __.int(0)
                );
          this.width =
            (_c = data.width) !== null && _c !== void 0 ? _c : 1920 | 0;
          this.height =
            (_d = data.height) !== null && _d !== void 0 ? _d : 1080 | 0;
          this.fov = (_e = data.fov) !== null && _e !== void 0 ? _e : 90 | 0;
          this.near = (_f = data.near) !== null && _f !== void 0 ? _f : 1 | 0;
          this.far =
            (_g = data.far) !== null && _g !== void 0 ? _g : 100000 | 0;
        }
        Camera.prototype.getRay = function (screen) {
          var shader_self_temp = this;
          var aspect = this.width / this.height;
          var x = screen[0];
          var y = screen[1];
          var Px =
            ((2 | 0) * ((x + 0.5) / this.width) - (1 | 0)) *
            Math.tan(((this.fov / (2 | 0)) * PI) / (180 | 0)) *
            aspect;
          var Py =
            ((1 | 0) - (2 | 0) * ((y + 0.5) / this.height)) *
            Math.tan(((this.fov / (2 | 0)) * PI) / (180 | 0));
          return quat.rotate(
            this.rotation,
            (0, std_math_1.normalize)(
              __.makeVector(Px, Py, __.FM.negate_1(1 | 0))
            )
          );
        };
        Camera.prototype.getTransformToViewMatrix = function (
          position,
          scale,
          rotation
        ) {
          var shader_self_temp = this;
          var rotationMatrix = quat.toMatrix(rotation);
          var translationMatrix = __.float4x4(
            scale[0],
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            scale[1],
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            scale[2],
            0 | 0,
            position[0],
            position[1],
            position[2],
            1 | 0
          );
          return __.mul(
            __.mul(
              __.mul(this.getPerspectiveMatrix(), this.getWorldToViewMatrix()),
              translationMatrix
            ),
            rotationMatrix
          );
        };
        Camera.prototype.getCombinedMatrix = function () {
          var shader_self_temp = this;
          return __.mul(
            this.getPerspectiveMatrix(),
            this.getWorldToViewMatrix()
          );
        };
        Camera.prototype.getCombinedMatrixReverseZ = function () {
          var shader_self_temp = this;
          return __.mul(
            this.getPerspectiveMatrixReverseZ(),
            this.getWorldToViewMatrix()
          );
        };
        Camera.prototype.getWorldToViewMatrix = function () {
          var shader_self_temp = this;
          var rotationMatrix = quat.toMatrix(this.rotation);
          var translationMatrix = __.float4x4(
            1 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            1 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            1 | 0,
            0 | 0,
            this.position[0],
            this.position[1],
            this.position[2],
            1 | 0
          );
          return (0, std_math_1.inverse)(
            __.mul(translationMatrix, rotationMatrix)
          );
        };
        Camera.prototype.getPerspectiveMatrixReverseZ = function () {
          var shader_self_temp = this;
          return matrix.perspectiveReverseZ(
            this.fov,
            this.width / this.height,
            this.near
          );
        };
        Camera.prototype.getPerspectiveMatrix = function () {
          var shader_self_temp = this;
          return matrix.perspective(
            this.fov,
            this.width / this.height,
            this.near,
            this.far
          ); // // let matrix = float4x4();
          // let far = self.far;
          // let near = self.near;
          // let aspect = self.width / self.height;
          // let fovRad = radians(self.fov);
          // let tanFov = tan( fovRad * 0.5 );
          // // matrix[0][0] = ;
          // // matrix[1][1] = 1.0 / tanFov;
          // // matrix[2][2] = -((far + near)/(far - near));
          // // matrix[3][2] = -((2*(near*far))/(far - near));
          // // matrix[2][3] = -1;
          // // matrix[3][3] = 0;
          // let matrix = float4x4(
          //     1.0 / (tanFov * aspect), 0, 0, 0,
          //     0, 1.0 / tanFov, 0, 0,
          //     0, 0, -((far + near)/(far - near)), -1,
          //     0, 0, -((2*(near*far))/(far - near)), 0
          // );
          // return matrix;
        };
        Camera.prototype.getOrthographicMatrix = function () {
          var shader_self_temp = this;
          var matrix = __.float4x4();
          var far = this.far;
          var near = this.near;
          var w = 1.0 / this.width;
          var h = 1.0 / this.height;
          matrix.__index(0 | 0).__index_assign(0 | 0, w);
          matrix.__index(1 | 0).__index_assign(1 | 0, h);
          matrix
            .__index(2 | 0)
            .__index_assign(2 | 0, __.FM.negate_1(2.0 / (far - near)));
          matrix
            .__index(2 | 0)
            .__index_assign(3 | 0, (far + near) / (far - near));
          //matrix[2][2] = -((far + near)/(far - near));
          //matrix[3][2] = -((2*(near*far))/(far - near));
          matrix.__index(3 | 0).__index_assign(3 | 0, 1.0);
          return matrix;
        };
        Camera.prototype.clone = function () {
          return new Camera({
            position: (0, std___std_all_1.__deepClone)(this.position),
            rotation: (0, std___std_all_1.__deepClone)(this.rotation),
            width: (0, std___std_all_1.__deepClone)(this.width),
            height: (0, std___std_all_1.__deepClone)(this.height),
            fov: (0, std___std_all_1.__deepClone)(this.fov),
            near: (0, std___std_all_1.__deepClone)(this.near),
            far: (0, std___std_all_1.__deepClone)(this.far),
          });
        };
        Camera.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_10663_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}'
          );
        };
        return Camera;
      })();
      exports.Camera = Camera;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_10663_Camera","fields":[["position",{"type":"primitive","name":"float3"}],["rotation",{"type":"primitive","name":"float4"}],["width",{"type":"primitive","name":"float"}],["height",{"type":"primitive","name":"float"}],["fov",{"type":"primitive","name":"float"}],["near",{"type":"primitive","name":"float"}],["far",{"type":"primitive","name":"float"}]]}'
        ),
        Camera
      ); /* impl Camera */
      window._makeCamera = Camera;
      window._makeCamera2d = Camera2d;
      function easeA(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
      }
      function easeB(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
      }
      function easeC(aA1) {
        return 3.0 * aA1;
      }
      function calcBezier(aT, aA1, aA2) {
        return (
          ((easeA(aA1, aA2) * aT + easeB(aA1, aA2)) * aT + easeC(aA1)) * aT
        );
      }
      function getSlope(aT, aA1, aA2) {
        return (
          3.0 * easeA(aA1, aA2) * aT * aT +
          2.0 * easeB(aA1, aA2) * aT +
          easeC(aA1)
        );
      }
      // fn getTForX(aX: float, aA1: float, aA2: float) -> float {
      //     let aGuessT = aX;
      //     for (let i = 0; i <= 10; i++) {
      //         let currentSlope = bezSlope(aGuessT, aA1, aA2);
      //         if (currentSlope == 0.0) {
      //             return aGuessT;
      //         }
      //         let currentX = calcBezier(aGuessT, aA1, aA2) - aX;
      //         aGuessT -= currentX / currentSlope;
      //     }
      //     return aGuessT;
      // }
      var NEWTON_ITERATIONS =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "NEWTON_ITERATIONS",
          function () {
            return 4 | 0;
          },
          function () {
            return NEWTON_ITERATIONS;
          }
        ) | 0;
      var NEWTON_MIN_SLOPE = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "NEWTON_MIN_SLOPE",
        function () {
          return 0.02;
        },
        function () {
          return NEWTON_MIN_SLOPE;
        }
      );
      var SUBDIVISION_PRECISION = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "SUBDIVISION_PRECISION",
        function () {
          return 0.0000001;
        },
        function () {
          return SUBDIVISION_PRECISION;
        }
      );
      var SUBDIVISION_MAX_ITERATIONS =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "SUBDIVISION_MAX_ITERATIONS",
          function () {
            return 10 | 0;
          },
          function () {
            return SUBDIVISION_MAX_ITERATIONS;
          }
        ) | 0;
      var kSplineTableSize =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "kSplineTableSize",
          function () {
            return 11 | 0;
          },
          function () {
            return kSplineTableSize;
          }
        ) | 0;
      var kSampleStepSize = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "kSampleStepSize",
        function () {
          return 1.0 / __.sub(kSplineTableSize, 1 | 0);
        },
        function () {
          return kSampleStepSize;
        }
      );
      function getTForX(aX, mX1, mX2) {
        var mSampleValues = (0, std___std_all_1.array)(11 | 0, 0 | 0);
        for (var i = 0 | 0; i < kSplineTableSize; i++) {
          mSampleValues.__index_assign(
            i,
            calcBezier(i * kSampleStepSize, mX1, mX2)
          );
        } // Find interval where t lies
        var intervalStart = 0.0;
        var currentSample = 1 | 0;
        var lastSample = kSplineTableSize - (1 | 0);
        for (
          var dummy = 0 | 0;
          __.and(
            currentSample != lastSample,
            mSampleValues[currentSample] <= aX
          );
          currentSample++
        ) {
          intervalStart = intervalStart + kSampleStepSize;
        }
        currentSample--;
        // t now lies between *currentSample and *currentSample+1
        // Interpolate to provide an initial guess for t
        var csamp = mSampleValues[currentSample];
        var dst =
          (aX - csamp) / (mSampleValues[currentSample + (1 | 0)] - csamp);
        var guessForT = intervalStart + dst * kSampleStepSize;
        // Check the slope to see what strategy to use. If the slope is too small
        // Newton-Raphson iteration won't converge on a root so we use bisection
        // instead.
        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope == 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(
            aX,
            intervalStart,
            intervalStart + kSampleStepSize
          );
        }
      }
      function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (var i = 0 | 0; i < NEWTON_ITERATIONS; i++) {
          // We're trying to find where f(t) = aX,
          // so we're actually looking for a root for: CalcBezier(t) - aX
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          var currentSlope = getSlope(aGuessT, mX1, mX2);
          if (currentSlope == 0.0) return aGuessT;
          aGuessT = aGuessT - currentX / currentSlope;
        }
        return aGuessT;
      }
      function binarySubdivide(aX, aA, aB) {
        var currentX = 0.0;
        var currentT = 0.0;
        var i = 0 | 0;
        while (true) {
          i++;
          if (
            __.and(
              Math.abs(currentX) > SUBDIVISION_PRECISION,
              i < SUBDIVISION_MAX_ITERATIONS
            )
          ) {
            currentT = aA + (aB - aA) / 2.0;
            currentX = __.sub(CalcBezier(currentT, mX1, mX2), aX);
            if (currentX > 0.0) {
              aB = currentT;
            } else {
              aA = currentT;
            }
          } else {
            break;
          }
        }
        return currentT;
      }
      var bezier = /** @class */ (function () {
        function bezier(data) {}
        bezier.cubic2 = function (a, b, c, d, t) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
          return (
            (_a =
              ((_c =
                ((_e =
                  ((_g = __.pow(1.0 - t, 3 | 0)),
                  (_h = a),
                  [_g * _h[0], _g * _h[1]])),
                (_f =
                  ((_j = 3.0 * __.pow(1.0 - t, 2 | 0) * t),
                  (_k = b),
                  [_j * _k[0], _j * _k[1]])),
                [_e[0] + _f[0], _e[1] + _f[1]])),
              (_d =
                ((_l = 3.0 * (1.0 - t) * __.pow(t, 2 | 0)),
                (_m = c),
                [_l * _m[0], _l * _m[1]])),
              [_c[0] + _d[0], _c[1] + _d[1]])),
            (_b =
              ((_o = __.pow(t, 3 | 0)), (_p = d), [_o * _p[0], _o * _p[1]])),
            [_a[0] + _b[0], _a[1] + _b[1]]
          );
        };
        bezier.cubic3 = function (a, b, c, d, t) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
          return (
            (_a =
              ((_c =
                ((_e =
                  ((_g = __.pow(1.0 - t, 3 | 0)),
                  (_h = a),
                  [_g * _h[0], _g * _h[1], _g * _h[2]])),
                (_f =
                  ((_j = 3.0 * __.pow(1.0 - t, 2 | 0) * t),
                  (_k = b),
                  [_j * _k[0], _j * _k[1], _j * _k[2]])),
                [_e[0] + _f[0], _e[1] + _f[1], _e[2] + _f[2]])),
              (_d =
                ((_l = 3.0 * (1.0 - t) * __.pow(t, 2 | 0)),
                (_m = c),
                [_l * _m[0], _l * _m[1], _l * _m[2]])),
              [_c[0] + _d[0], _c[1] + _d[1], _c[2] + _d[2]])),
            (_b =
              ((_o = __.pow(t, 3 | 0)),
              (_p = d),
              [_o * _p[0], _o * _p[1], _o * _p[2]])),
            [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2]]
          );
        };
        bezier.quadratic2 = function (a, b, c, t) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
          return (
            (_a =
              ((_c =
                ((_e = __.pow(1.0 - t, 2 | 0)),
                (_f = a),
                [_e * _f[0], _e * _f[1]])),
              (_d =
                ((_g = 2.0 * (1.0 - t) * t),
                (_h = b),
                [_g * _h[0], _g * _h[1]])),
              [_c[0] + _d[0], _c[1] + _d[1]])),
            (_b =
              ((_j = __.pow(t, 2 | 0)), (_k = c), [_j * _k[0], _j * _k[1]])),
            [_a[0] + _b[0], _a[1] + _b[1]]
          );
        };
        bezier.quadratic3 = function (a, b, c, t) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
          return (
            (_a =
              ((_c =
                ((_e = __.pow(1.0 - t, 2 | 0)),
                (_f = a),
                [_e * _f[0], _e * _f[1], _e * _f[2]])),
              (_d =
                ((_g = 2.0 * (1.0 - t) * t),
                (_h = b),
                [_g * _h[0], _g * _h[1], _g * _h[2]])),
              [_c[0] + _d[0], _c[1] + _d[1], _c[2] + _d[2]])),
            (_b =
              ((_j = __.pow(t, 2 | 0)),
              (_k = c),
              [_j * _k[0], _j * _k[1], _j * _k[2]])),
            [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2]]
          );
        };
        /**
         * 3d triangle patch evaulation with barycentric coordinates.
         */
        bezier.patch = function (a, ab, b, bc, c, ca, barycentricT) {
          return (
            (__.mul(__.f(1, c), __.mul(s, s) | 0) | 0) +
            (__.mul(__.mul(__.f(2, bc), s) | 0, t) | 0) +
            (__.mul(__.mul(__.f(2, ca), s) | 0, u) | 0) +
            (__.mul(__.f(1, b), __.mul(t, t) | 0) | 0) +
            (__.mul(__.mul(__.f(2, ab), t) | 0, u) | 0) +
            (__.mul(__.f(1, a), __.mul(u, u) | 0) | 0)
          );
        };
        bezier.easing = function (controlA, controlB, t) {
          return calcBezier(
            getTForX(t, controlA[0], controlB[0]),
            controlA[1],
            controlB[1]
          );
        };
        bezier.prototype.clone = function () {
          return new bezier({});
        };
        bezier.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_20330_bezier","fields":[]}'
          );
        };
        return bezier;
      })();
      exports.bezier = bezier;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_20330_bezier","fields":[]}'
        ),
        bezier
      ); /* impl bezier */
      /**
       * Provides space related utilities like z-order curves and quadtrees.
       */
      var spatial = /** @class */ (function () {
        function spatial(data) {}
        spatial.cantorPair = function (v) {
          return ((v[0] + v[1]) * (v[0] + v[1] + (1 | 0))) / (2 | 0) + v[1];
        };
        spatial.cantorUnpair = function (v) {
          var w = Math.floor((Math.sqrt(8.0 * v + 1.0) - 1.0) / 2.0);
          var t = (w * w + w) / 2.0;
          var y = v - t;
          var x = w - y;
          return __.FM.int_2_1_1(x, y);
        };
        spatial.hilbertRotate = function (n, b, r) {
          var x = b[0];
          var y = b[1];
          if (r[1] == (0 | 0)) {
            if (r[0] == (1 | 0)) {
              x = n - (1 | 0) - x;
              y = n - (1 | 0) - y;
            }
            var t = x;
            x = y;
            y = t;
          }
          return __.FM.int_2_1_1(x, y);
        };
        spatial.hilbertUncurve = function (n, v) {
          var x = v[0];
          var y = v[1];
          var rx = 0 | 0;
          var ry = 0 | 0;
          var s = 0 | 0;
          var d = 0 | 0;
          for (s = n / (2 | 0); s > (0 | 0); s = s / (2 | 0)) {
            rx = (x & s) > (0 | 0) ? 1 | 0 : 0 | 0;
            ry = (y & s) > (0 | 0) ? 1 | 0 : 0 | 0;
            d = d + s * s * (((3 | 0) * rx) ^ ry);
            var o = __.intifyVector(
              spatial.hilbertRotate(
                n,
                __.intifyVector(__.makeVector(x, y)),
                __.intifyVector(__.makeVector(rx, ry))
              )
            );
            x = o[0];
            y = o[1];
          }
          return d;
        };
        spatial.hilbertCurve = function (n, v) {
          var rx = 0 | 0;
          var ry = 0 | 0;
          var t = v;
          var x = 0 | 0;
          var y = 0 | 0;
          for (var s = 1 | 0; s < n; s = s * (2 | 0)) {
            rx = (1 | 0) & (t / (2 | 0));
            ry = (1 | 0) & (t ^ rx);
            var o = __.intifyVector(
              spatial.hilbertRotate(
                s,
                __.intifyVector(__.makeVector(x, y)),
                __.intifyVector(__.makeVector(rx, ry))
              )
            );
            x = o[0];
            y = o[1];
            x = x + s * rx;
            y = y + s * ry;
            t = t / (4 | 0);
          }
          return __.FM.int_2_1_1(x, y);
        };
        spatial.mortonDecode = function (p) {
          return __.FM.uint_2_1_1(
            reverseMortonCode2(p),
            reverseMortonCode2(p >> (1 >>> 0))
          );
        };
        spatial.mortonEncode = function (p) {
          return (
            __.bitor(mortonCode2(p[0]), mortonCode2(p[1]) << (1 >>> 0)) >>> 0
          );
        };
        spatial.prototype.clone = function () {
          return new spatial({});
        };
        spatial.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_22749_spatial","fields":[]}'
          );
        };
        return spatial;
      })();
      exports.spatial = spatial;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_22749_spatial","fields":[]}'
        ),
        spatial
      ); /* impl spatial */
      function mortonCode2(x) {
        x = x & (0x0000ffff >>> 0);
        x = __.bitxor(x, x << (8 | 0)) & (0x00ff00ff >>> 0);
        x = __.bitxor(x, x << (4 | 0)) & (0x0f0f0f0f >>> 0);
        x = __.bitxor(x, x << (2 | 0)) & (0x33333333 >>> 0);
        x = __.bitxor(x, x << (1 | 0)) & (0x55555555 >>> 0);
        return x;
      }
      exports.mortonCode2 = mortonCode2;
      function randColor(seed) {
        return __.FM.float_4_1_1_1_1(
          (0, std_math_1.rand2)(__.makeVector(seed, 5 | 0)),
          (0, std_math_1.rand2)(__.makeVector(seed, 1 | 0)),
          (0, std_math_1.rand2)(__.makeVector(seed, 4 | 0)),
          __.int(1)
        );
      }
      exports.randColor = randColor;
      function randColor2(seed) {
        return __.FM.float_4_1_1_1_1(
          (0, std_math_1.rand3)(__.makeVector(seed, 5 | 0)),
          (0, std_math_1.rand3)(__.makeVector(seed, 1 | 0)),
          (0, std_math_1.rand3)(__.makeVector(seed, 4 | 0)),
          __.int(1)
        );
      }
      exports.randColor2 = randColor2;
      function reverseMortonCode2(x) {
        x = x & (0x55555555 >>> 0);
        x = __.bitxor(x, x >> (1 | 0)) & (0x33333333 >>> 0);
        x = __.bitxor(x, x >> (2 | 0)) & (0x0f0f0f0f >>> 0);
        x = __.bitxor(x, x >> (4 | 0)) & (0x00ff00ff >>> 0);
        x = __.bitxor(x, x >> (8 | 0)) & (0x0000ffff >>> 0);
        return x;
      }
      exports.reverseMortonCode2 = reverseMortonCode2;
      var noise = /** @class */ (function () {
        function noise(data) {}
        noise.gaussian3 = function (v) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z,
            _0,
            _1,
            _2,
            _3,
            _4,
            _5,
            _6,
            _7,
            _8,
            _9,
            _10,
            _11,
            _12,
            _13,
            _14,
            _15,
            _16,
            _17;
          var p = v;
          var a =
            ((_a = p),
            [Math.floor(_a[0]), Math.floor(_a[1]), Math.floor(_a[2])]);
          var d =
            ((_b = p), (_c = a), [_b[0] - _c[0], _b[1] - _c[1], _b[2] - _c[2]]);
          d =
            ((_d =
              ((_f = d),
              (_g = d),
              [_f[0] * _g[0], _f[1] * _g[1], _f[2] * _g[2]])),
            (_e =
              ((_h = 3.0),
              (_j =
                ((_k = 2.0), (_l = d), [_k * _l[0], _k * _l[1], _k * _l[2]])),
              [_h - _j[0], _h - _j[1], _h - _j[2]])),
            [_d[0] * _e[0], _d[1] * _e[1], _d[2] * _e[2]]);
          var b =
            ((_m = ((_p = a), [_p[0], _p[0], _p[1], _p[1]])),
            (_o = __.FM.float_4_1_1_1_1(
              __.float(0.0),
              __.float(1.0),
              __.float(0.0),
              __.float(1.0)
            )),
            [_m[0] + _o[0], _m[1] + _o[1], _m[2] + _o[2], _m[3] + _o[3]]);
          var k1 = perm(((_q = b), [_q[0], _q[1], _q[0], _q[1]]));
          var k2 = perm(
            ((_r = ((_t = k1), [_t[0], _t[1], _t[0], _t[1]])),
            (_s = ((_u = b), [_u[2], _u[2], _u[3], _u[3]])),
            [_r[0] + _s[0], _r[1] + _s[1], _r[2] + _s[2], _r[3] + _s[3]])
          );
          var c =
            ((_v = k2),
            (_w = ((_x = a), [_x[2], _x[2], _x[2], _x[2]])),
            [_v[0] + _w[0], _v[1] + _w[1], _v[2] + _w[2], _v[3] + _w[3]]);
          var k3 = perm(c);
          var k4 = perm(
            ((_y = c),
            (_z = 1.0),
            [_y[0] + _z, _y[1] + _z, _y[2] + _z, _y[3] + _z])
          );
          var o1 = (0, std_math_1.frac)(
            ((_0 = k3),
            (_1 = 1.0 / 41.0),
            [_0[0] * _1, _0[1] * _1, _0[2] * _1, _0[3] * _1])
          );
          var o2 = (0, std_math_1.frac)(
            ((_2 = k4),
            (_3 = 1.0 / 41.0),
            [_2[0] * _3, _2[1] * _3, _2[2] * _3, _2[3] * _3])
          );
          var o3 =
            ((_4 =
              ((_6 = o2),
              (_7 = d[2]),
              [_6[0] * _7, _6[1] * _7, _6[2] * _7, _6[3] * _7])),
            (_5 =
              ((_8 = o1),
              (_9 = 1.0 - d[2]),
              [_8[0] * _9, _8[1] * _9, _8[2] * _9, _8[3] * _9])),
            [_4[0] + _5[0], _4[1] + _5[1], _4[2] + _5[2], _4[3] + _5[3]]);
          var o4 =
            ((_10 =
              ((_12 = ((_14 = o3), [_14[1], _14[3]])),
              (_13 = d[0]),
              [_12[0] * _13, _12[1] * _13])),
            (_11 =
              ((_15 = ((_17 = o3), [_17[0], _17[2]])),
              (_16 = 1.0 - d[0]),
              [_15[0] * _16, _15[1] * _16])),
            [_10[0] + _11[0], _10[1] + _11[1]]);
          return o4[1] * d[1] + o4[0] * (1.0 - d[1]);
        };
        noise.gaussian2 = function (v) {
          return noise.gaussian3(__.makeVector(v, 0 | 0));
        };
        noise.noise1 = function (x) {
          var i = Math.floor(x);
          var f = (0, std_math_1.frac)(x);
          var u = f * f * (3.0 - 2.0 * f);
          return (0, std_math_1.lerp)(hash(i), hash(i + 1.0), u);
        };
        noise.noise2 = function (x) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
          var i = ((_a = x), [Math.floor(_a[0]), Math.floor(_a[1])]);
          var f = (0, std_math_1.frac)(x);
          // Four corners in 2D of a tile
          var a = hash2(i);
          var b = hash2(
            ((_b = i),
            (_c = __.FM.float_2_1_1(__.float(1.0), __.float(0.0))),
            [_b[0] + _c[0], _b[1] + _c[1]])
          );
          var c = hash2(
            ((_d = i),
            (_e = __.FM.float_2_1_1(__.float(0.0), __.float(1.0))),
            [_d[0] + _e[0], _d[1] + _e[1]])
          );
          var d = hash2(
            ((_f = i),
            (_g = __.FM.float_2_1_1(__.float(1.0), __.float(1.0))),
            [_f[0] + _g[0], _f[1] + _g[1]])
          );
          // Simple 2D lerp using smoothstep envelope between the values.
          // return float3(lerp(lerp(a, b, smoothstep(0.0, 1.0, f.x)),
          //			lerp(c, d, smoothstep(0.0, 1.0, f.x)),
          //			smoothstep(0.0, 1.0, f.y)));
          // Same code, with the clamps in smoothstep and common subexpressions
          // optimized away.
          var u =
            ((_h = ((_k = f), (_l = f), [_k[0] * _l[0], _k[1] * _l[1]])),
            (_j =
              ((_m = 3.0),
              (_o = ((_p = 2.0), (_q = f), [_p * _q[0], _p * _q[1]])),
              [_m - _o[0], _m - _o[1]])),
            [_h[0] * _j[0], _h[1] * _j[1]]);
          return (
            (0, std_math_1.lerp)(a, b, u[0]) +
            (c - a) * u[1] * (1.0 - u[0]) +
            (d - b) * u[0] * u[1]
          );
        };
        noise.fmb1 = function (x) {
          var v = 0.0;
          var a = 0.5;
          var shift = __.int(100);
          for (var i = 0 | 0; i < (5 | 0); i++) {
            v = v + a * noise.noise1(x);
            x = x * 2.0 + shift;
            a = a * 0.5;
          }
          return v;
        };
        noise.fbm2 = function (x) {
          var _a, _b, _c, _d;
          var v = 0.0;
          var a = 0.5;
          var shift = __.FM.float_2_2(__.swizzle(100 | 0, "xy"));
          // Rotate to reduce axial bias
          var rot = __.float2x2(
            Math.cos(0.5),
            Math.sin(0.5),
            __.FM.negate_1(Math.sin(0.5)),
            Math.cos(0.5)
          );
          for (var i = 0 | 0; i < (5 | 0); i++) {
            v = v + a * noise.noise2(x);
            x =
              ((_a =
                ((_c = __.mul(rot, x)), (_d = 2.0), [_c[0] * _d, _c[1] * _d])),
              (_b = shift),
              [_a[0] + _b[0], _a[1] + _b[1]]);
            a = a * 0.5;
          }
          return v;
        };
        noise.fbm3 = function (x) {
          var _a, _b, _c, _d;
          var v = 0.0;
          var a = 0.5;
          var shift = __.FM.float_3_3(__.swizzle(100 | 0, "xyz"));
          for (var i = 0 | 0; i < (5 | 0); i++) {
            v = v + a * noise.noise3(x);
            x =
              ((_a =
                ((_c = x), (_d = 2.0), [_c[0] * _d, _c[1] * _d, _c[2] * _d])),
              (_b = shift),
              [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2]]);
            a = a * 0.5;
          }
          return v;
        };
        noise.noise3 = function (x) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j;
          var step = __.FM.float_3_1_1_1(__.int(110), __.int(241), __.int(171));
          var i =
            ((_a = x),
            [Math.floor(_a[0]), Math.floor(_a[1]), Math.floor(_a[2])]);
          var f = (0, std_math_1.frac)(x);
          // For performance, compute the base input to a 1D hash from the integer part of the argument and the
          // incremental change to the 1D based on the 3D -> 1D wrapping
          var n = (0, std_math_1.dot)(i, step);
          var u =
            ((_b =
              ((_d = f),
              (_e = f),
              [_d[0] * _e[0], _d[1] * _e[1], _d[2] * _e[2]])),
            (_c =
              ((_f = 3.0),
              (_g =
                ((_h = 2.0), (_j = f), [_h * _j[0], _h * _j[1], _h * _j[2]])),
              [_f - _g[0], _f - _g[1], _f - _g[2]])),
            [_b[0] * _c[0], _b[1] * _c[1], _b[2] * _c[2]]);
          return (0, std_math_1.lerp)(
            (0, std_math_1.lerp)(
              (0, std_math_1.lerp)(
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(0), __.int(0), __.int(0))
                    )
                ),
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(1), __.int(0), __.int(0))
                    )
                ),
                u[0]
              ),
              (0, std_math_1.lerp)(
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(0), __.int(1), __.int(0))
                    )
                ),
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(1), __.int(1), __.int(0))
                    )
                ),
                u[0]
              ),
              u[1]
            ),
            (0, std_math_1.lerp)(
              (0, std_math_1.lerp)(
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(0), __.int(0), __.int(1))
                    )
                ),
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(1), __.int(0), __.int(1))
                    )
                ),
                u[0]
              ),
              (0, std_math_1.lerp)(
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(0), __.int(1), __.int(1))
                    )
                ),
                hash(
                  n +
                    (0, std_math_1.dot)(
                      step,
                      __.FM.float_3_1_1_1(__.int(1), __.int(1), __.int(1))
                    )
                ),
                u[0]
              ),
              u[1]
            ),
            u[2]
          );
        };
        noise.simplex2 = function (v) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z,
            _0,
            _1,
            _2,
            _3,
            _4,
            _5,
            _6,
            _7,
            _8,
            _9,
            _10,
            _11,
            _12,
            _13,
            _14,
            _15,
            _16,
            _17,
            _18,
            _19,
            _20,
            _21,
            _22,
            _23,
            _24,
            _25,
            _26,
            _27,
            _28;
          var C = __.FM.float_4_1_1_1_1(
            __.float(0.211324865405187),
            __.float(0.366025403784439),
            __.negate(0.577350269189626),
            __.float(0.024390243902439)
          );
          var i =
            ((_a =
              ((_b = v),
              (_c = (0, std_math_1.dot)(v, ((_d = C), [_d[1], _d[1]]))),
              [_b[0] + _c, _b[1] + _c])),
            [Math.floor(_a[0]), Math.floor(_a[1])]);
          var x0 =
            ((_e = ((_g = v), (_h = i), [_g[0] - _h[0], _g[1] - _h[1]])),
            (_f = (0, std_math_1.dot)(i, ((_j = C), [_j[0], _j[0]]))),
            [_e[0] + _f, _e[1] + _f]);
          var xv = (0, std_math_1.step)(x0[1], x0[0]);
          var i1 = __.FM.float_2_1_1(xv, __.sub(1.0, xv));
          var x1 =
            ((_k =
              ((_m = x0),
              (_o = ((_p = C), [_p[0], _p[0]])),
              [_m[0] + _o[0], _m[1] + _o[1]])),
            (_l = i1),
            [_k[0] - _l[0], _k[1] - _l[1]]);
          var x2 =
            ((_q = x0),
            (_r = ((_s = C), [_s[2], _s[2]])),
            [_q[0] + _r[0], _q[1] + _r[1]]);
          i = mod289_2(i);
          var p = permute(
            ((_t =
              ((_v = permute(
                ((_x = __.FM.float_3_1_1_1(
                  __.float(0.0),
                  __.swizzle(i1, "y"),
                  __.float(1.0)
                )),
                (_y = i[1]),
                [_x[0] + _y, _x[1] + _y, _x[2] + _y])
              )),
              (_w = __.FM.float_3_1_1_1(
                __.float(0.0),
                __.swizzle(i1, "x"),
                __.float(1.0)
              )),
              [_v[0] + _w[0], _v[1] + _w[1], _v[2] + _w[2]])),
            (_u = i[0]),
            [_t[0] + _u, _t[1] + _u, _t[2] + _u])
          );
          var m = (0, std_math_1.max)(
            ((_z = ((_1 = 0.5), [_1, _1, _1])),
            (_0 = __.FM.float_3_1_1_1(
              (0, std_math_1.dot)(x0, x0),
              (0, std_math_1.dot)(x1, x1),
              (0, std_math_1.dot)(x2, x2)
            )),
            [_z[0] - _0[0], _z[1] - _0[1], _z[2] - _0[2]]),
            0.0
          );
          m =
            ((_2 = m), (_3 = m), [_2[0] * _3[0], _2[1] * _3[1], _2[2] * _3[2]]);
          m =
            ((_4 = m), (_5 = m), [_4[0] * _5[0], _4[1] * _5[1], _4[2] * _5[2]]);
          var x =
            ((_6 =
              ((_8 = 2.0),
              (_9 = (0, std_math_1.frac)(
                ((_10 = p),
                (_11 = ((_12 = C), [_12[3], _12[3], _12[3]])),
                [_10[0] * _11[0], _10[1] * _11[1], _10[2] * _11[2]])
              )),
              [_8 * _9[0], _8 * _9[1], _8 * _9[2]])),
            (_7 = 1.0),
            [_6[0] - _7, _6[1] - _7, _6[2] - _7]);
          var h =
            ((_13 =
              ((_15 = x),
              [Math.abs(_15[0]), Math.abs(_15[1]), Math.abs(_15[2])])),
            (_14 = 0.5),
            [_13[0] - _14, _13[1] - _14, _13[2] - _14]);
          var ox =
            ((_16 =
              ((_17 = x),
              (_18 = 0.5),
              [_17[0] + _18, _17[1] + _18, _17[2] + _18])),
            [Math.floor(_16[0]), Math.floor(_16[1]), Math.floor(_16[2])]);
          var a0 =
            ((_19 = x),
            (_20 = ox),
            [_19[0] - _20[0], _19[1] - _20[1], _19[2] - _20[2]]);
          // Normalise gradients implicitly by scaling m
          m =
            ((_21 = m),
            (_22 = taylorInvSqrt(
              ((_23 =
                ((_25 = a0),
                (_26 = a0),
                [_25[0] * _26[0], _25[1] * _26[1], _25[2] * _26[2]])),
              (_24 =
                ((_27 = h),
                (_28 = h),
                [_27[0] * _28[0], _27[1] * _28[1], _27[2] * _28[2]])),
              [_23[0] + _24[0], _23[1] + _24[1], _23[2] + _24[2]])
            )),
            [_21[0] * _22[0], _21[1] * _22[1], _21[2] * _22[2]]);
          // Compute final noise value at P
          var g = __.FM.float_3_1_1_1(
            __.add(a0[0] * x0[0], h[0] * x0[1]),
            __.add(a0[1] * x1[0], h[1] * x1[1]),
            __.add(a0[2] * x2[0], h[2] * x2[1])
          );
          return 130.0 * (0, std_math_1.dot)(m, g);
        };
        noise.perlin2 = function (v) {
          var x = v[0];
          var y = v[1];
          var z = 0.0;
          if (x < (0 | 0)) {
            x = __.FM.negate_1(x);
          }
          if (y < (0 | 0)) {
            y = __.FM.negate_1(y);
          }
          if (z < (0 | 0)) {
            z = __.FM.negate_1(z);
          }
          var xi = (0, std_math_1.floor)(x) | 0;
          var yi = (0, std_math_1.floor)(y) | 0;
          var zi = (0, std_math_1.floor)(z) | 0;
          var xf = x - xi;
          var yf = y - yi;
          var zf = z - zi;
          var rxf = 0.0;
          var ryf = 0.0;
          var r = 0.0;
          var ampl = 0.5;
          var n1 = 0.0;
          var n2 = 0.0;
          var n3 = 0.0;
          for (var o = 0 | 0; o < perlin_octaves; o++) {
            var of1 = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
            rxf = scaled_cosine(xf);
            ryf = scaled_cosine(yf);
            n1 = perlin.floatArray[of1 & PERLIN_SIZE];
            n1 =
              n1 +
              rxf * (perlin.floatArray[(of1 + (1 | 0)) & PERLIN_SIZE] - n1);
            n2 = perlin.floatArray[(of1 + PERLIN_YWRAP) & PERLIN_SIZE];
            n2 =
              n2 +
              rxf *
                (perlin.floatArray[
                  (of1 + PERLIN_YWRAP + (1 | 0)) & PERLIN_SIZE
                ] -
                  n2);
            n1 = n1 + ryf * (n2 - n1);
            of1 = of1 + PERLIN_ZWRAP;
            n2 = perlin.floatArray[of1 & PERLIN_SIZE];
            n2 =
              n2 +
              rxf * (perlin.floatArray[(of1 + (1 | 0)) & PERLIN_SIZE] - n2);
            n3 = perlin.floatArray[(of1 + PERLIN_YWRAP) & PERLIN_SIZE];
            n3 =
              n3 +
              rxf *
                (perlin.floatArray[
                  (of1 + PERLIN_YWRAP + (1 | 0)) & PERLIN_SIZE
                ] -
                  n3);
            n2 = n2 + ryf * (n3 - n2);
            n1 = n1 + scaled_cosine(zf) * (n2 - n1);
            r = r + n1 * ampl;
            ampl = ampl * perlin_amp_falloff;
            xi = xi << (1 | 0);
            xf = xf * 2.0;
            yi = yi << (1 | 0);
            yf = yf * 2.0;
            zi = zi << (1 | 0);
            zf = zf * 2.0;
            if (xf >= 1.0) {
              xi++;
              xf = xf - 1.0;
            }
            if (yf >= 1.0) {
              yi++;
              yf = yf - 1.0;
            }
            if (zf >= 1.0) {
              zi++;
              zf = zf - 1.0;
            }
          }
          return r;
        };
        noise.perlin3 = function (v) {
          var x = v[0];
          var y = v[1];
          var z = v[2];
          if (x < (0 | 0)) {
            x = __.FM.negate_1(x);
          }
          if (y < (0 | 0)) {
            y = __.FM.negate_1(y);
          }
          if (z < (0 | 0)) {
            z = __.FM.negate_1(z);
          }
          var xi = (0, std_math_1.floor)(x) | 0;
          var yi = (0, std_math_1.floor)(y) | 0;
          var zi = (0, std_math_1.floor)(z) | 0;
          var xf = x - xi;
          var yf = y - yi;
          var zf = z - zi;
          var rxf = 0.0;
          var ryf = 0.0;
          var r = 0.0;
          var ampl = 0.5;
          var n1 = 0.0;
          var n2 = 0.0;
          var n3 = 0.0;
          for (var o = 0 | 0; o < perlin_octaves; o++) {
            var of1 = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
            rxf = scaled_cosine(xf);
            ryf = scaled_cosine(yf);
            n1 = perlin.floatArray[of1 & PERLIN_SIZE];
            n1 =
              n1 +
              rxf * (perlin.floatArray[(of1 + (1 | 0)) & PERLIN_SIZE] - n1);
            n2 = perlin.floatArray[(of1 + PERLIN_YWRAP) & PERLIN_SIZE];
            n2 =
              n2 +
              rxf *
                (perlin.floatArray[
                  (of1 + PERLIN_YWRAP + (1 | 0)) & PERLIN_SIZE
                ] -
                  n2);
            n1 = n1 + ryf * (n2 - n1);
            of1 = of1 + PERLIN_ZWRAP;
            n2 = perlin.floatArray[of1 & PERLIN_SIZE];
            n2 =
              n2 +
              rxf * (perlin.floatArray[(of1 + (1 | 0)) & PERLIN_SIZE] - n2);
            n3 = perlin.floatArray[(of1 + PERLIN_YWRAP) & PERLIN_SIZE];
            n3 =
              n3 +
              rxf *
                (perlin.floatArray[
                  (of1 + PERLIN_YWRAP + (1 | 0)) & PERLIN_SIZE
                ] -
                  n3);
            n2 = n2 + ryf * (n3 - n2);
            n1 = n1 + scaled_cosine(zf) * (n2 - n1);
            r = r + n1 * ampl;
            ampl = ampl * perlin_amp_falloff;
            xi = xi << (1 | 0);
            xf = xf * 2.0;
            yi = yi << (1 | 0);
            yf = yf * 2.0;
            zi = zi << (1 | 0);
            zf = zf * 2.0;
            if (xf >= 1.0) {
              xi++;
              xf = xf - 1.0;
            }
            if (yf >= 1.0) {
              yi++;
              yf = yf - 1.0;
            }
            if (zf >= 1.0) {
              zi++;
              zf = zf - 1.0;
            }
          }
          return r;
        };
        /**
         * Returns 3 values: distance to closest cell, random value of closest cell, distance to closest edge.
         */
        noise.voronoi2 = function (v) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z;
          var n = ((_a = v), [Math.floor(_a[0]), Math.floor(_a[1])]);
          var minDist = 10.0;
          var toClose = ((_b = 0.0), [_b, _b]);
          var closestCell = ((_c = 0.0), [_c, _c]);
          for (var j = __.FM.negate_1(1 | 0); j <= (1 | 0); j++) {
            for (var i = __.FM.negate_1(1 | 0); i <= (1 | 0); i++) {
              var cell =
                ((_d = n),
                (_e = __.FM.float_2_1_1(i, j)),
                [_d[0] + _e[0], _d[1] + _e[1]]);
              var cellPos =
                ((_f = cell), (_g = hash2(cell)), [_f[0] + _g, _f[1] + _g]);
              var toCell =
                ((_h = cellPos), (_j = v), [_h[0] - _j[0], _h[1] - _j[1]]);
              var dst = (0, std_math_1.length)(toCell);
              if (dst < minDist) {
                minDist = dst;
                toClose = toCell;
                closestCell = cell;
              }
            }
          }
          var minEdge = 10.0;
          for (var j = __.FM.negate_1(1 | 0); j <= (1 | 0); j++) {
            for (var i = __.FM.negate_1(1 | 0); i <= (1 | 0); i++) {
              var cell =
                ((_k = n),
                (_l = __.FM.float_2_1_1(i, j)),
                [_k[0] + _l[0], _k[1] + _l[1]]);
              var cellPos =
                ((_m = cell), (_o = hash2(cell)), [_m[0] + _o, _m[1] + _o]);
              var toCell =
                ((_p = cellPos), (_q = v), [_p[0] - _q[0], _p[1] - _q[1]]);
              var diff =
                ((_r =
                  ((_s = closestCell),
                  (_t = cell),
                  [_s[0] - _t[0], _s[1] - _t[1]])),
                [Math.abs(_r[0]), Math.abs(_r[1])]);
              var isClosest = diff[0] + diff[1] < 0.1;
              if (__.not(isClosest)) {
                var toCenter =
                  ((_u =
                    ((_w = toClose),
                    (_x = toCell),
                    [_w[0] + _x[0], _w[1] + _x[1]])),
                  (_v = 0.5),
                  [_u[0] * _v, _u[1] * _v]);
                var cellDiff = (0, std_math_1.normalize)(
                  ((_y = toCell),
                  (_z = toClose),
                  [_y[0] - _z[0], _y[1] - _z[1]])
                );
                var edge = (0, std_math_1.dot)(toCenter, cellDiff);
                minEdge = (0, std_math_1.min)(minEdge, edge);
              }
            }
          }
          var random = hash2(closestCell);
          return __.FM.float_3_1_1_1(minDist, random, minEdge);
        };
        noise.simplex3 = function (v) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z,
            _0,
            _1,
            _2,
            _3,
            _4,
            _5,
            _6,
            _7,
            _8,
            _9,
            _10,
            _11,
            _12,
            _13,
            _14,
            _15,
            _16,
            _17,
            _18,
            _19,
            _20,
            _21,
            _22,
            _23,
            _24,
            _25,
            _26,
            _27,
            _28,
            _29,
            _30,
            _31,
            _32,
            _33,
            _34,
            _35,
            _36,
            _37,
            _38,
            _39,
            _40,
            _41,
            _42,
            _43,
            _44,
            _45,
            _46,
            _47,
            _48,
            _49,
            _50,
            _51,
            _52,
            _53,
            _54,
            _55,
            _56;
          var C = __.FM.float_4_1_1_1_1(
            __.float(0.138196601125011),
            __.float(0.276393202250021),
            __.float(0.414589803375032),
            __.negate(0.447213595499958)
          );
          var i =
            ((_a =
              ((_b = v),
              (_c = (0, std_math_1.dot)(v, ((_d = C), [_d[1], _d[1], _d[1]]))),
              [_b[0] + _c, _b[1] + _c, _b[2] + _c])),
            [Math.floor(_a[0]), Math.floor(_a[1]), Math.floor(_a[2])]);
          var x0 =
            ((_e =
              ((_g = v),
              (_h = i),
              [_g[0] - _h[0], _g[1] - _h[1], _g[2] - _h[2]])),
            (_f = (0, std_math_1.dot)(i, ((_j = C), [_j[0], _j[0], _j[0]]))),
            [_e[0] + _f, _e[1] + _f, _e[2] + _f]);
          var g = (0, std_math_1.step)(
            ((_k = x0), [_k[1], _k[2], _k[0]]),
            ((_l = x0), [_l[0], _l[1], _l[2]])
          );
          var l = ((_m = 1.0), (_o = g), [_m - _o[0], _m - _o[1], _m - _o[2]]);
          var i1 = (0, std_math_1.min)(
            ((_p = g), [_p[0], _p[1], _p[2]]),
            ((_q = l), [_q[2], _q[0], _q[1]])
          );
          var i2 = (0, std_math_1.max)(
            ((_r = g), [_r[0], _r[1], _r[2]]),
            ((_s = l), [_s[2], _s[0], _s[1]])
          );
          var x1 =
            ((_t =
              ((_v = x0),
              (_w = i1),
              [_v[0] - _w[0], _v[1] - _w[1], _v[2] - _w[2]])),
            (_u =
              ((_x = 1.0),
              (_y = ((_z = C), [_z[0], _z[0], _z[0]])),
              [_x * _y[0], _x * _y[1], _x * _y[2]])),
            [_t[0] + _u[0], _t[1] + _u[1], _t[2] + _u[2]]);
          var x2 =
            ((_0 =
              ((_2 = x0),
              (_3 = i2),
              [_2[0] - _3[0], _2[1] - _3[1], _2[2] - _3[2]])),
            (_1 =
              ((_4 = 2.0),
              (_5 = ((_6 = C), [_6[0], _6[0], _6[0]])),
              [_4 * _5[0], _4 * _5[1], _4 * _5[2]])),
            [_0[0] + _1[0], _0[1] + _1[1], _0[2] + _1[2]]);
          var x3 =
            ((_7 =
              ((_9 = x0), (_10 = 1), [_9[0] - _10, _9[1] - _10, _9[2] - _10])),
            (_8 =
              ((_11 = 3.0),
              (_12 = ((_13 = C), [_13[0], _13[0], _13[0]])),
              [_11 * _12[0], _11 * _12[1], _11 * _12[2]])),
            [_7[0] + _8[0], _7[1] + _8[1], _7[2] + _8[2]]);
          i = mod289_3(i);
          var p = permute(
            ((_14 =
              ((_16 = permute(
                ((_18 =
                  ((_20 = permute(
                    ((_22 = i[2]),
                    (_23 = __.FM.float_3_1_1_1(
                      __.float(0.0),
                      __.swizzle(i1, "z"),
                      __.swizzle(i2, "z")
                    )),
                    [_22 + _23[0], _22 + _23[1], _22 + _23[2]])
                  )),
                  (_21 = i[1]),
                  [_20[0] + _21, _20[1] + _21, _20[2] + _21])),
                (_19 = __.FM.float_3_1_1_1(
                  __.float(0.0),
                  __.swizzle(i1, "y"),
                  __.swizzle(i2, "y")
                )),
                [_18[0] + _19[0], _18[1] + _19[1], _18[2] + _19[2]])
              )),
              (_17 = i[0]),
              [_16[0] + _17, _16[1] + _17, _16[2] + _17])),
            (_15 = __.FM.float_3_1_1_1(
              __.float(0.0),
              __.swizzle(i1, "x"),
              __.swizzle(i2, "x")
            )),
            [_14[0] + _15[0], _14[1] + _15[1], _14[2] + _15[2]])
          );
          var m = (0, std_math_1.max)(
            ((_24 = 0.5),
            (_25 = __.FM.float_3_1_1_1(
              (0, std_math_1.dot)(x0, x0),
              (0, std_math_1.dot)(x1, x1),
              (0, std_math_1.dot)(x2, x2)
            )),
            [_24 - _25[0], _24 - _25[1], _24 - _25[2]]),
            0.0
          );
          m =
            ((_26 = m),
            (_27 = m),
            [_26[0] * _27[0], _26[1] * _27[1], _26[2] * _27[2]]);
          m =
            ((_28 = m),
            (_29 = m),
            [_28[0] * _29[0], _28[1] * _29[1], _28[2] * _29[2]]);
          var x =
            ((_30 =
              ((_32 = 2.0),
              (_33 = (0, std_math_1.frac)(
                ((_34 = p),
                (_35 = ((_36 = C), [_36[3], _36[3], _36[3]])),
                [_34[0] * _35[0], _34[1] * _35[1], _34[2] * _35[2]])
              )),
              [_32 * _33[0], _32 * _33[1], _32 * _33[2]])),
            (_31 = 1.0),
            [_30[0] - _31, _30[1] - _31, _30[2] - _31]);
          var h =
            ((_37 =
              ((_39 = x),
              [Math.abs(_39[0]), Math.abs(_39[1]), Math.abs(_39[2])])),
            (_38 = 0.5),
            [_37[0] - _38, _37[1] - _38, _37[2] - _38]);
          var ox =
            ((_40 =
              ((_41 = x),
              (_42 = 0.5),
              [_41[0] + _42, _41[1] + _42, _41[2] + _42])),
            [Math.floor(_40[0]), Math.floor(_40[1]), Math.floor(_40[2])]);
          var a0 =
            ((_43 = x),
            (_44 = ox),
            [_43[0] - _44[0], _43[1] - _44[1], _43[2] - _44[2]]);
          // Normalise gradients implicitly by scaling m
          // Approximation of: m *= inversesqrt(a0 * a0 + h * h);
          m =
            ((_45 = m),
            (_46 =
              ((_47 = 1.79284291400159),
              (_48 =
                ((_49 = 0.85373472095314),
                (_50 =
                  ((_51 =
                    ((_53 = a0),
                    (_54 = a0),
                    [_53[0] * _54[0], _53[1] * _54[1], _53[2] * _54[2]])),
                  (_52 =
                    ((_55 = h),
                    (_56 = h),
                    [_55[0] * _56[0], _55[1] * _56[1], _55[2] * _56[2]])),
                  [_51[0] + _52[0], _51[1] + _52[1], _51[2] + _52[2]])),
                [_49 * _50[0], _49 * _50[1], _49 * _50[2]])),
              [_47 - _48[0], _47 - _48[1], _47 - _48[2]])),
            [_45[0] * _46[0], _45[1] * _46[1], _45[2] * _46[2]]);
          // Compute final noise value at P
          var g2 = __.FM.float_3_1_1_1(
            __.add(a0[0] * x0[0], h[0] * x0[1]),
            __.add(a0[1] * x1[0], h[1] * x1[1]),
            __.add(a0[2] * x2[0], h[2] * x2[1])
          );
          return 130.0 * (0, std_math_1.dot)(m, g2);
        };
        noise.prototype.clone = function () {
          return new noise({});
        };
        noise.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_26548_noise","fields":[]}'
          );
        };
        return noise;
      })();
      exports.noise = noise;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_26548_noise","fields":[]}'
        ),
        noise
      );
      var PERLIN_YWRAPB =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "PERLIN_YWRAPB",
          function () {
            return 4 | 0;
          },
          function () {
            return PERLIN_YWRAPB;
          }
        ) | 0;
      var PERLIN_YWRAP =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "PERLIN_YWRAP",
          function () {
            return (1 | 0) << PERLIN_YWRAPB;
          },
          function () {
            return PERLIN_YWRAP;
          }
        ) | 0;
      var PERLIN_ZWRAPB =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "PERLIN_ZWRAPB",
          function () {
            return 8 | 0;
          },
          function () {
            return PERLIN_ZWRAPB;
          }
        ) | 0;
      var PERLIN_ZWRAP =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "PERLIN_ZWRAP",
          function () {
            return (1 | 0) << PERLIN_ZWRAPB;
          },
          function () {
            return PERLIN_ZWRAP;
          }
        ) | 0;
      var PERLIN_SIZE =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "PERLIN_SIZE",
          function () {
            return 4095 | 0;
          },
          function () {
            return PERLIN_SIZE;
          }
        ) | 0;
      var perlin_octaves =
        (0, std___std_all_1.globalVarInit)(
          "_slash__std_slash_common_dot_ts",
          "perlin_octaves",
          function () {
            return 4 | 0;
          },
          function () {
            return perlin_octaves;
          }
        ) | 0;
      // default to medium smooth
      var perlin_amp_falloff = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "perlin_amp_falloff",
        function () {
          return 0.5;
        },
        function () {
          return perlin_amp_falloff;
        }
      );
      // 50% reduction/octave
      function scaled_cosine(i) {
        return 0.5 * (1.0 - Math.cos(i * PI));
      }
      var perlin = (0, std___std_all_1.globalVarInit)(
        "_slash__std_slash_common_dot_ts",
        "perlin",
        function () {
          return (0, buffer_1.buffer)(
            PERLIN_SIZE + (1 | 0),
            "float",
            __assign({}, JSON.parse('{"type":"primitive","name":"float"}'))
          );
        },
        function () {
          return perlin;
        }
      );
      for (var i = 0 | 0; i < PERLIN_SIZE + (1 | 0); i++) {
        perlin.__index_assign(i, (0, std_math_1.rand)(i));
      } //	<https://www.shadertoy.com/view/4dS3Wd>
      //	By Morgan McGuire @morgan3d, http://graphicscodex.com
      //
      function hash(n) {
        return (0, std_math_1.frac)(Math.sin(n) * (1e4 | 0));
      }
      function hash2(p) {
        return (0, std_math_1.frac)(
          (1e4 | 0) *
            Math.sin(17.0 * p[0] + p[1] * 0.1) *
            (0.1 + Math.abs(Math.sin(p[1] * 13.0 + p[0])))
        );
      }
      function hash3(p) {
        var h = (0, std_math_1.dot)(
          p,
          __.FM.float_3_1_1_1(__.float(127.1), __.float(311.7), __.float(74.7))
        );
        return (0, std_math_1.frac)(Math.sin(h) * 43758.5453123);
      }
      /* impl noise */
      function mod289_1(x) {
        return x - Math.floor(x * (1.0 / 289.0)) * 289.0;
      }
      function mod289_4(x) {
        var _a, _b, _c, _d, _e, _f, _g;
        return (
          (_a = x),
          (_b =
            ((_c =
              ((_e =
                ((_f = x),
                (_g = 1.0 / 289.0),
                [_f[0] * _g, _f[1] * _g, _f[2] * _g, _f[3] * _g])),
              [
                Math.floor(_e[0]),
                Math.floor(_e[1]),
                Math.floor(_e[2]),
                Math.floor(_e[3]),
              ])),
            (_d = 289.0),
            [_c[0] * _d, _c[1] * _d, _c[2] * _d, _c[3] * _d])),
          [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2], _a[3] - _b[3]]
        );
      }
      function perm(x) {
        var _a, _b, _c, _d, _e, _f;
        return mod289_4(
          ((_a =
            ((_c =
              ((_e = x),
              (_f = 34.0),
              [_e[0] * _f, _e[1] * _f, _e[2] * _f, _e[3] * _f])),
            (_d = 1.0),
            [_c[0] + _d, _c[1] + _d, _c[2] + _d, _c[3] + _d])),
          (_b = x),
          [_a[0] * _b[0], _a[1] * _b[1], _a[2] * _b[2], _a[3] * _b[3]])
        );
      }
      function mod289_3(x) {
        var _a, _b, _c, _d, _e, _f, _g;
        return (
          (_a = x),
          (_b =
            ((_c =
              ((_e =
                ((_f = x),
                (_g = 1.0 / 289.0),
                [_f[0] * _g, _f[1] * _g, _f[2] * _g])),
              [Math.floor(_e[0]), Math.floor(_e[1]), Math.floor(_e[2])])),
            (_d = 289.0),
            [_c[0] * _d, _c[1] * _d, _c[2] * _d])),
          [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]
        );
      }
      function mod289_2(x) {
        var _a, _b, _c, _d, _e, _f, _g;
        return (
          (_a = x),
          (_b =
            ((_c =
              ((_e = ((_f = x), (_g = 1.0 / 289.0), [_f[0] * _g, _f[1] * _g])),
              [Math.floor(_e[0]), Math.floor(_e[1])])),
            (_d = 289.0),
            [_c[0] * _d, _c[1] * _d])),
          [_a[0] - _b[0], _a[1] - _b[1]]
        );
      }
      function permute(x) {
        var _a, _b, _c, _d, _e, _f;
        return mod289_3(
          ((_a =
            ((_c =
              ((_e = x), (_f = 34.0), [_e[0] * _f, _e[1] * _f, _e[2] * _f])),
            (_d = 1.0),
            [_c[0] + _d, _c[1] + _d, _c[2] + _d])),
          (_b = x),
          [_a[0] * _b[0], _a[1] * _b[1], _a[2] * _b[2]])
        );
      }
      function taylorInvSqrt(r) {
        var _a, _b, _c, _d;
        return (
          (_a = 1.79284291400159),
          (_b =
            ((_c = 0.85373472095314),
            (_d = r),
            [_c * _d[0], _c * _d[1], _c * _d[2]])),
          [_a - _b[0], _a - _b[1], _a - _b[2]]
        );
      }
      var matrix = /** @class */ (function () {
        function matrix(data) {}
        matrix.lookAt = function (from, to, up) {
          var _a, _b, _c, _d;
          var zAxis = (0, std_math_1.normalize)(
            ((_a = from),
            (_b = to),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]])
          );
          var xAxis = (0, std_math_1.normalize)(
            (0, std_math_1.cross)(up, zAxis)
          );
          var yAxis = (0, std_math_1.normalize)(
            (0, std_math_1.cross)(zAxis, xAxis)
          );
          var dst = __.float4x4();
          dst.__index(0 | 0).__index_assign(0 | 0, xAxis[0]);
          dst.__index(0 | 0).__index_assign(1 | 0, yAxis[0]);
          dst.__index(0 | 0).__index_assign(2 | 0, zAxis[0]);
          dst.__index(0 | 0).__index_assign(3 | 0, 0 | 0);
          dst.__index(1 | 0).__index_assign(0 | 0, xAxis[1]);
          dst.__index(1 | 0).__index_assign(1 | 0, yAxis[1]);
          dst.__index(1 | 0).__index_assign(2 | 0, zAxis[1]);
          dst.__index(1 | 0).__index_assign(3 | 0, 0 | 0);
          dst.__index(2 | 0).__index_assign(0 | 0, xAxis[2]);
          dst.__index(2 | 0).__index_assign(1 | 0, yAxis[2]);
          dst.__index(2 | 0).__index_assign(2 | 0, zAxis[2]);
          dst.__index(2 | 0).__index_assign(3 | 0, 0 | 0);
          dst
            .__index(3 | 0)
            .__index_assign(
              0 | 0,
              __.FM.negate_1(
                xAxis[0] * from[0] + xAxis[1] * from[1] + xAxis[2] * from[2]
              )
            );
          dst
            .__index(3 | 0)
            .__index_assign(
              1 | 0,
              __.FM.negate_1(
                yAxis[0] * from[0] + yAxis[1] * from[1] + yAxis[2] * from[2]
              )
            );
          dst
            .__index(3 | 0)
            .__index_assign(
              2 | 0,
              __.FM.negate_1(
                zAxis[0] * from[0] + zAxis[1] * from[1] + zAxis[2] * from[2]
              )
            );
          dst.__index(3 | 0).__index_assign(3 | 0, 1 | 0);
          return dst;
          var forward = (0, std_math_1.normalize)(
            ((_c = from),
            (_d = to),
            [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]])
          );
          var right = (0, std_math_1.normalize)(
            (0, std_math_1.cross)(up, forward)
          );
          var newup = (0, std_math_1.cross)(forward, right);
          var m = __.float4x4();
          m.__index(0 | 0).__index_assign(0 | 0, right[0]),
            m.__index(0 | 0).__index_assign(1 | 0, right[1]),
            m.__index(0 | 0).__index_assign(2 | 0, right[2]);
          m.__index(1 | 0).__index_assign(0 | 0, newup[0]),
            m.__index(1 | 0).__index_assign(1 | 0, newup[1]),
            m.__index(1 | 0).__index_assign(2 | 0, newup[2]);
          m.__index(2 | 0).__index_assign(0 | 0, forward[0]),
            m.__index(2 | 0).__index_assign(1 | 0, forward[1]),
            m.__index(2 | 0).__index_assign(2 | 0, forward[2]);
          m.__index(3 | 0).__index_assign(0 | 0, from[0]),
            m.__index(3 | 0).__index_assign(1 | 0, from[1]),
            m.__index(3 | 0).__index_assign(2 | 0, from[2]);
          return m;
        };
        matrix.perspective = function (fov, aspect, near, far) {
          // let scale = 1.0 / tan(fov * 0.5 * PI / 180);
          // let M = float4x4();
          // M[0][0] = scale;  //scale the x coordinates of the projected point
          // M[1][1] = scale * aspect;  //scale the y coordinates of the projected point
          // M[2][2] = -far / (far - near);  //used to remap z to [0,1]
          // M[3][2] = -far * near / (far - near);  //used to remap z [0,1]
          // M[2][3] = -1;  //set w = -z
          // M[3][3] = 0;
          //return M;
          var fovRad = (0, std_math_1.radians)(fov);
          var tanFov = Math.tan(fovRad * 0.5);
          var matrx = __.float4x4(
            1.0 / (tanFov * aspect),
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            1.0 / tanFov,
            0 | 0,
            0 | 0,
            0 | 0,
            0 | 0,
            __.FM.negate_1((far + near) / (far - near)),
            __.FM.negate_1(1 | 0),
            0 | 0,
            0 | 0,
            __.FM.negate_1(((2 | 0) * (near * far)) / (far - near)),
            0 | 0
          );
          return matrx;
        };
        matrix.perspectiveReverseZ = function (fov, aspect, near) {
          // let far = 10000000.0;
          // let M = float4x4();
          // M[0][0] = scale;  //scale the x coordinates of the projected point
          // M[1][1] = scale * aspect;  //scale the y coordinates of the projected point
          // M[2][2] = (-far / (far - near)) * -1;  //used to remap z to [0,1]
          // M[3][2] = -far * near / (far - near);  //used to remap z [0,1]
          // M[2][3] = 0;  //set w = -z
          // M[3][3] = 0;
          // return M;
          var matrx = __.mul(
            __.float4x4(
              1 | 0,
              0 | 0,
              0 | 0,
              0 | 0,
              0 | 0,
              1 | 0,
              0 | 0,
              0 | 0,
              0 | 0,
              0 | 0,
              __.FM.negate_1(1 | 0),
              0 | 0,
              0 | 0,
              0 | 0,
              1 | 0,
              1 | 0
            ),
            matrix.perspective(fov, aspect, near, 10000000.0)
          );
          return matrx;
        };
        matrix.prototype.clone = function () {
          return new matrix({});
        };
        matrix.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_44319_matrix","fields":[]}'
          );
        };
        return matrix;
      })();
      exports.matrix = matrix;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_44319_matrix","fields":[]}'
        ),
        matrix
      ); /* impl matrix */
      /**
       * Uses Super Sampling Anti Aliasing to smooth out the image.
       */
      function screenAA(inScreenPos, gridSize, func) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var weightSum = 0.0;
        var accumulatedColor = __.FM.float_4_1_1_1_1(
          __.int(0),
          __.int(0),
          __.int(0),
          __.int(0)
        );
        for (var y = 0 | 0; y < gridSize; y++) {
          for (var x = 0 | 0; x < gridSize; x++) {
            var offset = __.FM.float_2_1_1(
              __.div(x + 0.5 - gridSize * 0.5, gridSize),
              __.div(y + 0.5 - gridSize * 0.5, gridSize)
            );
            var weight = Math.exp(
              __.FM.negate_1((0, std_math_1.dot)(offset, offset)) * (5 | 0)
            );
            // Gaussian weight
            accumulatedColor =
              ((_a = accumulatedColor),
              (_b =
                ((_c = func(
                  ((_e = inScreenPos),
                  (_f = offset),
                  [_e[0] + _f[0], _e[1] + _f[1]])
                )),
                (_d = weight),
                [_c[0] * _d, _c[1] * _d, _c[2] * _d, _c[3] * _d])),
              [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2], _a[3] + _b[3]]);
            weightSum = weightSum + weight;
          }
        }
        return (
          (_g = accumulatedColor),
          (_h = weightSum),
          [_g[0] / _h, _g[1] / _h, _g[2] / _h, _g[3] / _h]
        );
      }
      exports.screenAA = screenAA; // Color conversion helpers
      // A color = float4 containing rgba values in the range [0, 1]
      // All functions have an extra alpha functon and a reverse
      // i.e. hsl, hsla, hslFromColor, hslaFromColor
      // fn hsl(v: float3) -> float4
      function hsl(v) {
        return hsla(__.makeVector(v, 1 | 0));
      }
      exports.hsl = hsl;
      function hsla(v) {
        var h = v[0];
        var s = v[1];
        var l = v[2];
        var a = v[3];
        var c = ((1 | 0) - Math.abs((2 | 0) * l - (1 | 0))) * s;
        var x = c * ((1 | 0) - Math.abs(((h / (60 | 0)) % (2 | 0)) - (1 | 0)));
        var m = l - c / (2 | 0);
        var r = 0.0;
        var g = 0.0;
        var b = 0.0;
        if (h < (60 | 0)) {
          r = c;
          g = x;
          b = 0 | 0;
        } else if (h < (120 | 0)) {
          r = x;
          g = c;
          b = 0 | 0;
        } else if (h < (180 | 0)) {
          r = 0 | 0;
          g = c;
          b = x;
        } else if (h < (240 | 0)) {
          r = 0 | 0;
          g = x;
          b = c;
        } else if (h < (300 | 0)) {
          r = x;
          g = 0 | 0;
          b = c;
        } else {
          r = c;
          g = 0 | 0;
          b = x;
        }
        return __.FM.float_4_1_1_1_1(
          __.add(r, m),
          __.add(g, m),
          __.add(b, m),
          a
        );
      }
      exports.hsla = hsla;
      function hslFromColor(c) {
        var r = c[0];
        var g = c[1];
        var b = c[2];
        var a = c[3];
        var mx = (0, std_math_1.max)(r, (0, std_math_1.max)(g, b));
        var mn = (0, std_math_1.min)(r, (0, std_math_1.min)(g, b));
        var h = 0.0;
        var s = 0.0;
        var l = (mx + mn) / (2 | 0);
        if (mx == mn) {
          h = 0 | 0;
          s = 0 | 0;
        } else {
          var d = mx - mn;
          s = l > 0.5 ? d / ((2 | 0) - mx - mn) : d / (mx + mn);
          if (mx == r) {
            h = (g - b) / d + (g < b ? 6 | 0 : 0 | 0);
          } else if (mx == g) {
            h = (b - r) / d + (2 | 0);
          } else if (mx == b) {
            h = (r - g) / d + (4 | 0);
          }
          h = h / (6 | 0);
        }
        return __.FM.float_3_1_1_1(__.mul(h, 360 | 0), s, l);
      }
      exports.hslFromColor = hslFromColor;
      function hslaFromColor(c) {
        var hsl = hslFromColor(c);
        return __.FM.float_4_3_1(hsl, __.swizzle(c, "a"));
      }
      exports.hslaFromColor = hslaFromColor;
      function hsv(v) {
        return hsva(__.makeVector(v, 1 | 0));
      }
      exports.hsv = hsv;
      function hsva(val) {
        var h = val[0];
        var s = val[1];
        var v = val[2];
        var a = val[3];
        var c = v * s;
        var x = c * ((1 | 0) - Math.abs(((h / (60 | 0)) % (2 | 0)) - (1 | 0)));
        var m = v - c;
        var r = 0.0;
        var g = 0.0;
        var b = 0.0;
        if (h < (60 | 0)) {
          r = c;
          g = x;
          b = 0 | 0;
        } else if (h < (120 | 0)) {
          r = x;
          g = c;
          b = 0 | 0;
        } else if (h < (180 | 0)) {
          r = 0 | 0;
          g = c;
          b = x;
        } else if (h < (240 | 0)) {
          r = 0 | 0;
          g = x;
          b = c;
        } else if (h < (300 | 0)) {
          r = x;
          g = 0 | 0;
          b = c;
        } else {
          r = c;
          g = 0 | 0;
          b = x;
        }
        return __.FM.float_4_1_1_1_1(
          __.add(r, m),
          __.add(g, m),
          __.add(b, m),
          a
        );
      }
      exports.hsva = hsva;
      function hsvFromColor(c) {
        var r = c[0];
        var g = c[1];
        var b = c[2];
        var mx = (0, std_math_1.max)(r, (0, std_math_1.max)(g, b));
        var mn = (0, std_math_1.min)(r, (0, std_math_1.min)(g, b));
        var h = 0.0;
        var s = 0.0;
        var v = mx;
        var d = mx - mn;
        s = mx == (0 | 0) ? 0 | 0 : d / mx;
        if (mx == mn) {
          h = 0 | 0;
        } else {
          if (mx == r) {
            h = (g - b) / d + (g < b ? 6 | 0 : 0 | 0);
          } else if (mx == g) {
            h = (b - r) / d + (2 | 0);
          } else if (mx == b) {
            h = (r - g) / d + (4 | 0);
          }
          h = h / (6 | 0);
        }
        return __.FM.float_3_1_1_1(__.mul(h, 360 | 0), s, v);
      }
      exports.hsvFromColor = hsvFromColor;
      function hsvaFromColor(c) {
        var hsv = hsvFromColor(c);
        return __.FM.float_4_3_1(hsv, __.swizzle(c, "a"));
      }
      exports.hsvaFromColor = hsvaFromColor;
      function rgb(v) {
        return __.FM.float_4_3_1(__.div(v, 255.0), __.int(1));
      }
      exports.rgb = rgb;
      function rgba(v) {
        return __.FM.float_4_4(__.div(v, 255.0));
      }
      exports.rgba = rgba;
      function rgbFromColor(c) {
        var _a, _b, _c;
        return (
          (_a = ((_c = c), [_c[0], _c[1], _c[2]])),
          (_b = 255.0),
          [_a[0] * _b, _a[1] * _b, _a[2] * _b]
        );
      }
      exports.rgbFromColor = rgbFromColor;
      function rgbaFromColor(c) {
        var _a, _b;
        return (
          (_a = c),
          (_b = 255.0),
          [_a[0] * _b, _a[1] * _b, _a[2] * _b, _a[3] * _b]
        );
      }
      exports.rgbaFromColor = rgbaFromColor;
      function cmyk(v) {
        var c = v[0];
        var m = v[1];
        var y = v[2];
        var k = v[3];
        var r = (1 | 0) - (0, std_math_1.min)(1 | 0, c * ((1 | 0) - k) + k);
        var g = (1 | 0) - (0, std_math_1.min)(1 | 0, m * ((1 | 0) - k) + k);
        var b = (1 | 0) - (0, std_math_1.min)(1 | 0, y * ((1 | 0) - k) + k);
        return __.FM.float_4_1_1_1_1(r, g, b, __.int(1));
      }
      exports.cmyk = cmyk;
      function cmykFromColor(c) {
        var r = c[0];
        var g = c[1];
        var b = c[2];
        var k = (1 | 0) - (0, std_math_1.max)(r, (0, std_math_1.max)(g, b));
        var c1 = ((1 | 0) - r - k) / ((1 | 0) - k);
        var m = ((1 | 0) - g - k) / ((1 | 0) - k);
        var y = ((1 | 0) - b - k) / ((1 | 0) - k);
        return __.FM.float_4_1_1_1_1(c1, m, y, k);
      }
      exports.cmykFromColor = cmykFromColor;
      function hex(v) {
        var r = (v >> (16 | 0)) & (0xff | 0);
        var g = (v >> (8 | 0)) & (0xff | 0);
        var b = v & (0xff | 0);
        return __.FM.float_4_1_1_1_1(
          __.div(r, 255.0),
          __.div(g, 255.0),
          __.div(b, 255.0),
          __.float(1.0)
        );
      }
      exports.hex = hex;
      function hexFromColor(c) {
        var r = __.mul(c[0], 255.0) | 0;
        var g = __.mul(c[1], 255.0) | 0;
        var b = __.mul(c[2], 255.0) | 0;
        return (r << (16 | 0)) | (g << (8 | 0)) | b;
      }
      exports.hexFromColor = hexFromColor;
      /**
       * Returns sin remapped to [0, 1]
       */
      function sin1(v) {
        return (Math.sin(v) + (1 | 0)) * 0.5;
      }
      exports.sin1 = sin1;
      /**
       * Returns cos remapped to [0, 1]
       */
      function cos1(v) {
        return (Math.cos(v) + (1 | 0)) * 0.5;
      }
      exports.cos1 = cos1;
      /**
       * Returns tan remapped to [0, 1]
       */
      function tan1(v) {
        return (Math.tan(v) + (1 | 0)) * 0.5;
      }
      exports.tan1 = tan1;
      function remap(v, low1, high1, low2, high2) {
        return low2 + ((v - low1) * (high2 - low2)) / (high1 - low1);
      }
      exports.remap = remap;
      function remap1(v, low, high) {
        return remap(v, low, high, 0 | 0, 1 | 0);
      }
      exports.remap1 = remap1;
      var color = /** @class */ (function () {
        function color(data) {}
        color.prototype.clone = function () {
          return new color({});
        };
        color.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_common_ts_57071_color","fields":[["slate50",{"type":"primitive","name":"float4"}],["slate100",{"type":"primitive","name":"float4"}],["slate200",{"type":"primitive","name":"float4"}],["slate300",{"type":"primitive","name":"float4"}],["slate400",{"type":"primitive","name":"float4"}],["slate500",{"type":"primitive","name":"float4"}],["slate600",{"type":"primitive","name":"float4"}],["slate700",{"type":"primitive","name":"float4"}],["slate800",{"type":"primitive","name":"float4"}],["slate900",{"type":"primitive","name":"float4"}],["slate950",{"type":"primitive","name":"float4"}],["gray50",{"type":"primitive","name":"float4"}],["gray100",{"type":"primitive","name":"float4"}],["gray200",{"type":"primitive","name":"float4"}],["gray300",{"type":"primitive","name":"float4"}],["gray400",{"type":"primitive","name":"float4"}],["gray500",{"type":"primitive","name":"float4"}],["gray600",{"type":"primitive","name":"float4"}],["gray700",{"type":"primitive","name":"float4"}],["gray800",{"type":"primitive","name":"float4"}],["gray900",{"type":"primitive","name":"float4"}],["gray950",{"type":"primitive","name":"float4"}],["zinc50",{"type":"primitive","name":"float4"}],["zinc100",{"type":"primitive","name":"float4"}],["zinc200",{"type":"primitive","name":"float4"}],["zinc300",{"type":"primitive","name":"float4"}],["zinc400",{"type":"primitive","name":"float4"}],["zinc500",{"type":"primitive","name":"float4"}],["zinc600",{"type":"primitive","name":"float4"}],["zinc700",{"type":"primitive","name":"float4"}],["zinc800",{"type":"primitive","name":"float4"}],["zinc900",{"type":"primitive","name":"float4"}],["zinc950",{"type":"primitive","name":"float4"}],["neutral50",{"type":"primitive","name":"float4"}],["neutral100",{"type":"primitive","name":"float4"}],["neutral200",{"type":"primitive","name":"float4"}],["neutral300",{"type":"primitive","name":"float4"}],["neutral400",{"type":"primitive","name":"float4"}],["neutral500",{"type":"primitive","name":"float4"}],["neutral600",{"type":"primitive","name":"float4"}],["neutral700",{"type":"primitive","name":"float4"}],["neutral800",{"type":"primitive","name":"float4"}],["neutral900",{"type":"primitive","name":"float4"}],["neutral950",{"type":"primitive","name":"float4"}],["stone50",{"type":"primitive","name":"float4"}],["stone100",{"type":"primitive","name":"float4"}],["stone200",{"type":"primitive","name":"float4"}],["stone300",{"type":"primitive","name":"float4"}],["stone400",{"type":"primitive","name":"float4"}],["stone500",{"type":"primitive","name":"float4"}],["stone600",{"type":"primitive","name":"float4"}],["stone700",{"type":"primitive","name":"float4"}],["stone800",{"type":"primitive","name":"float4"}],["stone900",{"type":"primitive","name":"float4"}],["stone950",{"type":"primitive","name":"float4"}],["red50",{"type":"primitive","name":"float4"}],["red100",{"type":"primitive","name":"float4"}],["red200",{"type":"primitive","name":"float4"}],["red300",{"type":"primitive","name":"float4"}],["red400",{"type":"primitive","name":"float4"}],["red500",{"type":"primitive","name":"float4"}],["red600",{"type":"primitive","name":"float4"}],["red700",{"type":"primitive","name":"float4"}],["red800",{"type":"primitive","name":"float4"}],["red900",{"type":"primitive","name":"float4"}],["red950",{"type":"primitive","name":"float4"}],["orange50",{"type":"primitive","name":"float4"}],["orange100",{"type":"primitive","name":"float4"}],["orange200",{"type":"primitive","name":"float4"}],["orange300",{"type":"primitive","name":"float4"}],["orange400",{"type":"primitive","name":"float4"}],["orange500",{"type":"primitive","name":"float4"}],["orange600",{"type":"primitive","name":"float4"}],["orange700",{"type":"primitive","name":"float4"}],["orange800",{"type":"primitive","name":"float4"}],["orange900",{"type":"primitive","name":"float4"}],["orange950",{"type":"primitive","name":"float4"}],["amber50",{"type":"primitive","name":"float4"}],["amber100",{"type":"primitive","name":"float4"}],["amber200",{"type":"primitive","name":"float4"}],["amber300",{"type":"primitive","name":"float4"}],["amber400",{"type":"primitive","name":"float4"}],["amber500",{"type":"primitive","name":"float4"}],["amber600",{"type":"primitive","name":"float4"}],["amber700",{"type":"primitive","name":"float4"}],["amber800",{"type":"primitive","name":"float4"}],["amber900",{"type":"primitive","name":"float4"}],["amber950",{"type":"primitive","name":"float4"}],["yellow50",{"type":"primitive","name":"float4"}],["yellow100",{"type":"primitive","name":"float4"}],["yellow200",{"type":"primitive","name":"float4"}],["yellow300",{"type":"primitive","name":"float4"}],["yellow400",{"type":"primitive","name":"float4"}],["yellow500",{"type":"primitive","name":"float4"}],["yellow600",{"type":"primitive","name":"float4"}],["yellow700",{"type":"primitive","name":"float4"}],["yellow800",{"type":"primitive","name":"float4"}],["yellow900",{"type":"primitive","name":"float4"}],["yellow950",{"type":"primitive","name":"float4"}],["lime50",{"type":"primitive","name":"float4"}],["lime100",{"type":"primitive","name":"float4"}],["lime200",{"type":"primitive","name":"float4"}],["lime300",{"type":"primitive","name":"float4"}],["lime400",{"type":"primitive","name":"float4"}],["lime500",{"type":"primitive","name":"float4"}],["lime600",{"type":"primitive","name":"float4"}],["lime700",{"type":"primitive","name":"float4"}],["lime800",{"type":"primitive","name":"float4"}],["lime900",{"type":"primitive","name":"float4"}],["lime950",{"type":"primitive","name":"float4"}],["green50",{"type":"primitive","name":"float4"}],["green100",{"type":"primitive","name":"float4"}],["green200",{"type":"primitive","name":"float4"}],["green300",{"type":"primitive","name":"float4"}],["green400",{"type":"primitive","name":"float4"}],["green500",{"type":"primitive","name":"float4"}],["green600",{"type":"primitive","name":"float4"}],["green700",{"type":"primitive","name":"float4"}],["green800",{"type":"primitive","name":"float4"}],["green900",{"type":"primitive","name":"float4"}],["green950",{"type":"primitive","name":"float4"}],["emerald50",{"type":"primitive","name":"float4"}],["emerald100",{"type":"primitive","name":"float4"}],["emerald200",{"type":"primitive","name":"float4"}],["emerald300",{"type":"primitive","name":"float4"}],["emerald400",{"type":"primitive","name":"float4"}],["emerald500",{"type":"primitive","name":"float4"}],["emerald600",{"type":"primitive","name":"float4"}],["emerald700",{"type":"primitive","name":"float4"}],["emerald800",{"type":"primitive","name":"float4"}],["emerald900",{"type":"primitive","name":"float4"}],["emerald950",{"type":"primitive","name":"float4"}],["teal50",{"type":"primitive","name":"float4"}],["teal100",{"type":"primitive","name":"float4"}],["teal200",{"type":"primitive","name":"float4"}],["teal300",{"type":"primitive","name":"float4"}],["teal400",{"type":"primitive","name":"float4"}],["teal500",{"type":"primitive","name":"float4"}],["teal600",{"type":"primitive","name":"float4"}],["teal700",{"type":"primitive","name":"float4"}],["teal800",{"type":"primitive","name":"float4"}],["teal900",{"type":"primitive","name":"float4"}],["teal950",{"type":"primitive","name":"float4"}],["cyan50",{"type":"primitive","name":"float4"}],["cyan100",{"type":"primitive","name":"float4"}],["cyan200",{"type":"primitive","name":"float4"}],["cyan300",{"type":"primitive","name":"float4"}],["cyan400",{"type":"primitive","name":"float4"}],["cyan500",{"type":"primitive","name":"float4"}],["cyan600",{"type":"primitive","name":"float4"}],["cyan700",{"type":"primitive","name":"float4"}],["cyan800",{"type":"primitive","name":"float4"}],["cyan900",{"type":"primitive","name":"float4"}],["cyan950",{"type":"primitive","name":"float4"}],["sky50",{"type":"primitive","name":"float4"}],["sky100",{"type":"primitive","name":"float4"}],["sky200",{"type":"primitive","name":"float4"}],["sky300",{"type":"primitive","name":"float4"}],["sky400",{"type":"primitive","name":"float4"}],["sky500",{"type":"primitive","name":"float4"}],["sky600",{"type":"primitive","name":"float4"}],["sky700",{"type":"primitive","name":"float4"}],["sky800",{"type":"primitive","name":"float4"}],["sky900",{"type":"primitive","name":"float4"}],["sky950",{"type":"primitive","name":"float4"}],["blue50",{"type":"primitive","name":"float4"}],["blue100",{"type":"primitive","name":"float4"}],["blue200",{"type":"primitive","name":"float4"}],["blue300",{"type":"primitive","name":"float4"}],["blue400",{"type":"primitive","name":"float4"}],["blue500",{"type":"primitive","name":"float4"}],["blue600",{"type":"primitive","name":"float4"}],["blue700",{"type":"primitive","name":"float4"}],["blue800",{"type":"primitive","name":"float4"}],["blue900",{"type":"primitive","name":"float4"}],["blue950",{"type":"primitive","name":"float4"}],["indigo50",{"type":"primitive","name":"float4"}],["indigo100",{"type":"primitive","name":"float4"}],["indigo200",{"type":"primitive","name":"float4"}],["indigo300",{"type":"primitive","name":"float4"}],["indigo400",{"type":"primitive","name":"float4"}],["indigo500",{"type":"primitive","name":"float4"}],["indigo600",{"type":"primitive","name":"float4"}],["indigo700",{"type":"primitive","name":"float4"}],["indigo800",{"type":"primitive","name":"float4"}],["indigo900",{"type":"primitive","name":"float4"}],["indigo950",{"type":"primitive","name":"float4"}],["violet50",{"type":"primitive","name":"float4"}],["violet100",{"type":"primitive","name":"float4"}],["violet200",{"type":"primitive","name":"float4"}],["violet300",{"type":"primitive","name":"float4"}],["violet400",{"type":"primitive","name":"float4"}],["violet500",{"type":"primitive","name":"float4"}],["violet600",{"type":"primitive","name":"float4"}],["violet700",{"type":"primitive","name":"float4"}],["violet800",{"type":"primitive","name":"float4"}],["violet900",{"type":"primitive","name":"float4"}],["violet950",{"type":"primitive","name":"float4"}],["purple50",{"type":"primitive","name":"float4"}],["purple100",{"type":"primitive","name":"float4"}],["purple200",{"type":"primitive","name":"float4"}],["purple300",{"type":"primitive","name":"float4"}],["purple400",{"type":"primitive","name":"float4"}],["purple500",{"type":"primitive","name":"float4"}],["purple600",{"type":"primitive","name":"float4"}],["purple700",{"type":"primitive","name":"float4"}],["purple800",{"type":"primitive","name":"float4"}],["purple900",{"type":"primitive","name":"float4"}],["purple950",{"type":"primitive","name":"float4"}],["fuchsia50",{"type":"primitive","name":"float4"}],["fuchsia100",{"type":"primitive","name":"float4"}],["fuchsia200",{"type":"primitive","name":"float4"}],["fuchsia300",{"type":"primitive","name":"float4"}],["fuchsia400",{"type":"primitive","name":"float4"}],["fuchsia500",{"type":"primitive","name":"float4"}],["fuchsia600",{"type":"primitive","name":"float4"}],["fuchsia700",{"type":"primitive","name":"float4"}],["fuchsia800",{"type":"primitive","name":"float4"}],["fuchsia900",{"type":"primitive","name":"float4"}],["fuchsia950",{"type":"primitive","name":"float4"}],["pink50",{"type":"primitive","name":"float4"}],["pink100",{"type":"primitive","name":"float4"}],["pink200",{"type":"primitive","name":"float4"}],["pink300",{"type":"primitive","name":"float4"}],["pink400",{"type":"primitive","name":"float4"}],["pink500",{"type":"primitive","name":"float4"}],["pink600",{"type":"primitive","name":"float4"}],["pink700",{"type":"primitive","name":"float4"}],["pink800",{"type":"primitive","name":"float4"}],["pink900",{"type":"primitive","name":"float4"}],["pink950",{"type":"primitive","name":"float4"}],["rose50",{"type":"primitive","name":"float4"}],["rose100",{"type":"primitive","name":"float4"}],["rose200",{"type":"primitive","name":"float4"}],["rose300",{"type":"primitive","name":"float4"}],["rose400",{"type":"primitive","name":"float4"}],["rose500",{"type":"primitive","name":"float4"}],["rose600",{"type":"primitive","name":"float4"}],["rose700",{"type":"primitive","name":"float4"}],["rose800",{"type":"primitive","name":"float4"}],["rose900",{"type":"primitive","name":"float4"}],["rose950",{"type":"primitive","name":"float4"}]]}'
          );
        };
        color.slate50 = __.FM.float_4_1_1_1_1(
          __.float(0.9725490196078431),
          __.float(0.9803921568627451),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.slate100 = __.FM.float_4_1_1_1_1(
          __.float(0.9450980392156862),
          __.float(0.9607843137254902),
          __.float(0.9764705882352941),
          __.int(1)
        );
        color.slate200 = __.FM.float_4_1_1_1_1(
          __.float(0.8862745098039215),
          __.float(0.9098039215686274),
          __.float(0.9411764705882353),
          __.int(1)
        );
        color.slate300 = __.FM.float_4_1_1_1_1(
          __.float(0.796078431372549),
          __.float(0.8352941176470589),
          __.float(0.8823529411764706),
          __.int(1)
        );
        color.slate400 = __.FM.float_4_1_1_1_1(
          __.float(0.5803921568627451),
          __.float(0.6392156862745098),
          __.float(0.7215686274509804),
          __.int(1)
        );
        color.slate500 = __.FM.float_4_1_1_1_1(
          __.float(0.39215686274509803),
          __.float(0.4549019607843137),
          __.float(0.5450980392156862),
          __.int(1)
        );
        color.slate600 = __.FM.float_4_1_1_1_1(
          __.float(0.2784313725490196),
          __.float(0.3333333333333333),
          __.float(0.4117647058823529),
          __.int(1)
        );
        color.slate700 = __.FM.float_4_1_1_1_1(
          __.float(0.2),
          __.float(0.2549019607843137),
          __.float(0.3333333333333333),
          __.int(1)
        );
        color.slate800 = __.FM.float_4_1_1_1_1(
          __.float(0.11764705882352941),
          __.float(0.1607843137254902),
          __.float(0.23137254901960785),
          __.int(1)
        );
        color.slate900 = __.FM.float_4_1_1_1_1(
          __.float(0.058823529411764705),
          __.float(0.09019607843137255),
          __.float(0.16470588235294117),
          __.int(1)
        );
        color.slate950 = __.FM.float_4_1_1_1_1(
          __.float(0.00784313725490196),
          __.float(0.023529411764705882),
          __.float(0.09019607843137255),
          __.int(1)
        );
        color.gray50 = __.FM.float_4_1_1_1_1(
          __.float(0.9764705882352941),
          __.float(0.9803921568627451),
          __.float(0.984313725490196),
          __.int(1)
        );
        color.gray100 = __.FM.float_4_1_1_1_1(
          __.float(0.9529411764705882),
          __.float(0.9568627450980393),
          __.float(0.9647058823529412),
          __.int(1)
        );
        color.gray200 = __.FM.float_4_1_1_1_1(
          __.float(0.8980392156862745),
          __.float(0.9058823529411765),
          __.float(0.9215686274509803),
          __.int(1)
        );
        color.gray300 = __.FM.float_4_1_1_1_1(
          __.float(0.8196078431372549),
          __.float(0.8352941176470589),
          __.float(0.8588235294117647),
          __.int(1)
        );
        color.gray400 = __.FM.float_4_1_1_1_1(
          __.float(0.611764705882353),
          __.float(0.6392156862745098),
          __.float(0.6862745098039216),
          __.int(1)
        );
        color.gray500 = __.FM.float_4_1_1_1_1(
          __.float(0.4196078431372549),
          __.float(0.4470588235294118),
          __.float(0.5019607843137255),
          __.int(1)
        );
        color.gray600 = __.FM.float_4_1_1_1_1(
          __.float(0.29411764705882354),
          __.float(0.3333333333333333),
          __.float(0.38823529411764707),
          __.int(1)
        );
        color.gray700 = __.FM.float_4_1_1_1_1(
          __.float(0.21568627450980393),
          __.float(0.2549019607843137),
          __.float(0.3176470588235294),
          __.int(1)
        );
        color.gray800 = __.FM.float_4_1_1_1_1(
          __.float(0.12156862745098039),
          __.float(0.1607843137254902),
          __.float(0.21568627450980393),
          __.int(1)
        );
        color.gray900 = __.FM.float_4_1_1_1_1(
          __.float(0.06666666666666667),
          __.float(0.09411764705882353),
          __.float(0.15294117647058825),
          __.int(1)
        );
        color.gray950 = __.FM.float_4_1_1_1_1(
          __.float(0.011764705882352941),
          __.float(0.027450980392156862),
          __.float(0.07058823529411765),
          __.int(1)
        );
        color.zinc50 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.9803921568627451),
          __.float(0.9803921568627451),
          __.int(1)
        );
        color.zinc100 = __.FM.float_4_1_1_1_1(
          __.float(0.9568627450980393),
          __.float(0.9568627450980393),
          __.float(0.9607843137254902),
          __.int(1)
        );
        color.zinc200 = __.FM.float_4_1_1_1_1(
          __.float(0.8941176470588236),
          __.float(0.8941176470588236),
          __.float(0.9058823529411765),
          __.int(1)
        );
        color.zinc300 = __.FM.float_4_1_1_1_1(
          __.float(0.8313725490196079),
          __.float(0.8313725490196079),
          __.float(0.8470588235294118),
          __.int(1)
        );
        color.zinc400 = __.FM.float_4_1_1_1_1(
          __.float(0.6313725490196078),
          __.float(0.6313725490196078),
          __.float(0.6666666666666666),
          __.int(1)
        );
        color.zinc500 = __.FM.float_4_1_1_1_1(
          __.float(0.44313725490196076),
          __.float(0.44313725490196076),
          __.float(0.47843137254901963),
          __.int(1)
        );
        color.zinc600 = __.FM.float_4_1_1_1_1(
          __.float(0.3215686274509804),
          __.float(0.3215686274509804),
          __.float(0.3568627450980392),
          __.int(1)
        );
        color.zinc700 = __.FM.float_4_1_1_1_1(
          __.float(0.24705882352941178),
          __.float(0.24705882352941178),
          __.float(0.27450980392156865),
          __.int(1)
        );
        color.zinc800 = __.FM.float_4_1_1_1_1(
          __.float(0.15294117647058825),
          __.float(0.15294117647058825),
          __.float(0.16470588235294117),
          __.int(1)
        );
        color.zinc900 = __.FM.float_4_1_1_1_1(
          __.float(0.09411764705882353),
          __.float(0.09411764705882353),
          __.float(0.10588235294117647),
          __.int(1)
        );
        color.zinc950 = __.FM.float_4_1_1_1_1(
          __.float(0.03529411764705882),
          __.float(0.03529411764705882),
          __.float(0.043137254901960784),
          __.int(1)
        );
        color.neutral50 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.9803921568627451),
          __.float(0.9803921568627451),
          __.int(1)
        );
        color.neutral100 = __.FM.float_4_1_1_1_1(
          __.float(0.9607843137254902),
          __.float(0.9607843137254902),
          __.float(0.9607843137254902),
          __.int(1)
        );
        color.neutral200 = __.FM.float_4_1_1_1_1(
          __.float(0.8980392156862745),
          __.float(0.8980392156862745),
          __.float(0.8980392156862745),
          __.int(1)
        );
        color.neutral300 = __.FM.float_4_1_1_1_1(
          __.float(0.8313725490196079),
          __.float(0.8313725490196079),
          __.float(0.8313725490196079),
          __.int(1)
        );
        color.neutral400 = __.FM.float_4_1_1_1_1(
          __.float(0.6392156862745098),
          __.float(0.6392156862745098),
          __.float(0.6392156862745098),
          __.int(1)
        );
        color.neutral500 = __.FM.float_4_1_1_1_1(
          __.float(0.45098039215686275),
          __.float(0.45098039215686275),
          __.float(0.45098039215686275),
          __.int(1)
        );
        color.neutral600 = __.FM.float_4_1_1_1_1(
          __.float(0.3215686274509804),
          __.float(0.3215686274509804),
          __.float(0.3215686274509804),
          __.int(1)
        );
        color.neutral700 = __.FM.float_4_1_1_1_1(
          __.float(0.25098039215686274),
          __.float(0.25098039215686274),
          __.float(0.25098039215686274),
          __.int(1)
        );
        color.neutral800 = __.FM.float_4_1_1_1_1(
          __.float(0.14901960784313725),
          __.float(0.14901960784313725),
          __.float(0.14901960784313725),
          __.int(1)
        );
        color.neutral900 = __.FM.float_4_1_1_1_1(
          __.float(0.09019607843137255),
          __.float(0.09019607843137255),
          __.float(0.09019607843137255),
          __.int(1)
        );
        color.neutral950 = __.FM.float_4_1_1_1_1(
          __.float(0.0392156862745098),
          __.float(0.0392156862745098),
          __.float(0.0392156862745098),
          __.int(1)
        );
        color.stone50 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.9803921568627451),
          __.float(0.9764705882352941),
          __.int(1)
        );
        color.stone100 = __.FM.float_4_1_1_1_1(
          __.float(0.9607843137254902),
          __.float(0.9607843137254902),
          __.float(0.9568627450980393),
          __.int(1)
        );
        color.stone200 = __.FM.float_4_1_1_1_1(
          __.float(0.9058823529411765),
          __.float(0.8980392156862745),
          __.float(0.8941176470588236),
          __.int(1)
        );
        color.stone300 = __.FM.float_4_1_1_1_1(
          __.float(0.8392156862745098),
          __.float(0.8274509803921568),
          __.float(0.8196078431372549),
          __.int(1)
        );
        color.stone400 = __.FM.float_4_1_1_1_1(
          __.float(0.6588235294117647),
          __.float(0.6352941176470588),
          __.float(0.6196078431372549),
          __.int(1)
        );
        color.stone500 = __.FM.float_4_1_1_1_1(
          __.float(0.47058823529411764),
          __.float(0.44313725490196076),
          __.float(0.4235294117647059),
          __.int(1)
        );
        color.stone600 = __.FM.float_4_1_1_1_1(
          __.float(0.3411764705882353),
          __.float(0.3254901960784314),
          __.float(0.3058823529411765),
          __.int(1)
        );
        color.stone700 = __.FM.float_4_1_1_1_1(
          __.float(0.26666666666666666),
          __.float(0.25098039215686274),
          __.float(0.23529411764705882),
          __.int(1)
        );
        color.stone800 = __.FM.float_4_1_1_1_1(
          __.float(0.1607843137254902),
          __.float(0.1450980392156863),
          __.float(0.1411764705882353),
          __.int(1)
        );
        color.stone900 = __.FM.float_4_1_1_1_1(
          __.float(0.10980392156862745),
          __.float(0.09803921568627451),
          __.float(0.09019607843137255),
          __.int(1)
        );
        color.stone950 = __.FM.float_4_1_1_1_1(
          __.float(0.047058823529411764),
          __.float(0.0392156862745098),
          __.float(0.03529411764705882),
          __.int(1)
        );
        color.red50 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.9490196078431372),
          __.float(0.9490196078431372),
          __.int(1)
        );
        color.red100 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.8862745098039215),
          __.float(0.8862745098039215),
          __.int(1)
        );
        color.red200 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.792156862745098),
          __.float(0.792156862745098),
          __.int(1)
        );
        color.red300 = __.FM.float_4_1_1_1_1(
          __.float(0.9882352941176471),
          __.float(0.6470588235294118),
          __.float(0.6470588235294118),
          __.int(1)
        );
        color.red400 = __.FM.float_4_1_1_1_1(
          __.float(0.9725490196078431),
          __.float(0.44313725490196076),
          __.float(0.44313725490196076),
          __.int(1)
        );
        color.red500 = __.FM.float_4_1_1_1_1(
          __.float(0.9372549019607843),
          __.float(0.26666666666666666),
          __.float(0.26666666666666666),
          __.int(1)
        );
        color.red600 = __.FM.float_4_1_1_1_1(
          __.float(0.8627450980392157),
          __.float(0.14901960784313725),
          __.float(0.14901960784313725),
          __.int(1)
        );
        color.red700 = __.FM.float_4_1_1_1_1(
          __.float(0.7254901960784313),
          __.float(0.10980392156862745),
          __.float(0.10980392156862745),
          __.int(1)
        );
        color.red800 = __.FM.float_4_1_1_1_1(
          __.float(0.6),
          __.float(0.10588235294117647),
          __.float(0.10588235294117647),
          __.int(1)
        );
        color.red900 = __.FM.float_4_1_1_1_1(
          __.float(0.4980392156862745),
          __.float(0.11372549019607843),
          __.float(0.11372549019607843),
          __.int(1)
        );
        color.red950 = __.FM.float_4_1_1_1_1(
          __.float(0.27058823529411763),
          __.float(0.0392156862745098),
          __.float(0.0392156862745098),
          __.int(1)
        );
        color.orange50 = __.FM.float_4_1_1_1_1(
          __.int(1),
          __.float(0.9686274509803922),
          __.float(0.9294117647058824),
          __.int(1)
        );
        color.orange100 = __.FM.float_4_1_1_1_1(
          __.int(1),
          __.float(0.9294117647058824),
          __.float(0.8352941176470589),
          __.int(1)
        );
        color.orange200 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.8431372549019608),
          __.float(0.6666666666666666),
          __.int(1)
        );
        color.orange300 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.7294117647058823),
          __.float(0.4549019607843137),
          __.int(1)
        );
        color.orange400 = __.FM.float_4_1_1_1_1(
          __.float(0.984313725490196),
          __.float(0.5725490196078431),
          __.float(0.23529411764705882),
          __.int(1)
        );
        color.orange500 = __.FM.float_4_1_1_1_1(
          __.float(0.9764705882352941),
          __.float(0.45098039215686275),
          __.float(0.08627450980392157),
          __.int(1)
        );
        color.orange600 = __.FM.float_4_1_1_1_1(
          __.float(0.9176470588235294),
          __.float(0.34509803921568627),
          __.float(0.047058823529411764),
          __.int(1)
        );
        color.orange700 = __.FM.float_4_1_1_1_1(
          __.float(0.7607843137254902),
          __.float(0.2549019607843137),
          __.float(0.047058823529411764),
          __.int(1)
        );
        color.orange800 = __.FM.float_4_1_1_1_1(
          __.float(0.6039215686274509),
          __.float(0.20392156862745098),
          __.float(0.07058823529411765),
          __.int(1)
        );
        color.orange900 = __.FM.float_4_1_1_1_1(
          __.float(0.48627450980392156),
          __.float(0.17647058823529413),
          __.float(0.07058823529411765),
          __.int(1)
        );
        color.orange950 = __.FM.float_4_1_1_1_1(
          __.float(0.2627450980392157),
          __.float(0.0784313725490196),
          __.float(0.027450980392156862),
          __.int(1)
        );
        color.amber50 = __.FM.float_4_1_1_1_1(
          __.int(1),
          __.float(0.984313725490196),
          __.float(0.9215686274509803),
          __.int(1)
        );
        color.amber100 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.9529411764705882),
          __.float(0.7803921568627451),
          __.int(1)
        );
        color.amber200 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.9019607843137255),
          __.float(0.5411764705882353),
          __.int(1)
        );
        color.amber300 = __.FM.float_4_1_1_1_1(
          __.float(0.9882352941176471),
          __.float(0.8274509803921568),
          __.float(0.30196078431372547),
          __.int(1)
        );
        color.amber400 = __.FM.float_4_1_1_1_1(
          __.float(0.984313725490196),
          __.float(0.7490196078431373),
          __.float(0.1411764705882353),
          __.int(1)
        );
        color.amber500 = __.FM.float_4_1_1_1_1(
          __.float(0.9607843137254902),
          __.float(0.6196078431372549),
          __.float(0.043137254901960784),
          __.int(1)
        );
        color.amber600 = __.FM.float_4_1_1_1_1(
          __.float(0.8509803921568627),
          __.float(0.4666666666666667),
          __.float(0.023529411764705882),
          __.int(1)
        );
        color.amber700 = __.FM.float_4_1_1_1_1(
          __.float(0.7058823529411765),
          __.float(0.3254901960784314),
          __.float(0.03529411764705882),
          __.int(1)
        );
        color.amber800 = __.FM.float_4_1_1_1_1(
          __.float(0.5725490196078431),
          __.float(0.25098039215686274),
          __.float(0.054901960784313725),
          __.int(1)
        );
        color.amber900 = __.FM.float_4_1_1_1_1(
          __.float(0.47058823529411764),
          __.float(0.20784313725490197),
          __.float(0.058823529411764705),
          __.int(1)
        );
        color.amber950 = __.FM.float_4_1_1_1_1(
          __.float(0.27058823529411763),
          __.float(0.10196078431372549),
          __.float(0.011764705882352941),
          __.int(1)
        );
        color.yellow50 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.9882352941176471),
          __.float(0.9098039215686274),
          __.int(1)
        );
        color.yellow100 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.9764705882352941),
          __.float(0.7647058823529411),
          __.int(1)
        );
        color.yellow200 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.9411764705882353),
          __.float(0.5411764705882353),
          __.int(1)
        );
        color.yellow300 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.8784313725490196),
          __.float(0.2784313725490196),
          __.int(1)
        );
        color.yellow400 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.8),
          __.float(0.08235294117647059),
          __.int(1)
        );
        color.yellow500 = __.FM.float_4_1_1_1_1(
          __.float(0.9176470588235294),
          __.float(0.7019607843137254),
          __.float(0.03137254901960784),
          __.int(1)
        );
        color.yellow600 = __.FM.float_4_1_1_1_1(
          __.float(0.792156862745098),
          __.float(0.5411764705882353),
          __.float(0.01568627450980392),
          __.int(1)
        );
        color.yellow700 = __.FM.float_4_1_1_1_1(
          __.float(0.6313725490196078),
          __.float(0.3843137254901961),
          __.float(0.027450980392156862),
          __.int(1)
        );
        color.yellow800 = __.FM.float_4_1_1_1_1(
          __.float(0.5215686274509804),
          __.float(0.30196078431372547),
          __.float(0.054901960784313725),
          __.int(1)
        );
        color.yellow900 = __.FM.float_4_1_1_1_1(
          __.float(0.44313725490196076),
          __.float(0.24705882352941178),
          __.float(0.07058823529411765),
          __.int(1)
        );
        color.yellow950 = __.FM.float_4_1_1_1_1(
          __.float(0.25882352941176473),
          __.float(0.12549019607843137),
          __.float(0.023529411764705882),
          __.int(1)
        );
        color.lime50 = __.FM.float_4_1_1_1_1(
          __.float(0.9686274509803922),
          __.float(0.996078431372549),
          __.float(0.9058823529411765),
          __.int(1)
        );
        color.lime100 = __.FM.float_4_1_1_1_1(
          __.float(0.9254901960784314),
          __.float(0.9882352941176471),
          __.float(0.796078431372549),
          __.int(1)
        );
        color.lime200 = __.FM.float_4_1_1_1_1(
          __.float(0.8509803921568627),
          __.float(0.9764705882352941),
          __.float(0.615686274509804),
          __.int(1)
        );
        color.lime300 = __.FM.float_4_1_1_1_1(
          __.float(0.7450980392156863),
          __.float(0.9490196078431372),
          __.float(0.39215686274509803),
          __.int(1)
        );
        color.lime400 = __.FM.float_4_1_1_1_1(
          __.float(0.6392156862745098),
          __.float(0.9019607843137255),
          __.float(0.20784313725490197),
          __.int(1)
        );
        color.lime500 = __.FM.float_4_1_1_1_1(
          __.float(0.5176470588235295),
          __.float(0.8),
          __.float(0.08627450980392157),
          __.int(1)
        );
        color.lime600 = __.FM.float_4_1_1_1_1(
          __.float(0.396078431372549),
          __.float(0.6392156862745098),
          __.float(0.050980392156862744),
          __.int(1)
        );
        color.lime700 = __.FM.float_4_1_1_1_1(
          __.float(0.30196078431372547),
          __.float(0.48627450980392156),
          __.float(0.058823529411764705),
          __.int(1)
        );
        color.lime800 = __.FM.float_4_1_1_1_1(
          __.float(0.24705882352941178),
          __.float(0.3843137254901961),
          __.float(0.07058823529411765),
          __.int(1)
        );
        color.lime900 = __.FM.float_4_1_1_1_1(
          __.float(0.21176470588235294),
          __.float(0.3254901960784314),
          __.float(0.0784313725490196),
          __.int(1)
        );
        color.lime950 = __.FM.float_4_1_1_1_1(
          __.float(0.10196078431372549),
          __.float(0.1803921568627451),
          __.float(0.0196078431372549),
          __.int(1)
        );
        color.green50 = __.FM.float_4_1_1_1_1(
          __.float(0.9411764705882353),
          __.float(0.9921568627450981),
          __.float(0.9568627450980393),
          __.int(1)
        );
        color.green100 = __.FM.float_4_1_1_1_1(
          __.float(0.8627450980392157),
          __.float(0.9882352941176471),
          __.float(0.9058823529411765),
          __.int(1)
        );
        color.green200 = __.FM.float_4_1_1_1_1(
          __.float(0.7333333333333333),
          __.float(0.9686274509803922),
          __.float(0.8156862745098039),
          __.int(1)
        );
        color.green300 = __.FM.float_4_1_1_1_1(
          __.float(0.5254901960784314),
          __.float(0.9372549019607843),
          __.float(0.6745098039215687),
          __.int(1)
        );
        color.green400 = __.FM.float_4_1_1_1_1(
          __.float(0.2901960784313726),
          __.float(0.8705882352941177),
          __.float(0.5019607843137255),
          __.int(1)
        );
        color.green500 = __.FM.float_4_1_1_1_1(
          __.float(0.13333333333333333),
          __.float(0.7725490196078432),
          __.float(0.3686274509803922),
          __.int(1)
        );
        color.green600 = __.FM.float_4_1_1_1_1(
          __.float(0.08627450980392157),
          __.float(0.6392156862745098),
          __.float(0.2901960784313726),
          __.int(1)
        );
        color.green700 = __.FM.float_4_1_1_1_1(
          __.float(0.08235294117647059),
          __.float(0.5019607843137255),
          __.float(0.23921568627450981),
          __.int(1)
        );
        color.green800 = __.FM.float_4_1_1_1_1(
          __.float(0.08627450980392157),
          __.float(0.396078431372549),
          __.float(0.20392156862745098),
          __.int(1)
        );
        color.green900 = __.FM.float_4_1_1_1_1(
          __.float(0.0784313725490196),
          __.float(0.3254901960784314),
          __.float(0.17647058823529413),
          __.int(1)
        );
        color.green950 = __.FM.float_4_1_1_1_1(
          __.float(0.0196078431372549),
          __.float(0.1803921568627451),
          __.float(0.08627450980392157),
          __.int(1)
        );
        color.emerald50 = __.FM.float_4_1_1_1_1(
          __.float(0.9254901960784314),
          __.float(0.9921568627450981),
          __.float(0.9607843137254902),
          __.int(1)
        );
        color.emerald100 = __.FM.float_4_1_1_1_1(
          __.float(0.8196078431372549),
          __.float(0.9803921568627451),
          __.float(0.8980392156862745),
          __.int(1)
        );
        color.emerald200 = __.FM.float_4_1_1_1_1(
          __.float(0.6549019607843137),
          __.float(0.9529411764705882),
          __.float(0.8156862745098039),
          __.int(1)
        );
        color.emerald300 = __.FM.float_4_1_1_1_1(
          __.float(0.43137254901960786),
          __.float(0.9058823529411765),
          __.float(0.7176470588235294),
          __.int(1)
        );
        color.emerald400 = __.FM.float_4_1_1_1_1(
          __.float(0.20392156862745098),
          __.float(0.8274509803921568),
          __.float(0.6),
          __.int(1)
        );
        color.emerald500 = __.FM.float_4_1_1_1_1(
          __.float(0.06274509803921569),
          __.float(0.7254901960784313),
          __.float(0.5058823529411764),
          __.int(1)
        );
        color.emerald600 = __.FM.float_4_1_1_1_1(
          __.float(0.0196078431372549),
          __.float(0.5882352941176471),
          __.float(0.4117647058823529),
          __.int(1)
        );
        color.emerald700 = __.FM.float_4_1_1_1_1(
          __.float(0.01568627450980392),
          __.float(0.47058823529411764),
          __.float(0.3411764705882353),
          __.int(1)
        );
        color.emerald800 = __.FM.float_4_1_1_1_1(
          __.float(0.023529411764705882),
          __.float(0.37254901960784315),
          __.float(0.27450980392156865),
          __.int(1)
        );
        color.emerald900 = __.FM.float_4_1_1_1_1(
          __.float(0.023529411764705882),
          __.float(0.3058823529411765),
          __.float(0.23137254901960785),
          __.int(1)
        );
        color.emerald950 = __.FM.float_4_1_1_1_1(
          __.float(0.00784313725490196),
          __.float(0.17254901960784313),
          __.float(0.13333333333333333),
          __.int(1)
        );
        color.teal50 = __.FM.float_4_1_1_1_1(
          __.float(0.9411764705882353),
          __.float(0.9921568627450981),
          __.float(0.9803921568627451),
          __.int(1)
        );
        color.teal100 = __.FM.float_4_1_1_1_1(
          __.float(0.8),
          __.float(0.984313725490196),
          __.float(0.9450980392156862),
          __.int(1)
        );
        color.teal200 = __.FM.float_4_1_1_1_1(
          __.float(0.6),
          __.float(0.9647058823529412),
          __.float(0.8941176470588236),
          __.int(1)
        );
        color.teal300 = __.FM.float_4_1_1_1_1(
          __.float(0.3686274509803922),
          __.float(0.9176470588235294),
          __.float(0.8313725490196079),
          __.int(1)
        );
        color.teal400 = __.FM.float_4_1_1_1_1(
          __.float(0.17647058823529413),
          __.float(0.8313725490196079),
          __.float(0.7490196078431373),
          __.int(1)
        );
        color.teal500 = __.FM.float_4_1_1_1_1(
          __.float(0.0784313725490196),
          __.float(0.7215686274509804),
          __.float(0.6509803921568628),
          __.int(1)
        );
        color.teal600 = __.FM.float_4_1_1_1_1(
          __.float(0.050980392156862744),
          __.float(0.5803921568627451),
          __.float(0.5333333333333333),
          __.int(1)
        );
        color.teal700 = __.FM.float_4_1_1_1_1(
          __.float(0.058823529411764705),
          __.float(0.4627450980392157),
          __.float(0.43137254901960786),
          __.int(1)
        );
        color.teal800 = __.FM.float_4_1_1_1_1(
          __.float(0.06666666666666667),
          __.float(0.3686274509803922),
          __.float(0.34901960784313724),
          __.int(1)
        );
        color.teal900 = __.FM.float_4_1_1_1_1(
          __.float(0.07450980392156863),
          __.float(0.3058823529411765),
          __.float(0.2901960784313726),
          __.int(1)
        );
        color.teal950 = __.FM.float_4_1_1_1_1(
          __.float(0.01568627450980392),
          __.float(0.1843137254901961),
          __.float(0.1803921568627451),
          __.int(1)
        );
        color.cyan50 = __.FM.float_4_1_1_1_1(
          __.float(0.9254901960784314),
          __.float(0.996078431372549),
          __.int(1),
          __.int(1)
        );
        color.cyan100 = __.FM.float_4_1_1_1_1(
          __.float(0.8117647058823529),
          __.float(0.9803921568627451),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.cyan200 = __.FM.float_4_1_1_1_1(
          __.float(0.6470588235294118),
          __.float(0.9529411764705882),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.cyan300 = __.FM.float_4_1_1_1_1(
          __.float(0.403921568627451),
          __.float(0.9098039215686274),
          __.float(0.9764705882352941),
          __.int(1)
        );
        color.cyan400 = __.FM.float_4_1_1_1_1(
          __.float(0.13333333333333333),
          __.float(0.8274509803921568),
          __.float(0.9333333333333333),
          __.int(1)
        );
        color.cyan500 = __.FM.float_4_1_1_1_1(
          __.float(0.023529411764705882),
          __.float(0.7137254901960784),
          __.float(0.8313725490196079),
          __.int(1)
        );
        color.cyan600 = __.FM.float_4_1_1_1_1(
          __.float(0.03137254901960784),
          __.float(0.5686274509803921),
          __.float(0.6980392156862745),
          __.int(1)
        );
        color.cyan700 = __.FM.float_4_1_1_1_1(
          __.float(0.054901960784313725),
          __.float(0.4549019607843137),
          __.float(0.5647058823529412),
          __.int(1)
        );
        color.cyan800 = __.FM.float_4_1_1_1_1(
          __.float(0.08235294117647059),
          __.float(0.3686274509803922),
          __.float(0.4588235294117647),
          __.int(1)
        );
        color.cyan900 = __.FM.float_4_1_1_1_1(
          __.float(0.08627450980392157),
          __.float(0.3058823529411765),
          __.float(0.38823529411764707),
          __.int(1)
        );
        color.cyan950 = __.FM.float_4_1_1_1_1(
          __.float(0.03137254901960784),
          __.float(0.2),
          __.float(0.26666666666666666),
          __.int(1)
        );
        color.sky50 = __.FM.float_4_1_1_1_1(
          __.float(0.9411764705882353),
          __.float(0.9764705882352941),
          __.int(1),
          __.int(1)
        );
        color.sky100 = __.FM.float_4_1_1_1_1(
          __.float(0.8784313725490196),
          __.float(0.9490196078431372),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.sky200 = __.FM.float_4_1_1_1_1(
          __.float(0.7294117647058823),
          __.float(0.9019607843137255),
          __.float(0.9921568627450981),
          __.int(1)
        );
        color.sky300 = __.FM.float_4_1_1_1_1(
          __.float(0.49019607843137253),
          __.float(0.8274509803921568),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.sky400 = __.FM.float_4_1_1_1_1(
          __.float(0.2196078431372549),
          __.float(0.7411764705882353),
          __.float(0.9725490196078431),
          __.int(1)
        );
        color.sky500 = __.FM.float_4_1_1_1_1(
          __.float(0.054901960784313725),
          __.float(0.6470588235294118),
          __.float(0.9137254901960784),
          __.int(1)
        );
        color.sky600 = __.FM.float_4_1_1_1_1(
          __.float(0.00784313725490196),
          __.float(0.5176470588235295),
          __.float(0.7803921568627451),
          __.int(1)
        );
        color.sky700 = __.FM.float_4_1_1_1_1(
          __.float(0.011764705882352941),
          __.float(0.4117647058823529),
          __.float(0.6313725490196078),
          __.int(1)
        );
        color.sky800 = __.FM.float_4_1_1_1_1(
          __.float(0.027450980392156862),
          __.float(0.34901960784313724),
          __.float(0.5215686274509804),
          __.int(1)
        );
        color.sky900 = __.FM.float_4_1_1_1_1(
          __.float(0.047058823529411764),
          __.float(0.2901960784313726),
          __.float(0.43137254901960786),
          __.int(1)
        );
        color.sky950 = __.FM.float_4_1_1_1_1(
          __.float(0.03137254901960784),
          __.float(0.1843137254901961),
          __.float(0.28627450980392155),
          __.int(1)
        );
        color.blue50 = __.FM.float_4_1_1_1_1(
          __.float(0.9372549019607843),
          __.float(0.9647058823529412),
          __.int(1),
          __.int(1)
        );
        color.blue100 = __.FM.float_4_1_1_1_1(
          __.float(0.8588235294117647),
          __.float(0.9176470588235294),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.blue200 = __.FM.float_4_1_1_1_1(
          __.float(0.7490196078431373),
          __.float(0.8588235294117647),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.blue300 = __.FM.float_4_1_1_1_1(
          __.float(0.5764705882352941),
          __.float(0.7725490196078432),
          __.float(0.9921568627450981),
          __.int(1)
        );
        color.blue400 = __.FM.float_4_1_1_1_1(
          __.float(0.3764705882352941),
          __.float(0.6470588235294118),
          __.float(0.9803921568627451),
          __.int(1)
        );
        color.blue500 = __.FM.float_4_1_1_1_1(
          __.float(0.23137254901960785),
          __.float(0.5098039215686274),
          __.float(0.9647058823529412),
          __.int(1)
        );
        color.blue600 = __.FM.float_4_1_1_1_1(
          __.float(0.1450980392156863),
          __.float(0.38823529411764707),
          __.float(0.9215686274509803),
          __.int(1)
        );
        color.blue700 = __.FM.float_4_1_1_1_1(
          __.float(0.11372549019607843),
          __.float(0.3058823529411765),
          __.float(0.8470588235294118),
          __.int(1)
        );
        color.blue800 = __.FM.float_4_1_1_1_1(
          __.float(0.11764705882352941),
          __.float(0.25098039215686274),
          __.float(0.6862745098039216),
          __.int(1)
        );
        color.blue900 = __.FM.float_4_1_1_1_1(
          __.float(0.11764705882352941),
          __.float(0.22745098039215686),
          __.float(0.5411764705882353),
          __.int(1)
        );
        color.blue950 = __.FM.float_4_1_1_1_1(
          __.float(0.09019607843137255),
          __.float(0.1450980392156863),
          __.float(0.32941176470588235),
          __.int(1)
        );
        color.indigo50 = __.FM.float_4_1_1_1_1(
          __.float(0.9333333333333333),
          __.float(0.9490196078431372),
          __.int(1),
          __.int(1)
        );
        color.indigo100 = __.FM.float_4_1_1_1_1(
          __.float(0.8784313725490196),
          __.float(0.9058823529411765),
          __.int(1),
          __.int(1)
        );
        color.indigo200 = __.FM.float_4_1_1_1_1(
          __.float(0.7803921568627451),
          __.float(0.8235294117647058),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.indigo300 = __.FM.float_4_1_1_1_1(
          __.float(0.6470588235294118),
          __.float(0.7058823529411765),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.indigo400 = __.FM.float_4_1_1_1_1(
          __.float(0.5058823529411764),
          __.float(0.5490196078431373),
          __.float(0.9725490196078431),
          __.int(1)
        );
        color.indigo500 = __.FM.float_4_1_1_1_1(
          __.float(0.38823529411764707),
          __.float(0.4),
          __.float(0.9450980392156862),
          __.int(1)
        );
        color.indigo600 = __.FM.float_4_1_1_1_1(
          __.float(0.30980392156862746),
          __.float(0.27450980392156865),
          __.float(0.8980392156862745),
          __.int(1)
        );
        color.indigo700 = __.FM.float_4_1_1_1_1(
          __.float(0.2627450980392157),
          __.float(0.2196078431372549),
          __.float(0.792156862745098),
          __.int(1)
        );
        color.indigo800 = __.FM.float_4_1_1_1_1(
          __.float(0.21568627450980393),
          __.float(0.18823529411764706),
          __.float(0.6392156862745098),
          __.int(1)
        );
        color.indigo900 = __.FM.float_4_1_1_1_1(
          __.float(0.19215686274509805),
          __.float(0.1803921568627451),
          __.float(0.5058823529411764),
          __.int(1)
        );
        color.indigo950 = __.FM.float_4_1_1_1_1(
          __.float(0.11764705882352941),
          __.float(0.10588235294117647),
          __.float(0.29411764705882354),
          __.int(1)
        );
        color.violet50 = __.FM.float_4_1_1_1_1(
          __.float(0.9607843137254902),
          __.float(0.9529411764705882),
          __.int(1),
          __.int(1)
        );
        color.violet100 = __.FM.float_4_1_1_1_1(
          __.float(0.9294117647058824),
          __.float(0.9137254901960784),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.violet200 = __.FM.float_4_1_1_1_1(
          __.float(0.8666666666666667),
          __.float(0.8392156862745098),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.violet300 = __.FM.float_4_1_1_1_1(
          __.float(0.7686274509803922),
          __.float(0.7098039215686275),
          __.float(0.9921568627450981),
          __.int(1)
        );
        color.violet400 = __.FM.float_4_1_1_1_1(
          __.float(0.6549019607843137),
          __.float(0.5450980392156862),
          __.float(0.9803921568627451),
          __.int(1)
        );
        color.violet500 = __.FM.float_4_1_1_1_1(
          __.float(0.5450980392156862),
          __.float(0.3607843137254902),
          __.float(0.9647058823529412),
          __.int(1)
        );
        color.violet600 = __.FM.float_4_1_1_1_1(
          __.float(0.48627450980392156),
          __.float(0.22745098039215686),
          __.float(0.9294117647058824),
          __.int(1)
        );
        color.violet700 = __.FM.float_4_1_1_1_1(
          __.float(0.42745098039215684),
          __.float(0.1568627450980392),
          __.float(0.8509803921568627),
          __.int(1)
        );
        color.violet800 = __.FM.float_4_1_1_1_1(
          __.float(0.3568627450980392),
          __.float(0.12941176470588237),
          __.float(0.7137254901960784),
          __.int(1)
        );
        color.violet900 = __.FM.float_4_1_1_1_1(
          __.float(0.2980392156862745),
          __.float(0.11372549019607843),
          __.float(0.5843137254901961),
          __.int(1)
        );
        color.violet950 = __.FM.float_4_1_1_1_1(
          __.float(0.1803921568627451),
          __.float(0.06274509803921569),
          __.float(0.396078431372549),
          __.int(1)
        );
        color.purple50 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.9607843137254902),
          __.int(1),
          __.int(1)
        );
        color.purple100 = __.FM.float_4_1_1_1_1(
          __.float(0.9529411764705882),
          __.float(0.9098039215686274),
          __.int(1),
          __.int(1)
        );
        color.purple200 = __.FM.float_4_1_1_1_1(
          __.float(0.9137254901960784),
          __.float(0.8352941176470589),
          __.int(1),
          __.int(1)
        );
        color.purple300 = __.FM.float_4_1_1_1_1(
          __.float(0.8470588235294118),
          __.float(0.7058823529411765),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.purple400 = __.FM.float_4_1_1_1_1(
          __.float(0.7529411764705882),
          __.float(0.5176470588235295),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.purple500 = __.FM.float_4_1_1_1_1(
          __.float(0.6588235294117647),
          __.float(0.3333333333333333),
          __.float(0.9686274509803922),
          __.int(1)
        );
        color.purple600 = __.FM.float_4_1_1_1_1(
          __.float(0.5764705882352941),
          __.float(0.2),
          __.float(0.9176470588235294),
          __.int(1)
        );
        color.purple700 = __.FM.float_4_1_1_1_1(
          __.float(0.49411764705882355),
          __.float(0.13333333333333333),
          __.float(0.807843137254902),
          __.int(1)
        );
        color.purple800 = __.FM.float_4_1_1_1_1(
          __.float(0.4196078431372549),
          __.float(0.12941176470588237),
          __.float(0.6588235294117647),
          __.int(1)
        );
        color.purple900 = __.FM.float_4_1_1_1_1(
          __.float(0.34509803921568627),
          __.float(0.10980392156862745),
          __.float(0.5294117647058824),
          __.int(1)
        );
        color.purple950 = __.FM.float_4_1_1_1_1(
          __.float(0.23137254901960785),
          __.float(0.027450980392156862),
          __.float(0.39215686274509803),
          __.int(1)
        );
        color.fuchsia50 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.9568627450980393),
          __.int(1),
          __.int(1)
        );
        color.fuchsia100 = __.FM.float_4_1_1_1_1(
          __.float(0.9803921568627451),
          __.float(0.9098039215686274),
          __.int(1),
          __.int(1)
        );
        color.fuchsia200 = __.FM.float_4_1_1_1_1(
          __.float(0.9607843137254902),
          __.float(0.8156862745098039),
          __.float(0.996078431372549),
          __.int(1)
        );
        color.fuchsia300 = __.FM.float_4_1_1_1_1(
          __.float(0.9411764705882353),
          __.float(0.6705882352941176),
          __.float(0.9882352941176471),
          __.int(1)
        );
        color.fuchsia400 = __.FM.float_4_1_1_1_1(
          __.float(0.9098039215686274),
          __.float(0.4745098039215686),
          __.float(0.9764705882352941),
          __.int(1)
        );
        color.fuchsia500 = __.FM.float_4_1_1_1_1(
          __.float(0.8509803921568627),
          __.float(0.27450980392156865),
          __.float(0.9372549019607843),
          __.int(1)
        );
        color.fuchsia600 = __.FM.float_4_1_1_1_1(
          __.float(0.7529411764705882),
          __.float(0.14901960784313725),
          __.float(0.8274509803921568),
          __.int(1)
        );
        color.fuchsia700 = __.FM.float_4_1_1_1_1(
          __.float(0.6352941176470588),
          __.float(0.10980392156862745),
          __.float(0.6862745098039216),
          __.int(1)
        );
        color.fuchsia800 = __.FM.float_4_1_1_1_1(
          __.float(0.5254901960784314),
          __.float(0.09803921568627451),
          __.float(0.5607843137254902),
          __.int(1)
        );
        color.fuchsia900 = __.FM.float_4_1_1_1_1(
          __.float(0.4392156862745098),
          __.float(0.10196078431372549),
          __.float(0.4588235294117647),
          __.int(1)
        );
        color.fuchsia950 = __.FM.float_4_1_1_1_1(
          __.float(0.2901960784313726),
          __.float(0.01568627450980392),
          __.float(0.3058823529411765),
          __.int(1)
        );
        color.pink50 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.9490196078431372),
          __.float(0.9725490196078431),
          __.int(1)
        );
        color.pink100 = __.FM.float_4_1_1_1_1(
          __.float(0.9882352941176471),
          __.float(0.9058823529411765),
          __.float(0.9529411764705882),
          __.int(1)
        );
        color.pink200 = __.FM.float_4_1_1_1_1(
          __.float(0.984313725490196),
          __.float(0.8117647058823529),
          __.float(0.9098039215686274),
          __.int(1)
        );
        color.pink300 = __.FM.float_4_1_1_1_1(
          __.float(0.9764705882352941),
          __.float(0.6588235294117647),
          __.float(0.8313725490196079),
          __.int(1)
        );
        color.pink400 = __.FM.float_4_1_1_1_1(
          __.float(0.9568627450980393),
          __.float(0.4470588235294118),
          __.float(0.7137254901960784),
          __.int(1)
        );
        color.pink500 = __.FM.float_4_1_1_1_1(
          __.float(0.9254901960784314),
          __.float(0.2823529411764706),
          __.float(0.6),
          __.int(1)
        );
        color.pink600 = __.FM.float_4_1_1_1_1(
          __.float(0.8588235294117647),
          __.float(0.15294117647058825),
          __.float(0.4666666666666667),
          __.int(1)
        );
        color.pink700 = __.FM.float_4_1_1_1_1(
          __.float(0.7450980392156863),
          __.float(0.09411764705882353),
          __.float(0.36470588235294116),
          __.int(1)
        );
        color.pink800 = __.FM.float_4_1_1_1_1(
          __.float(0.615686274509804),
          __.float(0.09019607843137255),
          __.float(0.30196078431372547),
          __.int(1)
        );
        color.pink900 = __.FM.float_4_1_1_1_1(
          __.float(0.5137254901960784),
          __.float(0.09411764705882353),
          __.float(0.2627450980392157),
          __.int(1)
        );
        color.pink950 = __.FM.float_4_1_1_1_1(
          __.float(0.3137254901960784),
          __.float(0.027450980392156862),
          __.float(0.1411764705882353),
          __.int(1)
        );
        color.rose50 = __.FM.float_4_1_1_1_1(
          __.int(1),
          __.float(0.9450980392156862),
          __.float(0.9490196078431372),
          __.int(1)
        );
        color.rose100 = __.FM.float_4_1_1_1_1(
          __.int(1),
          __.float(0.8941176470588236),
          __.float(0.9019607843137255),
          __.int(1)
        );
        color.rose200 = __.FM.float_4_1_1_1_1(
          __.float(0.996078431372549),
          __.float(0.803921568627451),
          __.float(0.8274509803921568),
          __.int(1)
        );
        color.rose300 = __.FM.float_4_1_1_1_1(
          __.float(0.9921568627450981),
          __.float(0.6431372549019608),
          __.float(0.6862745098039216),
          __.int(1)
        );
        color.rose400 = __.FM.float_4_1_1_1_1(
          __.float(0.984313725490196),
          __.float(0.44313725490196076),
          __.float(0.5215686274509804),
          __.int(1)
        );
        color.rose500 = __.FM.float_4_1_1_1_1(
          __.float(0.9568627450980393),
          __.float(0.24705882352941178),
          __.float(0.3686274509803922),
          __.int(1)
        );
        color.rose600 = __.FM.float_4_1_1_1_1(
          __.float(0.8823529411764706),
          __.float(0.11372549019607843),
          __.float(0.2823529411764706),
          __.int(1)
        );
        color.rose700 = __.FM.float_4_1_1_1_1(
          __.float(0.7450980392156863),
          __.float(0.07058823529411765),
          __.float(0.23529411764705882),
          __.int(1)
        );
        color.rose800 = __.FM.float_4_1_1_1_1(
          __.float(0.6235294117647059),
          __.float(0.07058823529411765),
          __.float(0.2235294117647059),
          __.int(1)
        );
        color.rose900 = __.FM.float_4_1_1_1_1(
          __.float(0.5333333333333333),
          __.float(0.07450980392156863),
          __.float(0.21568627450980393),
          __.int(1)
        );
        color.rose950 = __.FM.float_4_1_1_1_1(
          __.float(0.2980392156862745),
          __.float(0.0196078431372549),
          __.float(0.09803921568627451),
          __.int(1)
        );
        return color;
      })();
      exports.color = color;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_common_ts_57071_color","fields":[["slate50",{"type":"primitive","name":"float4"}],["slate100",{"type":"primitive","name":"float4"}],["slate200",{"type":"primitive","name":"float4"}],["slate300",{"type":"primitive","name":"float4"}],["slate400",{"type":"primitive","name":"float4"}],["slate500",{"type":"primitive","name":"float4"}],["slate600",{"type":"primitive","name":"float4"}],["slate700",{"type":"primitive","name":"float4"}],["slate800",{"type":"primitive","name":"float4"}],["slate900",{"type":"primitive","name":"float4"}],["slate950",{"type":"primitive","name":"float4"}],["gray50",{"type":"primitive","name":"float4"}],["gray100",{"type":"primitive","name":"float4"}],["gray200",{"type":"primitive","name":"float4"}],["gray300",{"type":"primitive","name":"float4"}],["gray400",{"type":"primitive","name":"float4"}],["gray500",{"type":"primitive","name":"float4"}],["gray600",{"type":"primitive","name":"float4"}],["gray700",{"type":"primitive","name":"float4"}],["gray800",{"type":"primitive","name":"float4"}],["gray900",{"type":"primitive","name":"float4"}],["gray950",{"type":"primitive","name":"float4"}],["zinc50",{"type":"primitive","name":"float4"}],["zinc100",{"type":"primitive","name":"float4"}],["zinc200",{"type":"primitive","name":"float4"}],["zinc300",{"type":"primitive","name":"float4"}],["zinc400",{"type":"primitive","name":"float4"}],["zinc500",{"type":"primitive","name":"float4"}],["zinc600",{"type":"primitive","name":"float4"}],["zinc700",{"type":"primitive","name":"float4"}],["zinc800",{"type":"primitive","name":"float4"}],["zinc900",{"type":"primitive","name":"float4"}],["zinc950",{"type":"primitive","name":"float4"}],["neutral50",{"type":"primitive","name":"float4"}],["neutral100",{"type":"primitive","name":"float4"}],["neutral200",{"type":"primitive","name":"float4"}],["neutral300",{"type":"primitive","name":"float4"}],["neutral400",{"type":"primitive","name":"float4"}],["neutral500",{"type":"primitive","name":"float4"}],["neutral600",{"type":"primitive","name":"float4"}],["neutral700",{"type":"primitive","name":"float4"}],["neutral800",{"type":"primitive","name":"float4"}],["neutral900",{"type":"primitive","name":"float4"}],["neutral950",{"type":"primitive","name":"float4"}],["stone50",{"type":"primitive","name":"float4"}],["stone100",{"type":"primitive","name":"float4"}],["stone200",{"type":"primitive","name":"float4"}],["stone300",{"type":"primitive","name":"float4"}],["stone400",{"type":"primitive","name":"float4"}],["stone500",{"type":"primitive","name":"float4"}],["stone600",{"type":"primitive","name":"float4"}],["stone700",{"type":"primitive","name":"float4"}],["stone800",{"type":"primitive","name":"float4"}],["stone900",{"type":"primitive","name":"float4"}],["stone950",{"type":"primitive","name":"float4"}],["red50",{"type":"primitive","name":"float4"}],["red100",{"type":"primitive","name":"float4"}],["red200",{"type":"primitive","name":"float4"}],["red300",{"type":"primitive","name":"float4"}],["red400",{"type":"primitive","name":"float4"}],["red500",{"type":"primitive","name":"float4"}],["red600",{"type":"primitive","name":"float4"}],["red700",{"type":"primitive","name":"float4"}],["red800",{"type":"primitive","name":"float4"}],["red900",{"type":"primitive","name":"float4"}],["red950",{"type":"primitive","name":"float4"}],["orange50",{"type":"primitive","name":"float4"}],["orange100",{"type":"primitive","name":"float4"}],["orange200",{"type":"primitive","name":"float4"}],["orange300",{"type":"primitive","name":"float4"}],["orange400",{"type":"primitive","name":"float4"}],["orange500",{"type":"primitive","name":"float4"}],["orange600",{"type":"primitive","name":"float4"}],["orange700",{"type":"primitive","name":"float4"}],["orange800",{"type":"primitive","name":"float4"}],["orange900",{"type":"primitive","name":"float4"}],["orange950",{"type":"primitive","name":"float4"}],["amber50",{"type":"primitive","name":"float4"}],["amber100",{"type":"primitive","name":"float4"}],["amber200",{"type":"primitive","name":"float4"}],["amber300",{"type":"primitive","name":"float4"}],["amber400",{"type":"primitive","name":"float4"}],["amber500",{"type":"primitive","name":"float4"}],["amber600",{"type":"primitive","name":"float4"}],["amber700",{"type":"primitive","name":"float4"}],["amber800",{"type":"primitive","name":"float4"}],["amber900",{"type":"primitive","name":"float4"}],["amber950",{"type":"primitive","name":"float4"}],["yellow50",{"type":"primitive","name":"float4"}],["yellow100",{"type":"primitive","name":"float4"}],["yellow200",{"type":"primitive","name":"float4"}],["yellow300",{"type":"primitive","name":"float4"}],["yellow400",{"type":"primitive","name":"float4"}],["yellow500",{"type":"primitive","name":"float4"}],["yellow600",{"type":"primitive","name":"float4"}],["yellow700",{"type":"primitive","name":"float4"}],["yellow800",{"type":"primitive","name":"float4"}],["yellow900",{"type":"primitive","name":"float4"}],["yellow950",{"type":"primitive","name":"float4"}],["lime50",{"type":"primitive","name":"float4"}],["lime100",{"type":"primitive","name":"float4"}],["lime200",{"type":"primitive","name":"float4"}],["lime300",{"type":"primitive","name":"float4"}],["lime400",{"type":"primitive","name":"float4"}],["lime500",{"type":"primitive","name":"float4"}],["lime600",{"type":"primitive","name":"float4"}],["lime700",{"type":"primitive","name":"float4"}],["lime800",{"type":"primitive","name":"float4"}],["lime900",{"type":"primitive","name":"float4"}],["lime950",{"type":"primitive","name":"float4"}],["green50",{"type":"primitive","name":"float4"}],["green100",{"type":"primitive","name":"float4"}],["green200",{"type":"primitive","name":"float4"}],["green300",{"type":"primitive","name":"float4"}],["green400",{"type":"primitive","name":"float4"}],["green500",{"type":"primitive","name":"float4"}],["green600",{"type":"primitive","name":"float4"}],["green700",{"type":"primitive","name":"float4"}],["green800",{"type":"primitive","name":"float4"}],["green900",{"type":"primitive","name":"float4"}],["green950",{"type":"primitive","name":"float4"}],["emerald50",{"type":"primitive","name":"float4"}],["emerald100",{"type":"primitive","name":"float4"}],["emerald200",{"type":"primitive","name":"float4"}],["emerald300",{"type":"primitive","name":"float4"}],["emerald400",{"type":"primitive","name":"float4"}],["emerald500",{"type":"primitive","name":"float4"}],["emerald600",{"type":"primitive","name":"float4"}],["emerald700",{"type":"primitive","name":"float4"}],["emerald800",{"type":"primitive","name":"float4"}],["emerald900",{"type":"primitive","name":"float4"}],["emerald950",{"type":"primitive","name":"float4"}],["teal50",{"type":"primitive","name":"float4"}],["teal100",{"type":"primitive","name":"float4"}],["teal200",{"type":"primitive","name":"float4"}],["teal300",{"type":"primitive","name":"float4"}],["teal400",{"type":"primitive","name":"float4"}],["teal500",{"type":"primitive","name":"float4"}],["teal600",{"type":"primitive","name":"float4"}],["teal700",{"type":"primitive","name":"float4"}],["teal800",{"type":"primitive","name":"float4"}],["teal900",{"type":"primitive","name":"float4"}],["teal950",{"type":"primitive","name":"float4"}],["cyan50",{"type":"primitive","name":"float4"}],["cyan100",{"type":"primitive","name":"float4"}],["cyan200",{"type":"primitive","name":"float4"}],["cyan300",{"type":"primitive","name":"float4"}],["cyan400",{"type":"primitive","name":"float4"}],["cyan500",{"type":"primitive","name":"float4"}],["cyan600",{"type":"primitive","name":"float4"}],["cyan700",{"type":"primitive","name":"float4"}],["cyan800",{"type":"primitive","name":"float4"}],["cyan900",{"type":"primitive","name":"float4"}],["cyan950",{"type":"primitive","name":"float4"}],["sky50",{"type":"primitive","name":"float4"}],["sky100",{"type":"primitive","name":"float4"}],["sky200",{"type":"primitive","name":"float4"}],["sky300",{"type":"primitive","name":"float4"}],["sky400",{"type":"primitive","name":"float4"}],["sky500",{"type":"primitive","name":"float4"}],["sky600",{"type":"primitive","name":"float4"}],["sky700",{"type":"primitive","name":"float4"}],["sky800",{"type":"primitive","name":"float4"}],["sky900",{"type":"primitive","name":"float4"}],["sky950",{"type":"primitive","name":"float4"}],["blue50",{"type":"primitive","name":"float4"}],["blue100",{"type":"primitive","name":"float4"}],["blue200",{"type":"primitive","name":"float4"}],["blue300",{"type":"primitive","name":"float4"}],["blue400",{"type":"primitive","name":"float4"}],["blue500",{"type":"primitive","name":"float4"}],["blue600",{"type":"primitive","name":"float4"}],["blue700",{"type":"primitive","name":"float4"}],["blue800",{"type":"primitive","name":"float4"}],["blue900",{"type":"primitive","name":"float4"}],["blue950",{"type":"primitive","name":"float4"}],["indigo50",{"type":"primitive","name":"float4"}],["indigo100",{"type":"primitive","name":"float4"}],["indigo200",{"type":"primitive","name":"float4"}],["indigo300",{"type":"primitive","name":"float4"}],["indigo400",{"type":"primitive","name":"float4"}],["indigo500",{"type":"primitive","name":"float4"}],["indigo600",{"type":"primitive","name":"float4"}],["indigo700",{"type":"primitive","name":"float4"}],["indigo800",{"type":"primitive","name":"float4"}],["indigo900",{"type":"primitive","name":"float4"}],["indigo950",{"type":"primitive","name":"float4"}],["violet50",{"type":"primitive","name":"float4"}],["violet100",{"type":"primitive","name":"float4"}],["violet200",{"type":"primitive","name":"float4"}],["violet300",{"type":"primitive","name":"float4"}],["violet400",{"type":"primitive","name":"float4"}],["violet500",{"type":"primitive","name":"float4"}],["violet600",{"type":"primitive","name":"float4"}],["violet700",{"type":"primitive","name":"float4"}],["violet800",{"type":"primitive","name":"float4"}],["violet900",{"type":"primitive","name":"float4"}],["violet950",{"type":"primitive","name":"float4"}],["purple50",{"type":"primitive","name":"float4"}],["purple100",{"type":"primitive","name":"float4"}],["purple200",{"type":"primitive","name":"float4"}],["purple300",{"type":"primitive","name":"float4"}],["purple400",{"type":"primitive","name":"float4"}],["purple500",{"type":"primitive","name":"float4"}],["purple600",{"type":"primitive","name":"float4"}],["purple700",{"type":"primitive","name":"float4"}],["purple800",{"type":"primitive","name":"float4"}],["purple900",{"type":"primitive","name":"float4"}],["purple950",{"type":"primitive","name":"float4"}],["fuchsia50",{"type":"primitive","name":"float4"}],["fuchsia100",{"type":"primitive","name":"float4"}],["fuchsia200",{"type":"primitive","name":"float4"}],["fuchsia300",{"type":"primitive","name":"float4"}],["fuchsia400",{"type":"primitive","name":"float4"}],["fuchsia500",{"type":"primitive","name":"float4"}],["fuchsia600",{"type":"primitive","name":"float4"}],["fuchsia700",{"type":"primitive","name":"float4"}],["fuchsia800",{"type":"primitive","name":"float4"}],["fuchsia900",{"type":"primitive","name":"float4"}],["fuchsia950",{"type":"primitive","name":"float4"}],["pink50",{"type":"primitive","name":"float4"}],["pink100",{"type":"primitive","name":"float4"}],["pink200",{"type":"primitive","name":"float4"}],["pink300",{"type":"primitive","name":"float4"}],["pink400",{"type":"primitive","name":"float4"}],["pink500",{"type":"primitive","name":"float4"}],["pink600",{"type":"primitive","name":"float4"}],["pink700",{"type":"primitive","name":"float4"}],["pink800",{"type":"primitive","name":"float4"}],["pink900",{"type":"primitive","name":"float4"}],["pink950",{"type":"primitive","name":"float4"}],["rose50",{"type":"primitive","name":"float4"}],["rose100",{"type":"primitive","name":"float4"}],["rose200",{"type":"primitive","name":"float4"}],["rose300",{"type":"primitive","name":"float4"}],["rose400",{"type":"primitive","name":"float4"}],["rose500",{"type":"primitive","name":"float4"}],["rose600",{"type":"primitive","name":"float4"}],["rose700",{"type":"primitive","name":"float4"}],["rose800",{"type":"primitive","name":"float4"}],["rose900",{"type":"primitive","name":"float4"}],["rose950",{"type":"primitive","name":"float4"}]]}'
        ),
        color
      );
      function wrap2(value, low, high) {
        return __.makeVector(
          (0, std_math_1.wrap)(value[0], low, high),
          (0, std_math_1.wrap)(value[1], low, high)
        );
      }
      exports.wrap2 = wrap2;
      function wrap3(value, low, high) {
        return __.makeVector(
          (0, std_math_1.wrap)(value[0], low, high),
          (0, std_math_1.wrap)(value[1], low, high),
          (0, std_math_1.wrap)(value[2], low, high)
        );
      }
      exports.wrap3 = wrap3;
      function wrap4(value, low, high) {
        return __.makeVector(
          (0, std_math_1.wrap)(value[0], low, high),
          (0, std_math_1.wrap)(value[1], low, high),
          (0, std_math_1.wrap)(value[2], low, high),
          (0, std_math_1.wrap)(value[3], low, high)
        );
      }
      exports.wrap4 = wrap4;
    });
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/sdf.js", deps, func);
    var __createBinding =
      (this && this.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (this && this.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (this && this.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
    define([
      "require",
      "exports",
      "/std_math",
      "/std_math",
      "/std___std_all",
    ], function (require, exports, __, std_math_1, std___std_all_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sdf = void 0;
      __ = __importStar(__);
      var globalVarGet = std___std_all_1.globalVarGet;
      var sdf = /** @class */ (function () {
        function sdf(data) {}
        sdf.sphere = function (samplePosition, sphereCenter, radius) {
          var _a, _b;
          var p =
            ((_a = samplePosition),
            (_b = sphereCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var r = radius;
          return (0, std_math_1.length)(p) - r;
        };
        sdf.box = function (samplePosition, boxCenter, boxSize) {
          var _a, _b, _c, _d, _e;
          var p =
            ((_a = samplePosition),
            (_b = boxCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var s = boxSize;
          var q =
            ((_c =
              ((_e = p), [Math.abs(_e[0]), Math.abs(_e[1]), Math.abs(_e[2])])),
            (_d = s),
            [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          return (
            (0, std_math_1.length)((0, std_math_1.max)(q, 0.0)) +
            (0, std_math_1.min)(
              (0, std_math_1.max)(q[0], (0, std_math_1.max)(q[1], q[2])),
              0.0
            )
          );
        };
        sdf.roundBox = function (
          samplePosition,
          boxCenter,
          boxSize,
          cornerRadius
        ) {
          var _a, _b, _c, _d, _e;
          var p =
            ((_a = samplePosition),
            (_b = boxCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var s = boxSize;
          var r = cornerRadius;
          var q =
            ((_c =
              ((_e = p), [Math.abs(_e[0]), Math.abs(_e[1]), Math.abs(_e[2])])),
            (_d = s),
            [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          return (
            (0, std_math_1.length)((0, std_math_1.max)(q, 0.0)) +
            (0, std_math_1.min)(
              (0, std_math_1.max)(q[0], (0, std_math_1.max)(q[1], q[2])),
              0.0
            ) -
            r
          );
        };
        sdf.boxFrame = function (
          samplePosition,
          boxCenter,
          boxSize,
          frameThickness
        ) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
          var p =
            ((_a = samplePosition),
            (_b = boxCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var b = boxSize;
          var e = frameThickness;
          p =
            ((_c =
              ((_e = p), [Math.abs(_e[0]), Math.abs(_e[1]), Math.abs(_e[2])])),
            (_d = b),
            [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          var q =
            ((_f =
              ((_h =
                ((_j = p), (_k = e), [_j[0] + _k, _j[1] + _k, _j[2] + _k])),
              [Math.abs(_h[0]), Math.abs(_h[1]), Math.abs(_h[2])])),
            (_g = e),
            [_f[0] - _g, _f[1] - _g, _f[2] - _g]);
          return (0, std_math_1.min)(
            (0, std_math_1.min)(
              (0, std_math_1.length)(
                (0, std_math_1.max)(
                  __.FM.float_3_1_1_1(
                    __.swizzle(p, "x"),
                    __.swizzle(q, "y"),
                    __.swizzle(q, "z")
                  ),
                  0.0
                )
              ) +
                (0, std_math_1.min)(
                  (0, std_math_1.max)(p[0], (0, std_math_1.max)(q[1], q[2])),
                  0.0
                ),
              (0, std_math_1.length)(
                (0, std_math_1.max)(
                  __.FM.float_3_1_1_1(
                    __.swizzle(q, "x"),
                    __.swizzle(p, "y"),
                    __.swizzle(q, "z")
                  ),
                  0.0
                )
              ) +
                (0, std_math_1.min)(
                  (0, std_math_1.max)(q[0], (0, std_math_1.max)(p[1], q[2])),
                  0.0
                )
            ),
            (0, std_math_1.length)(
              (0, std_math_1.max)(
                __.FM.float_3_1_1_1(
                  __.swizzle(q, "x"),
                  __.swizzle(q, "y"),
                  __.swizzle(p, "z")
                ),
                0.0
              )
            ) +
              (0, std_math_1.min)(
                (0, std_math_1.max)(q[0], (0, std_math_1.max)(q[1], p[2])),
                0.0
              )
          );
        };
        sdf.torus = function (samplePosition, torusCenter, torusSize) {
          var _a, _b, _c;
          var p =
            ((_a = samplePosition),
            (_b = torusCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var t = torusSize;
          var q = __.FM.float_2_1_1(
            __.sub((0, std_math_1.length)(((_c = p), [_c[0], _c[2]])), t[0]),
            __.swizzle(p, "y")
          );
          return (0, std_math_1.length)(q) - t[1];
        };
        sdf.cappedTorus = function (
          samplePosition,
          torusCenter,
          torusSize,
          ra,
          rb
        ) {
          var _a, _b, _c, _d, _e;
          var p1 =
            ((_a = samplePosition),
            (_b = torusCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var p = __.makeVector(Math.abs(p1[0]), ((_c = p1), [_c[1], _c[2]]));
          var sc = torusSize;
          var k =
            sc[1] * p[0] > sc[0] * p[1]
              ? (0, std_math_1.dot)(((_d = p), [_d[0], _d[1]]), sc)
              : (0, std_math_1.length)(((_e = p), [_e[0], _e[1]]));
          return (
            Math.sqrt((0, std_math_1.dot)(p, p) + ra * ra - 2.0 * ra * k) - rb
          );
        };
        sdf.link = function (samplePosition, linkCenter, linkLength, r1, r2) {
          var _a, _b, _c;
          var p =
            ((_a = samplePosition),
            (_b = linkCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var le = linkLength;
          var q = __.FM.float_3_1_1_1(
            __.swizzle(p, "x"),
            (0, std_math_1.max)(Math.abs(p[1]) - le, 0.0),
            __.swizzle(p, "z")
          );
          return (
            (0, std_math_1.length)(
              __.FM.float_2_1_1(
                __.sub((0, std_math_1.length)(((_c = q), [_c[0], _c[1]])), r1),
                __.swizzle(q, "z")
              )
            ) - r2
          );
        };
        sdf.infinteCylinder = function (
          samplePosition,
          cylinderCenter,
          cylinderSize
        ) {
          var _a, _b, _c, _d, _e, _f;
          var p =
            ((_a = samplePosition),
            (_b = cylinderCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var c = cylinderSize;
          return (
            (0, std_math_1.length)(
              ((_c = ((_e = p), [_e[0], _e[2]])),
              (_d = ((_f = c), [_f[0], _f[1]])),
              [_c[0] - _d[0], _c[1] - _d[1]])
            ) - c[2]
          );
        };
        sdf.cone = function (samplePosition, coneCenter, c, coneHeight) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
          var p =
            ((_a = samplePosition),
            (_b = coneCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = coneHeight;
          // c is the sin/cos of the angle, h is height
          // Alternatively pass q instead of (c,h),
          // which is the point at the base in 2D
          var q =
            ((_c = h),
            (_d = __.FM.float_2_1_1(__.div(c[0], c[1]), __.negate(1.0))),
            [_c * _d[0], _c * _d[1]]);
          var w = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_e = p), [_e[0], _e[2]])),
            __.swizzle(p, "y")
          );
          var a =
            ((_f = w),
            (_g =
              ((_h = q),
              (_j = (0, std_math_1.clamp)(
                (0, std_math_1.dot)(w, q) / (0, std_math_1.dot)(q, q),
                0.0,
                1.0
              )),
              [_h[0] * _j, _h[1] * _j])),
            [_f[0] - _g[0], _f[1] - _g[1]]);
          var b =
            ((_k = w),
            (_l =
              ((_m = q),
              (_o = __.FM.float_2_1_1(
                (0, std_math_1.clamp)(w[0] / q[0], 0.0, 1.0),
                __.float(1.0)
              )),
              [_m[0] * _o[0], _m[1] * _o[1]])),
            [_k[0] - _l[0], _k[1] - _l[1]]);
          var k = Math.sign(q[1]);
          var d = (0, std_math_1.min)(
            (0, std_math_1.dot)(a, a),
            (0, std_math_1.dot)(b, b)
          );
          var s = (0, std_math_1.max)(
            k * (w[0] * q[1] - w[1] * q[0]),
            k * (w[1] - q[1])
          );
          return Math.sqrt(d) * Math.sign(s);
        };
        sdf.plane = function (
          samplePosition,
          planeCenter,
          planeNormal,
          planeHeight
        ) {
          var _a, _b;
          var p =
            ((_a = samplePosition),
            (_b = planeCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var n = planeNormal;
          var h = planeHeight;
          // n must be normalized
          return (0, std_math_1.dot)(p, n) + h;
        };
        sdf.hexPrism = function (samplePosition, hexCenter, hexSize) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          var p =
            ((_a = samplePosition),
            (_b = hexCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = hexSize;
          var k = __.FM.float_3_1_1_1(
            __.negate(0.8660254),
            __.float(0.5),
            __.float(0.57735)
          );
          p = ((_c = p), [Math.abs(_c[0]), Math.abs(_c[1]), Math.abs(_c[2])]);
          var dddd =
            (0, std_math_1.min)(
              (0, std_math_1.dot)(
                ((_d = k), [_d[0], _d[1]]),
                ((_e = p), [_e[0], _e[1]])
              ),
              0.0
            ) * 2.0;
          p =
            ((_f = p),
            (_g = __.FM.float_3_2_1(
              __.mul(dddd, ((_h = k), [_h[0], _h[1]])),
              __.float(0.0)
            )),
            [_f[0] - _g[0], _f[1] - _g[1], _f[2] - _g[2]]);
          var d = __.FM.float_2_1_1(
            __.mul(
              (0, std_math_1.length)(
                ((_j = ((_l = p), [_l[0], _l[1]])),
                (_k = __.FM.float_2_1_1(
                  (0, std_math_1.clamp)(
                    p[0],
                    __.FM.negate_1(k[2]) * h[0],
                    k[2] * h[0]
                  ),
                  __.swizzle(h, "x")
                )),
                [_j[0] - _k[0], _j[1] - _k[1]])
              ),
              Math.sign(p[1] - h[0])
            ),
            __.sub(p[2], h[1])
          );
          return (
            (0, std_math_1.min)((0, std_math_1.max)(d[0], d[1]), 0.0) +
            (0, std_math_1.length)((0, std_math_1.max)(d, 0.0))
          );
        };
        sdf.triPrism = function (samplePosition, triCenter, triSize) {
          var _a, _b, _c;
          var p =
            ((_a = samplePosition),
            (_b = triCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = triSize;
          var q =
            ((_c = p), [Math.abs(_c[0]), Math.abs(_c[1]), Math.abs(_c[2])]);
          return (0, std_math_1.max)(
            q[2] - h[1],
            (0, std_math_1.max)(
              q[0] * 0.866025 + p[1] * 0.5,
              __.FM.negate_1(p[1])
            ) -
              h[0] * 0.5
          );
        };
        sdf.capsuleLine = function (
          samplePosition,
          lineStart,
          lineEnd,
          capsuleRadius
        ) {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          var p = samplePosition;
          var a = lineStart;
          var b = lineEnd;
          var r = capsuleRadius;
          var pa =
            ((_a = p), (_b = a), [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var ba =
            ((_c = b), (_d = a), [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          var h = (0, std_math_1.clamp)(
            (0, std_math_1.dot)(pa, ba) / (0, std_math_1.dot)(ba, ba),
            0.0,
            1.0
          );
          return (
            (0, std_math_1.length)(
              ((_e = pa),
              (_f =
                ((_g = ba), (_h = h), [_g[0] * _h, _g[1] * _h, _g[2] * _h])),
              [_e[0] - _f[0], _e[1] - _f[1], _e[2] - _f[2]])
            ) - r
          );
        };
        sdf.capsule = function (samplePosition, capsuleCenter, height, radius) {
          var _a, _b;
          var p1 =
            ((_a = samplePosition),
            (_b = capsuleCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var r = radius;
          var p = __.makeVector(
            p1[0],
            p1[1] - (0, std_math_1.clamp)(p1[1], 0.0, h),
            p1[2]
          );
          return (0, std_math_1.length)(p) - r;
        };
        sdf.cylinder = function (
          samplePosition,
          cylinderCenter,
          height,
          radius
        ) {
          var _a, _b, _c, _d, _e, _f;
          var p =
            ((_a = samplePosition),
            (_b = cylinderCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var r = radius;
          var d =
            ((_c =
              ((_e = __.FM.float_2_1_1(
                (0, std_math_1.length)(((_f = p), [_f[0], _f[2]])),
                __.swizzle(p, "y")
              )),
              [Math.abs(_e[0]), Math.abs(_e[1])])),
            (_d = __.FM.float_2_1_1(r, h)),
            [_c[0] - _d[0], _c[1] - _d[1]]);
          return (
            (0, std_math_1.min)((0, std_math_1.max)(d[0], d[1]), 0.0) +
            (0, std_math_1.length)((0, std_math_1.max)(d, 0.0))
          );
        };
        sdf.cylinderLine = function (
          samplePosition,
          lineStart,
          lineEnd,
          radius
        ) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
          var p = samplePosition;
          var a = lineStart;
          var b = lineEnd;
          var r = radius;
          var ba =
            ((_a = b), (_b = a), [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var pa =
            ((_c = p), (_d = a), [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          var baba = (0, std_math_1.dot)(ba, ba);
          var paba = (0, std_math_1.dot)(pa, ba);
          var x =
            (0, std_math_1.length)(
              ((_e =
                ((_g = pa), (_h = baba), [_g[0] * _h, _g[1] * _h, _g[2] * _h])),
              (_f =
                ((_j = ba), (_k = paba), [_j[0] * _k, _j[1] * _k, _j[2] * _k])),
              [_e[0] - _f[0], _e[1] - _f[1], _e[2] - _f[2]])
            ) -
            r * baba;
          var y = Math.abs(paba - baba * 0.5) - baba * 0.5;
          var x2 = x * x;
          var y2 = y * y * baba;
          var mxxy = (0, std_math_1.max)(x, y);
          var d =
            mxxy < 0.0
              ? __.FM.negate_1((0, std_math_1.min)(x2, y2))
              : (x > 0.0 ? x2 : 0.0) + (y > 0.0 ? y2 : 0.0);
          return (Math.sign(d) * Math.sqrt(Math.abs(d))) / baba;
        };
        sdf.roundedCylinder = function (
          samplePosition,
          cylinderCenter,
          cylinderRadius,
          cornerRadius,
          height
        ) {
          var _a, _b, _c;
          var p =
            ((_a = samplePosition),
            (_b = cylinderCenter),
            [_a[0] - _b, _a[1] - _b, _a[2] - _b]);
          var h = height;
          var ra = cylinderRadius;
          var rb = cornerRadius;
          var d = __.FM.float_2_1_1(
            __.add(
              (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])) - 2.0 * ra,
              rb
            ),
            __.sub(Math.abs(p[1]), h)
          );
          return (
            (0, std_math_1.min)((0, std_math_1.max)(d[0], d[1]), 0.0) +
            (0, std_math_1.length)((0, std_math_1.max)(d, 0.0)) -
            rb
          );
        };
        sdf.cappedCone = function (samplePosition, coneCenter, height, r1, r2) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          var p =
            ((_a = samplePosition),
            (_b = coneCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var q = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])),
            __.swizzle(p, "y")
          );
          var k1 = __.FM.float_2_1_1(r2, h);
          var k2 = __.FM.float_2_1_1(__.sub(r2, r1), __.mul(2.0, h));
          var ca = __.FM.float_2_1_1(
            __.sub(q[0], (0, std_math_1.min)(q[0], q[1] < 0.0 ? r1 : r2)),
            __.sub(Math.abs(q[1]), h)
          );
          var cb =
            ((_d = ((_f = q), (_g = k1), [_f[0] - _g[0], _f[1] - _g[1]])),
            (_e =
              ((_h = k2),
              (_j = (0, std_math_1.clamp)(
                (0, std_math_1.dot)(
                  ((_k = k1), (_l = q), [_k[0] - _l[0], _k[1] - _l[1]]),
                  k2
                ) / dot2(k2),
                0.0,
                1.0
              )),
              [_h[0] * _j, _h[1] * _j])),
            [_d[0] + _e[0], _d[1] + _e[1]]);
          var s = __.and(cb[0] < 0.0, ca[1] < 0.0) ? __.FM.negate_1(1.0) : 1.0;
          return s * Math.sqrt((0, std_math_1.min)(dot2(ca), dot2(cb)));
        };
        sdf.solidAngle = function (samplePosition, solidCenter, size, radius) {
          var _a, _b, _c, _d, _e, _f, _g;
          var p =
            ((_a = samplePosition),
            (_b = solidCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var c = size;
          var ra = radius;
          // c is the sin/cos of the angle
          var q = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])),
            __.swizzle(p, "y")
          );
          var l = (0, std_math_1.length)(q) - ra;
          var m = (0, std_math_1.length)(
            ((_d = q),
            (_e =
              ((_f = c),
              (_g = (0, std_math_1.clamp)((0, std_math_1.dot)(q, c), 0.0, ra)),
              [_f[0] * _g, _f[1] * _g])),
            [_d[0] - _e[0], _d[1] - _e[1]])
          );
          return (0, std_math_1.max)(
            l,
            m * Math.sign(c[1] * q[0] - c[0] * q[1])
          );
        };
        sdf.cutSphere = function (
          samplePosition,
          sphereCenter,
          radius,
          height
        ) {
          var _a, _b, _c, _d, _e;
          var p =
            ((_a = samplePosition),
            (_b = sphereCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var r = radius;
          // sampling independent computations (only depend on shape)
          var w = Math.sqrt(r * r - h * h);
          // sampling dependant computations
          var q = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])),
            __.swizzle(p, "y")
          );
          var s = (0, std_math_1.max)(
            (h - r) * q[0] * q[0] + w * w * (h + r - 2.0 * q[1]),
            h * q[0] - w * q[1]
          );
          return s < 0.0
            ? (0, std_math_1.length)(q) - r
            : q[0] < w
            ? h - q[1]
            : (0, std_math_1.length)(
                ((_d = q),
                (_e = __.FM.float_2_1_1(w, h)),
                [_d[0] - _e[0], _d[1] - _e[1]])
              );
        };
        sdf.cutHollowSphere = function (
          samplePosition,
          sphereCenter,
          radius,
          height,
          thickness
        ) {
          var _a, _b, _c, _d, _e;
          var p =
            ((_a = samplePosition),
            (_b = sphereCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var r = radius;
          var h = height;
          var t = thickness;
          // sampling independent computations (only depend on shape)
          var w = Math.sqrt(r * r - h * h);
          // sampling dependant computations
          var q = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])),
            __.swizzle(p, "y")
          );
          return (
            (h * q[0] < w * q[1]
              ? (0, std_math_1.length)(
                  ((_d = q),
                  (_e = __.FM.float_2_1_1(w, h)),
                  [_d[0] - _e[0], _d[1] - _e[1]])
                )
              : Math.abs((0, std_math_1.length)(q) - r)) - t
          );
        };
        sdf.roundCone = function (
          samplePosition,
          coneCenter,
          coneRadius,
          cornerRadius,
          height
        ) {
          var _a, _b, _c, _d, _e;
          var p =
            ((_a = samplePosition),
            (_b = coneCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var r1 = coneRadius;
          var r2 = cornerRadius;
          // sampling independent computations (only depend on shape)
          var b = (r1 - r2) / h;
          var a = Math.sqrt(1.0 - b * b);
          // sampling dependant computations
          var q = __.FM.float_2_1_1(
            (0, std_math_1.length)(((_c = p), [_c[0], _c[2]])),
            __.swizzle(p, "y")
          );
          var k = (0, std_math_1.dot)(q, __.FM.float_2_1_1(__.negate(b), a));
          if (k < 0.0) return (0, std_math_1.length)(q) - r1;
          if (k > a * h)
            return (
              (0, std_math_1.length)(
                ((_d = q),
                (_e = __.FM.float_2_1_1(__.float(0.0), h)),
                [_d[0] - _e[0], _d[1] - _e[1]])
              ) - r2
            );
          return (0, std_math_1.dot)(q, __.FM.float_2_1_1(a, b)) - r1;
        };
        sdf.ellipsoid = function (samplePosition, center, radius) {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          var p =
            ((_a = samplePosition),
            (_b = center),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var r = radius;
          var k0 = (0, std_math_1.length)(
            ((_c = p), (_d = r), [_c[0] / _d[0], _c[1] / _d[1], _c[2] / _d[2]])
          );
          var k1 = (0, std_math_1.length)(
            ((_e = p),
            (_f =
              ((_g = r),
              (_h = r),
              [_g[0] * _h[0], _g[1] * _h[1], _g[2] * _h[2]])),
            [_e[0] / _f[0], _e[1] / _f[1], _e[2] / _f[2]])
          );
          return (k0 * (k0 - 1.0)) / k1;
        };
        sdf.rhombus = function (
          samplePosition,
          rhombusCenter,
          la,
          lb,
          height,
          ra
        ) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
          var p =
            ((_a = samplePosition),
            (_b = rhombusCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          p = ((_c = p), [Math.abs(_c[0]), Math.abs(_c[1]), Math.abs(_c[2])]);
          var b = __.FM.float_2_1_1(la, lb);
          var f = (0, std_math_1.clamp)(
            ndot(
              b,
              ((_d = b),
              (_e =
                ((_f = 2.0),
                (_g = ((_h = p), [_h[0], _h[2]])),
                [_f * _g[0], _f * _g[1]])),
              [_d[0] - _e[0], _d[1] - _e[1]])
            ) / (0, std_math_1.dot)(b, b),
            __.FM.negate_1(1.0),
            1.0
          );
          var q = __.FM.float_2_1_1(
            __.sub(
              (0, std_math_1.length)(
                ((_j = ((_l = p), [_l[0], _l[2]])),
                (_k =
                  ((_m = ((_p = 0.5), (_q = b), [_p * _q[0], _p * _q[1]])),
                  (_o = __.FM.float_2_1_1(__.sub(1.0, f), __.add(1.0, f))),
                  [_m[0] * _o[0], _m[1] * _o[1]])),
                [_j[0] - _k[0], _j[1] - _k[1]])
              ) * Math.sign(p[0] * b[1] + p[2] * b[0] - b[0] * b[1]),
              ra
            ),
            __.sub(p[1], h)
          );
          return (
            (0, std_math_1.min)((0, std_math_1.max)(q[0], q[1]), 0.0) +
            (0, std_math_1.length)((0, std_math_1.max)(q, 0.0))
          );
        };
        sdf.octahedron = function (samplePosition, center, size) {
          var _a, _b, _c, _d, _e, _f, _g;
          var p =
            ((_a = samplePosition),
            (_b = center),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var s = size;
          p = ((_c = p), [Math.abs(_c[0]), Math.abs(_c[1]), Math.abs(_c[2])]);
          var m = p[0] + p[1] + p[2] - s;
          var q = ((_d = 0.0), [_d, _d, _d]);
          if (3.0 * p[0] < m) q = ((_e = p), [_e[0], _e[1], _e[2]]);
          else if (3.0 * p[1] < m) q = ((_f = p), [_f[1], _f[2], _f[0]]);
          else if (3.0 * p[2] < m) q = ((_g = p), [_g[2], _g[0], _g[1]]);
          else return m * 0.57735027;
          var k = (0, std_math_1.clamp)(0.5 * (q[2] - q[1] + s), 0.0, s);
          return (0, std_math_1.length)(
            __.FM.float_3_1_1_1(
              __.swizzle(q, "x"),
              __.add(q[1] - s, k),
              __.sub(q[2], k)
            )
          );
        };
        sdf.pyramid = function (samplePosition, pyramidCenter, height) {
          var _a, _b;
          var p1 =
            ((_a = samplePosition),
            (_b = pyramidCenter),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var h = height;
          var m2 = h * h + 0.25;
          var p2 = __.makeVector(Math.abs(p1[0]), p1[1], Math.abs(p1[2]));
          if (p1[2] > p1[0]) {
            p2 = __.makeVector(p2[2], p2[1], p2[0]);
          }
          p2 = __.makeVector(p2[0] - 0.5, p2[1], p2[2] - 0.5);
          var p = p2;
          var q = __.FM.float_3_1_1_1(
            __.swizzle(p, "z"),
            __.sub(h * p[1], 0.5 * p[0]),
            __.add(h * p[0], 0.5 * p[1])
          );
          var s = (0, std_math_1.max)(__.FM.negate_1(q[0]), 0.0);
          var t = (0, std_math_1.clamp)(
            (q[1] - 0.5 * p[2]) / (m2 + 0.25),
            0.0,
            1.0
          );
          var a = m2 * (q[0] + s) * (q[0] + s) + q[1] * q[1];
          var b =
            m2 * (q[0] + 0.5 * t) * (q[0] + 0.5 * t) +
            (q[1] - m2 * t) * (q[1] - m2 * t);
          var d2 =
            (0, std_math_1.min)(q[1], __.FM.negate_1(q[0]) * m2 - q[1] * 0.5) >
            0.0
              ? 0.0
              : (0, std_math_1.min)(a, b);
          return (
            Math.sqrt((d2 + q[2] * q[2]) / m2) *
            Math.sign((0, std_math_1.max)(q[2], __.FM.negate_1(p[1])))
          );
        };
        sdf.udTriangle = function (samplePosition, a, b, c) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z;
          var p = samplePosition;
          var ba =
            ((_a = b), (_b = a), [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var pa =
            ((_c = p), (_d = a), [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          var cb =
            ((_e = c), (_f = b), [_e[0] - _f[0], _e[1] - _f[1], _e[2] - _f[2]]);
          var pb =
            ((_g = p), (_h = b), [_g[0] - _h[0], _g[1] - _h[1], _g[2] - _h[2]]);
          var ac =
            ((_j = a), (_k = c), [_j[0] - _k[0], _j[1] - _k[1], _j[2] - _k[2]]);
          var pc =
            ((_l = p), (_m = c), [_l[0] - _m[0], _l[1] - _m[1], _l[2] - _m[2]]);
          var nor = (0, std_math_1.cross)(ba, ac);
          return Math.sqrt(
            Math.sign((0, std_math_1.dot)((0, std_math_1.cross)(ba, nor), pa)) +
              Math.sign(
                (0, std_math_1.dot)((0, std_math_1.cross)(cb, nor), pb)
              ) +
              Math.sign(
                (0, std_math_1.dot)((0, std_math_1.cross)(ac, nor), pc)
              ) <
              2.0
              ? (0, std_math_1.min)(
                  (0, std_math_1.min)(
                    dot3(
                      ((_o =
                        ((_q = ba),
                        (_r = (0, std_math_1.clamp)(
                          (0, std_math_1.dot)(ba, pa) / dot3(ba),
                          0.0,
                          1.0
                        )),
                        [_q[0] * _r, _q[1] * _r, _q[2] * _r])),
                      (_p = pa),
                      [_o[0] - _p[0], _o[1] - _p[1], _o[2] - _p[2]])
                    ),
                    dot3(
                      ((_s =
                        ((_u = cb),
                        (_v = (0, std_math_1.clamp)(
                          (0, std_math_1.dot)(cb, pb) / dot3(cb),
                          0.0,
                          1.0
                        )),
                        [_u[0] * _v, _u[1] * _v, _u[2] * _v])),
                      (_t = pb),
                      [_s[0] - _t[0], _s[1] - _t[1], _s[2] - _t[2]])
                    )
                  ),
                  dot3(
                    ((_w =
                      ((_y = ac),
                      (_z = (0, std_math_1.clamp)(
                        (0, std_math_1.dot)(ac, pc) / dot3(ac),
                        0.0,
                        1.0
                      )),
                      [_y[0] * _z, _y[1] * _z, _y[2] * _z])),
                    (_x = pc),
                    [_w[0] - _x[0], _w[1] - _x[1], _w[2] - _x[2]])
                  )
                )
              : ((0, std_math_1.dot)(nor, pa) * (0, std_math_1.dot)(nor, pa)) /
                  dot3(nor)
          );
        };
        sdf.udQuad = function (samplePosition, a, b, c, d) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y,
            _z,
            _0,
            _1,
            _2,
            _3,
            _4,
            _5,
            _6,
            _7;
          var p = samplePosition;
          var ba =
            ((_a = b), (_b = a), [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]);
          var pa =
            ((_c = p), (_d = a), [_c[0] - _d[0], _c[1] - _d[1], _c[2] - _d[2]]);
          var cb =
            ((_e = c), (_f = b), [_e[0] - _f[0], _e[1] - _f[1], _e[2] - _f[2]]);
          var pb =
            ((_g = p), (_h = b), [_g[0] - _h[0], _g[1] - _h[1], _g[2] - _h[2]]);
          var dc =
            ((_j = d), (_k = c), [_j[0] - _k[0], _j[1] - _k[1], _j[2] - _k[2]]);
          var pc =
            ((_l = p), (_m = c), [_l[0] - _m[0], _l[1] - _m[1], _l[2] - _m[2]]);
          var ad =
            ((_o = a), (_p = d), [_o[0] - _p[0], _o[1] - _p[1], _o[2] - _p[2]]);
          var pd =
            ((_q = p), (_r = d), [_q[0] - _r[0], _q[1] - _r[1], _q[2] - _r[2]]);
          var nor = (0, std_math_1.cross)(ba, ad);
          return Math.sqrt(
            Math.sign((0, std_math_1.dot)((0, std_math_1.cross)(ba, nor), pa)) +
              Math.sign(
                (0, std_math_1.dot)((0, std_math_1.cross)(cb, nor), pb)
              ) +
              Math.sign(
                (0, std_math_1.dot)((0, std_math_1.cross)(dc, nor), pc)
              ) +
              Math.sign(
                (0, std_math_1.dot)((0, std_math_1.cross)(ad, nor), pd)
              ) <
              3.0
              ? (0, std_math_1.min)(
                  (0, std_math_1.min)(
                    (0, std_math_1.min)(
                      dot3(
                        ((_s =
                          ((_u = ba),
                          (_v = (0, std_math_1.clamp)(
                            (0, std_math_1.dot)(ba, pa) / dot3(ba),
                            0.0,
                            1.0
                          )),
                          [_u[0] * _v, _u[1] * _v, _u[2] * _v])),
                        (_t = pa),
                        [_s[0] - _t[0], _s[1] - _t[1], _s[2] - _t[2]])
                      ),
                      dot3(
                        ((_w =
                          ((_y = cb),
                          (_z = (0, std_math_1.clamp)(
                            (0, std_math_1.dot)(cb, pb) / dot3(cb),
                            0.0,
                            1.0
                          )),
                          [_y[0] * _z, _y[1] * _z, _y[2] * _z])),
                        (_x = pb),
                        [_w[0] - _x[0], _w[1] - _x[1], _w[2] - _x[2]])
                      )
                    ),
                    dot3(
                      ((_0 =
                        ((_2 = dc),
                        (_3 = (0, std_math_1.clamp)(
                          (0, std_math_1.dot)(dc, pc) / dot3(dc),
                          0.0,
                          1.0
                        )),
                        [_2[0] * _3, _2[1] * _3, _2[2] * _3])),
                      (_1 = pc),
                      [_0[0] - _1[0], _0[1] - _1[1], _0[2] - _1[2]])
                    )
                  ),
                  dot3(
                    ((_4 =
                      ((_6 = ad),
                      (_7 = (0, std_math_1.clamp)(
                        (0, std_math_1.dot)(ad, pd) / dot3(ad),
                        0.0,
                        1.0
                      )),
                      [_6[0] * _7, _6[1] * _7, _6[2] * _7])),
                    (_5 = pd),
                    [_4[0] - _5[0], _4[1] - _5[1], _4[2] - _5[2]])
                  )
                )
              : ((0, std_math_1.dot)(nor, pa) * (0, std_math_1.dot)(nor, pa)) /
                  dot3(nor)
          );
        };
        /**
         * Returns the intersection of two SDFs
         * = max(a, b)
         */
        sdf.intersect = function (a, b) {
          return (0, std_math_1.max)(a, b);
        };
        /**
         * Returns the union of two SDFs
         * = min(a, b)
         */
        sdf.union = function (a, b) {
          return (0, std_math_1.min)(a, b);
        };
        sdf.subtract = function (a, b) {
          return (0, std_math_1.max)(__.FM.negate_1(a), b);
        };
        sdf.smoothIntersect = function (a, b, k) {
          var h = (0, std_math_1.clamp)(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
          return (0, std_math_1.lerp)(b, a, h) - k * h * (1.0 - h);
        };
        /**
         * Smoothly joins two SDFs using blending distance k
         */
        sdf.smoothUnion = function (a, b, k) {
          var d1 = a;
          var d2 = b;
          var h = (0, std_math_1.clamp)(0.5 + (0.5 * (d2 - d1)) / k, 0.0, 1.0);
          return (0, std_math_1.lerp)(d2, d1, h) - k * h * (1.0 - h);
        };
        sdf.smoothSubtract = function (a, b, k) {
          var d1 = a;
          var d2 = b;
          var h = (0, std_math_1.clamp)(0.5 - (0.5 * (d2 + d1)) / k, 0.0, 1.0);
          return (
            (0, std_math_1.lerp)(d2, __.FM.negate_1(d1), h) + k * h * (1.0 - h)
          );
        };
        /**
         * Blends between two SDFs using interpolation
         */
        sdf.blend = function (a, b, t) {
          return t * a + ((1 | 0) - t) * b;
        };
        sdf.round = function (a, r) {
          return a - r;
        };
        /**
         * Carve out the interior of an SDF
         */
        sdf.onion = function (a, thickness) {
          return Math.abs(a) - thickness;
        };
        sdf.grad = function (p, sampler) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
          var DELTA = 0.0001;
          return (
            (_a = __.FM.float_3_1_1_1(
              __.sub(
                sampler(
                  ((_c = p),
                  (_d = __.FM.float_3_1_1_1(
                    DELTA,
                    __.float(0.0),
                    __.float(0.0)
                  )),
                  [_c[0] + _d[0], _c[1] + _d[1], _c[2] + _d[2]])
                ),
                sampler(
                  ((_e = p),
                  (_f = __.FM.float_3_1_1_1(
                    DELTA,
                    __.float(0.0),
                    __.float(0.0)
                  )),
                  [_e[0] - _f[0], _e[1] - _f[1], _e[2] - _f[2]])
                )
              ),
              __.sub(
                sampler(
                  ((_g = p),
                  (_h = __.FM.float_3_1_1_1(
                    __.float(0.0),
                    DELTA,
                    __.float(0.0)
                  )),
                  [_g[0] + _h[0], _g[1] + _h[1], _g[2] + _h[2]])
                ),
                sampler(
                  ((_j = p),
                  (_k = __.FM.float_3_1_1_1(
                    __.float(0.0),
                    DELTA,
                    __.float(0.0)
                  )),
                  [_j[0] - _k[0], _j[1] - _k[1], _j[2] - _k[2]])
                )
              ),
              __.sub(
                sampler(
                  ((_l = p),
                  (_m = __.FM.float_3_1_1_1(
                    __.float(0.0),
                    __.float(0.0),
                    DELTA
                  )),
                  [_l[0] + _m[0], _l[1] + _m[1], _l[2] + _m[2]])
                ),
                sampler(
                  ((_o = p),
                  (_p = __.FM.float_3_1_1_1(
                    __.float(0.0),
                    __.float(0.0),
                    DELTA
                  )),
                  [_o[0] - _p[0], _o[1] - _p[1], _o[2] - _p[2]])
                )
              )
            )),
            (_b = 2.0 * DELTA),
            [_a[0] / _b, _a[1] / _b, _a[2] / _b]
          );
        };
        /**
         * Poorly returns the closest point on the surface of an SDF
         * This is an inaccurate method
         */
        sdf.closest = function (position, sampler) {
          var _a,
            _b,
            _c,
            _d,
            _e,
            _f,
            _g,
            _h,
            _j,
            _k,
            _l,
            _m,
            _o,
            _p,
            _q,
            _r,
            _s,
            _t,
            _u,
            _v,
            _w,
            _x,
            _y;
          var sep = 0.0001;
          var zero = (0, std_math_1.min)(env.frame, 0 | 0) | 0;
          var closest = position;
          var initialDist = sampler(position);
          var seed = 0 | 0;
          for (var j = 0 | 0; j < (200 | 0); j++) {
            var n = ((_a = 0.0), [_a, _a, _a]);
            var distSum = 0.0;
            for (var i = zero; i < (4 | 0); i++) {
              var e =
                ((_b = 0.5773),
                (_c =
                  ((_d =
                    ((_f = 2.0),
                    (_g = __.FM.float_3_1_1_1(
                      ((i + (3 | 0)) >> (1 | 0)) & (1 | 0),
                      (i >> (1 | 0)) & (1 | 0),
                      i & (1 | 0)
                    )),
                    [_f * _g[0], _f * _g[1], _f * _g[2]])),
                  (_e = 1.0),
                  [_d[0] - _e, _d[1] - _e, _d[2] - _e])),
                [_b * _c[0], _b * _c[1], _b * _c[2]]);
              var d = sampler(
                ((_h = closest),
                (_j =
                  ((_k = e), (_l = sep), [_k[0] * _l, _k[1] * _l, _k[2] * _l])),
                [_h[0] + _j[0], _h[1] + _j[1], _h[2] + _j[2]])
              );
              distSum = distSum + d;
              n =
                ((_m = n),
                (_o =
                  ((_p = e), (_q = d), [_p[0] * _q, _p[1] * _q, _p[2] * _q])),
                [_m[0] + _o[0], _m[1] + _o[1], _m[2] + _o[2]]);
            }
            closest =
              ((_r =
                ((_t =
                  ((_v =
                    ((_x = (0, std_math_1.normalize)(n)),
                    (_y = distSum),
                    [_x[0] * _y, _x[1] * _y, _x[2] * _y])),
                  (_w = __.FM.negate_1(1 | 0)),
                  [_v[0] * _w, _v[1] * _w, _v[2] * _w])),
                (_u = 4.0),
                [_t[0] / _u, _t[1] / _u, _t[2] / _u])),
              (_s = closest),
              [_r[0] + _s[0], _r[1] + _s[1], _r[2] + _s[2]]);
            if (distSum < 0.0001) {
              break;
            }
          }
          return closest;
        };
        sdf.normal = function (position, sampler) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
          var h = 0.1;
          var zero = (0, std_math_1.min)(env.frame, 0 | 0) | 0;
          var n = ((_a = 0.0), [_a, _a, _a]);
          var distSum = 0.0;
          for (var i = zero; i < (4 | 0); i++) {
            var e =
              ((_b = 0.5773),
              (_c =
                ((_d =
                  ((_f = 2.0),
                  (_g = __.FM.float_3_1_1_1(
                    ((i + (3 | 0)) >> (1 | 0)) & (1 | 0),
                    (i >> (1 | 0)) & (1 | 0),
                    i & (1 | 0)
                  )),
                  [_f * _g[0], _f * _g[1], _f * _g[2]])),
                (_e = 1.0),
                [_d[0] - _e, _d[1] - _e, _d[2] - _e])),
              [_b * _c[0], _b * _c[1], _b * _c[2]]);
            var d = sampler(
              ((_h = position),
              (_j = ((_k = e), (_l = h), [_k[0] * _l, _k[1] * _l, _k[2] * _l])),
              [_h[0] + _j[0], _h[1] + _j[1], _h[2] + _j[2]])
            );
            distSum = distSum + d;
            n =
              ((_m = n),
              (_o = ((_p = e), (_q = d), [_p[0] * _q, _p[1] * _q, _p[2] * _q])),
              [_m[0] + _o[0], _m[1] + _o[1], _m[2] + _o[2]]);
          }
          return (0, std_math_1.normalize)(n);
        };
        sdf.vizRings = function (d) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
          if (false) {
            var color_1 =
              ((_a = 1.0),
              (_b =
                ((_c = Math.sign(d)),
                (_d = __.FM.float_3_1_1_1(
                  __.float(0.1),
                  __.float(0.4),
                  __.float(0.7)
                )),
                [_c * _d[0], _c * _d[1], _c * _d[2]])),
              [_a - _b[0], _a - _b[1], _a - _b[2]]);
            color_1 =
              ((_e = color_1),
              (_f = 1.0 - Math.exp(__.FM.negate_1(4.0) * Math.abs(d))),
              [_e[0] * _f, _e[1] * _f, _e[2] * _f]);
            color_1 =
              ((_g = color_1),
              (_h = 0.8 + 0.2 * Math.cos(140.0 * d)),
              [_g[0] * _h, _g[1] * _h, _g[2] * _h]);
            color_1 = (0, std_math_1.lerp)(
              color_1,
              ((_j = 1.0), [_j, _j, _j]),
              1.0 - (0, std_math_1.smoothstep)(0.0, 0.015, Math.abs(d))
            );
            return __.makeVector(color_1, 1.0);
          } else {
            var size = 2 | 0;
            var fadeDist = 100 | 0;
            var v = (1 | 0) - (0, std_math_1.clamp)(d / fadeDist, 0 | 0, 1 | 0);
            var color_2 = __.makeVector(0.4 * v, 0.6 * v, 1 | 0, 1 | 0);
            var s = Math.sin(d / size);
            if (Math.abs(d) < (1 | 0)) {
              return __.FM.float_4_4(__.swizzle(1 | 0, "xyzw"));
            } else {
              return d > (0 | 0)
                ? ((_k = color_2),
                  (_l = Math.ceil((1 | 0) - s)),
                  [_k[0] * _l, _k[1] * _l, _k[2] * _l, _k[3] * _l])
                : ((_m = color_2),
                  (_o = Math.ceil(s)),
                  [_m[0] * _o, _m[1] * _o, _m[2] * _o, _m[3] * _o]);
            }
          }
        };
        sdf.march = function (position, direction, sampler) {
          var _a, _b, _c, _d;
          var maxDist = 100000.0;
          var minDist = 1.0;
          var dist = minDist;
          for (var i = 0 | 0; __.and(i < (256 | 0), dist < maxDist); i++) {
            var samp = sampler(
              ((_a = position),
              (_b =
                ((_c = direction),
                (_d = dist),
                [_c[0] * _d, _c[1] * _d, _c[2] * _d])),
              [_a[0] + _b[0], _a[1] + _b[1], _a[2] + _b[2]])
            );
            dist = dist + samp;
            if (Math.abs(samp) < 0.00005 * dist) {
              break;
            }
          }
          if (dist > maxDist) {
            dist = __.FM.negate_1(1.0);
          }
          return dist;
        };
        /**
         * See: https://iquilezles.org/articles/distfunctions/
         * Infinitely repeats an SDF with space in between. This returns an updated position
         *
         * Example:
         * ```shadeup
         *	sdf::sphere(sdf::repeat(p, 100.xyz), 0.xyz, 50.0);
         * ```
         */
        sdf.repeat = function (position, space) {
          var _a, _b, _c, _d, _e, _f, _g;
          var p = position;
          var s = space;
          return (
            (_a = p),
            (_b =
              ((_c = s),
              (_d =
                ((_e =
                  ((_f = p),
                  (_g = s),
                  [_f[0] / _g[0], _f[1] / _g[1], _f[2] / _g[2]])),
                [Math.round(_e[0]), Math.round(_e[1]), Math.round(_e[2])])),
              [_c[0] * _d[0], _c[1] * _d[1], _c[2] * _d[2]])),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]
          );
        };
        /**
         * See: https://iquilezles.org/articles/distfunctions/
         * Repeats an SDF with space in between upto the limit. This returns an updated position
         *
         * Example:
         * ```shadeup
         *	sdf::sphere(sdf::repeatLimited(p, 100, 10.xyz), 0.xyz, 50.0);
         * ```
         */
        sdf.repeatLimited = function (position, space, limit) {
          var _a, _b, _c, _d, _e, _f, _g;
          var p = position;
          var s = space;
          return (
            (_a = p),
            (_b =
              ((_c = s),
              (_d = (0, std_math_1.clamp)(
                ((_e =
                  ((_f = p), (_g = s), [_f[0] / _g, _f[1] / _g, _f[2] / _g])),
                [Math.round(_e[0]), Math.round(_e[1]), Math.round(_e[2])]),
                __.FM.negate_3(limit),
                limit
              )),
              [_c * _d[0], _c * _d[1], _c * _d[2]])),
            [_a[0] - _b[0], _a[1] - _b[1], _a[2] - _b[2]]
          );
        };
        sdf.prototype.clone = function () {
          return new sdf({});
        };
        sdf.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_sdf_ts_1797_sdf","fields":[]}'
          );
        };
        return sdf;
      })();
      exports.sdf = sdf;
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_sdf_ts_1797_sdf","fields":[]}'
        ),
        sdf
      );
      function dot2(v) {
        return (0, std_math_1.dot)(v, v);
      }
      function dot3(v) {
        return (0, std_math_1.dot)(v, v);
      }
      function ndot(a, b) {
        return a[0] * b[0] - a[1] * b[1];
      }
    });
    /* impl sdf */
  })(define);

  ((defineFunc) => {
    let define = (deps, func) => defineFunc("/_std/geo.js", deps, func);
    var __createBinding =
      (this && this.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (this && this.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (this && this.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
    define(["require", "exports", "/std_math", "/std___std_all"], function (
      require,
      exports,
      __,
      std___std_all_1
    ) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      __ = __importStar(__);
      var globalVarGet = std___std_all_1.globalVarGet;
      var GeoSegment = /** @class */ (function () {
        function GeoSegment(data) {
          var _a, _b, _c, _d, _e, _f;
          this.start =
            (_a = data.start) !== null && _a !== void 0
              ? _a
              : __.FM.float_2_1_1(0.0, 0.0);
          this.end =
            (_b = data.end) !== null && _b !== void 0
              ? _b
              : __.FM.float_2_1_1(0.0, 0.0);
          this.kind = (_c = data.kind) !== null && _c !== void 0 ? _c : 0 | 0;
          this.arcRadius =
            (_d = data.arcRadius) !== null && _d !== void 0 ? _d : 0.0;
          this.arcStart =
            (_e = data.arcStart) !== null && _e !== void 0 ? _e : 0.0;
          this.arcEnd = (_f = data.arcEnd) !== null && _f !== void 0 ? _f : 0.0;
        }
        GeoSegment.prototype.clone = function () {
          return new GeoSegment({
            start: (0, std___std_all_1.__deepClone)(this.start),
            end: (0, std___std_all_1.__deepClone)(this.end),
            kind: (0, std___std_all_1.__deepClone)(this.kind),
            arcRadius: (0, std___std_all_1.__deepClone)(this.arcRadius),
            arcStart: (0, std___std_all_1.__deepClone)(this.arcStart),
            arcEnd: (0, std___std_all_1.__deepClone)(this.arcEnd),
          });
        };
        GeoSegment.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_geo_ts_1689_GeoSegment","fields":[["start",{"type":"primitive","name":"float2"}],["end",{"type":"primitive","name":"float2"}],["kind",{"type":"primitive","name":"int"}],["arcRadius",{"type":"primitive","name":"float"}],["arcStart",{"type":"primitive","name":"float"}],["arcEnd",{"type":"primitive","name":"float"}]]}'
          );
        };
        return GeoSegment;
      })();
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_geo_ts_1689_GeoSegment","fields":[["start",{"type":"primitive","name":"float2"}],["end",{"type":"primitive","name":"float2"}],["kind",{"type":"primitive","name":"int"}],["arcRadius",{"type":"primitive","name":"float"}],["arcStart",{"type":"primitive","name":"float"}],["arcEnd",{"type":"primitive","name":"float"}]]}'
        ),
        GeoSegment
      );
      /**@shadeup=struct*/ var GeoPoly = /** @class */ (function () {
        function GeoPoly(data) {
          var _a;
          this.segments =
            (_a = data.segments) !== null && _a !== void 0 ? _a : [];
        }
        GeoPoly.prototype.area = function () {
          return 0.0;
        };
        GeoPoly.prototype.perimeter = function () {
          return 0.0;
        };
        GeoPoly.prototype.discretize = function () {
          var shader_self_temp = this;
          return this.clone();
        };
        GeoPoly.prototype.clone = function () {
          return new GeoPoly({
            segments: (0, std___std_all_1.__deepClone)(this.segments),
          });
        };
        GeoPoly.prototype._getStructure = function () {
          return JSON.parse(
            '{"type":"struct","name":"str_i_iistd_geo_ts_2553_GeoPoly","fields":[["segments",{"type":"array","element":{"type":"struct","name":"str_i_iistd_geo_ts_1689_GeoSegment","fields":[["start",{"type":"primitive","name":"float2"}],["end",{"type":"primitive","name":"float2"}],["kind",{"type":"primitive","name":"int"}],["arcRadius",{"type":"primitive","name":"float"}],["arcStart",{"type":"primitive","name":"float"}],["arcEnd",{"type":"primitive","name":"float"}]]},"staticSize":1}]]}'
          );
        };
        return GeoPoly;
      })();
      __shadeup_register_struct(
        JSON.parse(
          '{"type":"struct","name":"str_i_iistd_geo_ts_2553_GeoPoly","fields":[["segments",{"type":"array","element":{"type":"struct","name":"str_i_iistd_geo_ts_1689_GeoSegment","fields":[["start",{"type":"primitive","name":"float2"}],["end",{"type":"primitive","name":"float2"}],["kind",{"type":"primitive","name":"int"}],["arcRadius",{"type":"primitive","name":"float"}],["arcStart",{"type":"primitive","name":"float"}],["arcEnd",{"type":"primitive","name":"float"}]]},"staticSize":1}]]}'
        ),
        GeoPoly
      );
    });
    /* impl GeoPoly */
  })(define);
};
