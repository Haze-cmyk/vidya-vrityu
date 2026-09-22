import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Centralized MongoDB configuration
import { connectDB, isDatabaseConnected, MONGO_URI } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Health check endpoint (Used by Render.com and frontend)
app.get('/api/health', (req, res) => {
  const connected = isDatabaseConnected();
  res.json({
    status: 'ok',
    database: connected ? 'connected' : 'disconnected',
    message: connected
      ? 'Database connected and operational'
      : 'Server is running in standalone mode. To connect a cloud database, set MONGO_URI in your Render environment variables.',
    timestamp: new Date().toISOString()
  });
});

/**
 * Server Startup
 * Connects to MongoDB via centralized config and listens on PORT
 */
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `[Vidya-Vrtti] Express API server running on port ${PORT}`);
  });
}

startServer();
