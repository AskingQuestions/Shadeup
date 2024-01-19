/**
 * Validates the checked typescript ast
 */

import ts from 'typescript';
import { lookupIndexMappingRange } from '../generator/root';
import { getFunctionDeclarationFromCallExpression } from '../generator/util';
import {
	getFunctionNodeName,
	hasShadeupDocTag,
	ShadeupEnvironment,
	ShadeupFile
} from './ShadeupEnvironment';
import { getArrayTypeInfo } from '../generator/wgsl';

type VisitorSignature = {
	file: ShadeupFile;
	ast: ts.SourceFile;
	checker: ts.TypeChecker;
	node: ts.Node;
};

function printNode(node: ts.Node) {
	console.log(ts.SyntaxKind[node.kind]);
}

function printFlagsSymbol(flags: number) {
	let flag = [];
	for (let f of Object.keys(ts.SymbolFlags)) {
		if (flags & ts.SymbolFlags[f]) {
			flag.push(f);
		}
	}
	console.log(flag);
}
function printFlagsType(flags: number) {
	let flag = [];
	for (let f of Object.keys(ts.TypeFlags)) {
		if (flags & ts.TypeFlags[f]) {
			flag.push(f);
		}
	}
	console.log(flag);
}

export function validate(
	file: ShadeupFile,
	ast: ts.SourceFile,
	checker: ts.TypeChecker
): ts.Diagnostic[] {
	let now = performance.now();
	let nodes = 0;
	const errors: ts.Diagnostic[] = [];

	function add(e: ts.Diagnostic | ts.Diagnostic[] | undefined) {
		if (e) {
			if (Array.isArray(e)) {
				errors.push(...e);
			} else {
				errors.push(e);
			}
		}
	}

	// ast.

	function visit(ctx: VisitorSignature) {
		nodes++;
		ctx.node.forEachChild((node) =>
			visit({
				...ctx,
				node
			})
		);
		if (ctx.node.kind == ts.SyntaxKind.PropertyAccessExpression) {
			if (ts.isPropertyAccessExpression(ctx.node)) {
				add(validatePropertyAccessExpression(ctx, ctx.node));
			}
		} else if (ctx.node.kind == ts.SyntaxKind.ConditionalExpression) {
			if (ts.isConditionalExpression(ctx.node)) {
				add(validateConditionalExpression(ctx, ctx.node));
			}
		} else if (ctx.node.kind == ts.SyntaxKind.CallExpression) {
			if (ts.isCallExpression(ctx.node)) {
				add(validateCallExpression(ctx, ctx.node));
			}
		}
	}

	visit({
		file,
		ast,
		checker,
		node: ast
	});

	return errors;
}

export function validateGraph(
	env: ShadeupEnvironment,
	file: ShadeupFile,
	ast: ts.SourceFile,
	checker: ts.TypeChecker
): ts.Diagnostic[] {
	let now = performance.now();
	let nodes = 0;
	const errors: ts.Diagnostic[] = [];

	function add(e: ts.Diagnostic | ts.Diagnostic[] | undefined) {
		if (e) {
			if (Array.isArray(e)) {
				errors.push(...e);
			} else {
				errors.push(e);
			}
		}
	}

	function visit(ctx: VisitorSignature) {
		nodes++;
		ctx.node.forEachChild((node) =>
			visit({
				...ctx,
				node
			})
		);

		if (ts.isCallExpression(ctx.node)) {
			let lhsType = checker?.getTypeAtLocation(ctx.node.getChildAt(0));
			let sig = lhsType?.getCallSignatures();
			if (sig && sig[0] && sig[0].getDeclaration()) {
				let declaration = sig[0].getDeclaration();

				if (ts.isIdentifier(ctx.node.expression) && ctx.node.expression.text == 'makeShader') {
					let n = checker?.getTypeAtLocation(declaration);
					if (ctx.node.arguments.length >= 2) {
						if (ts.isArrowFunction(ctx.node.arguments[1])) {
							add(validateShaderCalls(env, ctx, ctx.node.arguments[1]));
						}
					}
				}
			}
		}

		if (ts.isExpressionStatement(ctx.node)) {
			add(validateStatement(ctx, ctx.node));
		}

		if (ts.isArrayLiteralExpression(ctx.node)) {
			add(validateArrayLiteral(ctx, ctx.node));
		}
	}

	visit({
		file,
		ast,
		checker,
		node: ast
	});

	return errors;
}

function hasAnyFlag(flags: number, ...flag: number[]) {
	return flag.some((f) => (flags & f) !== 0);
}

export function isStaticPropertyAccessExpression(
	checker: ts.TypeChecker,
	node: ts.PropertyAccessExpression
) {
	let resultType = checker.getSymbolAtLocation(node);
	if (!resultType) return false;

	let tos = checker.getTypeOfSymbolAtLocation(resultType, node);

	let isStaticMember = false;

	if ((resultType as any).parent) {
		let p = (resultType as any).parent as ts.Symbol;
		if (
			p.valueDeclaration &&
			p.name != '__' &&
			!ts.isSourceFile(p.valueDeclaration) &&
			p.flags & ts.SymbolFlags.Namespace
		) {
			isStaticMember = true;
		}
	}

	tos.getCallSignatures().forEach((s) => {
		if (s.declaration) {
			s.declaration.modifiers?.forEach((m) => {
				if (m.kind == ts.SyntaxKind.StaticKeyword) {
					isStaticMember = true;
				}
			});
		}
	});

	return isStaticMember;
}

function validateStatement({ checker, file }: VisitorSignature, node: ts.ExpressionStatement) {
	if (
		ts.isLiteralExpression(node.expression) ||
		ts.isPropertyAccessChain(node.expression) ||
		ts.isPropertyAccessExpression(node.expression) ||
		ts.isIdentifier(node.expression)
	) {
		return {
			file: node.getSourceFile(),
			code: 0,
			messageText: `This expression has no effect`,
			category: ts.DiagnosticCategory.Error,
			start: node.getStart(),
			length: node.getEnd() - node.getStart()
		} as ts.Diagnostic;
	}
}

function validateConditionalExpression(
	{ checker, file }: VisitorSignature,
	node: ts.ConditionalExpression
) {
	// Ensure both branches are of the same exact type (we don't auto cast this one)
	let thenType = checker.getTypeAtLocation(node.whenTrue);
	let elseType = checker.getTypeAtLocation(node.whenFalse);

	if (!isTypeCompatible(checker, thenType, elseType)) {
		return undefined; // This is broken
		return {
			file: node.getSourceFile(),
			code: 0,
			messageText: `Conditional expression branches must be of the same type. Got ${checker.typeToString(
				thenType
			)} and ${checker.typeToString(elseType)}`,
			category: ts.DiagnosticCategory.Error,
			start: node.getStart(),
			length: node.getEnd() - node.getStart()
		} as ts.Diagnostic;
	}

	return undefined;
}
function validateCallExpression({ checker, file }: VisitorSignature, node: ts.CallExpression) {
	if (ts.isPropertyAccessExpression(node.expression)) {
		let left = node.expression.expression;
		if (!ts.isIdentifier(left)) return undefined;
		if (left.text != '__') return undefined;
		let right = node.expression.name.text;

		if (
			right.startsWith('int') &&
			(right[right.length - 1] == '2' ||
				right[right.length - 1] == '3' ||
				right[right.length - 1] == '4')
		) {
			for (let i = 0; i < node.arguments.length; i++) {
				let arg = node.arguments[i];

				let type = checker.getTypeAtLocation(arg);

				let typeName = checker.typeToString(type);
				if (typeName.startsWith('uint')) {
					if (node.arguments.length != 1) {
						return {
							file: node.getSourceFile(),
							code: 0,
							messageText: `Cannot convert from uint to int during vector construction, use int() before`,
							category: ts.DiagnosticCategory.Error,
							start: arg.getStart(),
							length: arg.getEnd() - arg.getStart()
						} as ts.Diagnostic;
					}
				}
			}
		}
	}

	return undefined;
}

function validatePropertyAccessExpression(
	{ checker, file }: VisitorSignature,
	node: ts.PropertyAccessExpression
) {
	let midNode = node.getChildren()[1];

	if (file.mapping && midNode) {
		let range = lookupIndexMappingRange(file.mapping, midNode.getStart(), midNode.getEnd());

		let s = file.content.substring(range.start, range.end);

		let isStaticAccess = s == '::';

		let resultType = checker.getSymbolAtLocation(node);

		if (resultType) {
			let tos = checker.getTypeOfSymbolAtLocation(resultType, node);

			let isStaticMember = false;

			if ((resultType as any).parent) {
				let p = (resultType as any).parent as ts.Symbol;
				if (
					p.valueDeclaration &&
					p.name != '__' &&
					!ts.isSourceFile(p.valueDeclaration) &&
					p.flags & ts.SymbolFlags.Namespace
				) {
					isStaticMember = true;
				}
			}

			tos.getCallSignatures().forEach((s) => {
				if (s.declaration) {
					s.declaration.modifiers?.forEach((m) => {
						if (m.kind == ts.SyntaxKind.StaticKeyword) {
							isStaticMember = true;
						}
					});
				}
			});
			resultType.getDeclarations()?.forEach((d) => {
				if (ts.canHaveModifiers(d) && d.modifiers) {
					d.modifiers.forEach((m) => {
						if (m.kind == ts.SyntaxKind.StaticKeyword) {
							isStaticMember = true;
						}
					});
				}
			});

			if (isStaticMember && !isStaticAccess) {
				return {
					file: node.getSourceFile(),
					code: 0,
					messageText: `Cannot access static member with '${s}' use '::' instead`,
					category: ts.DiagnosticCategory.Error,
					start: midNode.getStart(),
					length: midNode.getEnd() - midNode.getStart()
				} as ts.Diagnostic;
			} else if (!isStaticMember && isStaticAccess) {
				return {
					file: node.getSourceFile(),
					code: 0,
					messageText: `Cannot access non-static member with '${s}' use '.' instead`,
					category: ts.DiagnosticCategory.Error,
					start: midNode.getStart(),
					length: midNode.getEnd() - midNode.getStart()
				} as ts.Diagnostic;
			}
		}
	}

	return undefined;
}

function isTypeCompatible(checker: ts.TypeChecker, type: ts.Type, typeOther: ts.Type): boolean {
	return (checker as any).isTypeAssignableTo(type, typeOther);
}

function validateArrayLiteral(
	{ checker, file }: VisitorSignature,
	node: ts.ArrayLiteralExpression
) {
	if (node.elements.length == 3) {
		let name1 = checker.typeToString(checker.getTypeAtLocation(node.elements[0]));
		let name2 = checker.typeToString(checker.getTypeAtLocation(node.elements[1]));
		let name3 = checker.typeToString(checker.getTypeAtLocation(node.elements[2]));

		if (name1 == '0' && name2 == 'shader' && name3 == '0') {
			return undefined;
		}
	}
	// let firstType: ts.Type | undefined = undefined;
	// for (let i = 0; i < node.elements.length; i++) {
	// 	let e = node.elements[i];
	// 	let type = checker.getTypeAtLocation(e);

	// 	if (firstType) {
	// 		if (!isTypeCompatible(checker, type, firstType)) {
	// 			if (
	// 				firstType.getSymbol()?.getName() != 'texture2d_internal_empty' &&
	// 				firstType.getSymbol()?.getName() != 'buffer_internal' &&
	// 				firstType.getSymbol()?.getName() != 'texture3d_internal_empty'
	// 			) {
	// 				return {
	// 					file: node.getSourceFile(),
	// 					code: 0,
	// 					messageText: `Array elements are not compatible, mixing types '${checker.typeToString(
	// 						firstType
	// 					)}' and '${checker.typeToString(type)}'`,
	// 					category: ts.DiagnosticCategory.Error,
	// 					start: e.getStart(),
	// 					length: e.getEnd() - e.getStart()
	// 				} as ts.Diagnostic;
	// 			}
	// 		}
	// 	} else {
	// 		firstType = type;
	// 	}
	// }

	return undefined;
}

const SHADER_TYPE_BLACKLIST = ['string', 'null', 'map'];
function validateShaderTypeUse(
	env: ShadeupEnvironment,
	{ checker, file }: VisitorSignature,
	diags: ts.Diagnostic[],
	node: ts.Node,
	typeNode: ts.Type
) {
	let type = checker.typeToString(typeNode);

	if (SHADER_TYPE_BLACKLIST.includes(type) || type.startsWith('map<')) {
		diags.push({
			file: node.getSourceFile(),
			code: 0,
			messageText: `Cannot use type '${type}' in shader`,
			category: ts.DiagnosticCategory.Error,
			start: node.getStart(),
			length: node.getEnd() - node.getStart()
		} as ts.Diagnostic);
	}

	if (typeNode.isUnion() && type != 'boolean') {
		diags.push({
			file: node.getSourceFile(),
			code: 0,
			messageText: `Cannot use union types in shaders ('${type}')`,
			category: ts.DiagnosticCategory.Error,
			start: node.getStart(),
			length: node.getEnd() - node.getStart()
		} as ts.Diagnostic);
	}

	if (typeNode.isLiteral()) {
		diags.push({
			file: node.getSourceFile(),
			code: 0,
			messageText: `Cannot use literal types in shaders ('${type}')`,
			category: ts.DiagnosticCategory.Error,
			start: node.getStart(),
			length: node.getEnd() - node.getStart()
		} as ts.Diagnostic);
	}
}

function validateShaderCalls(
	env: ShadeupEnvironment,
	vs: VisitorSignature,
	node: ts.ArrowFunction
) {
	let diags: ts.Diagnostic[] = [];
	const { checker, file } = vs;

	let visit = (node: ts.Node) => {
		if (ts.isCallExpression(node)) {
			let declar = getFunctionDeclarationFromCallExpression(checker, node);
			if (declar) {
				let graphNodeName = getFunctionNodeName(declar);

				let graphNode = env.tagGraph.getNode(graphNodeName);
				if (graphNode) {
					if (graphNode.tags.includes('async')) {
						let rawChain = env.tagGraph.resolveTagSourceChain(graphNodeName, 'async');
						let chain = rawChain.map((m) => m.split(':')[1]).join(' <- ');

						if (rawChain[rawChain.length - 1].split(':')[1] == 'texture2d_internal_empty') {
							// This is a non  error
						} else {
							diags.push({
								file: node.getSourceFile(),
								code: 0,
								messageText: `Cannot call cpu-only function from a shader. ${chain}`,
								category: ts.DiagnosticCategory.Error,
								start: node.getStart(),
								length: node.getEnd() - node.getStart()
							} as ts.Diagnostic);
						}
					}
				}
			}

			validateShaderTypeUse(env, vs, diags, node, checker.getTypeAtLocation(node));
		}

		if (ts.isPropertyAccessExpression(node)) {
			validateShaderTypeUse(env, vs, diags, node, checker.getTypeAtLocation(node));
		}

		if (ts.isIdentifier(node)) {
			validateShaderTypeUse(env, vs, diags, node, checker.getTypeAtLocation(node));
		}

		if (ts.isElementAccessExpression(node)) {
			validateShaderTypeUse(env, vs, diags, node, checker.getTypeAtLocation(node));
		}

		if (ts.isVariableDeclaration(node)) {
			let arrType = checker.getTypeAtLocation(node);
			let typeInfo = getArrayTypeInfo(checker, arrType);
			if (typeInfo.isArray) {
				if (typeInfo.staticSize <= 0) {
					diags.push({
						file: node.getSourceFile(),
						code: 0,
						messageText: `Please explicitly specify the size of the array (let a: T[10] = ...)`,
						category: ts.DiagnosticCategory.Error,
						start: node.getStart(),
						length: node.getEnd() - node.getStart()
					} as ts.Diagnostic);
				}
			}
		}

		ts.forEachChild(node, visit);
	};
	ts.forEachChild(node, visit);

	return diags;
}
