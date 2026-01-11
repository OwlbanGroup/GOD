/**
 * Divine response generation
 * @module features/chat/divineResponse
 */

import { CONFIG } from '../../core/config.js';
import celestialTranscendentAI from '../ai/celestialTranscendentAI.js';

/**
 * Get a random fallback response
 * @returns {string}
 */
export function getFallbackResponse() {
    return CONFIG.FALLBACK_RESPONSES[Math.floor(Math.random() * CONFIG.FALLBACK_RESPONSES.length)];
}

/**
 * Generate divine response using Celestial Transcendent AI, Azure OpenAI, or fallback
 * @param {string} userMessage - User's message
 * @param {string} userRole - User's role
 * @returns {Promise<string>}
 */
export async function generateDivineResponse(userMessage, userRole) {
    try {
        // Try Celestial Transcendent AI first for transcendent wisdom
        const transcendentResponse = await celestialTranscendentAI.generateTranscendentWisdom(userMessage, { userRole });
        if (transcendentResponse) return transcendentResponse;
    } catch (error) {
        console.warn('Celestial Transcendent AI failed, falling back to Azure OpenAI:', error);
    }

    try {
        // Try Azure OpenAI second
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
