// ============================================================================
// GOD Project - Server-Side Rate Limiting with Redis
// ============================================================================

import { info, warn, error } from '../../utils/loggerWrapper.js';

/**
 * Server-Side Rate Limiter with Redis Backing
 * Provides distributed rate limiting across multiple server instances
 */

// In-memory fallback when Redis is not available
class InMemoryRateLimitStore {
    constructor() {
        this.store = new Map();
        this.cleanupInterval = null;
    }

    async init() {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
        info('In-memory rate limit store initialized');
    }

    async increment(key, windowMs, maxAttempts) {
        const now = Date.now();
        const record = this.store.get(key);

        if (!record) {
            // First request from this key
            this.store.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now,
                windowStart: now
            });
            return {
                allowed: true,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs
            };
        }

        // Check if window has expired
        if (now - record.windowStart > windowMs) {
            // Reset window
            this.store.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now,
                windowStart: now
            });
            return {
                allowed: true,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs
            };
        }

        // Check if limit exceeded
        if (record.count >= maxAttempts) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: record.windowStart + windowMs
            };
        }

        // Increment count
        record.count += 1;
        record.lastRequest = now;
        this.store.set(key, record);

        return {
            allowed: true,
            remaining: maxAttempts - record.count,
            resetTime: record.windowStart + windowMs
        };
    }

    async get(key) {
        return this.store.get(key);
    }

    async reset(key) {
        this.store.delete(key);
    }

    async resetAll() {
        this.store.clear();
    }

    cleanup() {
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minute default

        for (const [key, record] of this.store.entries()) {
            if (now - record.lastRequest > windowMs) {
                this.store.delete(key);
            }
        }
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

/**
 * Redis Rate Limiter Store
 * Uses Redis for distributed rate limiting
 */
class RedisRateLimitStore {
    constructor(redisClient) {
        this.redis = redisClient;
        this.prefix = 'rl:';
    }

    async init() {
        if (!this.redis) {
            throw new Error('Redis client not provided');
        }
        info('Redis rate limit store initialized');
    }

    _getKey(key) {
        return `${this.prefix}${key}`;
    }

    async increment(key, windowMs, maxAttempts) {
        const redisKey = this._getKey(key);
        const now = Date.now();

        try {
            // Use sliding window with Redis
            const multi = this.redis.multi();

            // Remove old entries outside the window
            const windowStart = now - windowMs;
            multi.zremrangebyscore(redisKey, 0, windowStart);

            // Count current requests in window
            multi.zcard(redisKey);

            // Execute
            const results = await new Promise((resolve, reject) => {
                multi.exec((err, replies) => {
                    if (err) reject(err);
                    else resolve(replies);
                });
            });

            const currentCount = results[1];

            if (currentCount >= maxAttempts) {
                // Get expiration time of oldest request
                const oldest = await this.redis.zrange(redisKey, 0, 0, 'WITHSCORES');
                const resetTime = oldest.length > 1 
                    ? Math.ceil(oldest[1]) + windowMs 
                    : now + windowMs;

                return {
                    allowed: false,
                    remaining: 0,
                    resetTime
                };
            }

            // Add new request to window
            await this.redis.zadd(redisKey, now, `${now}:${Math.random()}`);

            // Set expiry
            await this.redis.expire(redisKey, Math.ceil(windowMs / 1000));

            return {
                allowed: true,
                remaining: maxAttempts - currentCount - 1,
                resetTime: now + windowMs
            };

        } catch (err) {
            error('Redis rate limit error:', err);
            // Fallback to allow on error
            return {
                allowed: true,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs
            };
        }
    }

    async get(key) {
        try {
            const count = await this.redis.zcard(this._getKey(key));
            return { count };
        } catch {
            return null;
        }
    }

    async reset(key) {
        await this.redis.del(this._getKey(key));
    }

    async resetAll() {
        const keys = await this.redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}

/**
 * Main Rate Limiter Class
 * Supports both in-memory and Redis backends
 */
class ServerRateLimiter {
    constructor(options = {}) {
        this.options = {
            windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
            maxAttempts: options.maxAttempts || 100,
            redisClient: options.redisClient || null,
            ...options
        };

        this.store = null;
        this.usingRedis = false;
    }

    /**
     * Initialize the rate limiter
     */
    async init() {
        if (this.options.redisClient) {
            try {
                this.store = new RedisRateLimitStore(this.options.redisClient);
                await this.store.init();
                this.usingRedis = true;
                info('Rate limiter initialized with Redis');
            } catch (err) {
                warn('Redis unavailable, falling back to in-memory:', err.message);
                this.store = new InMemoryRateLimitStore();
                await this.store.init();
            }
        } else {
            this.store = new InMemoryRateLimitStore();
            await this.store.init();
            info('Rate limiter initialized with in-memory store');
        }
    }

    /**
     * Check if action is allowed
     * @param {string} identifier - Unique identifier (IP, user ID, API key, etc.)
     * @param {number} maxAttempts - Optional override
     * @param {number} windowMs - Optional override
     * @returns {Object} - {allowed: boolean, remaining: number, resetTime: number}
     */
    async checkLimit(identifier, maxAttempts, windowMs) {
        const max = maxAttempts || this.options.maxAttempts;
        const window = windowMs || this.options.windowMs;

        if (!this.store) {
            await this.init();
        }

        return await this.store.increment(identifier, window, max);
    }

    /**
     * Middleware for Express.js
     * @param {Object} options - Middleware options
     * @returns {Function} - Express middleware
     */
    static expressMiddleware(options = {}) {
        const limiter = new ServerRateLimiter(options);

        return async (req, res, next) => {
            try {
                await limiter.init();

                const identifier = options.keyGenerator 
                    ? options.keyGenerator(req) 
                    : req.ip || req.connection.remoteAddress;

                const result = await limiter.checkLimit(
                    identifier,
                    options.maxAttempts,
                    options.windowMs
                );

                // Set rate limit headers
                res.set({
                    'X-RateLimit-Limit': options.maxAttempts || 100,
                    'X-RateLimit-Remaining': result.remaining,
                    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000)
                });

                if (!result.allowed) {
                    res.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
                    return res.status(429).json({
                        error: 'Too Many Requests',
                        message: 'Rate limit exceeded. Please try again later.',
                        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
                    });
                }

                next();
            } catch (err) {
                // Allow on error to not block requests
                warn('Rate limiter error:', err);
                next();
            }
        };
    }

    /**
     * Reset limit for a specific identifier
     */
    async reset(identifier) {
        if (this.store) {
            await this.store.reset(identifier);
        }
    }

    /**
     * Reset all limits
     */
    async resetAll() {
        if (this.store) {
            await this.store.resetAll();
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            usingRedis: this.usingRedis,
            storeType: this.usingRedis ? 'Redis' : 'In-Memory',
            windowMs: this.options.windowMs,
            maxAttempts: this.options.maxAttempts
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.store && this.store.destroy) {
            this.store.destroy();
        }
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServerRateLimiter, InMemoryRateLimitStore, RedisRateLimitStore };
}
