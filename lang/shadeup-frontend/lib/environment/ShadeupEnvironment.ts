import { SourceMapConsumer } from 'source-map';
import Parser from 'web-tree-sitter';
import {
	compile,
	IndexMapping,
	lookupIndexMapping,
	lookupIndexMappingRange,
	prePass,
	reverseLookupIndexMapping,
	reverseLookupIndexMappingCursor,
	reverseLookupIndexMappingRange,
	SourceNode,
	SourceString
} from '../generator/root';
import { getShadeupParser } from '../parser';
import { AstContext } from '../parser/AstContext';
import { makeTypescriptEnvironment, TypescriptEnvironment } from './TypescriptEnvironment';
import sourceMappingURL from 'source-map/lib/mappings.wasm?url';
import diff from '../fast-diff/diff.js';

import ts from 'typescript';
import { Color, Report, ReportKind, Source, Label, Range } from '../ariadne-ts/src/browser';
import { mkStringWriter } from '../ariadne-ts/src/data/Write.js';
import AnsiUp from 'ansi_up';
import { nicerError } from './Errors';
import { validate, validateGraph } from './validate';
import { addGLSLShader, GLSLCompilationError, GLSLShader } from '../generator/glsl';
import { Write } from '../ariadne-ts/src/data/Write';
import { cleanName, closest, findShadeupTags } from '../generator/util';
import { updateIntegerMixing } from '../generator/transform';
import { TagGraph } from './tagGraph';
import { addWGSLShader, WGSLShader } from '../generator/wgsl';

import quickCache from './quickCache.json';

function countLines(str: string) {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '\n') {
			count++;
		}
	}
	return count;
}

export type ShadeupGenericDiagnostic = {
	message: string;
	startIndex: number;
	endIndex: number;
};

type SymbolRange = {
	startIndex: number;
	endIndex: number;
};

export type ShadeupFile = {
	path: string;
	content: string;
	parsedFlatSymbolMap: SymbolRange[];
	transpiled: string;
	shaders: { glsl: GLSLShader; wgsl: WGSLShader }[];
	map: SourceMapConsumer | null;
	mapping: IndexMapping | null;
	oldTree: Parser.Tree | null;
	parseDiagnostics: ShadeupGenericDiagnostic[];
	cachedDiagnostics: ShadeupGenericDiagnostic[];
};

type DiffRange = {
	startIndex: number;
	oldEndIndex: number;
	newEndIndex: number;
	startPosition: { row: number; column: number };
	oldEndPosition: { row: number; column: number };
	newEndPosition: { row: number; column: number };
};

export type ClassificationRanges = {
	ranges: [number, number, ts.ScriptElementKind][];
};

export function indexToRowColumn(str: string, index: number) {
	let row = 0;
	let column = 0;
	for (let i = 0; i < index; i++) {
		if (str[i] === '\n') {
			row++;
			column = 0;
		} else {
			column++;
		}
	}
	return { row, column };
}

export function rowColumnToIndex(str: string, row: number, column: number) {
	let index = 0;
	let currentRow = 0;
	let currentColumn = 0;
	while (currentRow < row || currentColumn < column) {
		if (str[index] === '\n') {
			currentRow++;
			currentColumn = 0;
		} else {
			currentColumn++;
		}
		index++;
	}
	return index;
}

function getDiffRange(a: string, b: string) {
	let diffs = diff(a, b);
	if (diffs.length === 1) {
		return null;
	}
	let startIndex = 0;
	let oldEndIndex = a.length;
	let newEndIndex = b.length;

	let insertions = 0;
	let deletions = 0;
	let neutrals = 0;

	for (let i = 0; i < diffs.length; i++) {
		let diff = diffs[i];
		if (diff[0] === 1) {
			insertions++;
		} else if (diff[0] === -1) {
			deletions++;
		} else if (diff[0] === 0) {
			neutrals++;
		}

		if (insertions > 1 || deletions > 1 || neutrals > 1) {
			return null;
		}
	}

	for (let i = 0; i < diffs.length; i++) {
		let diff = diffs[i];

		if (diff[0] === 0) {
			startIndex += diff[1].length;
		} else if (diff[0] === -1) {
			oldEndIndex = startIndex + diff[1].length;
			newEndIndex = startIndex;
			break;
		} else if (diff[0] === 1) {
			newEndIndex = startIndex + diff[1].length;
			oldEndIndex = startIndex;
			break;
		}
	}

	return {
		startIndex,
		oldEndIndex,
		newEndIndex,
		startPosition: indexToRowColumn(a, startIndex),
		oldEndPosition: indexToRowColumn(a, oldEndIndex),
		newEndPosition: indexToRowColumn(b, newEndIndex)
	};
}

function getReplaceRange(a: string, b: string) {
	let diffs = diff(a, b);
	if (diffs.length === 1) {
		return {
			content: b,
			range: {
				start: 0,
				length: a.length
			}
		};
	}

	let insertions = 0;
	let deletions = 0;
	let neutrals = 0;

	for (let i = 0; i < diffs.length; i++) {
		let diff = diffs[i];
		if (diff[0] === 1) {
			insertions++;
		} else if (diff[0] === -1) {
			deletions++;
		} else if (diff[0] === 0) {
			neutrals++;
		}

		if (insertions > 1 || deletions > 1 || neutrals > 1) {
			return {
				content: b,
				range: {
					start: 0,
					length: a.length
				}
			};
		}
	}

	let startIndex = 0;
	let oldEndIndex = a.length;
	let newEndIndex = b.length;

	for (let i = 0; i < diffs.length; i++) {
		let diff = diffs[i];
		if (diff[0] === 0) {
			startIndex += diff[1].length;
		} else if (diff[0] === -1) {
			oldEndIndex = startIndex + diff[1].length;
			newEndIndex = startIndex;
		} else if (diff[0] === 1) {
			newEndIndex = startIndex + diff[1].length;

			// oldEndIndex = startIndex;
			break;
		}
	}

	return {
		content: b.substring(startIndex, newEndIndex),
		range: {
			start: startIndex,
			length: oldEndIndex - startIndex
		}
	};
}

export function getFunctionNodeName(
	node: ts.FunctionDeclaration | ts.MethodDeclaration,
	sourceFile?: ts.SourceFile
) {
	if (!sourceFile) {
		sourceFile = node.getSourceFile();
	}
	if (ts.isMethodDeclaration(node)) {
		let parentName =
			node.parent && ts.isClassDeclaration(node.parent) ? node.parent.name?.getText() : 'not_class';

		return sourceFile.fileName + ':' + parentName + ':' + node.name?.getText();
	}
	return sourceFile.fileName + ':' + node.name?.getText();
}

function canTypesBeCasted(a: string, b: string) {
	if (a === b) {
		return true;
	}
	if (
		(a.startsWith('float') && b.startsWith('int')) ||
		(a.startsWith('int') && b.startsWith('float'))
	) {
		let aSize = parseInt(a[a.length - 1]);
		let bSize = parseInt(b[b.length - 1]);
		if (aSize == bSize) {
			return true;
		}
	}
	return false;
}

export const USING_QUICK_CACHE = true;

export class ShadeupEnvironment {
	files: ShadeupFile[] = [];
	parser: Parser | null = null;
	tsEnv: TypescriptEnvironment | null = null;
	loads: Map<string, string[]> = new Map();
	libraries: Set<string> = new Set();

	assetMappings: Map<string, [string, string]> = new Map();

	tagGraph: TagGraph;

	validationDiagnostics: Map<string, ts.Diagnostic[]> = new Map();
	graphValidationDiagnostics: Map<string, ts.Diagnostic[]> = new Map();

	constructor() {}

	async init() {
		this.parser = await getShadeupParser();
		this.tsEnv = await makeTypescriptEnvironment(this);
		if (USING_QUICK_CACHE) {
			for (let k of Object.keys(quickCache)) {
				this.stdEmitCache.set(k, quickCache[k]);
			}
		}
	}

	emitLogs = true;

	setAssetMapping(assets: [string, [string, string]][]) {
		console.log('Set asset mapping', assets);
		this.assetMappings = new Map(assets);
	}

	print(...args: any[]) {
		if (this.emitLogs) {
			console.log(...args);
		}
	}

	reset() {
		this.tagGraph = new TagGraph();
		for (let f of this.files) {
			if (f.path == '/file.ts' || f.path.startsWith('/_std/')) continue;
			this.tsEnv.system.$fsMap.delete(f.path);
		}
		this.files = [];
		this.validationDiagnostics.clear();
		this.graphValidationDiagnostics.clear();
	}

	/**
	 * Wipes out the tagGraph and rebuilds all  and tags
	 */
	applyTags() {
		let checker = this.tsEnv?.env.languageService.getProgram().getTypeChecker();
		let files = this.tsEnv.env.languageService.getProgram().getSourceFiles();

		this.tagGraph = new TagGraph();
		for (let file of files) {
			ts.forEachChild(file, (node) => {
				if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
					let name = getFunctionNodeName(node);
					this.tagGraph.addNode(name, node);

					let tags = findShadeupTags(node);
					for (let tag of tags) {
						this.tagGraph.addTag(name, tag);
					}
				}

				if (ts.isClassDeclaration(node)) {
					ts.forEachChild(node, (child) => {
						if (ts.isMethodDeclaration(child)) {
							let name = getFunctionNodeName(child);
							this.tagGraph.addNode(name, child);

							let tags = findShadeupTags(child);
							for (let tag of tags) {
								this.tagGraph.addTag(name, tag);
							}
						}
					});
				}
			});
		}
		const visitNode = (node: ts.Node) => {
			if (ts.isCallExpression(node)) {
				let exprSmybol = checker.getSymbolAtLocation(node.expression);
				if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
					exprSmybol = checker.getAliasedSymbol(exprSmybol);
				}
				if (exprSmybol) {
					let funcDeclar = exprSmybol.getDeclarations()?.[0];

					if (
						funcDeclar &&
						(ts.isFunctionDeclaration(funcDeclar) || ts.isMethodDeclaration(funcDeclar))
					) {
						let referencedFunctionName = getFunctionNodeName(funcDeclar);
						let callingFunction = closest(
							node,
							(n) => ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)
						);
						if (
							callingFunction &&
							(ts.isFunctionDeclaration(callingFunction) || ts.isMethodDeclaration(callingFunction))
						) {
							let callingFunctionName = getFunctionNodeName(callingFunction);

							this.tagGraph.addEdge(referencedFunctionName, callingFunctionName);
						}
					}
				}
			}
			ts.forEachChild(node, visitNode);
		};
		for (let file of files) {
			ts.forEachChild(file, (node) => {
				if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
					ts.forEachChild(node, visitNode);
				}

				if (ts.isClassDeclaration(node)) {
					ts.forEachChild(node, (child) => {
						if (ts.isMethodDeclaration(child)) {
							ts.forEachChild(child, visitNode);
						}
					});
				}
			});
		}

		this.tagGraph.propagateTags();
	}

	stdEmitCache: Map<string, ts.EmitOutput> = new Map();

	async regenerate(filePath?: string[]) {
		if (!this.tsEnv) {
			throw new Error('Typescript environment not initialized');
		}
		let addedFiles = new Set<string>();
		this.graphValidationDiagnostics.clear();
		let now = performance.now();
		let outputs: ts.EmitOutput[] = [];

		this.applyTags();

		this.print('Tagged in ', performance.now() - now, 'ms');

		now = performance.now();

		let checker = this.tsEnv.env.languageService.getProgram().getTypeChecker();

		const addFile = (path: string) => {
			if (this.stdEmitCache.has(path)) {
				outputs.push(this.stdEmitCache.get(path)!);
				return;
			}

			if (addedFiles.has(path)) {
				return;
			}

			console.log('Adding file ', path);
			addedFiles.add(path);
			let sourceFile = this.files.find((f) => f.path === path);
			let shaders = this.renderShaders(path);
			if (sourceFile) {
				sourceFile.shaders = shaders;
			}

			let out = this.tsEnv?.env.languageService.getEmitOutput(path);

			if (out) {
				let sf = this.tsEnv.env.getSourceFile(path);
				if (sourceFile) {
					this.graphValidationDiagnostics.set(path, validateGraph(this, sourceFile, sf, checker));
					let outputCode = this.mixInShaders(sourceFile, out?.outputFiles[0].text!);

					out.outputFiles[0].text = outputCode;
				}
				if (sf) {
					out.outputFiles[0].text = this.mixInStructs(sf, out.outputFiles[0].text);
				}

				if (this.loads.has(path)) {
					let jsOut = `__shadeup_register_loads(${JSON.stringify(
						this.loads.get(path).map((p) => {
							return this.assetMappings.get(p) || p;
						})
					)});`;
					out.outputFiles[0].text = jsOut + out.outputFiles[0].text;
				}

				if (this.libraries.size > 0) {
					let jsOut = `__shadeup_register_libs(${JSON.stringify(Array.from(this.libraries))});`;
					out.outputFiles[0].text = jsOut + out.outputFiles[0].text;
				}

				if (
					path.startsWith('/_std/') ||
					path == '/file.ts' ||
					path == '/std_math.ts' ||
					path == '/static-math.ts' ||
					path == '/std___std_all.ts' ||
					path == '/std.ts'
				) {
					this.stdEmitCache.set(path, out);
				}
				outputs.push(out);
			}
		};

		const addDir = (path: string) => {
			let files = this.tsEnv?.system.readDirectory(path);
			if (files) {
				for (let f of files) {
					let dirExists = this.tsEnv?.system.directoryExists(path + f);

					if (dirExists) {
						addDir(path + f.replace(/^\//, '') + '/');
					} else {
						if (f.endsWith('.d.ts')) continue;
						let p = path + f.replace(/^\//, '');

						try {
							addFile(p);
						} catch (e) {
							console.error(e);
						}
					}
				}
			}
		};

		if (filePath) {
			await Promise.all(
				filePath.map(async (f) => {
					let sourceFile = this.tsEnv.env.getSourceFile(f);
					if (sourceFile) {
						let refs = this.tsEnv.env.languageService.getFileReferences(f);

						for (let dep of refs) {
							let shadeupFile = this.files.find((f) => f.path === dep.fileName);
							if (shadeupFile) {
								// Force a recompile of the file
								await this.writeFile(
									shadeupFile.path,
									shadeupFile.content,
									this.stdEmitCache.has(shadeupFile.path)
								);
								try {
									addFile(dep.fileName);
								} catch (e) {
									console.error(e);
								}
							}
						}

						try {
							addFile(f);
						} catch (e) {
							console.error(e);
						}
					}
				})
			);
		} else {
			addDir('/');
		}

		let s = outputs.map((o) => ({
			path: o.outputFiles[0].name,
			contents: o.outputFiles[0].text
		}));

		this.print('Regenerated in', performance.now() - now, 'ms');
		return s;
	}

	mixInShaders(file: ShadeupFile, code: string) {
		let finalPass = code;
		// this.print('Shaders', file.shaders);
		for (let pair of file.shaders) {
			let shader = pair.glsl;
			let params: string[] = [];
			let paramsTyped: string[] = [];
			for (let param of Object.keys(shader.locals)) {
				let u = shader.locals[param];

				params.push(`_ext_uniform_local_${param}: ${param}`);
				paramsTyped.push(`_ext_uniform_local_${param}: ${JSON.stringify(u)}`);
			}

			for (let param of Object.keys(shader.globals)) {
				let u = shader.globals[param];

				params.push(
					`_ext_uniform_global_${param}: globalVarGet("${cleanName(u.fileName)}", "${param}")`
				);
				paramsTyped.push(`_ext_uniform_global_${param}: ${JSON.stringify(u.structure)}`);
			}

			// finalPass = finalPass.replaceAll(
			// 	`window.shader_start_${shader.key}(`,
			// 	`__shadeup_make_shader_inst("${shader.key}", {${params.join(', ')}}, `
			// );

			finalPass =
				`__shadeup_gen_shader("${shader.key}", {
					webgl: {${paramsTyped.join(', ')}},
					webgpu: ${JSON.stringify({
						attributeInput: pair.wgsl.attributeInput,
						attributeOutput: pair.wgsl.attributeOutput,
						locals: pair.wgsl.locals,
						globals: pair.wgsl.globals
					})}
				}, {webgpu: \`${pair.wgsl.source}\`,webgl:\`${
					pair.glsl.source
				}\`, software: () => {}}, ${JSON.stringify(shader.sourceMapping)});\n\n` + finalPass;
		}

		if (file.path === '/main.ts') {
			this.print('Final pass', finalPass);
		}

		return finalPass;
	}

	mixInStructs(root: ts.SourceFile, code: string): string {
		let finalPass = code;
		let structs = [];

		walkNodes(root, (node) => {
			if (ts.isClassDeclaration(node)) {
				if (hasShadeupDocTag(node, 'struct')) {
					let structName = node.name?.getText() ?? 'Unknown';
					let struct = {
						name: structName,
						fields: []
					};
					for (let member of node.members) {
						if (ts.isPropertyDeclaration(member)) {
							let name = member.name.getText();
							let type = member.type?.getText() ?? 'any';
							struct.fields.push({
								name,
								type
							});
						}
					}
					structs.push(struct);
				}
			}
		});
		let sBlocks = [];
		for (let struct of structs) {
			sBlocks.push(
				`__shadeup_register_struct("${struct.name}", {${JSON.stringify(struct.fields)}});`
			);
		}
		// finalPass = finalPass.replace(`/**__SHADEUP_STRUCT_INJECTION_HOOK__*/`, sBlocks.join('\n\n'));

		return finalPass;
	}

	errors(files?: string[]) {
		if (!this.tsEnv) {
			throw new Error('Typescript environment not initialized');
		}
		let now = performance.now();
		let all = [];
		for (let f of this.files) {
			if (files) {
				if (!files.includes(f.path)) {
					continue;
				}
			}

			let errors = this.tsEnv.env.languageService.getSemanticDiagnostics(f.path);
			let syntacticErrors = this.tsEnv.env.languageService.getSyntacticDiagnostics(f.path);

			all.push(
				...[...errors, ...syntacticErrors]
					.filter((e) => {
						if (e.code == 2345) {
							// Argument of type '...' is not assignable to parameter of type '...'
							let parsed =
								/Argument of type '(.*)' is not assignable to parameter of type '(.*).*'/.exec(
									typeof e.messageText == 'string' ? e.messageText : e.messageText.messageText
								);
							if (parsed) {
								let [_, from, to] = parsed;

								if (canTypesBeCasted(from, to)) {
									return false;
								} else {
								}
							} else {
							}
						} else if (e.code == 2339) {
							let msgText =
								typeof e.messageText == 'string' ? e.messageText : e.messageText.messageText;
							if (msgText.startsWith("Property '__index' does not exist on type '")) {
								return false;
							}
						} else if (e.code == 2705) {
							let msgText =
								typeof e.messageText == 'string' ? e.messageText : e.messageText.messageText;
							if (
								msgText.startsWith(
									"An async function or method in ES5/ES3 requires the 'Promise' constructor."
								)
							) {
								return false;
							}
						}

						return true;
					})
					.map((e) => this.transformTSError(f, e))
			);

			let validationDiagnostics = this.validationDiagnostics.get(f.path) ?? [];
			all.push(...validationDiagnostics.map((e) => this.transformTSError(f, e)));

			let graphValidationDiagnostics = this.graphValidationDiagnostics.get(f.path) ?? [];
			all.push(...graphValidationDiagnostics.map((e) => this.transformTSError(f, e)));
		}
		this.print('Got errors in', performance.now() - now, 'ms');

		return all;
	}

	completions(path: string, pos: number) {
		if (!this.tsEnv) {
			throw new Error('Typescript environment not initialized');
		}
		let file = this.files.find((f) => f.path === path);
		if (!file) {
			throw new Error('File not found');
		}

		let source = file.transpiled;
		let rowCol = indexToRowColumn(source, pos);
		let backTransform = reverseLookupIndexMappingCursor(file.mapping, pos);

		let fp = this.tsEnv.env.getSourceFile(path);
		console.log(fp.getFullText());
		console.log(
			fp.getFullText().substring(0, backTransform) + '^' + fp.getFullText().substring(backTransform)
		);

		let completions = this.tsEnv.env.languageService.getCompletionsAtPosition(
			path,
			backTransform,
			{
				includeExternalModuleExports: true,
				includeInsertTextCompletions: true,
				includeCompletionsForModuleExports: true,
				includeCompletionsWithInsertText: true,
				includeInlayVariableTypeHints: true,
				includeCompletionsWithClassMemberSnippets: true,
				includeCompletionsWithSnippetText: true,
				includeAutomaticOptionalChainCompletions: true,
				includeCompletionsForImportStatements: true,
				useLabelDetailsInCompletionEntries: true,
				includeInlayPropertyDeclarationTypeHints: true
			},
			{}
		);

		if (!completions) {
			return [];
		}
		let entries = [];
		let maxCompletions = 100;
		for (let c of completions.entries) {
			if (entries.length >= maxCompletions) {
				break;
			}
			let range = null;
			if (c.replacementSpan) {
				let startOffset = c.replacementSpan.start;
				let endOffset = c.replacementSpan.start + c.replacementSpan.length;

				let offsetRangeReal = lookupIndexMappingRange(file.mapping, startOffset, endOffset);

				let start = indexToRowColumn(file.content, offsetRangeReal.start);
				let end = indexToRowColumn(file.content, offsetRangeReal.end);

				range = {
					startLineNumber: start.row + 1,
					startColumn: start.column + 1,
					endLineNumber: end.row + 1,
					endColumn: end.column + 1
				};
			}

			entries.push({
				range,
				completion: c,
				details: this.tsEnv.env.languageService.getCompletionEntryDetails(
					path,
					backTransform,
					c.name,
					{},
					c.source,
					{},
					c.data
				)
			});
		}
		console.log(entries);

		return entries;
	}

	classifications(path: string): ClassificationRanges {
		if (!this.tsEnv) {
			throw new Error('Typescript environment not initialized');
		}
		let file = this.files.find((f) => f.path === path);
		if (!file) {
			throw new Error('File not found');
		}

		let fp = this.tsEnv.env.getSourceFile(path);
		let checker = this.tsEnv.env.languageService.getProgram().getTypeChecker();
		let ranges = [];

		for (let symbolRange of file.parsedFlatSymbolMap) {
			let offsetRangeReal = reverseLookupIndexMappingRange(
				file.mapping,
				symbolRange.startIndex,
				symbolRange.endIndex
			);
			if (
				offsetRangeReal.start != 0 &&
				offsetRangeReal.end < file.transpiled.length - 1 &&
				isFinite(offsetRangeReal.start) &&
				isFinite(offsetRangeReal.end)
			) {
				let info = this.tsEnv.env.languageService.getQuickInfoAtPosition(
					path,
					offsetRangeReal.start
				);

				if (info) {
					let backRange = lookupIndexMappingRange(
						file.mapping,
						info.textSpan.start,
						info.textSpan.start + info.textSpan.length
					);

					let kind = info.kind;
					const funcMatch = /^\(alias\)\s+[^(]+\(/i;
					if (kind == 'alias') {
						let fullStr = '';
						let isNew = false;
						for (let p of info.displayParts) {
							fullStr += p.text;
							if (p.kind == 'keyword' && (p.text == 'class' || p.text == 'new')) {
								kind = ts.ScriptElementKind.classElement;

								if (p.text == 'new') {
									isNew = true;
								}
							}
							if (p.kind == 'keyword' && p.text == 'namespace') {
								kind = ts.ScriptElementKind.classElement;
							}
							if (p.kind == 'keyword' && p.text == 'type') {
								kind = ts.ScriptElementKind.classElement;
							}
						}

						if (!isNew && funcMatch.test(fullStr)) {
							kind = ts.ScriptElementKind.functionElement;
						}
					}

					ranges.push([backRange.start, backRange.end, kind]);
				}
			}
		}

		return {
			ranges: ranges
		};
	}

	hover(path: string, pos: number) {
		if (!this.tsEnv) {
			throw new Error('Typescript environment not initialized');
		}
		let file = this.files.find((f) => f.path === path);
		if (!file) {
			throw new Error('File not found');
		}

		let source = file.transpiled;
		let rowCol = indexToRowColumn(source, pos);
		let backTransform = reverseLookupIndexMappingCursor(file.mapping, pos);

		let fp = this.tsEnv.env.getSourceFile(path);

		let hovers = this.tsEnv.env.languageService.getQuickInfoAtPosition(path, backTransform);

		if (!hovers) {
			return null;
		}

		let startOffset = hovers.textSpan.start;
		let endOffset = hovers.textSpan.start + hovers.textSpan.length;

		let offsetRangeReal = lookupIndexMappingRange(file.mapping, startOffset, endOffset);

		let start = indexToRowColumn(file.content, offsetRangeReal.start);
		let end = indexToRowColumn(file.content, offsetRangeReal.end);

		(hovers as any).range = {
			startLineNumber: start.row + 1,
			startColumn: start.column + 1,
			endLineNumber: end.row + 1,
			endColumn: end.column + 1
		};

		return hovers;
	}

	getFileErrorData(f: ts.SourceFile, estart: number, eend: number) {
		let file = this.files.find((f2) => f2.path === (f as any).path);

		if (!file) {
			// Use native file

			return {
				file: f,
				source: f.getFullText(),
				start: estart,
				end: eend
			};
		}
		let start = indexToRowColumn(file.transpiled, estart ?? 0);

		let realStart = file.map?.originalPositionFor({ column: start.column, line: start.row + 1 });

		let end = indexToRowColumn(file.transpiled, eend);
		let realEnd = file.map?.originalPositionFor({ column: end.column, line: end.row + 1 });

		let startIndex =
			realStart?.line && realStart?.column
				? rowColumnToIndex(file.content, realStart?.line, realStart?.column)
				: 0;
		let endIndex =
			realEnd?.line && realEnd?.column
				? rowColumnToIndex(file.content, realEnd?.line, realEnd?.column)
				: 0;

		startIndex = lookupIndexMapping(file.mapping!, estart ?? 0);
		endIndex = lookupIndexMapping(file.mapping!, eend);
		let o = lookupIndexMappingRange(file.mapping!, estart ?? 0, eend);

		startIndex = o.start;
		endIndex = o.end;

		return {
			file: file,
			source: file.content,
			start: startIndex,
			end: endIndex
		};
	}

	transformTSError(file: ShadeupFile, error: ts.Diagnostic) {
		if (error.file === undefined) {
			return {
				error: error,
				file: file.path,
				message: error.messageText.toString()
			};
		}

		const printReal = true;

		let { source, start, end } = this.getFileErrorData(
			error.file,
			error.start ?? 0,
			(error.start ?? 0) + (error.length ?? 0)
		);
		if (printReal) {
			start = error.start ?? 0;
			end = (error.start ?? 0) + (error.length ?? 0);
		}

		let categorymapping = {
			[ts.DiagnosticCategory.Error]: ReportKind.Error,
			[ts.DiagnosticCategory.Warning]: ReportKind.Warning,
			[ts.DiagnosticCategory.Message]: ReportKind.Advice,
			[ts.DiagnosticCategory.Suggestion]: ReportKind.Advice
		};

		let r = Report.build(categorymapping[error.category], file.path, start).with_code(error.code);
		if (typeof error.messageText === 'string') {
			r = r.with_message(error.messageText);
		}

		let sources = [];
		function addMessage(msgObj: ts.DiagnosticMessageChain | string) {
			if (typeof msgObj === 'string') {
				r = r.with_label(
					Label.from([file.path, Range.new(start, Math.max(start, end))]).with_message(msgObj)
				);
			} else {
				r = r.with_label(
					Label.from([file.path, Range.new(start, Math.max(start, end))]).with_message(
						nicerError(msgObj)
					)
				);
				for (let d of msgObj.next ?? []) {
					addMessage(d);
				}
			}
		}

		if (typeof error.messageText === 'string') {
			addMessage(nicerError(error as ts.DiagnosticMessageChain));
		} else {
			addMessage(error.messageText);
		}

		for (let d of error.relatedInformation ?? []) {
			let relatedRange = printReal
				? { start: d.start ?? 0, end: (d.start ?? 0) + (d.length ?? 0) }
				: lookupIndexMappingRange(file.mapping!, d.start ?? 0, (d.start ?? 0) + (d.length ?? 0));
			if (typeof d.messageText === 'string') {
				r.with_label(
					Label.from([
						file.path,
						Range.new(relatedRange.start, Math.max(relatedRange.start, relatedRange.end))
					]).with_message(nicerError(d))
				);
			} else {
				for (let d2 of d.messageText.next ?? []) {
					addMessage(d2);
				}
			}
		}

		let rf = r.finish();

		let writer = mkStringWriter();
		try {
			rf.printTo(
				[file.path, Source.from(printReal ? error.file.text : source)],
				writer as unknown as Write
			);
		} catch (e) {
			this.print(e);
		}
		let ansi_up = new AnsiUp();
		let msg = ansi_up.ansi_to_html(writer.unwrap());

		return {
			error: error,
			file: file.path,
			message: msg
		};
	}

	async translateSource(file: ShadeupFile, range: DiffRange | null = null) {
		if (!this.parser) {
			throw new Error('Parser not initialized');
		}
		let now = performance.now();
		if (range) file.oldTree?.edit(range);

		let f = this.parser.parse(file.content, range ? file.oldTree ?? undefined : undefined);
		if (file.oldTree) {
			let nowTree = performance.now();
			let editedRange = file.oldTree.getChangedRanges(f);
			this.print('Got edited range in', performance.now() - nowTree, 'ms');
			if (editedRange) {
				// this.print('Edited range', JSON.stringify(editedRange));
			}
		}

		this.print('Parsed in', performance.now() - now, 'ms');
		file.oldTree = f;

		file.parsedFlatSymbolMap = this.extractFlatSymbolMap(f.rootNode);

		now = performance.now();
		try {
			let ctx = new AstContext('file:///' + file.path);
			prePass(ctx, f.rootNode);
			let compiled = compile(ctx, f.rootNode);

			file.parseDiagnostics = ctx.diagnostics.map((d) => ({
				message: d.message,
				startIndex: d.node.startIndex,
				endIndex: d.node.endIndex
			}));

			this.print('Compiled in', performance.now() - now, 'ms');
			now = performance.now();
			let ss = {
				str: '',
				indexMapping: []
			} as SourceString;

			compiled.toString(ss);
			this.print('Rendered with source map in ', performance.now() - now, 'ms');
			this.print('---- Translated ----');

			file.transpiled = ss.str;
			console.log('Transpiled output', ss.str);

			// (SourceMapConsumer as any).initialize({
			// 	'lib/mappings.wasm': sourceMappingURL
			// });
			// if (file.map) {
			// 	file.map.destroy();
			// }
			now = performance.now();
			// file.map = await new SourceMapConsumer(c.map.toJSON());
			file.mapping = ss.indexMapping;
			this.print('Created source map consumer in', performance.now() - now, 'ms');
		} catch (e) {
			console.error('Error while compiling', e);
			this.print(f.rootNode.toString());
		}
	}

	extractFlatSymbolMap(rootNode: Parser.SyntaxNode): SymbolRange[] {
		let symbols: SymbolRange[] = [];
		let stack: Parser.SyntaxNode[] = [rootNode];
		while (stack.length > 0) {
			let node = stack.pop()!;
			if (
				node.type === 'identifier' ||
				node.type === 'property_identifier' ||
				node.type === 'type_identifier'
			) {
				symbols.push({
					startIndex: node.startIndex,
					endIndex: node.endIndex
				});
			}
			for (let c of node.children) {
				stack.push(c);
			}
		}
		return symbols;
	}

	async writeFile(path: string, content: string, ignoreValidate = false) {
		if (!ignoreValidate) console.log('Writing', path);
		let now = performance.now();
		let file = this.files.find((f) => f.path === path);
		let oldContent = '';
		if (!file) {
			this.files.push({
				path,
				content,
				transpiled: '',
				shaders: [],
				map: null,
				oldTree: null,
				mapping: [],
				parseDiagnostics: [],
				parsedFlatSymbolMap: []
			});

			file = this.files[this.files.length - 1];
		} else {
			oldContent = file.content;
			file.content = content;
		}

		let nowDiff = performance.now();
		// let diffs = diff(oldContent, content);
		// If there's one diff, find its range
		let r = getDiffRange(oldContent, content);
		this.print(
			'Source code diff took',
			performance.now() - nowDiff,
			'ms',
			'with',
			countLines(content),
			'lines'
		);

		let getNow = performance.now();
		this.print('Get source file took', performance.now() - getNow, 'ms');
		await this.translateSource(file, r);

		let sf = this.tsEnv?.env.getSourceFile(path);
		if (sf) {
			// Diff
			nowDiff = performance.now();
			let r = getReplaceRange(sf.text, file.transpiled);

			this.print(
				'TypeScript code diff took',
				performance.now() - nowDiff,
				'ms',
				'with',
				countLines(sf.text),
				'lines'
			);
			let updateNow = performance.now();
			this.print('Replacing', r.range, 'with', r.content.length, 'chars');
			this.tsEnv?.env.updateFile(path, r.content, r.range);

			this.print('Update took', performance.now() - updateNow, 'ms');
			let finalText = this.tsEnv.env.getSourceFile(path)?.text;

			if (finalText !== file.transpiled) {
				console.error('Final text does not match transpiled text');
			}
			// this.print('File name: ', path, finalText);
		} else {
			this.tsEnv?.env.createFile(path, file.transpiled);
		}
		this.print('---- Took', performance.now() - now, 'ms ----');
		this.print('');

		if (!ignoreValidate) {
			let sourceFile = this.tsEnv?.env.getSourceFile(path);
			if (sourceFile) {
				let program = this.tsEnv?.env.languageService.getProgram();
				let checker = program?.getTypeChecker();
				if (checker) {
					this.validationDiagnostics.set(path, validate(file, sourceFile, checker));
				}
			}
		}

		// let shaders = this.renderShaders(path);

		// file.shaders = shaders;
	}

	async writeFileTypescript(path: string, content: string) {
		this.print('Writing', path);
		let now = performance.now();

		let sf = this.tsEnv?.env.getSourceFile(path);
		if (sf) {
			// Diff
			let nowDiff = performance.now();
			let r = getReplaceRange(sf.text, content);

			this.print(sf.text.substring(r.range.start, r.range.start + r.range.length), r.content);

			this.print(
				'TypeScript code diff took',
				performance.now() - nowDiff,
				'ms',
				'with',
				countLines(sf.text),
				'lines'
			);
			let updateNow = performance.now();
			this.print('Replacing', r.range, 'with', r.content.length, 'chars');
			this.tsEnv?.env.updateFile(path, r.content, r.range);

			this.print('Update took', performance.now() - updateNow, 'ms');
			let finalText = this.tsEnv.env.getSourceFile(path)?.text;
			this.print(finalText);
			if (finalText !== content) {
				console.error('Final text does not match input text');
			}
		} else {
			this.tsEnv?.env.createFile(path, content);
		}
		this.print('---- Took', performance.now() - now, 'ms ----');
		this.print('');
	}

	addDiagnostic(path: string, diagnostic: ts.Diagnostic) {
		if (!this.validationDiagnostics.has(path)) {
			this.validationDiagnostics.set(path, []);
		}

		this.validationDiagnostics.get(path)?.push(diagnostic);
	}

	printNodeLocation(n: ts.Node) {
		let sf = n.getSourceFile();
		let file = this.files.find((f) => f.path === sf.fileName);
		if (!file) {
			return 'internal';
		} else {
			let mapping = lookupIndexMappingRange(file.mapping, n.getStart(), n.getEnd());
			let loc = indexToRowColumn(file.content, mapping.start);
			return `${sf.fileName}:${loc.row + 1}:${loc.column + 1}`;
		}
	}

	renderShaders(path: string): { glsl: GLSLShader; wgsl: WGSLShader }[] {
		let shaders: { glsl: GLSLShader; wgsl: WGSLShader }[] = [];
		let sfNew = this.tsEnv?.env.getSourceFile(path);
		let program = this.tsEnv?.env.languageService.getProgram();
		if (!program) {
			return [];
		}
		let checker = program?.getTypeChecker();
		if (!checker) {
			return [];
		}
		for (let sourceFile of program?.getSourceFiles() ?? []) {
			if (sourceFile.fileName === path) {
				walkNodes(sourceFile, (node) => {
					if (ts.isCallExpression(node) && node.expression.getText() == 'makeShader') {
						let lhsType = checker?.getTypeAtLocation(node.getChildAt(0));
						let sig = lhsType?.getCallSignatures();
						if (sig && sig[0] && sig[0].getDeclaration()) {
							let declaration = sig[0].getDeclaration();

							if (hasShadeupDocTag(declaration, 'shader')) {
								let isComputeShader = false;
								let computeShaderSize: [number, number, number] = [0, 0, 0];
								let parentNode = node.parent;

								if (
									parentNode &&
									ts.isAsExpression(parentNode) &&
									parentNode.parent &&
									ts.isCallExpression(parentNode.parent)
								) {
									if (parentNode.parent.arguments.length === 2) {
										isComputeShader = true;
										let lastChildArg = parentNode.parent.arguments[1];
										if (ts.isArrayLiteralExpression(lastChildArg)) {
											let elements = lastChildArg.elements;
											if (elements.length === 3) {
												computeShaderSize = [
													parseInt(elements[0].getText().replace(/[^\d]/g, '')),
													parseInt(elements[1].getText().replace(/[^\d]/g, '')),
													parseInt(elements[2].getText().replace(/[^\d]/g, ''))
												];
											}
										}
									}
								}
								let n = checker?.getTypeAtLocation(declaration);

								if (node.arguments.length === 2) {
									if (ts.isStringLiteral(node.arguments[0])) {
										let key = node.arguments[0].text;
										try {
											let glslShader = addGLSLShader(
												key,
												node.arguments[1],
												checker,
												this,
												isComputeShader,
												computeShaderSize
											);
											let wgslShader = addWGSLShader(
												key,
												node.arguments[1],
												checker,
												this,
												isComputeShader,
												computeShaderSize
											);

											if (glslShader && wgslShader) {
												shaders.push({
													glsl: glslShader,
													wgsl: wgslShader
												});
											}
										} catch (e) {
											console.error(e);
											if (e instanceof GLSLCompilationError) {
												this.addDiagnostic(path, {
													file: e.node.getSourceFile(),
													code: 0,
													messageText:
														e.message +
														' (this is being used in the shader defined at ' +
														this.printNodeLocation(node) +
														')',
													category: ts.DiagnosticCategory.Error,
													start: e.node.getStart(),
													length: 2
												} as ts.Diagnostic);

												this.addDiagnostic(path, {
													file: node.getSourceFile(),
													code: 0,
													messageText:
														'this shader has an error in its code (' +
														e.message +
														' at ' +
														this.printNodeLocation(e.node) +
														')',
													category: ts.DiagnosticCategory.Error,
													start: node.getStart(),
													length: node.getEnd() - node.getStart()
												} as ts.Diagnostic);
											}
										}
									}
								}
							}
						}
					}
				});
			}
		}

		return shaders;
	}

	patchFile(path: string, content: string, start: number, length: number) {}
}

function walkNodes(node: ts.Node, cb: (node: ts.Node) => void) {
	cb(node);
	node.forEachChild((n) => walkNodes(n, cb));
}

export function hasShadeupDocTag(node: ts.Node, tagName: string) {
	return ts
		.getJSDocTags(node)
		.some((tag) => tag.tagName.text === 'shadeup' && tag.comment === '=' + tagName);
}
export function hasWorkgroupDocTag(node: ts.Node) {
	return ts.getJSDocTags(node).some((tag) => tag.tagName.text === 'workgroup');
}
