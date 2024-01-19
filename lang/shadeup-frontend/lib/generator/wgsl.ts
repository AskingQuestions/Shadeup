import ts from 'typescript';
let {
	factory,
	isArrayTypeNode,
	isCallExpression,
	isIdentifier,
	isPropertyAccessChain,
	isPropertyAccessExpression
} = ts;
import { TSVisitMapper } from './tsWalk';

import toposort from './toposort';
import {
	IndexMapping,
	lookupIndexMappingRange,
	reverseLookupIndexMapping,
	reverseLookupIndexMappingRange,
	SourceNode
} from './root';

import wgslHeader from './header.wgsl?raw';
import {
	hasShadeupDocTag,
	hasWorkgroupDocTag,
	ShadeupEnvironment
} from '../environment/ShadeupEnvironment';
import { closest, resolveNodeName } from './util';
import { isStaticPropertyAccessExpression } from '../environment/validate';
import { isTupleType, isBooleanLiteralType } from 'tsutils';
import { GLSLCompilationError } from './glsl';

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

const RESERVED_WORDS = [
	'this',
	'target',
	'attribute',
	'sample',
	'varying',
	'uniform',
	'layout',
	'delete'
];

function generateDefaultForType(checker: ts.TypeChecker, _type_node: ts.TypeNode) {
	let _type = checker.getTypeFromTypeNode(_type_node);
	let name = (_type.aliasSymbol || _type.getSymbol())?.escapedName.toString();
	switch (name) {
		case 'int':
			return 'i32(0)';
		case 'float':
			return 'f32(0.0)';
		case 'float2':
			return 'vec2<f32>(0.0, 0.0)';
		case 'float3':
			return 'vec3<f32>(0.0, 0.0, 0.0)';
		case 'float4':
			return 'vec4<f32>(0.0, 0.0, 0.0, 0.0)';
		case 'int2':
			return 'vec2<i32>(0, 0)';
		case 'int3':
			return 'vec3<i32>(0, 0, 0)';
		case 'int4':
			return 'vec4<i32>(0, 0, 0, 0)';
		case 'uint':
			return 'u32(0)';
		case 'uint2':
			return 'vec2<u32>(0, 0)';
		case 'uint3':
			return 'vec3<u32>(0, 0, 0)';
		case 'uint4':
			return 'vec4<u32>(0, 0, 0, 0)';
		case 'float2x2':
			return 'mat2x2<f32>(0.0, 0.0, 0.0, 0.0)';
		case 'float3x3':
			return 'mat3x3<f32>(0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0)';
		case 'float4x4':
			return 'mat4x4<f32>(0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0)';
		case 'bool':
			return '0';
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

export function getArrayTypeInfo(checker: ts.TypeChecker, t: ts.Type) {
	let n = getTypeFallback(checker, t);

	let originalType = t;
	if (n === undefined) {
		t = followTypeReferences(t);
	}

	let isArray = false;
	let staticSize = -1;
	let elementType = '';

	if (
		n === 'Array' ||
		(t.flags & ts.TypeFlags.Object &&
			((t as any).objectFlags & ts.ObjectFlags.Tuple ||
				(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
				(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
	) {
		let typeRef = originalType as ts.TypeReference;

		let args = typeRef.typeArguments || checker.getTypeArguments(typeRef);
		let translated = translateType(checker, args[0]);

		let typeInfo = getWGSLTypeInfo(translated);

		if (isTupleType(t)) {
			staticSize = t.fixedLength;
		}

		let toStringed = checker.typeToString(typeRef);

		isArray = true;

		elementType = translated;
	}

	return {
		isArray,
		staticSize,
		elementType
	};
}

export function translateType(
	checker: ts.TypeChecker,
	t: ts.Type,
	templateFormat = false,
	usedInsidePotentiallyExternalType = false
) {
	let n = getTypeFallback(checker, t);

	let originalType = t;
	if (n === undefined) {
		t = followTypeReferences(t);
	}
	if (templateFormat) {
		let name = n?.toString() ?? 'unknown';

		if (
			name === 'Array' ||
			name === 'array' ||
			name === 'buffer' ||
			(t.flags & ts.TypeFlags.Object &&
				((t as any).objectFlags & ts.ObjectFlags.Tuple ||
					(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
					(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
		) {
			let typeRef = originalType as ts.TypeReference;

			let args = typeRef.typeArguments || checker.getTypeArguments(typeRef);
			return {
				type: name == 'buffer' ? 'buffer' : 'array',
				element: translateType(checker, args[0], true),
				staticSize: args.length
			};
		}

		if (name == 'boolean' || name == 'false' || name == 'true') name = 'bool';

		if (
			name.startsWith('float') ||
			name.startsWith('int') ||
			name.startsWith('uint') ||
			name == 'bool' ||
			name == 'texture2d' ||
			name == 'texture3d'
		)
			return { type: 'primitive', name };

		if (name == 'atomic') {
			let args =
				(t as ts.TypeReference).typeArguments || checker.getTypeArguments(t as ts.TypeReference);
			let translated = translateType(checker, args[0]);
			return { type: 'primitive', name, element: translated };
		}

		let symbol = t.aliasSymbol || t.getSymbol();
		if (symbol && symbol.declarations && symbol.declarations.length > 0) {
			if (ts.isClassDeclaration(symbol.declarations[0])) {
				let fields: UniformKeyValuePair[] = [];
				let decl = symbol.declarations[0] as ts.ClassDeclaration;
				for (let member of decl.members) {
					if (ts.isPropertyDeclaration(member)) {
						let name = member.name.getText();
						let type = checker.getTypeFromTypeNode(member.type!);
						fields.push([name, translateType(checker, type, true)]);
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
			n === 'array' ||
			n === 'buffer' ||
			(t.flags & ts.TypeFlags.Object &&
				((t as any).objectFlags & ts.ObjectFlags.Tuple ||
					(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
					(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
		) {
			let typeRef = originalType as ts.TypeReference;

			let args = typeRef.typeArguments || checker.getTypeArguments(typeRef);
			let translated = translateType(checker, args[0]);

			let typeInfo = getWGSLTypeInfo(translated);

			let toStringed = checker.typeToString(typeRef);

			if (n == 'buffer') {
				return `array<${translated}>`;
			}

			if (typeInfo.needsAlignment) {
				translated = `vec4<${typeInfo.elementType ?? 'f32'}>`;
			}

			if (toStringed.endsWith('[]')) {
				return 'array<' + translated + '>';
			} else {
				let arraySize = 0;
				if (isTupleType(t)) {
					arraySize = t.fixedLength;
				}

				return 'array<' + translated + ', ' + arraySize + '>';
			}
		}

		if (n === 'texture2d') return `sampler`;
		if (n == 'atomic') {
			let args =
				(t as ts.TypeReference).typeArguments || checker.getTypeArguments(t as ts.TypeReference);
			let translated = translateType(checker, args[0]);
			return `atomic<${translated}>`;
		}

		if (n === 'bool') return 'bool';
		if (n === 'boolean') return 'bool';

		if (n === 'uint8') return 'f32';
		if (n === 'float') return 'f32';
		if (n === 'float2') return 'vec2<f32>';
		if (n === 'float3') return 'vec3<f32>';
		if (n === 'float4') return 'vec4<f32>';

		if (n === 'int') return 'i32';
		if (n === 'int2') return 'vec2<i32>';
		if (n === 'int3') return 'vec3<i32>';
		if (n === 'int4') return 'vec4<i32>';

		if (n === 'uint') return 'u32';
		if (n === 'uint2') return 'vec2<u32>';
		if (n === 'uint3') return 'vec3<u32>';
		if (n === 'uint4') return 'vec4<u32>';

		if (n === 'float2x2') return 'mat2x2<f32>';
		if (n === 'float3x3') return 'mat3x3<f32>';
		if (n === 'float4x4') return 'mat4x4<f32>';

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
	if (
		name == 'float2' ||
		name == 'float3' ||
		name == 'float4' ||
		name == 'int2' ||
		name == 'int3' ||
		name == 'int4' ||
		name == 'uint2' ||
		name == 'uint3' ||
		name == 'uint4'
	) {
		return true;
	}

	return false;
}

function getTypeNameVectorElementType(name: string): [string, number] {
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

	if (name.startsWith('f32')) {
		return ['f32', 1];
	}

	if (name.startsWith('i32')) {
		return ['i32', 1];
	}

	if (name.startsWith('u32')) {
		return ['u32', 1];
	}

	if (name.endsWith('<f32>')) {
		return ['float', parseInt(name.substring(3, 4))];
	}

	if (name.endsWith('<i32>')) {
		return ['int', parseInt(name.substring(3, 4))];
	}

	if (name.endsWith('<u32>')) {
		return ['uint', parseInt(name.substring(3, 4))];
	}

	return ['', 0];
}

function getTypeNameVectorElementTypeWGSL(name: string) {
	if (name == 'f32') {
		return ['f32', 1];
	}

	if (name == 'i32') {
		return ['i32', 1];
	}

	if (name == 'u32') {
		return ['u32', 1];
	}

	if (name.endsWith('<f32>')) {
		return ['f32', parseInt(name.substring(3, 4))];
	}

	if (name.endsWith('<i32>')) {
		return ['i32', parseInt(name.substring(3, 4))];
	}

	if (name.endsWith('<u32>')) {
		return ['u32', parseInt(name.substring(3, 4))];
	}

	return ['', 0];
}

function isTranslatedTypeNameVectorOrScalar(name: string) {
	if (name == 'float' || name == 'int' || name == 'uint') return true;
	if (name.endsWith('<f32>') || name.endsWith('<i32>') || name.endsWith('<u32>')) {
		if (name.startsWith('vec2') || name.startsWith('vec3') || name.startsWith('vec4')) {
			return true;
		}

		return true;
	}

	return false;
}

export function getWGSLTypeInfo(name: string) {
	switch (name) {
		case 'bool':
			return { type: 'bool', length: 1, size: 1, needsAlignment: true, elementType: 'i32' };
		case 'u32':
			return {
				type: 'integer',
				length: 1,
				signed: false,
				size: 4,
				needsAlignment: true,
				elementType: 'u32'
			};
		case 'i32':
			return {
				type: 'integer',
				length: 1,
				signed: true,
				size: 4,
				needsAlignment: true,
				elementType: 'i32'
			};
		case 'f32':
			return { type: 'float', length: 1, size: 4, needsAlignment: true, elementType: 'f32' };
		case 'vec2<f32>':
			return {
				type: 'vector',
				length: 2,
				element: 'float',
				size: 8,
				needsAlignment: true,
				elementType: 'f32'
			};
		case 'vec3<f32>':
			return {
				type: 'vector',
				length: 3,
				element: 'float',
				size: 12,
				needsAlignment: true,
				elementType: 'f32'
			};
		case 'vec4<f32>':
			return {
				type: 'vector',
				length: 4,
				element: 'float',
				size: 16,
				needsAlignment: false,
				elementType: 'f32'
			};
		case 'vec2<i32>':
			return {
				type: 'vector',
				length: 2,
				signed: true,
				element: 'integer',
				size: 8,
				needsAlignment: true,
				elementType: 'i32'
			};
		case 'vec3<i32>':
			return {
				type: 'vector',
				length: 3,
				signed: true,
				element: 'integer',
				size: 12,
				needsAlignment: true,
				elementType: 'i32'
			};
		case 'vec4<i32>':
			return {
				type: 'vector',
				length: 4,
				signed: true,
				element: 'integer',
				size: 16,
				needsAlignment: false,
				elementType: 'i32'
			};
		case 'vec2<u32>':
			return {
				type: 'vector',
				length: 2,
				signed: false,
				element: 'integer',
				size: 8,
				needsAlignment: true,
				elementType: 'u32'
			};
		case 'vec3<u32>':
			return {
				type: 'vector',
				length: 3,
				signed: false,
				element: 'integer',
				size: 12,
				needsAlignment: true,
				elementType: 'u32'
			};
		case 'vec4<u32>':
			return {
				type: 'vector',
				length: 4,
				signed: false,
				element: 'integer',
				size: 16,
				needsAlignment: false,
				elementType: 'u32'
			};
		case 'mat2x2<f32>':
			return { type: 'matrix', element: 'float', size: 16, needsAlignment: false };
		case 'mat3x3<f32>':
			return { type: 'matrix', element: 'float', size: 36, needsAlignment: false };
		case 'mat4x4<f32>':
			return { type: 'matrix', element: 'float', size: 64, needsAlignment: false };
		default:
			return { type: 'unknown', size: 0, needsAlignment: false };
	}
}

function isVector(checker: ts.TypeChecker, t: ts.Type) {
	let name = getTypeFallback(checker, t);
	if (name) {
		return isTypeNameVector(name);
	}
	return false;
}

function getVectorElementType(checker: ts.TypeChecker, t: ts.Type): [string, number] {
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
	isComputeShader?: boolean;
	computeSize?: [number, number, number];
	addCustomAttribute?: (
		type: 'in' | 'out',
		index: number,
		valType: string,
		interp: 'flat' | 'linear' | 'perspective'
	) => void;
};

function isAssignableType(t: string) {
	return !(t.startsWith('texture') || t.startsWith('sampler') || t.startsWith('buffer'));
}

function isGLSLType(name: string): boolean {
	return (
		name.startsWith('vec') ||
		name.startsWith('mat') ||
		name.startsWith('sampler') ||
		name.startsWith('texture') ||
		name == 'bool' ||
		name == 'f32' ||
		name == 'i32' ||
		name == 'void'
	);
}

function autoCastNumeric(
	value: SourceNode,
	input: string,
	expected: string,
	node: ts.Node
): SourceNode {
	let inputType = getTypeNameVectorElementTypeWGSL(input);
	let expectedType = getTypeNameVectorElementTypeWGSL(expected);
	if (inputType[0] !== '' && expectedType[0] !== '') {
		if (inputType[0] != expectedType[0]) {
			if (expectedType[1] == 1) {
				if (typeof expectedType[0] == 'string' && expectedType[0].startsWith('vector')) {
					return new SourceNode(value.startIndex, value.endIndex, [value]);
				} else {
					if (inputType[0] == 'u32') {
						throw new GLSLCompilationError(`Cannot cast uint to ${expectedType[0]}`, node);
					}
					if (expectedType[0] == 'i32') {
						// debugger;
					}
					return new SourceNode(value.startIndex, value.endIndex, [
						`${expectedType[0]}(`,
						value,
						`)`
					]);
				}
			} else {
				if (inputType[0] == 'u32') {
					throw new GLSLCompilationError(`Cannot cast uint to ${expectedType[0]}`, node);
				}
				return new SourceNode(value.startIndex, value.endIndex, [
					`vec${expectedType[1]}<${expectedType[0]}>(`,
					value,
					`)`
				]);
			}
		}
	}
	return value;
}

function isUniformAccess(ctx: TsAstContext, expr: ts.Expression) {
	if (isCallExpression(expr)) {
		expr = expr.expression;
	}

	let id: ts.Identifier | null = null;
	if (ts.isIdentifier(expr)) {
		id = expr;
	}

	if (isPropertyAccessExpression(expr)) {
		let chain = expr as ts.PropertyAccessExpression;
		while (chain.expression) {
			if (ts.isPropertyAccessExpression(chain.expression)) {
				chain = chain.expression;
			} else {
				break;
			}
		}

		id = chain.expression as ts.Identifier;
	}

	if (id) {
		if (ts.isIdentifier(id)) {
			let sym = ctx.checker.getSymbolAtLocation(id);
			if (sym && sym.flags & ts.SymbolFlags.Alias) {
				sym = ctx.checker.getAliasedSymbol(sym);
			}

			if (sym?.declarations?.length == 1) {
				let decl = sym.declarations[0];
				if (isUniformable(ctx.checker, decl)) {
					if (isVariableDeclarationValue(ctx.checker, decl)) {
						if (!isInSameScope(decl, id)) {
							if (!isInShader(decl)) {
								return true;
							}
						}
					}
				}
			}
		}
	}

	return false;
}

/**
 * This will wrap an expression that accesses a uniform boolean with a == 1 to convert it to a boolean.
 */
function accessWrap(ctx: TsAstContext, expr: ts.Expression, inner: SourceNode) {
	if (isPropertyAccessExpression(expr)) {
		let chain = expr as ts.PropertyAccessExpression;
		while (chain.expression) {
			if (ts.isPropertyAccessExpression(chain.expression)) {
				chain = chain.expression;
			} else {
				break;
			}
		}

		let id = chain.expression as ts.Identifier;
		if (ts.isIdentifier(id)) {
			let sym = ctx.checker.getSymbolAtLocation(id);
			if (sym && sym.flags & ts.SymbolFlags.Alias) {
				sym = ctx.checker.getAliasedSymbol(sym);
			}

			if (sym?.declarations?.length == 1) {
				let decl = sym.declarations[0];
				if (isUniformable(ctx.checker, decl)) {
					if (isVariableDeclarationValue(ctx.checker, decl)) {
						if (!isInSameScope(decl, chain.expression)) {
							if (!isInShader(decl)) {
								let outputType = ctx.checker.getTypeAtLocation(expr);

								let isBooleanAccess = false;

								if (isArrayType(outputType, ctx.checker)) {
									let typeRef = outputType as ts.TypeReference;

									let args = typeRef.typeArguments || ctx.checker.getTypeArguments(typeRef);

									let t = args[0];

									let n = getTypeFallback(ctx.checker, t);

									if (n == 'boolean' || n == 'bool') {
										isBooleanAccess = true;
									}
								} else {
									let n = getTypeFallback(ctx.checker, outputType);

									if (n == 'boolean' || n == 'bool') {
										isBooleanAccess = true;
									}
								}
								if (isBooleanAccess) {
									return new SourceNode(inner.startIndex, inner.endIndex, [`((`, inner, `) == 1)`]);
								}
							}
						}
					}
				}
			}
		}
	}
	return inner;
}

function getVectorMask(num: number) {
	let outMask = '';
	let comps = ['x', 'y', 'z', 'w'];
	for (let i = 0; i < num; i++) {
		outMask += comps[i];
	}
	return outMask;
}

function convertConciseBodyToBlock(body: ts.ConciseBody) {
	if (ts.isBlock(body)) {
		return body;
	} else {
		return ts.factory.createBlock([ts.factory.createReturnStatement(body)]);
	}
}

function getRealReturnType(checker: ts.TypeChecker, call: ts.CallExpression) {
	let fnCallSignature = checker.getResolvedSignature(call);
	return fnCallSignature.getReturnType();
}

function augmentParameter(checker: ts.TypeChecker, p: ts.ParameterDeclaration): SourceNode[] {
	const type = checker.getTypeAtLocation(p);

	const tt = translateType(checker, type);
	if (tt == 'sampler') {
		const args = checker.getTypeArguments(type as ts.TypeReference);
		let innerType = 'f32';
		if (args && args.length > 0) {
			let [et, _] = getVectorElementType(checker, args[0]);
			innerType = {
				float: 'f32',
				int: 'i32',
				uint: 'u32'
			}[et];
		}
		return [
			new SourceNode(p.getStart(), p.getEnd(), [
				p.name.getText() + '_texture: texture_2d<' + innerType + '>'
			])
		];
	}
	return [];
}
function augmentArgument(ctx: TsAstContext, arg: ts.Expression): SourceNode[] {
	let type = ctx.checker.getTypeAtLocation(arg);
	let tt = translateType(ctx.checker, type);
	if (tt == 'sampler') {
		let args = ctx.checker.getTypeArguments(type as ts.TypeReference);
		let innerType = 'f32';
		if (args && args.length > 0) {
			let [et, _] = getVectorElementType(ctx.checker, args[0]);
			innerType = {
				float: 'f32',
				int: 'i32',
				uint: 'u32'
			}[et];
		}
		return [new SourceNode(arg.getStart(), arg.getEnd(), [compile(ctx, arg), '_texture'])];
	}

	return [];
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
					let tt = translateType(ctx.checker, ctx.checker.getTypeAtLocation(p.declarations[0]));
					let vvv = vars.map((p) =>
						s([p.escapedName, isAssignableType(tt) ? '_const' : '', ': ', tt])
					);
					let joins = join(
						[
							...arg.parameters
								.map((p) => {
									let aug = augmentParameter(ctx.checker, p);
									return [cplain(p), ...aug];
								})
								.flat(),
							...vvv
						],
						', '
					);
					let returnStr = ' -> ' + translateType(ctx.checker, returnType);
					if (returnStr == ' -> void') returnStr = '';

					prefixFunctions.push(
						s([
							'fn ',
							name,
							'(',
							...joins,
							')',
							returnStr,
							' {\n',
							...vars
								.filter((p) => {
									let type = ctx.checker.getTypeAtLocation(p.declarations[0]);

									let tt = translateType(ctx.checker, type);
									return isAssignableType(tt);
								})
								.map((p) => {
									return s([
										'var ',
										p.escapedName.toString(),
										' = ',
										p.escapedName.toString(),
										'_const;\n'
									]);
								}),
							...arg.parameters
								.filter((p) => {
									let type = ctx.checker.getTypeAtLocation(p.type);

									let tt = translateType(ctx.checker, type);
									return isAssignableType(tt);
								})
								.map((p) => {
									return s(['var ', p.name.getText(), ' = ', p.name.getText(), '_const;\n']);
								}),
							...(convertConciseBodyToBlock(arg.body).statements.map((s) => c(s)) ?? []),
							'\n}\n\n'
						])
					);
				}
			}
		}
	}

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
			return autoCastNumeric(c(arg), argTypeString, paramTypeString, arg);
		}
		return s([c(arg)]);
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
			let returnStr = ' -> ' + translateType(ctx.checker, returnType);
			if (returnStr == ' -> void') returnStr = '';
			return s([
				...prefixFunctions,
				'fn ',
				fnName,
				'(',

				...join(
					[
						...(isStatic
							? []
							: [
									'_this: ' +
										translateType(ctx.checker, ctx.checker.getTypeAtLocation(fnDeclar.parent))
							  ]),
						...fnDeclar.parameters
							.filter((p) => {
								let type = ctx.checker.getTypeAtLocation(p);
								if (type.getCallSignatures().length > 0) {
									return false;
								}
								return true;
							})
							.map((p) => {
								const o = c(p);
								const aug = augmentParameter(ctx.checker, p);
								return [o, ...aug];
							})
							.flat()
					],
					', '
				),
				')',
				returnStr,
				' {\n',
				...fnDeclar.parameters
					.filter((p) => {
						let type = ctx.checker.getTypeAtLocation(p);
						if (type.getCallSignatures().length > 0) {
							return false;
						}
						return true;
					})
					.map((p) =>
						s([
							'var ',
							escapeIdentifier(p.name.getText()),
							' = ',
							escapeIdentifier(p.name.getText()),
							'_const;\n'
						])
					),
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
			let returnStrMethod = ' -> ' + translateType(ctx.checker, mthdreturnType);
			if (returnStrMethod == ' -> void') returnStrMethod = '';
			return s([
				...prefixFunctions,
				'fn ',
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
						.map((p) => {
							const o = c(p);
							const aug = augmentParameter(ctx.checker, p);
							return [o, ...aug];
						})
						.flat(),
					', '
				),
				')',
				returnStrMethod,
				' {\n',
				...mthdDeclar.parameters
					.filter((p) => {
						let type = ctx.checker.getTypeAtLocation(p);
						if (type.getCallSignatures().length > 0) {
							return false;
						}
						let tt = translateType(ctx.checker, type);
						return isAssignableType(tt);
					})
					.map((p) =>
						s([
							'var ',
							escapeIdentifier(p.name.getText()),
							' = ',
							escapeIdentifier(p.name.getText()),
							'_const;\n'
						])
					),
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
							translateType(ctx.checker, expectedReturnType),
							ret.expression
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
								v.name,
								': ',
								translateType(ctx.checker, ctx.checker.getTypeAtLocation(v.valueDeclaration))
							]);
						});

						return s(join(closureVars, ', '));
					}
				}
			}
			const tt = translateType(ctx.checker, ctx.checker.getTypeAtLocation(param));
			return s([
				escapeIdentifier(param.name.getText()),
				isAssignableType(tt) ? '_const' : '',
				': ',
				tt
			]);
		case ts.SyntaxKind.ArrowFunction:
			// This is the root of the shader
			let arrow = ast as ts.ArrowFunction;
			let body = convertConciseBodyToBlock(arrow.body);
			let preMain = '';
			if (ctx.isComputeShader) {
				preMain = `\n@compute @workgroup_size(${ctx.computeSize[0]}, ${ctx.computeSize[1]}, ${ctx.computeSize[2]})`;
			}

			return s([
				'\n/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/' +
					preMain +
					'\nfn main(/*__SHADEUP_TEMPLATE_INPUT*/)' +
					(ctx.isComputeShader ? '' : '-> /*__SHADEUP_TEMPLATE_OUTPUT*/') +
					'{\n/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/\n',
				...body.statements.filter((s) => !ts.isFunctionDeclaration(s)).map((s) => c(s)),
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

			let fullText = varDecl.getSourceFile().getFullText();
			let fullStart = varDecl.getFullStart();
			let prefix = `// @workgroup\n `;

			let mySelf = fullText.slice(fullStart - prefix.length, fullStart);

			if (mySelf.includes('@workgroup')) {
				return s([]);
			} else {
				let translated = translateType(ctx.checker, type);
				if (translated.startsWith('array')) {
					translated = '';
				}
				if (isInShader(varDecl)) {
					let arrType = ctx.checker.getTypeAtLocation(varDecl);
					let typeInfo = getArrayTypeInfo(ctx.checker, arrType);
					if (typeInfo.isArray) {
						if (typeInfo.staticSize <= 0) {
							throw new GLSLCompilationError(
								'Cannot declare an array without a static size in a shader',
								varDecl
							);
						}
					}
				}
				let initializerVal = c(varDecl.initializer!);
				if (translated) {
					let leftType = type;
					let rightType = ctx.checker.getTypeAtLocation(varDecl.initializer!);
					if (isVector(ctx.checker, leftType) && isVector(ctx.checker, rightType)) {
						// debugger;
						let [leftElementType, leftElementSize] = getVectorElementType(ctx.checker, leftType);
						let [rightElementType, rightElementSize] = getVectorElementType(ctx.checker, rightType);

						if (leftElementType != rightElementType) {
							if (leftElementType == 'float' && rightElementType == 'int') {
								initializerVal = s([`vec${leftElementSize}f(`, initializerVal, ')']);
							} else if (leftElementType == 'int' && rightElementType == 'float') {
								initializerVal = s([`vec${leftElementSize}i(`, initializerVal, ')']);
							}
						}
					}

					if (isNumeric(ctx.checker, leftType) && isNumeric(ctx.checker, rightType)) {
						let leftTypeStr = translateType(ctx.checker, leftType);
						let rightTypeStr = translateType(ctx.checker, rightType);
						if (leftTypeStr != rightTypeStr) {
							initializerVal = s([
								autoCastNumeric(initializerVal, rightTypeStr, leftTypeStr, varDecl.initializer)
							]);
						}
					}
				}

				if (translated == '___atomic_compare_exchange_result') {
					translated = '';
				}

				return s([
					'var ',
					escapeIdentifier(varDecl.name.getText()),
					translated ? ': ' : '',
					translated,
					' = ',
					initializerVal
				]);
			}
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

			if (ts.isIdentifier(call.expression)) {
				if (isUniformAccess(ctx, call.expression)) {
					let typ = ctx.checker.getTypeAtLocation(call.expression);
					if (
						typ.getSymbol().getName().startsWith('shader') ||
						(typ.aliasSymbol && typ.aliasSymbol.getName() == 'shader')
					) {
						console.log('Uniform access to shader', typ.getSymbol().getName());
					}
				}
			}

			if (symName == '__index') {
				let postfix = '';

				let t = ctx.checker.getTypeAtLocation(
					(call.expression as ts.PropertyAccessExpression).expression
				);

				let uniAccess = isUniformAccess(
					ctx,
					(call.expression as ts.PropertyAccessExpression).expression
				);

				if (ts.isPropertyAccessExpression(call.expression)) {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(call.expression.expression)
					);
					let returnType = getRealReturnType(ctx.checker, call);
					let vecOut = getVectorElementType(ctx.checker, returnType);
					let outMask = getVectorMask(vecOut[1] as number);
					if (innerType == 'sampler') {
						if (ts.isCallExpression(call.expression.expression)) {
							// Index 2d texture
							let callIndex = call.expression.expression as ts.CallExpression;

							return s([
								'textureLoad(',
								c(callIndex.expression),
								'_texture, ',
								...join([...callIndex.arguments.map((a) => c(a))], ','),
								', vec2<u32>(',
								c(call.arguments[0]),
								'), 0).' + outMask
							]);
						} else {
							return s([
								'textureLoad(',
								c(call.expression.expression),
								'_texture, vec2<u32>(',
								c(call.arguments[0]),
								'), 0).' + outMask
							]);
						}
					}
				}

				let translatedOut = translateType(ctx.checker, ctx.checker.getTypeAtLocation(call));
				if (
					isArrayType(t, ctx.checker) &&
					isUniformAccess(ctx, (call.expression as ts.PropertyAccessExpression).expression) &&
					!translatedOut.startsWith('mat')
				) {
					let typeRef = t as ts.TypeReference;

					let args = typeRef.typeArguments || ctx.checker.getTypeArguments(typeRef);
					let translated = translateType(ctx.checker, args[0]);

					let typeInfo = getWGSLTypeInfo(translated);

					if (typeInfo.needsAlignment) {
						translated = `vec4<${typeInfo.elementType ?? 'f32'}>`;
					}

					let lengths = {
						1: 'x',
						2: 'xy',
						3: 'xyz',
						4: 'xyzw'
					};

					if (typeInfo.type != 'unknown') {
						postfix = `.${lengths[typeInfo.length ?? 1]}`;
					}
				}
				return accessWrap(
					ctx,
					(call.expression as ts.PropertyAccessExpression).expression,
					s([c(call.expression), '[', c(call.arguments[0]), ']', postfix])
				);
			} else if (symName == 'attr') {
				let expr = call.expression;
				if (ts.isPropertyAccessExpression(expr)) {
					let left = expr.expression;
					let leftName = ctx.checker.getTypeAtLocation(left).getSymbol()?.getName() ?? '';
					if (leftName == 'ShaderInput') {
						if (call.arguments.length >= 1) {
							let arg1 = call.arguments[0];
							if (ts.isCallExpression(arg1)) {
								arg1 = arg1.arguments[0];
							}
							if (!ts.isNumericLiteral(arg1)) {
								throw new GLSLCompilationError('Attribute index must be a number literal', arg1);
							}
							let index = parseInt(arg1.getText());
							let interpMode = 'perspective';

							if (call.arguments.length >= 2) {
								let arg2 = call.arguments[1];
								if (ts.isStringLiteral(arg2)) {
									interpMode = arg2.text;
								}
							}

							let valType = '';
							if (call.typeArguments.length == 1) {
								valType = translateType(
									ctx.checker,
									ctx.checker.getTypeAtLocation(call.typeArguments[0])
								);
							}

							ctx.addCustomAttribute('in', index, valType, interpMode as any);
							return s(['_i_in.custom', index.toString()]);
						}
					} else if (leftName == 'ShaderOutput') {
						if (call.arguments.length >= 2) {
							let arg1 = call.arguments[0];
							if (ts.isCallExpression(arg1)) {
								arg1 = arg1.arguments[0];
							}
							if (!ts.isNumericLiteral(arg1)) {
								throw new GLSLCompilationError('Attribute index must be a number literal', arg1);
							}
							let index = parseInt(arg1.getText());

							let interpMode = 'perspective';

							if (call.arguments.length >= 3) {
								let arg2 = call.arguments[2];
								if (ts.isStringLiteral(arg2)) {
									interpMode = arg2.text;
								}
							}

							let valType = translateType(
								ctx.checker,
								ctx.checker.getTypeAtLocation(call.arguments[1])
							);

							ctx.addCustomAttribute('out', index, valType, interpMode as any);
							return s(['_i_out.custom', index.toString(), ' = ', c(call.arguments[1])]);
						}
					}
				}
			} else if (symName == 'len') {
				let expr = call.expression;
				if (ts.isPropertyAccessExpression(expr)) {
					let left = expr.expression;
					if (isUniformAccess(ctx, left)) {
						return s(['_in_uniforms.', c(left), '_size']);
					} else {
						let arrType = ctx.checker.getTypeAtLocation(left);
						let typeInfo = getArrayTypeInfo(ctx.checker, arrType);
						return s([typeInfo.staticSize.toString()]);
					}
				}
			} else if (symName == 'min' || symName == 'max') {
				// Fold min/max to wgsl functions
				if (call.arguments.length > 2) {
					let args = call.arguments.map((a) => c(a));
					while (args.length > 2) {
						let left = args.shift();
						let right = args.shift();
						args.unshift(s([symName, '(', left, ',', right, ')']));
					}
					return s([symName, '(', ...join(args, ','), ')']);
				}
			} else if (symName == 'clamp') {
				// Component wise clamp
				if (call.arguments.length == 3) {
					let inType = ctx.checker.getTypeAtLocation(call.arguments[0]);
					let vType = translateType(ctx.checker, inType);
					let vTypeInfo = getWGSLTypeInfo(vType);
					if (vTypeInfo.type == 'vector') {
						let minV = call.arguments[1];
						let maxV = call.arguments[2];
						let minType = ctx.checker.getTypeAtLocation(minV);
						let maxType = ctx.checker.getTypeAtLocation(maxV);
						let minTypeInfo = getWGSLTypeInfo(translateType(ctx.checker, minType));
						let maxTypeInfo = getWGSLTypeInfo(translateType(ctx.checker, maxType));
						if (minTypeInfo.type == 'vector' && maxTypeInfo.type == 'vector') {
							// Continue as normal
						} else {
							let minStr = c(minV);
							let maxStr = c(maxV);
							if (minTypeInfo.type != 'vector') {
								minStr = s([`vec${vTypeInfo.length}<${vTypeInfo.elementType}>(`, minStr, ')']);
							}
							if (maxTypeInfo.type != 'vector') {
								maxStr = s([`vec${vTypeInfo.length}<${vTypeInfo.elementType}>(`, maxStr, ')']);
							}

							return s(['clamp(', c(call.arguments[0]), ',', minStr, ',', maxStr, ')']);
						}
					}
				}
			} else if (symName == 'atomic') {
				throw new GLSLCompilationError(
					'Atomics cannot be constructed in shaders, create them outside or in a workgroup',
					call.expression
				);
			} else if (symName == 'sample') {
				if (ts.isPropertyAccessExpression(call.expression)) {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(call.expression.expression)
					);

					if (innerType == 'sampler') {
						if (ts.isCallExpression(call.expression.expression)) {
							// Index 2d texture
							let callIndex = call.expression.expression as ts.CallExpression;

							return s([
								'textureSample(',
								c(callIndex.expression),
								'_texture, ',
								c(callIndex.expression),
								',',
								'vec2(',
								c(call.arguments[0]),
								'),',
								...join([...callIndex.arguments.map((a) => c(a))], ','),
								')'
							]);
						} else {
							return s([
								'textureSample(',
								c(call.expression.expression),
								'_texture, ',
								c(call.expression.expression),
								', vec2(',
								c(call.arguments[0]),
								'))'
							]);
						}
					}
				}
			} else if (symName == '__index_assign') {
				let postfix = '';

				if (ts.isPropertyAccessExpression(call.expression)) {
					let innerType = translateType(
						ctx.checker,
						ctx.checker.getTypeAtLocation(call.expression.expression)
					);

					if (innerType == 'sampler') {
						if (ts.isCallExpression(call.expression.expression)) {
							// Index 2d texture
							let callIndex = call.expression.expression as ts.CallExpression;

							return s([
								'textureStore(',
								c(callIndex.expression),
								'_texture_write, ',
								...join([...callIndex.arguments.map((a) => c(a))], ','),
								', vec2<i32>(',
								c(call.arguments[0]),
								'), vec4(',
								autoCastParameter(call, 1),
								'))'
							]);
						} else {
							return s([
								'textureStore(',
								c(call.expression.expression),
								'_texture_write, vec2<i32>(',
								c(call.arguments[0]),
								'), vec4(',
								autoCastParameter(call, 1),
								'))'
							]);
						}
					}
				}

				let t = ctx.checker.getTypeAtLocation(
					(call.expression as ts.PropertyAccessExpression).expression
				);

				return accessWrap(
					ctx,
					(call.expression as ts.PropertyAccessExpression).expression,
					s([
						c((call.expression as ts.PropertyAccessExpression).expression),
						'[',
						c(call.arguments[0]),
						']',
						postfix,
						' = ',
						autoCastParameter(call, 1)
					])
				);
			} else if (symName == 'eq' && call.expression.getText() == '__.eq') {
				let leftArg = call.arguments[0];
				let rightArg = call.arguments[1];
				let leftType = ctx.checker.getTypeAtLocation(leftArg);
				let rightType = ctx.checker.getTypeAtLocation(rightArg);
				let [leftElementType, leftElementSize] = getVectorElementType(ctx.checker, leftType);
				if (isVector(ctx.checker, leftType) && isVector(ctx.checker, rightType)) {
					return s([
						'squash_bool_vec',
						leftElementSize.toString(),
						'(',
						c(leftArg),
						' == ',
						c(rightArg),
						')'
					]);
				}
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
						let returnType = ctx.checker.getReturnTypeOfSignature(exprSig);
						let returnTypeStr = translateType(ctx.checker, returnType);
						let returnTypeInfo = getWGSLTypeInfo(returnTypeStr);
						let callType = translateType(ctx.checker, returnType);
						let info = getWGSLTypeInfo(callType);

						let argStrs = [];

						for (let [i, arg] of call.arguments.entries()) {
							let argType = ctx.checker.getTypeAtLocation(arg);
							let argTypeStr = translateType(ctx.checker, argType);
							let argTypeInfo = getWGSLTypeInfo(argTypeStr);
							let paramType = ctx.checker.getTypeAtLocation(
								exprSig.parameters[i].getDeclarations()[0]
							);
							let paramTypeStr = translateType(ctx.checker, paramType);
							let paramTypeInfo = getWGSLTypeInfo(paramTypeStr);
							if (argTypeInfo.elementType !== returnTypeInfo.elementType) {
								paramTypeStr = `vec${argTypeInfo.length}<${returnTypeInfo.elementType}>`;
							}
							argStrs.push(autoCastNumeric(c(arg), argTypeStr, paramTypeStr, arg));
						}

						return s([callType, '(', ...join(argStrs, ', '), ')']);
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
						if (call.arguments.length == 2) {
							return s([c(arg), '.', propAccess]);
						} else {
							let t = s([
								'var tempVal_',
								call.getStart().toString(),
								' = ',
								c(call.arguments[2]),
								';\n'
							]);
							let assigns = [];
							for (let i = 0; i < propAccess.length; i++) {
								let char = propAccess[i];
								assigns.push(
									s([
										c(arg),
										'.',
										char,
										' = ',
										'tempVal_',
										call.getStart().toString(),
										...(propAccess.length > 1 ? ['.', char] : []),
										';\n'
									])
								);
							}
							return s([t, ...assigns]);
						}
					} else if (isNumeric(ctx.checker, argType)) {
						let numericType = translateType(ctx.checker, argType);

						return s([`shadeup_up_swizzle_${propAccess}_${numericType}(`, c(arg), ')']);
					} else {
						return s([c(arg), '.', propAccess]);
					}
				}
			}

			let mutations = {
				arguments: new Array<null | SourceNode>(call.arguments.length)
			};

			for (let [i, arg] of call.arguments.entries()) {
				mutations.arguments[i] = null;
			}

			if (exprSmybol?.getName() == 'max' || exprSmybol?.getName() == 'min') {
				let exprSig = ctx.checker.getResolvedSignature(call);
				if (exprSig && exprSig.parameters.length == 2) {
					let skip = false;
					let unbalanced = false;
					let singleArg = -1;

					let targetLength = 0;
					let targetType = '';

					for (let [i, arg] of call.arguments.entries()) {
						let argType = ctx.checker.getTypeAtLocation(arg);
						let argTypeStr = translateType(ctx.checker, argType);
						let argTypeInfo = getWGSLTypeInfo(argTypeStr);
						if (argTypeInfo.length === 1) {
							if (unbalanced) {
								skip = true;
							}
							unbalanced = true;
							singleArg = i;
						}
					}
					for (let [i, arg] of call.arguments.entries()) {
						let argType = ctx.checker.getTypeAtLocation(arg);
						let argTypeStr = translateType(ctx.checker, argType);
						let argTypeInfo = getWGSLTypeInfo(argTypeStr);
						if (argTypeInfo.length !== 1) {
							targetLength = argTypeInfo.length;
							targetType = argTypeInfo.elementType;
						}
					}

					if (!skip && unbalanced && singleArg !== -1) {
						mutations.arguments[singleArg] = s([
							`vec${targetLength}<${targetType}>(`,
							c(call.arguments[singleArg]),
							`)`
						]);
					}
				}
			}

			// if (isTypeNameVector(exprSmybol?.getName() ?? '')) {
			// 	return s([
			// 		translateType(ctx.checker, ctx.checker.getTypeAtLocation(call.expression)),
			// 		'(',
			// 		...join(
			// 			call.arguments.map((a) => c(a)),
			// 			', '
			// 		),
			// 		')'
			// 	]);
			// }

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
								if (
									translatedBase == 'vector2' ||
									translatedBase == 'vector3' ||
									translatedBase == 'vector4'
								) {
									argStr = argStr;
								} else {
									argStr = s([`${translatedBase}(`, argStr, `)`]);
								}
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
					let augs = augmentArgument(ctx, arg);
					if (augs.length > 0) {
						argStr = s([argStr, ',', ...join(augs, ',')]);
					}
					callArgs.push(argStr);
				}
			}
			callStr += ')';

			const levelCalls = {
				mix: true
			};
			const constructs = {
				'vec2<f32>': true,
				'vec3<f32>': true,
				'vec4<f32>': true,
				'vec2<i32>': true,
				'vec3<i32>': true,
				'vec4<i32>': true,
				'vec2<u32>': true,
				'vec3<u32>': true,
				'vec4<u32>': true,
				'mat2x2<f32>': true,
				'mat3x3<f32>': true,
				'mat4x4<f32>': true,
				'mat2x2<i32>': true,
				'mat3x3<i32>': true,
				'mat4x4<i32>': true
			};

			if (exprSmybol) {
				let mapping = findSignatureMappingToWGSL(ctx.checker, exprSmybol);
				if (mapping !== null) {
					let levelCastArguments =
						mapping.startsWith('!') ||
						(levelCalls[mapping] ?? false) ||
						(constructs[mapping] ?? false);

					if (levelCastArguments) {
						// Ensure all args are the same type (float/int)
						let minType = '';
						let noOp = false;

						for (let arg of call.arguments) {
							let argType = ctx.checker.getTypeAtLocation(arg);
							let argTypeName = translateType(ctx.checker, argType);

							if (
								!(
									argTypeName == 'f32' ||
									argTypeName.endsWith('<f32>') ||
									argTypeName == 'i32' ||
									argTypeName.endsWith('<i32>')
								)
							) {
								noOp = true;
							}

							if (minType == '') {
								if (argTypeName == 'f32' || argTypeName.endsWith('<f32>')) {
									minType = 'f32';
								} else if (argTypeName == 'i32' || argTypeName.endsWith('<i32>')) {
									minType = 'i32';
								}
							} else if (argTypeName == 'f32' || minType.endsWith('<f32>')) {
								minType = 'f32';
							}
						}

						if (constructs[mapping]) {
							noOp = false;
							if (mapping.endsWith('<f32>')) {
								minType = 'f32';
							} else if (mapping.endsWith('<i32>')) {
								minType = 'i32';
							}
						}

						if (!noOp) {
							for (let i = 0; i < callArgs.length; i++) {
								let arg = call.arguments[i];
								let argType = ctx.checker.getTypeAtLocation(arg);
								let argTypeName = translateType(ctx.checker, argType);
								let argTypeStripped = '';
								if (argTypeName == 'f32' || argTypeName.endsWith('<f32>')) {
									argTypeStripped = 'f32';
								} else if (argTypeName == 'i32' || argTypeName.endsWith('<i32>')) {
									argTypeStripped = 'i32';
								}
								if (argTypeStripped != minType) {
									if (argTypeName.startsWith('f32') || argTypeName.startsWith('i32')) {
										callArgs[i] = s([`${minType}(`, callArgs[i], `)`]);
									} else if (argTypeName.endsWith('<f32>') || argTypeName.endsWith('<i32>')) {
										let len = argTypeName.match(/\d+/)?.[0];
										if (len === undefined) {
											throw new Error('Invalid type');
										}
										callArgs[i] = s([`vec${len}<${minType}>(`, callArgs[i], `)`]);
									} else {
									}
								}
							}
						}
					} else {
						let sig = ctx.checker.getSignatureFromDeclaration(exprSig.getDeclaration());
						// sig = ctx.checker.getResolvedSignature(exprSig);
						sig = exprSig;
						// console.log('Signature', ctx.checker.signatureToString(sig));
						// console.log('Resolved Signature', ctx.checker.signatureToString(exprSig));
						for (let i = 0; i < callArgs.length; i++) {
							let arg = call.arguments[i];
							let argType = ctx.checker.getTypeAtLocation(arg);

							let paramType = ctx.checker.getTypeAtLocation(
								sig.parameters[Math.min(i, sig.parameters.length - 1)].getDeclarations()[0]
							);

							paramType =
								sig.getTypeParameterAtPosition(Math.min(i, sig.parameters.length - 1)) ?? paramType;
							// sig.parameters[Math.min(i, sig.parameters.length - 1)]
							let carg = c(arg);
							let augs = augmentArgument(ctx, arg);
							if (augs.length > 0) {
								carg = s([carg, ',', ...join(augs, ',')]);
							}
							callArgs[i] = autoCastNumeric(
								carg,
								translateType(ctx.checker, argType),
								translateType(ctx.checker, paramType),
								arg
							);
						}
					}

					if (mapping.startsWith('!')) {
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
							} else if (/^\[\d+\]$/.test(r)) {
								let templateType = translateType(
									ctx.checker,
									ctx.checker.getTypeAtLocation(call.typeArguments[parseInt(r.slice(1, -1))])
								);
								outs.push(templateType);
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
						for (let [i, mutation] of mutations.arguments.entries()) {
							if (mutation) {
								callArgs[i] = mutation;
							}
						}
						return s([
							new SourceNode(call.expression.getStart(), call.expression.getEnd(), [mapping]),
							'(',
							...join([...preArgs, ...callArgs], ', '),
							')'
						]);
					}
				} else {
					let sig = ctx.checker.getSignatureFromDeclaration(exprSig.getDeclaration());
					for (let i = 0; i < callArgs.length; i++) {
						let arg = call.arguments[i];
						let argType = ctx.checker.getTypeAtLocation(arg);

						let paramType = ctx.checker.getTypeAtLocation(sig.parameters[i].getDeclarations()[0]);
						let carg = c(arg);
						let augs = augmentArgument(ctx, arg);
						if (augs.length > 0) {
							carg = s([carg, ',', ...join(augs, ',')]);
						}
						callArgs[i] = autoCastNumeric(
							carg,
							translateType(ctx.checker, argType),
							translateType(ctx.checker, paramType),
							arg
						);
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

			for (let [i, mutation] of mutations.arguments.entries()) {
				if (mutation) {
					callArgs[i] = mutation;
				}
			}
			return s([funcName, '(', ...join([...preArgs, ...callArgs], ', '), ')']);
		case ts.SyntaxKind.NewExpression:
			let newExpr = ast as ts.NewExpression;
			let newExprSymbol = getSymbolAtLocationAndFollowAliases(ctx.checker, newExpr.expression);

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
								let propType = ctx.checker.getTypeAtLocation(p[1]);

								let propValType = ctx.checker.getTypeAtLocation(prop.initializer);
								let propTypeStr = translateType(ctx.checker, propType);
								let propValTypeStr = translateType(ctx.checker, propValType);
								console.log('WRite prop', propTypeStr, propValTypeStr);
								if (propTypeStr != propValTypeStr) {
									return s([
										'/* ',
										p[0],
										': */ ',
										autoCastNumeric(c(prop.initializer), propValTypeStr, propTypeStr, prop),
										'\n'
									]);
								} else {
									return s(['/* ', p[0], ': */ ', c(prop.initializer), '\n']);
								}
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

			let left = c(cond.whenTrue);
			let right = c(cond.whenFalse);

			let leftType = ctx.checker.getTypeAtLocation(cond.whenTrue);
			let rightType = ctx.checker.getTypeAtLocation(cond.whenFalse);

			if (
				(isVector(ctx.checker, leftType) && isVector(ctx.checker, rightType)) ||
				(isNumeric(ctx.checker, leftType) && isNumeric(ctx.checker, rightType))
			) {
				let leftTypeStr = translateType(ctx.checker, leftType);
				let rightTypeStr = translateType(ctx.checker, rightType);
				let leftTypeInfo = getWGSLTypeInfo(leftTypeStr);
				let rightTypeInfo = getWGSLTypeInfo(rightTypeStr);

				if (leftTypeInfo.elementType == 'f32') {
					right = autoCastNumeric(
						right,
						translateType(ctx.checker, rightType),
						translateType(ctx.checker, leftType),
						cond
					);
				}

				if (rightTypeInfo.elementType == 'f32') {
					left = autoCastNumeric(
						left,
						translateType(ctx.checker, leftType),
						translateType(ctx.checker, rightType),
						cond
					);
				}
			}

			return s(['select(', right, ', ', left, ', ', c(cond.condition), ')']);

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
									let _type = ctx.checker.getTypeAtLocation(decl);
									let translated = translateType(ctx.checker, _type);
									let isGlobalVar = isRootNode(decl);

									let glslVarName = `${
										!isSpecialUniformType(translated) ? '_in_uniforms.' : ''
									}_ext_uniform_${isGlobalVar ? 'global' : 'local'}_${id.text.toString()}`;
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

					if (innerType == 'sampler') {
						return s(['vec2<f32>(textureDimensions(', c(prop.expression), '_texture))']);
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
				if (ifStmt.expression.escapedText == 'PLATFORM_WEBGPU') {
					return s([c(ifStmt.thenStatement)]);
				}
				if (ifStmt.expression.escapedText == 'PLATFORM_WEBGL') {
					if (ifStmt.elseStatement) {
						return s([c(ifStmt.elseStatement)]);
					} else {
						return s(['']);
					}
				}
			}

			let addBraces = false;
			if (!ts.isBlock(ifStmt.thenStatement)) {
				addBraces = true;
			}

			return s([
				'if (',
				c(ifStmt.expression),
				`) ${addBraces ? '{' : ''}\n`,
				c(ifStmt.thenStatement),
				`${addBraces ? '}' : ''}\n`,
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
					let translated = translateType(ctx.checker, type);
					let postType = ': ' + translated;
					if (translated == '___atomic_compare_exchange_result') {
						postType = '';
					}
					return s(['var ', varDecl.name.getText(), postType, ' = ', c(varDecl.initializer!)]);
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
			let binExprText = bin.operatorToken.getText();
			if (binExprText == '===') {
				binExprText = '==';
			}
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
							return s([c(bin.left), ` = vec${leftElementSize}f(`, c(bin.right), ')']);
						} else if (leftElementType == 'int' && rightElementType == 'float') {
							return s([c(bin.left), ` = vec${leftElementSize}i(`, c(bin.right), ')']);
						}
					}
				}

				if (isNumeric(ctx.checker, leftType) && isNumeric(ctx.checker, rightType)) {
					let leftTypeStr = translateType(ctx.checker, leftType);
					let rightTypeStr = translateType(ctx.checker, rightType);
					if (leftTypeStr != rightTypeStr) {
						return s([
							c(bin.left),
							` = `,
							autoCastNumeric(c(bin.right), rightTypeStr, leftTypeStr, bin)
						]);
					}
				}

				if (isUniformAccess(ctx, bin.left)) {
					if (translateType(ctx.checker, ctx.checker.getTypeAtLocation(bin.left)) == 'bool') {
						return s([c(bin.left), ' = select(0, 1, ', c(bin.right), ')']);
					}
				}

				return s([c(bin.left), ' ', binExprText, ' ', c(bin.right)]);
			}

			return s([c(bin.left), ' ', binExprText, ' ', c(bin.right)]);
		case ts.SyntaxKind.StringLiteral:
			return s(['0']);
		case ts.SyntaxKind.ArrayLiteralExpression:
			let arr = ast as ts.ArrayLiteralExpression;
			return s([
				'array(',
				...join(
					arr.elements.map((e) => c(e)),
					', '
				),
				')'
			]);
		case ts.SyntaxKind.ElementAccessExpression:
			let elem = ast as ts.ElementAccessExpression;
			let t = ctx.checker.getTypeAtLocation(elem.expression);
			let n = getTypeFallback(ctx.checker, t);
			let postfix = '';
			if (
				n === 'Array' ||
				(t.flags & ts.TypeFlags.Object &&
					((t as any).objectFlags & ts.ObjectFlags.Tuple ||
						(t as any).objectFlags & ts.ObjectFlags.ArrayLiteral ||
						(t as any).objectFlags & ts.ObjectFlags.EvolvingArray))
			) {
				let typeRef = t as ts.TypeReference;

				let args = typeRef.typeArguments || ctx.checker.getTypeArguments(typeRef);
				let translated = translateType(ctx.checker, args[0]);

				let typeInfo = getWGSLTypeInfo(translated);
				let arraySize = args.length;
				if (typeInfo.needsAlignment) {
					translated = `vec4<${typeInfo.elementType ?? 'f32'}>`;
				}

				let lengths = {
					1: 'x',
					2: 'xy',
					3: 'xyz',
					4: 'xyzw'
				};

				postfix = `.${lengths[typeInfo.length ?? 1]}`;
			}

			return s([c(elem.expression), '[', c(elem.argumentExpression), ']', postfix]);

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

function isArrayType(type: ts.Type, checker: ts.TypeChecker): boolean {
	return (checker as any).isTupleType(type) || (checker as any).isArrayType(type);
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

export type UniformKeyValuePair = [string, UniformValueType];

export type PrimitiveVectorSizes = '' | '2' | '3' | '4';
export type PrimitiveUniformType =
	| `float${PrimitiveVectorSizes}`
	| `int${PrimitiveVectorSizes}`
	| `uint${PrimitiveVectorSizes}`
	| 'bool';

export class UniformValue {
	valueType: UniformValueType;
	value: any;
	order: number;

	constructor(valueType: UniformValueType, value: any, order: number = 0) {
		this.valueType = valueType;
		this.value = value;
		this.order = order;
	}
}

export type UniformValueType =
	| {
			type: 'array';
			element: UniformValueType;
			staticSize?: number;
	  }
	| {
			type: 'struct';
			fields: [string, UniformValueType];
	  }
	| {
			type: 'primitive';
			name: PrimitiveUniformType;
	  }
	| {
			type: 'primitive';
			name: 'texture2d' | 'rwtexture2d';
			element: UniformValueType;
	  }
	| {
			type: 'primitive';
			name: 'atomic';
			element: UniformValueType;
	  };

export class WGSLShader {
	key: string;
	source: string;
	sourceMapping?: IndexMapping;
	globals: [string, { fileName: string; structure: UniformValueType[] }][] = [];
	locals: UniformKeyValuePair[] = [];
	attributeInput: string = '';
	attributeOutput: string = '';

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

export function isInShader(node: ts.Node) {
	return closest(node, (node) => {
		if (
			ts.isMethodDeclaration(node) ||
			ts.isFunctionDeclaration(node) ||
			ts.isArrowFunction(node)
		) {
			if (hasShadeupDocTag(node, 'shader')) {
				return true;
			}
		}

		return false;
	});
}
export function isInRoot(node: ts.Node) {
	let c = closest(node, (node) => {
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isArrowFunction(node) ||
			ts.isMethodDeclaration(node) ||
			ts.isSourceFile(node)
		) {
			return true;
		}
	});
	return c ? ts.isSourceFile(c) : false;
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
	'texture2d',
	'atomic'
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
			f2.name?.getText() === 'atomic' ||
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

	function resolveStruct(decl: ts.ClassDeclaration, fullStruct: boolean = false) {
		let name = resolveStructName(decl);

		if (decl.name?.text == 'atomic_internal') {
			return;
		}

		if (table.structs.has(name)) {
			if (!fullStruct) {
				return;
			}
		}
		let props = table.structsProps.get(name) ?? new Set();

		for (let member of decl.members) {
			if (ts.isPropertyDeclaration(member)) {
				let type = checker.getTypeAtLocation(member);
				resolveTypeUse(type, member);

				if (fullStruct) {
					props.add(member.name.getText());
				}
			}
		}

		if (fullStruct) {
			table.structsProps.set(name, props);
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
		// if (!isPrimitiveType(typeNode)) {
		if (TYPE_BLACKLIST.includes(symbol?.getName() ?? '')) {
			throw new GLSLCompilationError(
				`Type '${symbol?.getName()}' is not supported in shaders`,
				context
			);
			return;
		}
		let decl = symbol?.getDeclarations()?.[0];
		if (decl && ts.isClassDeclaration(decl)) {
			resolveStruct(decl, fullStruct);
		}
		let typestr = checker.typeToString(typeNode);
		if (typeNode.aliasTypeArguments)
			for (let args of typeNode.aliasTypeArguments) {
				resolveTypeUse(
					args,
					context,
					typestr.startsWith('buffer<') || typestr.startsWith('buffer_internal<')
				);
			}
		// }
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

		let full = checker.getTypeAtLocation(node).getCallSignatures().length > 0;
		resolveTypeUse(typeNode, node, full);
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

				if (ts.isPropertyAccessExpression(node.expression)) {
					// if (
					// 	checker.typeToString(checker.getTypeAtLocation(node.expression.expression)) ==
					// 	'buffer<Ball>'
					// ) {
					// 	debugger;
					// }
					resolveTypeUse(
						checker.getTypeAtLocation(node.expression.expression),
						node.expression.expression
					);
					// console.log(
					// 	'Call to ',
					// 	node.expression.expression.getText(),
					// 	checker.typeToString(checker.getTypeAtLocation(node.expression.expression))
					// );
				}

				if (
					funcDeclar &&
					(ts.isFunctionDeclaration(funcDeclar) || ts.isMethodDeclaration(funcDeclar))
				) {
					let mapping = findSignatureMappingToWGSL(checker, exprSmybol);

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

		if (ts.isNewExpression(node)) {
			resolveTypeUse(checker.getTypeAtLocation(node), node.expression, true);
		}

		if (ts.isPropertyAccessExpression(node)) {
			resolvePropertyAccess(node);
		}

		if (ts.isIdentifier(node)) {
			let type = checker.getTypeAtLocation(node);
			resolveTypeUse(type, node);
			if (checker.getSymbolAtLocation(node)) {
				let decl = checker.getSymbolAtLocation(node)?.declarations;

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
	let uniforms: {
		declaration: ts.Declaration;
		usesIndexAssign: boolean;
		usesSampler: boolean;
		usesIndexRead: boolean;
	}[] = [];

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
							let indexAssign = false;
							let indexRead = false;
							let sampler = false;
							let parent = node.parent;
							if (parent && ts.isPropertyAccessExpression(parent)) {
								if (parent.expression == node) {
									if (parent.name.getText() == '__index_assign') {
										indexAssign = true;
									}
									if (parent.name.getText() == '__index') {
										indexRead = true;
										if (
											parent.parent &&
											parent.parent.parent &&
											ts.isPropertyAccessExpression(parent.parent.parent)
										) {
											if (
												parent.parent.parent.parent &&
												ts.isBinaryExpression(parent.parent.parent.parent) &&
												parent.parent.parent.parent.left == parent.parent.parent
											) {
												if (
													parent.parent.parent.parent.operatorToken.kind ==
													ts.SyntaxKind.EqualsToken
												) {
													indexAssign = true;
												}
											}

											if (
												parent.parent.parent.parent &&
												ts.isPropertyAccessExpression(parent.parent.parent.parent)
											) {
												let propType = checker.getTypeAtLocation(parent.parent.parent);
												let translatedPropType = translateType(checker, propType);
												if (translatedPropType.startsWith('atomic<')) {
													if (parent.parent.parent.parent.name.getText() != 'read') {
														indexAssign = true;
													} else {
														indexRead = true;
													}
												}
											}
										}
									}
									if (parent.name.getText() == 'sample') {
										sampler = true;
									}
								}
							}
							let idx = uniforms.findIndex((d) => d.declaration === declNode);
							if (idx == -1) {
								let translated = translateType(checker, checker.getTypeAtLocation(declNode));
								if (translated.includes('atomic<')) {
									// Force read_write on the buffer
									indexAssign = true;
								}
								uniforms.push({
									declaration: declNode,
									usesIndexAssign: indexAssign,
									usesIndexRead: indexRead,
									usesSampler: sampler
								});
							} else {
								uniforms[idx].usesIndexAssign = uniforms[idx].usesIndexAssign || indexAssign;
								uniforms[idx].usesIndexRead = uniforms[idx].usesIndexRead || indexRead;
								uniforms[idx].usesSampler = uniforms[idx].usesSampler || sampler;
							}
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
			if (calls.length != 0) {
				if (type.aliasSymbol) {
					if (type.aliasSymbol.getName() == 'shader') {
						return true;
					}
				}
			}

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

function isValidStructType(checker: ts.TypeChecker, type: ts.Type): boolean {
	let t = translateType(checker, type);
	return t != 'sampler';
}
export function addWGSLShader(
	key: string,
	root: ts.Node,
	checker: ts.TypeChecker,
	env: ShadeupEnvironment,
	isComputeShader: boolean = false,
	computeShaderSize: [number, number, number] = [1, 1, 1]
): WGSLShader | null {
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
			if (translated == 'bool') {
				translated = 'i32';
			}
			let preComment = '';

			if (!sp || !sp.has(m.name.getText())) {
				if (name != 'ShaderInput' && name != 'ShaderOutput') {
					preComment = `// `;
				}
			}
			if (!isValidStructType(checker, type)) {
				preComment = `// `;
			}
			if (preComment == '') {
				hasAnyProperty = true;
			}
			return new SourceNode(
				m.getStart(),
				m.getEnd(),
				`${preComment} ${isAlignable(translated) ? '@align(16) ' : ''} ${escapeIdentifier(
					m.name.getText()
				)}: ${translated},\n`
			);
		});

		let membersWithoutAlign = s.members.map((m) => {
			if (!ts.isPropertyDeclaration(m)) return '';

			let type = checker.getTypeAtLocation(m);
			let translated = translateType(checker, type);
			if (translated == 'bool') {
				translated = 'i32';
			}
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
				`${preComment} ${escapeIdentifier(m.name.getText())}: ${translated},\n`
			);
		});
		let hasAtomic = false;
		let memberNames = s.members
			.map((m) => {
				if (!ts.isPropertyDeclaration(m)) return ['', ''];

				let type = checker.getTypeAtLocation(m);
				let translated = translateType(checker, type);
				let preComment = '';

				if (!sp || !sp.has(m.name.getText())) {
					if (name != 'ShaderInput' && name != 'ShaderOutput') {
						return ['', ''];
					}
				}
				if (translated.startsWith('atomic<')) {
					hasAtomic = true;
				}
				return [escapeIdentifier(m.name.getText()), translated, m];
			})
			.filter((m) => m[0] != '')
			.filter((m) => {
				return isValidStructType(checker, checker.getTypeAtLocation(m[2]));
			})
			.sort((a, b) => {
				return a[0].localeCompare(b[0]);
			});

		if (!hasAnyProperty) continue; // Don't emit empty structs (glsl error)

		if (name == 'ShaderInput' || name == 'ShaderOutput') {
			members.push(new SourceNode(s.getStart(), s.getEnd(), ['// %SHADER_' + name + '%']));
		}

		preFuncs.push(
			new SourceNode(s.getStart(), s.getEnd(), [`struct ${name} {\n`, ...members, '\n};\n'])
		);
		if (name != 'ShaderInput' && name != 'ShaderOutput') {
			// We can't construct atomics in WGSL
			if (!hasAtomic) {
				preFuncs.push(
					new SourceNode(s.getStart(), s.getEnd(), [
						'fn _make_struct_' + name + '(',
						...memberNames.map((m) => {
							return `  ${m[0]}: ${m[1]},`;
						}),
						') -> ',
						name,
						' {\n',
						'var _s: ',
						name,
						';\n',
						...memberNames.map((m) => {
							if (m[1] == 'bool') {
								return `  _s.${m[0]} = select(0, 1, ${m[0]});\n`;
							} else {
								return `  _s.${m[0]} = ${m[0]};\n`;
							}
						}),
						'\nreturn _s; \n}\n'
					])
				);
			}
		}
	}

	let specialUniforms: ReturnType<typeof resolveUniforms> = [];

	preFuncs.push(
		new SourceNode(0, 0, ['struct _InUniformsStruct {\n/*SHADEUP_UNIFORM_STRUCT_START*/\n'])
	);

	let localStrs = [];
	let globalStrs = [];

	let workgroupVars: ts.VariableDeclaration[] = [];

	let checkDecl = (node: ts.VariableDeclaration) => {
		let fullText = node.getSourceFile().getFullText();
		let fullStart = node.getFullStart();
		let prefix = `// @workgroup\n `;

		let mySelf = fullText.slice(fullStart - prefix.length, fullStart);

		if (mySelf.includes('@workgroup')) {
			workgroupVars.push(node);
		}
	};

	if (ts.isArrowFunction(root)) {
		ts.forEachChild(root.body, (node) => {
			if (
				ts.isVariableDeclaration(node) ||
				ts.isVariableStatement(node) ||
				ts.isVariableDeclarationList
			) {
				if (ts.isVariableDeclaration(node)) {
					checkDecl(node);
				} else if (ts.isVariableStatement(node)) {
					node.declarationList.declarations.forEach((d) => {
						checkDecl(d);
					});
				} else if (ts.isVariableDeclarationList(node)) {
					for (let d of node.declarations) {
						checkDecl(d);
					}
				}
			}
		});
	}

	let globalUnis = [];
	let localUnis = [];
	for (let uniformData of uniforms) {
		let u = uniformData.declaration;
		if (isUniformable(checker, u)) {
			let _type = checker.getTypeAtLocation(u);
			let translated = translateType(checker, _type);

			let isGlobalVar = isRootNode(u);
			let glslVarName = `_ext_uniform_${isGlobalVar ? 'global' : 'local'}_${u.name.getText()}`;
			let isSpecial = isSpecialUniformType(translated);

			let pushTo = isGlobalVar ? globalStrs : localStrs;

			if (translated.startsWith('array')) {
				// translated = translated.replace('[]', `[%${glslVarName}_size%]`);
				pushTo.push(
					new SourceNode(u.getStart(), u.getEnd(), ['@align(16) ', glslVarName, '_size: i32,\n'])
				);
			}
			if (translated.startsWith('atomic')) {
				pushTo.push(
					new SourceNode(u.getStart(), u.getEnd(), ['@align(16) ', glslVarName, '_dummy: u32,\n'])
				);
			}
			if (translated == 'sampler') {
				pushTo.push(
					new SourceNode(u.getStart(), u.getEnd(), [
						'@align(16) ',
						glslVarName,
						'_size: vec2<f32>,\n'
					])
				);
			}
			if (isSpecial) {
				if (isGlobalVar) {
					globalUnis.push(uniformData);
				} else {
					localUnis.push(uniformData);
				}
			} else {
				pushTo.push(
					new SourceNode(u.getStart(), u.getEnd(), [
						(isAlignable(translated) ? '@align(16) ' : '') + glslVarName,
						': ',
						translated,
						',\n'
					])
				);
			}
		}
	}
	specialUniforms.push(...localUnis, ...globalUnis);
	if (localStrs.length == 0 && globalStrs.length == 0) {
		preFuncs.push(new SourceNode(0, 0, ['', 'dummy', ': vec4<f32>,\n']));
	} else {
		preFuncs = [...preFuncs, ...localStrs, ...globalStrs];
	}
	preFuncs.push(new SourceNode(0, 0, ['};\n']));
	preFuncs.push(
		new SourceNode(0, 0, [
			'@group(%GROUP_INDEX%) @binding(1) var<uniform> _in_uniforms: _InUniformsStruct;\n'
		])
	);

	let specialUniformsCounter = 2;
	for (let uniformData of specialUniforms) {
		let u = uniformData.declaration;
		if (isUniformable(checker, u)) {
			let _type = checker.getTypeAtLocation(u);
			let translated = translateType(checker, _type, false, true);
			let isGlobalVar = isRootNode(u);
			let glslVarName = `_ext_uniform_${isGlobalVar ? 'global' : 'local'}_${u.name.getText()}`;

			let storageType = 'storage, ';
			if (translated == 'sampler' || translated.startsWith('array<sampler')) {
				let typeArgs = checker.getTypeArguments(_type as ts.TypeReference);
				if (translated.startsWith('array<sampler')) {
					typeArgs = checker.getTypeArguments(typeArgs[0] as ts.TypeReference);
				}
				let innerTranslated = translateType(checker, typeArgs[0]);
				let innerWithVec = innerTranslated;
				let vecRegex = /vec\d<([^>]+)>/g;
				innerTranslated = innerTranslated.replace(vecRegex, '$1');

				let writeType = '';
				if (innerWithVec == 'vec4<f32>') {
					writeType = 'rgba32float';
				} else if (innerWithVec == 'vec4<i32>') {
					writeType = 'rgba32sint';
				} else if (innerWithVec == 'vec4<u32>') {
					writeType = 'rgba32uint';
				} else if (innerWithVec == 'vec3<f32>') {
					writeType = 'rgb32float';
				} else if (innerWithVec == 'vec3<i32>') {
					writeType = 'rgb32sint';
				} else if (innerWithVec == 'vec3<u32>') {
					writeType = 'rgb32uint';
				} else if (innerWithVec == 'vec2<f32>') {
					writeType = 'rg32float';
				} else if (innerWithVec == 'vec2<i32>') {
					writeType = 'rg32sint';
				} else if (innerWithVec == 'vec2<u32>') {
					writeType = 'rg32uint';
				} else if (innerWithVec == 'f32') {
					writeType = 'r32float';
				} else if (innerWithVec == 'i32') {
					writeType = 'r32sint';
				} else if (innerWithVec == 'u32') {
					writeType = 'r32uint';
				}

				let textureKind = 'texture_2d';
				let textureKindStorage = 'texture_storage_2d';

				if (isArrayType(_type, checker)) {
					textureKind = 'texture_2d_array';
					textureKindStorage = 'texture_storage_2d_array';
				}

				if (translated.startsWith('array<sampler')) {
					translated = 'sampler';
				}

				if (uniformData.usesSampler && uniformData.usesIndexAssign) {
					preFuncs.push(
						new SourceNode(0, 0, [
							`@group(%GROUP_INDEX%) @binding(${specialUniformsCounter}) var ${glslVarName}_texture: ${textureKind}<${innerTranslated}>;\n`,
							`@group(%GROUP_INDEX%) @binding(${
								specialUniformsCounter + 1
							}) var ${glslVarName}: ${translated};\n`,
							`@group(%GROUP_INDEX%) @binding(${
								specialUniformsCounter + 2
							}) var ${glslVarName}_texture_write: ${textureKindStorage}<%WRITE_TYPE_${glslVarName}%, write>;\n`
						])
					);

					specialUniformsCounter += 2;
				} else if (uniformData.usesIndexAssign) {
					preFuncs.push(
						new SourceNode(0, 0, [
							`@group(%GROUP_INDEX%) @binding(${specialUniformsCounter}) var ${glslVarName}_texture: ${textureKind}<${innerTranslated}>;\n`,

							`@group(%GROUP_INDEX%) @binding(${
								specialUniformsCounter + 1
							}) var ${glslVarName}_texture_write: ${textureKindStorage}<%WRITE_TYPE_${glslVarName}%, write>;\n`
						])
					);

					specialUniformsCounter += 1;
				} else if (uniformData.usesSampler || uniformData.usesIndexRead) {
					preFuncs.push(
						new SourceNode(0, 0, [
							`@group(%GROUP_INDEX%) @binding(${specialUniformsCounter}) var ${glslVarName}_texture: ${textureKind}<${innerTranslated}>;\n`,
							`@group(%GROUP_INDEX%) @binding(${
								specialUniformsCounter + 1
							}) var ${glslVarName}: ${translated};\n`
						])
					);

					specialUniformsCounter += 1;
				}
			} else if (translated.startsWith('atomic')) {
				preFuncs.push(
					new SourceNode(0, 0, [
						`@group(%GROUP_INDEX%) @binding(${specialUniformsCounter}) var<storage, read_write> ${glslVarName}: ${translated};\n`
					])
				);
			} else if (translated.startsWith('array') || translated.startsWith('buffer')) {
				let usageType = 'read';
				if (uniformData.usesIndexAssign) {
					usageType = 'read_write';
				}
				preFuncs.push(
					new SourceNode(0, 0, [
						`@group(%GROUP_INDEX%) @binding(${specialUniformsCounter}) var<storage, ${usageType}> ${glslVarName}: ${translated};\n`
					])
				);
			}

			specialUniformsCounter++;
		}
	}

	for (let workgroupVar of workgroupVars) {
		// return s([
		// 	'var ',
		// 	escapeIdentifier(varDecl.name.getText()),
		// 	': ',
		// 	translateType(ctx.checker, type),
		// 	' = ',
		// 	c(varDecl.initializer!)
		// ]);
		preFuncs.push(
			new SourceNode(0, 0, [
				`var<workgroup> ${escapeIdentifier(workgroupVar.name.getText())}: ${translateType(
					checker,
					checker.getTypeAtLocation(workgroupVar.type)
				)};\n`
			])
		);
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
	let customAttributesIn = new Map<number, [string, string]>();
	let customAttributesOut = new Map<number, [string, string]>();
	let main = compile(
		{
			checker,
			isComputeShader,
			computeSize: computeShaderSize,
			addCustomAttribute(
				type: 'in' | 'out',
				idx: number,
				valType: string,
				interp: 'flat' | 'linear' | 'perspective'
			) {
				if (type == 'in') {
					customAttributesIn.set(idx, [valType, interp]);
				} else if (type == 'out') {
					customAttributesOut.set(idx, [valType, interp]);
				}
			}
		},
		root,
		originalFile.mapping
	);

	preFuncs.push(main);

	let source = new SourceNode(root.getStart(), root.getEnd(), preFuncs);

	let ss = { indexMapping: [], str: '' };

	source.toString(ss);
	let finalShaderOutput = ss.str;

	let customIns = [];
	for (let [idx, [valType, interp]] of customAttributesIn.entries()) {
		customIns.push(`@location(${7 + idx}) @interpolate(${interp}) custom${idx}: ${valType},\n`);
	}

	finalShaderOutput = finalShaderOutput.replace('// %SHADER_ShaderInput%\n', customIns.join(''));

	let customOuts = [];
	for (let [idx, [valType, interp]] of customAttributesOut.entries()) {
		customOuts.push(`@location(${7 + idx}) @interpolate(${interp}) custom${idx}: ${valType},\n`);
	}

	let matches = wgslHeader.match(/fn ([^\(]+)/gm);

	let headerSplits = [];

	for (let i = 0; i < matches.length; i++) {
		let index = wgslHeader.indexOf(matches[i]);
		let toIndex = i == matches.length - 1 ? wgslHeader.length : wgslHeader.indexOf(matches[i + 1]);
		headerSplits.push(wgslHeader.substring(index, toIndex));
	}

	let realHeader = '';
	for (let i = 0; i < headerSplits.length; i++) {
		let headerText = headerSplits[i];
		let fnName = headerText.match(/fn ([^\(]+)/)?.[1];

		if (fnName) {
			if (finalShaderOutput.includes(fnName)) {
				realHeader += headerText;
			}
		}
	}

	finalShaderOutput = realHeader + finalShaderOutput;

	let output = new WGSLShader(`shd_${key}`, finalShaderOutput);
	output.sourceMapping = ss.indexMapping;
	output.attributeInput = customIns.join('');
	output.attributeOutput = customOuts.join('');

	for (let uniformData of uniforms) {
		let u = uniformData.declaration;
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
							for (let fi = props.fields.length - 1; fi >= 0; fi--) {
								let f = props.fields[fi];
								if (!sp || !sp.has(f[0])) {
									props.fields.splice(fi, 1);
								} else {
									if (f[1].type == 'struct') {
										f[1] = filterProps(f[1]);
									}
								}
							}
						}
					}

					if (
						props &&
						(props.type == 'buffer' || (props.type == 'primitive' && props.name == 'texture2d'))
					) {
						if (uniformData.usesSampler && uniformData.usesIndexAssign) {
							props.access = 'sample_write';
						} else if (uniformData.usesIndexAssign) {
							props.access = 'write';
						} else if (uniformData.usesSampler) {
							props.access = 'sample';
						} else {
							props.access = 'read';
						}
					} else if (
						props &&
						props.type == 'array' &&
						props.element.type == 'primitive' &&
						props.element.name == 'texture2d'
					) {
						if (uniformData.usesSampler && uniformData.usesIndexAssign) {
							props.element.access = 'sample_write';
						} else if (uniformData.usesIndexAssign) {
							props.element.access = 'write';
						} else if (uniformData.usesSampler) {
							props.element.access = 'sample';
						} else {
							props.element.access = 'read';
						}
					}

					return props;
				}
				if (isGlobalVar) {
					let typeOut = getDeclarationType(checker, u);
					output.globals.push([
						name,
						{
							fileName: getNodeSourceFileName(u),
							structure: filterProps(translateType(checker, typeOut, true))
						}
					]);
				} else {
					output.locals.push([
						name,
						filterProps(translateType(checker, getDeclarationType(checker, u), true))
					]);
				}
			}
		}
	}

	return output;
}

function isAlignable(t: string) {
	return t.startsWith('vec') || t == 'f32' || t == 'i32' || t == 'u32';
}

function isSpecialUniformType(t: string) {
	return (
		t == 'sampler' || t.startsWith('array') || t.startsWith('buffer') || t.startsWith('atomic')
	);
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
					let mapping = findSignatureMappingToWGSL(checker, exprSmybol);
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

function getTypeFlags(flags: ts.TypeFlags) {
	let out = [];
	for (let k in ts.TypeFlags) {
		if (flags & (ts.TypeFlags[k] as any)) {
			out.push(k);
		}
	}
	return out;
}

function getObjectFlags(flags: ts.ObjectFlags) {
	let out = [];
	for (let k in ts.ObjectFlags) {
		if (flags & (ts.ObjectFlags[k] as any)) {
			out.push(k);
		}
	}
	return out;
}

function getSymbolAtLocationAndFollowAliases(
	checker: ts.TypeChecker,
	node: ts.Node
): ts.Symbol | undefined {
	let exprSmybol = checker.getSymbolAtLocation(node);
	if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
		exprSmybol = checker.getAliasedSymbol(exprSmybol);
	}
	return exprSmybol;
}

/**
 * Looks for any doc comments that instruct the translator to map a js function to a glsl function
 */
function findSignatureMappingToWGSL(checker: ts.TypeChecker, sym: ts.Symbol) {
	let matcher = /=(?:wgsl|univ)\((.+)\)$/g;
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

function removeDoubleUnderscores(str: string) {
	return str.replace(/__/g, '_ii');
}
