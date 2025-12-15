/**
 * Divine response generation
 * @module features/chat/divineResponse
 */

import { CONFIG } from '../../core/config.js';

/**
 * Get a random fallback response
 * @returns {string}
 */
export function getFallbackResponse() {
    return CONFIG.FALLBACK_RESPONSES[Math.floor(Math.random() * CONFIG.FALLBACK_RESPONSES.length)];
}

/**
 * Generate divine response using Azure OpenAI or fallback
 * @param {string} userMessage - User's message
 * @param {string} userRole - User's role
 * @returns {Promise<string>}
 */
export async function generateDivineResponse(userMessage, userRole) {
    try {
        // Try Azure OpenAI first
        if (azureIntegrations?.isInitialized()) {
            const response = await azureIntegrations.generateDivineResponse(userMessage, userRole);
            if (response) return response;
        }
    } catch (error) {
        await ErrorHandler.handleAsyncError(error, 'AI Response', () => getFallbackResponse());
    }

    // Fallback to static responses
    return getFallbackResponse();
}
