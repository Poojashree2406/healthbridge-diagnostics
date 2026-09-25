import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Activity, ShieldCheck, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { ResultStatus } from '@healthbridge/shared';

export const SharedReportPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [report, setReport] = useState<any>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reports/share-access/${shareToken}`)
      .then(res => {
        setReport(res.data.report);
        setExpiresAt(res.data.expiresAt);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Invalid, expired, or revoked report share link.');
      })
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Verifying secure report access token...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Temporary Access Banner */}
        <div className="bg-teal-950 text-teal-200 p-4 rounded-2xl flex items-center justify-between text-xs border border-teal-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Authorized Medical Report Share View</span>
          </div>
          <span className="font-semibold text-teal-300">
            Expires: {new Date(expiresAt).toLocaleString()}
          </span>
        </div>

        {/* Printable Medical Report Template */}
        <div className="bg-white rounded-3xl border border-slate-300 p-8 shadow-xl space-y-6 font-sans">
          
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 text-teal-400 p-3 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">HealthBridge Diagnostics</h2>
                <p className="text-xs text-slate-500">NABL Accredited • ISO 15189 Certified Pathology Diagnostics</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="font-bold text-slate-800 block">Report ID: {report.reportId}</span>
              <span>Date: {new Date(report.reportDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{report.patientId?.name || 'Patient'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gender:</span>
              <span className="font-bold text-slate-900 text-sm">{report.patientId?.gender || 'MALE'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Collection Date:</span>
              <span className="font-bold text-slate-900 text-sm">{new Date(report.collectionDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status:</span>
              <span className="font-bold text-emerald-600 text-sm">{report.status}</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs font-bold">
            <span>Test Name: {report.testId?.name || 'Pathology Panel'}</span>
            <span className="bg-teal-500 text-white px-2.5 py-0.5 rounded-full text-[10px]">Verified Results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Reference Range</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.parameters?.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.parameterName}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-sm">{p.resultValue}</td>
                    <td className="px-4 py-3 text-slate-500">{p.unit}</td>
                    <td className="px-4 py-3 text-slate-500">{p.referenceRange}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        p.status === ResultStatus.NORMAL ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.status === ResultStatus.HIGH ? 'bg-amber-50 text-amber-700 border border-amber-200 font-black' :
                        p.status === ResultStatus.CRITICAL ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse font-black' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.summaryNotes && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold text-amber-800">Consultant Impression:</p>
              <p>{report.summaryNotes}</p>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Electronically Verified By:</p>
              <p>Dr. Ananya Roy, MD (Pathology)</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-1 text-teal-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Digital Document</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
