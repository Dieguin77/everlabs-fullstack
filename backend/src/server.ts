import 'reflect-metadata';
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { router } from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import './shared/container'; // Must be imported to register dependencies
import { swaggerSpec } from './swagger.js';
import { prisma } from './infra/database/prisma.js';
import { checkDatabase } from './infra/database/checkDatabase.js';
import { createHealthRouter } from './infra/http/routes/health.routes.js';

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());

// Health checks: /health never touches the database; /health/db probes it with a short timeout
app.use('/health', createHealthRouter({ ping: () => prisma.$queryRaw`SELECT 1` }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', router);

// Error Handler Middleware
// This must be the last middleware to be used
app.use(errorHandler);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`[boot] listening after ${Math.round(process.uptime() * 1000)} ms`);

  // Informational only: never blocks the server and never prints connection details.
  checkDatabase(() => prisma.$queryRaw`SELECT 1`, 5000).then((result) => {
    const detail = result.ok ? `${result.latencyMs} ms` : `${result.reason}, ${result.latencyMs} ms`;
    console.log(`[boot] database ${result.ok ? 'up' : 'DOWN'} (${detail})`);
  });
});