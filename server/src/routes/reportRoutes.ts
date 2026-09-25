import { Router } from 'express';
import {
  getReports,
  getReportById,
  downloadReportPDF,
  shareReport,
  getSharedReportByToken,
  getHealthTrends
} from '../controllers/reportController';
import { authenticateJWT } from '../middleware/auth';
import { logAudit } from '../middleware/audit';

const router = Router();

router.get('/share-access/:shareToken', getSharedReportByToken);

router.use(authenticateJWT);

router.get('/', getReports);
router.get('/trends', getHealthTrends);
router.get('/:id', logAudit('REPORT_VIEW', 'REPORT'), getReportById);
router.get('/:id/download', logAudit('REPORT_DOWNLOAD', 'REPORT'), downloadReportPDF);
router.post('/:id/share', logAudit('REPORT_SHARE', 'REPORT'), shareReport);

export default router;
