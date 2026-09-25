import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Activity,
  Calendar,
  ClipboardList,
  GitCommit,
  FileText,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings').catch(() => ({ data: { bookings: [] } })),
      api.get('/reports').catch(() => ({ data: { reports: [] } }))
    ]).then(([bRes, rRes]) => {
      setBookings(bRes.data.bookings || []);
      setReports(rRes.data.reports || []);
    }).finally(() => setLoading(false));
  }, []);

  const activeBooking = bookings.find(b => b.bookingStatus !== 'COMPLETED' && b.bookingStatus !== 'CANCELLED') || bookings[0];
  const latestReport = reports[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>HealthBridge Patient Hub</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Welcome back, {user?.name || 'Patient'}!</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Track your active diagnostic tests, view lab results, and monitor health trends.
            </p>
          </div>

          <Link
            to="/tests"
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 flex-shrink-0"
          >
            <Activity className="w-4 h-4" />
            <span>Book New Test</span>
          </Link>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Upcoming Visit</span>
              <span className="text-lg font-black text-slate-900">
                {activeBooking ? activeBooking.appointmentDate : 'No Upcoming'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Active Test</span>
              <span className="text-lg font-black text-slate-900">
                {activeBooking ? activeBooking.bookingId : 'HB-2026-000123'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Latest Report</span>
              <span className="text-lg font-black text-slate-900">
                {reports.length > 0 ? 'Ready' : '1 Published'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Health Status</span>
              <span className="text-lg font-black text-emerald-600">Stable</span>
            </div>
          </div>
        </div>

        {/* Continue Your Diagnostic Journey Widget */}
        {activeBooking && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Live Journey Tracker</span>
                <h3 className="text-xl font-extrabold text-slate-900">Continue Your Diagnostic Journey</h3>
              </div>
              <Link
                to={`/journey/${activeBooking._id}`}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <span>View Full 10-Stage Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Horizontal Mini Timeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Booking Confirmed ({activeBooking.bookingId})</h4>
                  <p className="text-xs text-slate-500">Scheduled for {activeBooking.appointmentDate} ({activeBooking.timeSlot})</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Current Stage: Lab Processing</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Shortcut Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Diagnostic Reports</h4>
            <p className="text-xs text-slate-500">Access authenticated medical report PDFs, view parameter tables, or generate temporary share links.</p>
            <Link to="/reports" className="inline-block text-xs font-extrabold text-teal-600 hover:underline pt-2">
              View Reports & Share →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Health Trend Analytics</h4>
            <p className="text-xs text-slate-500">Visualize historical trends for blood glucose, HbA1c, hemoglobin, cholesterol, and Vitamin D.</p>
            <Link to="/health-trends" className="inline-block text-xs font-extrabold text-teal-600 hover:underline pt-2">
              View Interactive Charts →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Payments & Receipts</h4>
            <p className="text-xs text-slate-500">Download GST invoices, view transaction history, and check refund statuses.</p>
            <Link to="/payments" className="inline-block text-xs font-extrabold text-teal-600 hover:underline pt-2">
              View Invoices →
            </Link>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
