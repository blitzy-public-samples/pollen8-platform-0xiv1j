import app from './app';
import { connectToDatabase } from './config/database';
import { connectToRedis } from './config/redis';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    // Connect to the database
    await connectToDatabase();
    logger.info('Database connection established');

    // Connect to Redis
    await connectToRedis();
    logger.info('Redis connection established');

    // Start the Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Error handling for unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  // Implement graceful shutdown logic here
  // For example: close database connections, stop accepting new requests, etc.
  process.exit(0);
});

// TODO: Implement clustering for production
// TODO: Set up SSL/TLS for production
// TODO: Implement startup checks for required environment variables
// TODO: Implement mechanism to run database migrations on startup