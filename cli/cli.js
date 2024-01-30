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

const buildFiles = async (files, options) => {
  let compile = await makeCompiler();
  let outputs = [];
  for (let file of files) {
    let data = fs.readFileSync(file, "utf8");
    let filename = path.basename(file).replace(".shadeup", "");
    outputs.push(
      compile({
        files: [{ name: filename, body: data }],
      })
    );
  }
  let outs = await Promise.all(outputs);
  for (let i = 0; i < outs.length; i++) {
    let out = outs[i];
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
  .argument("<files...>", "List of files to watch")
  .action(async (files, options) => {
    console.log(`Building ${files.length} file${files.length > 1 ? "s" : ""}`);
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
  .argument("<files...>", "List of files to watch")
  .action(async (files, options) => {
    console.log(`Watching ${files.length} file${files.length > 1 ? "s" : ""}`);
    let comp = await makeIncrementalCompiler();
    let rebuild = debounce(async () => {
      let outs = await comp({
        files: files.map((f) => {
          let data = fs.readFileSync(f, "utf8");
          let filename = path.basename(f).replace(".shadeup", "");
          return { name: filename, body: data };
        }),
      });
      let file = files[0];
      let outPath = options.output || file.replace(".shadeup", ".js");
      console.log(`Writing ${outPath}`);
      fs.writeFileSync(outPath, outs);
    }, 100);
    rebuild();

    for (let file of files) {
      let watcher = fs.watch(file, rebuild);
      watcher.on("change", rebuild);
      watcher.on("error", (e) => {
        console.error(e);
      });
    }
  });

program.parse();
