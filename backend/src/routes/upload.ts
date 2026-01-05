import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { handleUploadError } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, UploadController.uploadMiddleware, handleUploadError, UploadController.uploadFiles);

export default router;
