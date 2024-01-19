const ParserNode = require('tree-sitter');
const ShadeupParser = require('../../../tree-sitter/bindings/node/index');

module.exports = function () {
	const parser = new ParserNode();
	parser.setLanguage(ShadeupParser);
	return parser;
};
