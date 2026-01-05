"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const multer_1 = __importDefault(require("multer"));
const Job_1 = require("../models/Job");
const storageService_1 = require("../services/storageService");
const queue_1 = require("../config/queue");
const socketService_1 = require("../services/socketService");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageService_1.StorageService.getOriginalFilePath('')); // Will be handled by StorageService
    },
    filename: (req, file, cb) => {
        const fileName = storageService_1.StorageService.generateFileName(file.originalname);
        cb(null, fileName);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000')
    }
});
class UploadController {
    static async uploadFiles(req, res) {
        try {
            const files = req.files;
            const userId = req.user.userId;
            if (!files || files.length === 0) {
                res.status(400).json({ error: 'No files uploaded' });
                return;
            }
            const jobs = [];
            for (const file of files) {
                const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
                const originalFilePath = storageService_1.StorageService.getOriginalFilePath(file.filename);
                const thumbnailFilePath = storageService_1.StorageService.getThumbnailFilePath(file.filename);
                const job = new Job_1.Job({
                    userId,
                    originalFileName: file.originalname,
                    originalFilePath,
                    fileType,
                    status: 'pending'
                });
                await job.save();
                // Add to queue if available
                if ((0, queue_1.isQueueAvailable)() && queue_1.thumbnailQueue) {
                    await queue_1.thumbnailQueue.add('process-thumbnail', {
                        jobId: job._id.toString(),
                        userId,
                        originalFilePath,
                        thumbnailFilePath,
                        fileType
                    });
                    // Update job status to queued and emit socket event
                    await Job_1.Job.findByIdAndUpdate(job._id, { status: 'queued' });
                    const socketService = socketService_1.SocketService.getInstance();
                    if (socketService) {
                        socketService.emitJobUpdate(job._id.toString(), userId, 'queued', 0);
                    }
                }
                else {
                    // Mark job as failed if queue is not available
                    await Job_1.Job.findByIdAndUpdate(job._id, {
                        status: 'failed',
                        errorMessage: 'Queue service unavailable. Redis server not running.'
                    });
                    // Emit failed status via socket
                    const socketService = socketService_1.SocketService.getInstance();
                    if (socketService) {
                        socketService.emitJobUpdate(job._id.toString(), userId, 'failed', 0, null, 'Queue service unavailable. Redis server not running.');
                    }
                }
                jobs.push({
                    id: job._id,
                    originalFileName: file.originalname,
                    status: (0, queue_1.isQueueAvailable)() ? 'pending' : 'failed',
                    progress: 0,
                    createdAt: job.createdAt,
                    error: (0, queue_1.isQueueAvailable)() ? undefined : 'Queue service unavailable'
                });
            }
            res.status(201).json({
                message: 'Files uploaded successfully',
                jobs
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    }
}
exports.UploadController = UploadController;
UploadController.uploadMiddleware = upload.array('files', 10);
//# sourceMappingURL=uploadController.js.map