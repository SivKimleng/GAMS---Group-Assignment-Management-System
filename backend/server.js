import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { testConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import groupworkRoutes from './routes/groupworkRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js';

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

    if (!origin || allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

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
