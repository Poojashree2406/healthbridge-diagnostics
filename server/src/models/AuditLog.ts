import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@healthbridge/shared';

export interface IAuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail?: string;
  role: UserRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: String,
    role: { type: String, enum: Object.values(UserRole), required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: String,
    ipAddress: String,
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    details: String,
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
