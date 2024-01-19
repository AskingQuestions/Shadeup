import type { MonacoEditorInstance } from 'src/monaco/editor';
import type { ShadeupWorkspaceInterface } from '../compiler/interface';
import monaco from '../../monaco/monaco';

import ts from 'typescript';

export function connectMonacoEditorToShadeupWorkspace(
	workspace: ShadeupWorkspaceInterface,
	path: string,
	monacoFilename: string,
	editor: MonacoEditorInstance
) {
	editor.editor?.setValue(workspace.files.get(path) ?? '');

	editor.editor?.onDidChangeModelContent((e) => {
		workspace.writeFile(path, editor.editor?.getValue() ?? '', true);

		setTimeout(() => {
			workspace.writeFile(path, editor.editor?.getValue() ?? '');
		}, 100);
	});

	let model = editor?.editor?.getModel();

	if (model) {
		let m = model as monaco.editor.ITextModel;

		(model as any).$shd = {
			async provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position) {
				let offset = model.getOffsetAt(position);
				let completions = await workspace.getCompletions(path, offset);

				let items: monaco.languages.CompletionItem[] = [];

				for (let completion of completions) {
					let c = completion.completion;
					let kind =
						{
							[ts.ScriptElementKind.functionElement]: monaco.languages.CompletionItemKind.Function,

							[ts.ScriptElementKind.memberVariableElement]:
								monaco.languages.CompletionItemKind.Field,
							[ts.ScriptElementKind.memberGetAccessorElement]:
								monaco.languages.CompletionItemKind.Field,
							[ts.ScriptElementKind.memberSetAccessorElement]:
								monaco.languages.CompletionItemKind.Field,
							[ts.ScriptElementKind.variableElement]: monaco.languages.CompletionItemKind.Variable,
							[ts.ScriptElementKind.constElement]: monaco.languages.CompletionItemKind.Variable,
							[ts.ScriptElementKind.localVariableElement]:
								monaco.languages.CompletionItemKind.Variable,
							[ts.ScriptElementKind.classElement]: monaco.languages.CompletionItemKind.Class,
							[ts.ScriptElementKind.interfaceElement]:
								monaco.languages.CompletionItemKind.Interface,
							[ts.ScriptElementKind.typeElement]: monaco.languages.CompletionItemKind.Class,
							[ts.ScriptElementKind.enumElement]: monaco.languages.CompletionItemKind.Enum,
							[ts.ScriptElementKind.moduleElement]: monaco.languages.CompletionItemKind.Module,
							[ts.ScriptElementKind.keyword]: monaco.languages.CompletionItemKind.Keyword,
							[ts.ScriptElementKind.scriptElement]: monaco.languages.CompletionItemKind.File,
							[ts.ScriptElementKind.alias]: monaco.languages.CompletionItemKind.File,
							[ts.ScriptElementKind.letElement]: monaco.languages.CompletionItemKind.Variable,
							[ts.ScriptElementKind.directory]: monaco.languages.CompletionItemKind.Folder,
							[ts.ScriptElementKind.string]: monaco.languages.CompletionItemKind.Text
						}[c.kind.toString()] ?? monaco.languages.CompletionItemKind.Property;

					let parts = displayPartsToString(completion.details?.displayParts);
					if (c.kind.toString() == ts.ScriptElementKind.alias) {
						if (parts.startsWith('(alias) class')) {
							kind = monaco.languages.CompletionItemKind.Class;
						} else if (parts.startsWith('(alias) enum')) {
							kind = monaco.languages.CompletionItemKind.Enum;
						} else if (parts.startsWith('(alias) interface')) {
							kind = monaco.languages.CompletionItemKind.Interface;
						} else if (parts.startsWith('(alias) type')) {
							kind = monaco.languages.CompletionItemKind.Class;
						} else if (parts.startsWith('(alias) namespace')) {
							kind = monaco.languages.CompletionItemKind.Module;
						} else if (parts.startsWith('(alias) function')) {
							kind = monaco.languages.CompletionItemKind.Function;
						} else if (parts.startsWith('(alias) var') || parts.startsWith('(alias) let')) {
							kind = monaco.languages.CompletionItemKind.Variable;
						} else if (parts.startsWith('(alias) const')) {
							kind = monaco.languages.CompletionItemKind.Variable;
						}
					}

					if (c.kind.toString() == ts.ScriptElementKind.string) {
						c.name = `"${c.name.replace(/"/g, '')}"`;
					}

					let documentation =
						completion.details?.documentation?.map((p) => ({ value: p.text })) ?? [];

					if (!c.name.startsWith('__'))
						items.push({
							label: c.name,
							sortText: c.sortText,
							kind,
							insertText: c.name,
							detail: parts,
							documentation: documentation[0] ?? undefined,
							range: (completion as any).range
						});
				}

				return {
					suggestions: items
				};
			},
			async provideHover(
				model: monaco.editor.ITextModel,
				position: monaco.Position
			): Promise<monaco.languages.Hover | null> {
				let offset = model.getOffsetAt(position);
				let hover = await workspace.getHover(path, offset);
				if (hover) {
					let contents: monaco.IMarkdownString[] = [];
					if (hover.displayParts) {
						let content = '';
						for (let p of hover.displayParts) {
							// if (p.kind == ts.SymbolDisplayPartKind)
							content += p.text;
						}
						contents.push({ value: '```ts\n' + content.replaceAll('__.', '') + '\n```' });
					}
					if (hover.documentation) {
						let documentation = hover.documentation.map((p) => ({ value: p.text }));
						contents = contents.concat(documentation);
					}

					return {
						contents,
						range: hover.range
					};
				}
				return null;
			}
		};

		workspace.on('diagnostic', (e) => {
			let alerts: monaco.editor.IMarkerData[] = [];
			for (let d of e.detail.diagnostics) {
				if (d.path === path) {
					alerts.push({
						message: d.message,
						startLineNumber: d.startLine,
						startColumn: d.startColumn,
						endLineNumber: d.endLine,
						endColumn: d.endColumn,
						severity: monaco.MarkerSeverity.Error
					});
				}
			}

			monaco.editor.setModelMarkers(m, 'shadeup', alerts);
		});
	}
}

function displayPartsToString(parts?: ts.SymbolDisplayPart[]): string {
	if (parts) {
		let content = '';
		for (let p of parts) {
			content += p.text;
		}
		return content.replaceAll('__.', '').replaceAll('(property)', '').replaceAll('(method)', '');
	} else {
		return '';
	}
}
