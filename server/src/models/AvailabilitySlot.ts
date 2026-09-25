import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailabilitySlotDocument extends Document {
  centerId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  totalCapacity: number;
  bookedCount: number;
  homeCollectionCapacity: number;
  homeBookedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlotDocument>(
  {
    centerId: { type: Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalCapacity: { type: Number, default: 10 },
    bookedCount: { type: Number, default: 0 },
    homeCollectionCapacity: { type: Number, default: 5 },
    homeBookedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Compound index for slot search
AvailabilitySlotSchema.index({ centerId: 1, date: 1, startTime: 1 }, { unique: true });

export const AvailabilitySlot = mongoose.model<IAvailabilitySlotDocument>('AvailabilitySlot', AvailabilitySlotSchema);
