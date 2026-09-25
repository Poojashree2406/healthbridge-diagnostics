import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestCategorySchema = new Schema<ITestCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    iconName: { type: String, default: 'Activity' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const TestCategory = mongoose.model<ITestCategoryDocument>('TestCategory', TestCategorySchema);
