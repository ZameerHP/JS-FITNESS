import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
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

router.use(requireAuth);

router.get('/overview', getAdminOverview);
router.put('/settings', updateSetting);
router.post('/upload', uploadMiddleware.single('image'), handleImageUpload);

router.post('/transformations', upsertTransformation);
router.delete('/transformations/:id', deleteTransformation);

router.post('/testimonials', upsertTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

router.post('/gallery', upsertGalleryItem);
router.put('/gallery/reorder', reorderGallery);
router.delete('/gallery/:id', deleteGalleryItem);

router.post('/videos', upsertVideoItem);
router.delete('/videos/:id', deleteVideoItem);

router.post('/certifications', upsertCertification);
router.delete('/certifications/:id', deleteCertification);

router.patch('/contacts/:id', markContactRead);
router.delete('/contacts/:id', deleteContact);

export default router;
