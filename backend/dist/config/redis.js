"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.redisConfig = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisConfig = {
    host: 'localhost',
    port: 6379,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: null, // Recommended by BullMQ
    lazyConnect: false, // Connect immediately
};
exports.redis = new ioredis_1.default(exports.redisConfig);
exports.redis.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Redis not available. Queue functionality will be limited.');
        console.warn('💡 To enable full functionality, start Redis:');
        console.warn('   1. Download Redis from https://redis.io/download');
        console.warn('   2. Run redis-server.exe');
    }
});
exports.redis.on('connect', () => console.log('✅ Connected to Redis'));
exports.redis.on('ready', () => console.log('✅ Redis is ready'));
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map