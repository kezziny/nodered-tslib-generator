import { ISubflow } from "src/interface/subflow";
import { UUID } from "src/uuid";

export class Subflow {
    public static of(args: {id?: string, name?: string} = {}): ISubflow {
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