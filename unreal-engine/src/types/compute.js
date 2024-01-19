import ShaderGenerator from "./shader.js";
import ParsedValue from "./value.js";

export default class ComputeGenerator extends ShaderGenerator {
	verify() {
		super.verify();
		// console.log([...this.properties.entries()].map(e => `${e[0]} = ${JSON.stringify(e[1].flatten())}`));

		this.ShaderBase = this.prop("ExtendMaterial", false) ? "Material" : "Global";
		
		this.checkRoot("NumThreads", "array", "Compute shader must have a NumThreads array property (did you forget to add NumThreads=[1, 1, 1]; ?)");
		this.threadCounts = this.prop("NumThreads", []);
		if (this.threadCounts.length !== 3) {
			this.error(this.properties.get("NumThreads").data, "NumThreads must have exactly 3 elements");
		}

		this.threadCounts = this.threadCounts.map(v => v.value());
	}
	
	generate() {
		super.generate();
		
		this.output({
			context: this.data,
			template: "Plugin/Shaders/Compute/Private/Template.usf",
			output: `Shaders/${this.file.module}/Private/${this.name}.usf`,
			data: this
		});

		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Private/ComputeTemplate.cpp",
			output: `Source/${this.file.module}/Private/Compute/${this.name}.cpp`,
			data: this
		});

		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Private/ComputeTemplate.h",
			output: `Source/${this.file.module}/Private/Compute/${this.name}.h`,
			data: this
		});
	}

	shader() {
		return super.shader().replace("void " + this.name, `[numthreads(${this.threadCounts.join(", ")})]\nvoid ` + this.name)
	}
}