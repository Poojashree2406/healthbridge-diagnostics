import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Feedback } from '../models/Feedback';
import { Booking } from '../models/Booking';
import { submitFeedbackSchema } from '@healthbridge/shared';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const validated = submitFeedbackSchema.parse(req.body);
    const booking = await Booking.findById(validated.bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check duplicate
    const existing = await Feedback.findOne({ bookingId: validated.bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this booking' });
    }

    const feedback = await Feedback.create({
      bookingId: booking._id,
      patientId: req.user.id,
      centerId: booking.centerId,
      rating: validated.rating,
      category: validated.category,
      comments: validated.comments
    });

    return res.status(201).json({ success: true, feedback });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find({ isModerated: true })
      .populate('patientId', 'name')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
