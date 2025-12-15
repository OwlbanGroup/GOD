/**
 * Progress indicator management
 * @module ui/progress
 */

/**
 * Show progress indicator with message
 * @param {string} text - Progress message
 */
export function showProgress(text) {
    const container = document.getElementById('progressContainer');
    const textEl = document.getElementById('progressText');
    if (container && textEl) {
        textEl.textContent = Sanitizer.escapeHtml(text);
        container.style.display = 'block';
    }
}

/**
 * Hide progress indicator
 */
export function hideProgress() {
    const container = document.getElementById('progressContainer');
    if (container) {
        container.style.display = 'none';
    }
}
