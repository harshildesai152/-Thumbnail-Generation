export declare class ThumbnailService {
    static generateImageThumbnail(inputPath: string, outputPath: string): Promise<void>;
    static generateVideoThumbnail(inputPath: string, outputPath: string): Promise<void>;
    static processThumbnail(inputPath: string, outputPath: string, fileType: 'image' | 'video'): Promise<void>;
}
//# sourceMappingURL=thumbnailService.d.ts.map