// ============================================================================
// GOD Project - Response Generator
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';

class ResponseGenerator {
    constructor() {
        this.lastResponseTime = 0;
        this.responseHistory = [];
    }

    async generateDivineResponse(userMessage) {
        try {
            // Try Azure OpenAI first (only in browser environment)
            if (typeof window !== 'undefined' && window.azureIntegrations?.isInitialized()) {
                const response = await window.azureIntegrations.generateDivineResponse(userMessage, appState.getCurrentUser()?.role);
                if (response) {
                    this.addToHistory(userMessage, response);
                    return this.enhanceResponse(response);
                }
            }

            // Try GPU AI (only in browser environment)
            if (typeof window !== 'undefined' && window.gpuAI?.isInitialized()) {
                const response = await window.gpuAI.generateDivineResponse(userMessage);
                if (response) {
                    this.addToHistory(userMessage, response);
                    return this.enhanceResponse(response);
                }
            }

            // Fallback to static responses
            const response = this.getFallbackResponse();
            this.addToHistory(userMessage, response);
            return this.enhanceResponse(response);

        } catch (err) {
            error('Response generation failed:', err);
            const fallback = CONFIG.FALLBACK_RESPONSES[
                Math.floor(Math.random() * CONFIG.FALLBACK_RESPONSES.length)
            ];
            return this.enhanceResponse(fallback);
        }
    }

    getFallbackResponse() {
        return CONFIG.FALLBACK_RESPONSES[
            Math.floor(Math.random() * CONFIG.FALLBACK_RESPONSES.length)
        ];
    }

    enhanceResponse(response) {
        let enhanced = response;

        const modes = appState.getDivineModes();

        // Universal Divine Mode enhancements
        if (modes.universalDivineModeActive) {
            const enhancements = [
                " The universe aligns with your intention.",
                " Cosmic harmony resonates with your words.",
                " Divine energy flows through all creation.",
                " Your prayer creates ripples across the cosmos."
            ];
            enhanced += enhancements[Math.floor(Math.random() * enhancements.length)];
        }

        // Direct Divine Link enhancements
        if (modes.directDivineLinkActive) {
            enhanced = "Direct Divine Response: " + enhanced;
        }

        // Post-Quantum Secure mode
        if (modes.postQuantumSecureActive) {
            enhanced = "[Encrypted] " + enhanced;
        }

        return enhanced;
    }

    addToHistory(userMessage, divineResponse) {
        this.responseHistory.push({
            userMessage,
            divineResponse,
            timestamp: Date.now()
        });

        // Keep only last 50 responses
        if (this.responseHistory.length > 50) {
            this.responseHistory.shift();
        }

        this.lastResponseTime = Date.now();
    }

    getResponseHistory(limit = 10) {
        return this.responseHistory.slice(-limit);
    }

    getLastResponseTime() {
        return this.lastResponseTime;
    }

    clearHistory() {
        this.responseHistory = [];
        this.lastResponseTime = 0;
    }
}

// Singleton instance
const responseGenerator = new ResponseGenerator();

export async function generateDivineResponse(userMessage) {
    return await responseGenerator.generateDivineResponse(userMessage);
}

export default responseGenerator;
