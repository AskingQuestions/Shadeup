import { makeSimpleShadeupEnvironment } from "./shadeup-compiler.js";
import Parser from "web-tree-sitter";
import minify from "uglify-js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(new URL(import.meta.url));
export async function makeCompiler() {
	await Parser.init();
	const parser = new Parser();
	const Lang = await Parser.Language.load(
		path.resolve(path.dirname(__filename), "tree-sitter-shadeup.wasm")
	);
	parser.setLanguage(Lang);

	global.shadeupParser = () => {
		return parser;
	};

	let envPool = [];

	for (let i = 0; i < 1; i++) {
		envPool.push(await makeSimpleShadeupEnvironment(true));
	}

	let queue = [];

	async function consumeQueue() {
		if (queue.length == 0) return;
		if (envPool.length == 0) return;
		let env = envPool.shift();
		let item = queue.shift();
		if (!item) return;
		try {
			let start = performance.now();
			env.reset();
			for (let file of item.files) {
				if (file.name != "main")
					env.writeFile("/" + file.name + ".ts", file.body);
			}
			for (let file of item.files) {
				if (file.name == "main")
					await env.writeFile("/" + file.name + ".ts", file.body);
			}

			let output = await env.regenerate();
			let finalOutput = "";
			let dts = "";
			console.log(output.map((o) => o.path));

			for (let o of output) {
				if (
					!item.files.find(
						(f) =>
							f.name ==
							o.path
								.replace(/^\//g, "")
								.replace(".js", "")
								.replace(".d.ts", "")
					)
				)
					continue;

				if (o.path.endsWith(".d.ts")) {
					dts += o.contents;
				} else {
					finalOutput += `
((defineFunc) => {
	let define = (deps, func) => defineFunc(${JSON.stringify(o.path)}, deps, func);
	${o.contents}
})(define);
`;
				}
			}

			let final = finalOutput;
			let doMinify = false;

			if (doMinify) {
				final = minify.minify(final);
				// console.log(final);
			}
			console.log("Generated in " + (performance.now() - start) + "ms");

			item.callback({
				output: final,
				dts,
			});

			envPool.push(env);
			consumeQueue();
		} catch (e) {
			console.error(e);

			envPool.push(await makeSimpleShadeupEnvironment());
			item.callback({
				error: "Fatal error while compiling.",
			});
			consumeQueue();
		}
	}

	return async function compile(data) {
		return new Promise((resolve, reject) => {
			queue.push({ ...data, callback: resolve });
			consumeQueue();
		});
	};
}
