import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DiagnosticStage } from '@healthbridge/shared';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const DiagnosticJourneyPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();

  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const targetBookingId = bookingId || 'HB-2026-000123';

  const fetchJourney = () => {
    setLoading(true);
    api.get(`/journeys/${targetBookingId}`)
      .then(res => setJourney(res.data.journey))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJourney();
  }, [bookingId]);

  const handleSimulateNextStage = async (nextStage: DiagnosticStage) => {
    setUpdating(true);
    try {
      await api.put('/journeys/status', {
        bookingId: journey?.bookingId || targetBookingId,
        stage: nextStage,
        notes: `Stage advanced via simulation control at ${new Date().toLocaleTimeString()}`
      });
      fetchJourney();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const allStages = [
    { key: DiagnosticStage.BOOKING_CONFIRMED, label: '1. Booking Confirmed', dept: 'Registration' },
    { key: DiagnosticStage.APPOINTMENT_SCHEDULED, label: '2. Appointment Scheduled', dept: 'Scheduling' },
    { key: DiagnosticStage.PATIENT_CHECK_IN, label: '3. Patient Check-In / Dispatched', dept: 'Logistics' },
    { key: DiagnosticStage.SAMPLE_COLLECTION, label: '4. Sample Collection', dept: 'Phlebotomy' },
    { key: DiagnosticStage.SAMPLE_RECEIVED, label: '5. Sample Received at Lab', dept: 'Central Lab' },
    { key: DiagnosticStage.LAB_PROCESSING, label: '6. Lab Processing & Diagnostics', dept: 'Pathology' },
    { key: DiagnosticStage.QUALITY_REVIEW, label: '7. Quality Review', dept: 'Quality Assurance' },
    { key: DiagnosticStage.REPORT_GENERATION, label: '8. Report Generation', dept: 'LIS System' },
    { key: DiagnosticStage.PHYSICIAN_REVIEW, label: '9. Physician Sign-off', dept: 'Medical Board' },
    { key: DiagnosticStage.RESULT_DELIVERED, label: '10. Result Delivered', dept: 'Patient Portal' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">
              <GitCommit className="w-4 h-4" />
              <span>Real-Time Diagnostic Journey Tracker</span>
            </div>
            <h1 className="text-3xl font-black">Booking ID: {targetBookingId}</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Follow every stage of sample collection, lab processing, quality control, and report delivery.
            </p>
          </div>

          <button
            onClick={fetchJourney}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Demo Simulation Controls for Testing */}
        <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Demo Stage Advancer Controls (Lab Tech / Doctor Simulator)
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Interactive Demo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allStages.map((stg) => (
              <button
                key={stg.key}
                disabled={updating}
                onClick={() => handleSimulateNextStage(stg.key)}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-[11px] font-bold text-slate-800 hover:bg-amber-100 transition-all shadow-sm"
              >
                Mark {stg.label.split('.')[0]} Done
              </button>
            ))}
          </div>
        </div>

        {/* Timeline View */}
        {loading ? (
          <div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 mb-8">10-Stage Diagnostic Progress</h3>

            <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 space-y-8">
              {allStages.map((stgInfo, idx) => {
                const stageRecord = journey?.stages?.find((s: any) => s.stage === stgInfo.key);
                const isCompleted = stageRecord?.status === 'COMPLETED';
                const isCurrent = journey?.currentStage === stgInfo.key;

                return (
                  <div key={stgInfo.key} className="relative group">
                    
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[31px] md:-left-[39px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                        isCompleted
                          ? 'bg-teal-600 text-white ring-4 ring-teal-50'
                          : isCurrent
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-1 hover:bg-slate-50 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-extrabold text-slate-900 text-base">{stgInfo.label}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-semibold text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                            Dept: {stgInfo.dept}
                          </span>
                          <span
                            className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCurrent
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {stageRecord?.timestamp && (
                        <p className="text-xs text-slate-500">
                          Timestamp: {new Date(stageRecord.timestamp).toLocaleString()}
                        </p>
                      )}

                      {stageRecord?.notes && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                          Note: "{stageRecord.notes}"
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
