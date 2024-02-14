const { makeSimpleShadeupEnvironment } = require("./shadeup-compiler.umd.cjs");
const Parser = require("web-tree-sitter");

const path = require("path");
const { fileURLToPath } = require("url");

module.exports.makeLSPCompiler = async function makeLSPCompiler() {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(
    path.resolve(path.dirname(__filename), "tree-sitter-shadeup.wasm")
  );
  parser.setLanguage(Lang);

  global.shadeupParser = () => {
    return parser;
  };

  const env = await makeSimpleShadeupEnvironment(true);

  return env;
};
