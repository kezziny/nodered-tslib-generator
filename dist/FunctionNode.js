"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionNode = void 0;
const Dependency_1 = require("./Dependency");
const uuid_1 = require("./uuid");
class FunctionNode {
    constructor(args) {
        this.exports = [];
        this.localImports = [];
        this.libraries = [];
        this.dependencies = [];
        this.args = args;
        let lines = this.args.code.split("\n");
        lines = this.filterUnnecessaryLines(lines);
        lines = this.filterImports(lines);
        this.lines = this.filterExports(lines);
    }
    build() {
        let functionNode = FunctionNode.Descriptor.of({ name: this.args.name });
        functionNode.func = this.buildCode();
        for (const lib of this.libraries) {
            functionNode.libs.push({
                var: lib.var,
                module: lib.module,
            });
        }
        return functionNode;
    }
    buildCode() {
        let code = [
            'const $ = global.get("registry");'
        ];
        code.push('');
        code.push('// Dependencies');
        for (const dependency of this.dependencies) {
            code.push(`const ${dependency.var} = await $.get("${dependency.module}");`);
        }
        for (const localImport of this.localImports) {
            code.push(`const ${localImport.var} = { ${localImport.type}: await $.get("${localImport.module}.${localImport.type}") };`);
        }
        code.push('');
        code.push('// Implementation');
        for (const line of this.lines) {
            code.push(line);
        }
        code.push('');
        code.push('');
        code.push('// Exports');
        for (const type in this.exports) {
            code.push(`$.register("${this.args.module}.${type}", ${type});`);
        }
        return code.join("\n");
    }
    filterUnnecessaryLines(lines) {
        let result = [...lines];
        result.splice(0, 3);
        result.splice(result.length - 1, 1);
        return result;
    }
    filterImports(lines) {
        let filteredLines = [];
        for (const line of lines) {
            let match = line.match("const (?<var>\\w+) = require\\(\"\\./(?<file>\\w+)\"\\);");
            if (match !== null) {
                this.localImports.push({
                    var: match.groups.var,
                    module: this.args.module,
                    type: match.groups.file,
                });
                continue;
            }
            match = line.match("const (?<var>\\w+) = require\\(\"(?<module>.*)\"\\);");
            if (match !== null) {
                let moduleInfo = Dependency_1.Dependency.moduleInfo(match.groups.module);
                if (moduleInfo === null) {
                    this.libraries.push({
                        var: match.groups.var,
                        module: match.groups.module,
                    });
                }
                else {
                    this.dependencies.push({
                        var: match.groups.var,
                        module: moduleInfo.module,
                    });
                }
                continue;
            }
            filteredLines.push(line);
        }
        return filteredLines;
    }
    filterExports(lines) {
        let filteredLines = [];
        for (const line of lines) {
            let match = line.match("exports\\.(?<name>\\w+) = \\1;");
            if (match !== null) {
                this.exports.push(match.groups.name);
                continue;
            }
            filteredLines.push(line);
        }
        return filteredLines;
    }
}
exports.FunctionNode = FunctionNode;
(function (FunctionNode) {
    class Descriptor {
        static of(args = {}) {
            if (!args.name)
                args.name = "";
            if (!args.id)
                args.id = uuid_1.UUID.random();
            if (!args.z)
                args.z = "";
            return {
                id: args.id,
                name: args.name,
                type: "function",
                func: "",
                x: 0,
                y: 0,
                z: args.z,
                libs: [],
                wires: [],
                outputs: 0,
                noerr: 0,
                initialize: "",
                finalize: "",
            };
        }
    }
    FunctionNode.Descriptor = Descriptor;
})(FunctionNode = exports.FunctionNode || (exports.FunctionNode = {}));
//# sourceMappingURL=FunctionNode.js.map