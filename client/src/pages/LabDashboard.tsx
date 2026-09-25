import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SampleStatus, ResultStatus } from '@healthbridge/shared';
import {
  FlaskConical,
  ClipboardList,
  CheckCircle2,
  QrCode,
  RefreshCw,
  Search,
  Plus,
  X,
  FileCheck,
  Tag
} from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedBookingForResults, setSelectedBookingForResults] = useState<any>(null);
  const [testParameters, setTestParameters] = useState<any[]>([
    { parameterName: 'Hemoglobin', resultValue: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: ResultStatus.NORMAL },
    { parameterName: 'Fasting Blood Sugar', resultValue: '98', unit: 'mg/dL', referenceRange: '70 - 99', status: ResultStatus.NORMAL }
  ]);
  const [summaryNotes, setSummaryNotes] = useState('Automated hematology analyzer completed with normal morphology.');
  const [uploading, setUploading] = useState(false);

  const fetchSamples = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);

    api.get(`/lab/samples?${params.toString()}`)
      .then(res => setSamples(res.data.samples || []))
      .catch(() => setSamples([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSamples();
  }, [searchTerm, statusFilter]);

  const handleUpdateSampleStatus = async (sampleId: string, newStatus: string) => {
    setUpdatingId(sampleId);
    try {
      await api.put(`/lab/samples/${sampleId}`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by Lab Tech`
      });
      fetchSamples();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update sample status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddParameterRow = () => {
    setTestParameters([
      ...testParameters,
      { parameterName: '', resultValue: '', unit: 'mg/dL', referenceRange: 'Normal', status: ResultStatus.NORMAL }
    ]);
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    const updated = [...testParameters];
    updated[index][field] = value;
    setTestParameters(updated);
  };

  const handleUploadResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForResults) return;
    setUploading(true);

    try {
      await api.post('/lab/results', {
        bookingId: selectedBookingForResults.bookingId._id || selectedBookingForResults.bookingId,
        parameters: testParameters,
        summaryNotes
      });
      alert('Preliminary lab diagnostic parameters uploaded to report!');
      setShowResultModal(false);
      fetchSamples();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Result upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Lab Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">
              <FlaskConical className="w-4 h-4" />
              <span>Lab Technician Workspace</span>
            </div>
            <h1 className="text-3xl font-black">Sample Barcode & Diagnostics Queue</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">Scan sample barcodes, track sample lifecycle status, and input preliminary test results.</p>
          </div>

          <button onClick={fetchSamples} className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 backdrop-blur-md">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search sample barcode (SMP-XXXX), patient name, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">All Sample Statuses</option>
              <option value={SampleStatus.PENDING}>Pending Collection</option>
              <option value={SampleStatus.COLLECTED}>Collected</option>
              <option value={SampleStatus.RECEIVED_AT_LAB}>Received at Lab</option>
              <option value={SampleStatus.PROCESSING}>Processing</option>
            </select>
          </div>
        </div>

        {/* Sample Barcode Queue List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Active Sample Queue ({samples.length})</h3>
            <span className="text-xs text-slate-400 font-medium">Barcode Format: SMP-YYYY-XXXX</span>
          </div>

          {loading ? (
            <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
          ) : samples.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-semibold">
              No samples match the selected barcode or status criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Sample Barcode</th>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Patient Details</th>
                    <th className="px-4 py-3">Sample Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions & Results</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {samples.map((s) => {
                    const booking = s.bookingId || {};
                    const patient = booking.patientDetails || booking.patientId || {};
                    const testNames = (booking.testIds || []).map((t: any) => t.name).join(', ');

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Barcode Tag */}
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 text-teal-400 font-mono font-bold text-xs shadow-sm">
                            <Tag className="w-3 h-3 text-teal-400" />
                            <span>{s.barcode}</span>
                          </div>
                        </td>

                        {/* Booking ID */}
                        <td className="px-4 py-4 font-mono font-bold text-slate-800">
                          {booking.bookingId || 'HB-2026-000123'}
                        </td>

                        {/* Patient */}
                        <td className="px-4 py-4">
                          <span className="font-bold text-slate-900 block">{patient.name || 'Rajesh Sharma'}</span>
                          <span className="text-[11px] text-slate-500">{testNames || 'Blood Diagnostics'}</span>
                        </td>

                        {/* Sample Type */}
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {s.sampleType || 'Whole Blood (EDTA)'}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            s.status === SampleStatus.COLLECTED ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            s.status === SampleStatus.RECEIVED_AT_LAB ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            s.status === SampleStatus.PROCESSING ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-4 text-right space-x-2">
                          <select
                            value={s.status}
                            disabled={updatingId === s._id}
                            onChange={(e) => handleUpdateSampleStatus(s._id, e.target.value)}
                            className="p-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-800"
                          >
                            <option value={SampleStatus.PENDING}>Pending</option>
                            <option value={SampleStatus.COLLECTED}>Collected</option>
                            <option value={SampleStatus.RECEIVED_AT_LAB}>Received at Lab</option>
                            <option value={SampleStatus.PROCESSING}>Processing</option>
                          </select>

                          <button
                            onClick={() => {
                              setSelectedBookingForResults(s);
                              setShowResultModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center space-x-1 shadow-sm"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Input Results</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Input Preliminary Lab Test Results Modal */}
        {showResultModal && selectedBookingForResults && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Upload Preliminary Lab Results</h3>
                  <p className="text-xs text-slate-500">Barcode: {selectedBookingForResults.barcode} • Patient: {selectedBookingForResults.bookingId?.patientDetails?.name || 'Rajesh Sharma'}</p>
                </div>
                <button onClick={() => setShowResultModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleUploadResults} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Diagnostic Parameters</span>
                    <button
                      type="button"
                      onClick={handleAddParameterRow}
                      className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Parameter</span>
                    </button>
                  </div>

                  {testParameters.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 font-semibold block">Parameter</label>
                        <input
                          type="text"
                          required
                          value={p.parameterName}
                          onChange={(e) => handleParameterChange(idx, 'parameterName', e.target.value)}
                          placeholder="e.g. Hemoglobin"
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Observed Value</label>
                        <input
                          type="text"
                          required
                          value={p.resultValue}
                          onChange={(e) => handleParameterChange(idx, 'resultValue', e.target.value)}
                          placeholder="14.5"
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Unit</label>
                        <input
                          type="text"
                          required
                          value={p.unit}
                          onChange={(e) => handleParameterChange(idx, 'unit', e.target.value)}
                          placeholder="g/dL"
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Status</label>
                        <select
                          value={p.status}
                          onChange={(e) => handleParameterChange(idx, 'status', e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold"
                        >
                          <option value={ResultStatus.NORMAL}>NORMAL</option>
                          <option value={ResultStatus.HIGH}>HIGH</option>
                          <option value={ResultStatus.LOW}>LOW</option>
                          <option value={ResultStatus.CRITICAL}>CRITICAL</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Technician Preliminary Notes</label>
                  <textarea
                    rows={2}
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                >
                  {uploading ? 'Uploading Results...' : 'Upload Parameters to Report for Doctor Review'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
