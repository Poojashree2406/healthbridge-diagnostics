import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  dataProcessingConsent: boolean;
  reportSharingConsent: boolean;
  communicationConsent: boolean;
  marketingConsent: boolean;
  history: Array<{
    type: string;
    granted: boolean;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsentDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    dataProcessingConsent: { type: Boolean, default: true },
    reportSharingConsent: { type: Boolean, default: true },
    communicationConsent: { type: Boolean, default: true },
    marketingConsent: { type: Boolean, default: false },
    history: [
      {
        type: String,
        granted: Boolean,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Consent = mongoose.model<IConsentDocument>('Consent', ConsentSchema);
