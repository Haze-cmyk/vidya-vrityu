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
// MongoDB Atlas Cloud Connection String
const ATLAS_FALLBACK_URI = 'mongodb+srv://mainaudy12_db_user:fONwulbjlyOq1W8k@vidya-vritti-databse.bjidi2m.mongodb.net/vidya-vrtti?retryWrites=true&w=majority&appName=vidya-vritti-databse';

export const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL || ATLAS_FALLBACK_URI;

/**
 * Check if MongoDB is currently connected
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export let lastConnectionError = null;

/**
 * Connect to MongoDB with graceful error handling for cloud deployments (Render.com, etc.)
 */
export async function connectDB() {
  lastConnectionError = null;
  if (!MONGO_URI || MONGO_URI.trim() === '') {
    lastConnectionError = new Error('No MONGO_URI provided in environment');
    console.warn('\x1b[33m%s\x1b[0m', `
===============================================================================
 [NOTICE] No MongoDB URI provided (MONGO_URI / MONGODB_URI is empty).
 The server is running in STANDALONE mode.
===============================================================================
    `);
    return false;
  }

  try {
    console.log(`[Vidya-Vrtti] Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('\x1b[32m%s\x1b[0m', `[Vidya-Vrtti] Successfully connected to MongoDB database.`);
    return true;
  } catch (err) {
    lastConnectionError = err;
    console.error('\x1b[31m%s\x1b[0m', `
===============================================================================
 [WARNING] Could not connect to MongoDB database!
 Exact error: ${err.message}
===============================================================================
    `);
    return false;
  }
}
