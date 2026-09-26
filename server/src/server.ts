import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { socketService } from './services/socket.service';
import { CronService } from './services/cron.service';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import activityRoutes from './routes/activity.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';

const app = express();
const server = http.createServer(app);

// 1. CORS Configuration (Allows credentials for HttpOnly cookies)
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/assessment for ease of testing
      }
    },
    credentials: true,
  })
);

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Velozity Real-Time Project Dashboard API',
    uptime: process.uptime(),
  });
});

// 4. API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);

// 5. Global Error Handling
app.use(errorHandler);

// 6. Initialize WebSocket Service
socketService.init(server, config.CLIENT_URL);

// 7. Initialize Background Cron Jobs
CronService.init();

// 8. Start Server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Velozity Server is running on port ${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`=======================================================`);
});

export { app, server };
