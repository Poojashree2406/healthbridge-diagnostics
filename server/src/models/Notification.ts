import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@healthbridge/shared';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'JOURNEY' | 'REPORT' | 'SYSTEM';
  channel: 'IN_APP' | 'EMAIL' | 'SMS';
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['BOOKING', 'PAYMENT', 'JOURNEY', 'REPORT', 'SYSTEM'], required: true },
    channel: { type: String, enum: ['IN_APP', 'EMAIL', 'SMS'], default: 'IN_APP' },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
