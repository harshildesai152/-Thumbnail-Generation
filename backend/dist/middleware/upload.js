"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = void 0;
const multer_1 = __importDefault(require("multer"));
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'File too large' });
            return;
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({ error: 'Too many files' });
            return;
        }
    }
    if (error.message === 'Invalid file type') {
        res.status(400).json({ error: 'Invalid file type' });
        return;
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map