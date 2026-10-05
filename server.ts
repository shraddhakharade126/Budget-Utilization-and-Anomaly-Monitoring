import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/utils/seedData.js';
import { UserModel } from './server/models/index.js';
import apiRouter from './server/routes/api.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares & Permissive CORS for Angular frontend and API clients
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

  // Initialize DB & Seed Demo Data
  await connectDB();
  const userCount = await UserModel.countDocuments();
  if (userCount === 0) {
    console.log('[Bootstrap] Database empty. Seeding initial GovBudget demo data...');
    await seedDatabase();
  }

  // API Routes FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      system: 'GovBudget AI — Budget Utilization & Anomaly Monitoring',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development / SPA static fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`GovBudget AI Server running at http://0.0.0.0:${PORT}`);
    console.log(`Role-Based Access Control: ADMIN, FINANCE_OFFICER, DEPARTMENT_HEAD`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal] Server failed to start:', err);
  process.exit(1);
});
