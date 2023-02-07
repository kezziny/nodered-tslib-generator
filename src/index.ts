import { parse } from 'ts-command-line-args';

import {File} from './File';
import { UUID } from './uuid';

import { Subflow } from './Subflow';
import { FunctionNode } from './FunctionNode';

const args = parse<{}>({
    packageJson: {type: String, defaultValue: "./package.json"},
    source: { type: String, defaultValue: "./dist" },
    destination: { type: String, defaultValue: "./packages" },
}) as any;

async function main() {
    let packageJson = JSON.parse(await File.read(args.packageJson));
    let files: string[] = await File.listDirectory(args.source);
    let code: {[filename: string]: string} = {};

    for (const file of files) {
        if (file.endsWith('.js') && !file.endsWith('index.js')) {
            code[file.substring(0, file.length - 3)] = await File.read(`${args.source}/${file}`);
        }
    }

    let subflowGenerator = new Subflow({
        name: packageJson['node-red'].name,
        module: packageJson['node-red'].module,
        uuid: packageJson['node-red'].uuid || UUID.random(),
        files: code,
    });

    let subflow: string = subflowGenerator.build();

    File.write(`${args.destination}/${packageJson['node-red'].module}.json`, subflow);
}

main();