import mongoose, { Schema, Document } from 'mongoose';
import { SampleStatus } from '@healthbridge/shared';

export interface ISampleDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  barcode: string;
  sampleType: string;
  collectedBy?: mongoose.Types.ObjectId;
  collectedAt?: Date;
  status: SampleStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SampleSchema = new Schema<ISampleDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    barcode: { type: String, required: true, unique: true, index: true },
    sampleType: { type: String, required: true },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    collectedAt: { type: Date },
    status: { type: String, enum: Object.values(SampleStatus), default: SampleStatus.PENDING, index: true },
    notes: String
  },
  { timestamps: true }
);

export const Sample = mongoose.model<ISampleDocument>('Sample', SampleSchema);
