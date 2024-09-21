import { Router } from 'express';
import { InviteController } from 'src/backend/controllers/InviteController';
import { authMiddleware } from 'src/backend/middleware/auth';
import { validateRequest } from 'src/backend/middleware/validateRequest';
import { createRateLimiter } from 'src/backend/middleware/rateLimiter';

const router = Router();
const inviteController = new InviteController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting to all routes
const inviteRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(inviteRateLimiter);

// Create a new invite
router.post(
  '/',
  validateRequest(/* Add validation schema for invite creation */),
  inviteController.createInvite
);

// Get a specific invite
router.get(
  '/:inviteCode',
  validateRequest(/* Add validation schema for invite retrieval */),
  inviteController.getInvite
);

// Get user invites
router.get(
  '/user/:userId',
  validateRequest(/* Add validation schema for user invite retrieval */),
  inviteController.getUserInvites
);

// Increment invite clicks
router.post(
  '/:inviteCode/increment',
  validateRequest(/* Add validation schema for incrementing clicks */),
  inviteController.incrementInviteClicks
);

// Deactivate an invite
router.put(
  '/:inviteCode/deactivate',
  validateRequest(/* Add validation schema for deactivating invite */),
  inviteController.deactivateInvite
);

// Get invite statistics
router.get(
  '/stats/:userId',
  validateRequest(/* Add validation schema for invite statistics retrieval */),
  inviteController.getInviteStats
);

export { router as inviteRouter };