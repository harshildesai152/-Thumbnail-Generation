import { Worker, isQueueAvailable } from '../config/queue';
import { Job as JobModel } from '../models/Job';
import { ThumbnailService } from '../services/thumbnailService';
import { StorageService } from '../services/storageService';
import { SocketService } from '../services/socketService';

interface JobData {
  jobId: string;
  userId: string;
  originalFilePath: string;
  thumbnailFilePath: string;
  fileType: 'image' | 'video';
}

// Create worker only if queue is available
let thumbnailWorker: Worker | null = null;

if (isQueueAvailable()) {
  console.log("Into the worker ===========================");
  thumbnailWorker = new Worker<JobData>('thumbnail-processing', async (job) => {
    const { jobId, userId, originalFilePath, thumbnailFilePath, fileType } = job.data;

    try {
      // Update job status to processing
      await JobModel.findByIdAndUpdate(jobId, { status: 'processing', progress: 10 });

      // Emit processing status via socket
      const socketService = SocketService.getInstance();
      if (socketService) {
        socketService.emitJobUpdate(jobId, userId, 'processing', 10);
      }

      // Process the thumbnail
      await ThumbnailService.processThumbnail(originalFilePath, thumbnailFilePath, fileType);

      // Update job with completion
      const thumbnailFileName = `${jobId}_thumb.jpg`;
      await JobModel.findByIdAndUpdate(jobId, {
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
    } catch (error) {
      console.error('Thumbnail processing error:', error);

      // Update job with failure
      await JobModel.findByIdAndUpdate(jobId, {
        status: 'failed',
        errorMessage: (error as Error).message
      });

      // Emit failed status via socket
      const socketService = SocketService.getInstance();
      if (socketService) {
        socketService.emitJobUpdate(jobId, userId, 'failed', 0, null, (error as Error).message);
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
} else {
  console.warn('⚠️  Thumbnail worker not started - Redis not available');
}

export default thumbnailWorker;
