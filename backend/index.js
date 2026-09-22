import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vidya-vrtti-db';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

/**
 * MongoDB Startup Connection and Health Check
 */
async function startServer() {
  try {
    console.log(`[Vidya-Vrtti] Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('\x1b[32m%s\x1b[0m', `[Vidya-Vrtti] Successfully connected to MongoDB database: vidya-vrtti-db`);

    app.listen(PORT, () => {
      console.log('\x1b[36m%s\x1b[0m', `[Vidya-Vrtti] Express API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `
═══════════════════════════════════════════════════════════════════════════════
 [CRITICAL ERROR] MongoDB is NOT reachable!
 Cannot connect to: ${MONGO_URI}
═══════════════════════════════════════════════════════════════════════════════

 Please start MongoDB locally using one of the following methods:

  • Windows (Service):
      Open PowerShell as Administrator and run:
      > net start MongoDB
      or
      > Start-Service MongoDB

  • Windows / Manual:
      Run mongod with your database directory:
      > mongod --dbpath <path_to_data_folder>

  • macOS (Homebrew):
      > brew services start mongodb-community

  • Linux (systemd):
      > sudo systemctl start mongod

 Exact connection error: ${err.message}
═══════════════════════════════════════════════════════════════════════════════
`);
    process.exit(1);
  }
}

startServer();
