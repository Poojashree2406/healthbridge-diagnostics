import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Search,
  Activity,
  ShieldCheck,
  Truck,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Calendar
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tests?search=${encodeURIComponent(searchTerm)}`);
  };

  const categories = [
    { title: 'Blood Tests', count: '15+ Tests', icon: Activity, slug: 'blood-tests', color: 'bg-rose-50 text-rose-600' },
    { title: 'Diabetes & Sugar', count: '8+ Tests', icon: Activity, slug: 'diabetes', color: 'bg-amber-50 text-amber-600' },
    { title: 'Heart Health', count: '10+ Tests', icon: Activity, slug: 'heart-health', color: 'bg-red-50 text-red-600' },
    { title: 'Hormone Profile', count: '6+ Tests', icon: Activity, slug: 'hormones', color: 'bg-purple-50 text-purple-600' },
    { title: 'Kidney Health', count: '5+ Tests', icon: Activity, slug: 'kidney', color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Liver Profile (LFT)', count: '7+ Tests', icon: Activity, slug: 'liver', color: 'bg-blue-50 text-blue-600' },
    { title: 'Vitamins & Minerals', count: '9+ Tests', icon: Activity, slug: 'vitamins', color: 'bg-orange-50 text-orange-600' },
    { title: 'Full Body Packages', count: '10 Packages', icon: ShieldCheck, slug: 'packages', color: 'bg-teal-50 text-teal-600' }
  ];

  return (
    <DashboardLayout showSidebar={false}>
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy-950 via-slate-900 to-teal-900 text-white p-8 md:p-14 shadow-2xl mb-12">
        <div className="max-w-3xl relative z-10 space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Digital Healthcare Diagnostic Platform • MERN Stack</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Your Complete Diagnostic Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">Connected.</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Discover 100+ pathology & radiology tests, select NABL-accredited diagnostic centers, schedule home collection, track live 10-stage sample progress, and download HIPAA-encrypted reports.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search test name (e.g. CBC, HbA1c, Vitamin D, Lipid)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02]"
            >
              Find Tests
            </button>
          </form>

          {/* Key Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-teal-400" />
              <span>Doorstep Home Collection</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Same-Day Digital Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>NABL Accredited Labs</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Doctor Consultation</span>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Grid */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore Diagnostic Categories</h2>
            <p className="text-sm text-slate-500">Select a category to filter certified lab tests</p>
          </div>
          <Link to="/tests" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
            <span>View All Tests</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/tests?category=${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500/50 hover:shadow-xl transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">{cat.title}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Workflow Timeline Showcase */}
      <section className="mb-14 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">The Complete Diagnostic Lifecycle</h2>
        <p className="text-sm text-slate-500 text-center mb-8">From test discovery to doctor review in 6 seamless steps</p>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center">
          {[
            { step: '01', title: 'Find & Select', desc: 'Browse tests, compare prices & prep info' },
            { step: '02', title: 'Schedule Slot', desc: 'Book home sample collection or center visit' },
            { step: '03', title: 'Sample Collection', desc: 'Certified phlebotomist collects sample' },
            { step: '04', title: 'Lab Processing', desc: 'Automated diagnostic analyzers run tests' },
            { step: '05', title: 'Journey Tracker', desc: 'Track live 10-stage progress in real-time' },
            { step: '06', title: 'Report & Share', desc: 'View trend charts & generate share link' }
          ].map((item, index) => (
            <div key={index} className="relative p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center mb-2 shadow-sm">
                {item.step}
              </span>
              <h4 className="font-bold text-slate-800 text-xs mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Health Package Banner */}
      <section className="bg-gradient-to-r from-teal-700 to-navy-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
            Special Offer • 40% OFF
          </span>
          <h3 className="text-2xl font-extrabold mb-2">HealthBridge Full Body Premium Package</h3>
          <p className="text-sm text-slate-200 max-w-xl">
            Covers 70+ vital parameters including Complete Blood Count, Lipid Profile, Liver Function, Kidney Function, Thyroid Profile, and Vitamin D.
          </p>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="text-right">
            <span className="text-xs text-slate-300 line-through">₹4,199</span>
            <p className="text-3xl font-black text-emerald-300">₹2,499</p>
          </div>
          <Link
            to="/book?package=PKG-FULLBODY-PREMIUM"
            className="px-6 py-3.5 bg-white text-slate-900 font-extrabold rounded-2xl hover:bg-slate-100 transition-all shadow-md text-sm"
          >
            Book Package Now
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
};
