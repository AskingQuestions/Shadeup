// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley

function id(x) { return x[0]; }
export default {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\r\n\v\f]/], "postprocess": id},
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "main", "symbols": ["root"], "postprocess": (a) => a[0]},
    {"name": "root$ebnf$1", "symbols": []},
    {"name": "root$ebnf$1$subexpression$1$subexpression$1", "symbols": ["comment"]},
    {"name": "root$ebnf$1$subexpression$1$subexpression$1", "symbols": ["meta"]},
    {"name": "root$ebnf$1$subexpression$1$subexpression$1", "symbols": ["preprocessor"]},
    {"name": "root$ebnf$1$subexpression$1$subexpression$1", "symbols": ["define"]},
    {"name": "root$ebnf$1$subexpression$1", "symbols": ["root$ebnf$1$subexpression$1$subexpression$1", "_"]},
    {"name": "root$ebnf$1", "symbols": ["root$ebnf$1", "root$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "root", "symbols": ["root$ebnf$1"], "postprocess":  (a) => ({
        	type: "root",
        	items: a[0].map(x => x ? x[0][0] : null).filter(x => x !== null)
        }) },
    {"name": "keyword$subexpression$1$string$1", "symbols": [{"literal":"p"}, {"literal":"i"}, {"literal":"x"}, {"literal":"e"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$1"]},
    {"name": "keyword$subexpression$1$string$2", "symbols": [{"literal":"v"}, {"literal":"e"}, {"literal":"r"}, {"literal":"t"}, {"literal":"e"}, {"literal":"x"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$2"]},
    {"name": "keyword$subexpression$1$string$3", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"m"}, {"literal":"p"}, {"literal":"u"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$3"]},
    {"name": "keyword$subexpression$1$string$4", "symbols": [{"literal":"s"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}, {"literal":"l"}, {"literal":"e"}, {"literal":"t"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$4"]},
    {"name": "keyword$subexpression$1$string$5", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$5"]},
    {"name": "keyword$subexpression$1$string$6", "symbols": [{"literal":"a"}, {"literal":"c"}, {"literal":"t"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$6"]},
    {"name": "keyword$subexpression$1$string$7", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"c"}, {"literal":"t"}, {"literal":"o"}, {"literal":"r"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "keyword$subexpression$1", "symbols": ["keyword$subexpression$1$string$7"]},
    {"name": "keyword", "symbols": ["keyword$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "keyword",
        	location,
        	text: a[0][0]
        }) },
    {"name": "comment$string$1", "symbols": [{"literal":"/"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comment$ebnf$1", "symbols": []},
    {"name": "comment$ebnf$1", "symbols": ["comment$ebnf$1", /[^\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "comment", "symbols": ["comment$string$1", "comment$ebnf$1"], "postprocess": () => null},
    {"name": "preprocessor$ebnf$1", "symbols": []},
    {"name": "preprocessor$ebnf$1", "symbols": ["preprocessor$ebnf$1", /[^\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "preprocessor", "symbols": [{"literal":"#"}, "preprocessor$ebnf$1"], "postprocess":  ([a,b], location) => ({
        	type: "pre",
        	location,
        	text: b.join("")
        }) },
    {"name": "meta", "symbols": [{"literal":"@"}, "identifier", "__", "value"], "postprocess":  (a, location) => ({
        	type: "meta",
        	identifier: a[1],
        	value: a[3],
        	location
        }) },
    {"name": "lp", "symbols": [{"literal":"("}]},
    {"name": "rp", "symbols": [{"literal":")"}]},
    {"name": "lcb", "symbols": [{"literal":"{"}]},
    {"name": "rcb", "symbols": [{"literal":"}"}]},
    {"name": "lsb", "symbols": [{"literal":"["}]},
    {"name": "rsb", "symbols": [{"literal":"]"}]},
    {"name": "define$ebnf$1", "symbols": ["inherits"], "postprocess": id},
    {"name": "define$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "define", "symbols": ["keyword", "__", "identifier", "_", "define$ebnf$1", "_", "block"], "postprocess":  (a, location) => ({
        	type: "define",
        	keyword: a[0],
        	identifier: a[2],
        	inherits: a[4],
        	block: a[6],
        	location
        })},
    {"name": "block$ebnf$1", "symbols": []},
    {"name": "block$ebnf$1$subexpression$1$subexpression$1", "symbols": ["comment"]},
    {"name": "block$ebnf$1$subexpression$1$subexpression$1", "symbols": ["cpp_code"]},
    {"name": "block$ebnf$1$subexpression$1$subexpression$1", "symbols": ["shader_code"]},
    {"name": "block$ebnf$1$subexpression$1$subexpression$1", "symbols": ["property"]},
    {"name": "block$ebnf$1$subexpression$1$subexpression$1", "symbols": ["function"]},
    {"name": "block$ebnf$1$subexpression$1", "symbols": ["block$ebnf$1$subexpression$1$subexpression$1", "_"]},
    {"name": "block$ebnf$1", "symbols": ["block$ebnf$1", "block$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "block", "symbols": ["lcb", "_", "block$ebnf$1", "rcb"], "postprocess":  (a, location) => ({
        	type: "block",
        	items: a[2].map(x => x ? x[0][0] : null).filter(x => x !== null),
        	location
        }) },
    {"name": "function", "symbols": ["identifier", "__", "identifier", "_", "lp", "_", "rp", "_", "code"], "postprocess":  (a, location) => ({
        	type: "function",
        	output: a[0],
        	identifier: a[2],
        	code: a[8],
        	location
        }) },
    {"name": "shader_code$string$1", "symbols": [{"literal":"S"}, {"literal":"h"}, {"literal":"a"}, {"literal":"d"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "shader_code", "symbols": ["shader_code$string$1", "_", "operator", "_", "code", "_", {"literal":";"}], "postprocess":  (a, location) => ({
        	type: "shader",
        	code: a[4],
        	operator: a[2],
        	location
        }) },
    {"name": "cpp_code$subexpression$1$string$1", "symbols": [{"literal":"P"}, {"literal":"r"}, {"literal":"i"}, {"literal":"v"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}, {"literal":"I"}, {"literal":"n"}, {"literal":"c"}, {"literal":"l"}, {"literal":"u"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$1"]},
    {"name": "cpp_code$subexpression$1$string$2", "symbols": [{"literal":"P"}, {"literal":"u"}, {"literal":"b"}, {"literal":"l"}, {"literal":"i"}, {"literal":"c"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$2"]},
    {"name": "cpp_code$subexpression$1$string$3", "symbols": [{"literal":"P"}, {"literal":"r"}, {"literal":"i"}, {"literal":"v"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$3"]},
    {"name": "cpp_code$subexpression$1$string$4", "symbols": [{"literal":"H"}, {"literal":"e"}, {"literal":"a"}, {"literal":"d"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$4"]},
    {"name": "cpp_code$subexpression$1$string$5", "symbols": [{"literal":"B"}, {"literal":"o"}, {"literal":"d"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$5"]},
    {"name": "cpp_code$subexpression$1$string$6", "symbols": [{"literal":"I"}, {"literal":"n"}, {"literal":"c"}, {"literal":"l"}, {"literal":"u"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "cpp_code$subexpression$1", "symbols": ["cpp_code$subexpression$1$string$6"]},
    {"name": "cpp_code", "symbols": ["cpp_code$subexpression$1", "_", "operator", "_", "code", "_", {"literal":";"}], "postprocess":  (a, location) => ({
        	type: "cpp",
        	visibility: a[0],
        	code: a[4],
        	operator: a[2],
        	location
        }) },
    {"name": "operator$subexpression$1$string$1", "symbols": [{"literal":"-"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "operator$subexpression$1", "symbols": ["operator$subexpression$1$string$1"]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "operator$subexpression$1$string$2", "symbols": [{"literal":"+"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "operator$subexpression$1", "symbols": ["operator$subexpression$1$string$2"]},
    {"name": "operator", "symbols": ["operator$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "operator",
        	text: a[0][0],
        	location
        }) },
    {"name": "property", "symbols": ["identifier", "_", "operator", "_", "value", "_", {"literal":";"}], "postprocess":  (a, location, reject) => a[0].text == "Shader" ? reject : ({
        	type: "property",
        	identifier: a[0],
        	operator: a[2],
        	value: a[4],
        	location
        }) },
    {"name": "array_value", "symbols": ["value", "_", {"literal":","}, "_", "array_value"], "postprocess":  (a, location) => ({
        	type: "array_value",
        	values: [a[0], a[4]],
        	location
        }) },
    {"name": "array_value", "symbols": ["value"], "postprocess":  (a, location) => ({
        	type: "array_value",
        	values: [a[0]],
        	location
        }) },
    {"name": "array", "symbols": ["lsb", "_", "array_value", "_", "rsb"], "postprocess":  (a, location) => {
        	let flatten = (v) => {
        		let arr = [];
        		for (let s of v.values) {
        			if (s.type == "array_value") {
        				arr = [...arr, ...flatten(s)];
        			}else{
        				arr.push(s);
        			}
        		}
        		return arr;
        	};
        	return {
        		type: "array",
        		values: flatten(a[2]),
        		location
        	};
        } },
    {"name": "string$subexpression$1", "symbols": ["dqstring"]},
    {"name": "string$subexpression$1", "symbols": ["sqstring"]},
    {"name": "string", "symbols": ["string$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "string",
        	text: a[0][0],
        	location
        }) },
    {"name": "value$subexpression$1", "symbols": ["array"]},
    {"name": "value$subexpression$1", "symbols": ["block"]},
    {"name": "value$subexpression$1", "symbols": ["string"]},
    {"name": "value$subexpression$1", "symbols": ["number"]},
    {"name": "value$subexpression$1", "symbols": ["boolean"]},
    {"name": "value$subexpression$1", "symbols": ["identifier"]},
    {"name": "value", "symbols": ["value$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "value",
        	value: a[0][0],
        	location
        }) },
    {"name": "boolean$subexpression$1$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean$subexpression$1", "symbols": ["boolean$subexpression$1$string$1"]},
    {"name": "boolean$subexpression$1$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean$subexpression$1", "symbols": ["boolean$subexpression$1$string$2"]},
    {"name": "boolean", "symbols": ["boolean$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "boolean",
        	value: a[0][0] == "true",
        	location
        }) },
    {"name": "inherits", "symbols": [{"literal":":"}, "_", "identifier_list"], "postprocess":  ([a, _, b], location) => ({
        	type: "inherits",
        	items: b,
        	location
        }) },
    {"name": "identifier_list", "symbols": ["identifier", "_", {"literal":","}, "_", "identifier_list"]},
    {"name": "identifier_list", "symbols": ["identifier"], "postprocess":  (a, location) => ({
        	type: "identifier_list",
        	items: a,
        	location
        }) },
    {"name": "identifier$ebnf$1", "symbols": []},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[a-zA-Z0-9_<>*]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "identifier", "symbols": [/[a-zA-Z_]/, "identifier$ebnf$1"], "postprocess":  ([a, b], location, reject) => {
        	let id = a + b.join("");
        
        	if (id == "true" || id == "false") {
        		return reject;
        	}else{
        		return {
        			type: "identifier",
        			text: id,
        			location
        		};
        	}
        } },
    {"name": "number$ebnf$1", "symbols": []},
    {"name": "number$ebnf$1", "symbols": ["number$ebnf$1", /[0-9\.f]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "number", "symbols": [/[0-9.]/, "number$ebnf$1"], "postprocess":  (a, location) => ({
        	type: "number",
        	text: a[0] + a[1].join(""),
        	location
        }) },
    {"name": "code$subexpression$1$ebnf$1", "symbols": [/[^]/]},
    {"name": "code$subexpression$1$ebnf$1", "symbols": ["code$subexpression$1$ebnf$1", /[^]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "code$subexpression$1", "symbols": ["code$subexpression$1$ebnf$1"], "postprocess": 
        function(a,l, reject) {
        	const txt = a[0].join('');
        	
        	if (txt[0] != "{") {
        		return reject;
        	}
        	
        	// Count curly braces balanced and ignore strings and preprocessor defs
        	let indString = false;
        	let insString = false;
        	let inPre = false;
        	let isEscaped = false;
        	let curlyCount = 0;
        	for (let i = 0; i < txt.length; i++) {
        		if (isEscaped) {
        			isEscaped = false;
        			continue;
        		}
        		if (txt[i] === '\\') {
        			isEscaped = true;
        			continue;
        		}
        		if (!insString && txt[i] === '"') {
        			indString = !indString;
        			continue;
        		}
        		if (!indString && txt[i] === "'") {
        			insString = !insString;
        			continue;
        		}
        		if (txt[i] === '#') {
        			inPre = true;
        			continue;
        		}
        		if (txt[i] === '\n') {
        			inPre = false;
        			continue;
        		}
        		if (!indString && !insString && !inPre) {
        			if (txt[i] === '{') {
        				curlyCount++;
        				continue;
        			}
        
        			if (curlyCount == 0) {
        				return reject;
        			}
        
        			if (txt[i] === '}') {
        				curlyCount--;
        				continue;
        			}
        		}
        	}
        
        	if (curlyCount > 0) {
        		return reject;
        	}else{
        		return a[0];
        	}
        }
        						},
    {"name": "code", "symbols": ["code$subexpression$1"], "postprocess":  (a, location) => ({
        	type: "code",
        	text: a[0].join('').substring(1, a[0].length - 1),
        	location
        }) }
]
  , ParserStart: "main"
}