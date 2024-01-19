import ts from 'typescript';

export function resolveNodeName(c: ts.Node) {
	return `${c.getSourceFile().fileName.replaceAll('/', '_').replaceAll('.', '_')}_${c.getStart()}`;
}

export function cleanName(name: string) {
	return name
		.replaceAll('file:///', '')
		.replaceAll('.', '_dot_')
		.replaceAll('/', '_slash_')
		.replaceAll('-', '_dash_');
}

export function closest(node: ts.Node, cb: (node: ts.Node) => boolean) {
	while (node) {
		if (cb(node)) return node;
		node = node.parent!;
	}
	return null;
}

/**
 * Finds any @shadeup=tag(xyz) tags on a function declaration
 */
export function findShadeupTags(declar: ts.FunctionDeclaration | ts.MethodDeclaration): string[] {
	let matcher = /=tag\((.+)\)$/g;
	let doc = ts.getJSDocTags(declar);

	for (let d of doc) {
		if (d.tagName.text !== 'shadeup') continue;

		if (typeof d.comment === 'string') {
			let matches = matcher.exec(d.comment);
			if (matches) {
				return matches[1].split(',').map((s) => s.trim());
			}
		}
	}
	return [];
}

export function getFunctionDeclarationFromCallExpression(
	checker: ts.TypeChecker,
	node: ts.CallExpression
): ts.FunctionDeclaration | undefined {
	if (ts.isCallExpression(node)) {
		let exprSmybol = checker.getSymbolAtLocation(node.expression);
		if (exprSmybol && exprSmybol.flags & ts.SymbolFlags.Alias) {
			exprSmybol = checker.getAliasedSymbol(exprSmybol);
		}
		if (exprSmybol) {
			let funcDeclar = exprSmybol.getDeclarations()?.[0];

			if (funcDeclar && ts.isFunctionDeclaration(funcDeclar)) {
				return funcDeclar;
			}
		}
	}
}
