import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export class ThumbnailService {
  static async generateImageThumbnail(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .resize(128, 128, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
  }

  static async generateVideoThumbnail(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get video duration first
      ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
        if (err) {
          reject(err);
          return;
        }

        const duration = metadata.format.duration || 0;
        const seekTime = Math.floor(duration / 2); // Middle of video

        ffmpeg(inputPath)
          .screenshots({
            timestamps: [seekTime],
            filename: path.basename(outputPath, path.extname(outputPath)),
            folder: path.dirname(outputPath),
            size: '128x128'
          })
          .on('end', () => resolve())
          .on('error', (err: any) => reject(err));
      });
    });
  }

  static async processThumbnail(inputPath: string, outputPath: string, fileType: 'image' | 'video'): Promise<void> {
    if (fileType === 'image') {
      await this.generateImageThumbnail(inputPath, outputPath);
    } else {
      await this.generateVideoThumbnail(inputPath, outputPath);
    }
  }
}
