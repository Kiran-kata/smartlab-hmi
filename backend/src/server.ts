import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

import { deviceRoutes, readingRoutes, commandRoutes, eventRoutes } from './routes';
import { wsManager } from './websocket/wsManager';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    wsClients: wsManager.getConnectedClientsCount(),
  });
});

// API routes
app.use('/devices', deviceRoutes);
app.use('/devices', readingRoutes);
app.use('/devices', commandRoutes);
app.use('/devices', eventRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize WebSocket manager
wsManager.initialize(wss);

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('SmartLab HMI Backend Server');
  console.log('='.repeat(50));
  console.log(`HTTP Server: http://localhost:${PORT}`);
  console.log(`WebSocket Server: ws://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  wsManager.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  wsManager.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
