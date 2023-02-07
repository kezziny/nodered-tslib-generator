import { UUID } from '../uuid';
const fs = require('fs');
import {FunctionNode} from './functionNode';
import nodeRed from '../nodered';
import { IFunctionNode } from 'src/interface/functionNode';

export interface IPackageArguments {
    module: string,
    uuid: string,
    name: string,
    source: string;
    destination: string;
}

export class Package {
    private args: IPackageArguments;

    constructor(args: IPackageArguments) {
        console.log(`Process package: `, args);
        this.args = args;
    }

    async process(): Promise<void> {
        let sourceFiles = await this.findPackageFiles();
        let functionNodes = [];

        let subflow = nodeRed.Subflow.of({id: this.args.uuid, name: this.args.name});
        subflow.in.push({x: 40, y: 40, wires: []});
        let nodeRedJson: any[] = [subflow];

        let x = 160;
        let y = 80;

        for (const sourceFile of sourceFiles) {
            functionNodes.push(new FunctionNode({module: this.args.module, sourcePath: `${this.args.source}/${sourceFile}`, name: "Function"}));
        }

        for (const file of functionNodes) {
            let functionNode = nodeRed.FunctionNode.of({name: file.name, z: subflow.id});
            functionNode.func = await file.process();

            for (const variable in file.libs) {
                functionNode.libs.push({
                    var: variable,
                    module: file.libs[variable],
                });
            }

            y += 40;

            subflow.in[0].wires.push({id: functionNode.id});
            nodeRedJson.push(functionNode);
        }

        let m = this.moduleExporter(functionNodes);
        nodeRedJson.push(m);
        subflow.in[0].wires.push({id: m.id});

        let module = JSON.stringify(nodeRedJson, null, '\t');

        fs.writeFile(`./packages/${this.args.module}.json`, module, err => {
            if (err) {
              console.error(err);
            }
        });
    }

    private async findPackageFiles(): Promise<string[]> {
        let resolve, reject;
        let promise = new Promise<string[]>((res, rej) => {
            resolve = res;
            reject = rej;
        });
    
        fs.readdir(this.args.source, (err, files) => {
            if (err) return reject(err);
            
            let result: string[] = [];
            files.forEach(function (file) {
                if (file.endsWith(".js") && !file.endsWith("index.js"))
                    result.push(file); 
            });
    
            resolve(result);
        });
        return promise;
    }

    moduleExporter(functionNodes: FunctionNode[]): IFunctionNode {
        let functionNode = nodeRed.FunctionNode.of({name: "Module", z: this.args.uuid});
        functionNode.x = 160;
        functionNode.y = 40;
            
        let lines = [
            'const $ = global.get("registry");',
        ];

        let moduleClass = [
            `class ${this.args.module} {`,
        ];

        for (const file of functionNodes) {
            for (const exportDefinition of file.exports) {
                lines.push(`let ${exportDefinition.type} = await $.get('${exportDefinition.registryId}');`);
                moduleClass.push(`  static ${exportDefinition.type} = ${exportDefinition.type};`);
            }
        }

        lines.push('');
        moduleClass.push('}');
        moduleClass.push('');
        moduleClass.push(`$.register('${this.args.module}.*', ${this.args.module});`);

        functionNode.func = lines.join('\n') + moduleClass.join('\n');
        return functionNode;
    }
};