"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
class ThumbnailService {
    static async generateImageThumbnail(inputPath, outputPath) {
        await (0, sharp_1.default)(inputPath)
            .resize(128, 128, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 85 })
            .toFile(outputPath);
    }
    static async generateVideoThumbnail(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            // Get video duration first
            fluent_ffmpeg_1.default.ffprobe(inputPath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                const duration = metadata.format.duration || 0;
                const seekTime = Math.floor(duration / 2); // Middle of video
                (0, fluent_ffmpeg_1.default)(inputPath)
                    .screenshots({
                    timestamps: [seekTime],
                    filename: path_1.default.basename(outputPath, path_1.default.extname(outputPath)),
                    folder: path_1.default.dirname(outputPath),
                    size: '128x128'
                })
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
            });
        });
    }
    static async processThumbnail(inputPath, outputPath, fileType) {
        if (fileType === 'image') {
            await this.generateImageThumbnail(inputPath, outputPath);
        }
        else {
            await this.generateVideoThumbnail(inputPath, outputPath);
        }
    }
}
exports.ThumbnailService = ThumbnailService;
//# sourceMappingURL=thumbnailService.js.map