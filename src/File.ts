const fs = require('fs');

export class File {

    public static async listDirectory(path: string): Promise<string[]> {
        let resolve, reject;
        let promise = new Promise<string[]>((res, rej) => {
            resolve = res;
            reject = rej;
        });
    
        fs.readdir(path, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });

        return promise;
    }

    public static async read(path: string): Promise<string> {
        let resolve, reject;
        let promise = new Promise<string>((res, rej) => {
            resolve = res;
            reject = rej;
        });
    
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    
        return promise;
    }

    public static write(path: string, content: string) {
        fs.writeFile(path, content, err => {
            if (err) {
              console.error(err);
            }
        });
    }

    public static readSync(path: string): string {
        return fs.readFileSync(path, {encoding:'utf8', flag:'r'});
    }
};