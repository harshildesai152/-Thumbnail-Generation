"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("../config/queue");
const Job_1 = require("../models/Job");
const thumbnailService_1 = require("../services/thumbnailService");
const socketService_1 = require("../services/socketService");
// Create worker only if queue is available
let thumbnailWorker = null;
if ((0, queue_1.isQueueAvailable)()) {
    console.log("Into the worker ===========================");
    thumbnailWorker = new queue_1.Worker('thumbnail-processing', async (job) => {
        const { jobId, userId, originalFilePath, thumbnailFilePath, fileType } = job.data;
        try {
            // Update job status to processing
            await Job_1.Job.findByIdAndUpdate(jobId, { status: 'processing', progress: 10 });
            // Emit processing status via socket
            const socketService = socketService_1.SocketService.getInstance();
            if (socketService) {
                socketService.emitJobUpdate(jobId, userId, 'processing', 10);
            }
            // Process the thumbnail
            await thumbnailService_1.ThumbnailService.processThumbnail(originalFilePath, thumbnailFilePath, fileType);
            // Update job with completion
            const thumbnailFileName = `${jobId}_thumb.jpg`;
            await Job_1.Job.findByIdAndUpdate(jobId, {
                status: 'completed',
                progress: 100,
                thumbnailFileName,
                thumbnailFilePath,
                completedAt: new Date()
            });
            // Emit completed status via socket
            if (socketService) {
                socketService.emitJobUpdate(jobId, userId, 'completed', 100, { thumbnailFileName, thumbnailFilePath });
            }
            return { thumbnailFileName, thumbnailFilePath };
        }
        catch (error) {
            console.error('Thumbnail processing error:', error);
            // Update job with failure
            await Job_1.Job.findByIdAndUpdate(jobId, {
                status: 'failed',
                errorMessage: error.message
            });
            // Emit failed status via socket
            const socketService = socketService_1.SocketService.getInstance();
            if (socketService) {
                socketService.emitJobUpdate(jobId, userId, 'failed', 0, null, error.message);
            }
            throw error;
        }
    });
    // Handle worker events
    thumbnailWorker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed successfully`);
    });
    thumbnailWorker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed:`, err.message);
    });
    console.log('👷 Thumbnail worker started');
}
else {
    console.warn('⚠️  Thumbnail worker not started - Redis not available');
}
exports.default = thumbnailWorker;
//# sourceMappingURL=thumbnailWorker.js.map