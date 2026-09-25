import { Router } from 'express';
import { getMyPatientProfile, updateMyPatientProfile, updateConsentSettings } from '../controllers/patientController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getMyPatientProfile);
router.put('/me', updateMyPatientProfile);
router.put('/consent', updateConsentSettings);

export default router;
