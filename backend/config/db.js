import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized MongoDB Connection String Variable
 * 
 * Supports both MONGO_URI and MONGODB_URI environment variables (standard on Render, Atlas, Railway, etc.).
 * If none is provided, it defaults to empty string so the server can run without crashing on Render.com
 * until you add your cloud database URI in the Render dashboard.
 */
export const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';

/**
 * Check if MongoDB is currently connected
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Connect to MongoDB with graceful error handling for cloud deployments (Render.com, etc.)
 */
export async function connectDB() {
  if (!MONGO_URI || MONGO_URI.trim() === '') {
    console.warn('\x1b[33m%s\x1b[0m', `
===============================================================================
 [NOTICE] No MongoDB URI provided (MONGO_URI / MONGODB_URI is empty).
 The server is running in STANDALONE mode.
 
 Deploying to Render.com?
 You can add your cloud database anytime in:
 Render Dashboard -> Environment Variables -> MONGO_URI=<your-db-connection-string>
===============================================================================
    `);
    return false;
  }

  try {
    console.log(`[Vidya-Vrtti] Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('\x1b[32m%s\x1b[0m', `[Vidya-Vrtti] Successfully connected to MongoDB database.`);
    return true;
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `
===============================================================================
 [WARNING] Could not connect to MongoDB database!
 Exact error: ${err.message}
 
 The API server will still stay ONLINE so your Render deployment stays healthy.
 Once your cloud database is online, set MONGO_URI in your dashboard.
===============================================================================
    `);
    return false;
  }
}
