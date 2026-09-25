import { Router } from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', getFeedbacks);
router.post('/', authenticateJWT, submitFeedback);

export default router;
