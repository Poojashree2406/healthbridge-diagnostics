import { Router } from 'express';
import { createPayment, getPayments, handlePaymentWebhook } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';
import { logAudit } from '../middleware/audit';

const router = Router();

router.post('/webhooks', handlePaymentWebhook);

router.use(authenticateJWT);

router.post('/create', logAudit('PAYMENT_CREATE', 'PAYMENT'), createPayment);
router.get('/', getPayments);

export default router;
