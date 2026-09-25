/**
 * HealthBridge — Persistent Local MongoDB
 * Run once: `npm run db`
 * Starts MongoMemoryServer on a FIXED port with data stored to disk.
 * Survives tsx watch restarts. Data persists between sessions.
 */
import path from 'path';
import fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';

const DB_PORT = 27700;
const DB_PATH = path.join(process.cwd(), '.mongodb-data');
const URI_FILE = path.join(process.cwd(), '.mongodb-uri');

async function startPersistentDB() {
  // Ensure data directory exists
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
    console.log(`📁 Created MongoDB data directory: ${DB_PATH}`);
  }

  console.log('🗄️  Starting HealthBridge Local MongoDB...');
  console.log(`📂 Data directory: ${DB_PATH}`);

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: DB_PORT,
      dbName: 'healthbridge',
      dbPath: DB_PATH,
      storageEngine: 'wiredTiger'
    }
  });

  const uri = mongod.getUri();
  const fullUri = `${uri}healthbridge`;

  // Write URI to file so server.ts can read it
  fs.writeFileSync(URI_FILE, fullUri, 'utf8');

  console.log('');
  console.log('====================================================');
  console.log('✅ HealthBridge Local MongoDB is running!');
  console.log(`🔌 URI: ${fullUri}`);
  console.log(`🗄️  Port: ${DB_PORT}`);
  console.log(`💾 Data persists at: ${DB_PATH}`);
  console.log('====================================================');
  console.log('');
  console.log('Keep this terminal open while developing.');
  console.log('Data survives tsx watch restarts ✓');
  console.log('Press Ctrl+C to stop the database.');

  // Handle shutdown
  const shutdown = async () => {
    console.log('\n🛑 Stopping MongoDB...');
    fs.unlinkSync(URI_FILE);
    await mongod.stop();
    console.log('✅ MongoDB stopped. Data saved.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep alive
  setInterval(() => {}, 1000 * 60 * 60);
}

startPersistentDB().catch(err => {
  console.error('❌ Failed to start MongoDB:', err);
  process.exit(1);
});
