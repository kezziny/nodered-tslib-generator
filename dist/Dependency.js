"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependency = void 0;
const File_1 = require("./File");
class Dependency {
    static moduleInfo(module) {
        if (module in Dependency.dependencies)
            return Dependency.dependencies[module];
        if (Dependency.notDependencies.some(m => m === module))
            return null;
        try {
            let content = JSON.parse(File_1.File.readSync(`./node_modules/${module}/package.json`));
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
        }
        catch (e) {
            Dependency.notDependencies.push(module);
            return null;
        }
    }
}
exports.Dependency = Dependency;
Dependency.dependencies = {};
Dependency.notDependencies = [];
//# sourceMappingURL=Dependency.js.map