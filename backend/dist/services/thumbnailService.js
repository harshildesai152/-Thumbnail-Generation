"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const ffmpegPath = require('ffmpeg-static');
const { path: ffprobePath } = require('ffprobe-static');
// Configure FFmpeg binary paths
if (ffmpegPath) {
    fluent_ffmpeg_1.default.setFfmpegPath(ffmpegPath);
}
else {
    console.warn('FFmpeg static binary not found, using system PATH');
}
if (ffprobePath) {
    fluent_ffmpeg_1.default.setFfprobePath(ffprobePath);
}
else {
    console.warn('FFprobe static binary not found, using system PATH');
}
class ThumbnailService {
    static async generateImageThumbnail(inputPath, outputPath) {
        await (0, sharp_1.default)(inputPath, {
            limitInputPixels: 1000000000 // Increase pixel limit from ~268M to 1B pixels
        })
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
                    filename: path_1.default.basename(outputPath),
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