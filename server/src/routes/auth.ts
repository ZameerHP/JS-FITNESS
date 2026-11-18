import { Router, RequestHandler } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const authGuard = requireAuth as unknown as RequestHandler;

router.post('/login', authLimiter, asyncHandler(loginAdmin));
router.post('/logout', asyncHandler(logoutAdmin));
router.get('/me', authGuard, asyncHandler(getCurrentAdmin));
router.post('/2fa/setup', authGuard, asyncHandler(setup2FA));
router.post('/2fa/verify', authGuard, asyncHandler(verifyAndEnable2FA));
router.post('/2fa/disable', authGuard, asyncHandler(disable2FA));
router.post('/password', authGuard, asyncHandler(changePassword));

export default router;
