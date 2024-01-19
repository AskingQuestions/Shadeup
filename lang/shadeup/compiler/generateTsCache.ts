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
import files from '../library/files';

export async function generateTsCache() {
	let env = new ShadeupEnvironment();
	env.emitLogs = false;
	await env.init();
	env.stdEmitCache.clear();
	await env.writeFile(
		'/file.ts',
		`
	
	`
	);

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

	await env.regenerate();
	let outs = await env.errors();
	for (let out of outs) {
		if (out.error) {
			console.log(out.error);
		}
	}

	return env.stdEmitCache;
}
