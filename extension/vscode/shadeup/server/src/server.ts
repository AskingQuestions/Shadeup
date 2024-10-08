/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  SemanticTokensBuilder,
} from "vscode-languageserver/node";
import { makeLSPCompiler } from "../compiler-dist/compiler.js";
import * as ts from "typescript";

import { TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
let env: any = undefined;

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

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
  level: "info" | "warning" | "error";
  fullMessage: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  message: string;
};

export function indexToRowColumn(str: string, index: number) {
  let row = 0;
  let column = 0;
  for (let i = 0; i < index; i++) {
    if (str[i] === "\n") {
      row++;
      column = 0;
    } else {
      column++;
    }
  }
  return { row, column };
}

export function rowColumnToIndex(str: string, row: number, column: number) {
  let index = 0;
  let currentRow = 0;
  let currentColumn = 0;
  while (currentRow < row || currentColumn < column) {
    if (str[index] === "\n") {
      currentRow++;
      currentColumn = 0;
    } else {
      currentColumn++;
    }
    index++;
  }
  return index;
}

export type IndexMapping = [number, number, number, number][];
export type SourceString = {
  str: string;
  indexMapping: IndexMapping;
};

export type ShadeupGenericDiagnostic = {
  message: string;
  startIndex: number;
  endIndex: number;
};

// Finds the smallest range in the index mapping that contains the given range
export function lookupIndexMappingRange(
  indexMapping: IndexMapping,
  start: number,
  end: number
) {
  let minStart = Infinity;
  let maxEnd = -Infinity;
  let size = 0;
  for (const [oldStart, oldEnd, newStart, newEnd] of indexMapping) {
    if (start >= newStart && end <= newEnd) {
      if (oldEnd - oldStart < size || size === 0) {
        minStart = oldStart;
        maxEnd = oldEnd;
        size = oldEnd - oldStart;
      }
    }
  }
  return { start: minStart, end: maxEnd };
}

function findFile(path: string) {
  return env.files.find((f: any) => f.path === path);
}

function tsDiagnosticToShadeupDiagnostic(diag: {
  error: ts.Diagnostic;
  file: string;
  message: string;
}): Diagnostic | null {
  let path = diag.error.file?.fileName ?? "";
  let file = findFile(path);
  if (!file) return null;
  let mapping = file.mapping;
  if (!mapping) return null;

  let to = lookupIndexMappingRange(
    mapping,
    diag.error.start ?? 0,
    (diag.error.start ?? 0) + (diag.error.length ?? 0)
  );

  let fileSource = file.content;
  if (fileSource) {
    let start = indexToRowColumn(fileSource, to.start);
    let end = indexToRowColumn(fileSource, to.end);

    return {
      severity: DiagnosticSeverity.Error,
      /**
       * A human-readable string describing the source of this
       * diagnostic, e.g. 'typescript' or 'super lint'. It usually
       * appears in the user interface.
       */
      source: "shadeup",
      /**
       * The diagnostic's message. It usually appears in the user interface
       */
      message: ts.flattenDiagnosticMessageText(diag.error.messageText, "\n"),

      range: {
        start: {
          character: start.column,
          line: start.row,
        },
        end: {
          character: end.column,
          line: end.row,
        },
      },
    };
  }

  return null;
}

function genericDiagnosticToShadeupDiagnostic(
  path: string,
  diag: ShadeupGenericDiagnostic
): Diagnostic | null {
  let file = findFile(path);
  if (!file) return null;
  let mapping = file.mapping;
  if (!mapping) return null;

  let fileSource = file.content;
  if (fileSource) {
    let start = indexToRowColumn(fileSource, diag.startIndex);
    let end = indexToRowColumn(fileSource, diag.endIndex);

    return {
      source: "shadeup",
      message: diag.message ?? "",
      range: {
        start: {
          character: start.column,
          line: start.row,
        },
        end: {
          character: end.column,
          line: end.row,
        },
      },
    };
  }

  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let dirtyFiles = new Set<string>();
const TOKEN_TYPES = [
  "class",
  "comment",
  "constant",
  "function",
  "keyword",
  "number",
  "operator",
  "parameter",
  "property",
  "string",
  "type",
  "variable",
];
const TOKEN_MAP = {
  class: "class",
  comment: "comment",
  constant: "constant",
  function: "function",
  functionElement: "function",
  keyword: "keyword",
  let: "variable",
  alias: "keyword",
  const: "variable",
  constElement: "variable",
  letElement: "variable",
  number: "number",
  operator: "operator",
  parameter: "parameter",
  property: "property",
  string: "string",
  type: "type",
  typeElement: "type",
  variable: "variable",
  var: "variable",
  "local var": "variable",
  variableElement: "variable",
  localVariableElement: "variable",
};
connection.onInitialize(async (params: InitializeParams) => {
  const capabilities = params.capabilities;

  env = await makeLSPCompiler();
  connection.console.log("Initialized");

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
      semanticTokensProvider: {
        legend: {
          tokenTypes: TOKEN_TYPES,
          tokenModifiers: ["declaration", "definition", "readonly"],
        },
        range: false,
        full: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

connection.onDidChangeConfiguration((change) => {});

// Only keep settings for open documents
documents.onDidClose((e) => {});

function cleanPath(path: string) {
  path = path.replace("file://", "");
  path = path.replace("%3A", ":").replace(/\\/g, "/");
  // path = path.split("/").slice(-1)[0];
  path = path.replace(".shadeup", ".ts");
  return path;
}

const tokenBuilders: Map<string, SemanticTokensBuilder> = new Map();
documents.onDidClose((event) => {
  tokenBuilders.delete(event.document.uri);
});
function getTokenBuilder(document: TextDocument): SemanticTokensBuilder {
  let result = tokenBuilders.get(document.uri);
  if (result !== undefined) {
    return result;
  }
  result = new SemanticTokensBuilder();
  tokenBuilders.set(document.uri, result);
  return result;
}

let docChangePromise: Map<string, Promise<void>> = new Map();

connection.languages.semanticTokens.on(async (params) => {
  let path = cleanPath(params.textDocument.uri);

  let docChange =
    docChangePromise.get(params.textDocument.uri) ?? Promise.resolve();
  await Promise.race([docChange, delay(400)]);

  const document = documents.get(params.textDocument.uri);
  let file = findFile(path);
  if (!file) return { data: [] };
  if (document === undefined) {
    return { data: [] };
  }
  // const builder = getTokenBuilder(document);
  let builder = new SemanticTokensBuilder();
  let toks = env.classifications(path);
  toks.ranges.sort((a: any, b: any) => a[0] - b[0]);
  for (let tok of toks.ranges) {
    let s = tok[0];
    let e = tok[1];
    let type = (TOKEN_MAP as any)[tok[2]];

    let fileSource = file.content;
    // let start = indexToRowColumn(fileSource, s);
    // let end = indexToRowColumn(fileSource, e);
    let start = document.positionAt(s);
    let length = e - s;

    builder.push(
      start.line,
      start.character,
      length,
      TOKEN_TYPES.indexOf(type),
      0
    );
  }

  return builder.build();
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.

let currentContentChange: NodeJS.Timeout | null = null;

documents.onDidChangeContent((change) => {
  let outResolve = () => {};
  let resolveable = new Promise<void>((resolve) => {
    outResolve = resolve;
  });
  docChangePromise.set(change.document.uri, resolveable);
  if (currentContentChange) clearTimeout(currentContentChange);
  currentContentChange = setTimeout(async () => {
    const contents = change.document.getText();
    let path = cleanPath(change.document.uri);

    const ignoreErrors = false;

    await env.writeFile(path, contents, ignoreErrors);
    // let filesToGenerate = [e.data.message.path];
    // for (let dirty of dirtyFiles) {
    // 	if (dirty !== e.data.message.path) filesToGenerate.push(dirty);
    // }

    let output: {
      path: string;
      contents: string;
    }[] = [];
    // if (e.data.message.emit) output = await env.regenerate(filesToGenerate);

    //await env.regenerate();
    let errors: {
      error: ts.Diagnostic;
      file: string;
      message: string;
    }[] = [];

    if (!ignoreErrors) {
      errors = await env.errors([path]);
    }

    outResolve();

    let file = findFile(path);

    let diags: Diagnostic[] = [];

    for (let parseError of file?.parseDiagnostics ?? []) {
      if (parseError.path !== path) continue;
      let diag = genericDiagnosticToShadeupDiagnostic(path, parseError);
      if (diag) diags.push(diag);
    }

    for (let error of errors) {
      if (error.file !== path) continue;
      let diag = tsDiagnosticToShadeupDiagnostic(error);
      if (diag) diags.push(diag);
    }

    // let output: ShadeupRenderedFile[] = [];

    if (errors.length == 0) {
      dirtyFiles.clear();
      // console.log('Output', e.data.message.path, output);
    } else {
      dirtyFiles.add(path);
      // console.log('Errors', e.data.message.path, errors);
    }
    // connection.console.log(JSON.stringify(env.classifications(path)));

    const diagnostics: Diagnostic[] = diags.map((d) => d);

    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });

    // console.log('Sending writefile nonce', e.data.nonce);
    // postMessage({
    // 	nonce: e.data.nonce,
    // 	classifications: {
    // 		path: e.data.message.path,
    // 		encoded: env.classifications(e.data.message.path)
    // 	},
    // 	files: env.files.map((f) => ({
    // 		path: f.path,
    // 		contents: f.content,
    // 		mapping: f.mapping
    // 	})),
    // 	diagnostics: diags,
    // 	output
    // });
  }, 400);
});

connection.onDidChangeWatchedFiles(async (_change) => {});

function displayPartsToString(parts?: ts.SymbolDisplayPart[]): string {
  if (parts) {
    let content = "";
    for (let p of parts) {
      content += p.text;
    }
    return content
      .replace(/__\./g, "")
      .replace(/\(property\)/g, "")
      .replace(/\(method\)/g, "");
  } else {
    return "";
  }
}

connection.onCompletion(
  async (
    _textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    const doc = documents.get(_textDocumentPosition.textDocument.uri);
    if (!doc) return [];
    let offset = doc.offsetAt(_textDocumentPosition.position);
    const path = cleanPath(_textDocumentPosition.textDocument.uri);
    let start = Date.now();
    let completions = await env.completions(path, offset);

    let items: CompletionItem[] = [];

    for (let completion of completions) {
      let c = completion.completion;
      let kind =
        (
          {
            [ts.ScriptElementKind.functionElement]: CompletionItemKind.Function,

            [ts.ScriptElementKind.memberVariableElement]:
              CompletionItemKind.Field,
            [ts.ScriptElementKind.memberGetAccessorElement]:
              CompletionItemKind.Field,
            [ts.ScriptElementKind.memberSetAccessorElement]:
              CompletionItemKind.Field,
            [ts.ScriptElementKind.variableElement]: CompletionItemKind.Variable,
            [ts.ScriptElementKind.constElement]: CompletionItemKind.Variable,
            [ts.ScriptElementKind.localVariableElement]:
              CompletionItemKind.Variable,
            [ts.ScriptElementKind.classElement]: CompletionItemKind.Class,
            [ts.ScriptElementKind.interfaceElement]:
              CompletionItemKind.Interface,
            [ts.ScriptElementKind.typeElement]: CompletionItemKind.Class,
            [ts.ScriptElementKind.enumElement]: CompletionItemKind.Enum,
            [ts.ScriptElementKind.moduleElement]: CompletionItemKind.Module,
            [ts.ScriptElementKind.keyword]: CompletionItemKind.Keyword,
            [ts.ScriptElementKind.scriptElement]: CompletionItemKind.File,
            [ts.ScriptElementKind.alias]: CompletionItemKind.File,
            [ts.ScriptElementKind.letElement]: CompletionItemKind.Variable,
            [ts.ScriptElementKind.directory]: CompletionItemKind.Folder,
            [ts.ScriptElementKind.string]: CompletionItemKind.Text,
          } as any
        )[c.kind.toString()] ?? CompletionItemKind.Property;

      let parts = displayPartsToString(completion.details?.displayParts);
      if (c.kind.toString() == ts.ScriptElementKind.alias) {
        if (parts.startsWith("(alias) class")) {
          kind = CompletionItemKind.Class;
        } else if (parts.startsWith("(alias) enum")) {
          kind = CompletionItemKind.Enum;
        } else if (parts.startsWith("(alias) interface")) {
          kind = CompletionItemKind.Interface;
        } else if (parts.startsWith("(alias) type")) {
          kind = CompletionItemKind.Class;
        } else if (parts.startsWith("(alias) namespace")) {
          kind = CompletionItemKind.Module;
        } else if (parts.startsWith("(alias) function")) {
          kind = CompletionItemKind.Function;
        } else if (
          parts.startsWith("(alias) var") ||
          parts.startsWith("(alias) let")
        ) {
          kind = CompletionItemKind.Variable;
        } else if (parts.startsWith("(alias) const")) {
          kind = CompletionItemKind.Variable;
        }
      }

      if (c.kind.toString() == ts.ScriptElementKind.string) {
        c.name = `"${c.name.replace(/"/g, "")}"`;
      }

      let documentation =
        completion.details?.documentation?.map((p: any) => ({
          value: p.text,
        })) ?? [];

      if (!c.name.startsWith("__"))
        items.push({
          label: c.name,
          sortText: c.sortText,
          kind,
          insertText: c.name,
          detail: parts,
          documentation: documentation[0] ?? undefined,
          // range: (completion as any).range,
        });
    }

    return items;
  }
);

connection.onHover(async (params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  let offset = doc.offsetAt(params.position);
  const path = cleanPath(params.textDocument.uri);
  let hover = await env.hover(path, offset);

  if (hover) {
    return {
      contents:
        "```ts\n" +
        hover.displayParts.map((p: any) => p.text).join("") +
        "\n```",
      range: {
        start: {
          line: hover.range.startLineNumber,
          character: hover.range.startColumn,
        },
        end: {
          line: hover.range.endLineNumber,
          character: hover.range.endColumn,
        },
      },
    };
  }
  return null;
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = "TypeScript details";
    item.documentation = "TypeScript documentation";
  } else if (item.data === 2) {
    item.detail = "JavaScript details";
    item.documentation = "JavaScript documentation";
  }
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
