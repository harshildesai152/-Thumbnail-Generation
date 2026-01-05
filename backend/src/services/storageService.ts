import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private static originalsDir = path.join(process.cwd(), 'uploads', 'originals');
  private static thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');

  static async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.originalsDir, { recursive: true });
    await fs.mkdir(this.thumbnailsDir, { recursive: true });
  }

  static generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
  }

  static getOriginalFilePath(fileName: string): string {
    return path.join(this.originalsDir, fileName);
  }

  static getThumbnailFilePath(fileName: string): string {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    return path.join(this.thumbnailsDir, `${baseName}_thumb.jpg`);
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  static getFileUrl(fileName: string, type: 'original' | 'thumbnail'): string {
    return `/api/files/${type}/${fileName}`;
  }

  static getUploadsDir(): string {
    return path.join(process.cwd(), 'uploads');
  }
}
