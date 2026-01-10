// ============================================================================
// GOD Project - Main Entry Point (Phase 4: Modular Architecture)
// ============================================================================

import { info, error, warn, debug } from '../utils/loggerWrapper.js';

// Import core modules
import app from './core/app.js';

// Import global utilities (keeping some for backward compatibility)
import Sanitizer from '../utils/sanitizer.js';
import ErrorHandler from '../utils/errorHandler.js';

// Make some utilities globally available for backward compatibility
window.Sanitizer = Sanitizer;
window.ErrorHandler = ErrorHandler;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        info('Starting GOD Application with modular architecture...');
        await app.initialize();
        info('GOD Application fully loaded and operational');
    } catch (err) {
        error('Failed to start GOD Application:', err);
        // Fallback error display
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:red;color:white;padding:20px;border-radius:5px;z-index:10000;';
        errorDiv.textContent = 'Failed to load GOD Application. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});

// Export for potential external use
export default app;
