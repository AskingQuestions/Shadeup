#!/usr/bin/env node

const colors = require("colors");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

const templates = require("./src/types/template.js");

const { program } = require("commander");

const { parse } = require("./src/parse.js");

function FindPluginData(file) {
	let files = fs.readdirSync(file);
	for (let f of files) {
		if (f.endsWith(".uplugin")) {
			return {
				file: path.join(file, f),
				dir: file,
				name: f.replace(".uplugin", ""),
			};
		}
	}

	let upDir = path.resolve(file, "..");
	
	if (upDir != file) {
		return FindPluginData(upDir);
	}else{
		return false;
	}
}

async function IQProjectFolder(file) {
	file = file || process.cwd();
	let files = fs.readdirSync(file);
	for (let f of files) {
		if (f.endsWith(".uproject")) {
			return {
				file: path.join(file, f),
				dir: file,
				name: f.replace(".uproject", ""),
			};
		}
	}

	let upDir = path.resolve(file, "..");
	
	if (upDir != file) {
		return await IQProjectFolder(upDir);
	}else{
		throw new Error("No unreal project found in this folder.".red);
		return false;
	}
}

async function IQPluginFolder(file) {
	file = file || process.cwd();
	let files = fs.readdirSync(file);
	for (let f of files) {
		if (f.endsWith(".uplugin")) {
			return {
				file: path.join(file, f),
				dir: file,
				name: f.replace(".uplugin", ""),
			};
		}
	}

	let upDir = path.resolve(file, "..");
	
	if (upDir != file) {
		return await IQPluginFolder(upDir);
	}else{
		let project = await IQProjectFolder();
		if (project) {
			let answers = await inquirer.prompt([
				{
					type: "list",
					name: "plugin",
					message: "Which plugin do you want to use. (To create a new one use the unreal engine editor)",
					choices: fs.readdirSync(path.join(project.dir, "Plugins")).filter(f => !f.startsWith(".")),
				}
			]);
			process.chdir(path.join(project.dir, "Plugins", answers.plugin));
			return await IQPluginFolder();
		}
		return false;
	}
}

async function CreateModule(plugin, name) {
	let pluginData = {};
	let dir = plugin.dir;
	try {
		pluginData = JSON.parse(fs.readFileSync(plugin.file, "utf8"));
	} catch (e) {
		throw new Error("Failed to parse plugin file. Please make sure it is a valid JSON file.");
		return;
	}

	if (!pluginData.Modules) {
		pluginData.Modules = [];
	}

	let existingModule = pluginData.Modules.find(m => m.Name === name);
	if (existingModule) {
		throw new Error("A module with this name already exists in this plugin.");
		return;
	}

	pluginData.Modules.push({
		"Name": name,
		"Type": "Runtime",
		"LoadingPhase": "PostConfigInit", // PostConfigInit is for registering our shaders
	});

	fs.writeFileSync(plugin.file + ".back", fs.readFileSync(plugin.file, "utf8"));
	fs.writeFileSync(plugin.file, JSON.stringify(pluginData, null, "\t"));

	fs.mkdirSync(path.join(dir, "Source", name), { recursive: true });
	fs.mkdirSync(path.join(dir, "Source", name, "Private"), { recursive: true });
	fs.mkdirSync(path.join(dir, "Source", name, "Public"), { recursive: true });
	fs.mkdirSync(path.join(dir, "Shaders"), { recursive: true });
	fs.mkdirSync(path.join(dir, "Shaders", name, ""), { recursive: true });
	fs.writeFileSync(path.join(dir, "Source", name, name + ".Build.cs"), fs.readFileSync(path.join(__dirname, "./src/template/Template.Build.cs"), "utf8").replace(/\$\{MODULE_NAME\}/gm, name));

	return path.join(dir, "Source", name);
}

async function IQModuleFolder(file) {
	file = file || process.cwd();
	let files = fs.readdirSync(file);
	for (let f of files) {
		if (f.endsWith(".Build.cs") && fs.readFileSync(path.join(file, f), "utf8").includes("ModuleRules")) {
			return {
				file: path.join(file, f),
				dir: file,
				name: f.replace(".Build.cs", ""),
			};
		}
	}

	let upDir = path.resolve(file, "..");
	
	if (upDir != file) {
		return await IQModuleFolder(upDir);
	}else{
		let plugin = await IQPluginFolder();
		if (plugin) {
			let answers = await inquirer.prompt([
				{
					type: "list",
					name: "module",
					message: "Which module do you want to use",
					choices: [
						...fs.readdirSync(path.join(plugin.dir, "Source")).filter(f => !f.startsWith(".")),
						"Create New"
					],
				},
				{
					type: "input",
					name: "name",
					message: "What is the name of the module",
					when: answers => answers.module == "Create New",
				}
			]);
			if (answers.module == "Create New") {
				process.chdir(await CreateModule(plugin, answers.name));
				console.log("Created module ".green + answers.name.green);
			}else{
				process.chdir(path.join(plugin.dir, "Source", answers.module));
			}
			return await IQModuleFolder();
		}
		return false;
	}
}


program
	.name("shadeup")
	.description("CLI tool for compiling shadeup files")
	.version("0.1.0")
	.action(async () => {
		console.log("Shadeup v0.1.0".magenta);
		try {
			let project = await IQProjectFolder();
			let plugin = await IQPluginFolder();
			let module = await IQModuleFolder();

			let choices = templates.map(t => t.display());
			let templateMap = {};
			for (let t of templates) {
				templateMap[t.display()] = t;
			}

			let answers = await inquirer.prompt([
				{
					type: "list",
					name: "Template",
					choices
				}
			]);

			let inst = new templateMap[answers.Template](project, plugin, module);
			await inst.prompt(inquirer);
			await inst.generate();
		}catch (e) {
			console.error(e);
		}
	});

program.command("build")
	.description("Build files")
	.option("-o, --output <path>", "Output path", "")
	.argument("<files...>", "List of files to watch")
	.action((files, options) => {
		console.log(`Building ${files.length} file${files.length > 1 ? "s" : ""}`);
		for (let file of files) {
			try {
				let parsed = parse(file);

				if (parsed) {
					if (!options.path) {
						let pluginData = FindPluginData(path.dirname(file));
						if (pluginData) {
							parsed.outputDir = pluginData.dir;
						}else{
							console.error(`Could not find the parent plugin for ${file}. Make sure that this file is placed under a uplugin.`);
						}
					}else{
						parsed.outputDir = options.path;
					}

					let realPluginData = FindPluginData(parsed.outputDir);

					if (realPluginData) {
						parsed.plugin = realPluginData.name;
					}else{
						console.error(`Output dir is not a .uplugin directory. Please point to a directory containing a .uplugin file.`);
					}
					
					parsed.generate();
				}
			} catch (e) {
				if (e.message == "Exiting") {
					console.log("Failed to build " + file);
				}else{
					console.error(e);
				}
			}
		}
	});

program.command("init")
	.description("Initializes a shadeup module inside of a plugin directory")
	.argument("<name>", "Name of the module")
	.action((name, options) => {
		console.log("Initializing module " + name);
		let dir = path.resolve(process.cwd());
		let files = fs.readdirSync(dir);
		let plugin = null;

		for (let f of files) {
			if (f.endsWith(".uplugin")) {
				plugin = f;
				break;
			}
		}

		if (!plugin) {
			console.error("No .uplugin found in current directory. Please navigate to the plugin directory you wish to initialize.");
			return;
		}

		let pluginData = {};
		try {
			pluginData = JSON.parse(fs.readFileSync(path.join(dir, plugin), "utf8"));
		} catch (e) {
			console.error("Failed to parse plugin file. Please make sure it is a valid JSON file.");
			console.error(e);
			return;
		}

		if (!pluginData.Modules) {
			pluginData.Modules = [];
		}

		let existingModule = pluginData.Modules.find(m => m.Name === name);
		if (existingModule) {
			console.error("A module with this name already exists in this plugin.");
			return;
		}

		pluginData.Modules.push({
			"Name": name,
			"Type": "Runtime",
			"LoadingPhase": "PostConfigInit", // PostConfigInit is for registering our shaders
		});

		fs.writeFileSync(path.join(dir, plugin), JSON.stringify(pluginData, null, "\t"));

		fs.mkdirSync(path.join(dir, "Source", name), { recursive: true });
		fs.mkdirSync(path.join(dir, "Source", name, "Private"), { recursive: true });
		fs.mkdirSync(path.join(dir, "Source", name, "Public"), { recursive: true });
		fs.mkdirSync(path.join(dir, "Shaders"), { recursive: true });
		fs.mkdirSync(path.join(dir, "Shaders", name, ""), { recursive: true });
		fs.writeFileSync(path.join(dir, "Source", name, name + ".Build.cs"), fs.readFileSync(path.join(__dirname, "./src/template/Template.Build.cs"), "utf8").replace(/\$\{MODULE_NAME\}/gm, name));
		fs.writeFileSync(path.join(dir, "Shaders", "example.shadeup"), `// This is an example shader. You can delete this file and create your own.

@module "${name}"

compute Example {
	Shader = {
		[numthreads(1, 1, 1)]
		void Main(uint3 ThreadId : SV_DispatchThreadID) {
			// Write your shader here.
		}
	};
}`);

		console.log("Module initialized.");
	});

program.command("watch")
	.description("Watch shadeup file(s) and recompile on change")
	.argument("<files>", "List of files to watch")
	.action((str, options) => {
	});

program.parse();