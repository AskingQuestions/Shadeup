import { SyntaxNode } from 'web-tree-sitter';
import { GLSLShader } from '../generator/glsl';

type AstDiagnostic = {
	message: string;
	node: SyntaxNode;
};

export class AstContext {
	fileName: string;
	impls: Map<string, SyntaxNode[]> = new Map();
	implsFor: Map<string, SyntaxNode[]> = new Map();
	shaders: GLSLShader[] = [];
	diagnostics: AstDiagnostic[] = [];
	globals: string[] = [];

	constructor(fileName: string) {
		this.fileName = fileName;
	}

	report(node: SyntaxNode, message: string) {
		this.diagnostics.push({ message, node });
	}

	addImpl(name: string, node: SyntaxNode) {
		if (this.impls.has(name)) {
			this.impls.get(name)!.push(node);
		} else {
			this.impls.set(name, [node]);
		}
	}

	addImplFor(name: string, node: SyntaxNode) {
		if (this.implsFor.has(name)) {
			this.implsFor.get(name)!.push(node);
		} else {
			this.implsFor.set(name, [node]);
		}
	}
}
