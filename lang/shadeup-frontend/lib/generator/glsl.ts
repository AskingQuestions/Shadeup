import ts from 'typescript';
let { factory, isIdentifier } = ts;
import { TSVisitMapper } from './tsWalk';

import toposort from './toposort';
import {
	IndexMapping,
	lookupIndexMappingRange,
	reverseLookupIndexMapping,
	reverseLookupIndexMappingRange,
	SourceNode
} from './root';

import glslHeader from './header.glsl?raw';
import { hasShadeupDocTag, ShadeupEnvironment } from '../environment/ShadeupEnvironment';
import { closest, resolveNodeName } from './util';
import { isStaticPropertyAccessExpression } from '../environment/validate';
import { isTupleType } from 'tsutils';

const TYPE_BLACKLIST = [
	'never',
	'object',
	'symbol',
	'bigint',
	'undefined',
	'null',
	'map',
	'string'
];

const RESERVED_WORDS = ['attribute', 'sample', 'varying', 'uniform', 'layout'];

export class GLSLCompilationError extends Error {
	context: ts.Node;
	constructor(public message: string, public node: ts.Node) {
		super(message);
		this.context = node;
	}
}

function generateDefaultForType(checker: ts.TypeChecker, _type_node: ts.TypeNode) {
	let _type = checker.getTypeFromTypeNode(_type_node);
	let name = (_type.aliasSymbol || _type.getSymbol())?.escapedName.toString();
	switch (name) {
		case 'int':
			return 'int(0)';
		case 'uint':
			return 'uint(0)';

		case 'uint8':
			return 'uint(0)';

		case 'float':
			return 'float(0.0)';
		case 'float2':
			return 'vec2(0.0, 0.0)';
		case 'float3':
			return 'vec3(0.0, 0.0, 0.0)';
		case 'float4':
			return 'vec4(0.0, 0.0, 0.0, 0.0)';
		case 'int2':
			return 'ivec2(0, 0)';
		case 'int3':
			return 'ivec3(0, 0, 0)';
		case 'int4':
			return 'ivec4(0, 0, 0, 0)';
		case 'uint2':
			return 'uvec2(0u, 0u)';
		case 'uint3':
			return 'uvec3(0u, 0u, 0u)';
		case 'uint4':
			return 'uvec4(0u, 0u, 0u, 0u)';
		case 'float2x2':
			return 'mat2(0.0, 0.0, 0.0, 0.0)';
		case 'float3x3':
			return 'mat3(0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0)';
		case 'float4x4':
			return 'mat4(0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0)';
		case 'bool':
			return 'false';
		default:
			let decl = _type.getSymbol()?.getDeclarations();
			if (ts.isTupleTypeNode(_type_node)) {
				let len = _type_node.elements.length;
				let args: string[] = [];
				let rootNode = _type_node.elements[0];
				if (rootNode) {
					for (let i = 0; i < len; i++) {
						args.push(generateDefaultForType(checker, _type_node.elements[i]));
					}
					let rootType = checker.getTypeFromTypeNode(rootNode);
					return translateType(checker, rootType) + `[${len}] {` + args.join(', ') + '}';
				} else {
					return '0';
				}
			}
			if (decl && decl.length > 0) {
				let d = decl[0];
				let structProps: [string, ts.TypeNode][] = [];

				if (ts.isClassDeclaration(d)) {
					let symd = _type.getSymbol();
					symd?.members?.forEach((v, k) => {
						let decl = v.valueDeclaration;
						if (decl && ts.isPropertyDeclaration(decl)) {
							structProps.push([k?.toString() ?? '', decl.type!]);
						}
					});

					let sortedPropsByKey = structProps.sort((a, b) => {
						return a[0].localeCompare(b[0]);
					});

					let args: string[] = sortedPropsByKey.map((p) => {
						return '/* ' + p[0] + ': */ ' + generateDefaultForType(checker, p[1]) + '\n';
					});

					return '_make_struct_' + resolveStructName(d) + '(\n' + args.join(', ') + '\n)';
				} else {
					return '0';
				}
			} else {
				return '0';
			}
	}
}

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

function followTypeReferences(t: ts.Type) {
	if (t.flags & ts.TypeFlags.Object && (t as any).objectFlags & ts.ObjectFlags.Reference) {
		if ((t as ts.TypeReference).target === t) {
			return t;
		}
		return followTypeReferences((t as ts.TypeReference).target);
	} else {
		return t;
	}
}

function getTypeArgument(t: ts.Type, i: number) {
	if (t.flags & ts.TypeFlags.Object && (t as any).objectFlags & ts.ObjectFlags.Reference) {
		return (t as ts.TypeReference).typeArguments[i];
	} else {
		return t;
	}
}

function translateType(checker: ts.TypeChecker, t: ts.Type, templateFormat = false) {
	let n = getTypeFallback(checker, t);

	let originalType = t;
	if (n === undefined) {
		t = followTypeReferences(t);
	}
	if (templateFormat) {
		let name = n?.toString() ?? 'unknown';

		if (
			name === 'Array' ||
			name === 'buffer' ||
			(t.flags & ts.TypeFlags.Object &&
				((t as any).objectFlags & ts.ObjectFlags.Tuple ||
					(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
					(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
		) {
			let typeRef = originalType as ts.TypeReference;

			let args = typeRef.typeArguments || checker.getTypeArguments(typeRef);
			return {
				type: 'array',
				element: translateType(checker, args[0], true)
			};
		}

		if (name == 'boolean' || name == 'false' || name == 'true') name = 'bool';

		if (
			name.startsWith('float') ||
			name.startsWith('int') ||
			name.startsWith('uint') ||
			name == 'bool' ||
			name == 'texture2d' ||
			name == 'atomic'
		)
			return { type: 'primitive', name };

		let symbol = t.aliasSymbol || t.getSymbol();
		if (symbol && symbol.declarations && symbol.declarations.length > 0) {
			if (ts.isClassDeclaration(symbol.declarations[0])) {
				let fields = {};
				let decl = symbol.declarations[0] as ts.ClassDeclaration;
				for (let member of decl.members) {
					if (ts.isPropertyDeclaration(member)) {
						let name = member.name.getText();
						let type = checker.getTypeFromTypeNode(member.type!);
						fields[name] = translateType(checker, type, true);
					}
				}
				return {
					type: 'struct',
					name: resolveStructName(decl),
					fields
				};
			} else {
				return {
					type: 'unknown'
				};
			}
		}
	} else {
		if (
			n === 'Array' ||
			n === 'buffer' ||
			(t.flags & ts.TypeFlags.Object &&
				((t as any).objectFlags & ts.ObjectFlags.Tuple ||
					(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
					(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
		) {
			let typeRef = originalType as ts.TypeReference;
			let toStringed = checker.typeToString(typeRef);
			let args = typeRef.typeArguments || checker.getTypeArguments(typeRef);
			let translated = translateType(checker, args[0]);
			if (toStringed.endsWith('[]')) {
				return translated + '[]';
			} else {
				let staticSize = 0;
				if (isTupleType(t)) {
					staticSize = t.fixedLength;
				}
				return translated + '[' + staticSize + ']';
			}
		}

		if (n === 'texture2d') return `sampler2D`;
		if (n == 'atomic') {
			let args =
				(t as ts.TypeReference).typeArguments || checker.getTypeArguments(t as ts.TypeReference);
			let translated = translateType(checker, args[0]);
			return `atomic_${translated}`;
		}

		if (n === 'bool') return 'bool';
		if (n === 'boolean') return 'bool';
		if (n === 'float') return 'float';
		if (n === 'float2') return 'vec2';
		if (n === 'float3') return 'vec3';
		if (n === 'float4') return 'vec4';

		if (n === 'int') return 'int';
		if (n === 'int2') return 'ivec2';
		if (n === 'int3') return 'ivec3';
		if (n === 'int4') return 'ivec4';

		if (n === 'uint') return 'uint';
		if (n === 'uint8') return 'uint';
		if (n === 'uint2') return 'uvec2';
		if (n === 'uint3') return 'uvec3';
		if (n === 'uint4') return 'uvec4';

		if (n === 'float2x2') return 'mat2';
		if (n === 'float3x3') return 'mat3';
		if (n === 'float4x4') return 'mat4';

		if (n === 'void') return 'void';
		if (n === 'error') return 'void';

		if (t.isUnion()) {
			let types = t.types.map((t) => translateType(checker, t));
			for (let sub of types) {
				if (sub && sub !== 'void' && sub !== 'undefined') return sub;
			}
		}

		let symbol = t.aliasSymbol || t.getSymbol();
		if (symbol && symbol.declarations && symbol.declarations.length > 0) {
			if (ts.isClassDeclaration(symbol.declarations[0])) {
				return resolveStructName(symbol.declarations[0]);
			} else {
				return n?.toString() ?? 'void';
			}
		} else {
			return n?.toString() ?? 'void';
		}
	}
}

function isTypeNameVector(name: string) {
	if (name.startsWith('float') || name.startsWith('int')) {
		if (name.endsWith('2') || name.endsWith('3') || name.endsWith('4')) {
			return true;
		}
	}

	return false;
}

function getTypeNameVectorElementType(name: string) {
	if (name == 'float') {
		return ['float', 1];
	}

	if (name == 'int') {
		return ['int', 1];
	}

	if (name == 'uint') {
		return ['uint', 1];
	}

	if (name.startsWith('float')) {
		return ['float', parseInt(name.substring(5))];
	}

	if (name.startsWith('int')) {
		return ['int', parseInt(name.substring(3))];
	}

	if (name.startsWith('uint')) {
		return ['uint', parseInt(name.substring(4))];
	}

	if (name.startsWith('vec')) {
		return ['float', parseInt(name.substring(3))];
	}

	if (name.startsWith('ivec')) {
		return ['int', parseInt(name.substring(4))];
	}

	if (name.startsWith('uvec')) {
		return ['uint', parseInt(name.substring(4))];
	}

	return ['', 0];
}

function isTranslatedTypeNameVectorOrScalar(name: string) {
	if (name == 'float' || name == 'int' || name == 'uint') return true;
	if (name.startsWith('vec') || name.startsWith('ivec') || name.startsWith('uvec')) {
		if (name.endsWith('2') || name.endsWith('3') || name.endsWith('4')) {
			return true;
		}

		return true;
	}

	return false;
}

function isVector(checker: ts.TypeChecker, t: ts.Type) {
	let name = getTypeFallback(checker, t);
	if (name) {
		return isTypeNameVector(name);
	}
	return false;
}

function getVectorElementType(checker: ts.TypeChecker, t: ts.Type) {
	let name = getTypeFallback(checker, t);
	if (name) {
		return getTypeNameVectorElementType(name);
	}
	return ['', 0];
}

function isNumeric(checker: ts.TypeChecker, t: ts.Type) {
	let name = getTypeFallback(checker, t);
	if (name && (name.startsWith('float') || name.startsWith('int') || name.startsWith('uint'))) {
		return true;
	}
	return false;
}

function escapeIdentifier(id: string) {
	if (RESERVED_WORDS.includes(id)) {
		return '_' + id;
	}
	return id.replaceAll('___', '_ii_').replaceAll('__', '_i_');
}

export function makeWalker() {
	return {
		function: ({ ast, checker, c, s, getType, sWith }) =>
			s([
				translateType(
					checker,
					checker.getSignaturesOfType(getType(), ts.SignatureKind.Call)[0].getReturnType()
				)
			])
	} as TSVisitMapper;
}

type TsAstContext = {
	checker: ts.TypeChecker;
	composed?: ts.CallExpression;
	parentFunction?: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction;
};

function getVectorMask(num: number) {
	let outMask = '';
	let comps = ['x', 'y', 'z', 'w'];
	for (let i = 0; i < num; i++) {
		outMask += comps[i];
	}
	return outMask;
}

function isGLSLType(name: string): boolean {
	return (
		name.startsWith('vec') ||
		name.startsWith('mat') ||
		name.startsWith('sampler') ||
		name.startsWith('texture') ||
		name.startsWith('isampler') ||
		name.startsWith('usampler') ||
		name.startsWith('uvec') ||
		name.startsWith('ivec') ||
		name == 'bool' ||
		name == 'float' ||
		name == 'int' ||
		name == 'uint' ||
		name == 'uint8' ||
		name == 'void'
	);
}

function autoCastNumeric(value: SourceNode, input: string, expected: string): SourceNode {
	let inputType = getTypeNameVectorElementType(input);
	let expectedType = getTypeNameVectorElementType(expected);
	if (inputType[0] != expectedType[0]) {
		if (expectedType[1] == 1) {
			return new SourceNode(value.startIndex, value.endIndex, [`${expectedType[0]}(`, value, `)`]);
		} else {
			return new SourceNode(value.startIndex, value.endIndex, [`${expectedType[0]}(`, value, `)`]);
		}
	}
	return value;
}

function convertConciseBodyToBlock(body: ts.ConciseBody) {
	if (ts.isBlock(body)) {
		return body;
	} else {
		return ts.factory.createBlock([ts.factory.createReturnStatement(body)]);
	}
}
export function compile(
	ctx: TsAstContext,
	ast: ts.Node,
	originalMapping?: IndexMapping
): SourceNode {
	function c(ast: ts.Node) {
		if (!ast) {
			return s([]);
		}
		return compile(ctx, ast);
	}
	function cplain(ast: ts.Node) {
		if (!ast) {
			return s([]);
		}
		return compile(
			{
				checker: ctx.checker,
				parentFunction: ctx.parentFunction
			},
			ast
		);
	}

	/** Generates a SourceNode based on the current ast node */
	function s(c: (SourceNode | string)[]) {
		if (originalMapping) {
			let reverseMapped = lookupIndexMappingRange(originalMapping, ast.getStart(), ast.getEnd());
			return new SourceNode(reverseMapped.start, reverseMapped.end, c);
		} else {
			return new SourceNode(0, 0, c);
		}
	}

	/** Gets a named child of the current ast node */
	function n(kind: ts.SyntaxKind) {
		return ast.getChildren().find((child) => child.kind === kind);
	}

	function f(fn: (child: ts.Node) => boolean) {
		return ast.getChildren().filter(fn);
	}

	function flat(...c: (SourceNode | string)[][]) {
		return c.reduce((acc, cur) => {
			return [...acc, ...cur];
		}, [] as (SourceNode | string)[]);
	}

	function join(c: (SourceNode | string)[], sep: string) {
		return c.reduce((acc, cur) => {
			if (acc.length === 0) {
				return [cur];
			}
			return [...acc, sep, cur];
		}, [] as (SourceNode | string)[]);
	}

	function children() {
		return ast.getChildren().map((child) => c(child));
	}

	function hasName(name: string) {}

	function autoCastParameter(callExpr: ts.CallExpression, argIndex: number) {
		let signature = ctx.checker.getResolvedSignature(callExpr);
		let params = signature.getParameters();
		let param = params[argIndex];
		let paramType = ctx.checker.getTypeOfSymbolAtLocation(param, callExpr);
		let paramTypeString = translateType(ctx.checker, paramType);
		let arg = callExpr.arguments[argIndex];
		let argType = ctx.checker.getTypeAtLocation(arg);
		let argTypeString = translateType(ctx.checker, argType);
		if (paramTypeString !== argTypeString) {
			return autoCastNumeric(c(arg), argTypeString, paramTypeString);
		}
		return s([c(arg)]);
	}

	let prefixFunctions: SourceNode[] = [];
	if (ctx.composed) {
		if (ts.isMethodDeclaration(ast) || ts.isFunctionDeclaration(ast)) {
			for (let [i, arg] of ctx.composed.arguments.entries()) {
				if (ts.isArrowFunction(arg)) {
					let paramFromIndex = ast.parameters[i];
					let name = paramFromIndex.name.getText() + '_composed_' + arg.pos + '_arg_' + i;
					let signature = ctx.checker.getSignatureFromDeclaration(arg);
					let returnType = signature.getReturnType();
					let vars = getClosureVars(ctx.checker, arg);
					let vvv = vars.map((p) =>
						s([
							translateType(ctx.checker, ctx.checker.getTypeAtLocation(p.declarations[0])),
							' ',
							p.escapedName
						])
					);
					let joins = join([...arg.parameters.map((p) => cplain(p)), ...vvv], ', ');
					prefixFunctions.push(
						s([
							translateType(ctx.checker, returnType),
							' ',
							name,
							'(',
							...joins,
							')',
							' {\n',

							...(convertConciseBodyToBlock(arg.body).statements.map((s) => c(s)) ?? []),
							'\n}\n\n'
						])
					);
				}
			}
		}
	}

	switch (ast.kind) {
		case ts.SyntaxKind.FirstPunctuation:
			return s([ast.getText()]);
		case ts.SyntaxKind.SyntaxList:
			return s(children());
		case ts.SyntaxKind.SourceFile:
			return s(children());
		case ts.SyntaxKind.BreakStatement:
			return s(['break;']);
		case ts.SyntaxKind.ContinueStatement:
			return s(['continue;']);
		case ts.SyntaxKind.MethodDeclaration:
			let fnDeclar = ast as ts.FunctionDeclaration | ts.MethodDeclaration;

			let fnName = resolveFunctionName(fnDeclar);

			if (ctx.composed) {
				fnName = fnName + '_composed_' + ctx.composed.pos;
			}

			let isStatic = false;

			let signature = ctx.checker.getSignatureFromDeclaration(fnDeclar);
			if (ts.canHaveModifiers(fnDeclar)) {
				let mods = ts.getModifiers(fnDeclar);
				if (mods) {
					if (mods.some((m) => m.kind == ts.SyntaxKind.StaticKeyword)) {
						isStatic = true;
					}
				}
			}
			let returnType = signature.getReturnType();

			return s([
				...prefixFunctions,
				translateType(ctx.checker, returnType),
				' ',
				fnName,
				'(',
				,
				...join(
					[
						...(isStatic
							? []
							: [
									translateType(ctx.checker, ctx.checker.getTypeAtLocation(fnDeclar.parent)) +
										' _this'
							  ]),
						...fnDeclar.parameters
							.filter((p) => {
								let type = ctx.checker.getTypeAtLocation(p);
								if (type.getCallSignatures().length > 0) {
									return false;
								}
								return true;
							})
							.map((p) => c(p))
					],
					', '
				),
				')',
				' {\n',
				...(fnDeclar.body?.statements.map((s) => c(s)) ?? []),
				'\n}\n\n'
			]);
		case ts.SyntaxKind.FunctionDeclaration:
			let mthdDeclar = ast as ts.FunctionDeclaration | ts.MethodDeclaration;

			let mthdsignature = ctx.checker.getSignatureFromDeclaration(mthdDeclar);
			let mthdreturnType = mthdsignature.getReturnType();

			let mthdName = resolveFunctionName(mthdDeclar);

			if (ctx.composed) {
				mthdName = mthdName + '_composed_' + ctx.composed.pos;
			}
			return s([
				...prefixFunctions,
				translateType(ctx.checker, mthdreturnType),
				' ',
				mthdName,
				'(',
				...join(
					mthdDeclar.parameters
						.filter((p) => {
							let type = ctx.checker.getTypeAtLocation(p);
							if (type.getCallSignatures().length > 0) {
								return false;
							}
							return true;
						})
						.map((p) => c(p)),
					', '
				),
				')',
				' {\n',
				...(mthdDeclar.body?.statements.map((s) => c(s)) ?? []),
				'\n}\n\n'
			]);

		case ts.SyntaxKind.ReturnStatement:
			let ret = ast as ts.ReturnStatement;
			if (!ctx.parentFunction) {
				if (ret.expression) {
					return s(['return ', c(ret.expression), ';\n']);
				} else {
					return s(['return;\n']);
				}
			} else {
				let expectedReturnType = ctx.checker
					.getSignatureFromDeclaration(ctx.parentFunction)
					.getReturnType();
				let actualReturnType = ctx.checker.getTypeAtLocation(ret.expression);

				if (ret.expression) {
					let sss = s([
						'return ',
						autoCastNumeric(
							c(ret.expression),
							translateType(ctx.checker, actualReturnType),
							translateType(ctx.checker, expectedReturnType)
						),
						';\n'
					]);
					return sss;
				} else {
					return s(['return;\n']);
				}
			}
		case ts.SyntaxKind.AsExpression:
			let asExpr = ast as ts.AsExpression;
			return c(asExpr.expression);
		case ts.SyntaxKind.Parameter:
			let param = ast as ts.ParameterDeclaration;
			if (ctx.composed) {
				let indexOf = param.parent.parameters.indexOf(param);
				let expr = ctx.composed.arguments[indexOf];
				if (expr) {
					if (ts.isArrowFunction(expr)) {
						let vars = getClosureVars(ctx.checker, expr.body);

						let closureVars = vars.map((v) => {
							return s([
								translateType(ctx.checker, ctx.checker.getTypeAtLocation(v.valueDeclaration)),
								' ',
								v.name
							]);
						});

						return s(join(closureVars, ', '));
					}
				}
			}
			return s([
				translateType(ctx.checker, ctx.checker.getTypeAtLocation(param)),
				' ',
				escapeIdentifier(param.name.getText())
			]);
		case ts.SyntaxKind.ArrowFunction:
			// This is the root of the shader
			let arrow = ast as ts.ArrowFunction;
			let body = convertConciseBodyToBlock(arrow.body);
			return s([
				'\n/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/\nvoid main() {\n/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/\n',
				...body.statements.map((s) => c(s)),
				'\n/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/\n}\n'
			]);
		case ts.SyntaxKind.VariableStatement:
			let varStatement = ast as ts.VariableStatement;
			return s([
				...join(
					varStatement.declarationList.declarations.map((d) => c(d)),
					', '
				),
				';\n'
			]);
		case ts.SyntaxKind.VariableDeclaration:
			let varDecl = ast as ts.VariableDeclaration;
			let type = ctx.checker.getTypeAtLocation(varDecl);

			return s([
				translateType(ctx.checker, type),
				' ',
				varDecl.name.getText(),
				' = ',
				c(varDecl.initializer!)
			]);
		case ts.SyntaxKind.CallExpression:
			let call = ast as ts.CallExpression;

			let exprSmybol = ctx.checker.getSymbolAtLocation(call.expression);
			if (call.expression.getText() == 'Math.random') {
				return s(['0.0']);
			}
			if (!exprSmybol) {
				return s(['/* TODO: Unknown symbol */']);
			}
			if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
				exprSmybol = ctx.checker.getAliasedSymbol(exprSmybol);
			}

			let symName = exprSmybol?.getName() ?? call.expression.getText();
			if (symName == '__index') {
				if (ts.isPropertyAccessExpression(call.expression)) {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(call.expression.expression)
					);

					let returnType = ctx.checker.getTypeAtLocation(call);
					let vecOut = getVectorElementType(ctx.checker, returnType);
					let outMask = getVectorMask(vecOut[1] as number);

					if (innerType == 'sampler2D') {
						return s([
							'texelFetch(',
							c(call.expression.expression),
							', ivec2(',
							c(call.arguments[0]),
							'), 0).' + outMask
						]);
					}
				}

				return s([c(call.expression), '[', c(call.arguments[0]), ']']);
			} else if (symName == 'len') {
				let expr = call.expression;
				if (ts.isPropertyAccessExpression(expr)) {
					let left = expr.expression;

					return s([c(left), '_size']);
				}
			} else if (symName == 'min' || symName == 'max') {
				// Fold min/max to glsl functions
				if (call.arguments.length > 2) {
					let args = call.arguments.map((a) => c(a));
					while (args.length > 2) {
						let left = args.shift();
						let right = args.shift();
						args.unshift(s([symName, '(', left, ',', right, ')']));
					}
					return s([symName, '(', ...join(args, ','), ')']);
				}
			} else if (symName == 'sample') {
				if (ts.isPropertyAccessExpression(call.expression)) {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(call.expression.expression)
					);

					if (innerType == 'sampler2D') {
						return s([
							'texture(',
							c(call.expression.expression),
							', vec2(',
							c(call.arguments[0]),
							'))'
						]);
					}
				}
			} else if (symName == '__index_assign') {
				return s([
					c((call.expression as ts.PropertyAccessExpression).expression),
					'[',
					c(call.arguments[0]),
					'] = ',
					autoCastParameter(call, 1)
				]);
			} else if (
				symName == 'rand' &&
				call.arguments.length == 0 &&
				call.expression.getText() == 'rand'
			) {
				throw new GLSLCompilationError(
					'rand() in shaders needs to be seeded, use rand(seed) instead',
					call
				);
			}

			if (exprSmybol?.getName() == 'makeVector' && exprSmybol.valueDeclaration) {
				if (ts.isFunctionDeclaration(exprSmybol.valueDeclaration)) {
					let exprSig = ctx.checker.getResolvedSignature(call);
					if (exprSig) {
						return s([
							translateType(ctx.checker, ctx.checker.getReturnTypeOfSignature(exprSig)),
							'(',
							...join(
								call.arguments.map((a) => c(a)),
								', '
							),
							')'
						]);
					}
				}
			}

			// TODO: Please fix this swizzle check to make sure we're not just checking the name
			if (exprSmybol?.getName() == 'swizzle' && exprSmybol.valueDeclaration) {
				if (ts.isFunctionDeclaration(exprSmybol.valueDeclaration)) {
					let exprSig = ctx.checker.getSignatureFromDeclaration(exprSmybol.valueDeclaration);
					let arg = call.arguments[0];
					let arg2 = call.arguments[1];
					let propAccess = '';
					if (ts.isStringLiteral(arg2)) {
						propAccess = arg2.text;
					}

					let argType = ctx.checker.getTypeAtLocation(arg);
					if (isVector(ctx.checker, argType)) {
						return s([c(arg), '.', propAccess]);
					} else if (isNumeric(ctx.checker, argType)) {
						let numericType = translateType(ctx.checker, argType);

						return s([`shadeup_up_swizzle_${propAccess}_${numericType}(`, c(arg), ')']);
					} else {
						return s([c(arg), '.', propAccess]);
					}
				}
			}

			if (isTypeNameVector(exprSmybol?.getName() ?? '')) {
				return s([
					translateType(ctx.checker, ctx.checker.getTypeAtLocation(call.expression)),
					'(',
					...join(call.arguments.length == 0 ? [s(['0'])] : call.arguments.map((a) => c(a)), ', '),
					')'
				]);
			}

			let funcName = c(call.expression);

			let callArgs = [];
			let preArgs = [];
			let exprSig = ctx.checker.getResolvedSignature(call);

			let exprDeclar = exprSig.getDeclaration();
			if (exprDeclar) {
				if (ts.isMethodDeclaration(exprDeclar)) {
					let isStatic = false;
					if (ts.canHaveModifiers(exprDeclar)) {
						let mods = ts.getModifiers(exprDeclar);
						if (mods) {
							if (mods.some((m) => m.kind == ts.SyntaxKind.StaticKeyword)) {
								isStatic = true;
							}
						}
					}
					if (!isStatic) {
						if (ts.isPropertyAccessExpression(call.expression)) {
							preArgs.push(c(call.expression.expression));
						}
					}
				}
			}

			let callStr = exprSmybol.getName() + '(';
			for (let [i, arg] of call.arguments.entries()) {
				let argStr = c(arg);
				if (exprSig) {
					let p = exprSig.getTypeParameterAtPosition(i);
					if (p) {
						let translatedBase = translateType(ctx.checker, p);
						let translatedPass = translateType(ctx.checker, ctx.checker.getTypeAtLocation(arg));

						callStr += translatedBase + ' == ' + translatedPass + ',';

						if (isTranslatedTypeNameVectorOrScalar(translatedPass)) {
							if (translatedBase != translatedPass && isGLSLType(translatedBase)) {
								argStr = s([`${translatedBase}(`, argStr, `)`]);
							}
						}
					} else {
						let translatedPass = translateType(ctx.checker, ctx.checker.getTypeAtLocation(arg));

						callStr += 'any == ' + translatedPass + ',';
					}
				}

				if (ts.isArrowFunction(arg)) {
					let arrow = arg as ts.ArrowFunction;
					let vars = getClosureVars(ctx.checker, arrow.body);

					if (vars.length > 0) callArgs.push(vars.map((v) => v.escapedName).join(', '));
				} else {
					callArgs.push(argStr);
				}
			}
			callStr += ')';

			if (exprSmybol) {
				let signature = ctx.checker.getResolvedSignature(call);
				let mapping =
					findRealSignatureMappingToGLSL(ctx.checker, signature) ??
					findSignatureMappingToGLSL(ctx.checker, exprSmybol);
				if (mapping !== null) {
					if (mapping.startsWith('!')) {
						// Ensure all args are the same type (float/int)
						let minType = '';
						let noOp = false;
						for (let arg of call.arguments) {
							let argType = ctx.checker.getTypeAtLocation(arg);
							let argTypeName = translateType(ctx.checker, argType);

							if (
								!(
									argTypeName == 'float' ||
									argTypeName.startsWith('vec') ||
									argTypeName == 'int' ||
									argTypeName.startsWith('ivec') ||
									argTypeName == 'uint' ||
									argTypeName.startsWith('uvec')
								)
							) {
								noOp = true;
							}

							if (minType == '') {
								if (argTypeName == 'float' || argTypeName.startsWith('vec')) {
									minType = 'float';
								} else if (argTypeName == 'int' || argTypeName.startsWith('ivec')) {
									minType = 'int';
								} else if (argTypeName == 'uint' || minType.startsWith('uvec')) {
									minType = 'uint';
								}
							} else if (argTypeName == 'float' || minType.startsWith('vec')) {
								minType = 'float';
							}
						}

						if (!noOp) {
							for (let i = 0; i < callArgs.length; i++) {
								let arg = call.arguments[i];
								let argType = ctx.checker.getTypeAtLocation(arg);
								let argTypeName = translateType(ctx.checker, argType);
								let argTypeStripped = '';
								if (argTypeName == 'float' || argTypeName.startsWith('vec')) {
									argTypeStripped = 'float';
								} else if (argTypeName == 'int' || argTypeName.startsWith('ivec')) {
									argTypeStripped = 'int';
								} else if (argTypeName == 'uint' || argTypeName.startsWith('uvec')) {
									argTypeStripped = 'uint';
								}
								if (argTypeStripped != minType) {
									if (argTypeName.startsWith('float') || argTypeName.startsWith('int')) {
										callArgs[i] = s([`${minType}(`, callArgs[i], `)`]);
									} else if (argTypeName.startsWith('vec') || argTypeName.startsWith('ivec')) {
										let len = argTypeName.match(/\d+/)?.[0];
										if (len === undefined) {
											throw new Error('Invalid type');
										}
										callArgs[i] = s([
											`${minType == 'float' ? 'vec' : 'ivec'}${len}(`,
											callArgs[i],
											`)`
										]);
									} else {
									}
								}
							}
						}
						// This is a raw template string
						let template = mapping.slice(1);

						let outs = [];
						let argCounter = 0;
						let sig = ctx.checker.getSignatureFromDeclaration(exprSig.getDeclaration());
						for (let i = 0; i < callArgs.length; i++) {
							let paramType = ctx.checker.getTypeAtLocation(
								sig.parameters[Math.min(i, sig.parameters.length - 1)].getDeclarations()[0]
							);

							template = template.replace(
								'`' + argCounter + '`',
								ctx.checker.typeToString(paramType)
							);
							argCounter++;
						}
						let result = template.split('$');
						for (let r of result) {
							if (/^\d+$/.test(r)) {
								outs.push(callArgs[parseInt(r)]);
							} else if (r == 'self') {
								if (call.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
									let propAccess = call.expression as ts.PropertyAccessExpression;
									outs.push(c(propAccess.getChildAt(0)));
								} else {
									outs.push(c(call.expression));
								}
							} else {
								outs.push(r);
							}
						}

						if (outs.includes(' % ')) {
							if (call.arguments.length == 2) {
								// Balance the modulo operator
								let first = getVectorElementType(
									ctx.checker,
									ctx.checker.getTypeAtLocation(call.arguments[0])
								);
								let last = getVectorElementType(
									ctx.checker,
									ctx.checker.getTypeAtLocation(call.arguments[1])
								);

								if (first[1] != last[1] && last[1] == 1) {
									let mask = getVectorMask(first[1] as number);
									if (first[0] == 'float' || last[0] == 'float') {
										outs = [`mod(`, outs[1], ', ', outs[3], ')'];
									}
								}
							}
						}

						return s(outs);
					} else if (mapping.startsWith('#')) {
						// This is a function call remapping with overloads
						let typeName = '';
						if (call.arguments.length > 0) {
							let firstArg = call.arguments[0];
							let firstArgType = ctx.checker.getTypeAtLocation(firstArg);
							typeName = ctx.checker.typeToString(firstArgType);
						}

						return s([
							new SourceNode(call.expression.getStart(), call.expression.getEnd(), [
								mapping.substring(1) + typeName
							]),
							'(',

							...join([...preArgs, ...callArgs], ', '),
							')'
						]);
					} else {
						// This is a simple function name remapping
						return s([
							new SourceNode(call.expression.getStart(), call.expression.getEnd(), [mapping]),
							'(',
							...join([...preArgs, ...callArgs], ', '),
							')'
						]);
					}
				}

				if (exprSmybol.declarations[0].parent) {
					let param = exprSmybol.declarations[0];
					if (ts.isParameter(param)) {
						// We're calling an anonymous function, which means this is a composed function
					}
				}

				let funcDeclar = exprSmybol.valueDeclaration;

				if (exprSmybol.declarations[0].parent) {
					let param = exprSmybol.declarations[0];
					if (ts.isParameter(param)) {
						// We're calling an anonymous function, which means this is a composed function

						let indexOf = param.parent.parameters.indexOf(param);

						let additionalArgs = [];
						if (ctx.composed) {
							let realAnonymousFunc = ctx.composed.arguments[indexOf];
							if (ts.isArrowFunction(realAnonymousFunc)) {
								let vars = getClosureVars(ctx.checker, realAnonymousFunc.body);
								additionalArgs = vars.map((v) => v.escapedName);

								callArgs.push(...additionalArgs);

								return s([
									funcName,
									'_composed_',
									realAnonymousFunc.pos.toString(),
									'_arg_',
									indexOf.toString(),
									'(',
									...join([...preArgs, ...callArgs], ', '),
									')'
								]);
							}
						}
					}
				}

				if (
					funcDeclar &&
					(ts.isFunctionDeclaration(funcDeclar) || ts.isMethodDeclaration(funcDeclar))
				) {
					funcName = new SourceNode(
						call.expression.getStart(),
						call.expression.getEnd(),
						resolveFunctionName(funcDeclar)
					);

					let parentDeclar = closest(ast, (n) => ts.isFunctionDeclaration(n));
					if (parentDeclar && ts.isFunctionDeclaration(parentDeclar)) {
						// ctx.resolveFunction(parentDeclar, funcDeclar);
					} else {
						// ctx.resolveFunction(null, funcDeclar);
					}

					if (isComposedFunction(ctx.checker, funcDeclar)) {
						return s([
							funcName,
							'_composed_',
							call.pos.toString(),
							'(',
							...join([...preArgs, ...callArgs], ', '),
							')'
						]);
					}
				}
			}

			return s([funcName, '(', ...join([...preArgs, ...callArgs], ', '), ')']);
		case ts.SyntaxKind.NewExpression:
			let newExpr = ast as ts.NewExpression;
			let newExprSymbol = ctx.checker.getSymbolAtLocation(newExpr.expression);
			let args: SourceNode[] = [];
			if (newExpr.arguments?.length == 1 && ts.isObjectLiteralExpression(newExpr.arguments[0])) {
				let object = newExpr.arguments[0];
				let props = object.properties;
				let sortedPropsByKey = [];
				let structProps: [string, ts.TypeNode][] = [];

				newExprSymbol?.members?.forEach((v, k) => {
					let decl = v.valueDeclaration;
					if (decl && ts.isPropertyDeclaration(decl)) {
						structProps.push([k?.toString() ?? '', decl.type!]);
					}
				});

				sortedPropsByKey = structProps.sort((a, b) => {
					return a[0].localeCompare(b[0]);
				});

				args = [
					...sortedPropsByKey.map((p) => {
						let prop = props.find((p2) => {
							if (ts.isPropertyAssignment(p2)) {
								return p2.name.getText() == p[0];
							} else if (ts.isShorthandPropertyAssignment(p2)) {
								return p2.name.getText() == p[0];
							} else {
								return false;
							}
						});
						if (prop) {
							if (ts.isPropertyAssignment(prop)) {
								return s(['/* ', p[0], ': */ ', c(prop.initializer), '\n']);
							} else if (ts.isShorthandPropertyAssignment(prop)) {
								return s(['/* ', p[0], ': */ ', c(prop.name), '\n']);
							} else {
								return s(['/* ', c(prop), ': */ ', '\n']);
							}
						} else {
							return s(['/* ', p[0], ': */ ', generateDefaultForType(ctx.checker, p[1]), '\n']);
						}
					})
				];
			}

			let decl = ctx.checker.getTypeAtLocation(newExpr.expression).getSymbol()?.getDeclarations();
			if (decl && ts.isClassDeclaration(decl[0])) {
				return s(['_make_struct_', resolveStructName(decl[0]), '(\n', ...join(args, ', '), '\n)']);
			} else {
				return s(['/*', ...join(args, ', '), '*/']);
			}
		case ts.SyntaxKind.ExpressionStatement:
			let expr = ast as ts.ExpressionStatement;
			return s([c(expr.expression), ';\n']);
		case ts.SyntaxKind.ObjectLiteralExpression:
			let obj = ast as ts.ObjectLiteralExpression;
			return s([
				'{',
				...join(
					obj.properties.map((p) => {
						if (ts.isPropertyAssignment(p)) {
							return s([c(p.name), ': ', c(p.initializer)]);
						} else if (ts.isShorthandPropertyAssignment(p)) {
							return s([c(p.name)]);
						} else {
							return s(['/*', c(p), '*/']);
						}
					}),
					', '
				),
				'}'
			]);

		case ts.SyntaxKind.ConditionalExpression:
			let cond = ast as ts.ConditionalExpression;
			return s([c(cond.condition), ' ? ', c(cond.whenTrue), ' : ', c(cond.whenFalse)]);

		case ts.SyntaxKind.Identifier:
			let id = ast as ts.Identifier;
			if (ts.isIdentifier(id)) {
				let sym = ctx.checker.getSymbolAtLocation(id);
				if (sym && sym.flags & ts.SymbolFlags.Alias) {
					sym = ctx.checker.getAliasedSymbol(sym);
				}

				if (sym?.declarations?.length == 1) {
					let decl = sym.declarations[0];
					if (isUniformable(ctx.checker, decl)) {
						if (isVariableDeclarationValue(ctx.checker, decl)) {
							if (!isInSameScope(decl, ast)) {
								if (!isInShader(decl)) {
									// If the variable is on the left side of an assignment we need to error
									if (ts.isBinaryExpression(ast.parent)) {
										if (ast.parent.left == ast) {
											throw new GLSLCompilationError(
												`Cannot assign to variable '${id.text.toString()}' because it is not declared in the shader`,
												ast
											);
										}
									}
									let isGlobalVar = isRootNode(decl);
									let glslVarName = `_ext_uniform_${
										isGlobalVar ? 'global' : 'local'
									}_${id.text.toString()}`;
									return s([glslVarName]);
								} else {
									return s([escapeIdentifier(id.text.toString())]);
								}
							}
						}
					}
				}

				return s([escapeIdentifier(id.text.toString())]);
			} else {
				return c((id as any).expression);
			}
		case ts.SyntaxKind.PropertyAccessExpression:
			let prop = ast as ts.PropertyAccessExpression;
			let isStaticMember = isStaticPropertyAccessExpression(ctx.checker, prop);

			if (isStaticMember) {
				return s([c(prop.expression), '_static_', c(prop.name)]);
			} else {
				let propName = prop.name.getText();
				if (propName == '__index') {
					return s([c(prop.expression)]);
				} else if (propName == 'size') {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(prop.expression)
					);

					if (innerType == 'sampler2D') {
						return s([c(prop.expression), '_', propName]);
					}
				} else {
					return s([c(prop.expression), '.', c(prop.name)]);
				}
			}
		case ts.SyntaxKind.ThisKeyword:
			return s(['_this']);
		case ts.SyntaxKind.FirstLiteralToken:
			let lit = ast as ts.LiteralExpression;
			return s([lit.text]);
		case ts.SyntaxKind.IfStatement:
			let ifStmt = ast as ts.IfStatement;
			if (isIdentifier(ifStmt.expression)) {
				if (ifStmt.expression.escapedText == 'PLATFORM_WEBGL') {
					return s([c(ifStmt.thenStatement)]);
				}
				if (ifStmt.expression.escapedText == 'PLATFORM_WEBGPU') {
					if (ifStmt.elseStatement) {
						return s([c(ifStmt.elseStatement)]);
					} else {
						return s(['']);
					}
				}
			}
			return s([
				'if (',
				c(ifStmt.expression),
				')',
				c(ifStmt.thenStatement),
				ifStmt.elseStatement ? s(['else \n', c(ifStmt.elseStatement), '\n']) : s([''])
			]);
		case ts.SyntaxKind.TrueKeyword:
			return s(['true']);
		case ts.SyntaxKind.FalseKeyword:
			return s(['false']);
		case ts.SyntaxKind.PostfixUnaryExpression:
			let post = ast as ts.PostfixUnaryExpression;
			return s([c(post.operand), post.operator == ts.SyntaxKind.PlusPlusToken ? '++' : '--']);
		case ts.SyntaxKind.PlusPlusToken:
			return s(['++']);
		case ts.SyntaxKind.MinusMinusToken:
			return s(['--']);
		case ts.SyntaxKind.ParenthesizedExpression:
			let paren = ast as ts.ParenthesizedExpression;
			return s(['(', c(paren.expression), ')']);
		case ts.SyntaxKind.VariableDeclarationList:
			let varDeclList = ast as ts.VariableDeclarationList;
			if (varDeclList.declarations.length > 0) {
				for (let decl of varDeclList.declarations) {
					let varDecl = decl as ts.VariableDeclaration;
					let type = ctx.checker.getTypeAtLocation(varDecl);

					return s([
						translateType(ctx.checker, type),
						' ',
						varDecl.name.getText(),
						' = ',
						c(varDecl.initializer!)
					]);
				}
			} else {
				return s(['']);
			}

		// throw new GLSLCompilationError(
		// 	`Cannot define declaration list in shaders, ` + ast.getFullText(),
		// 	ast
		// );

		case ts.SyntaxKind.ForStatement:
			let forStmt = ast as ts.ForStatement;

			return s([
				'for (',
				c(forStmt.initializer),
				';',
				c(forStmt.condition),
				';',
				c(forStmt.incrementor),
				')',
				c(forStmt.statement)
			]);
		case ts.SyntaxKind.BinaryExpression:
			let bin = ast as ts.BinaryExpression;
			if (bin.operatorToken.kind == ts.SyntaxKind.EqualsToken) {
				// Check for float/int casting
				let leftType = ctx.checker.getTypeAtLocation(bin.left);
				let rightType = ctx.checker.getTypeAtLocation(bin.right);
				if (isVector(ctx.checker, leftType) && isVector(ctx.checker, rightType)) {
					// debugger;
					let [leftElementType, leftElementSize] = getVectorElementType(ctx.checker, leftType);
					let [rightElementType, rightElementSize] = getVectorElementType(ctx.checker, rightType);

					if (leftElementType != rightElementType) {
						if (leftElementType == 'float' && rightElementType == 'int') {
							return s([c(bin.left), ` = vec${leftElementSize}(`, c(bin.right), ')']);
						} else if (leftElementType == 'int' && rightElementType == 'float') {
							return s([c(bin.left), ` = ivec${leftElementSize}(`, c(bin.right), ')']);
						}
					}
				}

				return s([c(bin.left), ' = ', c(bin.right)]);
			}
			let binExprText = bin.operatorToken.getText();
			if (binExprText == '===') {
				binExprText = '==';
			}
			return s([c(bin.left), ' ', binExprText, ' ', c(bin.right)]);
		case ts.SyntaxKind.StringLiteral:
			return s(['0']);
		case ts.SyntaxKind.ArrayLiteralExpression:
			let arr = ast as ts.ArrayLiteralExpression;
			return s([
				'[',
				...join(
					arr.elements.map((e) => c(e)),
					', '
				),
				']'
			]);
		case ts.SyntaxKind.ElementAccessExpression:
			let elem = ast as ts.ElementAccessExpression;
			return s([c(elem.expression), '[', c(elem.argumentExpression), ']']);

		case ts.SyntaxKind.Block:
			let block = ast as ts.Block;
			return s([
				'{\n',
				...join(
					block.statements.map((child) => c(child)),
					';'
				),
				'\n}'
			]);
		case ts.SyntaxKind.TypeOfExpression:
			let typeOf = ast as ts.TypeOfExpression;
			return s(['0']);
		case ts.SyntaxKind.WhileStatement:
			let whileStmt = ast as ts.WhileStatement;
			return s(['while (', c(whileStmt.expression), ') ', c(whileStmt.statement)]);
		default:
			throw new GLSLCompilationError(`Invalid shader syntax '${ast.getText()}'`, ast);
	}
}

function getClosureVars(checker: ts.TypeChecker, func: ts.ConciseBody) {
	let result: ts.Symbol[] = [];
	let recur = (node: ts.Node) => {
		if (node.kind == ts.SyntaxKind.Identifier) {
			let id = node as ts.Identifier;
			let symbol = checker.getSymbolAtLocation(id);
			let declar = symbol.valueDeclaration;
			if (isVariableDeclarationValue(checker, declar)) {
				if (declar) {
					if (!isInSameScope(declar, node) && isInShader(declar)) {
						result.push(symbol);
					}
				}
			}
		} else {
			node.forEachChild(recur);
		}
	};
	recur(func);
	return result;
}

function getDeclarationType(
	checker: ts.TypeChecker,
	node: ts.VariableDeclaration | ts.ParameterDeclaration
) {
	return node.type
		? checker.getTypeAtLocation(node.type)
		: node.initializer
		? checker.getTypeAtLocation(node.initializer)
		: checker.getTypeAtLocation(node);
}

function tsIsStatement(node: ts.Node) {
	return [
		ts.SyntaxKind.DoStatement,
		ts.SyntaxKind.IfStatement,
		ts.SyntaxKind.TryStatement,
		ts.SyntaxKind.ForStatement,
		ts.SyntaxKind.LastStatement,
		ts.SyntaxKind.ThrowStatement,
		ts.SyntaxKind.FirstStatement,
		ts.SyntaxKind.WhileStatement,
		ts.SyntaxKind.WithStatement,
		ts.SyntaxKind.ForInStatement,
		ts.SyntaxKind.ForOfStatement,
		ts.SyntaxKind.BreakStatement,
		ts.SyntaxKind.ContinueStatement,
		ts.SyntaxKind.ReturnStatement,
		ts.SyntaxKind.SwitchStatement,
		ts.SyntaxKind.VariableStatement,
		ts.SyntaxKind.ExpressionStatement,
		ts.SyntaxKind.DebuggerStatement,
		ts.SyntaxKind.EmptyStatement,
		ts.SyntaxKind.LabeledStatement,
		ts.SyntaxKind.ExpressionStatement
	].includes(node.kind);
}

export class GLSLShader {
	key: string;
	source: string;
	sourceMapping?: IndexMapping;
	globals: { [key: string]: { fileName: string; structure: any } } = {};
	locals: { [key: string]: any } = {};

	constructor(key: string, source: string) {
		this.key = key;
		this.source = source;
	}
}

function resolveFunctionName(f: ts.FunctionDeclaration | ts.MethodDeclaration) {
	if (ts.isMethodDeclaration(f)) {
		let parentName = 'anon';
		if (f.parent && ts.isClassDeclaration(f.parent)) {
			parentName = f.parent.name?.text ?? 'anon';
		}
		return removeDoubleUnderscores(
			`fn_${
				f.getSourceFile()?.fileName.replaceAll('/', '_').replaceAll('.', '_') ?? 'anon'
			}_${f.getStart()}_${parentName}_static_${f.name.getText() ?? 'unknown'}`
		);
	} else {
		return removeDoubleUnderscores(
			`fn_${f.getSourceFile().fileName.replaceAll('/', '_').replaceAll('.', '_')}_${f.getStart()}_${
				f.name?.text.replaceAll('.', '_dot_') ?? 'unknown'
			}`
		);
	}
}

function resolveStructName(c: ts.ClassDeclaration) {
	// These are special names that we need to preserve
	if (c.name?.text == 'ShaderInput') return 'ShaderInput';
	if (c.name?.text == 'ShaderOutput') return 'ShaderOutput';

	return removeDoubleUnderscores(
		`str_${c.getSourceFile().fileName.replaceAll('/', '_').replaceAll('.', '_')}_${c.getStart()}_${
			c.name?.text ?? 'unknown'
		}`.replaceAll('__', '_i_')
	);
}

function isInSameScope(node: ts.Node, other: ts.Node) {
	return (
		closest(node, (node) => {
			if (
				ts.isFunctionDeclaration(node) ||
				ts.isArrowFunction(node) ||
				ts.isMethodDeclaration(node)
			) {
				return true;
			}

			if (ts.isSourceFile(node)) {
				return true;
			}
		}) ==
		closest(other, (node) => {
			if (
				ts.isFunctionDeclaration(node) ||
				ts.isArrowFunction(node) ||
				ts.isMethodDeclaration(node)
			) {
				return true;
			}

			if (ts.isSourceFile(node)) {
				return true;
			}
		})
	);
}

function isInShader(node: ts.Node) {
	return closest(node, (node) => {
		if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
			if (hasShadeupDocTag(node, 'shader')) {
				return true;
			}
		}

		return false;
	});
}

/**
 * Returns true if this node is a root of the source file (i.e. has no function as its parent)
 */
function isRootNode(node: ts.Node) {
	let parentRoot = closest(node, (node) => {
		if (
			ts.isMethodDeclaration(node) ||
			ts.isFunctionDeclaration(node) ||
			ts.isArrowFunction(node)
		) {
			return true;
		}

		if (ts.isSourceFile(node)) {
			return true;
		}
	});

	return parentRoot && ts.isSourceFile(parentRoot);
}

type DepsTable = {
	graph: Map<string, string[]>;
	functions: Map<string, ts.FunctionDeclaration | ts.MethodDeclaration>;
	structs: Map<string, ts.ClassDeclaration>;
	structsProps: Map<string, Set<string>>;
	globals: Map<string, ts.VariableDeclaration>;
	composed: Map<string, ts.CallExpression>;
};

const primitiveNames = [
	'int',
	'uint',
	'uint8',
	'float',
	'bool',
	'int2',
	'int3',
	'int4',
	'uint2',
	'uint3',
	'uint4',
	'float2',
	'float3',
	'float4',
	'float2x2',
	'float3x3',
	'float4x4',
	'string',
	'texture2d'
];

function isPrimitiveType(type: ts.Type) {
	let name = type.getSymbol()?.getName();
	return primitiveNames.includes(name);
}

function isComposedFunction(
	checker: ts.TypeChecker,
	func: ts.FunctionDeclaration | ts.MethodDeclaration
) {
	// A composed function is one that accepts one or more functions as arguments
	let isComposed = false;
	func.parameters.forEach((param) => {
		let type = checker.getTypeAtLocation(param);
		if (type.getCallSignatures().length > 0) {
			isComposed = true;
		}
	});

	return isComposed;
}

function resolveDeps(
	checker: ts.TypeChecker,
	root: ts.Node,
	table: DepsTable = {
		graph: new Map(),
		functions: new Map(),
		structs: new Map(),
		structsProps: new Map(),
		globals: new Map(),
		composed: new Map()
	}
): DepsTable {
	function resolveFunction(
		f1: ts.FunctionDeclaration | ts.MethodDeclaration | null,
		f2: ts.FunctionDeclaration | ts.MethodDeclaration,
		call: ts.CallExpression
	) {
		let n1 = f1 ? resolveFunctionName(f1) : 'main';
		let n2 = resolveFunctionName(f2);
		if (
			f2.name?.getText() === '__index' ||
			f2.name?.getText() === '__index_assign' ||
			f2.name?.getText() === '__index_assign_op' ||
			f2.name?.getText() === 'len' ||
			f2.name?.getText() === 'sample' ||
			hasShadeupDocTag(f2, 'noemit_gpu')
		)
			return;
		if (isComposedFunction(checker, f2)) {
			n2 = n2 + '_composed_' + call.pos;
			table.composed.set(n2, call);
		}

		let deps = table.graph.get(n1) ?? [];
		if (!deps.includes(n2)) deps.push(n2);
		table.graph.set(n1, deps);

		table.functions.set(n2, f2);
	}

	function resolveStruct(decl: ts.ClassDeclaration) {
		let name = resolveStructName(decl);

		if (table.structs.has(name)) return;

		for (let member of decl.members) {
			if (ts.isPropertyDeclaration(member)) {
				let type = checker.getTypeAtLocation(member);
				resolveTypeUse(type, member);
			}
		}

		table.structs.set(name, decl);
	}

	function isValidShaderType(type: ts.Type, checker: ts.TypeChecker) {
		let symbol = type.aliasSymbol || type.getSymbol();
		let name = checker.typeToString(type);

		let bases = type.getBaseTypes();
		if (bases && bases.length > 0) {
			for (let base of bases) {
				if (!isValidShaderType(base, checker)) return false;
			}
		}
		if (TYPE_BLACKLIST.includes(symbol?.getName() ?? '')) {
			return false;
		}
		return !TYPE_BLACKLIST.includes(name);
	}

	function resolveTypeUse(typeNode: ts.Type, context: ts.Node, fullStruct: boolean = false) {
		let symbol = typeNode.aliasSymbol || typeNode.getSymbol();
		let name = checker.typeToString(typeNode);

		if (!isValidShaderType(typeNode, checker)) {
			throw new GLSLCompilationError(`Type '${name}' is not supported in shaders`, context);
			return;
		}
		let decl = symbol?.getDeclarations()?.[0];
		if (decl && ts.isClassDeclaration(decl)) {
			resolveStruct(decl);
		}
		let typestr = checker.typeToString(typeNode);
		if (typeNode.aliasTypeArguments)
			for (let args of typeNode.aliasTypeArguments) {
				resolveTypeUse(args, context, typestr.startsWith('buffer<'));
			}
	}

	function resolvePropertyAccess(node: ts.PropertyAccessExpression) {
		let typeNode = checker.getTypeAtLocation(node.expression);
		let symbol = typeNode.aliasSymbol || typeNode.getSymbol();
		let name = checker.typeToString(typeNode);
		// if (!isPrimitiveType(typeNode)) {
		if (!isValidShaderType(typeNode, checker)) {
			throw new GLSLCompilationError(
				`Type '${symbol?.getName()}' is not supported in shaders`,
				node
			);
			return;
		}

		resolveTypeUse(typeNode, node);
		resolveTypeUse(checker.getTypeAtLocation(node), node);

		let prop = node.name.getText();

		let decl = symbol?.getDeclarations()?.[0];
		if (decl && ts.isClassDeclaration(decl)) {
			let name = resolveStructName(decl);
			let props = table.structsProps.get(name) ?? new Set();
			props.add(prop);
			table.structsProps.set(name, props);
		}
		// }
	}

	walkNodes(root, (node) => {
		if (ts.isCallExpression(node)) {
			let exprSmybol = checker.getSymbolAtLocation(node.expression);
			if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
				exprSmybol = checker.getAliasedSymbol(exprSmybol);
			}
			if (exprSmybol) {
				let funcDeclar = exprSmybol.getDeclarations()?.[0];
				let funcDeclarVal = exprSmybol.valueDeclaration;

				if (
					funcDeclar &&
					(ts.isFunctionDeclaration(funcDeclar) || ts.isMethodDeclaration(funcDeclar))
				) {
					let signature = checker.getResolvedSignature(node);
					let mapping =
						findRealSignatureMappingToGLSL(checker, signature) ??
						findSignatureMappingToGLSL(checker, exprSmybol);

					if (mapping === null) {
						let parentDeclar = closest(
							node,
							(n) =>
								ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isArrowFunction(n)
						);
						if (parentDeclar && ts.isArrowFunction(parentDeclar)) {
							// Arrow functions need their parent caller to be resolved

							let parentParentDeclar = closest(parentDeclar, (n) => ts.isCallExpression(n));
							if (parentParentDeclar && ts.isCallExpression(parentParentDeclar)) {
								let parentParentSymbol = checker.getSymbolAtLocation(parentParentDeclar.expression);
								if (parentParentSymbol && parentParentSymbol.flags & ts.SymbolFlags.Alias) {
									parentParentSymbol = checker.getAliasedSymbol(parentParentSymbol);
								}
								if (parentParentSymbol) {
									let parentParentFuncDeclar = parentParentSymbol.getDeclarations()?.[0];
									if (
										parentParentFuncDeclar &&
										(ts.isFunctionDeclaration(parentParentFuncDeclar) ||
											ts.isMethodDeclaration(parentParentFuncDeclar))
									) {
										resolveFunction(parentParentFuncDeclar, funcDeclar, node);
									}
								}
							}
						} else if (
							parentDeclar &&
							(ts.isFunctionDeclaration(parentDeclar) || ts.isMethodDeclaration(parentDeclar))
						) {
							resolveFunction(parentDeclar, funcDeclar, node);
						} else {
							resolveFunction(null, funcDeclar, node);
						}

						if (!table.graph.has(resolveFunctionName(funcDeclar))) {
							table.graph.set(resolveFunctionName(funcDeclar), []);
							resolveDeps(checker, funcDeclar, table);
						}

						let sig = checker.getSignatureFromDeclaration(funcDeclar);
						let returnType = checker.getReturnTypeOfSignature(sig);

						resolveTypeUse(returnType, node);
					}
				}
			}
		}

		if (ts.isPropertyAccessExpression(node)) {
			resolvePropertyAccess(node);
		}

		if (ts.isIdentifier(node)) {
			if (checker.getSymbolAtLocation(node)) {
				let decl = checker.getSymbolAtLocation(node)?.declarations;

				let type = checker.getTypeAtLocation(node);
				resolveTypeUse(type, node);

				if (decl && ts.isVariableDeclaration(decl[0])) {
					if (
						!isInSameScope(decl[0], node) &&
						decl[0].getSourceFile().fileName !== root.getSourceFile().fileName
					) {
						if (isVariableDeclarationValue(checker, decl[0])) {
							table.globals.set(node.text.toString(), decl[0]);
						}
					}
				}
			}
		}

		if (ts.isVariableDeclaration(node)) {
			let type = checker.getTypeAtLocation(node);
			resolveTypeUse(type, node);
		}
	});

	return table;
}

function resolveUniforms(checker: ts.TypeChecker, root: ts.Node) {
	let uniforms: ts.Declaration[] = [];

	walkNodesWithCalls(checker, root, (node) => {
		if (ts.isIdentifier(node)) {
			let decl = checker.getSymbolAtLocation(node);
			if (decl && decl.flags & ts.SymbolFlags.Alias) {
				decl = checker.getAliasedSymbol(decl);
			}

			if (decl && decl.declarations && decl.declarations.length == 1) {
				let declNode = decl.declarations[0];
				if (declNode) {
					if (isVariableDeclarationValue(checker, declNode)) {
						if (!isInSameScope(declNode, node) && !isInShader(declNode)) {
							if (uniforms.findIndex((d) => d === declNode) == -1) uniforms.push(declNode);
						}
					}
				}
			}
		}
	});

	return uniforms;
}

function isVariableDeclarationValue(checker: ts.TypeChecker, node: ts.Node): boolean {
	try {
		if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
			let type = checker.getTypeAtLocation(node);
			let calls = type.getCallSignatures();

			return calls.length == 0;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
}

function isUniformable(
	checker: ts.TypeChecker,
	decl: ts.Declaration
): decl is ts.VariableDeclaration | ts.ParameterDeclaration {
	let exprSmybol = checker.getSymbolAtLocation(decl);
	if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
		exprSmybol = checker.getAliasedSymbol(exprSmybol);
	}

	if (exprSmybol) {
		let originalDecl = exprSmybol.getDeclarations()?.[0];
	}
	return ts.isVariableDeclaration(decl) || ts.isParameter(decl);
}

export function addGLSLShader(
	key: string,
	root: ts.Node,
	checker: ts.TypeChecker,
	env: ShadeupEnvironment,
	isComputeShader: boolean = false,
	computeShaderSize: [number, number, number] = [1, 1, 1]
): GLSLShader | null {
	let deps = resolveDeps(checker, root);
	let uniforms = resolveUniforms(checker, root);

	let mapping = [...deps.graph.entries()]
		.map(([k, v]) => v.map((d) => [k, d] as [string, string]))
		.flat();

	let sorted: string[] = [];
	try {
		sorted = toposort(mapping).reverse();
	} catch (e) {
		// Cycle detected

		sorted = [];
	}

	let preFuncs: SourceNode[] = [];

	for (let s of deps.structs.values()) {
		let name = resolveStructName(s);
		let hasAnyProperty = false;
		let sp = deps.structsProps.get(name);

		let members = s.members.map((m) => {
			if (!ts.isPropertyDeclaration(m)) return '';

			let type = checker.getTypeAtLocation(m);
			let translated = translateType(checker, type);
			let preComment = '';

			if (!sp || !sp.has(m.name.getText())) {
				if (name != 'ShaderInput' && name != 'ShaderOutput') {
					preComment = `// `;
				}
			}
			if (preComment == '') {
				hasAnyProperty = true;
			}
			return new SourceNode(
				m.getStart(),
				m.getEnd(),
				`${preComment}  ${translated} ${m.name.getText()};\n`
			);
		});

		let memberNames = s.members
			.map((m) => {
				if (!ts.isPropertyDeclaration(m)) return '';

				let type = checker.getTypeAtLocation(m);

				if (!sp || !sp.has(m.name.getText())) {
					if (name != 'ShaderInput' && name != 'ShaderOutput') {
						return '';
					}
				}
				return m.name.getText();
			})
			.filter((m) => m != '');
		let memberParams = s.members
			.map((m) => {
				if (!ts.isPropertyDeclaration(m)) return '';

				let type = checker.getTypeAtLocation(m);
				let translated = translateType(checker, type);

				if (!sp || !sp.has(m.name.getText())) {
					if (name != 'ShaderInput' && name != 'ShaderOutput') {
						return '';
					}
				}
				return translated + ' ' + m.name.getText();
			})
			.filter((m) => m != '');

		if (!hasAnyProperty) continue; // Don't emit empty structs (glsl error)

		preFuncs.push(
			new SourceNode(s.getStart(), s.getEnd(), [`struct ${name} {\n`, ...members, '\n};\n'])
		);
		if (name != 'ShaderInput' && name != 'ShaderOutput') {
			preFuncs.push(
				new SourceNode(s.getStart(), s.getEnd(), [
					name + ' _make_struct_' + name + '(',
					memberParams.join(', ') + ')',
					' {\n',
					name,
					' _s;',
					'',
					...memberNames.map((m) => `  _s.${m} = ${m};\n`),
					'  return _s;\n',
					'}\n'
				])
			);
		}
	}

	for (let u of uniforms) {
		if (isUniformable(checker, u)) {
			let _type = checker.getTypeAtLocation(u);
			let translated = translateType(checker, _type);
			let isGlobalVar = isRootNode(u);
			let glslVarName = `_ext_uniform_${isGlobalVar ? 'global' : 'local'}_${u.name.getText()}`;
			if (translated.includes('[]')) {
				translated = translated.replace(/\[\]$/, ``);
				preFuncs.push(
					new SourceNode(u.getStart(), u.getEnd(), [
						'uniform ',
						'int',
						' ',
						glslVarName,
						'_size;\n'
					])
				);
				glslVarName += `[%${glslVarName}_size%]`;
			}
			preFuncs.push(
				new SourceNode(u.getStart(), u.getEnd(), ['uniform ', translated, ' ', glslVarName, ';\n'])
			);
			if (translated == 'sampler2D') {
				preFuncs.push(
					new SourceNode(u.getStart(), u.getEnd(), ['uniform vec2 ', glslVarName, '_size;\n'])
				);
			}
		}
	}

	for (let k of sorted) {
		if (k == 'main') continue;

		let v = deps.functions.get(k);
		if (v) {
			let sourceFile = v.getSourceFile();
			let originalFile = env.files.find((f) => f.path == sourceFile.fileName);
			preFuncs.push(
				compile(
					{ parentFunction: v, checker, composed: deps.composed.get(k) ?? null },
					v,
					originalFile?.mapping
				)
			);
		}
	}

	let sourceFile = root.getSourceFile();
	let originalFile = env.files.find((f) => f.path == sourceFile?.fileName);
	let main = compile(
		{
			checker
		},
		root,
		originalFile.mapping
	);

	preFuncs.push(main);

	let source = new SourceNode(root.getStart(), root.getEnd(), preFuncs);

	let ss = { indexMapping: [], str: '' };

	source.toString(ss);

	let matches = glslHeader.match(/^([a-zA-Z_][a-zA-Z0-9_]+ [^\(]+)/gm);

	let finalShaderOutput = ss.str;

	let headerSplits = [];

	for (let i = 0; i < matches.length; i++) {
		let index = glslHeader.indexOf(matches[i]);
		let toIndex = i == matches.length - 1 ? glslHeader.length : glslHeader.indexOf(matches[i + 1]);
		headerSplits.push(glslHeader.substring(index, toIndex));
	}

	let realHeader = '';
	for (let i = 0; i < headerSplits.length; i++) {
		let headerText = headerSplits[i];
		let fnName = headerText.match(/^[a-zA-Z_][a-zA-Z0-9_]+ ([^\(]+)/)?.[1];

		if (fnName) {
			if (finalShaderOutput.includes(fnName)) {
				realHeader += headerText;
			}
		}
	}

	finalShaderOutput = realHeader + finalShaderOutput;

	let output = new GLSLShader(`shd_${key}`, finalShaderOutput);
	output.sourceMapping = ss.indexMapping;

	for (let u of uniforms) {
		if (isUniformable(checker, u)) {
			let name = u.name.getText();
			let isGlobalVar = isRootNode(u);
			if (name) {
				let typeOut = getDeclarationType(checker, u);
				let typeNode = checker.getTypeAtLocation(u);
				let symbol = typeNode.aliasSymbol || typeNode.getSymbol();

				let decl = symbol?.getDeclarations()?.[0];
				let realName = '';
				if (decl && ts.isClassDeclaration(decl)) {
					realName = resolveStructName(decl);
				}

				function filterProps(props: any) {
					if (props && props.name) {
						let sp = deps.structsProps.get(props.name);
						let realStruct = deps.structs.get(props.name);
						if (props.type == 'struct' && realStruct) {
							for (let f of Object.keys(props.fields)) {
								if (!sp || !sp.has(f)) {
									delete props.fields[f];
								} else {
									if (props.fields[f].type == 'struct') {
										props.fields[f] = filterProps(props.fields[f]);
									}
								}
							}
						}
					}
					return props;
				}

				if (isGlobalVar) {
					output.globals[name] = {
						fileName: getNodeSourceFileName(u),
						structure: filterProps(translateType(checker, typeOut, true))
					};
				} else {
					output.locals[name] = filterProps(translateType(checker, typeOut, true));
				}
			}
		}
	}

	return output;
}

function getNodeSourceFileName(node: ts.Node) {
	let found = closest(node, (n) => ts.isSourceFile(n));

	if (found && ts.isSourceFile(found)) {
		return found.fileName;
	} else {
		return '';
	}
}

function walkNodes(node: ts.Node, cb: (node: ts.Node) => void) {
	cb(node);
	node.forEachChild((n) => walkNodes(n, cb));
}

function walkNodesWithCalls(checker: ts.TypeChecker, node: ts.Node, cb: (node: ts.Node) => void) {
	cb(node);
	node.forEachChild((n) => {
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
					let signature = checker.getResolvedSignature(node);
					let mapping =
						findRealSignatureMappingToGLSL(checker, signature) ??
						findSignatureMappingToGLSL(checker, exprSmybol);
					if (mapping === null) {
						if (funcDeclar.body) {
							walkNodesWithCalls(checker, funcDeclar.body, cb);
						}
					}
				}
			}
		}

		walkNodesWithCalls(checker, n, cb);
	});
}

/**
 * Looks for any doc comments that instruct the translator to map a js function to a glsl function
 */
function findSignatureMappingToGLSL(checker: ts.TypeChecker, sym: ts.Symbol) {
	let matcher = /=(?:glsl|univ)\((.+)\)$/g;

	if (!sym.valueDeclaration) return null;
	let doc = ts.getJSDocTags(sym.valueDeclaration);

	for (let d of doc) {
		if (d.tagName.text !== 'shadeup') continue;

		if (typeof d.comment === 'string') {
			let matches = matcher.exec(d.comment);
			if (matches) {
				return matches[1];
			}
		}
	}
	return null;
}
function findRealSignatureMappingToGLSL(checker: ts.TypeChecker, sig: ts.Signature) {
	let matcher = /=(?:glsl|univ)\((.+)\)$/g;

	let doc = ts.getJSDocTags(sig.getDeclaration());

	for (let d of doc) {
		if (d.tagName.text !== 'shadeup') continue;

		if (typeof d.comment === 'string') {
			let matches = matcher.exec(d.comment);
			if (matches) {
				return matches[1];
			}
		}
	}
	return null;
}

function removeDoubleUnderscores(str: string) {
	return str.replace(/__/g, '_ii');
}
