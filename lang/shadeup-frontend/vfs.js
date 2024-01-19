import {
	createDefaultMapFromCDN,
	createVirtualTypeScriptEnvironment,
	createSystem
} from '@typescript/vfs';
import ts from 'typescript';
import lzstring from 'lz-string';
// import fs from 'fs';
import diff from './lib/fast-diff/diff';

const start = async () => {
	const shouldCache = false;
	// This caches the lib files in the site's localStorage
	const fsMap = await createDefaultMapFromCDN(
		{ target: ts.ScriptTarget.ES2015 },
		'3.7.3',
		shouldCache,
		ts
	);

	// This stores the lib files as a zipped string to save space in the cache
	const otherMap = await createDefaultMapFromCDN(
		{ target: ts.ScriptTarget.ES2015 },
		'3.7.3',
		shouldCache,
		ts,
		lzstring
	);

	fsMap.set('index.ts', "console.log('hello world!')");

	const system = createSystem(fsMap);

	const compilerOpts = {};
	const env = createVirtualTypeScriptEnvironment(system, ['index.ts'], ts, compilerOpts);
	// let f = fs.readFileSync('f.ts', 'utf8');
	let f = '';
	let now = performance.now();
	let diffs = diff(f, 'a' + f + "console.log('hello world!')");
	console.log('took', performance.now() - now, 'ms for diff');
	// let f = "console.log('hello world!')"
	// You can then interact with the languageService to introspect the code
	now = performance.now();
	let h = env.languageService.getEmitOutput('index.ts');
	console.log(h.outputFiles[0].text);
	console.log('took', performance.now() - now, 'ms');
	env.updateFile('index.ts', f);
	now = performance.now();
	h = env.languageService.getEmitOutput('index.ts');
	console.log('took', performance.now() - now, 'ms');

	now = performance.now();
	// env.getSourceFile("index.ts").update(f + "console.log()", {
	// 	span: {
	// 		start: f.length,
	// 		length: 0
	// 	},
	// 	newLength: 13
	// 	}
	// )
	env.updateFile('index.ts', 'console.log();', {
		start: 0,
		length: 0
	});

	// env.updateFile("index.ts", f + "console.log()");
	// h = env.languageService.getEmitOutput("index.ts")
	let s = env.languageService.getCompletionsAtPosition('index.ts', f.length + 1, undefined);
	// console.log(s)
	console.log('took', performance.now() - now, 'ms');

	now = performance.now();
	env.updateFile('index.ts', f + 'console.l');
	// h = env.languageService.getEmitOutput("index.ts")
	s = env.languageService.getCompletionsAtPosition('index.ts', f.length + 1, undefined);
	// console.log(s)
	console.log('took', performance.now() - now, 'ms');

	// ...
};

start();
