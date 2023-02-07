const fs = require('fs');

export interface NodeRedConfig {
    uuid?: string;
    name: string;
    module: string;
}

export async function parsePackageJson(path): Promise<NodeRedConfig> {
    let resolve, reject;
    let promise = new Promise<NodeRedConfig>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            reject("package.json not found");
            return;
        }

        let json = JSON.parse(data);
        resolve(json['node-red']);
    });

    return promise;
}