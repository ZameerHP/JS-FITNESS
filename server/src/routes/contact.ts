import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.post('/', contactLimiter, asyncHandler(submitContactForm));

export default router;
