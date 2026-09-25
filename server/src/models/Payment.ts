import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '@healthbridge/shared';

export interface IPaymentDocument extends Document {
  paymentId: string; // PAY-HB-XXXXXX
  bookingId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET' | 'INSURANCE';
  gateway: 'MOCK_RAZORPAY' | 'STRIPE' | 'PAYPAL';
  transactionId: string;
  status: PaymentStatus;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, required: true },
    gateway: { type: String, default: 'MOCK_RAZORPAY' },
    transactionId: { type: String, required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PAID, index: true },
    invoiceNumber: { type: String, required: true }
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
