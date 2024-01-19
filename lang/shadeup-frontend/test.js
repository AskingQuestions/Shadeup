"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
function watch(options) {
    const files = {};
    files["index.ts"] = { version: 0 };
    let fileContents = {
        "index.ts": "function main() { return 1; }"
    };
    // Create the language service host to allow the LS to communicate with the host
    const servicesHost = {
        getScriptFileNames: () => Object.keys(files),
        getScriptVersion: fileName => files[fileName] && files[fileName].version.toString(),
        getScriptSnapshot: fileName => {
            return ts.ScriptSnapshot.fromString(fileContents[fileName]);
        },
        getCurrentDirectory: () => "",
        getCompilationSettings: () => options,
        getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
        fileExists: (path) => {
            return path in files;
        },
        readFile: (path) => {
            return fileContents[path];
        },
        readDirectory: (path, extensions, exclude, include, depth) => {
            return Object.keys(files);
        },
        directoryExists: (path) => {
            return false;
        },
        getDirectories: (path) => {
            return [];
        },
    };
    // Create the language service files
    const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    // Now let's watch the files
    // rootFileNames.forEach(fileName => {
    //   // First time around, emit all files
    //   emitFile(fileName);
    //   // Add a watch on the file to handle next change
    //   fs.watchFile(fileName, { persistent: true, interval: 250 }, (curr, prev) => {
    //     // Check timestamp
    //     if (+curr.mtime <= +prev.mtime) {
    //       return;
    //     }
    //     // Update the version to signal a change in the file
    //     files[fileName].version++;
    //     // write the changes to disk
    //     emitFile(fileName);
    //   });
    // });
    emitFile("index.ts");
    function emitFile(fileName) {
        let output = services.getEmitOutput(fileName);
        if (!output.emitSkipped) {
            console.log(`Emitting ${fileName}`);
        }
        else {
            console.log(`Emitting ${fileName} failed`);
            logErrors(fileName);
        }
        output.outputFiles.forEach(o => {
            // fs.writeFileSync(o.name, o.text, "utf8");
            console.log(o.name, o.text);
        });
    }
    function logErrors(fileName) {
        let allDiagnostics = services
            .getCompilerOptionsDiagnostics()
            .concat(services.getSyntacticDiagnostics(fileName))
            .concat(services.getSemanticDiagnostics(fileName));
        allDiagnostics.forEach(diagnostic => {
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.log(`  Error: ${message}`);
            }
        });
    }
}
// Start the watcher
watch({ module: ts.ModuleKind.CommonJS });
