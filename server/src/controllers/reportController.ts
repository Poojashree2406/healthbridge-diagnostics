import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/Report';
import { ReportShare } from '../models/ReportShare';
import { NotificationAdapter } from '../integrations/notificationAdapter';
import crypto from 'crypto';

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let query: any = {};
    // Patients only see their own reports; doctors/labs/admins see all
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user.id;
    }

    const reports = await Report.find(query)
      .populate('testId', 'name code categoryId')
      .populate('bookingId', 'bookingId appointmentDate serviceMode')
      .populate('patientId', 'name email phone')
      .sort({ reportDate: -1 })
      .lean();

    return res.json({ success: true, count: reports.length, reports });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Try by MongoDB _id first; fall back to custom reportId string (e.g. HB-REP-2026-XXXXX)
    let report: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await Report.findById(id)
        .populate('testId')
        .populate('bookingId')
        .populate('patientId', 'name email phone');
    }

    if (!report) {
      report = await Report.findOne({ reportId: id })
        .populate('testId')
        .populate('bookingId')
        .populate('patientId', 'name email phone');
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Access control: patients can only view their own reports
    if (req.user && req.user.role === 'PATIENT') {
      const patientId = report.patientId?._id?.toString() || report.patientId?.toString();
      if (patientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this medical report' });
      }
    }

    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadReportPDF = async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findById(req.params.id).populate('testId').lean() as any;
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const downloadToken = crypto.randomBytes(16).toString('hex');

    return res.json({
      success: true,
      downloadUrl: `/api/v1/reports/${report._id}/stream?token=${downloadToken}`,
      expiresInSeconds: 300,
      filename: `HealthBridge-Report-${report.reportId}.pdf`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const shareReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { recipientEmail, expirationHours } = req.body;
    const report = await Report.findById(req.params.id).lean() as any;

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const shareToken = crypto.randomBytes(24).toString('hex');
    const hours = Number(expirationHours) || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await ReportShare.create({
      reportId: report._id,
      patientId: req.user.id,
      recipientEmail,
      shareToken,
      expiresAt,
      accessCount: 0
    });

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared-report/${shareToken}`;

    return res.status(201).json({
      success: true,
      shareToken,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      recipientEmail
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getSharedReportByToken = async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const share = await ReportShare.findOne({ shareToken, revoked: false }) as any;

    if (!share) {
      return res.status(404).json({ success: false, message: 'Invalid or revoked share link' });
    }

    if (new Date() > new Date(share.expiresAt)) {
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }

    share.accessCount = (share.accessCount || 0) + 1;
    await share.save();

    const report = await Report.findById(share.reportId)
      .populate('testId')
      .populate('patientId', 'name dob gender')
      .lean();

    return res.json({ success: true, report, expiresAt: share.expiresAt });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHealthTrends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const reports = await Report.find({ patientId: req.user.id }).sort({ reportDate: 1 }).lean() as any[];

    const trendPoints: any[] = [];

    reports.forEach(rep => {
      (rep.parameters || []).forEach((p: any) => {
        const numVal = parseFloat(String(p.resultValue).replace(/[^0-9.]/g, ''));
        if (!isNaN(numVal)) {
          trendPoints.push({
            date: new Date(rep.reportDate).toISOString().split('T')[0],
            parameterName: p.parameterName,
            value: numVal,
            unit: p.unit,
            referenceRange: p.referenceRange,
            status: p.status
          });
        }
      });
    });

    return res.json({ success: true, count: trendPoints.length, trendPoints });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
