import path from "path";
import fs from "fs";
import { cp, rm, rmdir, unlink } from "fs/promises";
import archiver from "archiver";
import { CreateModule } from "./cli.js";

// Generates all examples and zips them for distribution on the https://shadeup.dev site

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import templates from "./src/types/template.js";
(async () => {
	for (let template of templates) {
		let examples = template.examples();
		for (let example of examples) {
			let outDirPlugin = path.resolve(
				"./",
				"archives",
				template.name + "_Plugin"
			);

			await cp(
				path.join(__dirname, "./src/plugin_template"),
				outDirPlugin,
				{ recursive: true }
			);

			let moduleDir = await CreateModule(
				{
					name: "ShadeupExamplePlugin",
					dir: outDirPlugin,
					file: path.join(
						outDirPlugin,
						"ShadeupExamplePlugin.uplugin"
					)
				},
				template.name
			);

			let inst = new template(
				{
					name: "archive",
					dir: path.join(__dirname, "archives")
				},
				{
					dir: outDirPlugin,
					name: template.name + "_Plugin"
				},
				{
					file: path.join(moduleDir, template.name + ".Build.cs"),
					dir: moduleDir,
					name: template.name
				}
			);
			inst.example = example[0];
			inst.answers = { name: "Example" + template.name };
			let mdFile = await inst.generate();
			await unlink(
				path.join(outDirPlugin, "./ShadeupExamplePlugin.uplugin.back")
			);
			await new Promise(res => {
				const output = fs.createWriteStream(
					path.resolve(
						"./",
						"archives",
						template.name + "_" + example[0] + ".zip"
					)
				);
				const archive = archiver("zip", {
					zlib: { level: 9 }
				});

				output.on("close", function() {
					res();
				});

				archive.on("warning", function(err) {
					if (err.code === "ENOENT") {
						console.warn(err);
					} else {
						throw err;
					}
				});

				archive.on("error", function(err) {
					throw err;
				});

				archive.pipe(output);

				archive.append(
					`The folder named \`${template.name}_Plugin\` is an Unreal Engine plugin that can be dropped into any UE5 c++ project.

1. Extract the plugin folder to \`YourProject/Plugins/\` directory.
2. Recompile the project.`,
					{ name: "readme.md" }
				);

				archive.directory(outDirPlugin, template.name + "_Plugin");

				archive.finalize();
			});
			await rm(outDirPlugin, { recursive: true });
			console.log("Archived " + inst.answers.name);
		}
	}
})();
