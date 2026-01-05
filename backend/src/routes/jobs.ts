import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, JobController.getUserJobs);
router.get('/:jobId', authenticate, JobController.getJobById);

export default router;
