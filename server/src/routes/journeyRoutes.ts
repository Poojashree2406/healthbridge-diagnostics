import { Router } from 'express';
import { getJourneyByBooking, updateJourneyStage } from '../controllers/journeyController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@healthbridge/shared';

const router = Router();

router.get('/:bookingId', authenticateJWT, getJourneyByBooking);
router.put('/status', authenticateJWT, requireRole([UserRole.LAB_TECHNICIAN, UserRole.RADIOLOGIST, UserRole.PHYSICIAN, UserRole.ADMIN]), updateJourneyStage);

export default router;
