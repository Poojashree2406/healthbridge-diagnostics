import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- Lazy-loaded pages (code-split per route) ---
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const TestCatalog = lazy(() => import('./pages/TestCatalog').then(m => ({ default: m.TestCatalog })));
const TestDetails = lazy(() => import('./pages/TestDetails').then(m => ({ default: m.TestDetails })));
const SharedReportPage = lazy(() => import('./pages/SharedReportPage').then(m => ({ default: m.SharedReportPage })));

const PatientDashboard = lazy(() => import('./pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const BookingWizard = lazy(() => import('./pages/BookingWizard').then(m => ({ default: m.BookingWizard })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })));
const DiagnosticJourneyPage = lazy(() => import('./pages/DiagnosticJourneyPage').then(m => ({ default: m.DiagnosticJourneyPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ReportViewer = lazy(() => import('./pages/ReportViewer').then(m => ({ default: m.ReportViewer })));
const HealthTrendsPage = lazy(() => import('./pages/HealthTrendsPage').then(m => ({ default: m.HealthTrendsPage })));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const LabDashboard = lazy(() => import('./pages/LabDashboard').then(m => ({ default: m.LabDashboard })));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const DoctorPatientsPage = lazy(() => import('./pages/DoctorPatientsPage').then(m => ({ default: m.DoctorPatientsPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminTestsPage = lazy(() => import('./pages/AdminTestsPage').then(m => ({ default: m.AdminTestsPage })));
const AdminLabsPage = lazy(() => import('./pages/AdminLabsPage').then(m => ({ default: m.AdminLabsPage })));

// --- Page Loading Skeleton ---
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
      <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Loading</span>
    </div>
  </div>
);

// --- Auth Guard ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tests" element={<TestCatalog />} />
            <Route path="/tests/:id" element={<TestDetails />} />
            <Route path="/shared-report/:shareToken" element={<SharedReportPage />} />

            {/* Protected Patient Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookingWizard /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/journey/:bookingId" element={<ProtectedRoute><DiagnosticJourneyPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ReportViewer /></ProtectedRoute>} />
            <Route path="/health-trends" element={<ProtectedRoute><HealthTrendsPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Specialized Role Dashboards */}
            <Route path="/lab/dashboard" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
            <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute><DoctorPatientsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tests" element={<ProtectedRoute><AdminTestsPage /></ProtectedRoute>} />
            <Route path="/admin/labs" element={<ProtectedRoute><AdminLabsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
