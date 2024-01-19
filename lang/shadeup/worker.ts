import { makeEnvironment } from 'src/shadeup/runner';
import type * as TYPES from '../../../parser-wasm/pkg/parser_wasm';
import { ShadeupExternalSymbol } from './symbol';

const env = await makeEnvironment(``, [
	ShadeupExternalSymbol.makeFunction(
		'draw',
		'void',
		[
			['geo', 'Geometry', false],
			['shade', 'shader', false]
		],
		`
	console.log("Drawing");
	`
	)
]);

function hiddenProtosToObj(obj: any) {
	let out: any = {};

	let proto = Object.getPrototypeOf(obj);

	while (proto) {
		for (let key of Object.getOwnPropertyNames(proto)) {
			if (key == 'constructor') continue;
			out[key] = obj[key];
		}
	}

	return out;
}

let evaluating = new Map<string, boolean>();
let evaluateQueue = new Map<string, boolean>();
function evaluate(filename: string, skipGenerate = false) {
	let now = performance.now();

	console.log('evaluating', filename);

	let success = env.evaluate(filename);
	let messages = [];
	let totalAlerts = 0;

	for (let f of env.files.keys()) {
		let alerts: TYPES.Alert[] = env.getAlerts(f);
		totalAlerts += alerts.length;
	}

	if (success && totalAlerts == 0 && !skipGenerate) {
		let out = env.generateFile(filename);

		messages.push({
			type: 'rendered',
			filename,
			data: out
		});
	}

	for (let f of env.files.keys()) {
		let alerts: TYPES.Alert[] = env.getAlerts(f);

		let alertsMessage = {
			type: 'alerts',
			filename: f,
			data: alerts.map((a) => ({
				level: a.level,
				message: a.message,
				simple_message: a.simple_message,
				location: {
					start_line_and_column: [
						a.location.start_line_and_column[0],
						a.location.start_line_and_column[1]
					],
					end_line_and_column: [
						a.location.end_line_and_column[0],
						a.location.end_line_and_column[1]
					]
				}
			}))
		};
		messages.push(alertsMessage);

		let imports = env.getImports(f);
		let importsMessage = {
			type: 'imports',
			filename: f,
			data: imports.map((s: any) => ({
				imports: s.imports.map((i: any) => ({
					name: i.name,
					alias: i.alias,
					span: mapSpan(i.span)
				})),
				path: s.path,
				span: mapSpan(s.span)
			}))
		};
		messages.push(importsMessage);

		let intellisense = env.getIntellisense(f);
		let intellisenseMessage = {
			type: 'intellisense',
			filename: f,
			data: intellisense
		};
		messages.push(intellisenseMessage);
	}

	let symbols = env.getSymbols();
	let symbolsMessage = {
		type: 'symbols',
		data: symbols.map((s: any) => ({
			name: s.name,
			file: s.file,
			aliased: s.aliased,
			imported: s.imported,
			kind: s.kind
		}))
	};
	messages.push(symbolsMessage);

	function mapSpan(span: any) {
		return {
			start: span.start,
			end: span.end
		};
	}

	postMessage({ type: 'messages', messages });

	console.log('evaluated', filename, 'in', performance.now() - now, 'ms');
}

onmessage = function (e) {
	const { type, filename, data } = e.data;
	if (type == 'addSymbol') {
		env.addSymbol(data);
	} else if (type == 'writeFile') {
		env.updateFile(filename, data);
	} else if (type == 'evaluate') {
		if (evaluating.has(filename)) {
			console.log('already evaluating', filename, 'skipping');
			// Mark the file as dirty so that it will be re-evaluated after the current evaluation is done
			evaluateQueue.set(filename, true);
			return;
		}

		evaluating.set(filename, true);
		this.setTimeout(() => {
			evaluate(filename, data.skipGenerate);

			evaluating.delete(filename);
		}, 0);

		if (evaluateQueue.has(filename)) {
			// evaluateQueue.delete(filename);
			// evaluate(filename);
		}
	} else if (type == 'reset') {
		env.reset();
	}
};
