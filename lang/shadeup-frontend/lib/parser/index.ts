import Parser from 'web-tree-sitter';
import treeSitterShadeupURL from './tree-sitter-shadeup.wasm?url';
import treeSitterURL from 'web-tree-sitter/tree-sitter.wasm?url';

let wasm: Promise<Parser.Language> | null = null;

function isBrowser() {
	if (typeof window !== 'undefined') {
		return true;
	}
	if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
		return true;
	}
	return false;
}

export async function getShadeupParser() {
	// if (typeof process === 'object') {
	// 	// let nodeParser = (await import('./node.cjs')).default;
	// 	return nodeParser();
	// } else {
	// if (isBrowser()) {

	let url = treeSitterURL;
	let shadeUrl = treeSitterShadeupURL;
	// if (typeof window === 'undefined') {
	// 	url = './tree-sitter.wasm';
	// 	shadeUrl = './tree-sitter-shadeup.wasm';
	// }
	// if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	// 	url = treeSitterURL;
	// 	shadeUrl = treeSitterShadeupURL;
	// }
	// console.log('Loading parser', url, Parser);
	await Parser.init({
		locateFile(scriptName: string, scriptDirectory: string) {
			return url;
		}
	});

	const parser = new Parser();

	parser.setLanguage(await Parser.Language.load(shadeUrl));

	return parser;
	// } else {
	// 	// let nodeParser = (await import('./node.cjs')).default;
	// 	// return nodeParser();
	// 	return global.shadeupParser();
	// }
}
