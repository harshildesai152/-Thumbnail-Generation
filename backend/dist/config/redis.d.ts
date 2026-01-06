import Redis from 'ioredis';
export declare const redisConfig: {
    host: string;
    port: number;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: null;
    lazyConnect: boolean;
};
export declare const redis: Redis;
export default redis;
//# sourceMappingURL=redis.d.ts.map