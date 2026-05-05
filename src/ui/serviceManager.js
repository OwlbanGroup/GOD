// ============================================================================
// GOD Project - Graceful Degradation & Service Manager
// ============================================================================

import { info, warn, error } from '../../../utils/loggerWrapper.js';

/**
 * Service Manager with Graceful Degradation
 * Handles service failures with user notifications and fallback options
 */

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.fallbacks = new Map();
        this.healthChecks = new Map();
        this.failedServices = new Set();
        this.notificationCallbacks = [];
    }

    /**
     * Register a service with optional fallback
     * @param {string} name - Service name
     * @param {Function} serviceFn - Service function
     * @param {Function} fallbackFn - Optional fallback function
     * @param {Object} options - Service options
     */
    register(name, serviceFn, fallbackFn = null, options = {}) {
        this.services.set(name, {
            fn: serviceFn,
            fallback: fallbackFn,
            options: {
                timeout: options.timeout || 10000,
                retries: options.retries || 3,
                retryDelay: options.retryDelay || 1000,
                critical: options.critical || false,
                ...options
            }
        });

        info(`Service registered: ${name}`);
    }

    /**
     * Register health check for a service
     * @param {string} name - Service name
     * @param {Function} healthCheckFn - Health check function
     */
    registerHealthCheck(name, healthCheckFn) {
        this.healthChecks.set(name, healthCheckFn);
    }

    /**
     * Execute service with graceful degradation
     * @param {string} name - Service name
     * @param {...any} args - Service arguments
     * @returns {Promise<any>}
     */
    async execute(name, ...args) {
        const service = this.services.get(name);
        
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }

        // Check if service recently failed
        if (this.failedServices.has(name)) {
            warn(`Service ${name} marked as failed, trying anyway`);
        }

        // Try main service
        try {
            const result = await this._executeWithTimeout(
                service.fn,
                service.options.timeout,
                ...args
            );
            
            // Success - clear failure state if was marked
            if (this.failedServices.has(name)) {
                this.failedServices.delete(name);
                this._notify({
                    type: 'service_recovered',
                    service: name,
                    message: `${name} service recovered`
                });
            }

            return result;

        } catch (err) {
            error(`Service ${name} failed:`, err);

            // Try fallback if available
            if (service.fallback) {
                warn(`Attempting fallback for ${name}`);
                try {
                    const fallbackResult = await service.fallback(...args);
                    
                    this._notify({
                        type: 'fallback_used',
                        service: name,
                        message: `Using fallback for ${name}`
                    });

                    return fallbackResult;

                } catch (fallbackErr) {
                    error(`Fallback for ${name} also failed:`, fallbackErr);
                }
            }

            // Mark service as failed if critical
            if (service.options.critical) {
                this.failedServices.add(name);
            }

            // Throw original error
            throw err;
        }
    }

    /**
     * Check service health
     * @param {string} name - Service name
     * @returns {Promise<boolean>}
     */
    async checkHealth(name) {
        const healthCheck = this.healthChecks.get(name);
        
        if (!healthCheck) {
            return !this.failedServices.has(name);
        }

        try {
            return await healthCheck();
        } catch {
            return false;
        }
    }

    /**
     * Get status of all services
     * @returns {Object}
     */
    getStatus() {
        const status = {
            services: {},
            failedCount: this.failedServices.size,
            timestamp: new Date().toISOString()
        };

        for (const [name, service] of this.services.entries()) {
            status.services[name] = {
                registered: true,
                failed: this.failedServices.has(name),
                hasFallback: !!service.fallback,
                critical: service.options.critical
            };
        }

        return status;
    }

    /**
     * Reset failed service state
     * @param {string} name - Service name
     */
    resetFailed(name) {
        this.failedServices.delete(name);
        info(`Service ${name} failure state reset`);
    }

    /**
     * Reset all failed services
     */
    resetAll() {
        this.failedServices.clear();
        info('All services failure state reset');
    }

    /**
     * Subscribe to service notifications
     * @param {Function} callback - Notification callback
     */
    subscribe(callback) {
        this.notificationCallbacks.push(callback);
    }

    /**
     * Notify subscribers
     * @param {Object} notification - Notification data
     */
    _notify(notification) {
        for (const callback of this.notificationCallbacks) {
            try {
                callback(notification);
            } catch (err) {
                error('Notification callback error:', err);
            }
        }
    }

    /**
     * Execute with timeout
     */
    async _executeWithTimeout(fn, timeout, ...args) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Service timeout'));
            }, timeout);

            Promise.resolve(fn(...args))
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(err => {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    }
}

/**
 * Toast Notifications for Graceful Degradation
 */
class ToastNotification {
    static show(message, type = 'info', duration = 5000) {
        // Check if toast container exists
        let container = document.getElementById('toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;

        // Type-specific styling
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            service: '#9C27B0'
        };
        
        toast.style.background = colors[type] || colors.info;
        
        // Add icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            service: '🔄'
        };
        
        toast.innerHTML = `${icons[type] || icons.info} ${message}`;

        container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    static showServiceFallback(serviceName) {
        this.show(
            `Service degraded: ${serviceName}. Using fallback mode.`,
            'service',
            8000
        );
    }

    static showServiceRecovered(serviceName) {
        this.show(
            `${serviceName} service recovered!`,
            'success',
            5000
        );
    }

    static showError(message) {
        this.show(message, 'error', 7000);
    }
}

// Add CSS animations if not present
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Export
const serviceManager = new ServiceManager();
export { serviceManager, ToastNotification };
export default serviceManager;
