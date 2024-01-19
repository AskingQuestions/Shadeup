import ts from 'typescript';
import { SourceNode } from './root';

export type TSVisitData = {
	ast: ts.Node;
	checker: ts.TypeChecker;
	getType: () => ts.Type;

	/** Visits the node and evaluates the handler */
	c: (ast: ts.Node) => SourceNode | string;

	/** Generates a SourceNode based on the current ast node */
	s: (c: (SourceNode | string)[]) => SourceNode;

	/** Generates a SourceNode based on the provided ast node*/
	sWith: (c: (SourceNode | string)[], n: ts.Node) => SourceNode;
};

export type TSVisitHandler = (data: TSVisitData) => SourceNode | string;

export type TSVisitMapper = {
	function: TSVisitHandler;
	if: TSVisitHandler;
	identifier: TSVisitHandler;
	number: TSVisitHandler;
	string: TSVisitHandler;
	program: TSVisitHandler;
	expression_statement: TSVisitHandler;
	binary_expression: TSVisitHandler;
	function_declaration: TSVisitHandler;
};
