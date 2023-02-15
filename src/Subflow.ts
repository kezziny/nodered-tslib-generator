import { FunctionNode } from "./FunctionNode";
import { UUID } from "./uuid";

export class Subflow {
    private args: Subflow.Arguments;

    constructor(args: Subflow.Arguments) {
        this.args = args;
    }

    public build(): string {
        let functionNodes = [];
        for (const file in this.args.files) {
            functionNodes.push(new FunctionNode({
                name: file,
                module: this.args.module,
                code: this.args.files[file]
            }));
        }

        for (const node of functionNodes) {
            for (const module of node.localImports) {
                let referencedNode = functionNodes.find(n => n.args.name === module.file);
                if (!referencedNode) {
                    throw new Error("Invalid reference: " + module);
                }

                module.types = referencedNode.exports;
            }
        }

        let subflow = Subflow.Descriptor.of({name: this.args.name, id: this.args.uuid});
        subflow.in.push({x: 40, y: 40, wires: []});
        let nodeRed: any[] = [
            subflow
        ];

        let y = 40;
        for (const functionNode of functionNodes) {
            let node: FunctionNode.Descriptor = functionNode.build();
            node.z = this.args.uuid;
            node.x = 200;
            node.y = y += 40;
            nodeRed.push(node);

            subflow.in[0].wires.push({id: node.id});
        }

        let exportNode = this.buildExportNode(functionNodes);
        subflow.in[0].wires.push({id: exportNode.id});
        exportNode.x = 200;
        exportNode.y = 40;
        nodeRed.push(exportNode);

        return JSON.stringify(nodeRed, null, '\t');
    }

    buildExportNode(functionNodes: FunctionNode[]): FunctionNode.Descriptor {
        let functionNode = FunctionNode.Descriptor.of({name: "Module", z: this.args.uuid});
            
        let lines = [
            'const $ = global.get("registry");',
        ];

        let moduleClass = [
            `class ${this.args.module} {`,
        ];

        for (const file of functionNodes) {
            for (const type of file.exports) {
                lines.push(`let ${type} = await $.get('${this.args.module}.${type}');`);
                moduleClass.push(`  static ${type} = ${type};`);
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

export namespace Subflow {
    export interface Arguments {
        name: string;
        module: string;
        uuid: string;
        files: {[filename: string]: string};
    }

    export class Descriptor {
        id: string;
        name: string;
        type: "subflow";
        info: string;
        category: "Packages";
        in: any[];
        out: any[];
        env: any[];
        meta: any;
        color: string;
        icon: string;

        public static of(args: {id?: string, name?: string} = {}): Descriptor {
            if (!args.name) args.name = "";
            if (!args.id) args.id = UUID.random();
            return {
                id: args.id,
                name: args.name,
                type: "subflow",
                info: "",
                category: "Packages",
                in: [],
                out: [],
                env: [],
                meta: {},
                color: "#880088",
                icon: "node-red/bridge.svg"
            }
        }
    }
}