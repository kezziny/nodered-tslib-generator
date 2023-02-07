export declare class Dependency {
    static dependencies: {
        [module: string]: Dependency.ModuleInfo | null;
    };
    static notDependencies: string[];
    static moduleInfo(module: string): Dependency.ModuleInfo;
}
export declare namespace Dependency {
    interface ModuleInfo {
        npmModule: string;
        name: string;
        module: string;
    }
}
