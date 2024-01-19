import ts from 'typescript';
import { getFunctionNodeName, ShadeupEnvironment } from '../environment/ShadeupEnvironment';
import { makeVectors, simpleFunctions, singleFunctions } from '../std/static-math-db';
import { cleanName, closest } from './util';
import { isInRoot, isInShader, translateType } from './wgsl';

const simpleFuncMap = new Map<string, any>(simpleFunctions as any);
const singleFuncMap = new Map(singleFunctions as any);
const makeVectorsMap = new Map(makeVectors as any);

function getTypeFallback(checker: ts.TypeChecker, t: ts.Type) {
	let n = (t.aliasSymbol || t.getSymbol())?.escapedName;
	if (!n && (t as any).intrinsicName) n = (t as any).intrinsicName;

	if (typeof n !== 'string') {
		let props = t.getApparentProperties();
		if (props.length > 0) {
			for (let p of props) {
				if (p.escapedName.toString() === '_opaque_int') return 'int';
				if (p.escapedName.toString() === '_opaque_float') return 'float';
				if (p.escapedName.toString() === '_opaque_uint') return 'uint';
			}
		}

		let btype = t.getBaseTypes();
		if (btype && btype.length > 0) {
			for (let b of btype) {
				let tn = getTypeFallback(checker, b);
				if (tn) return tn;
			}

			return null;
		}
	} else {
		return n;
	}
}
function isNumericType(checker: ts.TypeChecker, type: ts.Type) {
	let typeFall = getTypeFallback(checker, type);
	return (
		type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.NumberLiteral) ||
		typeFall == 'int' ||
		typeFall == 'float' ||
		typeFall == 'uint'
	);
}

function getVectorLen(checker: ts.TypeChecker, type: ts.Type) {
	let typeFall = getTypeFallback(checker, type);
	if (
		type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.NumberLiteral) ||
		typeFall == 'int' ||
		typeFall == 'float' ||
		typeFall == 'uint'
	) {
		return 1;
	} else if (typeFall == 'int2' || typeFall == 'float2' || typeFall == 'uint2') {
		return 2;
	} else if (typeFall == 'int3' || typeFall == 'float3' || typeFall == 'uint3') {
		return 3;
	} else if (typeFall == 'int4' || typeFall == 'float4' || typeFall == 'uint4') {
		return 4;
	}
	return 0;
}

function isArrayType(type: ts.Type, checker: ts.TypeChecker): boolean {
	return (checker as any).isTupleType(type) || (checker as any).isArrayType(type);
}

/**
 * Find and force all integer math to result in integers (i.e. 1 / 2 = 0)
 */
export const updateIntegerMixing: (
	getChecker: () => [ts.TypeChecker, ShadeupEnvironment, Map<string, string[]>]
) => ts.TransformerFactory<ts.SourceFile> = (getChecker) => (context) => {
	let [checker, env, loads] = getChecker();
	loads.clear();
	env.libraries.clear();

	return (rootNode) => {
		const { factory } = context;

		function visit(node) {
			if (!node) {
				return node;
			}
			if (ts.isCallExpression(node)) {
				let sig = checker.getResolvedSignature(node);
				let returnType = checker.getReturnTypeOfSignature(sig);
				let symbol = returnType.aliasSymbol || returnType.getSymbol();
				let expressionText = node.expression.getText();

				let ops = {
					gte: ts.SyntaxKind.GreaterThanEqualsToken,
					lte: ts.SyntaxKind.LessThanEqualsToken,
					gt: ts.SyntaxKind.GreaterThanToken,
					lt: ts.SyntaxKind.LessThanToken,
					eq: ts.SyntaxKind.EqualsEqualsToken,
					neq: ts.SyntaxKind.ExclamationEqualsToken,
					and: ts.SyntaxKind.AmpersandAmpersandToken,
					or: ts.SyntaxKind.BarBarToken
				};

				if (expressionText == 'physics.engine2d') {
					env.libraries.add('rapier2d');
				}

				if (expressionText == 'physics.engine3d') {
					env.libraries.add('rapier3d');
				}

				if (expressionText == 'load') {
					if (!loads.has(rootNode.fileName)) {
						loads.set(rootNode.fileName, []);
					}

					if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
						let realId = env.assetMappings.get(node.arguments[0].text);
						loads.get(rootNode.fileName).push(node.arguments[0].text);

						if (realId)
							return factory.createCallExpression(factory.createIdentifier('load'), undefined, [
								factory.createStringLiteral(realId[0])
							]);
					}

					return node;
				}

				if (expressionText.endsWith('__index')) {
					let innerExpr = node.expression;
					if (ts.isPropertyAccessExpression(innerExpr)) {
						let left = innerExpr.expression;
						let leftType = checker.getTypeAtLocation(left);
						let leftStr = checker.typeToString(leftType);
						if (isArrayType(leftType, checker)) {
							return factory.createElementAccessExpression(visit(left), visit(node.arguments[0]));
						}

						if (leftStr == 'buffer<float>') {
							return factory.createElementAccessExpression(
								factory.createPropertyAccessExpression(visit(left), 'floatArray'),
								visit(node.arguments[0])
							);
						} else if (leftStr == 'buffer<int>') {
							return factory.createElementAccessExpression(
								factory.createPropertyAccessExpression(visit(left), 'intArray'),
								visit(node.arguments[0])
							);
						} else if (leftStr == 'buffer<uint>') {
							return factory.createElementAccessExpression(
								factory.createPropertyAccessExpression(visit(left), 'uintArray'),
								visit(node.arguments[0])
							);
						} else if (!leftType.getProperty('__index')) {
							console.log('Optim no __index', leftStr, leftType);
							return factory.createElementAccessExpression(visit(left), visit(node.arguments[0]));
						}
					}
				}

				if (expressionText.startsWith('__.') && ops[expressionText.replace('__.', '')]) {
					if (node.arguments.length != 2) {
						return visit(node.arguments[0]);
					} else {
						let left = node.arguments[0];
						let right = node.arguments[1];
						let leftLen = getVectorLen(checker, checker.getTypeAtLocation(left));
						let rightLen = getVectorLen(checker, checker.getTypeAtLocation(right));
						if (leftLen == 1 && rightLen == 1) {
							return factory.createBinaryExpression(
								visit(node.arguments[0]),
								ops[expressionText.replace('__.', '')],
								visit(node.arguments[1])
							);
						}
					}
				}
				if (simpleFuncMap.has(expressionText.replace('__.', ''))) {
					let left = node.arguments[0];
					let right = node.arguments[1];
					let leftLen = getVectorLen(checker, checker.getTypeAtLocation(left));
					let rightLen = getVectorLen(checker, checker.getTypeAtLocation(right));

					if (leftLen == 1 && rightLen == 1) {
						let funcDef = simpleFuncMap.get(expressionText.replace('__.', ''));
						if (typeof funcDef == 'string') {
							let tokenKinds = {
								'+': ts.SyntaxKind.PlusToken,
								'-': ts.SyntaxKind.MinusToken,
								'/': ts.SyntaxKind.SlashToken,
								'*': ts.SyntaxKind.AsteriskToken,
								'%': ts.SyntaxKind.PercentToken,
								'&': ts.SyntaxKind.AmpersandToken,
								'|': ts.SyntaxKind.BarToken,
								'^': ts.SyntaxKind.CaretToken,
								'<<': ts.SyntaxKind.LessThanLessThanToken,
								'>>': ts.SyntaxKind.GreaterThanGreaterThanToken
							};
							return factory.createBinaryExpression(
								visit(left),
								factory.createToken(tokenKinds[funcDef]),
								visit(right)
							);
						}
					}

					if (leftLen > 0 && rightLen > 0) {
						let leftHoist = factory.createTempVariable(context.hoistVariableDeclaration, true);
						let rightHoist = factory.createTempVariable(context.hoistVariableDeclaration, true);

						let leftAss = factory.createAssignment(leftHoist, visit(left));
						let rightAss = factory.createAssignment(rightHoist, visit(right));

						let tokenKinds = {
							mul: ts.SyntaxKind.AsteriskToken,
							div: ts.SyntaxKind.SlashToken,
							add: ts.SyntaxKind.PlusToken,
							sub: ts.SyntaxKind.MinusToken,
							mod: ts.SyntaxKind.PercentToken,
							and: ts.SyntaxKind.AmpersandToken,
							or: ts.SyntaxKind.BarToken,
							xor: ts.SyntaxKind.CaretToken,
							lshift: ts.SyntaxKind.LessThanLessThanToken,
							rshift: ts.SyntaxKind.GreaterThanGreaterThanToken
						};

						let innerElems = [];
						if (leftLen == rightLen) {
							for (let i = 0; i < leftLen; i++) {
								innerElems.push(
									factory.createBinaryExpression(
										factory.createElementAccessExpression(
											leftHoist,
											factory.createNumericLiteral(i)
										),
										factory.createToken(tokenKinds[expressionText.replace('__.', '')]),
										factory.createElementAccessExpression(
											rightHoist,
											factory.createNumericLiteral(i)
										)
									)
								);
							}
						} else if (leftLen == 1) {
							for (let i = 0; i < rightLen; i++) {
								innerElems.push(
									factory.createBinaryExpression(
										leftHoist,
										factory.createToken(tokenKinds[expressionText.replace('__.', '')]),
										factory.createElementAccessExpression(
											rightHoist,
											factory.createNumericLiteral(i)
										)
									)
								);
							}
						} else if (rightLen == 1) {
							for (let i = 0; i < leftLen; i++) {
								innerElems.push(
									factory.createBinaryExpression(
										factory.createElementAccessExpression(
											leftHoist,
											factory.createNumericLiteral(i)
										),
										factory.createToken(tokenKinds[expressionText.replace('__.', '')]),
										rightHoist
									)
								);
							}
						}
						let expr = factory.createArrayLiteralExpression(innerElems);
						return factory.createCommaListExpression([leftAss, rightAss, expr]);
					}
				}

				if (singleFuncMap.has(expressionText.replace('__.', ''))) {
					let left = node.arguments[0];
					let leftLen = getVectorLen(checker, checker.getTypeAtLocation(left));
					let funcDef = singleFuncMap.get(expressionText.replace('__.', ''));

					if (leftLen == 1) {
						if (typeof funcDef == 'string') {
							return factory.createCallExpression(
								factory.createIdentifier(funcDef),
								[],
								[visit(left)]
							);
						}
					}

					if (leftLen > 0) {
						if (typeof funcDef == 'string') {
							let leftHoist = factory.createTempVariable(context.hoistVariableDeclaration, true);
							let leftAss = factory.createAssignment(leftHoist, visit(left));
							let innerElems = [];

							for (let i = 0; i < leftLen; i++) {
								innerElems.push(
									factory.createCallExpression(
										factory.createIdentifier(funcDef),
										[],
										[
											factory.createElementAccessExpression(
												leftHoist,
												factory.createNumericLiteral(i)
											)
										]
									)
								);
							}

							let expr = factory.createArrayLiteralExpression(innerElems);
							return factory.createCommaListExpression([leftAss, expr]);
						} else {
							return factory.createParenthesizedExpression(
								factory.createCallExpression(
									factory.createPropertyAccessExpression(
										factory.createPropertyAccessExpression(
											factory.createIdentifier('__'),
											factory.createIdentifier('FM')
										),
										factory.createIdentifier(expressionText.replace('__.', '') + `_${leftLen}`)
									),
									[],
									[visit(left)]
								)
							);
						}
					}
				}

				if (expressionText == '__.swizzle' && node.arguments.length == 2) {
					let index = {
						x: 0,
						y: 1,
						z: 2,
						w: 3,
						r: 0,
						g: 1,
						b: 2,
						a: 3
					};

					let vecLen = getVectorLen(checker, checker.getTypeAtLocation(node.arguments[0]));
					if (vecLen != 0) {
						let swizzleLiteral = node.arguments[1];
						let swiz = '';
						if (ts.isStringLiteral(swizzleLiteral)) {
							swiz = swizzleLiteral.text;
						}

						if (swiz.length == 1) {
							return factory.createElementAccessExpression(
								visit(node.arguments[0]),
								factory.createNumericLiteral(index[swiz])
							);
						}

						let temp = factory.createTempVariable(context.hoistVariableDeclaration, true);
						let tempAss = factory.createAssignment(temp, visit(node.arguments[0]));
						let elems = [];
						for (let i = 0; i < swiz.length; i++) {
							if (vecLen == 1) {
								elems.push(temp);
							} else {
								elems.push(
									factory.createElementAccessExpression(
										temp,
										factory.createNumericLiteral(index[swiz[i]])
									)
								);
							}
						}

						return factory.createCommaListExpression([
							tempAss,
							factory.createArrayLiteralExpression(elems)
						]);
					}
				}

				if (
					expressionText.startsWith('__.') &&
					makeVectorsMap.has(expressionText.replace('__.', '').replace(/\d/g, ''))
				) {
					let arg_lengths = node.arguments.map((x) =>
						getVectorLen(checker, checker.getTypeAtLocation(x))
					);
					let matches = expressionText.match(/\d/g);
					if (matches) {
						let targetLen = matches[0];
						let targetName = expressionText.replace('__.', '').replace(/\d/g, '');
						return factory.createCallExpression(
							factory.createPropertyAccessExpression(
								factory.createPropertyAccessExpression(
									factory.createIdentifier('__'),
									factory.createIdentifier('FM')
								),
								factory.createIdentifier(targetName + `_${targetLen}_${arg_lengths.join('_')}`)
							),
							[],
							node.arguments.map((x) => ts.visitEachChild(x, visit, context))
						);
					} else {
						if (expressionText == '__.float') {
							return ts.visitEachChild(node.arguments[0], visit, context);
						} else if (expressionText == '__.int') {
							return factory.createParenthesizedExpression(
								factory.createBinaryExpression(
									ts.visitEachChild(node.arguments[0], visit, context),
									factory.createToken(ts.SyntaxKind.BarToken),
									factory.createNumericLiteral('0')
								)
							);
						} else if (expressionText == '__.uint') {
							return factory.createParenthesizedExpression(
								factory.createBinaryExpression(
									ts.visitEachChild(node.arguments[0], visit, context),
									factory.createToken(ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken),
									factory.createNumericLiteral('0')
								)
							);
						}
					}
				}

				if (symbol && symbol.name == 'int') {
					return factory.createParenthesizedExpression(
						factory.createBinaryExpression(
							ts.visitEachChild(node, visit, context),
							factory.createToken(ts.SyntaxKind.BarToken),
							factory.createNumericLiteral('0')
						)
					);
				} else if (
					symbol &&
					(symbol.name == 'int2' || symbol.name == 'int3' || symbol.name == 'int4')
				) {
					return factory.createCallExpression(
						factory.createPropertyAccessExpression(
							factory.createIdentifier('__'),
							factory.createIdentifier('intifyVector')
						),
						[],
						[ts.visitEachChild(node, visit, context)]
					);
				}
			}

			return ts.visitEachChild(node, visit, context);
		}

		rootNode = ts.visitNode(rootNode, visit);

		return rootNode;
	};
};

/**
 * Find and force all integer math to result in integers (i.e. 1 / 2 = 0)
 */
export const updateClassStructure: (
	getChecker: () => ts.TypeChecker
) => ts.TransformerFactory<ts.SourceFile> = (getChecker) => (context) => {
	let checker = getChecker();
	return (rootNode) => {
		const { factory } = context;

		function visit(node) {
			if (ts.isClassDeclaration(node)) {
				return [
					factory.updateClassDeclaration(
						node,
						node.modifiers,
						node.name,
						node.typeParameters,
						node.heritageClauses,
						[
							...node.members.map((m) => ts.visitEachChild(m, visit, context)),
							factory.createMethodDeclaration(
								undefined,
								undefined,
								factory.createIdentifier('_getStructure'),
								undefined,
								undefined,
								[],
								undefined,
								factory.createBlock(
									[
										factory.createReturnStatement(
											factory.createCallExpression(
												factory.createPropertyAccessExpression(
													factory.createIdentifier('JSON'),
													'parse'
												),
												undefined,
												[
													factory.createStringLiteral(
														JSON.stringify(
															translateType(checker, checker.getTypeAtLocation(node), true)
														)
													)
												]
											)
										)
									],
									true
								)
							)
						]
					),
					factory.createCallExpression(
						factory.createIdentifier('__shadeup_register_struct'),
						undefined,
						[
							factory.createCallExpression(
								factory.createPropertyAccessExpression(factory.createIdentifier('JSON'), 'parse'),
								undefined,
								[
									factory.createStringLiteral(
										JSON.stringify(translateType(checker, checker.getTypeAtLocation(node), true))
									)
								]
							),
							factory.createIdentifier(node.name.text)
						]
					)
				];
			} else if (ts.isCallExpression(node)) {
				let symbol = checker.getSymbolAtLocation(node.expression);
				if (symbol && symbol.name == 'buffer') {
					let isInScope = false;
					let sym = checker.getTypeAtLocation(node.typeArguments[0]).getSymbol();
					if (sym) {
						let syms = checker.getSymbolsInScope(
							node,
							ts.SymbolFlags.Alias | ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Type
						);
						for (let s of syms) {
							if (s == sym) {
								isInScope = true;
								break;
							}
						}
					}

					return factory.updateCallExpression(node, node.expression, node.typeArguments, [
						...node.arguments,
						factory.createObjectLiteralExpression([
							factory.createSpreadAssignment(
								factory.createCallExpression(
									factory.createPropertyAccessExpression(factory.createIdentifier('JSON'), 'parse'),
									undefined,
									[
										factory.createStringLiteral(
											JSON.stringify(
												translateType(
													checker,
													checker.getTypeAtLocation(node.typeArguments[0]),
													true
												)
											)
										)
									]
								)
							),
							...(isInScope
								? [
										factory.createPropertyAssignment(
											'__type',
											factory.createIdentifier(
												checker.getTypeAtLocation(node.typeArguments[0]).getSymbol().getName()
											)
										)
								  ]
								: [])
						])
					]);
				}
			}

			return ts.visitEachChild(node, visit, context);
		}

		return ts.visitNode(rootNode, visit);
	};
};

/**
 * Adds async and await to auto generated functions like sleep and their callers
 */
export const updateAsyncCalls: (
	getChecker: () => [ts.TypeChecker, ShadeupEnvironment]
) => ts.TransformerFactory<ts.SourceFile> = (getChecker) => (context) => {
	let [checker, env] = getChecker();

	return (rootNode) => {
		const { factory } = context;

		function visit(node) {
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
						let graphNodeName = getFunctionNodeName(funcDeclar);

						let graphNode = env.tagGraph.getNode(graphNodeName);
						if (graphNode) {
							if (!isInShader(node) && !isInRoot(node)) {
								if (graphNode.tags.includes('async')) {
									return factory.createAwaitExpression(ts.visitEachChild(node, visit, context));
								}
							}
						}
					}
				}
				// // console.log(returnType.symbol?.name);
				// try {
				// 	if (node.expression.getText().includes('lake')) {
				// 		console.log('Found lake');
				// 		let returnType = checker.getReturnTypeOfSignature(checker.getResolvedSignature(node));
				// 		if (returnType.aliasSymbol) {
				// 			let alias = returnType.aliasSymbol;
				// 			if (alias.name == 'Promise') {
				// 				isPromise = true;
				// 			}
				// 		} else {
				// 			let alias = returnType.getSymbol();
				// 			if (alias.name == 'Promise') {
				// 				isPromise = true;
				// 			}
				// 		}
				// 	}
				// } catch (e) {}

				if (
					node.expression &&
					ts.isIdentifier(node.expression) &&
					node.expression.text.startsWith('shader_start_shd_')
				) {
					let inner = node.arguments[0];
					if (ts.isAsExpression(inner)) {
						inner = inner.expression;
					}

					if (ts.isCallExpression(inner) && inner.arguments[0]) {
						let shaderKey = inner.arguments[0];
						if (ts.isStringLiteral(shaderKey)) {
							let key = shaderKey.text;
							let file = env.files.find((x) => x.path == rootNode.fileName);
							let shader = file.shaders.find((x) => x.glsl.key == 'shd_' + key);
							if (shader) {
								let params: [string, ts.Expression][] = [];

								let paramsTyped: [string, ts.Expression][] = [];
								let serializeObject = (obj: any[] | Object | string | number | boolean) => {
									if (typeof obj == 'number') {
										return factory.createNumericLiteral(obj.toString());
									} else if (typeof obj == 'string') {
										return factory.createStringLiteral(obj);
									} else if (Array.isArray(obj)) {
										return factory.createArrayLiteralExpression(obj.map(serializeObject));
									} else if (typeof obj == 'object') {
										let props = [];
										for (let prop of Object.keys(obj)) {
											props.push(
												factory.createPropertyAssignment(prop, serializeObject(obj[prop]))
											);
										}
										return factory.createObjectLiteralExpression(props);
									} else if (typeof obj == 'boolean') {
										return obj ? factory.createTrue() : factory.createFalse();
									} else {
										throw new Error('Unknown type');
									}
								};

								for (let param of Object.keys(shader.glsl.locals)) {
									let u = shader.glsl.locals[param];
									let symbols = checker.getSymbolsInScope(node, ts.SymbolFlags.Variable);
									let symbol = symbols.find((x) => x.name == param);

									// We have to do this because the symbol might be renamed and it's not obvious how to detect that at our level, so we use a ident node inside the closure
									let findInside = (node: ts.Node): ts.Node | undefined => {
										if (ts.isIdentifier(node) && checker.getSymbolAtLocation(node) == symbol) {
											return node;
										}
										return ts.forEachChild(node, findInside);
									};

									let found = findInside(inner.arguments[1]);

									if (found) {
										params.push([`_ext_uniform_local_${param}`, found as ts.Identifier]);
									} else {
										params.push([`_ext_uniform_local_${param}`, factory.createIdentifier(param)]);
									}
									// paramsTyped.push([`_ext_uniform_local_${param}`, serializeObject(u.structure)]);
								}

								for (let param of Object.keys(shader.glsl.globals)) {
									let u = shader.glsl.globals[param];

									params.push([
										`_ext_uniform_global_${param}`,
										factory.createCallExpression(
											factory.createIdentifier('globalVarGet'),
											undefined,
											[
												factory.createStringLiteral(cleanName(u.fileName)),
												factory.createStringLiteral(param)
											]
										)
									]);
									// paramsTyped.push([`_ext_uniform_global_${param}`, serializeObject(u.structure)]);
								}

								// return factory.createCallExpression(
								// 	factory.createIdentifier('__shadeup_gen_shader'),
								// 	[],
								// 	[
								// 		factory.createStringLiteral(shader.glsl.key),
								// 		factory.createObjectLiteralExpression([
								// 			factory.createPropertyAssignment(
								// 				'webgl',
								// 				factory.createObjectLiteralExpression(
								// 					paramsTyped.map(([name, value]) =>
								// 						factory.createPropertyAssignment(name, value)
								// 					)

								// 				),

								// 			),
								// 			factory.createPropertyAssignment(
								// 				'webgpu',
								// 				serializeObject({
								// 					locals: shader.wgsl.locals, globals: shader.wgsl.globals
								// 				})
								// 			)
								// 		]),
								// 		factory.createObjectLiteralExpression([
								// 			factory.createPropertyAssignment(
								// 				'webgl',
								// 				factory.createObjectLiteralExpression(
								// 					paramsTyped.map(([name, value]) =>
								// 						factory.createPropertyAssignment(name, value)
								// 					)

								// 				),

								// 			)
								// 		]),

								// 	]
								// );
								let innerArg = inner.arguments[1];
								if (ts.isAsExpression(innerArg)) {
									innerArg = innerArg.expression;
								}
								if (ts.isParenthesizedExpression(innerArg)) {
									innerArg = innerArg.expression;
								}

								if (!ts.isArrowFunction(innerArg)) {
									throw new Error('Expected arrow function');
								}
								let arrow = innerArg;
								let mods = ts.getModifiers(arrow) || [];

								return factory.createCallExpression(
									factory.createIdentifier('__shadeup_make_shader_inst'),
									[],
									[
										...[
											factory.createStringLiteral(shader.glsl.key),
											factory.createObjectLiteralExpression(
												params.map(([name, value]) => factory.createPropertyAssignment(name, value))
											),

											factory.updateArrowFunction(
												arrow,
												[...mods, factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
												arrow.typeParameters,
												arrow.parameters,
												arrow.type,
												arrow.equalsGreaterThanToken,
												arrow.body
											)
										],
										...(inner.arguments.length == 3 ? [inner.arguments[2]] : [])
									]
								);
							}
						}
					}
				}
			}

			if (ts.isFunctionDeclaration(node)) {
				let graphNodeName = getFunctionNodeName(node, rootNode);

				let graphNode = env.tagGraph.getNode(graphNodeName);

				if (graphNode) {
					if (graphNode.tags.includes('async')) {
						let mods = ts.getModifiers(node) || [];
						return factory.updateFunctionDeclaration(
							node,
							[...mods, factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
							node.asteriskToken,
							node.name,
							node.typeParameters,
							node.parameters,
							node.type,
							ts.visitEachChild(node.body, visit, context)
						);
					}
				}
			}

			if (ts.isClassDeclaration(node)) {
				ts.forEachChild(node, (n) => {
					if (ts.isMethodDeclaration(n)) {
						let graphNodeName = getFunctionNodeName(n, rootNode);

						let graphNode = env.tagGraph.getNode(graphNodeName);

						if (graphNode) {
							if (graphNode.tags.includes('async')) {
								let mods = ts.getModifiers(node) || [];
								return factory.updateMethodDeclaration(
									n,
									[...mods, factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
									n.asteriskToken,
									n.name,
									n.questionToken,
									n.typeParameters,
									n.parameters,
									n.type,
									ts.visitEachChild(n.body, visit, context)
								);
							}
						}
					}
				});
			}

			return ts.visitEachChild(node, visit, context);
		}

		return ts.visitNode(rootNode, visit);
	};
};

export const updateAsyncArrows: (
	getChecker: () => [ts.TypeChecker, ShadeupEnvironment]
) => ts.TransformerFactory<ts.SourceFile> = (getChecker) => (context) => {
	let [checker, env] = getChecker();

	return (rootNode) => {
		const { factory } = context;

		function visit(node) {
			if (ts.isArrowFunction(node)) {
				let doesAwait = false;

				let visit = (node: ts.Node) => {
					if (ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)) {
						return;
					}
					if (ts.isAwaitExpression(node)) {
						doesAwait = true;
					}
					return ts.visitEachChild(node, visit, context);
				};

				ts.visitEachChild(node.body, visit, context);
				if (doesAwait) {
					let mods = ts.getModifiers(node) || [];
					return factory.updateArrowFunction(
						node,
						[...mods, factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
						node.typeParameters,
						node.parameters,
						node.type,
						node.equalsGreaterThanToken,
						node.body
					);
				}
			}

			return ts.visitEachChild(node, visit, context);
		}

		return ts.visitNode(rootNode, visit);
	};
};
