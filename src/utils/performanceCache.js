// ============================================================================
// GOD Project - Performance Caching System (Redis/Memcached)
// ============================================================================

import { info, warn, error } from '../../../utils/loggerWrapper.js';

/**
 * Performance Caching System
 * Supports both in-memory and Redis backends
 */

// In-memory cache implementation
class InMemoryCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.ttls = new Map();
        this.hits = 0;
        this.misses = 0;
        this.options = {
            maxSize: options.maxSize || 1000,
            defaultTTL: options.defaultTTL || 3600000, // 1 hour
            cleanupInterval: options.cleanupInterval || 60000, // 1 minute
            ...options
        };
        
        this.cleanupTimer = null;
    }

    async init() {
        // Start cleanup timer
        this.cleanupTimer = setInterval(() => this._cleanup(), this.options.cleanupInterval);
        info('In-memory cache initialized');
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any|null}
     */
    async get(key) {
        const value = this.cache.get(key);
        const expiry = this.ttls.get(key);

        if (!value) {
            this.misses++;
            return null;
        }

        // Check expiry
        if (expiry && Date.now() > expiry) {
            this.cache.delete(key);
            this.ttls.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return value;
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - TTL in milliseconds (optional)
     */
    async set(key, value, ttl = null) {
        // Check max size
        if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.ttls.delete(firstKey);
        }

        this.cache.set(key, value);
        
        const expiry = ttl || this.options.defaultTTL;
        this.ttls.set(key, Date.now() + expiry);
        
        return true;
    }

    /**
     * Delete key from cache
     * @param {string} key - Cache key
     */
    async delete(key) {
        this.cache.delete(key);
        this.ttls.delete(key);
    }

    /**
     * Clear all cache
     */
    async clear() {
        this.cache.clear();
        this.ttls.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache stats
     */
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            type: 'in-memory'
        };
    }

    /**
     * Cleanup expired entries
     */
    _cleanup() {
        const now = Date.now();
        
        for (const [key, expiry] of this.ttls.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.ttls.delete(key);
            }
        }
    }

    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
        this.ttls.clear();
    }
}

/**
 * Redis Cache Implementation
 */
class RedisCache {
    constructor(redisClient, options = {}) {
        this.redis = redisClient;
        this.prefix = options.prefix || 'god:cache:';
        this.options = {
            defaultTTL: options.defaultTTL || 3600,
            ...options
        };
        
        this.hits = 0;
        this.misses = 0;
    }

    async init() {
        if (!this.redis) {
            throw new Error('Redis client not provided');
        }
        info('Redis cache initialized');
    }

    _getKey(key) {
        return `${this.prefix}${key}`;
    }

    async get(key) {
        try {
            const value = await this.redis.get(this._getKey(key));
            
            if (!value) {
                this.misses++;
                return null;
            }

            this.hits++;
            return JSON.parse(value);

        } catch (err) {
            error('Redis cache get error:', err);
            this.misses++;
            return null;
        }
    }

    async set(key, value, ttl = null) {
        try {
            const serialized = JSON.stringify(value);
            const expiry = ttl || this.options.defaultTTL;
            
            await this.redis.setex(this._getKey(key), expiry, serialized);
            return true;

        } catch (err) {
            error('Redis cache set error:', err);
            return false;
        }
    }

    async delete(key) {
        try {
            await this.redis.del(this._getKey(key));
        } catch (err) {
            error('Redis cache delete error:', err);
        }
    }

    async clear() {
        try {
            const keys = await this.redis.keys(`${this.prefix}*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            this.hits = 0;
            this.misses = 0;
        } catch (err) {
            error('Redis cache clear error:', err);
        }
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            type: 'redis'
        };
    }
}

/**
 * Main Cache Manager
 */
class CacheManager {
    constructor(options = {}) {
        this.options = {
            redisClient: options.redisClient || null,
            backend: options.backend || 'memory',
            defaultTTL: options.defaultTTL || 3600,
            maxSize: options.maxSize || 1000,
            ...options
        };

        this.cache = null;
    }

    /**
     * Initialize cache
     */
    async init() {
        if (this.options.backend === 'redis' && this.options.redisClient) {
            this.cache = new RedisCache(this.options.redisClient, {
                prefix: this.options.prefix,
                defaultTTL: this.options.defaultTTL
            });
        } else {
            this.cache = new InMemoryCache({
                maxSize: this.options.maxSize,
                defaultTTL: this.options.defaultTTL * 1000
            });
        }

        await this.cache.init();
        info(`Cache initialized: ${this.options.backend}`);
    }

    /**
     * Get or compute value
     * @param {string} key - Cache key
     * @param {Function} computeFn - Function to compute if not cached
     * @param {number} ttl - Optional TTL
     * @returns {Promise<any>}
     */
    async getOrCompute(key, computeFn, ttl = null) {
        // Try to get from cache
        let value = await this.cache.get(key);
        
        if (value !== null) {
            return value;
        }

        // Compute value
        value = await computeFn();

        // Store in cache
        if (value !== undefined && value !== null) {
            await this.cache.set(key, value, ttl);
        }

        return value;
    }

    /**
     * Get value
     */
    async get(key) {
        return await this.cache.get(key);
    }

    /**
     * Set value
     */
    async set(key, value, ttl) {
        return await this.cache.set(key, value, ttl);
    }

    /**
     * Delete value
     */
    async delete(key) {
        return await this.cache.delete(key);
    }

    /**
     * Clear all
     */
    async clear() {
        return await this.cache.clear();
    }

    /**
     * Get stats
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Express middleware for response caching
     */
    static expressMiddleware(cacheManager, options = {}) {
        return async (req, res, next) => {
            // Only GET requests
            if (req.method !== 'GET') {
                return next();
            }

            // Check for cache header
            const cacheKey = options.keyGenerator 
                ? options.keyGenerator(req) 
                : req.originalUrl;

            try {
                const cached = await cacheManager.get(cacheKey);
                
                if (cached) {
                    res.set('X-Cache', 'HIT');
                    return res.json(cached);
                }

                // Capture original json method
                const originalJson = res.json.bind(res);
                
                res.json = (data) => {
                    // Cache the response
                    cacheManager.set(cacheKey, data, options.ttl).catch(err => {
                        warn('Cache set error:', err);
                    });
                    
                    res.set('X-Cache', 'MISS');
                    return originalJson(data);
                };

                next();

            } catch (err) {
                warn('Cache middleware error:', err);
                next();
            }
        };
    }

    destroy() {
        this.cache?.destroy?.();
    }
}

// Export
export { CacheManager, InMemoryCache, RedisCache };
export default CacheManager;
