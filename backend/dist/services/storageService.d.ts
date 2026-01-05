export declare class StorageService {
    private static originalsDir;
    private static thumbnailsDir;
    static ensureDirectories(): Promise<void>;
    static generateFileName(originalName: string): string;
    static getOriginalFilePath(fileName: string): string;
    static getThumbnailFilePath(fileName: string): string;
    static deleteFile(filePath: string): Promise<void>;
    static getFileUrl(fileName: string, type: 'original' | 'thumbnail'): string;
    static getUploadsDir(): string;
}
//# sourceMappingURL=storageService.d.ts.map