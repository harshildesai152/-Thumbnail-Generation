import { Request, Response } from 'express';
import multer from 'multer';
import { Job } from '../models/Job';
import { StorageService } from '../services/storageService';
import { thumbnailQueue, isQueueAvailable } from '../config/queue';
import { SocketService } from '../services/socketService';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, StorageService.getOriginalFilePath('')); // Will be handled by StorageService
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const fileName = StorageService.generateFileName(file.originalname);
    cb(null, fileName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000')
  }
});

export class UploadController {
  static uploadMiddleware = upload.array('files', 10);

  static async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.user!.userId;

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const jobs = [];

      for (const file of files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const originalFilePath = StorageService.getOriginalFilePath(file.filename);
        const thumbnailFilePath = StorageService.getThumbnailFilePath(file.filename);

        const job = new Job({
          userId,
          originalFileName: file.originalname,
          originalFilePath,
          fileType,
          status: 'pending'
        });

        await job.save();

        // Add to queue if available
        if (isQueueAvailable() && thumbnailQueue) {
          await thumbnailQueue.add('process-thumbnail', {
            jobId: job._id.toString(),
            userId,
            originalFilePath,
            thumbnailFilePath,
            fileType
          });

          // Update job status to queued (socket emission will be handled by BullMQ events)
          await Job.findByIdAndUpdate(job._id, { status: 'queued' });
        } else {
          // Mark job as failed if queue is not available
          await Job.findByIdAndUpdate(job._id, {
            status: 'failed',
            errorMessage: 'Queue service unavailable. Redis server not running.'
          });

          // Emit failed status via socket
          const socketService = SocketService.getInstance();
          if (socketService) {
            socketService.emitJobUpdate(job._id.toString(), userId, 'failed', 0, null, 'Queue service unavailable. Redis server not running.');
          }
        }

        jobs.push({
          id: job._id,
          originalFileName: file.originalname,
          status: isQueueAvailable() ? 'queued' : 'failed',
          progress: 0,
          createdAt: job.createdAt,
          error: isQueueAvailable() ? undefined : 'Queue service unavailable'
        });
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        jobs
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
}
