import fs from "fs";
import path from "path";
import vm from "vm";

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

class Template {
	constructor(project, plugin, mod) {
		this.project = project;
		this.plugin = plugin;
		this.module = mod;
	}

	static display() {

	}

	static examples() {

	}

	async prompt(inquirer) {

	}

	readDirRecur(from) {
		let files = [];
		let dirs = [];
		// Collect a list of dirs and files from the from directory
		for (let f of fs.readdirSync(from)) {
			if (f.startsWith(".")) continue;

			if (f.startsWith("$")) {
				if (f.startsWith("$" + this.example)) {
					
				}else{
					continue;
				}
			}

			let full = path.join(from, f);
			if (fs.statSync(full).isDirectory()) {
				dirs.push(f);
				let children = this.readDirRecur(full);
				files = files.concat(children.files.map(cf => f + "/" + cf));
				dirs = dirs.concat(children.dirs.map(cf => f + "/" + cf));
			} else {
				files.push(f);
			}
		}
		return {
			files,
			dirs
		};
	}

	async directory(from, to, name, module_name, instance) {
		let {
			files,
			dirs
		} = this.readDirRecur(from);

		// Sort the dirs by length
		dirs = dirs.sort((a, b) => {
			return b.length - a.length;
		});

		// Create the directory
		for (let d of dirs) {
			d = d.replace(/\[NAME\]/g, name);
			d = d.replace(/\[MODULE\]/g, module_name);
			d = d.replace(new RegExp("\\$" + this.example, "g"), "");
			let full = path.join(to, d);
			if (!fs.existsSync(full)) {
				fs.mkdirSync(full, { recursive: true });
			}
		}
		
		let mdFile = "";
		// Copy the files
		for (let f of files) {
			let freal = f.replace(/\[NAME\]/g, name).replace(/\[MODULE\]/g, module_name).replace(new RegExp("\\$" + this.example, "g"), "");
			let full = path.join(to, freal);
			if (!fs.existsSync(full) || true) {
				let raw = fs.readFileSync(path.join(from, f), "utf8");
				const NAME = name;
				const MODULE_NAME = module_name;
				const SCOPE = MODULE_NAME.toUpperCase() + "_API";
				instance;
				const ifExample = (x, out) => typeof x == "object" ? (x.includes(instance.example) ? out : "") : (instance.example == x ? out : "");

				let generated = (() => {
					try {
						return eval("`" + raw + "`");
					}catch (e) {
						try {
							let s = new vm.Script("`" + raw + "`", {filename: path.join(from, f)});
							s.runInThisContext();
						} catch (err) {
							console.log(err.stack);
						}

						console.log(f);
						console.error(e);
					}
				})();
				fs.writeFileSync(full, generated);
				console.log("Wrote".green, full);

				let bn = path.basename(full);
				if (bn.endsWith(".md")) {
					mdFile = full;
				}
			}else{
				console.log("Exists".yellow, full);
			}
		}

		return mdFile;
	}

	async generate() {

	}
}

const COMPUTE_MATERIAL_EXTENDS = {
	type: "confirm",
	name: "material",
	message: "Should this compute shader extend materials?" + " (if enabled your compute shader will be able to call an arbitrary material defined in the editor)".grey,
	default: false
};

class ComputeShader extends Template {
	static display() {
		return "[COMPUTE]".magenta + " Compute Shader";
	}

	static examples() {
		return [
			["base", "Base", "Executable compute shader with inputs and outputs"],
			["basemat", "Base with material", "Compute shader that extends materials"],
			["pi", "PI", "Calculate PI using random sampling [monte carlo]"],
			["rt", "Render Target", "Draw into a render target using a compute shader"],
			["mat", "Material Evaluation Render Target", "Draw into a render target using a material graph"],
		];
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the shader",
				default: "MySimpleComputeShader"
			}
		]);
		this.answers = answers;
	}

	async generate() {
		this.material = false;
		this.threadCounts = [1, 1, 1];
		if (this.example == "pi") {
			this.threadCounts = [32, 1, 1];
		}else if (this.example == "rt") {
			this.threadCounts = [32, 32, 1];
		}else if (this.example == "mat") {
			this.threadCounts = [32, 32, 1];
			this.material = true;
		}else if (this.example == "basemat") {
			this.threadCounts = [1, 1, 1];
			this.material = true;
		}

		this.ShaderBase = this.material ? "Material" : "Global";
		return await this.directory(
			path.join(__dirname, "../templates/compute/simple-compute-shader/Plugin"),
			this.plugin.dir,
			this.answers.name,
			this.module.name,
			this
		);
	}
}


class IndirectInstancing extends Template {
	static display() {
		return "[INSTANCING]".red + " Indirect Instancing";
	}

	static examples() {
		return [
			["base", "Base", "Single triangle"],
			["grid", "View dependent subdividing grid", "Triangle grid that increases in resolution"],
			["inst", "Mesh instancing", "ISM component but GPU-driven"],
			["state", "Multi-frame instance state", "Growing orbs"],
		];
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the Shader",
				default: "MySimpleComputeShader"
			},
			COMPUTE_MATERIAL_EXTENDS
		]);
		this.answers = answers;
	}

	async generate() {
		this.example = "";
		this.material = false;
		this.ShaderBase = this.material ? "Material" : "Global";
		return await this.directory(
			path.join(__dirname, "../templates/instancing/compute-indirect-drawing/Plugin"),
			this.plugin.dir,
			this.answers.name,
			this.module.name,
			this
		);
	}
}

class CustomProxy extends Template {
	static display() {
		return "[COMPONENT]".blue + " SceneProxy/VertexFactory";
	}

	static examples() {
		return [
			["base", "Base", "Pass through StaticMeshComponent with a custom pixel/vertex shader"],
			["stream", "Dynamic Vertex Stream", "CPU-driven vertex data"],
		];
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the component",
				default: "MyCustomComponent"
			}
		]);
		this.answers = answers;
	}
}

class MaterialNodeOutput extends Template {
	static display() {
		return "[MATERIAL]".green + " Custom Material Nodes";
	}

	static examples() {
		return [
			["fn", "Base Function", "Input -> Output setup with HLSL"],
			["output", "Base Final Output", "Custom node that accepts inputs and allows you to evaluate the graph in other contexts [compute, vertex, pixel]"],
			["input", "Base Input Only", "Input only setup"],
			["dynamic", "Dynamic Inputs", "Variable number of input pins"],
		];
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the node",
				default: "MyCustomComponent"
			}
		]);
		this.answers = answers;
	}
}

export default [
	IndirectInstancing,
	MaterialNodeOutput,
	CustomProxy,
	ComputeShader
];