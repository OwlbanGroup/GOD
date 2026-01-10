import { info, error, warn, debug } from './utils/loggerWrapper.js';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server start time for uptime tracking
const startTime = Date.now();

// Middleware for logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// API Routes for OSCAR-BROOME-REVENUE integration

// Earnings API
app.get('/api/earnings', (req, res) => {
  const earningsData = {
    totalAnnualRevenue: 2500000.50,
    period: 'annual',
    streams: [
      { name: 'Consulting Services', amount: 1500000.00, percentage: 60.0 },
      { name: 'Software Licensing', amount: 750000.00, percentage: 30.0 },
      { name: 'Investment Returns', amount: 250000.50, percentage: 10.0 }
    ],
    projections: {
      nextYear: 2750000.00,
      confidence: 85.5
    },
    purchases: {
      autoFleetDetails: [
        { model: 'Tesla Model S', vin: 'VIN123456', cost: 79999.00, purchaseDate: '2024-01-15' }
      ]
    }
  };
  res.json(earningsData);
});

// Banking API
app.get('/api/banking/accounts', (req, res) => {
  const accountsData = {
    accounts: [
      {
        id: 'acc_001',
        account_number: '****1234',
        type: 'checking',
        balance: 125000.50,
        currency: 'USD',
        status: 'active'
      }
    ]
  };
  res.json(accountsData);
});

// Purchase API
app.post('/api/purchase/auto', (req, res) => {
  const { cost, model, vin, dealership } = req.body;
  // Mock purchase logic
  const remainingRevenue = 2500000.50 - cost;
  res.json({
    success: true,
    message: `Successfully purchased ${model}`,
    remainingRevenue: remainingRevenue,
    transactionId: `txn_${Date.now()}`
  });
});

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
  error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  info(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    info('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start the server
const server = app.listen(PORT, HOST, () => {
  info('========================================');
  info('🔱 GODDESS Application - Divine Server 🔱');
  info('========================================');
  info(`Environment: ${NODE_ENV}`);
  info(`Server running on: http://${HOST}:${PORT}`);
  info(`Health check: http://${HOST}:${PORT}/health`);
  info(`Started at: ${new Date().toISOString()}`);
  info('========================================');
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection at:', promise, 'reason:', reason);
});
