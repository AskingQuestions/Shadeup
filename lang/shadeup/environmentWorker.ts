import type ShadeupEnvironment from './environment';
import type { ShadeupExternalSymbol } from './symbol';

import type { ShadeupAlert } from './alert.js';

export class ShadeupEnvironmentProxy extends EventTarget {
	worker: Worker;

	renderedFiles: Map<string, string>;
	files: Map<string, string>;
	alerts: Map<string, ShadeupAlert[]>;
	intellisense: Map<string, any>;
	symbols: any;
	imports: Map<string, any>;

	constructor(worker: Worker) {
		super();

		this.worker = worker;

		this.renderedFiles = new Map();
		this.files = new Map();
		this.alerts = new Map();
		this.intellisense = new Map();
		this.symbols = new Map();
		this.imports = new Map();

		let handleMessage = (msg: any) => {
			if (msg.type == 'intellisense') {
				this.intellisense.set(msg.filename, msg.data);
				this.dispatchEvent(new CustomEvent('intellisensed', { detail: msg.filename }));
			} else if (msg.type == 'alerts') {
				this.alerts.set(msg.filename, msg.data);
				this.dispatchEvent(new CustomEvent('alerted', { detail: msg.filename }));
			} else if (msg.type == 'symbols') {
				this.symbols = msg.data;
			} else if (msg.type == 'imports') {
				this.imports.set(msg.filename, msg.data);
			} else if (msg.type == 'rendered') {
				this.renderedFiles.set(msg.filename, msg.data);
			}
		};
		this.worker.onmessage = (e) => {
			if (e.data.type == 'messages') {
				let hadRender = false;
				let renderFile = null;
				for (let msg of e.data.messages) {
					handleMessage(msg);
					if (msg.type == 'rendered') {
						hadRender = true;
						renderFile = msg.filename;
					}
				}

				if (hadRender) {
					this.dispatchEvent(new CustomEvent('rendered', { detail: renderFile }));
				}

				this.dispatchEvent(new CustomEvent('refresh', {}));
			} else {
				handleMessage(e.data);
			}
		};
	}

	sendMessage(message: any) {
		this.worker.postMessage(message);
	}

	addSymbol(sym: ShadeupExternalSymbol) {
		this.sendMessage({ type: 'addSymbol', symbol: sym });
	}

	getAlerts(filename: string) {
		return this.alerts.get(filename) ?? [];
	}

	getIntellisense(filename: string) {
		return this.intellisense.get(filename);
	}

	writeFile(filename: string, content: string) {
		this.files.set(filename, content);
		this.sendMessage({ type: 'writeFile', filename, data: content });
		this.dispatchEvent(new CustomEvent('fileChanged', { detail: filename }));
	}

	evaluate(filename: string, skipGenerate = false) {
		this.sendMessage({ type: 'evaluate', filename, data: { skipGenerate } });
	}

	getImports(filename: string) {
		return this.imports.get(filename);
	}

	getSymbols() {
		return this.symbols;
	}

	reset() {
		this.sendMessage({ type: 'reset' });
		this.files.clear();
		this.alerts.clear();
		this.intellisense.clear();
		this.symbols.clear();
		this.imports.clear();
	}
}

export function newEnvironmentWorker(): ShadeupEnvironmentProxy {
	let worker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });

	let p = new ShadeupEnvironmentProxy(worker);

	return p;
}
