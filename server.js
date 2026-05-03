import { info, error, warn, debug } from './utils/loggerWrapper.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// Server-Side Rate Limiting
// ============================================================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

/**
 * Get client IP address from request
 * @param {object} req - Express request object
 * @returns {string} - Client IP address
 */
function getClientIp(req) {
    // Check for forwarded header (when behind proxy)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Server-side rate limiting middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function rateLimitMiddleware(req, res, next) {
    const clientIp = getClientIp(req);
    const now = Date.now();
    
    // Get or initialize client data
    let clientData = rateLimitStore.get(clientIp);
    
    if (!clientData) {
        // First request from this IP
        clientData = {
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now
        };
        rateLimitStore.set(clientIp, clientData);
        res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - 1);
        return next();
    }
    
    // Clean old entries outside the window
    if (now - clientData.lastAttempt > RATE_LIMIT_WINDOW_MS) {
        // Window expired, reset
        clientData = {
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now
        };
        rateLimitStore.set(clientIp, clientData);
        res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - 1);
        return next();
    }
    
    // Check if limit exceeded
    if (clientData.attempts >= RATE_LIMIT_MAX_REQUESTS) {
        const resetTime = Math.ceil((clientData.firstAttempt + RATE_LIMIT_WINDOW_MS - now) / 1000);
        res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', resetTime);
        
        warn(`Rate limit exceeded for IP: ${clientIp}`);
        
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: resetTime,
            limit: RATE_LIMIT_MAX_REQUESTS,
            window: '1 minute'
        });
    }
    
    // Increment attempts
    clientData.attempts += 1;
    clientData.lastAttempt = now;
    rateLimitStore.set(clientIp, clientData);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - clientData.attempts);
    
    next();
}

// Periodic cleanup of old rate limit entries
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        if (now - data.lastAttempt > RATE_LIMIT_WINDOW_MS) {
            rateLimitStore.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes

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

// Contact endpoint for divine consultations (with rate limiting)
app.post('/contact', rateLimitMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Import the response generator
    const { generateDivineResponse } = await import('./src/features/chat/responseGenerator.js');

    // Generate divine response
    const response = await generateDivineResponse(message);

    res.json({
      response: response,
      user_message: message
    });
  } catch (error) {
    error('Error in /contact endpoint:', error);
    res.status(500).json({
      error: 'Failed to generate divine response',
      response: 'The divine connection is experiencing technical difficulties. Please try again.',
      user_message: req.body?.message || ''
    });
  }
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// Serve OSCAR-BROOME-REVENUE executive portal
app.use('/revenue', express.static(path.join(__dirname, 'OSCAR-BROOME-REVENUE/executive-portal'), {
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
  httpServer.close(() => {
    info('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: NODE_ENV === 'development' ? "*" : false,
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  info(`Client connected: ${socket.id}`);

  // Handle prayer sharing
  socket.on('share-prayer', (data) => {
    const prayerData = {
      id: `prayer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: data.user || 'Anonymous',
      message: data.message,
      timestamp: new Date().toISOString(),
      isPublic: data.isPublic !== false,
      reactions: { blessings: 0, amens: 0 }
    };

    // Broadcast to all connected clients if public
    if (prayerData.isPublic) {
      io.emit('new-prayer', prayerData);
      info(`Public prayer shared by ${prayerData.user}: ${prayerData.message.substring(0, 50)}...`);
    } else {
      // For private prayers, only send back to sender for now
      socket.emit('prayer-submitted', prayerData);
    }
  });

  // Handle prayer reactions
  socket.on('react-prayer', (data) => {
    const { prayerId, reactionType } = data;
    if (reactionType === 'blessing' || reactionType === 'amen') {
      io.emit('prayer-reaction', { prayerId, reactionType, socketId: socket.id });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    info(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
httpServer.listen(PORT, HOST, () => {
  info('========================================');
  info('🔱 GODDESS Application - Divine Server 🔱');
  info('========================================');
  info(`Environment: ${NODE_ENV}`);
  info(`Server running on: http://${HOST}:${PORT}`);
  info(`Health check: http://${HOST}:${PORT}/health`);
  info(`Real-time features: ENABLED (Socket.IO)`);
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
