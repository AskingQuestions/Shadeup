#!/usr/bin/env node

import colors from "colors";
import path from "path";
import fs from "fs";
import inquirer from "inquirer";

import { program } from "commander";

import * as url from "url";
import {
  makeCompiler,
  makeIncrementalCompiler,
} from "./compiler-dist/compiler.js";

if (typeof __dirname == "undefined") {
  global["__filename"] = url.fileURLToPath(import.meta.url);
  global["__dirname"] = url.fileURLToPath(new URL(".", import.meta.url));
}

function findCommonPath(paths) {
  // Find the common path without the filename or extension
  if (paths.length == 0) return "";
  if (paths.length == 1) return path.dirname(paths[0]) + "/";

  paths = paths.map((p) => p).sort((a, b) => b.length - a.length);
  let longest = paths[0];
  for (let i = 0; i < longest.length; i++) {
    let char = longest[i];
    for (let path of paths) {
      if (path[i] != char) {
        return longest.slice(0, i);
      }
    }
  }
}

function scanImports(baseFile) {
  let imports = new Set();
  imports.add(baseFile);
  let data = fs.readFileSync(baseFile, "utf8");
  let lines = data.split("\n");
  for (let line of lines) {
    let match = line.match(/import[^"]+"([^"]*)"/);
    if (match) {
      let importPath = match[1];
      if (!importPath.endsWith(".shadeup")) {
        importPath += ".shadeup";
      }
      if (importPath.startsWith("/")) {
        continue;
      }
      let importFile = path.resolve(path.dirname(baseFile), importPath);
      if (!imports.has(importFile)) {
        imports.add(importFile);
        scanImports(importFile).forEach((i) => imports.add(i));
      }
    }
  }
  return imports;
}

program
  .name("shadeup")
  .description("CLI tool for compiling shadeup files")
  .version("1.2.3")
  .option("-v")
  .action(async (opts) => {
    console.log("Shadeup v1.2.3".magenta);
    if (opts.v) {
      return;
    }
    try {
    } catch (e) {
      console.error(e);
    }
  });

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

function printErrors(errors, common) {
  for (let error of errors) {
    let path = (common + error.file)
      .replace(".ts", ".shadeup")
      .replace(/^\/([A-Z]:)/g, "$1")
      .replace(/\/\//g, "/");
    console.error(
      path + "\n\x1b[31m" + error.message.replace(error.file, path) + "\x1b[0m"
    );
  }
}

const buildFiles = async (files, options) => {
  let compile = await makeCompiler();
  let outputs = [];

  let common = normalizePath(findCommonPath(files));

  outputs.push(
    compile({
      files: files.map((f) => {
        f = normalizePath(f).replace(common, "");
        let data = fs.readFileSync(f, "utf8");
        let filename = f.replace(".shadeup", "");
        return { name: filename, body: data };
      }),
    })
  );

  let orig = console.log;
  console.log = () => {};
  let outs = await Promise.all(outputs);
  console.log = orig;

  for (let i = 0; i < outs.length; i++) {
    let out = outs[i];

    if (out.errors) {
      printErrors(out.errors, common);

      continue;
    }
    let file = files[i];
    let outPath = options.output || file.replace(".shadeup", ".js");
    console.log(`Writing ${outPath}`);
    fs.writeFileSync(outPath, out.output);

    if (out.dts) {
      let dtsPath = file.replace(".shadeup", ".d.ts");
      if (options.output) {
        dtsPath = options.output.replace(".js", ".d.ts");
      }
      console.log(`Writing ${dtsPath}`);
      fs.writeFileSync(dtsPath, out.dts);
    }
  }
};

program
  .command("build")
  .description("Build file")
  .option("-o, --output <path>", "Output path", "")
  .argument("file", "File to build")
  .action(async (file, options) => {
    file = path.resolve(file);
    if (!fs.existsSync(file)) {
      console.error(`File ${file} does not exist`);
      return;
    }

    let fileSet = scanImports(file);
    let files = [...fileSet.values()];

    if (!options.output) {
      delete options.output;
    }
    await buildFiles(files, {
      output: file.replace(".shadeup", ".js"),
      ...options,
    });
  });

const debounce = (fn, time) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, time);
  };
};

const setupWatcher = async (file, options, outdir = "") => {
  file = path.resolve(file);
  let comp = await makeIncrementalCompiler();
  let rebuild = debounce(async () => {
    let fileSet = scanImports(file);

    let files = [...fileSet.values()];
    let common = normalizePath(findCommonPath(files));
    let start = performance.now();

    let orig = console.log;
    // console.log = () => {};
    let outs = await comp({
      files: files.map((f) => {
        f = normalizePath(f).replace(common, "");
        let data = fs.readFileSync(f, "utf8");
        let filename = f.replace(".shadeup", "");
        return { name: filename, body: data };
      }),
    });
    console.log = orig;
    (async () => {
      // let errs = await outs.errors;
      // printErrors(errs, common);
    })();
    let outPath = options.output || file.replace(".shadeup", ".js");
    if (outdir) {
      outPath = path.join(outdir, path.basename(outPath));
    }
    console.log(
      `\x1b[32mCompiled in ${Math.round(
        performance.now() - start
      )}ms\x1b[0m: writing out to ${outPath}`
    );
    fs.writeFileSync(outPath, outs.output);
    fs.writeFileSync(outPath.replace(/\.js$/, ".d.ts"), outs.dts);
  }, 100);
  rebuild();

  let handlers = new Map();

  const buildHandlers = () => {
    let fileSet = scanImports(file);
    let files = Array.from(fileSet);
    let unwatch = new Set(handlers.keys());
    for (let file of files) {
      unwatch.delete(file);
      if (!fs.existsSync(file)) {
        console.error(`File ${file} does not exist`);
        continue;
      }
      if (handlers.has(file)) {
        continue;
      }

      let handler = () => {
        rebuild();
        buildHandlers();
      };
      let watcher = fs.watch(file, handler);
      watcher.on("change", handler);
      watcher.on("error", (e) => {
        console.error(e);
      });
      handlers.set(file, watcher);
    }
    for (let file of unwatch) {
      handlers.get(file).close();
      handlers.delete(file);
    }
  };

  buildHandlers();
};

program
  .command("watch")
  .description("Watch a shadeup file and recompile on change")
  .argument("file", "Main file to watch")
  .action(async (file, options) => {
    setupWatcher(file, options);
  });

program
  .command("preview")
  .description("Live preview of a shadeup file in electron")
  .argument("file", "Main file to preview")
  .action(async (file, options) => {
    const electron = await import("electron");
    const proc = await import("node:child_process");

    fs.writeFileSync(path.join(__dirname, "vite/runner.js"), ``);

    const child = proc.spawn(electron.default, [
      path.join(__dirname, "electron/main.js"),
    ]);

    child.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    const viteDir = path.join(__dirname, "vite");

    setupWatcher(
      file,
      {
        output: path.join(viteDir, "runner.js"),
      },
      viteDir
    );

    const vite = await import("vite");
    const server = await vite.createServer({
      root: viteDir,
      server: {
        port: 5128,
      },
    });
    await server.listen();
  });

program.parse();
