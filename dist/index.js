"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_command_line_args_1 = require("ts-command-line-args");
const File_1 = require("./File");
const uuid_1 = require("./uuid");
const Subflow_1 = require("./Subflow");
const args = (0, ts_command_line_args_1.parse)({
    packageJson: { type: String, defaultValue: "./package.json" },
    source: { type: String, defaultValue: "./dist" },
    destination: { type: String, defaultValue: "./packages" },
});
async function main() {
    let packageJson = JSON.parse(await File_1.File.read(args.packageJson));
    let files = await File_1.File.listDirectory(args.source);
    let code = {};
    for (const file of files) {
        if (file.endsWith('.js') && !file.endsWith('index.js')) {
            code[file.substring(0, file.length - 3)] = await File_1.File.read(`${args.source}/${file}`);
        }
    }
    let subflowGenerator = new Subflow_1.Subflow({
        name: packageJson['node-red'].name,
        module: packageJson['node-red'].module,
        uuid: packageJson['node-red'].uuid || uuid_1.UUID.random(),
        files: code,
    });
    let subflow = subflowGenerator.build();
    File_1.File.write(`${args.destination}/${packageJson['node-red'].module}.json`, subflow);
}
main();
//# sourceMappingURL=index.js.map