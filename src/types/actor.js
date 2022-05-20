const BaseGenerator = require("./base.js");

class ActorGenerator extends BaseGenerator {
	verify() {
		super.verify();
		
		if (this.name[0] != "A") {
			this.error(this.data.identifier, `Actor name must start with the letter "A" (Change "${this.name}" to "A${this.name}")`);
		}

		this.nameWithoutPrefix = this.name.substr(1, this.name.length - 1);
	}
	
	generate() {
		super.generate();

		this.includeLib();
		
		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Private/ActorTemplate.cpp",
			output: `Source/${this.file.module}/Private/Actors/${this.nameWithoutPrefix}.cpp`,
			data: this
		});

		this.output({
			context: this.data,
			template: "Plugin/Source/Module/Public/ActorTemplate.h",
			output: `Source/${this.file.module}/Public/Actors/${this.nameWithoutPrefix}.h`,
			data: this
		});
	}
}

module.exports = ActorGenerator;