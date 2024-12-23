import nearley from "nearley";
import grammar from "../build/grammar.js";
import fs from "fs";
import { ParsedFile } from "./file.js";

export function parse(file) {
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