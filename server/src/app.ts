import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import labRoutes from './routes/labRoutes';
import bookingRoutes from './routes/bookingRoutes';
import journeyRoutes from './routes/journeyRoutes';
import reportRoutes from './routes/reportRoutes';
import paymentRoutes from './routes/paymentRoutes';
import patientRoutes from './routes/patientRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import doctorRoutes from './routes/doctorRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import { Notification } from './models/Notification';
import { authenticateJWT } from './middleware/auth';

const app = express();

// Gzip compress all responses
app.use(compression());

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use('/api/v1', apiLimiter);

// Swagger Docs API Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Checks
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  return res.json({ status: 'UP', service: 'HealthBridge Diagnostics API', timestamp: new Date().toISOString() });
});
app.get('/ready', (req, res) => res.json({ status: 'READY' }));

// API v1 Router Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1', labRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/journeys', journeyRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);

// In-app Notification List
app.get('/api/v1/notifications', authenticateJWT, async (req: any, res) => {
  try {
    // Cache headers — allow browser to reuse for 30s
    res.set('Cache-Control', 'private, max-age=30');
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    return res.json({ success: true, count: notifications.length, notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.use(errorHandler);

export default app;
