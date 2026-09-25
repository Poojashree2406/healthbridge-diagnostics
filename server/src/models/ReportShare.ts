import mongoose, { Schema, Document } from 'mongoose';

export interface IReportShareDocument extends Document {
  reportId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  recipientEmail: string;
  shareToken: string;
  expiresAt: Date;
  accessCount: number;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportShareSchema = new Schema<IReportShareDocument>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientEmail: { type: String, required: true },
    shareToken: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    accessCount: { type: Number, default: 0 },
    revoked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ReportShare = mongoose.model<IReportShareDocument>('ReportShare', ReportShareSchema);
