import {File} from './File';

export class Dependency {
    static dependencies: {[module: string]: Dependency.ModuleInfo | null} = {};
    static notDependencies: string[] = [];

    public static moduleInfo(module: string): Dependency.ModuleInfo {
        if (module in Dependency.dependencies) return Dependency.dependencies[module];
        if (Dependency.notDependencies.some(m => m === module)) return null;

        try {
            let content = JSON.parse(File.readSync(`./node_modules/${module}/package.json`));
            if (content['node-red'].module) {
                let moduleInfo = {
                    npmModule: module,
                    name: content['node-red'].name,
                    module: content['node-red'].module
                };
                Dependency.dependencies[module] = moduleInfo;
                return moduleInfo;
            }

            Dependency.notDependencies.push(module);
            return null;
        } catch (e) {
            Dependency.notDependencies.push(module);
            return null;
        }
    }
    
}

export namespace Dependency {
    export interface ModuleInfo {
        npmModule: string;
        name: string;
        module: string;
    }
}