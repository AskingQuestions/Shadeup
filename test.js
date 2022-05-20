const nearley = require("nearley");
const grammar = require("./build/grammar.js");
const fs = require("fs");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Parse something!
parser.feed(fs.readFileSync("./test.shadeup", "utf8"));

// parser.results is an array of possible parsings.
console.log(JSON.stringify(parser.results, null, 2)); // [[[[["foo"],"\n"]]]]