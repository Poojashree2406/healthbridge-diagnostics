import mongoose, { Schema, Document } from 'mongoose';

export interface ITestPackageDocument extends Document {
  code: string;
  name: string;
  description: string;
  testIds: mongoose.Types.ObjectId[];
  price: number;
  discountPercent: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestPackageSchema = new Schema<ITestPackageDocument>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    testIds: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 20 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const TestPackage = mongoose.model<ITestPackageDocument>('TestPackage', TestPackageSchema);
