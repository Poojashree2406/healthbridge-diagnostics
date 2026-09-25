import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking
} from '../controllers/bookingController';
import { authenticateJWT } from '../middleware/auth';
import { logAudit } from '../middleware/audit';

const router = Router();

router.use(authenticateJWT);

router.post('/', logAudit('BOOKING_CREATE', 'BOOKING'), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', logAudit('BOOKING_CANCEL', 'BOOKING'), cancelBooking);
router.put('/:id/reschedule', logAudit('BOOKING_RESCHEDULE', 'BOOKING'), rescheduleBooking);

export default router;
