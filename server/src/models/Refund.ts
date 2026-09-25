import mongoose, { Schema, Document } from 'mongoose';

export interface IRefundDocument extends Document {
  refundId: string;
  paymentId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'PROCESSED' | 'PENDING' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefundDocument>(
  {
    refundId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PROCESSED', 'PENDING', 'REJECTED'], default: 'PROCESSED' }
  },
  { timestamps: true }
);

export const Refund = mongoose.model<IRefundDocument>('Refund', RefundSchema);
