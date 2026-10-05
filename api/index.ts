import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from '../server/config/db.js';
import { seedDatabase } from '../server/utils/seedData.js';
import { UserModel } from '../server/models/index.js';
import apiRouter from '../server/routes/api.js';

const app = express();

// Middlewares & Permissive CORS for API clients
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

let isDbInitialized = false;
async function ensureDbInit() {
  if (!isDbInitialized) {
    try {
      await connectDB();
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await seedDatabase();
      }
      isDbInitialized = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database initialization warning:', err);
    }
  }
}

app.use(async (_req, _res, next) => {
  await ensureDbInit();
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'GovBudget AI — Budget Utilization & Anomaly Monitoring',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

export default app;
