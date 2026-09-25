import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Activity,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const TestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tests/${id}`)
      .then(res => setTest(res.data.test))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold">Test not found</h2>
          <Link to="/tests" className="text-teal-600 font-bold mt-2 inline-block">Back to Test Catalog</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100 mb-3 inline-block">
              {test.categoryId?.name || 'Pathology Test'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{test.name}</h1>
            <p className="text-xs font-semibold text-slate-400 mb-4">Test Code: {test.code}</p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{test.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">Sample Required</span>
                <span className="font-bold text-slate-800 text-sm">{test.sampleType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Report Turnaround</span>
                <span className="font-bold text-slate-800 text-sm">{test.turnaroundHours} Hours</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fasting Requirement</span>
                <span className={`font-bold text-sm ${test.fastingRequired ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {test.fastingRequired ? 'Fasting Required' : 'No Fasting'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">What This Test Measures</h3>
            <p className="text-sm text-slate-600">{test.measures}</p>

            <h3 className="text-lg font-bold text-slate-900 pt-2">Why This Test Is Performed</h3>
            <p className="text-sm text-slate-600">{test.whyPerformed}</p>

            <h3 className="text-lg font-bold text-slate-900 pt-2">Preparation Instructions</h3>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pre-test Instructions:
              </p>
              <p>{test.preparationInstructions}</p>
            </div>
          </div>

          {/* FAQs */}
          {test.faqs && test.faqs.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4 divide-y divide-slate-100">
                {test.faqs.map((faq: any, idx: number) => (
                  <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                    <h4 className="font-bold text-slate-800 text-sm">{faq.question}</h4>
                    <p className="text-xs text-slate-600 mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs leading-relaxed">
            <p className="font-bold text-slate-700">Medical Disclaimer:</p>
            Diagnostic information provided on HealthBridge is for educational purposes only and does not substitute professional medical advice, diagnosis, or treatment.
          </div>
        </div>

        {/* Sidebar Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl sticky top-24">
            <span className="text-xs text-slate-400 block font-medium">Standard Test Price</span>
            <div className="flex items-baseline space-x-2 my-2">
              <span className="text-3xl font-black text-slate-900">₹{test.price}</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Best Price Guaranteed</span>
            </div>

            <div className="space-y-3 my-6">
              <button
                onClick={() => navigate(`/book?testId=${test._id}&mode=HOME_COLLECTION`)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Book Home Collection</span>
              </button>

              <button
                onClick={() => navigate(`/book?testId=${test._id}&mode=DIAGNOSTIC_CENTER`)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Book Visit at Diagnostic Center</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>NABL & ISO Certified Labs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>Painless Blood Collection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>100% Confidential Digital Reports</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
