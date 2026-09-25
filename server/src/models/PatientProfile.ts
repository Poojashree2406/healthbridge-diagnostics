import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
  insuranceProvider?: string;
  policyNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    bloodGroup: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },
    medicalHistory: [String],
    insuranceProvider: String,
    policyNumber: String
  },
  { timestamps: true }
);

export const PatientProfile = mongoose.model<IPatientProfileDocument>('PatientProfile', PatientProfileSchema);
