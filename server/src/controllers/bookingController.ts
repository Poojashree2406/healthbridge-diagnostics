import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { Appointment } from '../models/Appointment';
import { AvailabilitySlot } from '../models/AvailabilitySlot';
import { DiagnosticJourney } from '../models/DiagnosticJourney';
import { Sample } from '../models/Sample';
import { Test } from '../models/Test';
import { TestPackage } from '../models/TestPackage';
import { createBookingSchema, DiagnosticStage, ServiceMode, BookingStatus, AppointmentStatus, PaymentStatus, SampleStatus } from '@healthbridge/shared';
import { NotificationAdapter } from '../integrations/notificationAdapter';
import { Refund } from '../models/Refund';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validated = createBookingSchema.parse(req.body);

    // Lock availability slot server-side
    const timeParts = validated.timeSlot.split(' - ');
    const startTime = timeParts[0];

    const slot = await AvailabilitySlot.findOne({
      centerId: validated.centerId,
      date: validated.appointmentDate,
      startTime
    });

    if (slot) {
      if (validated.serviceMode === ServiceMode.HOME_COLLECTION) {
        if (slot.homeBookedCount >= slot.homeCollectionCapacity) {
          return res.status(400).json({ success: false, message: 'Selected home collection slot is fully booked' });
        }
        slot.homeBookedCount += 1;
      } else {
        if (slot.bookedCount >= slot.totalCapacity) {
          return res.status(400).json({ success: false, message: 'Selected center slot is fully booked' });
        }
        slot.bookedCount += 1;
      }
      await slot.save();
    }

    // Calculate Pricing
    let subtotal = 0;
    const tests = await Test.find({ _id: { $in: validated.testIds } });
    tests.forEach(t => { subtotal += t.price; });

    let discount = 0;
    if (validated.packageId) {
      const pkg = await TestPackage.findById(validated.packageId);
      if (pkg) {
        discount = Math.round((subtotal * pkg.discountPercent) / 100);
      }
    }

    const collectionFee = validated.serviceMode === ServiceMode.HOME_COLLECTION ? 150 : 0;
    const payableAmount = subtotal - discount + collectionFee;

    const bookingIdCode = `HB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await Booking.create({
      bookingId: bookingIdCode,
      patientId: req.user.id,
      testIds: validated.testIds,
      packageId: validated.packageId,
      centerId: validated.centerId,
      serviceMode: validated.serviceMode,
      collectionAddress: validated.collectionAddress,
      appointmentDate: validated.appointmentDate,
      timeSlot: validated.timeSlot,
      subtotalAmount: subtotal,
      collectionFee,
      discountAmount: discount,
      payableAmount,
      paymentStatus: PaymentStatus.PENDING,
      bookingStatus: BookingStatus.SCHEDULED,
      patientDetails: validated.patientDetails
    });

    // Create Appointment
    const appointmentDateObj = new Date(`${validated.appointmentDate}T${startTime}:00`);
    await Appointment.create({
      bookingId: booking._id,
      patientId: req.user.id,
      centerId: validated.centerId,
      dateTime: appointmentDateObj,
      status: AppointmentStatus.SCHEDULED
    });

    // Create Sample barcode
    const barcode = `SMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await Sample.create({
      bookingId: booking._id,
      barcode,
      sampleType: tests[0]?.sampleType || 'Blood (EDTA)',
      status: SampleStatus.PENDING
    });

    // Initialize 10-Stage Diagnostic Journey Timeline
    const initialStages = [
      { stage: DiagnosticStage.BOOKING_CONFIRMED, title: 'Booking Confirmed', status: 'COMPLETED' as const, timestamp: new Date(), department: 'Registration', notes: `Booking ${bookingIdCode} confirmed` },
      { stage: DiagnosticStage.APPOINTMENT_SCHEDULED, title: 'Appointment Scheduled', status: 'COMPLETED' as const, timestamp: new Date(), department: 'Scheduling', notes: `Scheduled for ${validated.appointmentDate} (${validated.timeSlot})` },
      { stage: DiagnosticStage.PATIENT_CHECK_IN, title: 'Patient Check-In / Technician Dispatched', status: 'PENDING' as const, department: 'Front Desk / Logistics' },
      { stage: DiagnosticStage.SAMPLE_COLLECTION, title: 'Sample Collection', status: 'PENDING' as const, department: 'Phlebotomy' },
      { stage: DiagnosticStage.SAMPLE_RECEIVED, title: 'Sample Received at Lab', status: 'PENDING' as const, department: 'Central Lab' },
      { stage: DiagnosticStage.LAB_PROCESSING, title: 'Lab Processing & Diagnostics', status: 'PENDING' as const, department: 'Pathology / Imaging' },
      { stage: DiagnosticStage.QUALITY_REVIEW, title: 'Quality Review & Verification', status: 'PENDING' as const, department: 'Quality Assurance' },
      { stage: DiagnosticStage.REPORT_GENERATION, title: 'Report Generation', status: 'PENDING' as const, department: 'Lab Systems' },
      { stage: DiagnosticStage.PHYSICIAN_REVIEW, title: 'Physician / Consultant Sign-off', status: 'PENDING' as const, department: 'Medical Board' },
      { stage: DiagnosticStage.RESULT_DELIVERED, title: 'Report Ready & Result Delivered', status: 'PENDING' as const, department: 'Digital Health Portal' }
    ];

    await DiagnosticJourney.create({
      bookingId: booking._id,
      currentStage: DiagnosticStage.APPOINTMENT_SCHEDULED,
      stages: initialStages
    });

    // Send Notification
    await NotificationAdapter.sendNotification({
      userId: req.user.id,
      title: 'Booking Created Successfully',
      message: `Your diagnostic test booking ${bookingIdCode} has been created for ${validated.appointmentDate}.`,
      type: 'BOOKING'
    });

    return res.status(201).json({
      success: true,
      booking
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let query: any = {};
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('testIds')
      .populate('centerId')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('testIds')
      .populate('packageId')
      .populate('centerId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, booking });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = BookingStatus.CANCELLED;
    if (booking.paymentStatus === PaymentStatus.PAID) {
      booking.paymentStatus = PaymentStatus.REFUNDED;
      
      await Refund.create({
        refundId: `RFND-${Date.now()}`,
        paymentId: booking._id,
        bookingId: booking._id,
        amount: booking.payableAmount,
        reason: req.body?.reason || 'Customer requested cancellation',
        status: 'PROCESSED'
      });
    }
    await booking.save();

    await Appointment.findOneAndUpdate({ bookingId: booking._id }, { status: AppointmentStatus.CANCELLED });

    await NotificationAdapter.sendNotification({
      userId: booking.patientId.toString(),
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingId} has been cancelled. Refund of ₹${booking.payableAmount} initiated.`,
      type: 'BOOKING'
    });

    return res.json({ success: true, message: 'Booking cancelled successfully', refundAmount: booking.payableAmount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const rescheduleBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.appointmentDate = newDate;
    booking.timeSlot = newTimeSlot;
    await booking.save();

    return res.json({ success: true, message: 'Appointment rescheduled successfully', booking });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
