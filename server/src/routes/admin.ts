import { Router, RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { uploadMiddleware } from '../services/uploads.js';
import {
  getAdminOverview,
  updateSetting,
  handleImageUpload,
  upsertTransformation,
  deleteTransformation,
  upsertTestimonial,
  deleteTestimonial,
  upsertGalleryItem,
  reorderGallery,
  deleteGalleryItem,
  upsertVideoItem,
  deleteVideoItem,
  upsertCertification,
  deleteCertification,
  markContactRead,
  deleteContact,
} from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth as unknown as RequestHandler);

router.get('/overview', asyncHandler(getAdminOverview));
router.put('/settings', asyncHandler(updateSetting));
router.post('/upload', uploadMiddleware.single('image'), asyncHandler(handleImageUpload));

router.post('/transformations', asyncHandler(upsertTransformation));
router.delete('/transformations/:id', asyncHandler(deleteTransformation));

router.post('/testimonials', asyncHandler(upsertTestimonial));
router.delete('/testimonials/:id', asyncHandler(deleteTestimonial));

router.post('/gallery', asyncHandler(upsertGalleryItem));
router.put('/gallery/reorder', asyncHandler(reorderGallery));
router.delete('/gallery/:id', asyncHandler(deleteGalleryItem));

router.post('/videos', asyncHandler(upsertVideoItem));
router.delete('/videos/:id', asyncHandler(deleteVideoItem));

router.post('/certifications', asyncHandler(upsertCertification));
router.delete('/certifications/:id', asyncHandler(deleteCertification));

router.patch('/contacts/:id', asyncHandler(markContactRead));
router.delete('/contacts/:id', asyncHandler(deleteContact));

export default router;
