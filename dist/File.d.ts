export declare class File {
    static listDirectory(path: string): Promise<string[]>;
    static read(path: string): Promise<string>;
    static write(path: string, content: string): void;
    static readSync(path: string): string;
}
