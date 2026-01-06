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
    if (!SocketService.instance) {
      console.warn('⚠️  SocketService.getInstance() called but instance is null');
    }
    return SocketService.instance;
  }

  private setupQueueListeners(): void {
    // Import queue events dynamically to avoid circular dependencies
    import('../config/queue').then(({ getQueueEvents }) => {
      const checkAndSetup = () => {
        console.log('🔍 Checking for QueueEvents...');
        const events = getQueueEvents();

        if (!events) {
          console.warn('⚠️  Queue events not available - real-time updates disabled. Retrying in 2s...');
          // Try again in 2 seconds
          setTimeout(checkAndSetup, 2000);
          return;
        }

        console.log('✅ Queue events listener attached successfully');
        console.log('🔧 QueueEvents object:', typeof events, events?.constructor?.name);

        events.on('waiting', async ({ jobId }: { jobId: string }) => {
          console.log(`📋 DEBUG: BullMQ Job ${jobId} waiting/queued event received`);
          try {
            // Get job data from BullMQ to extract MongoDB jobId and userId
            const jobData = await this.getBullMQJobData(jobId);
            if (jobData) {
              this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'queued', 0);
            } else {
              console.warn(`⚠️ DEBUG: BullMQ Job ${jobId} waiting - Job data not found`);
            }
          } catch (error) {
            console.error(`❌ Error processing waiting event for job ${jobId}:`, error);
          }
        });

        events.on('active', async ({ jobId, prev }: { jobId: string, prev?: string }) => {
          console.log(`⚙️  DEBUG: BullMQ Job ${jobId} active/processing event received`);
          try {
            // Get job data from BullMQ to extract MongoDB jobId and userId
            const jobData = await this.getBullMQJobData(jobId);
            if (jobData) {
              this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'processing', 10);
            }
          } catch (error) {
            console.error(`❌ Error processing active event for job ${jobId}:`, error);
          }
        });

        events.on('completed', async ({ jobId, returnvalue }: { jobId: string, returnvalue: any }) => {
          console.log(`✅ DEBUG: BullMQ Job ${jobId} completed event received`);
          try {
            const jobData = await this.getBullMQJobData(jobId);
            if (jobData) {
              console.log(`✅ DEBUG: Emitting completed for user ${jobData.userId}`);
              this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'completed', 100, returnvalue);
            }
          } catch (error) {
            console.error(`❌ Error processing completed event for job ${jobId}:`, error);
          }
        });

        events.on('failed', async ({ jobId, failedReason }: { jobId: string, failedReason: string }) => {
          console.log(`❌ DEBUG: BullMQ Job ${jobId} failed event received: ${failedReason}`);
          try {
            const jobData = await this.getBullMQJobData(jobId);
            if (jobData) {
              this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'failed', 0, null, failedReason);
            }
          } catch (error) {
            console.error(`❌ Error processing failed event for job ${jobId}:`, error);
          }
        });

        events.on('progress', async ({ jobId, data }: { jobId: string, data: number | any }) => {
          console.log(`📊 DEBUG: BullMQ Job ${jobId} progress event received: ${data}`);
          try {
            const jobData = await this.getBullMQJobData(jobId);
            if (jobData) {
              this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'processing', typeof data === 'number' ? data : 50);
            }
          } catch (error) {
            console.error(`❌ Error processing progress event for job ${jobId}:`, error);
          }
        });
      };

      // Start checking immediately
      checkAndSetup();
    }).catch(error => {
      console.error('❌ Failed to setup queue listeners:', error);
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

  private async getBullMQJobData(bullMQJobId: string): Promise<{ mongoJobId: string; userId: string } | null> {
    try {
      // Import queue to get job data
      const { thumbnailQueue } = await import('../config/queue');
      if (!thumbnailQueue) {
        console.error('❌ Queue not available for getting job data');
        return null;
      }

      // Get the BullMQ job
      const job = await thumbnailQueue.getJob(bullMQJobId);
      if (!job || !job.data) {
        console.error(`❌ BullMQ job ${bullMQJobId} not found or has no data`);
        return null;
      }

      const { jobId: mongoJobId, userId } = job.data;
      if (!mongoJobId || !userId) {
        console.error(`❌ BullMQ job ${bullMQJobId} missing mongoJobId or userId in data:`, job.data);
        return null;
      }

      return { mongoJobId, userId };
    } catch (error) {
      console.error(`❌ Error getting BullMQ job data for job ${bullMQJobId}:`, error);
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
    console.log(`🔄 SOCKET EMIT: Job ${jobId} -> ${status} (${progress}%) to user_${userId}`);
    console.log(`🔄 Connected sockets:`, this.io.sockets.sockets.size);
    console.log(`🔄 Rooms for user_${userId}:`, this.io.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0);

    this.io.to(`user_${userId}`).emit('job-update', update);
  }

  public getIO(): SocketServer {
    return this.io;
  }
}
