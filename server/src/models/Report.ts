import mongoose, { Schema, Document } from 'mongoose';
import { ReportStatus, ResultStatus } from '@healthbridge/shared';

export interface IReportDocument extends Document {
  reportId: string; // HB-REP-XXXXXX
  bookingId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  collectionDate: Date;
  reportDate: Date;
  parameters: Array<{
    parameterName: string;
    resultValue: string;
    unit: string;
    referenceRange: string;
    status: ResultStatus;
  }>;
  status: ReportStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  pdfFileKey?: string;
  summaryNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    collectionDate: { type: Date, required: true },
    reportDate: { type: Date, default: Date.now, index: true },
    parameters: [
      {
        parameterName: { type: String, required: true },
        resultValue: { type: String, required: true },
        unit: { type: String, required: true },
        referenceRange: { type: String, required: true },
        status: { type: String, enum: Object.values(ResultStatus), required: true }
      }
    ],
    status: { type: String, enum: Object.values(ReportStatus), default: ReportStatus.DRAFT, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    pdfFileKey: String,
    summaryNotes: String
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReportDocument>('Report', ReportSchema);
