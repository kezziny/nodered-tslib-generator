const fs = require('fs');
import { IFunctionNode } from '../interface/functionNode';
import nodeRed from '../nodered';

export interface IFunctionNodeArguments {
    module: string;
    name: string;
    sourcePath: string;
}

export interface IFunctionNodeLibrary {
    variable: string;
    module: string;
}

export interface IFunctionNodeExport {
    type: string;
    registryId: string;
}

export interface IFunctionNodeImport {
    variable: string;
    registryId: string;
}

export interface IFunctionNodeImportType {
    variable: string;
    type: string;
    registryId: string;
}

export class FunctionNode {
    private args: IFunctionNodeArguments;

    public importedLibraries: IFunctionNodeLibrary[] = [];

    public importedModules: IFunctionNodeImport[] = [];
    public importedTypes: IFunctionNodeImportType[] = [];

    public exports: IFunctionNodeExport[] = [];

    constructor(args: IFunctionNodeArguments) {
        this.args = args;
    }

    async process(): Promise<IFunctionNode> {
        let content: string = await this.loadContent();
        let lines = content.split("\n");
        lines = await this.filterSallang(lines);
        lines = await this.filterImports(lines);
        lines = await this.filterExports(lines);        
        
        let code = [
            'const $ = global.get("registry");'
        ];

        // imports
        code.push('');
        code.push('// Dependencies');
        for (const importDefinition of this.importedModules) {
            code.push(`const ${importDefinition.variable} = await $.get("${importDefinition.registryId}");`);
        }

        for (const importDefinition of this.importedTypes) {
            code.push(`const ${importDefinition.variable} = { ${importDefinition.type}: await $.get("${importDefinition.registryId}") };`);
        }

        // content
        code.push('');
        code.push('// Implementation');
        for (const line of lines) {
            code.push(line);
        }

        // exports
        code.push('');
        code.push('');
        code.push('// Exports');
        for (const type in this.exports) {
            code.push(`$.register("${this.exports[type]}", ${type});`);
        }

        let functionNode = nodeRed.FunctionNode.of({name: this.args.name});
        functionNode.func = code.join("\n");

        return functionNode;
    }

    private async loadContent(): Promise<string> {
        let resolve, reject;
        let promise = new Promise<string>((res, rej) => {
            resolve = res;
            reject = rej;
        });
    
        fs.readFile(this.args.sourcePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    
        return promise;
    }

    async filterSallang(lines) {
        let result = [...lines];
        // first 3 lines (strict, esmodule, export module)
        result.splice(0, 3);
        // last line (comment)
        result.splice(result.length - 1, 1);
        return result;
    }

    filterImports(lines: string[]): string[] {
        let filteredLines: string[] = [];
    
        for (const line of lines) {
            let match = line.match("const (?<var>\\w*) = require\\(.(?<path>[./]*)(?<module>.*?)(?<type>/.*?)?.\\);");
            if (match !== null) {
                if (match.groups.path === './') {
                    this.importedTypes.push({
                        variable: match.groups.var,
                        type: match.groups.module,
                        registryId: `${match.groups.module}.${match.groups.module}`,
                    });
                } else {
                    if (match.groups.path === '') {
                        this.importedLibraries.push({ variable: match.groups.var, module: match.groups.module});
                    } else if (!match.groups.type) {
                        this.importedModules.push({ variable: match.groups.var, registryId: `${match.groups.module}.*`});
                    } else {
                        this.importedTypes.push({
                            variable: match.groups.var,
                            type: match.groups.type.substring(1),
                            registryId: `${match.groups.module}.${match.groups.type.substring(1)}`,
                        });
                    }
                }
                continue;
            }
    
            filteredLines.push(line);
        }
    
        return filteredLines;
    }

    async filterExports(lines) {
        let filteredLines = [];
    
        for (const line of lines) {
            let match = line.match("exports\\.(?<name>\\w+) = \\1;");
            if (match !== null) {
                this.exports.push({ type: match.groups.name, registryId: `${this.args.module}.${match.groups.name}`});
                continue;
            }
    
            filteredLines.push(line);
        }
    
        return filteredLines;
    }
}