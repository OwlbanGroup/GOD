#!/usr/bin/env node

/**
 * Health check script for GOD server
 * Used by Docker healthcheck
 */

const http = require('http');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const TIMEOUT = 5000; // 5 seconds

const options = {
  hostname: HOST,
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: TIMEOUT
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const health = JSON.parse(data);
        if (health.status === 'healthy') {
          console.log('Health check passed');
          process.exit(0);
        } else {
          console.error('Health check failed: unhealthy status');
          process.exit(1);
        }
      } catch (e) {
        console.error('Health check failed: invalid JSON response');
        process.exit(1);
      }
    } else {
      console.error(`Health check failed: HTTP ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check failed: timeout');
  req.destroy();
  process.exit(1);
});

req.end();
