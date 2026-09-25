import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ClipboardList, Calendar, MapPin, Clock, XCircle, RefreshCw, GitCommit } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this diagnostic booking? An instant refund will be processed.')) return;
    setCancellingId(id);
    try {
      const res = await api.post(`/bookings/${id}/cancel`, { reason: 'Customer requested cancellation from portal' });
      alert(`Booking cancelled. Refund of ₹${res.data.refundAmount} initiated.`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Diagnostic Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage test orders, view appointment details, cancel or reschedule</p>
          </div>
          <button onClick={fetchBookings} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Bookings Found</h3>
            <Link to="/tests" className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs">
              Browse Diagnostic Tests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-slate-900 text-base">{booking.bookingId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      booking.bookingStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      booking.bookingStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {booking.serviceMode}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">
                      Tests: {booking.testIds?.map((t: any) => t.name).join(', ') || 'Diagnostic Panel'}
                    </p>
                    <p className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.appointmentDate} ({booking.timeSlot})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-xl font-black text-slate-900 mr-2">₹{booking.payableAmount}</span>

                  <Link
                    to={`/journey/${booking._id}`}
                    className="px-4 py-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold hover:bg-teal-100 flex items-center space-x-1"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </Link>

                  {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
                    <button
                      disabled={cancellingId === booking._id}
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
