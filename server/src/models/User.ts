import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@healthbridge/shared';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  isVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT, index: true },
    name: { type: String, required: true },
    phone: { type: String, index: true },
    isVerified: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
