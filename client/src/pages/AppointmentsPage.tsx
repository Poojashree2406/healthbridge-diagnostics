import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Calendar, Clock, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppointmentsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = bookings.filter(b => b.bookingStatus !== 'CANCELLED');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scheduled Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">View phlebotomist sample collection slots & center visits</p>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Scheduled Appointments</h3>
            <Link to="/tests" className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs">
              Book a Diagnostic Appointment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-sm">{b.bookingId}</span>
                  <span className="bg-teal-50 text-teal-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                    {b.serviceMode.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-bold text-slate-900">{b.appointmentDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="font-bold text-slate-900">{b.timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-bold text-slate-900">{b.patientDetails?.name}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/journey/${b._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                  >
                    View Status →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
