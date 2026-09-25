import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedbackDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  labId?: mongoose.Types.ObjectId;
  rating: number;
  category: string;
  comments: string;
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    centerId: { type: Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true, index: true },
    labId: { type: Schema.Types.ObjectId, ref: 'Lab' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, required: true },
    comments: { type: String, required: true },
    isModerated: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedbackDocument>('Feedback', FeedbackSchema);
