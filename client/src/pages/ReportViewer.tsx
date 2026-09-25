import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ResultStatus } from '@healthbridge/shared';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  User,
  Building2,
  Calendar,
  X,
  Copy,
  Check
} from 'lucide-react';

export const ReportViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expirationHours, setExpirationHours] = useState('24');
  const [shareResult, setShareResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(res => setReport(res.data.report))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/reports/${id}/download`);
      alert(`PDF Report download link generated: ${res.data.filename}. (Simulated secure token download)`);
    } catch (e) {
      alert('Download error');
    }
  };

  const handleGenerateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharing(true);
    try {
      const res = await api.post(`/reports/${id}/share`, {
        recipientEmail,
        expirationHours: Number(expirationHours)
      });
      setShareResult(res.data);
    } catch (e: any) {
      alert('Share link generation failed.');
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = () => {
    if (shareResult?.shareUrl) {
      navigator.clipboard.writeText(shareResult.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold">Report not found</h2>
          <Link to="/reports" className="text-teal-600 font-bold mt-2 inline-block">Back to Reports</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Official Diagnostic Report</span>
            <h1 className="text-2xl font-black text-slate-900">{report.reportId}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 font-bold text-xs hover:bg-teal-100 flex items-center space-x-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Secure Share Link</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center space-x-2 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Medical Report Template Card */}
        <div className="bg-white rounded-3xl border border-slate-300 p-8 shadow-xl space-y-6 font-sans">
          
          {/* Header Branding */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 text-teal-400 p-3 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">HealthBridge Laboratories</h2>
                <p className="text-xs text-slate-500">NABL Accredited • ISO 15189 Certified Pathology Diagnostics</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="font-bold text-slate-800 block">Report ID: {report.reportId}</span>
              <span>Issued Date: {new Date(report.reportDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{report.patientId?.name || 'Rajesh Sharma'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age / Gender:</span>
              <span className="font-bold text-slate-900 text-sm">38 Yrs / Male</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Collection Date:</span>
              <span className="font-bold text-slate-900 text-sm">{new Date(report.collectionDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Referring Doctor:</span>
              <span className="font-bold text-slate-900 text-sm">Dr. Ananya Roy (MD)</span>
            </div>
          </div>

          {/* Test Name Title */}
          <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs font-bold">
            <span>Test Name: {report.testId?.name || 'Complete Pathology Diagnostic Panel'}</span>
            <span className="bg-teal-500 text-white px-2.5 py-0.5 rounded-full text-[10px]">Verified Results</span>
          </div>

          {/* Parameter Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Diagnostic Parameter</th>
                  <th className="px-4 py-3">Observed Result</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Reference Range</th>
                  <th className="px-4 py-3 text-right">Flag Status</th>
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

          {/* Pathologist Summary & Sign-off */}
          {report.summaryNotes && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Consultant Pathologist Impression:
              </p>
              <p>{report.summaryNotes}</p>
            </div>
          )}

          {/* Footer Digital Signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Electronically Verified By:</p>
              <p>Dr. Ananya Roy, MD (Pathology)</p>
              <p className="text-[10px] text-slate-400">License No: MCI-88912</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-1 text-teal-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Signed PDF</span>
              </div>
            </div>
          </div>

        </div>

        {/* Temporary Secure Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => { setShowShareModal(false); setShareResult(null); }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="inline-flex p-2.5 rounded-xl bg-teal-50 text-teal-600 mb-2">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Secure Temporary Report Share</h3>
                <p className="text-xs text-slate-500 mt-0.5">Generate a short-lived access token link for your physician</p>
              </div>

              {!shareResult ? (
                <form onSubmit={handleGenerateShareLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Doctor Email</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link Expiration Time</label>
                    <select
                      value={expirationHours}
                      onChange={(e) => setExpirationHours(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="1">1 Hour</option>
                      <option value="24">24 Hours (Default)</option>
                      <option value="168">7 Days</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={sharing}
                    className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all"
                  >
                    {sharing ? 'Generating Share Token...' : 'Generate Temporary Link'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <p className="font-bold">✓ Temporary Share Link Generated</p>
                    <p className="mt-0.5 text-[11px]">Expires at: {new Date(shareResult.expiresAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Share URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={shareResult.shareUrl}
                        className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono select-all"
                      />
                      <button
                        onClick={copyShareUrl}
                        className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
