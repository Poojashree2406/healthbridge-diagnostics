import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PatientProfile } from '../models/PatientProfile';
import { Consent } from '../models/Consent';

export const getMyPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let profile = await PatientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await PatientProfile.create({
        userId: req.user.id,
        name: req.user.name,
        phone: '9876543210',
        dob: '1992-05-15',
        gender: 'MALE',
        address: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' }
      });
    }

    const consent = await Consent.findOne({ patientId: req.user.id });

    return res.json({ success: true, profile, consent });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMyPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );

    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateConsentSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { dataProcessingConsent, reportSharingConsent, communicationConsent, marketingConsent } = req.body;

    const consent = await Consent.findOneAndUpdate(
      { patientId: req.user.id },
      {
        dataProcessingConsent,
        reportSharingConsent,
        communicationConsent,
        marketingConsent,
        $push: {
          history: {
            type: 'CONSENT_UPDATE',
            granted: dataProcessingConsent,
            timestamp: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    return res.json({ success: true, consent });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
