import Redis from 'ioredis';

export const redisConfig = {
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: null, // Recommended by BullMQ
  lazyConnect: false, // Connect immediately
};

export const redis = new Redis(redisConfig);

redis.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Redis not available. Queue functionality will be limited.');
    console.warn('💡 To enable full functionality, start Redis:');
    console.warn('   1. Download Redis from https://redis.io/download');
    console.warn('   2. Run redis-server.exe');
  }
});

redis.on('connect', () => console.log('✅ Connected to Redis'));
redis.on('ready', () => console.log('✅ Redis is ready'));

export default redis;
