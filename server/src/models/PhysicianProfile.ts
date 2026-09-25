import mongoose, { Schema, Document } from 'mongoose';

export interface IPhysicianProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhysicianProfileSchema = new Schema<IPhysicianProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    hospitalAffiliation: { type: String, default: 'HealthBridge Partner Network' },
    phone: { type: String, required: true }
  },
  { timestamps: true }
);

export const PhysicianProfile = mongoose.model<IPhysicianProfileDocument>('PhysicianProfile', PhysicianProfileSchema);
