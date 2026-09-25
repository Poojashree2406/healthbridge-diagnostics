import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Search,
  Calendar,
  ClipboardList,
  GitCommit,
  FileText,
  TrendingUp,
  CreditCard,
  MessageSquare,
  User,
  Settings,
  ShieldCheck,
  FlaskConical,
  Stethoscope,
  Users,
  Building2,
  FileCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'PATIENT';

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tests', label: 'Find Tests', icon: Search },
    { to: '/bookings', label: 'My Bookings', icon: ClipboardList },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/journey/HB-2026-000123', label: 'Journey Tracker', icon: GitCommit },
    { to: '/reports', label: 'Diagnostic Reports', icon: FileText },
    { to: '/health-trends', label: 'Health Trends', icon: TrendingUp },
    { to: '/payments', label: 'Payments & Invoices', icon: CreditCard },
    { to: '/feedback', label: 'Lab Ratings & Feedback', icon: MessageSquare },
    { to: '/profile', label: 'Profile & Consent', icon: User }
  ];

  const labLinks = [
    { to: '/lab/dashboard', label: 'Lab Operations', icon: FlaskConical },
    { to: '/lab/samples', label: 'Sample Queue & Barcodes', icon: ClipboardList },
    { to: '/lab/journey-update', label: 'Journey Tracker Update', icon: GitCommit },
    { to: '/reports', label: 'Diagnostic Reports', icon: FileText }
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Physician Portal', icon: Stethoscope },
    { to: '/doctor/patients', label: 'Assigned Patients', icon: Users },
    { to: '/reports', label: 'Medical Reports Review', icon: FileCheck }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Enterprise Analytics', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/tests', label: 'Test Catalog Manager', icon: Search },
    { to: '/admin/labs', label: 'Lab & Center Manager', icon: Building2 },
    { to: '/admin/audit-logs', label: 'Audit Security Logs', icon: ShieldCheck }
  ];

  let activeLinks = patientLinks;
  if (role === 'LAB_TECHNICIAN') activeLinks = labLinks;
  else if (role === 'PHYSICIAN' || role === 'RADIOLOGIST') activeLinks = doctorLinks;
  else if (role === 'ADMIN') activeLinks = adminLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col p-4 border-r border-slate-800">
      <div className="mb-4 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
        <p className="text-xs uppercase font-bold tracking-wider text-teal-400">Navigation Menu</p>
        <p className="text-xs text-slate-400 font-medium">{role.replace('_', ' ')} Workspace</p>
      </div>

      <nav className="flex-1 space-y-1">
        {activeLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-900/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Security Compliance Footnote */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
        <div className="flex items-center space-x-1 text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <span>HIPAA & DPDP Protected</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          256-bit SSL encrypted medical file access.
        </p>
      </div>
    </aside>
  );
};
