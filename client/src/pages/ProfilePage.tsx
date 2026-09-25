import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { User, Shield, Check, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [consent, setConsent] = useState<any>({
    dataProcessingConsent: true,
    reportSharingConsent: true,
    communicationConsent: true,
    marketingConsent: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then(res => {
        setProfile(res.data.profile);
        if (res.data.consent) setConsent(res.data.consent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveConsent = async () => {
    setSaving(true);
    try {
      await api.put('/patients/consent', consent);
      setSavedMsg('Privacy & consent preferences updated successfully.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      alert('Failed to save consent settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Profile & Consent Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage personal demographic records and data privacy controls</p>
        </div>

        {savedMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Demographic Info */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Official medical record demographics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
              <input type="text" readOnly value={user?.name || ''} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold" />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
              <input type="text" readOnly value={user?.email || ''} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold" />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Phone Number</label>
              <input type="text" readOnly value={profile?.phone || '9876543210'} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold" />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Insurance Provider</label>
              <input type="text" readOnly value={profile?.insuranceProvider || 'Star Health Insurance'} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold" />
            </div>
          </div>
        </div>

        {/* Indian DPDP / HIPAA Consent Management */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Privacy & Consent Controls (DPDP / HIPAA)</h3>
              <p className="text-xs text-slate-500">Manage data minimization, sharing, and communication consent</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.dataProcessingConsent}
                onChange={(e) => setConsent({ ...consent, dataProcessingConsent: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-slate-900 text-sm block">Data Processing Consent</span>
                <span className="text-slate-500">Allow certified laboratories to process biological samples and run pathology assays under strict technical controls.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.reportSharingConsent}
                onChange={(e) => setConsent({ ...consent, reportSharingConsent: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-slate-900 text-sm block">Report Sharing with Referring Physicians</span>
                <span className="text-slate-500">Allow authorized consulting doctors to access verified diagnostic reports and add medical notes.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.communicationConsent}
                onChange={(e) => setConsent({ ...consent, communicationConsent: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-slate-900 text-sm block">Automated Transactional Notifications</span>
                <span className="text-slate-500">Receive SMS, Email, and In-App notifications regarding booking confirmations, phlebotomist arrival, and report readiness.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveConsent}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 text-white font-extrabold text-xs shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Preferences...' : 'Save Privacy Controls'}</span>
            </button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
