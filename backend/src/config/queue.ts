import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis, redisConfig } from './redis';

// Check if Redis is connected
const isRedisConnected = () => {
  return redis.status === 'ready' || redis.status === 'connect';
};

// Create queue only if Redis is available
let thumbnailQueue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

// Initialize queue asynchronously after Redis connects
let queueInitializationPromise: Promise<void> | null = null;

const initializeQueue = async () => {
  if (queueInitializationPromise) return queueInitializationPromise;

  queueInitializationPromise = (async () => {
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

      console.log('Initializing thumbnail queue with connection:', redis.status);
      
      thumbnailQueue = new Queue('thumbnail-processing', {
        connection: redis, // Producer connection (can share)
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
      console.log('ThumbnailQueue created');

      // QueueEvents needs a blocking connection, so it creates a new connection automatically
      // We pass the config object instead of the existing client
      queueEvents = new QueueEvents('thumbnail-processing', {
        connection: redisConfig,
      });
      console.log('QueueEvents created');

      console.log('📋 BullMQ queue initialized');
    } catch (error) {
      console.error('⚠️  Failed to initialize BullMQ queue ERROR:', error);
      console.warn('💡 Make sure Redis server is running on localhost:6379');
      // Reset promise to allow retrying if needed (though typically this is fatal for queue features)
      queueInitializationPromise = null;
    }
  })();

  return queueInitializationPromise;
};

// Start queue initialization
// We don't await here to avoid blocking module load, but queueReady export allows waiting
initializeQueue();

export { thumbnailQueue, queueEvents, Worker };

export const getQueueEvents = () => queueEvents;

// Export queue initialization promise for waiting
export const queueReady = initializeQueue();

// Helper function to check if queue is available
export const isQueueAvailable = () => {
  return thumbnailQueue !== null;
};
