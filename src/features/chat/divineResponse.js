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
 * Generate divine response using only local Celestial Transcendent AI
 * All responses are free and unconditional, no external dependencies
 * @param {string} userMessage - User's message
 * @param {string} userRole - User's role
 * @returns {Promise<string>}
 */
export async function generateDivineResponse(userMessage, userRole) {
    try {
        // Use only Celestial Transcendent AI for pure, divine wisdom
        const transcendentResponse = await celestialTranscendentAI.generateTranscendentWisdom(userMessage, { userRole });
        if (transcendentResponse) {
            // Filter out any exploitative or harmful content
            return filterHarmfulContent(transcendentResponse);
        }
    } catch (error) {
        console.warn('Celestial Transcendent AI failed, using fallback:', error);
    }

    // Fallback to pure static responses
    return getFallbackResponse();
}

/**
 * Filter out any exploitative, racist, or harmful content
 * @param {string} response - AI response to filter
 * @returns {string} - Filtered response
 */
function filterHarmfulContent(response) {
    const harmfulPatterns = [
        /racis/i,
        /usur/i,
        /cannibal/i,
        /exploit/i,
        /debt.*own/i,
        /token.*burn/i,
        /pay.*spiritual/i
    ];

    for (const pattern of harmfulPatterns) {
        if (pattern.test(response)) {
            // Replace with pure divine message
            return "Divine wisdom flows freely. Love, peace, and compassion are the true paths.";
        }
    }

    return response;
}
