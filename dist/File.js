"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const fs = require('fs');
class File {
    static async listDirectory(path) {
        let resolve, reject;
        let promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        fs.readdir(path, (err, files) => {
            if (err)
                return reject(err);
            resolve(files);
        });
        return promise;
    }
    static async read(path) {
        let resolve, reject;
        let promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        fs.readFile(path, 'utf8', (err, data) => {
            if (err)
                return reject(err);
            resolve(data);
        });
        return promise;
    }
    static write(path, content) {
        fs.writeFile(path, content, err => {
            if (err) {
                console.error(err);
            }
        });
    }
    static readSync(path) {
        return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    }
}
exports.File = File;
;
//# sourceMappingURL=File.js.map