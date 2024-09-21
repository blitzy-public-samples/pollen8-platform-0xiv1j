import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from 'src/backend/config/redis';
import { RATE_LIMIT_CONFIG } from 'src/backend/config/rateLimit';

export const createRateLimiter = (options: Partial<rateLimit.Options> = {}) => {
  // Merge default rate limit configuration with provided options
  const mergedOptions = { ...RATE_LIMIT_CONFIG, ...options };

  // Create a Redis store for rate limiting data
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'rl:', // prefix for rate limiter keys in Redis
  });

  // Configure the rate limiter with the merged options and Redis store
  const limiter = rateLimit({
    ...mergedOptions,
    store: redisStore,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
      });
    },
    keyGenerator: (req: Request) => {
      // Use IP address as the default key, can be customized based on requirements
      return req.ip;
    },
  });

  // Return the configured rate limiter middleware
  return limiter;
};