import type ts from 'typescript';
import type { ClassificationRanges } from '../../../../shadeup-frontend/lib/environment/ShadeupEnvironment';
import type { IndexMapping } from '../../../../shadeup-frontend/lib/generator/root';

export type ShadeupFileOutput = {
	path: string;
	contents: string;
	mapping: IndexMapping;
};

export type ShadeupRenderedFile = {
	path: string;
	contents: string;
};

export type ShadeupDiagnostic = {
	path: string;
	level: 'info' | 'warning' | 'error';
	fullMessage: string;
	startLine: number;
	startColumn: number;
	endLine: number;
	endColumn: number;
	message: string;
};

export type MessageWorkerToMain = {
	nonce: number;
	files: ShadeupFileOutput[];
	diagnostics: ShadeupDiagnostic[];
	classifications?: {
		path: string;
		encoded: ClassificationRanges;
	};
	completions: {
		completion: ts.CompletionEntry;
		details: ts.CompletionEntryDetails | undefined;
	}[];
	hover:
		| (ts.QuickInfo & {
				range: {
					startLineNumber: number;
					endLineNumber: number;
					startColumn: number;
					endColumn: number;
				};
		  })
		| null;
	output: ShadeupRenderedFile[];
	ready: boolean;
};

type WriteFileMessage = {
	path: string;
	contents: string;
	emit: boolean;
	ignoreErrors?: boolean;
};

type GetCompletionsMessage = {
	path: string;
	position: number;
};

type GetHoverMessage = {
	path: string;
	position: number;
};

export type MessageMainToWorker = {
	nonce?: number;
} & (
	| {
			key: 'writeFile';
			message: WriteFileMessage;
	  }
	| {
			key: 'writeFileTypescript';
			message: WriteFileMessage;
	  }
	| {
			key: 'getCompletions';
			message: GetCompletionsMessage;
	  }
	| {
			key: 'getHover';
			message: GetHoverMessage;
	  }
	| {
			key: 'init';
	  }
	| {
			key: 'build';
	  }
	| { key: 'reset' }
	| { key: 'assets'; message: [string, [string, string]][] }
);
