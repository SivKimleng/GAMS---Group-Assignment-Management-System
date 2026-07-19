import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/docs/swagger.js';
import { testConnection } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import groupworkRoutes from './src/routes/groupworkRoutes.js';
import assignmentRoutes from './src/routes/assignmentRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import reminderRoutes from './src/routes/reminderRoutes.js';
import { errorMiddleware, notFound } from './src/middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
]);

app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, '');

    // Vite picks the next free port in development.  Keep local development
    // sessions usable instead of rejecting a valid login just because the port changed.
    const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin || '');
    if (!origin || allowedOrigins.has(normalizedOrigin) || isLocalDevOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// Submission files are encoded as data URLs by the current browser-only upload flow.
app.use(express.json({ limit: '270mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GAMS backend is running',
    data: {
      app: 'Group Assignment Management System',
      docs: '/api-docs'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend health check passed',
    data: { status: 'ok' }
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groupworks', groupworkRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reminders', reminderRoutes);

app.use(notFound);
app.use(errorMiddleware);

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`GAMS backend running on http://localhost:${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to connect to the database.');
    console.error(error.message);
    process.exit(1);
  }
}


startServer();

export default app;
