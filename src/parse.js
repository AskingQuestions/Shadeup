const nearley = require("nearley");
const grammar = require("../build/grammar.js");
const fs = require("fs");
const ParsedFile = require("./file.js");


module.exports = {
	parse: function(file) {
		const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
		
		let f;

		try {
			f = fs.readFileSync(file, "utf8");
		} catch (e) {
			console.error(`Could not read file "${file}". ` + e);
			return;
		}

		try {
			parser.feed(f);
		} catch (e) {
			console.error(`${file} ` + e);
			return;
		}

		if (parser.results.length === 0) {
			console.error(`Parsing error. Are you missing a semicolon or curly brace?`);
			return;
		}

		let lines = [];
		for (let i = 0; i < f.length; i++) {
			if (f[i] === "\n") {
				lines.push(i);
			}
		}

		return new ParsedFile(file, parser.results[0], lines);
	}
};