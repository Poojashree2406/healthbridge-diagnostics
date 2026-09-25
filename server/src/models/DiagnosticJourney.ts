import mongoose, { Schema, Document } from 'mongoose';
import { DiagnosticStage } from '@healthbridge/shared';

export interface IDiagnosticJourneyDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  currentStage: DiagnosticStage;
  stages: Array<{
    stage: DiagnosticStage;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    timestamp?: Date;
    department: string;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticJourneySchema = new Schema<IDiagnosticJourneyDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    currentStage: { type: String, enum: Object.values(DiagnosticStage), default: DiagnosticStage.BOOKING_CONFIRMED },
    stages: [
      {
        stage: { type: String, enum: Object.values(DiagnosticStage), required: true },
        title: { type: String, required: true },
        status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
        timestamp: { type: Date },
        department: { type: String, required: true },
        notes: String
      }
    ]
  },
  { timestamps: true }
);

export const DiagnosticJourney = mongoose.model<IDiagnosticJourneyDocument>('DiagnosticJourney', DiagnosticJourneySchema);
