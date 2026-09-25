import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, RefreshCw, Users, FileText, CreditCard,
  ClipboardList, FlaskConical, Star, BarChart3, XCircle,
  CheckCircle2, AlertCircle, ChevronDown, Search, Trash2,
  GitCommit, Eye
} from 'lucide-react';

type Tab = 'METRICS' | 'BOOKINGS' | 'REPORTS' | 'PAYMENTS' | 'SAMPLES' | 'USERS' | 'FEEDBACK' | 'AUDIT';

const TAB_CONFIG: { id: Tab; label: string; icon: any }[] = [
  { id: 'METRICS',  label: 'Analytics',  icon: BarChart3 },
  { id: 'BOOKINGS', label: 'Bookings',   icon: ClipboardList },
  { id: 'REPORTS',  label: 'Reports',    icon: FileText },
  { id: 'PAYMENTS', label: 'Payments',   icon: CreditCard },
  { id: 'SAMPLES',  label: 'Samples',    icon: FlaskConical },
  { id: 'USERS',    label: 'Users',      icon: Users },
  { id: 'FEEDBACK', label: 'Feedback',   icon: Star },
  { id: 'AUDIT',    label: 'Audit Logs', icon: ShieldCheck },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color =
    ['PAID', 'PUBLISHED', 'COMPLETED', 'SUCCESS', 'COLLECTED'].includes(status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'UNDER_REVIEW', 'PROCESSING'].includes(status) ? 'bg-amber-50 text-amber-700 border-amber-200' :
    ['CANCELLED', 'FAILED', 'REJECTED'].includes(status) ? 'bg-rose-50 text-rose-700 border-rose-200' :
    'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${color}`}>
      {status}
    </span>
  );
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('METRICS');
  const [loading, setLoading] = useState(false);

  // Data state per tab
  const [metrics, setMetrics] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [auditAction, setAuditAction] = useState('');

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'METRICS') {
        const res = await api.get('/admin/dashboard');
        setMetrics(res.data.metrics);
        setRecentBookings(res.data.recentBookings || []);
      } else if (tab === 'BOOKINGS') {
        const params = new URLSearchParams();
        if (bookingSearch) params.append('search', bookingSearch);
        if (bookingStatus) params.append('status', bookingStatus);
        const res = await api.get(`/admin/bookings?${params}`);
        setBookings(res.data.bookings || []);
      } else if (tab === 'REPORTS') {
        const res = await api.get('/admin/reports');
        setReports(res.data.reports || []);
      } else if (tab === 'PAYMENTS') {
        const res = await api.get('/admin/payments');
        setPayments(res.data.payments || []);
      } else if (tab === 'SAMPLES') {
        const res = await api.get('/admin/samples');
        setSamples(res.data.samples || []);
      } else if (tab === 'USERS') {
        const params = new URLSearchParams();
        if (userSearch) params.append('search', userSearch);
        if (userRole) params.append('role', userRole);
        const res = await api.get(`/admin/users?${params}`);
        setUsers(res.data.users || []);
      } else if (tab === 'FEEDBACK') {
        const res = await api.get('/admin/feedback');
        setFeedback(res.data.feedback || []);
      } else if (tab === 'AUDIT') {
        const params = new URLSearchParams();
        if (auditAction) params.append('action', auditAction);
        const res = await api.get(`/admin/audit-logs?${params}`);
        setAuditLogs(res.data.logs || []);
      }
    } catch {}
    setLoading(false);
  }, [bookingSearch, bookingStatus, userSearch, userRole, auditAction]);

  useEffect(() => { fetchTab(activeTab); }, [activeTab]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Force cancel this booking?')) return;
    try {
      await api.post(`/admin/bookings/${id}/cancel`, { reason: 'Admin forced cancellation' });
      fetchTab('BOOKINGS');
    } catch { alert('Cancel failed'); }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      fetchTab('USERS');
    } catch { alert('Role update failed'); }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchTab('USERS');
    } catch { alert('Status toggle failed'); }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchTab('USERS');
    } catch { alert('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>System Administrator — Full Access Control</span>
            </div>
            <h1 className="text-3xl font-black">HealthBridge Control Panel</h1>
            <p className="text-slate-300 text-sm mt-1">Complete visibility into bookings, reports, payments, samples, users & compliance logs.</p>
          </div>
          <button onClick={() => fetchTab(activeTab)} className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex flex-wrap gap-1 shadow-sm">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === id
                  ? 'bg-slate-900 text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {loading && <div className="h-48 bg-slate-200 animate-pulse rounded-3xl" />}

        {/* ── TAB: METRICS ─────────────────────────────────────── */}
        {!loading && activeTab === 'METRICS' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Patients', value: metrics.totalPatients, color: 'text-slate-900' },
                { label: 'Doctors', value: metrics.totalDoctors, color: 'text-teal-600' },
                { label: 'Lab Techs', value: metrics.totalLabTechs, color: 'text-blue-600' },
                { label: 'Active Bookings', value: metrics.activeBookings, color: 'text-amber-600' },
                { label: 'Completed Tests', value: metrics.completedBookings, color: 'text-emerald-600' },
                { label: 'Reports Generated', value: metrics.reportsGenerated, color: 'text-purple-600' },
                { label: 'Samples Processed', value: metrics.samplesProcessed, color: 'text-orange-600' },
                { label: 'Total Revenue', value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`, color: 'text-emerald-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold block">{label}</span>
                  <span className={`text-2xl font-black ${color}`}>{value ?? '—'}</span>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900">Recent Bookings</h3>
                <button onClick={() => setActiveTab('BOOKINGS')} className="text-xs font-bold text-teal-600 hover:underline">
                  View All →
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {recentBookings.map((b) => (
                  <div key={b._id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-extrabold text-slate-900">{b.bookingId}</span>
                      <span className="text-slate-500 ml-2">{b.patientDetails?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">₹{b.payableAmount}</span>
                      <StatusBadge status={b.bookingStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: BOOKINGS ────────────────────────────────────── */}
        {!loading && activeTab === 'BOOKINGS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Search booking ID or patient..." value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTab('BOOKINGS')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <select value={bookingStatus} onChange={(e) => { setBookingStatus(e.target.value); fetchTab('BOOKINGS'); }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold">
                <option value="">All Statuses</option>
                {['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => fetchTab('BOOKINGS')} className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Search</button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Tests</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-extrabold text-slate-900">{b.bookingId}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{b.patientDetails?.name || b.patientId?.name}</span>
                        <span className="text-slate-400">{b.patientDetails?.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{(b.testIds || []).map((t: any) => t.name).join(', ')}</td>
                      <td className="px-4 py-3 text-slate-600">{b.appointmentDate}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{b.serviceMode}</span></td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">₹{b.payableAmount}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.bookingStatus} /></td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <Link to={`/journey/${b._id}`} className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 inline-flex items-center space-x-1">
                          <GitCommit className="w-3 h-3" /><span>Track</span>
                        </Link>
                        {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED' && (
                          <button onClick={() => handleCancelBooking(b._id)} className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 inline-flex items-center space-x-1">
                            <XCircle className="w-3 h-3" /><span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No bookings found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: REPORTS ─────────────────────────────────────── */}
        {!loading && activeTab === 'REPORTS' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Report ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Collection Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-extrabold text-slate-900">{r.reportId}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{r.patientId?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.testId?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.collectionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/reports/${r._id}`} className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 inline-flex items-center space-x-1">
                        <Eye className="w-3 h-3" /><span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No reports found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: PAYMENTS ────────────────────────────────────── */}
        {!loading && activeTab === 'PAYMENTS' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Gateway TXN</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.paymentId}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{p.patientId?.name || '—'}</td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{p.paymentMethod}</span></td>
                    <td className="px-4 py-3 font-mono text-slate-500">{p.transactionId || '—'}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">₹{p.amount}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{p.invoiceNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No payments found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: SAMPLES ─────────────────────────────────────── */}
        {!loading && activeTab === 'SAMPLES' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Sample Type</th>
                  <th className="px-4 py-3">Collected At</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samples.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-extrabold text-teal-700">{s.barcode}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{s.bookingId?.patientDetails?.name || s.bookingId?.patientId?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.sampleType}</td>
                    <td className="px-4 py-3 text-slate-500">{s.collectedAt ? new Date(s.collectedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
                {samples.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No samples found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: USERS ───────────────────────────────────────── */}
        {!loading && activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Search name or email..." value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTab('USERS')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none" />
              </div>
              <select value={userRole} onChange={(e) => { setUserRole(e.target.value); fetchTab('USERS'); }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold">
                <option value="">All Roles</option>
                {['PATIENT','PHYSICIAN','LAB_TECHNICIAN','RADIOLOGIST','ADMIN'].map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={() => fetchTab('USERS')} className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Search</button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          className="px-2 py-1 rounded-xl border border-slate-200 bg-white font-bold text-[10px] text-teal-700"
                        >
                          {['PATIENT','PHYSICIAN','LAB_TECHNICIAN','RADIOLOGIST','ADMIN'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button onClick={() => handleToggleStatus(u._id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 text-[10px]">
                          Toggle Active
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 inline-flex items-center space-x-1">
                          <Trash2 className="w-3 h-3" /><span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: FEEDBACK ────────────────────────────────────── */}
        {!loading && activeTab === 'FEEDBACK' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Center</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedback.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{f.patientId?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{f.centerId?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{f.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{f.category}</span></td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">{f.comments}</td>
                  </tr>
                ))}
                {feedback.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No feedback found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: AUDIT ───────────────────────────────────────── */}
        {!loading && activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex gap-3">
              <input type="text" placeholder="Filter by action (e.g. BOOKING_CREATE)..." value={auditAction}
                onChange={(e) => setAuditAction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTab('AUDIT')}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none" />
              <button onClick={() => fetchTab('AUDIT')} className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Filter</button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{log.userEmail || 'System'}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{log.role}</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-700">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">{log.resourceType}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No audit logs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
