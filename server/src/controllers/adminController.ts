import { Request, Response } from 'express';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Report } from '../models/Report';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { Feedback } from '../models/Feedback';
import { Sample } from '../models/Sample';
import { DiagnosticJourney } from '../models/DiagnosticJourney';
import { PatientProfile } from '../models/PatientProfile';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '@healthbridge/shared';

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export const getAdminMetrics = async (req: Request, res: Response) => {
  try {
    const [
      totalPatients, totalDoctors, totalLabTechs,
      activeBookings, completedBookings, cancelledBookings,
      totalReports, totalSamples,
      paymentAgg, feedbackAgg, bookingsByStatus, recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.PATIENT }),
      User.countDocuments({ role: UserRole.PHYSICIAN }),
      User.countDocuments({ role: UserRole.LAB_TECHNICIAN }),
      Booking.countDocuments({ bookingStatus: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] } }),
      Booking.countDocuments({ bookingStatus: 'COMPLETED' }),
      Booking.countDocuments({ bookingStatus: 'CANCELLED' }),
      Report.countDocuments(),
      Sample.countDocuments(),
      Payment.aggregate([{ $match: { status: 'PAID' } }, { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }]),
      Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
      Booking.aggregate([{ $group: { _id: '$bookingStatus', count: { $sum: 1 } } }]),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('patientId', 'name email')
        .populate('testIds', 'name price')
        .lean()
    ]);

    return res.json({
      success: true,
      metrics: {
        totalPatients,
        totalDoctors,
        totalLabTechs,
        activeBookings,
        completedBookings,
        cancelledBookings,
        reportsGenerated: totalReports,
        samplesProcessed: totalSamples,
        totalRevenue: paymentAgg[0]?.totalRevenue || 0,
        averageRating: Number((feedbackAgg[0]?.avgRating || 4.8).toFixed(1))
      },
      bookingsByStatus,
      recentBookings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Bookings (Admin View) ────────────────────────────────────────────────
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.bookingStatus = status;
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'patientDetails.name': { $regex: search, $options: 'i' } },
        { 'patientDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('patientId', 'name email phone')
        .populate('testIds', 'name code price')
        .populate('centerId', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(query)
    ]);
    return res.json({ success: true, count: bookings.length, total, page: Number(page), bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Reports (Admin View) ─────────────────────────────────────────────────
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('patientId', 'name email')
        .populate('testId', 'name code')
        .sort({ reportDate: -1 })
        .skip(skip).limit(Number(limit)).lean(),
      Report.countDocuments(query)
    ]);
    return res.json({ success: true, count: reports.length, total, reports });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Payments (Admin View) ────────────────────────────────────────────────
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)).lean(),
      Payment.countDocuments(query)
    ]);
    return res.json({ success: true, count: payments.length, total, payments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Samples (Admin View) ─────────────────────────────────────────────────
export const getAllSamples = async (req: Request, res: Response) => {
  try {
    const samples = await Sample.find()
      .populate({ path: 'bookingId', populate: [{ path: 'patientId', select: 'name email' }, { path: 'testIds', select: 'name' }] })
      .sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, count: samples.length, samples });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Journeys (Admin View) ────────────────────────────────────────────────
export const getAllJourneys = async (req: Request, res: Response) => {
  try {
    const journeys = await DiagnosticJourney.find()
      .populate({ path: 'bookingId', populate: { path: 'patientId', select: 'name email' } })
      .sort({ updatedAt: -1 }).limit(50).lean();
    return res.json({ success: true, count: journeys.length, journeys });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All Users / Directory ────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value' });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Suspend / Reactivate User ────────────────────────────────────────────────
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    (user as any).isActive = !(user as any).isActive;
    await user.save();
    const status = (user as any).isActive ? 'activated' : 'suspended';
    return res.json({ success: true, message: `User account ${status}`, user });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    return res.json({ success: true, message: 'User account permanently deleted' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─── All Feedback ─────────────────────────────────────────────────────────────
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.find()
      .populate('patientId', 'name email')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, count: feedback.length, feedback });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { action, role, userEmail } = req.query;
    const query: any = {};
    if (action) query.action = action;
    if (role) query.role = role;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: 'i' };
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(200).lean();
    return res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Cancel Booking (Admin Override) ─────────────────────────────────────────
export const adminCancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: 'CANCELLED', cancellationReason: reason || 'Admin override cancellation' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.json({ success: true, message: 'Booking cancelled by admin', booking });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
