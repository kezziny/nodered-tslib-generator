// Input: Name, module, code.js content

import { Dependency } from "./Dependency";
import { UUID } from "./uuid";

export class FunctionNode {
    public args: FunctionNode.Arguments;
    private lines: string[];

    public exports: string[] = [];
    public localImports: FunctionNode.LocalImport[] = [];

    private libraries: FunctionNode.Dependency[] = [];
    private dependencies: FunctionNode.Dependency[] = [];

    public constructor(args: FunctionNode.Arguments) {
        this.args = args;
        let lines = this.args.code.split("\n");
        lines = this.filterUnnecessaryLines(lines);
        lines = this.filterImports(lines);
        this.lines = this.filterExports(lines);
    }

    public build(): FunctionNode.Descriptor { 
        let functionNode = FunctionNode.Descriptor.of({name: this.args.name});
        functionNode.func = this.buildCode();

        for (const lib of this.libraries) {
            functionNode.libs.push({
                var: lib.var,
                module: lib.module,
            });
        }

        return functionNode;
    }

    private buildCode(): string {
        let code = [
            'const $ = global.get("registry");'
        ];

        // imports
        code.push('');
        code.push('// Dependencies');

        for (const dependency of this.dependencies) {
            code.push(`const ${dependency.var} = await $.get("${dependency.module}");`);
        }

        for (const localImport of this.localImports) {
            code.push(`const ${localImport.var} = { ${localImport.types.map(type => `${type}: await $.get("${localImport.module}.${type}")`).join(", ")} };`);
        }

        // content
        code.push('');
        code.push('// Implementation');
        for (const line of this.lines) {
            code.push(line);
        }

        // exports
        code.push('');
        code.push('');
        code.push('// Exports');
        for (const type of this.exports) {
            code.push(`$.register("${this.args.module}.${type}", ${type});`);
        }

        return code.join("\n");
    }

    private filterUnnecessaryLines(lines: string[]): string[] {
        let result = [...lines];
        // first 3 lines (strict, esmodule, export module)
        result.splice(0, 3);
        // last line (comment)
        result.splice(result.length - 1, 1);
        return result;
    }

    private filterImports(lines: string[]): string[] {
        let filteredLines: string[] = [];
    
        for (const line of lines) {
            // Local
            let match = line.match("const (?<var>\\w+) = require\\(\"\\./(?<file>\\w+)\"\\);");
            if (match !== null) {
                this.localImports.push({
                    var: match.groups.var,
                    module: this.args.module,
                    file: match.groups.file,
                    types: [],
                });
                continue;
            }

            // Module
            match = line.match("const (?<var>\\w+) = require\\(\"(?<module>.*)\"\\);");
            if (match !== null) {
                let moduleInfo = Dependency.moduleInfo(match.groups.module);
                if (moduleInfo === null) {
                    this.libraries.push({
                        var: match.groups.var,
                        module: match.groups.module,
                    });
                } else {
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

    private filterExports(lines: string[]): string[] {
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

export namespace FunctionNode {
    export interface Arguments {
        name: string;
        module: string;
        code: string;
    }

    export interface LocalImport {
        var: string;
        module: string;
        file: string;
        types: string[];
    }

    export interface Dependency {
        var: string;
        module: string;
    }

    export class Descriptor {
        id: string;
        name: string;
        type: "function";
        func: string;
        x: number;
        y: number;
        z: string;
        libs: any[];
        wires: any[];
        outputs: number;
        noerr: number;
        initialize: string;
        finalize: string;

        public static of(args: {id?: string, name?: string, z?: string} = {}): Descriptor {
            if (!args.name) args.name = "";
            if (!args.id) args.id = UUID.random();
            if (!args.z) args.z = "";
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
}