import { Router } from 'express';
import { getDoctorDashboard, approveReportByDoctor } from '../controllers/doctorController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@healthbridge/shared';

const router = Router();

router.use(authenticateJWT, requireRole([UserRole.PHYSICIAN, UserRole.RADIOLOGIST, UserRole.ADMIN]));

router.get('/dashboard', getDoctorDashboard);
router.post('/reports/:reportId/approve', approveReportByDoctor);

export default router;
