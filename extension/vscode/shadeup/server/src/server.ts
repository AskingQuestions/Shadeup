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

connection.onDidChangeConfiguration((change) => {
  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

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

connection.languages.semanticTokens.on(async (params) => {
  let path = cleanPath(params.textDocument.uri);

  const document = documents.get(params.textDocument.uri);
  let file = findFile(path);
  if (!file) return { data: [] };
  if (document === undefined) {
    return { data: [] };
  }
  const builder = new SemanticTokensBuilder();
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
  // console.log("Sending semantic tokens", path, builder);
  return builder.build();
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(async (change) => {
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

  await env.regenerate();
  let errors: {
    error: ts.Diagnostic;
    file: string;
    message: string;
  }[] = [];

  if (!ignoreErrors) {
    errors = await env.errors([path]);
  }

  let file = findFile(path);

  let diags: Diagnostic[] = [];

  for (let parseError of file?.parseDiagnostics ?? []) {
    if (parseError.path !== path) continue;
    let diag = genericDiagnosticToShadeupDiagnostic(path, parseError);
    if (diag) diags.push(diag);
  }

  console.log("Errors", errors, file?.parseDiagnostics);

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
  console.log(env.files.map((f: any) => f.path));

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
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.

  // The validator creates diagnostics for all uppercase words length 2 and more
  const text = textDocument.getText();
  const pattern = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;

  let problems = 0;
  const diagnostics: Diagnostic[] = [];
  while ((m = pattern.exec(text)) && problems < 100) {
    problems++;
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `${m[0]} is all uppercase.`,
      source: "ex",
    };
    if (hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: "Spelling matters",
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: "Particularly for names",
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(async (_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received a file change event");
});

// connection.on(async (params) => {
//   console.log(env.classifications(cleanPath(params.textDocument.uri)));
//   return env.classifications(cleanPath(params.textDocument.uri));
// });

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
      {
        label: "TypeScript",
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: "JavaScript",
        kind: CompletionItemKind.Text,
        data: 2,
      },
    ];
  }
);

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
