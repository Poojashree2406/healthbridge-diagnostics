import mongoose, { Schema, Document } from 'mongoose';

export interface ILabDocument extends Document {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  services: string[];
  rating: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LabSchema = new Schema<ILabDocument>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    services: [String],
    rating: { type: Number, default: 4.8 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Lab = mongoose.model<ILabDocument>('Lab', LabSchema);
