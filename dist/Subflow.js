"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subflow = void 0;
const FunctionNode_1 = require("./FunctionNode");
const uuid_1 = require("./uuid");
class Subflow {
    constructor(args) {
        this.args = args;
    }
    build() {
        let functionNodes = [];
        for (const file in this.args.files) {
            functionNodes.push(new FunctionNode_1.FunctionNode({
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
        let subflow = Subflow.Descriptor.of({ name: this.args.name, id: this.args.uuid });
        subflow.in.push({ x: 40, y: 40, wires: [] });
        let nodeRed = [
            subflow
        ];
        let y = 40;
        for (const functionNode of functionNodes) {
            let node = functionNode.build();
            node.z = this.args.uuid;
            node.x = 200;
            node.y = y += 40;
            nodeRed.push(node);
            subflow.in[0].wires.push({ id: node.id });
        }
        let exportNode = this.buildExportNode(functionNodes);
        subflow.in[0].wires.push({ id: exportNode.id });
        exportNode.x = 200;
        exportNode.y = 40;
        nodeRed.push(exportNode);
        return JSON.stringify(nodeRed, null, '\t');
    }
    buildExportNode(functionNodes) {
        let functionNode = FunctionNode_1.FunctionNode.Descriptor.of({ name: "Module", z: this.args.uuid });
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
}
exports.Subflow = Subflow;
;
(function (Subflow) {
    class Descriptor {
        static of(args = {}) {
            if (!args.name)
                args.name = "";
            if (!args.id)
                args.id = uuid_1.UUID.random();
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
            };
        }
    }
    Subflow.Descriptor = Descriptor;
})(Subflow = exports.Subflow || (exports.Subflow = {}));
//# sourceMappingURL=Subflow.js.map