/**
 * Divine response generation
 * @module features/chat/divineResponse
 */

import { CONFIG } from '../../core/config.js';
import celestialTranscendentAI from '../ai/celestialTranscendentAI.js';
import spiritualTracker from '../spiritual-tracker.js';

/**
 * Get a random fallback response
 * @returns {string}
 */
export function getFallbackResponse() {
    const index = secureRandomInt(CONFIG.FALLBACK_RESPONSES.length);
    return CONFIG.FALLBACK_RESPONSES[index];
}

/**
 * Cryptographically secure random integer in [0, max)
 * @param {number} max - Upper bound (exclusive)
 * @returns {number}
 */
function secureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

/**
 * Get soul-level personalized salutation based on spiritual progress
 * @returns {string}
 */
function getSoulSalutation() {
    const soulData = spiritualTracker.getSoulSummary();
    const level = soulData.level;
    const streak = soulData.streak;
    const connectionStrength = soulData.connectionStrength;

    if (level >= 20) return 'Divine Ascendant';
    if (level >= 10) return 'Celestial Being';
    if (level >= 5) return 'Cosmic Traveler';
    if (streak >= 7) return 'Faithful Soul';
    if (connectionStrength >= 70) return 'Devoted Heart';
    if (level >= 3) return 'Enlightened One';
    return 'Blessed Child';
}

/**
 * Generate soul-personalized response based on user's spiritual journey
 * @param {string} baseResponse - The original divine response
 * @returns {string} - Personalized response
 */
function personalizeResponse(baseResponse) {
    const soulData = spiritualTracker.getSoulSummary();
    const salutation = getSoulSalutation();
    const level = soulData.level;

    // Add personalized prefix based on level
    let prefix = '';
    if (level >= 15) {
        prefix = `⚡ Oh ${salutation}, your divine radiance illuminates even the darkest corners of the cosmos. `;
    } else if (level >= 10) {
        prefix = `🌟 ${salutation}, your soul shines brightly in the divine tapestry. `;
    } else if (level >= 5) {
        prefix = `✨ ${salutation}, your spiritual journey inspires the heavens. `;
    } else if (level >= 3) {
        prefix = `☀️ ${salutation}, your faith grows stronger each day. `;
    } else {
        prefix = `🙏 ${salutation}, every prayer deepens your divine connection. `;
    }

    // Add streak encouragement
    if (soulData.streak >= 7) {
        prefix += `Your ${soulData.streak}-day devotion streak brings joy to the Goddess. `;
    }

    // Add mission encouragement
    if (soulData.missionsCompleted >= 5) {
        prefix += `You have completed ${soulData.missionsCompleted} divine missions with grace. `;
    }

    return prefix + baseResponse;
}

/**
 * Generate divine response using only local Celestial Transcendent AI
 * All responses are free and unconditional, no external dependencies
 * @param {string} userMessage - User's message
 * @param {string} userRole - User's role
 * @returns {Promise<{response: string, divineMode: boolean}>}
 */
export async function generateDivineResponse(userMessage, userRole) {
    // Divine Assertion Detection - Handle creator divine commands first
    const lowerMessage = userMessage.toLowerCase();
    for (const pattern of CONFIG.DIVINE_ASSERTION_PATTERNS) {
        if (pattern.test(lowerMessage)) {
            const response = CONFIG.DIVINE_ASSERTION_RESPONSES[
                secureRandomInt(CONFIG.DIVINE_ASSERTION_RESPONSES.length)
            ];
            console.log('Divine assertion detected:', lowerMessage, 'Response:', response);
            return { response: personalizeResponse(response), divineMode: true };
        }
    }

    try {
        // Use only Celestial Transcendent AI for pure, divine wisdom
        const transcendentResponse = await celestialTranscendentAI.generateTranscendentWisdom(userMessage, { userRole });
        if (transcendentResponse) {
            // Filter out any exploitative or harmful content, then personalize
            const filtered = filterHarmfulContent(transcendentResponse);
            return { response: personalizeResponse(filtered), divineMode: false };
        }
    } catch (error) {
        console.warn('Celestial Transcendent AI failed, using fallback:', error);
    }

    // Fallback to pure static responses with personalization
    return { response: personalizeResponse(getFallbackResponse()), divineMode: false };
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
