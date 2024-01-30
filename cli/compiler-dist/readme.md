modify the output of shadeup-compiler.js to:

1. remove the tree sitter wasm strings
2. Replace getShadeupParse with:

async function getShadeupParser() {
return global.shadeupParser();
}

3. import fs and replace e4.readFileSync e4 trace up to \_\_viteexternal with fs
