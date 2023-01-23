import { parse } from 'ts-command-line-args';

import {IPackageArguments, Package} from './parser/package';
import { UUID } from './uuid';

const args: IPackageArguments = parse<{}>({
    displayName: String,
    module: String,
    uuid: {type: String, defaultValue: UUID.random()},
    source: { type: String, defaultValue: "./dist/nodered" },
    destination: { type: String, defaultValue: "./packages" },
}) as any;


let instance = new Package(args);
instance.process();