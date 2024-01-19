import type { IndexMapping } from '../../../../shadeup-frontend/lib/generator/root';

import type { MonacoEditorInstance } from 'src/monaco/editor';
import type ts from 'typescript';

import type {
	MessageMainToWorker,
	MessageWorkerToMain,
	ShadeupDiagnostic,
	ShadeupRenderedFile
} from './common';

export type ShadeupWorkspaceDiagnosticEvent = {
	diagnostics: ShadeupDiagnostic[];
};

export type ShadeupWorkspaceOutputEvent = {
	files: ShadeupRenderedFile[];
};

export class ShadeupWorkspaceInterface extends EventTarget {
	id: number = 0;
	worker: Worker;

	autoCompile = true;

	messageTimings: Map<number, { name: string; timestamp: number }> = new Map();

	pendingWrites: Map<string, { nonce: number; content: string }> = new Map();
	dirtyFilesForWrite: Set<string> = new Set();

	files: Map<string, string> = new Map();
	fileTypes: Map<string, 'typescript' | 'shadeup'> = new Map();
	fileMapping: Map<string, IndexMapping> = new Map();
	diagnostics: ShadeupDiagnostic[] = [];

	cachedFiles: ShadeupRenderedFile[] = [];

	queue: MessageMainToWorker[] = [];

	workerReady = false;

	nonceCounter = 0;

	waitingForNonce: Map<number, (msg: MessageWorkerToMain) => void> = new Map();

	constructor(worker: Worker) {
		super();

		this.setupWorker(worker);
	}

	setupWorker(worker: Worker) {
		this.worker = worker;

		this.worker.onerror = (e) => {
			console.log('Worker crashed');
			console.error(e);
			let newWorker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });
			this.setupWorker(newWorker);
		};

		this.worker.onmessage = async (e: MessageEvent<MessageWorkerToMain>) => {
			console.log('Got message', e.data);
			if (e.data.ready) {
				this.workerReady = true;

				let resp = await this.sendMessageWithResponse({
					key: 'init'
				});

				if (resp.output) {
					this.updateCachedFiles(resp.output);
					this.dispatchOutputEvent(resp.output);
				}

				this.processQueue();
			}
			console.log(
				'Processing message with',
				e.data.nonce,
				'in',
				this.nonceCounter - 1,
				'and',
				this.pendingWrites.size,
				'pending writes'
			);
			for (let entry of this.pendingWrites.entries()) {
				if (entry[1].nonce === e.data.nonce) {
					this.pendingWrites.delete(entry[0]);
					if (this.dirtyFilesForWrite.has(entry[0])) {
						this.dirtyFilesForWrite.delete(entry[0]);
						this.trySendWrite(entry[0]);
					}
				}
			}

			if (this.pendingWriteWatcher) this.pendingWriteWatcher();

			// if (e.data.nonce < this.nonceCounter - 1) return;

			if (typeof e.data.nonce === 'number') {
				let cb = this.waitingForNonce.get(e.data.nonce);
				if (cb) {
					cb(e.data);
					return;
				}
			}

			let timing = this.messageTimings.get(e.data.nonce);

			if (timing) {
				console.log(`Message ${timing.name} took ${performance.now() - timing.timestamp}ms`);
				this.messageTimings.delete(e.data.nonce);
			}

			if (e.data.files) {
				for (let f of e.data.files) {
					this.fileMapping.set(f.path, f.mapping);
				}
			}

			if (e.data.diagnostics) this.diagnostics = e.data.diagnostics;

			if (e.data.output) {
				this.updateCachedFiles(e.data.output);
				this.dispatchOutputEvent(e.data.output);
			}

			if (e.data.classifications) {
				this.applyClassifications(e.data.classifications.path, e.data.classifications.encoded);
			}

			this.dispatchEvent(
				new CustomEvent<ShadeupWorkspaceDiagnosticEvent>('diagnostic', {
					detail: {
						diagnostics: e.data.diagnostics
					}
				})
			);
		};
	}

	catchUpWorker() {
		for (let file of this.files.entries()) {
			let type = this.fileTypes.get(file[0]);
			if (type == 'shadeup') {
				this.writeFile(file[0], file[1]);
			} else {
				this.writeFileTypescript(file[0], file[1]);
			}
		}
	}

	pendingWriteWatcher: (() => void) | null = null;

	flushWrites(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.pendingWriteWatcher = () => {
				if (this.pendingWrites.size == 0 && this.dirtyFilesForWrite.size == 0) {
					this.pendingWriteWatcher = null;
					resolve();
				}
			};
		});
	}

	replayOutput() {
		console.log('Replaying output', this.cachedFiles);
		this.dispatchOutputEvent(this.cachedFiles);
	}

	updateCachedFiles(files: ShadeupRenderedFile[]) {
		for (let i = this.cachedFiles.length - 1; i >= 0; i--) {
			let f = this.cachedFiles[i];
			if (files.find((f2) => f2.path === f.path)) {
				this.cachedFiles.splice(i, 1);
			}
		}

		this.cachedFiles.push(...files);
	}

	applyClassifications(path: string, encoded: ts.Classifications) {
		this.dispatchEvent(
			new CustomEvent<{ path: string; encoded: ts.Classifications }>('classifications', {
				detail: {
					path,
					encoded
				}
			})
		);
	}

	dispatchOutputEvent(files: ShadeupRenderedFile[]) {
		this.dispatchEvent(
			new CustomEvent<ShadeupWorkspaceOutputEvent>('output', {
				detail: {
					files
				}
			})
		);
	}

	on(
		event: 'diagnostic',
		listener: (evt: CustomEvent<ShadeupWorkspaceDiagnosticEvent>) => void
	): void;
	on(event: 'output', listener: (evt: CustomEvent<ShadeupWorkspaceOutputEvent>) => void): void;
	on(
		event: 'writeFile',
		listener: (evt: CustomEvent<{ file: string; content: string }>) => void
	): void;
	on(
		event: 'classifications',
		listener: (evt: CustomEvent<{ path: string; encoded: ts.Classifications }>) => void
	): void;
	on(event: string, listener: (evt: CustomEvent<any>) => void) {
		this.addEventListener(event, listener as any);
	}

	off(
		event: 'diagnostic',
		listener: (evt: CustomEvent<ShadeupWorkspaceDiagnosticEvent>) => void
	): void;
	off(event: 'output', listener: (evt: CustomEvent<ShadeupWorkspaceOutputEvent>) => void): void;
	off(
		event: 'writeFile',
		listener: (evt: CustomEvent<{ file: string; content: string }>) => void
	): void;
	off(
		event: 'classifications',
		listener: (evt: CustomEvent<{ path: string; encoded: ts.Classifications }>) => void
	): void;
	off(event: string, listener: (evt: CustomEvent<any>) => void) {
		this.removeEventListener(event, listener as any);
	}

	processQueue() {
		if (!this.workerReady) return;

		for (let msg of this.queue) {
			this.sendMessage(msg);
		}
	}

	enqueueMessage(msg: MessageMainToWorker) {
		if (this.workerReady) {
			this.sendMessage(msg);
			return;
		}
		this.queue.push(msg);
	}

	async enqueueMessageWithResponse(msg: MessageMainToWorker): Promise<MessageWorkerToMain> {
		while (!this.workerReady) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		return await this.sendMessageWithResponse(msg);
	}

	trySendWrite(path: string, ignoreErrors = false) {
		let pending = this.pendingWrites.get(path);
		if (pending) {
			this.dirtyFilesForWrite.add(path);
		} else {
			let contents = this.files.get(path);
			if (contents) {
				this.enqueueMessage({
					key: 'writeFile',
					message: { path, emit: this.autoCompile, contents, ignoreErrors }
				});
			}
		}
	}

	writeFile(path: string, contents: string, ignoreErrors = false) {
		this.files.set(path, contents);
		this.fileTypes.set(path, 'shadeup');
		this.trySendWrite(path, ignoreErrors);
		this.dispatchEvent(
			new CustomEvent<{ file: string; content: string; ignoreErrors: boolean }>('writeFile', {
				detail: {
					file: path,
					emit: this.autoCompile,
					content: contents,
					ignoreErrors
				}
			})
		);
	}

	writeFileWithResponse(path: string, contents: string, ignoreErrors = false) {
		this.files.set(path, contents);
		this.fileTypes.set(path, 'shadeup');

		let ppromise = new Promise(() => {});

		let pending = this.pendingWrites.get(path);
		if (pending) {
			console.log('pending write', path);
			this.dirtyFilesForWrite.add(path);
		} else {
			let contents = this.files.get(path);
			if (contents) {
				ppromise = this.enqueueMessageWithResponse({
					key: 'writeFile',
					message: { path, emit: this.autoCompile, contents, ignoreErrors }
				});
			}
		}
		this.dispatchEvent(
			new CustomEvent<{ file: string; content: string }>('writeFile', {
				detail: {
					file: path,
					content: contents
				}
			})
		);

		return ppromise;
	}

	writeFileTypescript(path: string, contents: string) {
		this.files.set(path, contents);
		this.fileTypes.set(path, 'typescript');
		this.enqueueMessage({
			key: 'writeFileTypescript',
			message: { path, contents, emit: this.autoCompile }
		});
	}

	sendMessage(msg: MessageMainToWorker) {
		msg.nonce = this.nonceCounter++;
		this.messageTimings.set(msg.nonce, { name: msg.key, timestamp: performance.now() });
		if (msg.key == 'writeFile') {
			console.log('Set Pending write for', msg.message.path, msg.nonce);
			this.pendingWrites.set(msg.message.path, {
				nonce: msg.nonce,
				content: msg.message.contents
			});
		}
		this.worker.postMessage(msg);
	}

	sendMessageWithResponse(msg: MessageMainToWorker): Promise<MessageWorkerToMain> {
		return new Promise((resolve, reject) => {
			msg.nonce = this.nonceCounter++;
			this.waitingForNonce.set(msg.nonce, (msg) => {
				// console.log('got response', msg);
				this.waitingForNonce.delete(msg.nonce);
				resolve(msg);
			});

			this.worker.postMessage(msg);
		});
	}

	async connectEditor(path: string, monacoFilename: string, editor: MonacoEditorInstance) {
		const connectMonacoEditorToShadeupWorkspace = (await import('../monaco/connector'))
			.connectMonacoEditorToShadeupWorkspace;
		connectMonacoEditorToShadeupWorkspace(this, path, monacoFilename, editor);
	}

	async getCompletions(path: string, position: number) {
		let resp = await this.sendMessageWithResponse({
			key: 'getCompletions',
			message: {
				path,
				position
			}
		});

		return resp.completions;
	}

	async getHover(path: string, position: number) {
		let resp = await this.sendMessageWithResponse({
			key: 'getHover',
			message: {
				path,
				position
			}
		});

		return resp.hover;
	}

	reset() {
		this.enqueueMessage({ key: 'reset' });
		this.files.clear();
		this.fileMapping.clear();
		this.diagnostics = [];
		this.cachedFiles = [];
		this.dirtyFilesForWrite.clear();
		this.pendingWrites.clear();
	}

	assets(assets: [string, [string, string]][]) {
		this.enqueueMessage({ key: 'assets', message: assets });
	}
}

export async function makeShadeupWorkspace(): Promise<ShadeupWorkspaceInterface> {
	let worker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });

	let p = new ShadeupWorkspaceInterface(worker);
	if (!(window as any)['workspaceCounter']) (window as any)['workspaceCounter'] = 0;

	p.id = (window as any)['workspaceCounter']++;

	return p;
}
