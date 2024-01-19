import ShaderGenerator from "./shader.js";
import ParsedValue from "./value.js";

export default class FactoryGenerator extends ShaderGenerator {
	verify() {
		super.verify();

		if (this.name[0] != "F") {
			this.error(this.data.identifier, `Vertex Factory name must start with the letter "F" (Change "${this.name}" to "F${this.name}")`);
		}

		this.nameWithoutPrefix = this.name.substr(1, this.name.length - 1);
	}
	
	generate() {
		super.generate();
		
		this.output({
			context: this.data,
			template: "Plugin/Shaders/Factory/Private/Template.ush",
			output: `Shaders/${this.file.module}/Private/${this.nameWithoutPrefix}.ush`,
			data: this
		});

		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Private/FactoryTemplate.cpp",
			output: `Source/${this.file.module}/Private/Factory/${this.nameWithoutPrefix}.cpp`,
			data: this
		});

		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Private/FactoryTemplate.h",
			output: `Source/${this.file.module}/Private/Factory/${this.nameWithoutPrefix}.h`,
			data: this
		});
	}

	shader() {
		return super.shader();
	}
}