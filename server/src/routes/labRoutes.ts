import { Router } from 'express';
import {
  getLabs,
  getDiagnosticCenters,
  getDiagnosticCenterById,
  getAvailabilitySlots,
  getLabSamplesQueue,
  updateSampleBarcodeStatus,
  uploadPreliminaryLabResults
} from '../controllers/labController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@healthbridge/shared';
import { logAudit } from '../middleware/audit';

const router = Router();

router.get('/labs', getLabs);
router.get('/centers', getDiagnosticCenters);
router.get('/centers/:id', getDiagnosticCenterById);
router.get('/availability', getAvailabilitySlots);

// Lab Technician Dedicated Routes
router.get('/lab/samples', authenticateJWT, requireRole([UserRole.LAB_TECHNICIAN, UserRole.ADMIN]), getLabSamplesQueue);
router.put('/lab/samples/:sampleId', authenticateJWT, requireRole([UserRole.LAB_TECHNICIAN, UserRole.ADMIN]), logAudit('SAMPLE_STATUS_UPDATE', 'SAMPLE'), updateSampleBarcodeStatus);
router.post('/lab/results', authenticateJWT, requireRole([UserRole.LAB_TECHNICIAN, UserRole.ADMIN]), logAudit('LAB_RESULT_UPLOAD', 'REPORT'), uploadPreliminaryLabResults);

export default router;
