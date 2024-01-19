import type { ShadeupWorkspaceInterface } from './compiler/interface';
import ShadeupEnvironment from './environment';
import frame from './frame.html?raw';
import frameHeadless from './engine/frame-headless.html?raw';
import engineUrlHeadless from './engine/engine-headless?url';
import type { ShadeupExternalSymbol } from './symbol';
import type { ShadeupRenderedFile } from './compiler/common';

export async function simpleRun(source: string, expose: ShadeupExternalSymbol[] = []) {
	let env = await makeEnvironment(source, expose);

	return await runEnvironment(env);
}

export async function makeEnvironment(source: string, expose: ShadeupExternalSymbol[] = []) {
	let env = new ShadeupEnvironment();

	await env.load();

	for (let sym of expose) {
		env.addSymbol(sym);
	}

	return env;
}

export async function runEnvironmentLong(
	env: ShadeupWorkspaceInterface,
	cb: (message: any) => void
) {
	let gid = (window as any).runLongId || 0;
	(window as any).runLongId = gid + 1;

	let iframe = document.createElement('iframe');
	iframe.sandbox.add('allow-scripts');
	iframe.srcdoc = frame;
	iframe.style.display = 'none';
	iframe.srcdoc = frameHeadless.replace('%GID%', gid).replace('%ENGINE_URL%', engineUrlHeadless);

	let windowListener = (e: MessageEvent) => {
		console.log('got message from iframe', e);
		var frame = document.getElementById('sandboxed');
		if (e.origin === 'null' && e.source === iframe.contentWindow && e.data && e.data.gid === gid) {
			cb(e.data.data);
		}
	};

	window.addEventListener('message', windowListener);

	let iframeIsLoaded = false;
	let enqueuedFiles: ShadeupRenderedFile[] = [];

	const sendFilesToIframe = () => {
		iframe.contentWindow?.postMessage(
			{
				type: 'frame',
				files: enqueuedFiles
			},
			'*'
		);
	};

	iframe.onload = () => {
		if (iframe.contentWindow) {
			iframeIsLoaded = true;
			if (enqueuedFiles.length > 0) {
				sendFilesToIframe();
			}
		}
	};

	env.on('output', (msg) => {
		enqueuedFiles = [...enqueuedFiles, ...msg.detail.files];
		if (iframeIsLoaded) {
			sendFilesToIframe();
		}
	});

	document.body.appendChild(iframe);

	return () => {
		iframe.remove();

		window.removeEventListener('message', windowListener);
	};
}

export async function runEnvironment(env: ShadeupEnvironment) {
	env.evaluate('main.shadeup');

	let js = await env.generateFile('main.shadeup');

	return await new Promise((resolve) => {
		let iframe = document.createElement('iframe');
		iframe.sandbox.add('allow-scripts');
		iframe.srcdoc = frame;
		iframe.style.display = 'none';

		let windowListener = (e: MessageEvent) => {
			var frame = document.getElementById('sandboxed');
			if (e.origin === 'null' && e.source === iframe.contentWindow) {
				resolve(e.data);
				window.removeEventListener('message', windowListener);
			}
		};

		window.addEventListener('message', windowListener);

		iframe.onload = () => {
			if (iframe.contentWindow) {
				iframe.contentWindow.postMessage(js, '*');
			} else {
				console.log('no content window');

				resolve(false);
			}
		};
		document.body.appendChild(iframe);
	});
}
