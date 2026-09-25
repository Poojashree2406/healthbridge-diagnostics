import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Stethoscope, CheckCircle2, FileText, User, RefreshCw, Eye, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [summaryNotes, setSummaryNotes] = useState('Reviewed pathology parameters. Clinical correlation advised.');
  const [approving, setApproving] = useState(false);

  const fetchDoctorData = () => {
    setLoading(true);
    api.get('/doctor/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleApproveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setApproving(true);

    // Support both Mongoose ObjectId (_id) and plain id
    const reportMongoId = selectedReport._id || selectedReport.id;

    try {
      const res = await api.post(`/doctor/reports/${reportMongoId}/approve`, { summaryNotes });
      alert('✅ Report approved, digitally signed, and published to patient portal!');
      setSelectedReport(null);
      fetchDoctorData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Approval failed';
      alert(`❌ Approval failed: ${msg}`);
    } finally {
      setApproving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Doctor Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>Physician & Consultant Portal</span>
            </div>
            <h1 className="text-3xl font-black">Medical Verification & Sign-Off</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">Review pathology results, add clinical consultation notes, and sign-off medical reports.</p>
          </div>

          <button onClick={fetchDoctorData} className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 backdrop-blur-md">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Portal</span>
          </button>
        </div>

        {/* Doctor KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block">Total Reports Reviewed</span>
            <span className="text-2xl font-black text-slate-900">{data?.metrics?.totalReportsReviewed || 15}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block">Pending Review Sign-offs</span>
            <span className="text-2xl font-black text-amber-600">{data?.metrics?.pendingReviewReports || 2}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block">Assigned Patients</span>
            <span className="text-2xl font-black text-teal-600">{data?.metrics?.totalPatientsAssigned || 10}</span>
          </div>
        </div>

        {/* Recent Reports to Sign Off */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Diagnostic Reports Requiring Doctor Sign-Off</h3>
            <Link to="/doctor/patients" className="text-xs font-bold text-teal-600 hover:underline">
              View Patients Directory →
            </Link>
          </div>

          {loading ? (
            <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(data?.recentReports || []).map((rep: any) => (
                <div key={rep._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">{rep.reportId}</span>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {rep.status}
                      </span>
                    </div>
                    <span className="text-slate-600 mt-1 block">Patient: {rep.patientId?.name || 'Patient'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/reports/${rep._id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Parameters</span>
                    </Link>

                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Sign-Off</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Approval Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Physician Verification Sign-Off</h3>
                  <p className="text-xs text-slate-500">Report ID: {selectedReport.reportId}</p>
                </div>
                <button onClick={() => setSelectedReport(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleApproveReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultant Impression & Summary Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px]">
                  <p className="font-bold">Digital Signature Verification:</p>
                  <p>Dr. Ananya Roy, MD (Pathology) • MCI License MCI-88912</p>
                </div>

                <button
                  type="submit"
                  disabled={approving}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                >
                  {approving ? 'Signing & Publishing...' : 'Approve, Sign-Off & Deliver to Patient'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
