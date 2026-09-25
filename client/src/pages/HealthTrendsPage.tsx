import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Filter, Info } from 'lucide-react';

export const HealthTrendsPage: React.FC = () => {
  const [trendPoints, setTrendPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState('HbA1c');

  useEffect(() => {
    api.get('/reports/trends')
      .then(res => {
        const pts = res.data.trendPoints || [];
        if (pts.length === 0) {
          // Provide mock dataset for demonstration charting
          setTrendPoints([
            { date: '2026-03-01', parameterName: 'HbA1c', value: 6.8, unit: '%' },
            { date: '2026-05-10', parameterName: 'HbA1c', value: 6.6, unit: '%' },
            { date: '2026-07-20', parameterName: 'HbA1c', value: 6.4, unit: '%' },
            { date: '2026-09-01', parameterName: 'HbA1c', value: 6.2, unit: '%' },
            { date: '2026-03-01', parameterName: 'Fast Blood Sugar', value: 130, unit: 'mg/dL' },
            { date: '2026-05-10', parameterName: 'Fast Blood Sugar', value: 122, unit: 'mg/dL' },
            { date: '2026-07-20', parameterName: 'Fast Blood Sugar', value: 118, unit: 'mg/dL' },
            { date: '2026-09-01', parameterName: 'Fast Blood Sugar', value: 110, unit: 'mg/dL' },
            { date: '2026-03-01', parameterName: 'Hemoglobin', value: 13.8, unit: 'g/dL' },
            { date: '2026-07-20', parameterName: 'Hemoglobin', value: 14.2, unit: 'g/dL' }
          ]);
        } else {
          setTrendPoints(pts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const parametersList = Array.from(new Set(trendPoints.map(p => p.parameterName)));
  const chartData = trendPoints.filter(p => p.parameterName === selectedParameter);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Health Trend Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track recurring diagnostic parameters over time</p>
        </div>

        {/* Parameter Selector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Parameter to Chart</label>
            <div className="flex flex-wrap gap-2">
              {(parametersList.length > 0 ? parametersList : ['HbA1c', 'Fast Blood Sugar', 'Hemoglobin']).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedParameter(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedParameter === p
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-sm">
            <span className="font-bold text-slate-700">Note:</span> Charts display recorded lab values strictly for monitoring trends.
          </div>
        </div>

        {/* Recharts Analytics Chart */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedParameter} Trend History</h3>
                <p className="text-xs text-slate-500">Historical results over time</p>
              </div>
            </div>

            <span className="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
              {chartData.length > 0 ? `${chartData.length} Readings` : 'Sample Data'}
            </span>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [
                { date: 'Mar 2026', value: 6.8 },
                { date: 'May 2026', value: 6.6 },
                { date: 'Jul 2026', value: 6.4 },
                { date: 'Sep 2026', value: 6.2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
