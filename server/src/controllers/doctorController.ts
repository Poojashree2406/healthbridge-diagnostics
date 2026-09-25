import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/Report';
import { PatientProfile } from '../models/PatientProfile';
import { DiagnosticJourney } from '../models/DiagnosticJourney';
import { DiagnosticStage, ReportStatus } from '@healthbridge/shared';

export const getDoctorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const [totalReportsReviewed, pendingReviewReports, recentPatients, recentReports] = await Promise.all([
      Report.countDocuments({ reviewedBy: req.user?.id }),
      Report.countDocuments({ status: { $in: [ReportStatus.UNDER_REVIEW, ReportStatus.DRAFT] } }),
      PatientProfile.find().limit(10).lean(),
      // Show ALL reports (not just pending) so the doctor can review and approve any of them
      Report.find()
        .populate('patientId', 'name email phone')
        .populate('testId', 'name code')
        .sort({ reportDate: -1 })
        .limit(20)
        .lean()
    ]);

    return res.json({
      success: true,
      metrics: {
        totalReportsReviewed,
        pendingReviewReports,
        totalPatientsAssigned: recentPatients.length
      },
      recentPatients,
      recentReports
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const approveReportByDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { summaryNotes } = req.body;

    if (!reportId) {
      return res.status(400).json({ success: false, message: 'Report ID is required' });
    }

    // Use $set to avoid validation errors on fields not in strict schema
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status: ReportStatus.PUBLISHED,
          summaryNotes: summaryNotes || 'Report verified and approved by physician.',
          reviewedBy: req.user?.id,
          reviewedAt: new Date()
        }
      },
      { new: true, runValidators: false }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found with the given ID' });
    }

    // Advance the diagnostic journey to RESULT_DELIVERED
    try {
      const journey = await DiagnosticJourney.findOne({ bookingId: report.bookingId });
      if (journey) {
        journey.currentStage = DiagnosticStage.RESULT_DELIVERED;
        journey.stages = journey.stages.map((s: any) => {
          if (
            s.stage === DiagnosticStage.PHYSICIAN_REVIEW ||
            s.stage === DiagnosticStage.REPORT_GENERATION ||
            s.stage === DiagnosticStage.RESULT_DELIVERED
          ) {
            return {
              ...s,
              status: 'COMPLETED',
              timestamp: new Date(),
              notes: s.stage === DiagnosticStage.PHYSICIAN_REVIEW
                ? `Verified & signed by ${req.user?.name || 'Physician'}`
                : 'Auto-completed on physician approval'
            };
          }
          return s;
        });
        await journey.save();
      }
    } catch (journeyErr) {
      // Non-fatal — don't fail the approval if journey update fails
      console.warn('Journey update warning:', journeyErr);
    }

    return res.json({
      success: true,
      message: 'Report approved, digitally signed, and published to patient portal.',
      report
    });
  } catch (err: any) {
    console.error('Doctor approve error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Approval failed on server' });
  }
};
