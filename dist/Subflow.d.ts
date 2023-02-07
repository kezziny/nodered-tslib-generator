import { FunctionNode } from "./FunctionNode";
export declare class Subflow {
    private args;
    constructor(args: Subflow.Arguments);
    build(): string;
    buildExportNode(functionNodes: FunctionNode[]): FunctionNode.Descriptor;
}
export declare namespace Subflow {
    interface Arguments {
        name: string;
        module: string;
        uuid: string;
        files: {
            [filename: string]: string;
        };
    }
    class Descriptor {
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
        static of(args?: {
            id?: string;
            name?: string;
        }): Descriptor;
    }
}
