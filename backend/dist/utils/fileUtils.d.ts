export declare class FileUtils {
    static getFileSize(filePath: string): Promise<number>;
    static getFileExtension(filename: string): string;
    static isValidFileType(mimetype: string, allowedTypes: string[]): boolean;
    static formatFileSize(bytes: number): string;
}
//# sourceMappingURL=fileUtils.d.ts.map