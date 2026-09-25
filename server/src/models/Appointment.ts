import mongoose, { Schema, Document } from 'mongoose';
import { AppointmentStatus } from '@healthbridge/shared';

export interface IAppointmentDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  dateTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    centerId: { type: Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true, index: true },
    dateTime: { type: Date, required: true, index: true },
    status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.SCHEDULED, index: true },
    notes: String
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
