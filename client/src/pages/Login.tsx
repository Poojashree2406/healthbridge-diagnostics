import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Activity, Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'LAB_TECHNICIAN') navigate('/lab/dashboard');
      else if (role === 'PHYSICIAN' || role === 'RADIOLOGIST') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo Quick-Fill accounts
  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <DashboardLayout showSidebar={false}>
      <div className="max-w-md mx-auto my-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl relative overflow-hidden">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-navy-900 to-teal-600 text-white mb-3 shadow-md">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in to manage your diagnostic journey</p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Demo Account Quick Fill
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">Password123!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill('patient@example.com')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-600 text-left transition-colors truncate"
              >
                👤 Patient
              </button>
              <button
                type="button"
                onClick={() => quickFill('lab@example.com')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-600 text-left transition-colors truncate"
              >
                🧪 Lab Tech
              </button>
              <button
                type="button"
                onClick={() => quickFill('doctor@example.com')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-600 text-left transition-colors truncate"
              >
                🩺 Physician
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@example.com')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-600 text-left transition-colors truncate"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 hover:to-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:underline">
              Create a free Patient account
            </Link>
          </p>

        </div>
      </div>
    </DashboardLayout>
  );
};
