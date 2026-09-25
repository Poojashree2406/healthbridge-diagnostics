import mongoose, { Schema, Document } from 'mongoose';
import { ServiceMode, BookingStatus, PaymentStatus } from '@healthbridge/shared';

export interface IBookingDocument extends Document {
  bookingId: string; // HB-2026-XXXXXX
  patientId: mongoose.Types.ObjectId;
  testIds: mongoose.Types.ObjectId[];
  packageId?: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  serviceMode: ServiceMode;
  collectionAddress?: string;
  appointmentDate: string;
  timeSlot: string;
  subtotalAmount: number;
  collectionFee: number;
  discountAmount: number;
  payableAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  patientDetails: {
    name: string;
    phone: string;
    email: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    testIds: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
    packageId: { type: Schema.Types.ObjectId, ref: 'TestPackage' },
    centerId: { type: Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true, index: true },
    serviceMode: { type: String, enum: Object.values(ServiceMode), required: true },
    collectionAddress: { type: String },
    appointmentDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    subtotalAmount: { type: Number, required: true },
    collectionFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    payableAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, index: true },
    bookingStatus: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.SCHEDULED, index: true },
    patientDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true }
    }
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBookingDocument>('Booking', BookingSchema);
