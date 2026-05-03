import { info, error, warn, debug } from '../utils/loggerWrapper.js';

/**
 * Input Sanitization Utilities for GOD Project
 * Prevents XSS attacks and ensures data integrity
 */

class Sanitizer {
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - The text to sanitize
     * @returns {string} - Sanitized text safe for HTML display
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') {
            return '';
        }

        const map = {
            '&': '&amp;',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#x27;',
            '/': '&#x2F;',
        };

        return text.replace(/[&<>"'/]/g, (char) => map[char]);
    }

    /**
     * Sanitizes user input for safe storage and processing
     * @param {string} input - The input to sanitize
     * @param {number} maxLength - Maximum allowed length (default: 1000)
     * @returns {string} - Sanitized input
     */
    static sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }

        // Trim whitespace
        let sanitized = input.trim();

        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');

        // Remove control characters except newlines and tabs
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        return sanitized;
    }

    /**
     * Validates and sanitizes a name input
     * @param {string} name - The name to validate
     * @returns {Object} - {valid: boolean, sanitized: string, error: string}
     */
    static validateName(name) {
        // First check length before sanitization to catch too-long names
        if (typeof name === 'string' && name.trim().length > 50) {
            return { valid: false, sanitized: '', error: 'Name must be less than 50 characters' };
        }

        const sanitized = this.sanitizeInput(name, 50);

        if (sanitized.length === 0) {
            return { valid: false, sanitized: '', error: 'Name cannot be empty' };
        }

        if (sanitized.length < 2) {
            return { valid: false, sanitized, error: 'Name must be at least 2 characters' };
        }

        // Allow letters, numbers, spaces, hyphens, and underscores
        const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
        if (!nameRegex.test(sanitized)) {
            return { valid: false, sanitized, error: 'Name contains invalid characters' };
        }

        return { valid: true, sanitized, error: null };
    }

    /**
     * Validates and sanitizes a message/prayer input
     * @param {string} message - The message to validate
     * @returns {Object} - {valid: boolean, sanitized: string, error: string}
     */
    static validateMessage(message) {
        // First check length before sanitization to catch too-long messages
        if (typeof message === 'string' && message.trim().length > 5000) {
            return { valid: false, sanitized: '', error: 'Message is too long (max 5000 characters)' };
        }

        const sanitized = this.sanitizeInput(message, 5000);

        if (sanitized.length === 0) {
            return { valid: false, sanitized: '', error: 'Message cannot be empty' };
        }

        return { valid: true, sanitized, error: null };
    }

    /**
     * Validates a role selection
     * @param {string} role - The role to validate
     * @returns {Object} - {valid: boolean, sanitized: string, error: string}
     */
    static validateRole(role) {
        const validRoles = ['believer', 'angel', 'prophet'];
        const sanitized = this.sanitizeInput(role, 20).toLowerCase();

        if (!validRoles.includes(sanitized)) {
            return { valid: false, sanitized: '', error: 'Invalid role selected' };
        }

        return { valid: true, sanitized, error: null };
    }

    /**
     * Sanitizes data for localStorage storage
     * @param {any} data - The data to sanitize
     * @returns {string} - Sanitized JSON string
     */
    static sanitizeForStorage(data) {
        try {
            // Convert to JSON and back to remove any functions or undefined values
            const cleaned = JSON.parse(JSON.stringify(data));
            return JSON.stringify(cleaned);
        } catch (error) {
            error('Error sanitizing data for storage:', error);
            return '{}';
        }
    }

    /**
     * Rate limiting helper - checks if action is allowed
     * @param {string} key - Unique key for the action
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} - True if action is allowed
     */
    static checkRateLimit(key, maxAttempts = 10, windowMs = 60000) {
        const now = Date.now();
        const storageKey = `rateLimit_${key}`;
        
        try {
            const data = localStorage.getItem(storageKey);
            const attempts = data ? JSON.parse(data) : [];

            // Remove old attempts outside the time window
            const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

            if (recentAttempts.length >= maxAttempts) {
                return false;
            }

            // Add current attempt
            recentAttempts.push(now);
            localStorage.setItem(storageKey, JSON.stringify(recentAttempts));

            return true;
        } catch (error) {
            error('Rate limit check error:', error);
            return true; // Allow on error to not block legitimate users
        }
    }

/**
     * Validates a number input
     * @param {any} value - The value to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {Object} - {valid: boolean, value: number, error: string}
     */
    static validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseFloat(value);

        if (isNaN(num)) {
            return { valid: false, value: 0, error: 'Invalid number' };
        }

        if (num < min) {
            return { valid: false, value: num, error: `Number must be at least ${min}` };
        }

        if (num > max) {
            return { valid: false, value: num, error: `Number must be at most ${max}` };
        }

        return { valid: true, value: num, error: null };
    }

    /**
     * Calculate password entropy
     * @param {string} password - The password to calculate entropy for
     * @returns {number} - Entropy in bits
     */
    static calculateEntropy(password) {
        if (!password || password.length === 0) {
            return 0;
        }

        let charsetSize = 0;

        // Check character sets present
        if (/[a-z]/.test(password)) charsetSize += 26;         // lowercase
        if (/[A-Z]/.test(password)) charsetSize += 26;         // uppercase
        if (/[0-9]/.test(password)) charsetSize += 10;        // digits
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32; // special chars

        if (charsetSize === 0) return 0;

        // Entropy = length * log2(charsetSize)
        return Math.floor(password.length * Math.log2(charsetSize));
    }

    /**
     * Validates password complexity and entropy
     * @param {string} password - The password to validate
     * @returns {Object} - {valid: boolean, error: string, entropy: number, score: number}
     */
    static validatePassword(password) {
        const errors = [];
        const warnings = [];
        let score = 0;

        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required', entropy: 0, score: 0 };
        }

        // Minimum length check
        if (password.length < 12) {
            errors.push('Password must be at least 12 characters long');
        } else {
            score += 20;
        }

        if (password.length >= 16) {
            score += 10;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else {
            score += 15;
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else {
            score += 15;
        }

        // Number check
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        } else {
            score += 15;
        }

        // Special character check
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else {
            score += 15;
        }

        // Calculate entropy
        const entropy = this.calculateEntropy(password);

        // Minimum entropy requirement (40 bits is considered strong)
        if (entropy < 40) {
            errors.push(`Password entropy too low (${entropy} bits). Need at least 40 bits.`);
        } else {
            score += 10;
        }

        // Additional strength checks
        if (entropy >= 60) {
            score += 10;
            warnings.push('Excellent entropy');
        } else if (entropy >= 50) {
            warnings.push('Good entropy');
        }

        // Check for common patterns to avoid
        const commonPatterns = [
            /123456/i, /password/i, /qwerty/i, /abc/i, /111/i, /000/,
            /admin/i, /user/i, /love/i, /god/i
        ];
        
        for (const pattern of commonPatterns) {
            if (pattern.test(password)) {
                warnings.push('Avoid common words or sequences');
                score -= 10;
                break;
            }
        }

        // Check for repeated characters
        if (/(.)\1{2,}/.test(password)) {
            warnings.push('Avoid repeated characters');
            score -= 5;
        }

        const isValid = errors.length === 0;
        
        return {
            valid: isValid,
            error: isValid ? null : errors.join('; '),
            entropy: entropy,
            score: Math.max(0, Math.min(100, score)),
            warnings: warnings,
            strength: entropy >= 60 ? 'strong' : entropy >= 40 ? 'medium' : 'weak'
        };
    }

    /**
     * Server-side rate limit check (for use with session/IP tracking)
     * @param {string} ip - Client IP address
     * @param {Map} rateLimitStore - In-memory store for rate limiting
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {Object} - {allowed: boolean, remaining: number, resetTime: number}
     */
    static checkServerRateLimit(ip, rateLimitStore, maxAttempts = 10, windowMs = 60000) {
        if (!ip || !rateLimitStore) {
            return { allowed: true, remaining: maxAttempts, resetTime: 0 };
        }

        const now = Date.now();
        const clientData = rateLimitStore.get(ip);
        
        if (!clientData) {
            // First request from this IP
            rateLimitStore.set(ip, {
                attempts: 1,
                firstAttempt: now,
                lastAttempt: now
            });
            return {
                allowed: true,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs
            };
        }

        // Clean old entries outside the window
        if (now - clientData.lastAttempt > windowMs) {
            // Window expired, reset
            rateLimitStore.set(ip, {
                attempts: 1,
                firstAttempt: now,
                lastAttempt: now
            });
            return {
                allowed: true,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs
            };
        }

        // Check if limit exceeded
        if (clientData.attempts >= maxAttempts) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: clientData.firstAttempt + windowMs
            };
        }

        // Increment attempts
        clientData.attempts += 1;
        clientData.lastAttempt = now;
        rateLimitStore.set(ip, clientData);

        return {
            allowed: true,
            remaining: maxAttempts - clientData.attempts,
            resetTime: clientData.firstAttempt + windowMs
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
}
