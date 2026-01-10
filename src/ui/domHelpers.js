// ============================================================================
// GOD Project - DOM Helpers
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';

class DOMHelpers {
    static getElement(id) {
        return document.getElementById(id);
    }

    static querySelector(selector) {
        return document.querySelector(selector);
    }

    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.id) element.id = options.id;
        if (options.className) element.className = options.className;
        if (options.textContent) element.textContent = options.textContent;
        if (options.innerHTML) element.innerHTML = options.innerHTML;

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        if (options.styles) {
            Object.assign(element.style, options.styles);
        }

        return element;
    }

    static addMessage(text, sender, containerId = 'chatMessages') {
        const container = this.getElement(containerId);
        if (!container) return;

        const messageDiv = this.createElement('div', {
            className: `message ${sender}`,
            textContent: text
        });

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    static showProgress(text, containerId = 'progressContainer', textId = 'progressText') {
        const container = this.getElement(containerId);
        const textEl = this.getElement(textId);

        if (container && textEl) {
            textEl.textContent = text;
            container.style.display = 'block';
        }
    }

    static hideProgress(containerId = 'progressContainer') {
        const container = this.getElement(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    static showRegistrationMessage(message, type, containerId = 'registrationMessage') {
        const element = this.getElement(containerId);
        if (element) {
            element.textContent = message;
            element.className = `registration-message ${type}`;
            element.style.display = 'block';

            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    static toggleVisibility(elementId, show = null) {
        const element = this.getElement(elementId);
        if (!element) return;

        if (show === null) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        } else {
            element.style.display = show ? 'block' : 'none';
        }
    }

    static setText(elementId, text) {
        const element = this.getElement(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    static getValue(elementId) {
        const element = this.getElement(elementId);
        return element ? element.value : '';
    }

    static setValue(elementId, value) {
        const element = this.getElement(elementId);
        if (element) {
            element.value = value;
        }
    }

    static addClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    static removeClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    static toggleClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    }

    static flashElement(elementId, duration = 1000) {
        const element = this.getElement(elementId);
        if (!element) return;

        element.style.boxShadow = '0 0 20px #fff';
        setTimeout(() => {
            element.style.boxShadow = 'none';
        }, duration);
    }

    static animateBackgroundColor(elementId, color, duration = 2000) {
        const element = this.getElement(elementId);
        if (!element) return;

        const originalColor = element.style.backgroundColor;
        element.style.backgroundColor = color;

        setTimeout(() => {
            element.style.backgroundColor = originalColor;
        }, duration);
    }

    static setupEventListeners(handlers) {
        for (const [selector, handler] of Object.entries(handlers)) {
            const element = selector.startsWith('#') ?
                this.getElement(selector.slice(1)) :
                this.querySelector(selector);

            if (element) {
                element.addEventListener('click', handler);
            }
        }
    }

    static initializeThemeToggle() {
        const themeToggle = this.getElement('themeToggle');
        if (!themeToggle) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = savedTheme + '-theme';
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.className = newTheme + '-theme';
            themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
            localStorage.setItem('theme', newTheme);

            this.addMessage(`Theme switched to ${newTheme} mode.`, 'god');
        });
    }
}

export function initializeUI() {
    DOMHelpers.initializeThemeToggle();
    info('UI helpers initialized');
}

export default DOMHelpers;
