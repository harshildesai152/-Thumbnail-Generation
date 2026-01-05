"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQueueAvailable = exports.Worker = exports.queueEvents = exports.thumbnailQueue = exports.queueReady = void 0;
const bullmq_1 = require("bullmq");
Object.defineProperty(exports, "Worker", { enumerable: true, get: function () { return bullmq_1.Worker; } });
const redis_1 = __importDefault(require("./redis"));
// Check if Redis is connected
const isRedisConnected = () => {
    return redis_1.default.status === 'ready' || redis_1.default.status === 'connect';
};
// Create queue only if Redis is available
let thumbnailQueue = null;
exports.thumbnailQueue = thumbnailQueue;
let queueEvents = null;
exports.queueEvents = queueEvents;
// Initialize queue asynchronously after Redis connects
const initializeQueue = async () => {
    try {
        // Wait for Redis to be ready
        if (redis_1.default.status !== 'ready') {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Redis connection timeout'));
                }, 10000); // 10 second timeout
                redis_1.default.once('ready', () => {
                    clearTimeout(timeout);
                    resolve(undefined);
                });
                redis_1.default.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        }
        exports.thumbnailQueue = thumbnailQueue = new bullmq_1.Queue('thumbnail-processing', {
            connection: redis_1.default,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
        exports.queueEvents = queueEvents = new bullmq_1.QueueEvents('thumbnail-processing', {
            connection: redis_1.default,
        });
        console.log('📋 BullMQ queue initialized');
    }
    catch (error) {
        console.warn('⚠️  Failed to initialize BullMQ queue:', error instanceof Error ? error.message : String(error));
        console.warn('💡 Make sure Redis server is running on localhost:6379');
    }
};
// Start queue initialization
initializeQueue();
// Export queue initialization promise
exports.queueReady = initializeQueue();
// Helper function to check if queue is available
const isQueueAvailable = () => {
    return thumbnailQueue !== null;
};
exports.isQueueAvailable = isQueueAvailable;
//# sourceMappingURL=queue.js.map