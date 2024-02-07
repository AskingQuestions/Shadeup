import { makeSimpleShadeupEnvironment } from "./shadeup-compiler.js";
import Parser from "web-tree-sitter";
import minify from "uglify-js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(new URL(import.meta.url));

function filterDTS(files) {
  return `import * as __ from "shadeup/math";

export declare function makeShadeupInstance(
  canvas: HTMLCanvasElement
): Promise<{
  engine: {
    /**
     * Set to false to pause
     */
    playing: boolean;

    canvas: HTMLCanvasElement;

    adapter: any;
    hooks: {
      beforeFrame?: () => {};
      afterFrame?: () => {};
      reset?: () => {};
    }[];
    start: () => void;

    env: {
      camera: {
        position: __.float3;
        rotation: __.float4;
        width: __.float;
        height: __.float;
        fov: __.float;
        near: __.float;
        far: __.float;
      };
      camera2d: {
        position: __.float2;
        zoom: __.float;
      };
      deltaTime: __.float;
      frame: __.int;
      keyboard: any;
      mouse: any;
      screenSize: __.float2;
      time: __.float;
    };

    /**
     * Used to pass values into the shadeup env (accessed as env.input("name") inside)
     */
    inputValues: Map<string, any>;
  };

  files: {
${[...files.entries()]
  .map(
    ([name, dts]) =>
      `    ${name}: {\n${dts
        .replaceAll("export declare let", "")
        .replaceAll("export declare function", "")
        .split("\n")
        .map((s) => `     ${s}`)
        .join("\n")
        .trimEnd()}\n    };`
  )
  .join("\n")}
  };
}>;
`;
}

const prefixConst = (files) => {
  let str = `import { bindShadeupEngine } from "shadeup";

export const makeShadeupInstance = bindShadeupEngine((define, localEngineContext) => {
  const __shadeup_gen_shader =
    localEngineContext.__shadeup_gen_shader.bind(localEngineContext);
  const __shadeup_make_shader_inst =
    localEngineContext.__shadeup_make_shader_inst.bind(localEngineContext);
  const __shadeup_register_struct =
    localEngineContext.__shadeup_register_struct.bind(localEngineContext);
  const env = localEngineContext.env;\n`;

  str += `((defineFunc) => {
    let define = (deps, func) => defineFunc("/__meta.js", deps, func);
  define(["require", "exports"], function (require, exports, __, std___std_all_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.files = [${files.map((f) => JSON.stringify(f)).join(",")}];
  });
})(define);`;

  return str;
};

export async function makeCompiler() {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(
    path.resolve(path.dirname(__filename), "tree-sitter-shadeup.wasm")
  );
  parser.setLanguage(Lang);

  global.shadeupParser = () => {
    return parser;
  };

  let envPool = [];

  for (let i = 0; i < 1; i++) {
    envPool.push(await makeSimpleShadeupEnvironment(true));
  }

  let queue = [];

  async function consumeQueue() {
    if (queue.length == 0) return;
    if (envPool.length == 0) return;
    let env = envPool.shift();
    let item = queue.shift();
    if (!item) return;
    try {
      let start = performance.now();
      env.reset();
      for (let i = 0; i < item.files.length; i++) {
        const file = item.files[i];
        if (i == item.files.length - 1) {
          await env.writeFile("/" + file.name + ".ts", file.body);
        } else {
          env.writeFile("/" + file.name + ".ts", file.body);
        }
      }
      // for (let file of item.files) {
      //   if (file.name == "main")
      //     await env.writeFile("/" + file.name + ".ts", file.body);
      // }

      let output = await env.regenerate();
      let finalOutput = "";
      let dts = "";
      let fileDts = new Map();
      let errors = await env.errors();
      if (errors.length > 0) {
        item.callback({
          errors: errors,
        });

        envPool.push(env);
        consumeQueue();
        return;
      }

      for (let o of output) {
        if (
          !item.files.find(
            (f) =>
              f.name ==
              o.path.replace(/^\//g, "").replace(".js", "").replace(".d.ts", "")
          ) &&
          !(item.files.length == 1 && item.files[0].name == "__lib")
        )
          continue;

        if (o.path.endsWith(".d.ts")) {
          fileDts.set(
            o.path.replace(/^\//g, "").replace(".js", "").replace(".d.ts", ""),
            o.contents
              .split("\n")
              .filter((l) => !l.startsWith("import"))
              .join("\n")
          );
        } else {
          if (item.files.length == 1 && item.files[0].name == "__lib") {
            finalOutput += `
((defineFunc) => {
	let define = (deps, func) => defineFunc(${JSON.stringify(o.path)}, deps, func);
	${o.contents}
})(define);
`;
          } else {
            finalOutput += `
((defineFunc) => {
	let define = (deps, func) => defineFunc(${JSON.stringify(o.path)}, deps, func);
	${o.contents}
})(define);
`;
          }
        }
      }
      let final =
        prefixConst(item.files.map((f) => f.name)) + finalOutput + `\n});`;
      let doMinify = false;

      if (doMinify) {
        final = minify.minify(final);
        // console.log(final);
      }
      console.log("Generated in " + (performance.now() - start) + "ms");

      item.callback({
        output: final,
        dts: filterDTS(fileDts),
      });

      envPool.push(env);
      consumeQueue();
    } catch (e) {
      console.error(e);

      envPool.push(await makeSimpleShadeupEnvironment());
      item.callback({
        error: "Fatal error while compiling.",
      });
      consumeQueue();
    }
  }

  return async function compile(data) {
    return new Promise((resolve, reject) => {
      queue.push({ ...data, files: data.files, callback: resolve });
      consumeQueue();
    });
  };
}

export async function makeIncrementalCompiler() {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(
    path.resolve(path.dirname(__filename), "tree-sitter-shadeup.wasm")
  );
  parser.setLanguage(Lang);

  global.shadeupParser = () => {
    return parser;
  };

  const env = await makeSimpleShadeupEnvironment(true);
  const fileCache = new Map();
  const fileEmitCache = new Map();

  return async function compile(item) {
    try {
      let start = performance.now();
      let itemsToRegen = [];
      let dirtyFiles = new Set();
      for (let i = 0; i < item.files.length; i++) {
        const file = item.files[i];
        let fileKey = "/" + file.name + ".ts";
        let didChange = false;

        if (fileCache.has(fileKey)) {
          if (fileCache.get(fileKey) != file.body) {
            didChange = true;
          }
        } else {
          didChange = true;
        }
        if (didChange) {
          itemsToRegen.push(fileKey);
          fileCache.set(fileKey, file.body);
          dirtyFiles.add(fileKey);
        }
      }
      let dirtyFilesArray = Array.from(dirtyFiles);

      for (let i = 0; i < dirtyFilesArray.length; i++) {
        const fileKey = dirtyFilesArray[i];
        const file = item.files.find((f) => "/" + f.name + ".ts" == fileKey);
        if (i == dirtyFilesArray.length - 1) {
          await env.writeFile(fileKey, file.body, true);
        } else {
          env.writeFile(fileKey, file.body, true);
        }
      }
      let output = await env.regenerate(itemsToRegen);
      console.log("Regen took " + (performance.now() - start) + "ms");
      let finalOutput = "";
      let dts = "";

      for (let o of output) {
        if (
          !item.files.find(
            (f) =>
              f.name ==
              o.path.replace(/^\//g, "").replace(".js", "").replace(".d.ts", "")
          ) &&
          !(item.files.length == 1 && item.files[0].name == "__lib")
        )
          continue;

        if (o.path.endsWith(".d.ts")) {
          // dts += o.contents;
        } else {
          if (item.files.length == 1 && item.files[0].name == "__lib") {
            finalOutput += `
((defineFunc) => {
	let define = (deps, func) => defineFunc(${JSON.stringify(o.path)}, deps, func);
	${o.contents}
})(define);
`;
            return finalOutput;
          } else {
            fileEmitCache.set(
              o.path,
              `

((defineFunc) => {
	let define = (deps, func) => defineFunc(${JSON.stringify(o.path)}, deps, func);
	${o.contents}
})(define);
`
            );
          }
        }
      }

      for (let file of item.files) {
        let fileKey = "/" + file.name + ".js";
        if (fileEmitCache.has(fileKey)) {
          finalOutput += fileEmitCache.get(fileKey);
        }
      }

      let final =
        prefixConst(item.files.map((f) => f.name)) + finalOutput + `\n});`;

      console.log("Generated in " + (performance.now() - start) + "ms");

      return {
        output: final,
        // errors: env.errors(),
      };
    } catch (e) {
      console.error(e);
    }
  };
}

export async function makeLSPCompiler() {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(
    path.resolve(path.dirname(__filename), "tree-sitter-shadeup.wasm")
  );
  parser.setLanguage(Lang);

  global.shadeupParser = () => {
    return parser;
  };

  const env = await makeSimpleShadeupEnvironment(true);

  return env;
}
