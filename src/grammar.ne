@include "whitespace.ne"
@include "string.ne"

main ->				root
					{% (a) => a[0] %}

root ->				((comment
					| meta
					| preprocessor
					| define
					) _):*
					{% (a) => ({
						type: "root",
						items: a[0].map(x => x ? x[0][0] : null).filter(x => x !== null)
					}) %}


keyword ->			("pixel" | "vertex" | "compute" | "singleton" | "struct" | "actor" | "factory")
					{% (a, location) => ({
						type: "keyword",
						location,
						text: a[0][0]
					}) %}

comment ->			"//" [^\r\n]:*
					{% () => null %}

preprocessor ->		"#" [^\r\n]:*
					{% ([a,b], location) => ({
						type: "pre",
						location,
						text: b.join("")
					}) %}

meta ->				"@" identifier __ value
					{% (a, location) => ({
						type: "meta",
						identifier: a[1],
						value: a[3],
						location
					}) %}

lp ->				"("
rp ->				")"
lcb ->				"{"
rcb ->				"}"
lsb ->				"["
rsb ->				"]"

define ->			keyword __ identifier _ inherits:? _ block
					{% (a, location) => ({
						type: "define",
						keyword: a[0],
						identifier: a[2],
						inherits: a[4],
						block: a[6],
						location
					})%}

block ->			lcb _ ((comment|cpp_code|shader_code|property|function) _):* rcb
					{% (a, location) => ({
						type: "block",
						items: a[2].map(x => x ? x[0][0] : null).filter(x => x !== null),
						location
					}) %}

function ->			identifier __ identifier _ lp _ rp _ code
					{% (a, location) => ({
						type: "function",
						output: a[0],
						identifier: a[2],
						code: a[8],
						location
					}) %}

shader_code ->  	"Shader" _ operator _ code _ ";"
					{% (a, location) => ({
						type: "shader",
						code: a[4],
						operator: a[2],
						location
					}) %}

cpp_code ->  		("PrivateInclude"|"Public"|"Private"|"Header"|"Body"|"Include") _ operator _ code _ ";"
					{% (a, location) => ({
						type: "cpp",
						visibility: a[0],
						code: a[4],
						operator: a[2],
						location
					}) %}

operator ->			("-=" | "=" | "+=")
					{% (a, location) => ({
						type: "operator",
						text: a[0][0],
						location
					}) %}

property ->			identifier _ operator _ value _ ";"
					{% (a, location, reject) => a[0].text == "Shader" ? reject : ({
						type: "property",
						identifier: a[0],
						operator: a[2],
						value: a[4],
						location
					}) %}

array_value ->		value _ "," _ array_value
					{% (a, location) => ({
						type: "array_value",
						values: [a[0], a[4]],
						location
					}) %}
					| value
					{% (a, location) => ({
						type: "array_value",
						values: [a[0]],
						location
					}) %}

array ->			lsb _ array_value _ rsb
					{% (a, location) => {
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
					} %}

string ->			(dqstring | sqstring)
					{% (a, location) => ({
						type: "string",
						text: a[0][0],
						location
					}) %}

value ->			(array | block | string | number | boolean | identifier)
					{% (a, location) => ({
						type: "value",
						value: a[0][0],
						location
					}) %}

boolean ->			("true" | "false")
					{% (a, location) => ({
						type: "boolean",
						value: a[0][0] == "true",
						location
					}) %}

inherits ->			":" _ identifier_list
					{% ([a, _, b], location) => ({
						type: "inherits",
						items: b,
						location
					}) %}

identifier_list ->	identifier _ "," _ identifier_list
					| identifier
					{% (a, location) => ({
						type: "identifier_list",
						items: a,
						location
					}) %}
				   
identifier -> 		[a-zA-Z_] [a-zA-Z0-9_<>*]:*
					{% ([a, b], location, reject) => {
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
					} %}

number ->			[0-9.] [0-9\.f]:*
					{% (a, location) => ({
						type: "number",
						text: a[0] + a[1].join(""),
						location
					}) %}

code ->				(
						[^]:+
						{%
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
						%}
					)
					{% (a, location) => ({
						type: "code",
						text: a[0].join('').substring(1, a[0].length - 1),
						location
					}) %}