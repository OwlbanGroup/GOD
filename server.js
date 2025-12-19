import { info, error, warn, debug } from '../utils/loggerWrapper.js';

const express = require('express');
const path = require('node:path');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server start time for uptime tracking
const startTime = Date.now();

// Middleware for logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    environment: NODE_ENV,
    version: '1.0.0',
    service: 'GOD Application'
  };
  res.status(200).json(healthStatus);
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  // Add any readiness checks here (database connections, etc.)
  res.status(200).json({ 
    ready: true,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start the server
const server = app.listen(PORT, HOST, () => {
  logger.info('========================================');
  logger.info('🔱 GOD Application - Divine Server 🔱');
  logger.info('========================================');
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Server running on: http://${HOST}:${PORT}`);
  logger.info(`Health check: http://${HOST}:${PORT}/health`);
  logger.info(`Started at: ${new Date().toISOString()}`);
  logger.info('========================================');
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
