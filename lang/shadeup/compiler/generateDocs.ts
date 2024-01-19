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

export type DocFunction = {
	name: string;
	overloads: {
		description: string;
		parameters: {
			name: string;
			description: string;
			type: string;
		}[];
		typeParameters: string[];
		returnType: string;
	}[];
};

export type DocProp = {
	name: string;
	description: string;
	type: string;
	default?: string;
};

export type DocModule = {
	name: string;
	description: string;
	functions: DocFunction[];
};

export type DocClass = {
	name: string;
	description: string;
	functions: DocFunction[];
	props: DocProp[];
};

export type Doc = {
	modules: DocModule[];
	classes: DocClass[];
	functions: DocFunction[];
	constants: DocProp[];
};

export async function generateDocs() {
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

	await Promise.all(writes);

	let docs: Doc = {
		modules: [],
		functions: [],
		classes: [],
		constants: [
			{
				name: 'env',
				description:
					'Global env context struct. This updates every frame and includes input data, time data, and more.',
				type: 'FrameContext'
			}
		]
	};

	const IGNORE_LIST = [
		'swizzle',
		'add',
		'sub',
		'div',
		'shader_start_shd_',
		'shadeupMakeTextureFromUrl',
		'rshift',
		'lshift',
		'refract2',
		'refract3',
		'refract4',
		'RegExp',
		'RangeError',
		'ReferenceError',
		'Number',
		'neq',
		'Object',
		'or',
		'and',
		'gte',
		'lte',
		'negate',
		'mul',
		'mod289_1',
		'mod289_2',
		'mod289_3',
		'mod289_4',
		'matrixMul2x2float2',
		'matrixMul3x3float3',
		'matrixMul4x4float4',
		'matrixMulfloat22x2',
		'matrixMulfloat33x3',
		'matrixMulfloat44x4',
		'matrixTransposefloat2x2',
		'matrixTransposefloat3x3',
		'matrixTransposefloat4x4',
		'matrixMul',
		'matrixInversefloat4x4',
		'matrixInversefloat3x3',
		'matrixInversefloat2x2',
		'makeVector',
		'String',
		'SyntaxError',
		'TypeError',
		'testDocComment',
		'bitand',
		'bitnot',
		'bitor',
		'bitxor',
		'Boolean',
		'cCall',
		'componentOpSingularFloat',
		'componentOpSingular',
		'componentOpMatch',

		'componentOp',
		'componentMathSingular',
		'componentMath',
		'componentReduce',
		'drawAlt2',
		'drawFullscreen',
		'cross2',
		'cross3',
		'dot2',
		'dot3',
		'dot4',
		'Array',
		'lt',
		'gt',
		'applyMatrix3x3Methods',
		'applyMatrix2x2Methods',
		'applyMatrix4x4Methods',
		'makeShader',
		'lerp1',
		'lerp2',
		'lerp3'
	];

	let checker: ts.TypeChecker = env.tsEnv?.env.languageService
		.getProgram()
		?.getTypeChecker() as any;

	let allFiles = env.tsEnv?.fsMap.keys();
	if (allFiles && checker) {
		for (let f of allFiles) {
			let ff = env.tsEnv?.env.getSourceFile(f);
			if (!ff) continue;

			function addFunc(node: ts.Node, list: DocFunction[]): DocFunction | undefined {
				if (
					ts.isFunctionDeclaration(node) ||
					ts.isVariableStatement(node) ||
					ts.isMethodDeclaration(node)
				) {
					if (ts.isVariableStatement(node)) {
						node = node.declarationList.declarations[0];
					}
					let signatures = checker.getSignaturesOfType(
						checker.getTypeAtLocation(node),
						ts.SignatureKind.Call
					);
					if (IGNORE_LIST.includes(node.name?.getText())) return;
					let funcExists = list.find((f) => f.name === node.name?.getText());
					if (!funcExists) {
						if (!node.name?.getText()) return;
						let funcDoc = {
							name: node.name?.getText() ?? '',
							overloads: signatures.map((sig) => {
								let sigSymbol = checker.getSymbolAtLocation(sig.declaration!);

								let params = sig.getParameters().map((p) => {
									let decl = p.getDeclarations()![0];
									let symbol = checker.getSymbolAtLocation(decl);
									if (!symbol) {
										return {
											name: p.name,
											description: '',
											type: checker.typeToString(checker.getTypeOfSymbolAtLocation(p, decl))
										};
									}
									let type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol!, decl));
									return {
										name: p.name,
										description: ts.displayPartsToString(p.getDocumentationComment(checker)),
										type
									};
								});
								let returnType = checker.typeToString(sig.getReturnType());
								return {
									typeParameters: sig.typeParameters?.map((t) => checker.typeToString(t)) ?? [],
									description: ts.displayPartsToString(sig.getDocumentationComment(checker)),
									parameters: params,
									returnType
								};
							})
						} as DocFunction;
						if (funcDoc.overloads.length == 12) {
							let isMatch = true;
							for (let ov of funcDoc.overloads) {
								if (ov.parameters.length != 1) {
									isMatch = false;
									break;
								}

								if (ov.parameters[0].type != ov.returnType) {
									isMatch = false;
									break;
								}

								if (
									![
										'float',
										'float2',
										'float3',
										'float4',
										'int',
										'int2',
										'int3',
										'int4',
										'uint',
										'uint2',
										'uint3',
										'uint4'
									].includes(ov.parameters[0].type)
								) {
									isMatch = false;
									break;
								}
							}

							if (isMatch) {
								funcDoc.overloads = [
									{
										description: funcDoc.overloads[0].description,
										parameters: [
											{
												name: 'a',
												type: 'vec | scalar',
												description: ''
											}
										],
										typeParameters: funcDoc.overloads[0].typeParameters,
										returnType: 'vec | scalar'
									}
								];
							}
						}
						return funcDoc;
					}
				}
			}

			function recursive(node: ts.Node) {
				if (!isNodeExported(node)) return;

				if (
					ts.isFunctionDeclaration(node) ||
					ts.isVariableStatement(node) ||
					ts.isMethodDeclaration(node)
				) {
					if (ts.isVariableStatement(node)) {
						let decl = node.declarationList.declarations[0];
						if (['PI', 'env'].includes(decl.name?.getText() ?? '')) {
							docs.constants.push({
								name: decl.name?.getText() ?? '',
								description: ts.displayPartsToString(
									checker.getSymbolAtLocation(decl.name!)?.getDocumentationComment(checker)
								),
								type: checker.typeToString(
									checker.getTypeOfSymbolAtLocation(checker.getSymbolAtLocation(decl.name!)!, decl)
								)
							});
						}
					}
					let f = addFunc(node, docs.functions);
					if (f && f.overloads.length > 0) docs.functions.push(f);
				} else if (ts.isClassDeclaration(node) || ts.isModuleDeclaration(node)) {
					let name = node.name?.getText();
					if (!name) return;
					if (['global', 'Intl'].includes(name)) return;

					let symbol = checker.getSymbolAtLocation(node.name!);
					if (!symbol) return;
					let isModule = true;
					if (symbol.members) {
						symbol.members.forEach((m) => {
							let decl = m.valueDeclaration;
							if (decl && ts.isPropertyDeclaration(decl)) {
								isModule = false;
							}
						});
					}

					if (isModule) {
						let mod = docs.modules.find((m) => m.name === name);
						if (!mod) {
							let funcs: DocFunction[] = [];
							function visitModuleSub(n: ts.Node) {
								if (
									ts.isFunctionDeclaration(n) ||
									ts.isVariableStatement(n) ||
									ts.isMethodDeclaration(n)
								) {
									let f = addFunc(n, funcs);
									if (f) funcs.push(f);
								} else {
									n.forEachChild((n) => {
										visitModuleSub(n);
									});
								}
							}
							node.forEachChild((n) => {
								visitModuleSub(n);
							});
							mod = {
								name: name,
								description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
								functions: funcs
							};
							docs.modules.push(mod);
						}
						node.forEachChild((node) => {
							recursive(node);
						});
					} else {
						if (name == 'buffer_internal') name = 'buffer';
						if (name == 'texture2d_internal_empty') name = 'texture2d';
						if (name == 'texture3d_internal_empty') name = 'texture3d';
						if (name == 'atomic_internal') name = 'atomic';
						let mod = docs.classes.find((m) => m.name === name);
						if (!mod) {
							let funcs: DocFunction[] = [];
							let props: DocProp[] = [];
							function visitModuleSub(n: ts.Node) {
								if (
									ts.isFunctionDeclaration(n) ||
									ts.isVariableStatement(n) ||
									ts.isMethodDeclaration(n)
								) {
									let f = addFunc(n, funcs);
									if (f) funcs.push(f);
								} else if (ts.isPropertyDeclaration(n)) {
									let name = n.name.getText();
									let symbol = checker.getSymbolAtLocation(n.name);
									if (!symbol) return;
									let type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol!, n));
									props.push({
										name,
										description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
										type,
										default: n.initializer ? n.initializer.getText() : undefined
									});
								} else {
									n.forEachChild((n) => {
										visitModuleSub(n);
									});
								}
							}
							node.forEachChild((n) => {
								visitModuleSub(n);
							});
							mod = {
								name: name,
								description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
								functions: funcs,
								props: props
							};
							docs.classes.push(mod);
						}
						node.forEachChild((node) => {
							recursive(node);
						});
					}
				} else {
					node.forEachChild((node) => {
						recursive(node);
					});
				}
			}

			ff.forEachChild((node) => {
				recursive(node);
			});
		}
	}
	// env.emitLogs = true;
	console.log('Generated docs in ', performance.now() - start, 'ms');
	console.log(docs);

	return docs;
}

function isNodeExported(node: ts.Node): boolean {
	return (
		(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
		(!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
	);
}
