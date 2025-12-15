/**
 * Message handling and display
 * @module features/chat/messageHandler
 */

/**
 * Adds a message to the chat with proper sanitization
 * @param {string} text - The message text
 * @param {string} sender - 'user' or 'god'
 */
export function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Sanitize the text to prevent XSS
    messageDiv.textContent = Sanitizer.escapeHtml(text);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
