import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Users, FileText, Stethoscope, Search, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/doctor/dashboard')
      .then(res => setPatients(res.data.recentPatients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Patients Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Authorized medical records and diagnostic testing history</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((patient) => (
              <div key={patient._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{patient.name}</h3>
                    <p className="text-xs text-slate-500">Gender: {patient.gender} • DOB: {patient.dob}</p>
                  </div>
                  <span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full text-xs">
                    Blood Group: {patient.bloodGroup || 'O+'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-600">
                  <p className="font-bold text-slate-800">Address:</p>
                  <p>{patient.address?.street}, {patient.address?.city} ({patient.address?.pincode})</p>
                  {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800 block">Medical History:</span>
                      <span className="text-slate-600">{patient.medicalHistory.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <Link
                    to="/reports"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center space-x-1"
                  >
                    <span>View Patient Diagnostic Reports</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
