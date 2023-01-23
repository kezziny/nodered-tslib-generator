import { IFunctionNode } from "src/interface/functionNode";
import { UUID } from "src/uuid";

export class FunctionNode {
    public static of(args: {id?: string, name?: string, z?: string} = {}): IFunctionNode {
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