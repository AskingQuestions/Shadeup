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
  if (paths.length == 1) return path.dirname(paths[0]);

  paths = paths.sort((a, b) => b.length - a.length);
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
  .version("1.0.0")
  .option("-v")
  .action(async (opts) => {
    console.log("Shadeup v1.0.0".magenta);
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
      let dtsPath = options.output || file.replace(".shadeup", ".d.ts");
      console.log(`Writing ${dtsPath}`);
      fs.writeFileSync(dtsPath, out.dts);
    }
  }
};

program
  .command("build")
  .description("Build files")
  .option("-o, --output <path>", "Output path", "")
  .argument("file", "File to build")
  .action(async (file, options) => {
    file = path.resolve(file);
    if (!fs.existsSync(file)) {
      console.error(`File ${file} does not exist`);
      return;
    }

    let fileSet = scanImports(file);
    let files = Array.from(fileSet);

    await buildFiles(files, options);
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

program
  .command("watch")
  .description("Watch shadeup file(s) and recompile on change")
  .argument("file", "Main file to watch")
  .action(async (file, options) => {
    file = path.resolve(file);
    let comp = await makeIncrementalCompiler();
    let rebuild = debounce(async () => {
      let fileSet = scanImports(file);

      let files = Array.from(fileSet);
      let common = normalizePath(findCommonPath(files));
      let start = performance.now();

      let orig = console.log;
      console.log = () => {};
      let outs = await comp({
        files: files.map((f) => {
          f = normalizePath(f).replace(common, "");
          let data = fs.readFileSync(f, "utf8");
          let filename = f.replace(".shadeup", "");
          return { name: filename, body: data };
        }),
      });
      console.log = orig;
      for (let out of outs) {
        if (out.errors) {
          printErrors(out.errors, common);
          return;
        }
      }
      let outPath = options.output || file.replace(".shadeup", ".js");
      console.log(
        `\x1b[32mCompiled in ${Math.round(
          performance.now() - start
        )}ms\x1b[0m: writing out to ${outPath}`
      );
      fs.writeFileSync(outPath, outs);
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
  });

program.parse();
