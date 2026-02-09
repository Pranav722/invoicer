import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await redisClient.quit();
    logger.info('Redis connection closed due to app termination');
});

export { redisClient };
