"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileUtils {
    static async getFileSize(filePath) {
        try {
            const stats = await fs_1.promises.stat(filePath);
            return stats.size;
        }
        catch {
            return 0;
        }
    }
    static getFileExtension(filename) {
        return path_1.default.extname(filename).toLowerCase();
    }
    static isValidFileType(mimetype, allowedTypes) {
        return allowedTypes.includes(mimetype);
    }
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=fileUtils.js.map