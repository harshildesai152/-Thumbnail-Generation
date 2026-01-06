"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQueueAvailable = exports.queueReady = exports.getQueueEvents = exports.Worker = exports.queueEvents = exports.thumbnailQueue = void 0;
const bullmq_1 = require("bullmq");
Object.defineProperty(exports, "Worker", { enumerable: true, get: function () { return bullmq_1.Worker; } });
const redis_1 = require("./redis");
// Check if Redis is connected
const isRedisConnected = () => {
    return redis_1.redis.status === 'ready' || redis_1.redis.status === 'connect';
};
// Create queue only if Redis is available
let thumbnailQueue = null;
exports.thumbnailQueue = thumbnailQueue;
let queueEvents = null;
exports.queueEvents = queueEvents;
// Initialize queue asynchronously after Redis connects
let queueInitializationPromise = null;
const initializeQueue = async () => {
    if (queueInitializationPromise)
        return queueInitializationPromise;
    queueInitializationPromise = (async () => {
        try {
            // Wait for Redis to be ready
            if (redis_1.redis.status !== 'ready') {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Redis connection timeout'));
                    }, 10000); // 10 second timeout
                    redis_1.redis.once('ready', () => {
                        clearTimeout(timeout);
                        resolve(undefined);
                    });
                    redis_1.redis.once('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
            }
            console.log('Initializing thumbnail queue with connection:', redis_1.redis.status);
            exports.thumbnailQueue = thumbnailQueue = new bullmq_1.Queue('thumbnail-processing', {
                connection: redis_1.redis, // Producer connection (can share)
                defaultJobOptions: {
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            });
            console.log('ThumbnailQueue created');
            // QueueEvents needs a blocking connection, so it creates a new connection automatically
            // We pass the config object instead of the existing client
            exports.queueEvents = queueEvents = new bullmq_1.QueueEvents('thumbnail-processing', {
                connection: redis_1.redisConfig,
            });
            console.log('QueueEvents created');
            console.log('📋 BullMQ queue initialized');
        }
        catch (error) {
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
const getQueueEvents = () => queueEvents;
exports.getQueueEvents = getQueueEvents;
// Export queue initialization promise for waiting
exports.queueReady = initializeQueue();
// Helper function to check if queue is available
const isQueueAvailable = () => {
    return thumbnailQueue !== null;
};
exports.isQueueAvailable = isQueueAvailable;
//# sourceMappingURL=queue.js.map