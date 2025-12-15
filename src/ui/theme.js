/**
 * Theme management
 * @module ui/theme
 */

import { addMessage } from '../features/chat/messageHandler.js';

/**
 * Initialize theme toggle functionality
 */
export function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (!themeToggle) return;

    // Load saved theme
    const savedTheme = ErrorHandler.safeLocalStorageGet('theme', 'dark');
    body.className = savedTheme + '-theme';
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', ErrorHandler.wrapEventHandler(function() {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.className = newTheme + '-theme';
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        ErrorHandler.safeLocalStorageSet('theme', newTheme);

        addMessage(`Theme switched to ${newTheme} mode.`, 'god');
    }, 'Theme Toggle'));
}
