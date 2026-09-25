import { Router } from 'express';
import {
  getAdminMetrics,
  getAllBookings,
  getAllReports,
  getAllPayments,
  getAllSamples,
  getAllJourneys,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllFeedback,
  getAuditLogs,
  adminCancelBooking
} from '../controllers/adminController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@healthbridge/shared';
import { logAudit } from '../middleware/audit';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticateJWT, requireRole([UserRole.ADMIN]));

// Dashboard & Analytics
router.get('/dashboard', getAdminMetrics);

// Full data access
router.get('/bookings', getAllBookings);
router.post('/bookings/:bookingId/cancel', logAudit('ADMIN_BOOKING_CANCEL', 'BOOKING'), adminCancelBooking);

router.get('/reports', getAllReports);
router.get('/payments', getAllPayments);
router.get('/samples', getAllSamples);
router.get('/journeys', getAllJourneys);
router.get('/feedback', getAllFeedback);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', logAudit('ADMIN_ROLE_CHANGE', 'USER'), updateUserRole);
router.put('/users/:userId/toggle-status', logAudit('ADMIN_USER_STATUS_TOGGLE', 'USER'), toggleUserStatus);
router.delete('/users/:userId', logAudit('ADMIN_USER_DELETE', 'USER'), deleteUser);

// Audit logs
router.get('/audit-logs', getAuditLogs);

export default router;
