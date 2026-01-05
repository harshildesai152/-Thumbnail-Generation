"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class StorageService {
    static async ensureDirectories() {
        await fs_1.promises.mkdir(this.originalsDir, { recursive: true });
        await fs_1.promises.mkdir(this.thumbnailsDir, { recursive: true });
    }
    static generateFileName(originalName) {
        const ext = path_1.default.extname(originalName);
        return `${(0, uuid_1.v4)()}${ext}`;
    }
    static getOriginalFilePath(fileName) {
        return path_1.default.join(this.originalsDir, fileName);
    }
    static getThumbnailFilePath(fileName) {
        const ext = path_1.default.extname(fileName);
        const baseName = path_1.default.basename(fileName, ext);
        return path_1.default.join(this.thumbnailsDir, `${baseName}_thumb.jpg`);
    }
    static async deleteFile(filePath) {
        try {
            await fs_1.promises.unlink(filePath);
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    static getFileUrl(fileName, type) {
        return `/api/files/${type}/${fileName}`;
    }
    static getUploadsDir() {
        return path_1.default.join(process.cwd(), 'uploads');
    }
}
exports.StorageService = StorageService;
StorageService.originalsDir = path_1.default.join(process.cwd(), 'uploads', 'originals');
StorageService.thumbnailsDir = path_1.default.join(process.cwd(), 'uploads', 'thumbnails');
//# sourceMappingURL=storageService.js.map