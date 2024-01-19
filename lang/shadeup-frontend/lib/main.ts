import { SourceMapConsumer } from 'source-map';
import { compile } from './generator/root';
import { getShadeupParser } from './parser';
import { AstContext } from './parser/AstContext';

import sourceMappingURL from 'source-map/lib/mappings.wasm?url';
import { ShadeupEnvironment } from './environment/ShadeupEnvironment';

export async function initTest() {
	let env = new ShadeupEnvironment();
	await env.init();
	await env.writeFile(
		'/file.ts',
		`
	import "./other";
	`
	);

	let s = '';

	await env.writeFile(
		'/other.ts',
		`
struct Reference {
	id: int;
}

struct BoundingBox {
	min: float3;
	max: float3;

	references: Reference[3];
}

struct Player {
	health: float;
	pos: float2;
	bb: BoundingBox;
}

let outsideRef = 1;

let x = shader {
	let p = Player {
		health: float(outsideRef),
	};
};
`
	);
	await env.regenerate();
	let errors = await env.errors();
	for (let e of errors) {
		document.write(`<pre style="background: black; color: white;">${e.message}</pre>`);
		document.body.style.backgroundColor = 'black';
	}
}
