import {
	ShadeupEnvironment,
	type ShadeupGenericDiagnostic
} from '../../../../shadeup-frontend/lib/environment/ShadeupEnvironment';
import type {
	MessageMainToWorker,
	MessageWorkerToMain,
	ShadeupDiagnostic,
	ShadeupRenderedFile
} from './common';
import {
	lookupIndexMappingRange,
	reverseLookupIndexMapping
} from '../../../../shadeup-frontend/lib/generator/root';
import { indexToRowColumn } from '../../../../shadeup-frontend/lib/environment/ShadeupEnvironment';
import ts from 'typescript';

let env = new ShadeupEnvironment();
env.emitLogs = false;
await env.init();
await env.writeFile(
	'/file.ts',
	`
	
	`
);

import files from '../library/files';

let writes: Promise<any>[] = [];

let initFiles = ['/file.ts'];

let start = performance.now();

for (let [path, contents] of Object.entries(files.ts)) {
	let p = '/_std/' + path + '.ts';
	if (path == 'std') p = '/std.ts'; // So we can import it via import ui from "std";

	writes.push(env.writeFileTypescript(p, contents));
	initFiles.push(p);
}

for (let [path, contents] of Object.entries(files.shadeup)) {
	let p = '/_std/' + path + '.ts';
	writes.push(env.writeFile(p, contents, true));
	initFiles.push(p);
}

await Promise.all(writes);
// env.emitLogs = true;
console.log('Initialized worker in', performance.now() - start, 'ms');

postMessage({
	nonce: 0,
	diagnostics: [],
	files: [],
	ready: true,
	completions: [],
	hover: null,
	output: []
} as MessageWorkerToMain);

function findFile(path: string) {
	return env.files.find((f) => f.path === path);
}

function tsDiagnosticToShadeupDiagnostic(diag: {
	error: ts.Diagnostic;
	file: string;
	message: string;
}): ShadeupDiagnostic | null {
	let path = diag.error.file?.fileName ?? '';
	let file = findFile(path);
	if (!file) return null;
	let mapping = file.mapping;
	if (!mapping) return null;

	let to = lookupIndexMappingRange(
		mapping,
		diag.error.start ?? 0,
		(diag.error.start ?? 0) + (diag.error.length ?? 0)
	);

	let fileSource = file.content;
	if (fileSource) {
		let start = indexToRowColumn(fileSource, to.start);
		let end = indexToRowColumn(fileSource, to.end);

		return {
			path: diag.file,
			level: 'error',
			fullMessage: diag.message ?? '',
			startLine: start.row + 1,
			startColumn: start.column + 1,
			endLine: end.row + 1,
			endColumn: end.column + 1,
			message: ts.flattenDiagnosticMessageText(diag.error.messageText, '\n')
		};
	}

	return null;
}

function genericDiagnosticToShadeupDiagnostic(
	path: string,
	diag: ShadeupGenericDiagnostic
): ShadeupDiagnostic | null {
	let file = findFile(path);
	if (!file) return null;
	let mapping = file.mapping;
	if (!mapping) return null;

	let fileSource = file.content;
	if (fileSource) {
		let start = indexToRowColumn(fileSource, diag.startIndex);
		let end = indexToRowColumn(fileSource, diag.endIndex);

		return {
			path,
			level: 'error',
			fullMessage: diag.message ?? '',
			startLine: start.row + 1,
			startColumn: start.column + 1,
			endLine: end.row + 1,
			endColumn: end.column + 1,
			message: diag.message
		};
	}

	return null;
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

let dirtyFiles = new Set<string>();

onerror = function (e) {
	console.error(e);
};

onmessage = async function (e: MessageEvent<MessageMainToWorker>) {
	if (e.data.key === 'writeFile') {
		console.log('Received writefile nonce', e.data.nonce);
		await env.writeFile(e.data.message.path, e.data.message.contents, e.data.message.ignoreErrors);
		let filesToGenerate = [e.data.message.path];
		for (let dirty of dirtyFiles) {
			if (dirty !== e.data.message.path) filesToGenerate.push(dirty);
		}

		let output: {
			path: string;
			contents: string;
		}[] = [];
		if (e.data.message.emit) output = await env.regenerate(filesToGenerate);

		// await env.regenerate();
		let errors: {
			error: ts.Diagnostic;
			file: string;
			message: string;
		}[] = [];

		if (!e.data.message.ignoreErrors) {
			errors = await env.errors([e.data.message.path]);
		}

		let file = findFile(e.data.message.path);

		let diags: ShadeupDiagnostic[] = [];

		for (let parseError of file?.parseDiagnostics ?? []) {
			let diag = genericDiagnosticToShadeupDiagnostic(e.data.message.path, parseError);
			if (diag) diags.push(diag);
		}

		for (let error of errors) {
			let diag = tsDiagnosticToShadeupDiagnostic(error);
			if (diag) diags.push(diag);
		}

		// let output: ShadeupRenderedFile[] = [];

		if (errors.length == 0) {
			dirtyFiles.clear();
			// console.log('Output', e.data.message.path, output);
		} else {
			dirtyFiles.add(e.data.message.path);
			// console.log('Errors', e.data.message.path, errors);
		}
		console.log('Sending writefile nonce', e.data.nonce);
		postMessage({
			nonce: e.data.nonce,
			classifications: {
				path: e.data.message.path,
				encoded: env.classifications(e.data.message.path)
			},
			files: env.files.map((f) => ({
				path: f.path,
				contents: f.content,
				mapping: f.mapping
			})),
			diagnostics: diags,
			output
		});
	} else if (e.data.key === 'build') {
		let all = await env.regenerate();
		postMessage({
			nonce: e.data.nonce,
			output: all
		});
	} else if (e.data.key === 'writeFileTypescript') {
		await env.writeFileTypescript(e.data.message.path, e.data.message.contents);

		let errors = await env.errors();

		let file = findFile(e.data.message.path);

		let diags: ShadeupDiagnostic[] = [];

		for (let parseError of file?.parseDiagnostics ?? []) {
			let diag = genericDiagnosticToShadeupDiagnostic(e.data.message.path, parseError);
			if (diag) diags.push(diag);
		}

		for (let error of errors) {
			let diag = tsDiagnosticToShadeupDiagnostic(error);
			if (diag) diags.push(diag);
		}

		let output: ShadeupRenderedFile[] = [];

		if (errors.length == 0) {
			let filesToGenerate = [e.data.message.path];
			for (let dirty of dirtyFiles) {
				if (dirty !== e.data.message.path) filesToGenerate.push(dirty);
			}
			console.log('Ready to regenerate', filesToGenerate, dirtyFiles);
			if (e.data.message.emit) output = await env.regenerate(filesToGenerate);
			dirtyFiles.clear();
			// console.log('Output', e.data.message.path, output);
		} else {
			dirtyFiles.add(e.data.message.path);
			// console.log('Errors', e.data.message.path, errors);
		}

		postMessage({
			nonce: e.data.nonce,
			files: env.files.map((f) => ({
				path: f.path,
				contents: f.content,
				mapping: f.mapping
			})),
			diagnostics: diags,
			output
		});
	} else if (e.data.key == 'getCompletions') {
		let completions = await env.completions(e.data.message.path, e.data.message.position);
		postMessage({
			nonce: e.data.nonce,
			completions
		});
	} else if (e.data.key == 'getHover') {
		let hover = await env.hover(e.data.message.path, e.data.message.position);
		postMessage({
			nonce: e.data.nonce,
			hover
		});
	} else if (e.data.key == 'init') {
		let output = await env.regenerate([
			'/static-math.ts',
			'/std_math.ts',
			'/std___std_all.ts',
			...initFiles
		]);

		let errors = await env.errors();

		if (errors.length == 0) {
			dirtyFiles.clear();
		} else {
			dirtyFiles.add([...env.files][0].path);
		}

		postMessage({
			nonce: e.data.nonce,
			output: output //.filter((f) => f.path == '/std___std_all.js' || f.path == '/std_math.js')
		});
	} else if (e.data.key == 'reset') {
		dirtyFiles.clear();

		env.reset();
	} else if (e.data.key == 'assets') {
		env.setAssetMapping(e.data.message);
	}
};
