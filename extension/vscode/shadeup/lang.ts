// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as tm from "tmlanguage-generator";
import path from "path";
import fs from "fs";
import plist from "plist";

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^file:\/\//, "")
  .replace(/^\//, "");
export const grammarPath = path.resolve(__dirname, "./shadeup.tmlanguage.json");

type Rule = tm.Rule<BicepScope>;
type IncludeRule = tm.IncludeRule<BicepScope>;
type BeginEndRule = tm.BeginEndRule<BicepScope>;
type MatchRule = tm.MatchRule<BicepScope>;
type Grammar = tm.Grammar<BicepScope>;

export type BicepScope =
  | "comment.block.shadeup"
  | "comment.line.double-slash.shadeup"
  | "constant.character.escape.shadeup"
  | "constant.numeric.shadeup"
  | "constant.language.shadeup"
  | "entity.name.function.shadeup"
  | "keyword.control.declaration.shadeup"
  | "string.quoted.single.shadeup"
  | "string.quoted.double.shadeup"
  | "string.quoted.multi.shadeup"
  | "variable.other.readwrite.shadeup"
  | "storage.type.function.shadeup"
  | "variable.other.property.shadeup"
  | "punctuation.definition.template-expression.begin.shadeup"
  | "punctuation.definition.template-expression.end.shadeup"
  | "storage.modifier.shadeup"
  | "storage.type.shadeup";

const bounded = (text: string) => `\\b${text}\\b`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const after = (regex: string) => `(?<=${regex})`;
const notAfter = (regex: string) => `(?<!${regex})`;
const before = (regex: string) => `(?=${regex})`;
const notBefore = (regex: string) => `(?!${regex})`;

const meta: typeof tm.meta = tm.meta;
const identifierStart = "[_$[:alpha:]]";
const identifierContinue = "[_$[:alnum:]]";
const identifier = bounded(`${identifierStart}${identifierContinue}*`);
const directive = bounded(`[_a-zA-Z-0-9]+`);

// whitespace. ideally we'd tokenize in-line block comments, but that's a lot of work. For now, ignore them.
const ws = `(?:[ \\t\\r\\n]|\\/\\*(?:\\*(?!\\/)|[^*])*\\*\\/)*`;

const keywords = [
  "metadata",
  "targetScope",
  "resource",
  "module",
  "param",
  "shader",
  "workgroup",
  "output",
  "for",
  "in",
  "if",
  "while",
  "break",
  "continue",
  "else",
  "return",
  "existing",
  "import",
  "as",
  "type",
  "with",
  "using",
  "assert",
  "provider",
];
const storage = ["fn", "class", "trait", "impl"];

const keywordExpression: MatchRule = {
  key: "keyword",
  scope: "keyword.control.declaration.shadeup",
  match: bounded(`(${keywords.join("|")})`),
};
const storageFunc: MatchRule = {
  key: "storage-func",
  scope: "storage.type.function.shadeup",
  match: bounded(`(${storage.join("|")})`),
};

const variableExpression: MatchRule = {
  key: "variable",
  scope: "storage.type.shadeup",
  match: bounded(`(${["let", "const"].join("|")})`),
};
const storageMod: MatchRule = {
  key: "storage-modifier",
  scope: "storage.modifier.shadeup",
  match: bounded(`(${["pub"].join("|")})`),
};

const lineComment: MatchRule = {
  key: "line-comment",
  scope: "comment.line.double-slash.shadeup",
  match: `//.*${before(`$`)}`,
};

const blockComment: BeginEndRule = {
  key: "block-comment",
  scope: "comment.block.shadeup",
  begin: `/\\*`,
  end: `\\*/`,
};

const comments: IncludeRule = {
  key: "comments",
  patterns: [lineComment, blockComment],
};

function withComments(input: Rule[]): Rule[] {
  return [...input, comments];
}

const expression: IncludeRule = {
  key: "expression",
  patterns: [
    /* placeholder filled later due to cycle*/
  ],
};

const escapeChar: MatchRule = {
  key: "escape-character",
  scope: "constant.character.escape.shadeup",
  match: `\\\\(u{[0-9A-Fa-f]+}|n|r|t|\\\\|'|\\\${)`,
};

const stringVerbatim: BeginEndRule = {
  key: "string-verbatim",
  scope: "string.quoted.multi.shadeup",
  begin: `'''`,
  end: `'''`,
  patterns: [],
};

const stringSubstitution: BeginEndRule = {
  key: "string-literal-subst",
  scope: meta,
  begin: `${notAfter(`\\\\`)}(\\\${)`,
  beginCaptures: {
    "1": { scope: "punctuation.definition.template-expression.begin.shadeup" },
  },
  end: `(})`,
  endCaptures: {
    "1": { scope: "punctuation.definition.template-expression.end.shadeup" },
  },
  patterns: withComments([expression]),
};

const stringLiteral: BeginEndRule = {
  key: "string-literal",
  scope: "string.quoted.single.shadeup",
  begin: `'${notBefore(`''`)}`,
  end: `'`,
  patterns: [escapeChar, stringSubstitution],
};
const stringLiteralDouble: BeginEndRule = {
  key: "string-literal-double",
  scope: "string.quoted.double.shadeup",
  begin: `"${notBefore(`""`)}`,
  end: `"`,
  patterns: [escapeChar, stringSubstitution],
};

const numericLiteral: MatchRule = {
  key: "numeric-literal",
  scope: "constant.numeric.shadeup",
  match: `[0-9]+`,
};

const namedLiteral: MatchRule = {
  key: "named-literal",
  scope: "constant.language.shadeup",
  match: bounded(`(true|false|null)`),
};

const identifierExpression: MatchRule = {
  key: "identifier",
  scope: "variable.other.readwrite.shadeup",
  match: `${identifier}${notBefore(`${ws}\\(`)}`,
};

const objectLiteral: BeginEndRule = {
  key: "object-literal",
  scope: meta,
  begin: `{`,
  end: `}`,
  patterns: withComments([
    {
      key: "object-property-key",
      scope: "variable.other.property.shadeup",
      match: `${identifier}${before(`${ws}:`)}`,
    },
    expression,
  ]),
};

const arrayLiteral: BeginEndRule = {
  key: "array-literal",
  scope: meta,
  begin: `\\[${notBefore(`${ws}${bounded(`for`)}`)}`,
  end: `]`,
  patterns: withComments([expression]),
};

const functionCall: BeginEndRule = {
  key: "function-call",
  scope: meta,
  begin: `(${identifier})${ws}\\(`,
  beginCaptures: {
    "1": { scope: "entity.name.function.shadeup" },
  },
  end: `\\)`,
  patterns: withComments([expression]),
};

const decorator: BeginEndRule = {
  key: "decorator",
  scope: meta,
  begin: `@${ws}${before(identifier)}`,
  end: ``,
  patterns: withComments([expression]),
};

const lambdaStart =
  `(` +
  `\\(${ws}${identifier}${ws}(,${ws}${identifier}${ws})*\\)|` +
  `\\(${ws}\\)|` +
  `${ws}${identifier}${ws}` +
  `)${before(`${ws}=>`)}`;

const lambda: BeginEndRule = {
  key: "lambda-start",
  scope: meta,
  begin: lambdaStart,
  beginCaptures: {
    "1": {
      scope: meta,
      patterns: withComments([identifierExpression]),
    },
  },
  end: `${ws}=>`,
};

const directiveStatement: BeginEndRule = {
  key: "directive",
  scope: meta,
  begin: `#${directive}`,
  end: `$`,
  patterns: withComments([
    {
      key: "directive-variable",
      scope: "keyword.control.declaration.shadeup",
      match: directive,
    },
  ]),
};

expression.patterns = [
  stringLiteralDouble,
  stringLiteral,
  stringVerbatim,
  numericLiteral,
  namedLiteral,
  objectLiteral,
  arrayLiteral,
  keywordExpression,
  storageFunc,
  variableExpression,
  storageMod,
  identifierExpression,
  functionCall,
  decorator,
  lambda,
  directiveStatement,
];

const grammar: Grammar = {
  $schema: tm.schema,
  name: "Shadeup",
  scopeName: "source.shadeup",
  fileTypes: [".shadeup"],
  patterns: withComments([expression]),
};

export async function generateGrammar(): Promise<string> {
  const json = await tm.emitJSON(grammar);

  return JSON.parse(json);
}

generateGrammar().then((grammar) => {
  const json = JSON.stringify(grammar, null, 2);
  fs.writeFileSync(grammarPath, json);
});
