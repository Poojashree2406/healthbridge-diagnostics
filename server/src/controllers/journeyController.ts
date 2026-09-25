import { Request, Response } from 'express';
import { DiagnosticJourney } from '../models/DiagnosticJourney';
import { Booking } from '../models/Booking';
import { updateJourneyStageSchema, DiagnosticStage, BookingStatus } from '@healthbridge/shared';
import { NotificationAdapter } from '../integrations/notificationAdapter';

export const getJourneyByBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    let journey = await DiagnosticJourney.findOne({ bookingId });
    if (!journey) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      
      journey = await DiagnosticJourney.findOne({ bookingId: booking._id });
    }

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey tracker not found for this booking' });
    }

    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateJourneyStage = async (req: Request, res: Response) => {
  try {
    const validated = updateJourneyStageSchema.parse(req.body);
    const journey = await DiagnosticJourney.findOne({ bookingId: validated.bookingId });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Diagnostic journey not found' });
    }

    journey.currentStage = validated.stage;
    let stageFound = false;

    journey.stages = journey.stages.map(stg => {
      if (stg.stage === validated.stage) {
        stageFound = true;
        return {
          ...stg,
          status: 'COMPLETED' as const,
          timestamp: new Date(),
          notes: validated.notes || stg.notes
        };
      }
      return stg;
    });

    if (!stageFound) {
      journey.stages.push({
        stage: validated.stage,
        title: validated.stage.replace(/_/g, ' '),
        status: 'COMPLETED',
        timestamp: new Date(),
        department: 'Lab Operations',
        notes: validated.notes
      });
    }

    await journey.save();

    // If journey reached final stage, update booking status
    if (validated.stage === DiagnosticStage.RESULT_DELIVERED) {
      await Booking.findByIdAndUpdate(validated.bookingId, { bookingStatus: BookingStatus.COMPLETED });
    }

    // Send notification
    const booking = await Booking.findById(validated.bookingId);
    if (booking) {
      await NotificationAdapter.sendNotification({
        userId: booking.patientId.toString(),
        title: `Journey Stage Updated: ${validated.stage.replace(/_/g, ' ')}`,
        message: `Your diagnostic journey for booking ${booking.bookingId} is now at stage: ${validated.stage.replace(/_/g, ' ')}.`,
        type: 'JOURNEY'
      });
    }

    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
