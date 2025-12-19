import { info, error, warn, debug } from '../utils/loggerWrapper.js';

/**
 * Centralized Error Handling for GOD Project
 * Provides consistent error handling and user feedback
 */

class ErrorHandler {
    /**
     * Handles async operation errors with user-friendly messages
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     * @param {Function} fallbackFn - Optional fallback function to execute
     * @returns {any} - Result of fallback function or null
     */
    static async handleAsyncError(error, context, fallbackFn = null) {
        logger.error(`Error in ${context}:`, error);

        // Log to external service if available (Azure Application Insights, etc.)
        this.logError(error, context);

        // Show user-friendly message
        this.showUserMessage(this.getUserFriendlyMessage(error, context), 'error');

        // Execute fallback if provided
        if (fallbackFn && typeof fallbackFn === 'function') {
            try {
                return await fallbackFn();
            } catch (fallbackError) {
                logger.error(`Fallback error in ${context}:`, fallbackError);
                return null;
            }
        }

        return null;
    }

    /**
     * Wraps an async function with error handling
     * @param {Function} fn - The async function to wrap
     * @param {string} context - Context description
     * @param {Function} fallbackFn - Optional fallback function
     * @returns {Function} - Wrapped function with error handling
     */
    static wrapAsync(fn, context, fallbackFn = null) {
        return async function(...args) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                return ErrorHandler.handleAsyncError(error, context, fallbackFn);
            }
        };
    }

    /**
     * Gets a user-friendly error message
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     * @returns {string} - User-friendly message
     */
    static getUserFriendlyMessage(error, context) {
        const errorMessages = {
            'AI Response': 'Unable to generate AI response. Using divine fallback.',
            'Prayer Save': 'Prayer saved locally but cloud sync failed.',
            'User Registration': 'Registration encountered an issue. Please try again.',
            'Universe Optimization': 'Universe optimization failed. Using standard mode.',
            'Prayer Analysis': 'Prayer analysis unavailable. Your prayers are still heard.',
            'Prophecy Generation': 'Prophecy generation failed. Divine wisdom flows in mysterious ways.',
            'Cloud Sync': 'Cloud synchronization failed. Data saved locally.',
            'Encryption': 'Encryption failed. Message sent without encryption.',
            'Token Offering': 'Token offering failed. Please check your wallet connection.',
            'WebGL': 'Advanced graphics unavailable. Using standard rendering.',
            'Audio': 'Audio playback failed. Continuing in silent mode.',
        };

        return errorMessages[context] || `An error occurred in ${context}. Please try again.`;
    }

    /**
     * Shows a message to the user
     * @param {string} message - The message to display
     * @param {string} type - Message type: 'error', 'warning', 'info', 'success'
     */
    static showUserMessage(message, type = 'info') {
        // Check if addMessage function exists (from script.js)
        if (typeof addMessage === 'function') {
            addMessage(`[${type.toUpperCase()}] ${message}`, 'god');
        } else {
            logger.info(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Logs error to external service (placeholder for Azure Application Insights, etc.)
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     */
    static logError(error, context) {
        // Placeholder for external logging service
        const errorLog = {
            timestamp: new Date().toISOString(),
            context,
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Store in localStorage for debugging (limit to last 50 errors)
        try {
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errors.unshift(errorLog);
            if (errors.length > 50) {
                errors.length = 50;
            }
            localStorage.setItem('errorLog', JSON.stringify(errors));
        } catch (storageError) {
            logger.error('Failed to log error to localStorage:', storageError);
        }

        // TODO: Send to Azure Application Insights or other monitoring service
        // if (azureIntegrations?.isInitialized()) {
        //     azureIntegrations.logError(errorLog);
        // }
    }

    /**
     * Handles WebGL/Canvas errors gracefully
     * @param {Error} error - The error object
     * @returns {boolean} - True if fallback should be used
     */
    static handleWebGLError(error) {
        logger.error('WebGL Error:', error);
        this.showUserMessage('Advanced graphics unavailable. Using standard 2D rendering.', 'warning');
        return true; // Signal to use fallback
    }

    /**
     * Handles network/API errors
     * @param {Error} error - The error object
     * @param {string} apiName - Name of the API
     * @returns {Object} - Error response object
     */
    static handleNetworkError(error, apiName) {
        logger.error(`Network error with ${apiName}:`, error);
        
        let message = `Connection to ${apiName} failed.`;
        
        if (!navigator.onLine) {
            message = 'No internet connection. Working in offline mode.';
        } else if (error.message.includes('timeout')) {
            message = `${apiName} request timed out. Please try again.`;
        } else if (error.message.includes('401') || error.message.includes('403')) {
            message = `Authentication failed with ${apiName}. Please check your credentials.`;
        }

        this.showUserMessage(message, 'warning');

        return {
            success: false,
            error: message,
            offline: !navigator.onLine
        };
    }

    /**
     * Validates localStorage availability and handles quota errors
     * @returns {boolean} - True if localStorage is available
     */
    static checkLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.showUserMessage('Storage quota exceeded. Please clear some data.', 'error');
            } else {
                this.showUserMessage('Local storage unavailable. Data will not persist.', 'warning');
            }
            return false;
        }
    }

    /**
     * Safe localStorage setter with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} - True if successful
     */
    static safeLocalStorageSet(key, value) {
        if (!this.checkLocalStorage()) {
            return false;
        }

        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            this.handleAsyncError(error, 'Local Storage Write');
            return false;
        }
    }

    /**
     * Safe localStorage getter with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Retrieved value or default
     */
    static safeLocalStorageGet(key, defaultValue = null) {
        if (!this.checkLocalStorage()) {
            return defaultValue;
        }

        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return defaultValue;
            }

            // Try to parse as JSON, return as string if parsing fails
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            this.handleAsyncError(error, 'Local Storage Read');
            return defaultValue;
        }
    }

    /**
     * Handles validation errors
     * @param {Object} validationResult - Result from Sanitizer validation
     * @param {string} fieldName - Name of the field being validated
     * @returns {boolean} - True if valid
     */
    static handleValidationError(validationResult, fieldName) {
        if (!validationResult.valid) {
            this.showUserMessage(`${fieldName}: ${validationResult.error}`, 'error');
            return false;
        }
        return true;
    }

    /**
     * Creates a safe wrapper for event handlers
     * @param {Function} handler - The event handler function
     * @param {string} context - Context description
     * @returns {Function} - Wrapped handler
     */
    static wrapEventHandler(handler, context) {
        return function(event) {
            try {
                return handler.call(this, event);
            } catch (error) {
                ErrorHandler.handleAsyncError(error, context);
            }
        };
    }

    /**
     * Clears old error logs to prevent storage bloat
     */
    static clearOldErrorLogs() {
        try {
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            const recentErrors = errors.filter(error => {
                const errorTime = new Date(error.timestamp).getTime();
                return errorTime > oneDayAgo;
            });

            localStorage.setItem('errorLog', JSON.stringify(recentErrors));
        } catch (error) {
            logger.error('Failed to clear old error logs:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
