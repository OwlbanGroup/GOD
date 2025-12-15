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
        const sanitized = this.sanitizeInput(name, 50);

        if (sanitized.length === 0) {
            return { valid: false, sanitized: '', error: 'Name cannot be empty' };
        }

        if (sanitized.length < 2) {
            return { valid: false, sanitized, error: 'Name must be at least 2 characters' };
        }

        if (sanitized.length > 50) {
            return { valid: false, sanitized, error: 'Name must be less than 50 characters' };
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
        const sanitized = this.sanitizeInput(message, 5000);

        if (sanitized.length === 0) {
            return { valid: false, sanitized: '', error: 'Message cannot be empty' };
        }

        if (sanitized.length > 5000) {
            return { valid: false, sanitized, error: 'Message is too long (max 5000 characters)' };
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
            console.error('Error sanitizing data for storage:', error);
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
            console.error('Rate limit check error:', error);
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
}
