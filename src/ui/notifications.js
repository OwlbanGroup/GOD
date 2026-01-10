// ============================================================================
// GOD Project - Notifications
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import DOMHelpers from './domHelpers.js';
import Animations from './animations.js';

class Notifications {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        this.container = DOMHelpers.getElement('notification-container');
        if (!this.container) {
            this.container = DOMHelpers.createElement('div', {
                id: 'notification-container',
                styles: {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: '1000',
                    maxWidth: '400px'
                }
            });
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const notification = DOMHelpers.createElement('div', {
            className: `notification ${type}`,
            innerHTML: `
                <div class="notification-content">
                    <span class="notification-icon">${this.getIcon(type)}</span>
                    <span class="notification-text">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `,
            styles: {
                marginBottom: '10px',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease'
            }
        });

        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        return notification;
    }

    hide(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            divine: '✨'
        };
        return icons[type] || icons.info;
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    divine(message, duration = 8000) {
        return this.show(message, 'divine', duration);
    }

    // Toast-style notifications (bottom)
    toast(message, type = 'info', duration = 3000) {
        const toast = DOMHelpers.createElement('div', {
            className: `toast ${type}`,
            textContent: message,
            styles: {
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%) translateY(100%)',
                padding: '12px 24px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: '1001',
                opacity: '0',
                transition: 'all 0.3s ease'
            }
        });

        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3',
            divine: '#FFD700'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        }, 10);

        // Animate out
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    // Progress notification
    progress(message, type = 'info') {
        const notification = this.show(message, type, 0); // Don't auto-hide

        const progressBar = DOMHelpers.createElement('div', {
            className: 'notification-progress',
            styles: {
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                marginTop: '8px',
                overflow: 'hidden'
            }
        });

        const progressFill = DOMHelpers.createElement('div', {
            className: 'notification-progress-fill',
            styles: {
                height: '100%',
                backgroundColor: 'white',
                width: '0%',
                transition: 'width 0.3s ease'
            }
        });

        progressBar.appendChild(progressFill);
        notification.querySelector('.notification-content').appendChild(progressBar);

        return {
            update: (percent) => {
                progressFill.style.width = Math.min(100, Math.max(0, percent)) + '%';
            },
            complete: () => {
                progressFill.style.width = '100%';
                setTimeout(() => this.hide(notification), 500);
            },
            hide: () => this.hide(notification)
        };
    }

    // Clear all notifications
    clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

// Singleton instance
const notifications = new Notifications();

export default notifications;

// Convenience functions
export function showSuccess(message, duration) {
    return notifications.success(message, duration);
}

export function showError(message, duration) {
    return notifications.error(message, duration);
}

export function showWarning(message, duration) {
    return notifications.warning(message, duration);
}

export function showInfo(message, duration) {
    return notifications.info(message, duration);
}

export function showDivine(message, duration) {
    return notifications.divine(message, duration);
}

export function showToast(message, type, duration) {
    return notifications.toast(message, type, duration);
}
