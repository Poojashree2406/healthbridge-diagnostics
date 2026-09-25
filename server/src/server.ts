import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import { seedDatabase } from './seed';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    if (MONGODB_URI) {
      // ── Production: connect to MongoDB Atlas ──────────────────────────
      console.log('🔌 Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('✅ Connected to MongoDB Atlas');
    } else {
      // ── Development: try local MongoDB, fall back to in-memory ────────
      const localUri = 'mongodb://127.0.0.1:27017/healthbridge';
      try {
        console.log(`🔌 Attempting local MongoDB at ${localUri}...`);
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ Connected to local MongoDB');
      } catch {
        console.log('⚠️  Local MongoDB unavailable. Starting in-memory MongoDB...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({ instance: { port: 27700 } });
        const memUri = mongoServer.getUri();
        await mongoose.connect(memUri);
        console.log(`✅ In-Memory MongoDB running at ${memUri}`);

        // Keep memory server alive across tsx watch restarts
        process.on('SIGTERM', () => mongoServer.stop());
        process.on('SIGINT', () => mongoServer.stop());
      }
    }

    // Seed on first boot (guard inside seedDatabase prevents double-seeding)
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️  Seed warning (non-fatal):', seedErr);
    }

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 HealthBridge API  →  http://localhost:${PORT}`);
      console.log(`📚 Swagger Docs      →  http://localhost:${PORT}/api-docs`);
      console.log(`🌍 Environment       →  ${NODE_ENV}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
