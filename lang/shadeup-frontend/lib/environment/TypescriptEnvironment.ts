import {
	createDefaultMapFromCDN,
	createVirtualTypeScriptEnvironment,
	createSystem,
	VirtualTypeScriptEnvironment,
	createVirtualLanguageServiceHost
} from '@typescript/vfs';
import ts from 'typescript';
import lzstring from 'lz-string';
import diff from '../fast-diff/diff.js';

import stdMath from '../std/math?raw';
import stdStaticMath from '../std/static-math?raw';
import stdAll from '../std/all?raw';
import globalDTS from '../std/global.d.ts?raw';
import {
	updateAsyncArrows,
	updateAsyncCalls,
	updateClassStructure,
	updateIntegerMixing
} from '../generator/transform';
import { ShadeupEnvironment } from './ShadeupEnvironment';

export type TypescriptEnvironment = {
	env: VirtualTypeScriptEnvironment;
	system: ts.System;
	fsMap: Map<string, string>;
};

export async function makeTypescriptEnvironment(shadeupEnv: ShadeupEnvironment) {
	const shouldCache = false;
	// This caches the lib files in the site's localStorage
	let fsMap = await createDefaultMapFromCDN(
		{ target: ts.ScriptTarget.ES2015, lib: ['es5', 'es2015', 'es2015.promise'] },
		'3.7.3',
		shouldCache,
		ts
	);

	fsMap = new Map();

	fsMap.set('/file.ts', '');
	fsMap.set('/std_math.ts', stdMath);
	fsMap.set('/static-math.ts', stdStaticMath);
	fsMap.set('/std___std_all.ts', stdAll);
	fsMap.set('/global.d.ts', globalDTS);

	// This stores the lib files as a zipped string to save space in the cache
	// const otherMap = await createDefaultMapFromCDN(
	// 	{ target: ts.ScriptTarget.ES2015 },
	// 	'3.7.3',
	// 	shouldCache,
	// 	ts,
	// 	lzstring
	// );

	// fsMap.set('index.ts', "console.log('hello world!')");

	const system = createSystem(fsMap);
	system.$fsMap = fsMap;

	// system.write('std');

	system.writeFile('/std___std_all.ts', stdAll);
	system.writeFile('/std_math.ts', stdMath);
	system.writeFile('/static-math.ts', stdStaticMath);
	system.writeFile('/global.d.ts', globalDTS);
	const compilerOpts = {
		module: ts.ModuleKind.AMD,
		removeComments: false,
		lib: ['es5'],
		//noImplicitUseStrict: true,
		alwaysStrict: true,
		strictNullChecks: true,
		strictFunctionTypes: true,
		strictBindCallApply: true,
		strictPropertyInitialization: true,
		noImplicitThis: true,
		strict: true,
		noImplicitAny: true,
		noImplicitReturns: true
	};
	let transformers = {
		before: [
			updateIntegerMixing(() => [
				env.languageService.getProgram().getTypeChecker(),
				shadeupEnv,
				shadeupEnv.loads
			]),
			updateAsyncCalls(() => [env.languageService.getProgram().getTypeChecker(), shadeupEnv]),
			// updateAsyncArrows(() => [env.languageService.getProgram().getTypeChecker(), shadeupEnv]),
			updateClassStructure(() => env.languageService.getProgram().getTypeChecker())
		]
	} as ts.CustomTransformers;

	const env = createVirtualTypeScriptEnvironment(
		system,
		Object.keys(fsMap),
		ts,
		compilerOpts,
		transformers
	);

	// let services = createVirtualLanguageServiceHost(
	// 	system,
	// 	Object.keys(fsMap),
	// 	compilerOpts,
	// 	ts,
	// 	transformers
	// );

	// let f = fs.readFileSync('f.ts', 'utf8');
	// let now = performance.now();
	// let diffs = diff(f, 'a' + f + "console.log('hello world!')");
	// console.log('took', performance.now() - now, 'ms for diff');
	// let f = "console.log('hello world!')"
	// You can then interact with the languageService to introspect the code
	// now = performance.now();
	// let h = env.languageService.getEmitOutput('index.ts');
	// console.log(h.outputFiles[0].text);
	// console.log('took', performance.now() - now, 'ms');
	// env.updateFile('index.ts', f);
	// now = performance.now();
	// h = env.languageService.getEmitOutput('index.ts');
	// console.log('took', performance.now() - now, 'ms');

	// now = performance.now();
	// env.getSourceFile("index.ts").update(f + "console.log()", {
	// 	span: {
	// 		start: f.length,
	// 		length: 0
	// 	},
	// 	newLength: 13
	// 	}
	// )
	// env.updateFile('index.ts', 'console.log();', {
	// 	start: 0,
	// 	length: 0
	// });

	// env.updateFile("index.ts", f + "console.log()");
	// h = env.languageService.getEmitOutput("index.ts")
	// let s = env.languageService.getCompletionsAtPosition('index.ts', f.length + 1, undefined);
	// console.log(s)
	// console.log('took', performance.now() - now, 'ms');

	// now = performance.now();
	// env.updateFile('index.ts', f + 'console.l');
	// h = env.languageService.getEmitOutput("index.ts")
	// s = env.languageService.getCompletionsAtPosition('index.ts', f.length + 1, undefined);

	env.createFile('/std___std_all.ts', stdAll);
	env.createFile('/std_math.ts', stdMath);
	env.createFile('/static-math.ts', stdStaticMath);
	env.createFile('/global.d.ts', globalDTS);

	// let sfNew = env.getSourceFile('std/__std_all.ts');
	// let program = env.languageService.getProgram();
	// let checker = program?.getTypeChecker();
	// console.log(program?.getSemanticDiagnostics(sfNew));

	return {
		env,
		fsMap,
		system
	} as TypescriptEnvironment;
}
