/**
 * User notification management
 * @module ui/notifications
 */

/**
 * Show registration message
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
export function showRegistrationMessage(message, type) {
    const messageDiv = document.getElementById('registrationMessage');
    if (messageDiv) {
        messageDiv.textContent = Sanitizer.escapeHtml(message);
        messageDiv.className = `registration-message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
