// ============================================================================
// GOD Project - Input Validators
// ============================================================================

import { Sanitizer } from '../../utils/sanitizer.js';
import CONFIG from '../core/config.js';

class Validators {
    static validateName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: 'Name is required' };
        }

        const trimmed = name.trim();
        if (trimmed.length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters long' };
        }

        if (trimmed.length > 50) {
            return { valid: false, error: 'Name must be less than 50 characters long' };
        }

        const sanitized = Sanitizer.sanitizeInput(trimmed);
        if (sanitized !== trimmed) {
            return { valid: false, error: 'Name contains invalid characters' };
        }

        return { valid: true, sanitized: sanitized };
    }

    static validateRole(role) {
        const validRoles = ['believer', 'priest', 'prophet', 'saint', 'angel', 'archangel'];
        if (!role || !validRoles.includes(role)) {
            return { valid: false, error: 'Please select a valid role' };
        }

        return { valid: true, sanitized: role };
    }

    static validateMessage(message) {
        if (!message || typeof message !== 'string') {
            return { valid: false, error: 'Message is required' };
        }

        const trimmed = message.trim();
        if (trimmed.length < 1) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (trimmed.length > 1000) {
            return { valid: false, error: 'Message must be less than 1000 characters' };
        }

        const sanitized = Sanitizer.sanitizeInput(trimmed);
        return { valid: true, sanitized: sanitized };
    }

    static validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseFloat(value);
        if (isNaN(num)) {
            return { valid: false, error: 'Must be a valid number' };
        }

        if (num < min) {
            return { valid: false, error: `Must be at least ${min}` };
        }

        if (num > max) {
            return { valid: false, error: `Must be at most ${max}` };
        }

        return { valid: true, value: num };
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return { valid: false, error: 'Please enter a valid email address' };
        }

        return { valid: true, sanitized: email.toLowerCase().trim() };
    }

    static checkRateLimit(action, maxRequests, windowMs) {
        const key = `ratelimit_${action}`;
        const now = Date.now();

        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        attempts = attempts.filter(timestamp => now - timestamp < windowMs);

        if (attempts.length >= maxRequests) {
            return false;
        }

        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        return true;
    }

    static validateOffering(amount) {
        const numValidation = this.validateNumber(amount, 0.01, 1000000);
        if (!numValidation.valid) {
            return numValidation;
        }

        // Additional validation for GOD tokens
        if (numValidation.value < 1) {
            return { valid: false, error: 'Minimum offering is 1 GOD token' };
        }

        return numValidation;
    }
}

export default Validators;
