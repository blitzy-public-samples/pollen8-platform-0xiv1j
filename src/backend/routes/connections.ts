import { Router } from 'express';
import { ConnectionController } from 'src/backend/controllers/ConnectionController';
import { authMiddleware } from 'src/backend/middleware/auth';
import { validateRequest } from 'src/backend/middleware/validateRequest';
import { createRateLimiter } from 'src/backend/middleware/rateLimiter';

const router = Router();
const connectionController = new ConnectionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting to all routes
const connectionRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(connectionRateLimiter);

// Create a new connection
router.post(
  '/',
  validateRequest(/* Add connection creation schema */),
  connectionController.createConnection
);

// Get a specific connection
router.get(
  '/:connectionId',
  validateRequest(/* Add connection retrieval schema */),
  connectionController.getConnection
);

// Get user connections
router.get(
  '/user/:userId',
  validateRequest(/* Add user connections retrieval schema */),
  connectionController.getUserConnections
);

// Update connection strength
router.put(
  '/:connectionId/strength',
  validateRequest(/* Add connection strength update schema */),
  connectionController.updateConnectionStrength
);

// Remove a connection
router.delete(
  '/:connectionId',
  validateRequest(/* Add connection removal schema */),
  connectionController.removeConnection
);

// Get connection strength
router.get(
  '/:connectionId/strength',
  validateRequest(/* Add connection strength retrieval schema */),
  connectionController.getConnectionStrength
);

export { router as connectionsRouter };