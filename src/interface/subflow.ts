export interface ISubflow {
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
}