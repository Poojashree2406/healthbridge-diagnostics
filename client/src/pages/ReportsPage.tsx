import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  FileText,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/reports')
      .then(res => setReports(res.data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter(r =>
    (r.testId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.reportId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diagnostic Reports</h1>
            <p className="text-slate-500 text-sm mt-1">Authenticated HIPAA & DPDP protected medical records</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search report by test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Reports Found</h3>
            <p className="text-xs text-slate-500">You don't have any published diagnostic reports matching your search.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Report ID</th>
                    <th className="px-6 py-4">Test Name</th>
                    <th className="px-6 py-4">Collection Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{report.reportId}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                        {report.testId?.name || 'Diagnostic Assay'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(report.collectionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/reports/${report._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-bold hover:bg-teal-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
