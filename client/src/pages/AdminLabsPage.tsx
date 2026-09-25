import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Building2, MapPin, Phone, Star, CheckCircle2 } from 'lucide-react';

export const AdminLabsPage: React.FC = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/labs'),
      api.get('/centers')
    ]).then(([lRes, cRes]) => {
      setLabs(lRes.data.labs || []);
      setCenters(cRes.data.centers || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lab & Center Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Manage accredited diagnostic laboratories and collection centers</p>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centers.map((center) => (
              <div key={center._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base">{center.name}</span>
                  <div className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1">{center.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.address.street}, {center.address.city} - {center.address.pincode}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.phone}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="bg-teal-50 text-teal-700 font-bold px-2.5 py-0.5 rounded-full">
                    {center.homeCollectionAvailable ? 'Home Collection Active' : 'Center Visit Only'}
                  </span>
                  <span className="text-slate-400">Max Slots: {center.maxSlotsPerTime}/hr</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
