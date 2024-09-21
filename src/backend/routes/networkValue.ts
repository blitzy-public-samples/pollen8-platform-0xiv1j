import { Router } from 'express';
import { NetworkValueController } from 'src/backend/controllers/NetworkValueController';
import { authMiddleware } from 'src/backend/middleware/auth';
import { validateRequest } from 'src/backend/middleware/validateRequest';
import { createRateLimiter } from 'src/backend/middleware/rateLimiter';

const router = Router();
const networkValueController = new NetworkValueController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting to all routes
const networkValueRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(networkValueRateLimiter);

// Get a user's network value
router.get(
  '/:userId',
  validateRequest('getNetworkValue'),
  networkValueController.getNetworkValue
);

// Calculate and update a user's network value
router.post(
  '/:userId/calculate',
  validateRequest('calculateNetworkValue'),
  networkValueController.calculateNetworkValue
);

// Get top network values
router.get(
  '/top',
  validateRequest('getTopNetworkValues'),
  networkValueController.getTopNetworkValues
);

// Recalculate all network values (admin only)
router.post(
  '/recalculate-all',
  authMiddleware.isAdmin,
  validateRequest('recalculateAllNetworkValues'),
  networkValueController.recalculateAllNetworkValues
);

export { router as networkValueRouter };