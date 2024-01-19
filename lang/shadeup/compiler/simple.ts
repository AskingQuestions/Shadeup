import { ShadeupEnvironment } from '../../../../shadeup-frontend/lib/environment/ShadeupEnvironment';

import files from '../library/files';

export async function makeSimpleShadeupEnvironment() {
	let env = new ShadeupEnvironment();
	env.emitLogs = false;
	await env.init();
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

	return env;
}
