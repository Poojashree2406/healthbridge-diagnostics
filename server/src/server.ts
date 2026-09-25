import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import app from './app';
import { seedDatabase } from './seed';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// URI resolution priority:
// 1. MONGODB_URI env var (production — Atlas)
// 2. .mongodb-uri file (local persistent DB from `npm run db`)
// 3. Local MongoDB at 27017
// 4. Fresh in-memory MongoDB (last resort)
async function resolveMongoURI(): Promise<string> {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const uriFile = path.join(process.cwd(), '.mongodb-uri');
  if (fs.existsSync(uriFile)) {
    const uri = fs.readFileSync(uriFile, 'utf8').trim();
    console.log('🗄️  Found persistent local DB (from npm run db)');
    return uri;
  }

  return 'mongodb://127.0.0.1:27017/healthbridge';
}

async function startServer() {
  try {
    const mongoURI = await resolveMongoURI();
    console.log(`🔌 Connecting to MongoDB...`);

    try {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ MongoDB connected');
    } catch {
      // Final fallback: fresh in-memory
      console.log('⚠️  Falling back to in-memory MongoDB (data will reset on restart)');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri() + 'healthbridge');
      console.log('✅ In-memory MongoDB started');
    }

    await seedDatabase();

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
