import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceDocument extends Document {
  invoiceNumber: string; // INV-HB-2026-XXXXXX
  bookingId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  lineItems: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'PAID' | 'REFUNDED';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lineItems: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['PAID', 'REFUNDED'], default: 'PAID' }
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);
