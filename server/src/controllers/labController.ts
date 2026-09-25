import { Request, Response } from 'express';
import { Lab } from '../models/Lab';
import { DiagnosticCenter } from '../models/DiagnosticCenter';
import { AvailabilitySlot } from '../models/AvailabilitySlot';
import { Sample } from '../models/Sample';
import { Booking } from '../models/Booking';
import { Report } from '../models/Report';
import { DiagnosticJourney } from '../models/DiagnosticJourney';
import { DiagnosticStage, SampleStatus, ReportStatus, ResultStatus } from '@healthbridge/shared';
import { AuthRequest } from '../middleware/auth';

export const getLabs = async (req: Request, res: Response) => {
  try {
    const labs = await Lab.find({ active: true });
    return res.json({ success: true, count: labs.length, labs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDiagnosticCenters = async (req: Request, res: Response) => {
  try {
    const { city, homeCollection } = req.query;
    const query: any = { active: true };

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (homeCollection === 'true') {
      query.homeCollectionAvailable = true;
    }

    const centers = await DiagnosticCenter.find(query).populate('labId', 'name code rating');
    return res.json({ success: true, count: centers.length, centers });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDiagnosticCenterById = async (req: Request, res: Response) => {
  try {
    const center = await DiagnosticCenter.findById(req.params.id).populate('labId');
    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    return res.json({ success: true, center });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    const { centerId, date } = req.query;

    if (!centerId || !date) {
      return res.status(400).json({ success: false, message: 'centerId and date are required parameters' });
    }

    const slots = await AvailabilitySlot.find({ centerId, date, active: true }).sort({ startTime: 1 });

    const formattedSlots = slots.map(s => {
      const isAvailable = s.bookedCount < s.totalCapacity;
      let status: 'Available' | 'Almost Full' | 'Full' = 'Available';
      if (s.bookedCount >= s.totalCapacity) status = 'Full';
      else if (s.bookedCount >= s.totalCapacity * 0.7) status = 'Almost Full';

      return {
        id: s._id,
        centerId: s.centerId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        totalCapacity: s.totalCapacity,
        bookedCount: s.bookedCount,
        homeCollectionCapacity: s.homeCollectionCapacity,
        homeBookedCount: s.homeBookedCount,
        isAvailable,
        status
      };
    });

    return res.json({ success: true, slots: formattedSlots });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- LAB TECHNICIAN SAMPLE & BARCODE APIS ---

export const getLabSamplesQueue = async (req: Request, res: Response) => {
  try {
    const { barcode, status, search } = req.query;

    let query: any = {};
    if (barcode) {
      query.barcode = { $regex: barcode, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const samples = await Sample.find(query)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'testIds', select: 'name code sampleType turnaroundHours price' },
          { path: 'patientId', select: 'name email phone' },
          { path: 'centerId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    // Filter by patient search if provided
    let filtered = samples;
    if (search) {
      const searchStr = (search as string).toLowerCase();
      filtered = samples.filter((s: any) => {
        const pName = s.bookingId?.patientDetails?.name || s.bookingId?.patientId?.name || '';
        const bCode = s.barcode || '';
        const bId = s.bookingId?.bookingId || '';
        return pName.toLowerCase().includes(searchStr) || bCode.toLowerCase().includes(searchStr) || bId.toLowerCase().includes(searchStr);
      });
    }

    return res.json({ success: true, count: filtered.length, samples: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSampleBarcodeStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { sampleId } = req.params;
    const { status, notes, barcode } = req.body;

    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample barcode record not found' });
    }

    if (status) sample.status = status;
    if (barcode) sample.barcode = barcode;
    if (notes) sample.notes = notes;
    if (req.user) sample.collectedBy = req.user.id as any;
    if (status === SampleStatus.COLLECTED && !sample.collectedAt) {
      sample.collectedAt = new Date();
    }

    await sample.save();

    // Map sample status to diagnostic journey stage automatically
    let targetStage: DiagnosticStage | null = null;
    if (status === SampleStatus.COLLECTED) targetStage = DiagnosticStage.SAMPLE_COLLECTION;
    else if (status === SampleStatus.RECEIVED_AT_LAB) targetStage = DiagnosticStage.SAMPLE_RECEIVED;
    else if (status === SampleStatus.PROCESSING) targetStage = DiagnosticStage.LAB_PROCESSING;

    if (targetStage) {
      const journey = await DiagnosticJourney.findOne({ bookingId: sample.bookingId });
      if (journey) {
        journey.currentStage = targetStage;
        journey.stages = journey.stages.map(s => {
          if (s.stage === targetStage) {
            return { ...s, status: 'COMPLETED', timestamp: new Date(), notes: notes || `Updated sample barcode ${sample.barcode}` };
          }
          return s;
        });
        await journey.save();
      }
    }

    return res.json({ success: true, message: `Sample barcode ${sample.barcode} status updated to ${sample.status}`, sample });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const uploadPreliminaryLabResults = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, parameters, summaryNotes } = req.body;

    const booking = await Booking.findById(bookingId).populate('testIds');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const firstTest = (booking.testIds as any[])[0];
    const reportIdCode = `HB-REP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    let report = await Report.findOne({ bookingId: booking._id });
    if (report) {
      report.parameters = parameters;
      report.summaryNotes = summaryNotes || report.summaryNotes;
      report.status = ReportStatus.UNDER_REVIEW;
      await report.save();
    } else {
      report = await Report.create({
        reportId: reportIdCode,
        bookingId: booking._id,
        patientId: booking.patientId,
        testId: firstTest?._id || booking.testIds[0],
        collectionDate: new Date(),
        reportDate: new Date(),
        parameters: parameters || [
          { parameterName: 'Hemoglobin', resultValue: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: ResultStatus.NORMAL },
          { parameterName: 'Fasting Blood Sugar', resultValue: '95', unit: 'mg/dL', referenceRange: '70 - 99', status: ResultStatus.NORMAL }
        ],
        status: ReportStatus.UNDER_REVIEW,
        summaryNotes: summaryNotes || 'Preliminary pathology diagnostics completed by lab technician.'
      });
    }

    // Advance journey stage to Quality Review / Physician Review
    const journey = await DiagnosticJourney.findOne({ bookingId: booking._id });
    if (journey) {
      journey.currentStage = DiagnosticStage.QUALITY_REVIEW;
      journey.stages = journey.stages.map(s => {
        if (s.stage === DiagnosticStage.LAB_PROCESSING || s.stage === DiagnosticStage.QUALITY_REVIEW) {
          return { ...s, status: 'COMPLETED', timestamp: new Date(), notes: 'Preliminary lab parameters uploaded' };
        }
        return s;
      });
      await journey.save();
    }

    return res.status(201).json({ success: true, message: 'Preliminary lab results uploaded successfully', report });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
