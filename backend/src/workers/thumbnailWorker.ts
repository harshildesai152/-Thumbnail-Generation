import { Worker, isQueueAvailable } from '../config/queue';
import { redisConfig } from '../config/redis';
import { Job as JobModel } from '../models/Job';
import { ThumbnailService } from '../services/thumbnailService';
import { StorageService } from '../services/storageService';
import { SocketService } from '../services/socketService';
import path from 'path';

interface JobData {
  jobId: string;
  userId: string;
  originalFilePath: string;
  thumbnailFilePath: string;
  fileType: 'image' | 'video';
}



let thumbnailWorker: Worker | null = null;

export const initThumbnailWorker = () => {
  if (thumbnailWorker) return thumbnailWorker;

  if (isQueueAvailable()) {
    console.log("👷 Initializing thumbnail worker...");

    // Ensure SocketService is ready before creating worker
    const socketService = SocketService.getInstance();
    if (!socketService) {
      console.error('❌ Cannot initialize worker: SocketService not available');
      return null;
    }

    console.log("✅ SocketService available, creating worker...");
    thumbnailWorker = new Worker<JobData>('thumbnail-processing', async (job) => {
      const { jobId, userId, originalFilePath, thumbnailFilePath, fileType } = job.data;

      try {
        console.log(`🚀 WORKER: Job ${jobId} started processing`);

        // Update job status to processing
        await JobModel.findByIdAndUpdate(jobId, { status: 'processing', progress: 10 });
        console.log(`🚀 WORKER: Job ${jobId} status updated to processing`);

        // Emit processing status via socket immediately (don't rely on BullMQ active event timing)
        const socketService = SocketService.getInstance();
        if (socketService) {
            socketService.emitJobUpdate(jobId, userId, 'processing', 10);
            console.log(`🔄 WORKER: Emitted processing status via socket for job ${jobId}`);
        }

        // Process the thumbnail
        console.log(`🔄 Processing thumbnail for job ${jobId}`);

        // Update progress to 50% during processing
        await JobModel.findByIdAndUpdate(jobId, { progress: 50 });
        if (socketService) {
            socketService.emitJobUpdate(jobId, userId, 'processing', 50);
        }

        await ThumbnailService.processThumbnail(originalFilePath, thumbnailFilePath, fileType);

        // Add small delay to make processing status visible (remove in production if too slow)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update progress to 90% before final completion
        await JobModel.findByIdAndUpdate(jobId, { progress: 90 });
        if (socketService) {
            socketService.emitJobUpdate(jobId, userId, 'processing', 90);
        }
        console.log(`📊 WORKER: Job ${jobId} progress updated to 90%`);

        // Update job with completion
        const thumbnailFileName = path.basename(thumbnailFilePath); // Extract filename from full path
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
            console.log(`🔄 WORKER: Emitted completed status via socket for job ${jobId}`);
        }

        console.log(`✅ WORKER: Job ${jobId} completed successfully`);

        return { thumbnailFileName, thumbnailFilePath };
      } catch (error) {
        console.error('Thumbnail processing error:', error);

        // Update job with failure
        await JobModel.findByIdAndUpdate(jobId, {
          status: 'failed',
          errorMessage: (error as Error).message
        });

        console.error(`❌ WORKER: Job ${jobId} failed:`, (error as Error).message);

        throw error;
      }
    }, {
      connection: redisConfig, // Use separate config for blocking connection
      concurrency: 5
    });

    // Handle worker events
    // Listen to worker-level job events
    thumbnailWorker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    thumbnailWorker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    // Listen to individual job events for real-time updates
    thumbnailWorker.on('active', (job) => {
      console.log(`⚙️ Worker detected job ${job.id} became active`);
      // The job processing function will handle the socket emission
    });

    console.log('👷 Thumbnail worker started');
    return thumbnailWorker;
  } else {
    console.warn('⚠️  Thumbnail worker not started - Redis not available (Queue not ready). isQueueAvailable() returned false.');
    return null;
  }
};

export default thumbnailWorker;
