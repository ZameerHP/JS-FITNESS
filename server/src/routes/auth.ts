import { Router } from 'express';
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
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/login', authLimiter, loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', requireAuth, getCurrentAdmin);
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/verify', requireAuth, verifyAndEnable2FA);
router.post('/2fa/disable', requireAuth, disable2FA);
router.post('/password', requireAuth, changePassword);

export default router;
