const fs = require("fs");
const path = require("path");

const ParsedValue = require("./types/value.js");

const Types = {
	compute: require("./types/compute.js"),
	actor: require("./types/actor.js"),
	factory: require("./types/factory.js"),
};

class ParsedFile {
	constructor(file, data, lines) {
		this.file = file;
		this.data = data;
		this.lines = lines;

		this.preprocessor = [];
		this.meta = new Map();
		this.definitions = new Map();

		this.module = "Shadeup";
		this.plugin = "Shadeup";
		this.outputDir = path.join(__dirname, "../dist");
	}

	mapToLine(index) {
		for (let i = 0; i < this.lines.length; i++) {
			if (this.lines[i] > index) {
				return [i, index - this.lines[i - 1]];
			}
		}

		return [this.lines.length, index - this.lines[this.lines.length - 1]];
	}

	error(context, message) {
		let loc = this.mapToLine(context.location);
		let d = fs.readFileSync(this.file, "utf8");
		let lines = d.split("\n");
		let line = lines[loc[0]];
		let prevLines = [];

		let maxDigits = 0;

		for (let i = loc[0] - 2; i <= loc[0]; i++) {
			if (i >= 0) {
				let digits = (i+1).toString().length;
				if (digits > maxDigits) {
					maxDigits = digits;
				}
			}
		}

		for (let i = loc[0] - 2; i <= loc[0]; i++) {
			if (i >= 0) {
				prevLines.push(`${(i+1).toString().padStart(maxDigits, " ")}  ${lines[i].replace(/\t/g, "    ")}`);
			}
		}

		let offset = 0;
		for (let c = 0; c < line.length; c++) {
			if (c < loc[1]) {
				if (line[c] == "\t") {
					offset += 4;
				}
			}
		}
		// line = line.replace(/\t/g, "    ");
		if (isNaN(loc[1])) {
			throw new Error("Invalid context provided to error " + JSON.stringify(context));
		}
		console.log("");
		console.error(prevLines.join("\n"));
		let cols = 0;
		for (let c = 0; c < line.length; c++) {
			if (c < loc[1]) {
				if (line[c] == "\t") {
					cols += 4;
				}else{
					cols++;
				}
			}
		}
		console.error(`${new Array(cols + maxDigits + 2).join(" ")}^`);
		console.error(`ERROR ${this.file}:${loc[0]+1}:${loc[1]} ${message}`);
		console.log("");
	}

	generate() {
		for (let item of this.data.items) {
			if (item.type === "define") {
				let name = item.identifier.text;
				if (this.definitions.has(name)) {
					this.error(item.identifier, `Duplicate definition of "${name}"`);
					return;
				}
				
				this.definitions.set(name, new Types[item.keyword.text](this, item));
			}else if (item.type === "meta") {
				let name = item.identifier.text;
				if (this.meta.has(name)) {
					this.error(item.identifier, `Duplicate meta definition of "${name}"`);
					return;
				}

				this.meta.set(name, new ParsedValue(this, item.value));
			}else if (item.type == "pre") {
				this.preprocessor.push(item.text);
			}
		}

		if (this.meta.has("module")) {
			this.module = this.meta.get("module").value();
		}

		for (let definition of this.definitions.values()) {
			definition.verify();
		}

		for (let definition of this.definitions.values()) {
			definition.generate();
		}
	}
}

module.exports = ParsedFile;