import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // In production, all API calls go to VITE_API_URL env var
  define: {
    __API_BASE__: JSON.stringify(
      mode === 'production'
        ? (process.env.VITE_API_URL ?? '')
        : ''
    )
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons':    ['lucide-react'],
          'vendor-charts':   ['recharts'],
          'vendor-http':     ['axios'],
          'vendor-shared':   ['@healthbridge/shared'],
          'vendor-zod':      ['zod'],
          'pages-patient':   [
            './src/pages/PatientDashboard',
            './src/pages/BookingWizard',
            './src/pages/BookingsPage',
            './src/pages/AppointmentsPage',
            './src/pages/DiagnosticJourneyPage',
            './src/pages/PaymentsPage',
            './src/pages/FeedbackPage',
            './src/pages/ProfilePage',
          ],
          'pages-reports':   [
            './src/pages/ReportsPage',
            './src/pages/ReportViewer',
            './src/pages/SharedReportPage',
            './src/pages/HealthTrendsPage',
          ],
          'pages-dashboards': [
            './src/pages/LabDashboard',
            './src/pages/DoctorDashboard',
            './src/pages/DoctorPatientsPage',
            './src/pages/AdminDashboard',
            './src/pages/AdminTestsPage',
            './src/pages/AdminLabsPage',
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react']
  }
}));
