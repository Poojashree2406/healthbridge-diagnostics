import mongoose, { Schema, Document } from 'mongoose';

export interface ITestDocument extends Document {
  code: string;
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  measures: string;
  whyPerformed: string;
  preparationInstructions: string;
  fastingRequired: boolean;
  sampleType: string;
  turnaroundHours: number;
  price: number;
  homeCollectionAvailable: boolean;
  rating: number;
  active: boolean;
  faqs?: Array<{ question: string; answer: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITestDocument>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'TestCategory', required: true, index: true },
    description: { type: String, required: true },
    measures: { type: String, required: true },
    whyPerformed: { type: String, required: true },
    preparationInstructions: { type: String, required: true },
    fastingRequired: { type: Boolean, default: false },
    sampleType: { type: String, required: true },
    turnaroundHours: { type: Number, required: true, default: 24 },
    price: { type: Number, required: true, index: true },
    homeCollectionAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.9 },
    active: { type: Boolean, default: true },
    faqs: [
      {
        question: String,
        answer: String
      }
    ]
  },
  { timestamps: true }
);

TestSchema.index({ name: 'text', description: 'text', code: 'text' });

export const Test = mongoose.model<ITestDocument>('Test', TestSchema);
