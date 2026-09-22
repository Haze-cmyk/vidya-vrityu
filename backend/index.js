import nodeCrypto from 'crypto';

// Polyfill global crypto for MongoDB driver on cloud runtimes (Node 18/Railway Nixpacks)
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = nodeCrypto.webcrypto || nodeCrypto;
}
if (typeof global.crypto === 'undefined') {
  global.crypto = nodeCrypto;
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Centralized MongoDB configuration
import { connectDB, isDatabaseConnected, MONGO_URI, lastConnectionError } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Robust CORS middleware supporting Netlify domains, local dev, and custom CORS_ORIGIN
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database readiness check: Fail fast with helpful message instead of 10s buffering timeout
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please verify MONGO_URI in your Railway/server environment variables.'
    });
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint (Used by monitoring, Railway, Render, and frontend)
app.get('/api/health', (req, res) => {
  const connected = isDatabaseConnected();
  res.json({
    status: 'ok',
    database: connected ? 'connected' : 'disconnected',
    mongoUriConfigured: !!(MONGO_URI && MONGO_URI.trim() !== ''),
    databaseError: lastConnectionError ? lastConnectionError.message : null,
    stack: lastConnectionError ? lastConnectionError.stack : null,
    message: connected
      ? 'Database connected and operational'
      : (lastConnectionError ? `Database error: ${lastConnectionError.message}` : 'No MONGO_URI configured.'),
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
