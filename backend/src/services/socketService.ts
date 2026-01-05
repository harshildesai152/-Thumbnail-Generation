import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { queueEvents } from '../config/queue';
import { Job } from '../models/Job';

export class SocketService {
  private io: SocketServer;
  private static instance: SocketService;

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupQueueListeners();
    this.setupSocketHandlers();

    // Set as singleton instance
    SocketService.instance = this;
  }

  public static getInstance(): SocketService | null {
    return SocketService.instance;
  }

  private setupQueueListeners(): void {
    if (!queueEvents) {
      console.warn('⚠️  Queue events not available - real-time updates disabled');
      return;
    }

    queueEvents.on('waiting', async ({ jobId }) => {
      const userId = await this.getUserIdFromJobId(jobId);
      if (userId) {
        this.emitJobUpdate(jobId, userId, 'queued', 0);
      }
    });

    queueEvents.on('active', async ({ jobId, prev }) => {
      const userId = await this.getUserIdFromJobId(jobId);
      if (userId) {
        this.emitJobUpdate(jobId, userId, 'processing', 10);
      }
    });

    queueEvents.on('completed', async ({ jobId, returnvalue }) => {
      const userId = await this.getUserIdFromJobId(jobId);
      if (userId) {
        this.emitJobUpdate(jobId, userId, 'completed', 100, returnvalue);
      }
    });

    queueEvents.on('failed', async ({ jobId, failedReason }) => {
      const userId = await this.getUserIdFromJobId(jobId);
      if (userId) {
        this.emitJobUpdate(jobId, userId, 'failed', 0, null, failedReason);
      }
    });

    queueEvents.on('progress', async ({ jobId, data }) => {
      const userId = await this.getUserIdFromJobId(jobId);
      if (userId) {
        this.emitJobUpdate(jobId, userId, 'processing', typeof data === 'number' ? data : 50);
      }
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-user', (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async getUserIdFromJobId(jobId: string): Promise<string | null> {
    try {
      const job = await Job.findById(jobId).select('userId');
      return job ? job.userId.toString() : null;
    } catch (error) {
      console.error('Error fetching userId from job:', error);
      return null;
    }
  }

  public emitJobUpdate(jobId: string, userId: string, status: string, progress: number, result?: any, error?: string): void {
    const update = {
      jobId,
      status,
      progress,
      result,
      error,
      timestamp: new Date().toISOString()
    };

    // Emit to specific user room
    this.io.to(`user_${userId}`).emit('job-update', update);
  }

  public getIO(): SocketServer {
    return this.io;
  }
}
