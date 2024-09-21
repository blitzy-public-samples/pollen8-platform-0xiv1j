import { Router } from 'express';
import { AuthController } from 'src/backend/controllers/AuthController';
import { authMiddleware } from 'src/backend/middleware/auth';
import { validateRequest } from 'src/backend/middleware/validateRequest';
import { createRateLimiter } from 'src/backend/middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Rate limiter for authentication routes
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

// Route for sending verification code
router.post(
  '/send-verification',
  authRateLimiter,
  validateRequest(/* TODO: Add validation schema */),
  authController.sendVerificationCode
);

// Route for verifying code and logging in
router.post(
  '/verify',
  authRateLimiter,
  validateRequest(/* TODO: Add validation schema */),
  authController.verifyCode
);

// Route for logging out (requires authentication)
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

export { router as authRouter };

// TODO: Implement request validation schemas
// TODO: Add appropriate error handling for each route
// TODO: Add logging for authentication attempts and outcomes
// TODO: Consider implementing refresh token functionality
// TODO: Ensure that all routes are properly secured and follow best practices
// TODO: Add unit tests for the authentication routes
// TODO: Document the API endpoints created by this router