import type { ShadeupRenderedFile } from '../compiler/common';
import { globalDefine, globalRequire } from './amd';
import { initInput, type MouseState } from './input/input';
import { keyboardKeys } from './input/keyboardKeys';
import { ShadeupShaderInstance, ShadeupShaderSource } from './shader';
import { initUI } from './ui/ui';
import { parse_type, stringify_type, translateIdentifier, translateNumericToGLSL } from './util';

window.addEventListener('message', async function (e: MessageEvent) {
	var mainWindow = e.source;
	if (mainWindow == null) return;

	var result = '';
	if (e.data.type == 'frame') {
		try {
			let files: ShadeupRenderedFile[] = e.data.files;
			console.log(e.data);

			for (let file of files) {
				console.log(file);
				(() => {
					let define = (deps: string[], func: Function) => {
						globalDefine(file.path, deps, func);
					};
					define;
					try {
						const postMessage = (v: any) => mainWindow.postMessage(v, e.origin);
						eval(file.contents);
					} catch (e) {
						console.log(e);
						result = e.message;
					}
				})();
			}
			try {
				let outs = globalRequire(['/main.js'])[0];

				if (typeof outs.main === 'function') {
					let result = await outs.main();
					mainWindow.postMessage({ gid: (window as any)['LONG_GID'], data: result }, e.origin);
				} else {
					result = 'main is not a function';
				}
			} catch (e) {
				console.log(e);
				result = e.message;
			}
		} catch (e) {
			console.error(e);
			result = 'eval() threw an exception.';
		}
		mainWindow.postMessage(result, e.origin);
	}
});
