const fs = require("fs");
const path = require("path");

class Template {
	constructor(project, plugin, mod) {
		this.project = project;
		this.plugin = plugin;
		this.module = mod;
	}

	static display() {

	}

	async prompt(inquirer) {

	}

	readDirRecur(from) {
		let files = [];
		let dirs = [];
		// Collect a list of dirs and files from the from directory
		for (let f of fs.readdirSync(from)) {
			if (f.startsWith(".")) continue;

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
			let full = path.join(to, d);
			if (!fs.existsSync(full)) {
				fs.mkdirSync(full, { recursive: true });
			}
		}

		// Copy the files
		for (let f of files) {
			let freal = f.replace(/\[NAME\]/g, name).replace(/\[MODULE\]/g, module_name);
			let full = path.join(to, freal);
			if (!fs.existsSync(full) || true) {
				let raw = fs.readFileSync(path.join(from, f), "utf8");
				const NAME = name;
				const MODULE_NAME = module_name;
				const SCOPE = MODULE_NAME.toUpperCase() + "_API";
				instance;

				let generated = (() => {
					try {
						return eval("`" + raw + "`");
					}catch (e) {
						console.log(f);
						console.error(e);
					}
				})();
				fs.writeFileSync(full, generated);
				console.log("Wrote".green, full);
			}else{
				console.log("Exists".yellow, full);
			}
		}
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

class SimpleCompute extends Template {
	static display() {
		return "[COMPUTE]".magenta + " Simple Compute Shader" + " (outputting value back to CPU)".grey;
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the shader",
				default: "MySimpleComputeShader"
			},
			COMPUTE_MATERIAL_EXTENDS
		]);
		this.answers = answers;
	}

	async generate() {
		this.threadCounts = [1, 1, 1];
		this.example = "pi";
		if (this.example == "pi") {
			this.threadCounts = [32, 1, 1];
		}
		this.material = false;
		this.ShaderBase = this.material ? "Material" : "Global";
		await this.directory(
			path.join(__dirname, "../templates/simple-compute-shader/Plugin"),
			this.plugin.dir,
			this.answers.name,
			this.module.name,
			this
		);
	}
}

class ComputeRenderTarget extends Template {
	static display() {
		return "[COMPUTE]".magenta + " Simple Compute Shader" + " (writing to render target)".grey;
	}

	async prompt(inquirer) {
		let answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of the shader",
				default: "MySimpleComputeShader"
			},
			COMPUTE_MATERIAL_EXTENDS
		]);
		this.answers = answers;
	}
}

class ComputeIndirectDrawing extends Template {
	static display() {
		return "[COMPUTE]".magenta + " Compute Shader Instanced Drawing";
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
		await this.directory(
			path.join(__dirname, "../templates/compute-indirect-drawing/Plugin"),
			this.plugin.dir,
			this.answers.name,
			this.module.name,
			this
		);
	}
}

class CustomProxy extends Template {
	static display() {
		return "[COMPONENT]".blue + " Custom Mesh Component" + " (a custom SceneProxy, VertexFactory, and PixelShader)".grey;
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
		return "[NODE]".green + " Custom Material Node Output" + " (a placeable material node that can be read from)".grey;
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

module.exports = [
	ComputeIndirectDrawing,
	SimpleCompute,
	ComputeRenderTarget,
	CustomProxy,
	MaterialNodeOutput
];