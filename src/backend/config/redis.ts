import Redis from 'ioredis';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB, 10)
};

export const redisClient = new Redis(REDIS_CONFIG);

export const connectToRedis = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    redisClient.on('connect', () => {
      console.log('Successfully connected to Redis');
      resolve();
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
      reject(error);
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
    });

    // Attempt to connect
    redisClient.connect().catch((error) => {
      console.error('Failed to connect to Redis:', error);
      reject(error);
    });
  });
};

// Graceful shutdown function
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.quit();
    console.log('Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    throw error;
  }
};