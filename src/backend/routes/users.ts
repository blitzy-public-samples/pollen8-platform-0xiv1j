import { Router } from 'express';
import { UserController } from 'src/backend/controllers/UserController';
import { authMiddleware } from 'src/backend/middleware/auth';
import { validateRequest } from 'src/backend/middleware/validateRequest';
import { createRateLimiter } from 'src/backend/middleware/rateLimiter';

const router = Router();
const userController = new UserController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting to all routes
const userRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(userRateLimiter);

// Get user profile
router.get(
  '/:userId',
  validateRequest('getUserProfile'),
  userController.getUserProfile
);

// Update user profile
router.put(
  '/:userId',
  validateRequest('updateUserProfile'),
  userController.updateUserProfile
);

// Get user connections
router.get(
  '/:userId/connections',
  validateRequest('getUserConnections'),
  userController.getUserConnections
);

// Create a new connection
router.post(
  '/connections',
  validateRequest('createConnection'),
  userController.createConnection
);

// Get user network value
router.get(
  '/:userId/network-value',
  validateRequest('getUserNetworkValue'),
  userController.getUserNetworkValue
);

// Search users
router.get(
  '/search',
  validateRequest('searchUsers'),
  userController.searchUsers
);

export { router as userRouter };