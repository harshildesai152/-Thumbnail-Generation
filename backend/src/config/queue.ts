import { Queue, Worker, QueueEvents } from 'bullmq';
import redis from './redis';

// Check if Redis is connected
const isRedisConnected = () => {
  return redis.status === 'ready' || redis.status === 'connect';
};

// Create queue only if Redis is available
let thumbnailQueue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

// Initialize queue asynchronously after Redis connects
const initializeQueue = async () => {
  try {
    // Wait for Redis to be ready
    if (redis.status !== 'ready') {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis connection timeout'));
        }, 10000); // 10 second timeout

        redis.once('ready', () => {
          clearTimeout(timeout);
          resolve(undefined);
        });

        redis.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }

    thumbnailQueue = new Queue('thumbnail-processing', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    queueEvents = new QueueEvents('thumbnail-processing', {
      connection: redis,
    });

    console.log('📋 BullMQ queue initialized');
  } catch (error) {
    console.warn('⚠️  Failed to initialize BullMQ queue:', error instanceof Error ? error.message : String(error));
    console.warn('💡 Make sure Redis server is running on localhost:6379');
  }
};

// Start queue initialization
initializeQueue();

// Export queue initialization promise
export const queueReady = initializeQueue();

// Export queue or null
export { thumbnailQueue, queueEvents, Worker };

// Helper function to check if queue is available
export const isQueueAvailable = () => {
  return thumbnailQueue !== null;
};
