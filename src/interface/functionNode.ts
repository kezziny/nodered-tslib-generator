export interface IFunctionNode {
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
}