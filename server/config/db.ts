import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

export interface DBConfig {
  isAtlasConnected: boolean;
  dbType: 'MongoDB Atlas' | 'Embedded High-Performance Document Store';
}

export const dbStatus: DBConfig = {
  isAtlasConnected: false,
  dbType: 'Embedded High-Performance Document Store'
};

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    try {
      console.log('[Database] Establishing MongoDB connection via Mongoose...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      dbStatus.isAtlasConnected = true;
      dbStatus.dbType = 'MongoDB Atlas';
      console.log('[Database] Connected to MongoDB Atlas successfully.');
      return;
    } catch (err: any) {
      console.warn('[Database] MongoDB Atlas connection failed, falling back to embedded store:', err.message);
    }
  }

  console.log('[Database] Running with Embedded High-Performance Document Store (Demo & Dev Ready).');
  dbStatus.isAtlasConnected = false;
  dbStatus.dbType = 'Embedded High-Performance Document Store';
}
