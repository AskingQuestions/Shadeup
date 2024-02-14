import fs from "fs";
import path from "path";

let code = "// Generated file\n";

code += "export const linkShadeupLibrary = (define, localEngineContext) => {\n";

code += `const __shadeup_gen_shader =
localEngineContext.__shadeup_gen_shader.bind(localEngineContext);
const __shadeup_make_shader_inst =
localEngineContext.__shadeup_make_shader_inst.bind(localEngineContext);
const __shadeup_register_struct =
localEngineContext.__shadeup_register_struct.bind(localEngineContext);
const env = localEngineContext.env;

`;

const blankCode = fs.readFileSync("__lib.js", "utf8");

code += blankCode;

code += "};\n";

fs.writeFileSync("library.js", code);
