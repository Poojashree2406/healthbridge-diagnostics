import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticCenterDocument extends Document {
  labId: mongoose.Types.ObjectId;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  operatingHours: string;
  rating: number;
  homeCollectionAvailable: boolean;
  maxSlotsPerTime: number;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticCenterSchema = new Schema<IDiagnosticCenterDocument>(
  {
    labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true, index: true },
    name: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, index: true }
    },
    phone: { type: String, required: true },
    operatingHours: { type: String, default: '07:00 AM - 08:00 PM' },
    rating: { type: Number, default: 4.7 },
    homeCollectionAvailable: { type: Boolean, default: true },
    maxSlotsPerTime: { type: Number, default: 10 },
    geoCoordinates: {
      lat: Number,
      lng: Number
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const DiagnosticCenter = mongoose.model<IDiagnosticCenterDocument>('DiagnosticCenter', DiagnosticCenterSchema);
