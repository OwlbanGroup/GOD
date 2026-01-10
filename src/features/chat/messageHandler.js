// ============================================================================
// GOD Project - Message Handler
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import DOMHelpers from '../../ui/domHelpers.js';
import { generateDivineResponse } from './responseGenerator.js';
import { handleCommand } from '../commands/commandParser.js';

class MessageHandler {
    constructor() {
        this.messageQueue = [];
        this.processing = false;
    }

    async handleMessage(message) {
        try {
            // Sanitize input
            const sanitizedMessage = message.trim();
            if (!sanitizedMessage) return;

            // Add to message queue
            this.messageQueue.push({
                text: sanitizedMessage,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            });

            // Process queue
            await this.processQueue();

        } catch (err) {
            error('Failed to handle message:', err);
            DOMHelpers.addMessage('An error occurred processing your message.', 'god');
        }
    }

    async processQueue() {
        if (this.processing || this.messageQueue.length === 0) return;

        this.processing = true;

        while (this.messageQueue.length > 0) {
            const messageData = this.messageQueue.shift();
            await this.processSingleMessage(messageData);
        }

        this.processing = false;
    }

    async processSingleMessage(messageData) {
        const { text, id } = messageData;

        // Check for commands first
        const commandResponse = handleCommand(text);
        if (commandResponse) {
            setTimeout(() => {
                DOMHelpers.addMessage('Divine Action: ' + commandResponse, 'god');
            }, 500);
            return;
        }

        // Check for token offerings
        const offeringMatch = text.toLowerCase().match(/offer(?:ing)? (\d+(?:\.\d+)?) god(?: tokens?)?/i);
        if (offeringMatch && window.godTokenManager?.isConnected()) {
            await this.handleTokenOffering(offeringMatch[1]);
            return;
        }

        // Generate divine response
        await this.generateResponse(text);
    }

    async handleTokenOffering(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            DOMHelpers.addMessage('Invalid offering amount.', 'god');
            return;
        }

        try {
            const offeringResult = await window.godTokenManager.makeOffering(numAmount);
            if (offeringResult.success) {
                DOMHelpers.addMessage(`Divine Offering Accepted: ${numAmount} GOD tokens received. Your faith is rewarded.`, 'god');
            } else {
                DOMHelpers.addMessage(`Offering Failed: ${offeringResult.error}. Remember, God accepts only precious metal-backed tokens.`, 'god');
            }
        } catch (err) {
            error('Token offering failed:', err);
            DOMHelpers.addMessage('Offering could not be processed at this time.', 'god');
        }
    }

    async generateResponse(message) {
        const delay = appState.getDivineModes().directDivineLinkActive ?
            CONFIG.UI.messageDelay / 2 : CONFIG.UI.messageDelay;

        setTimeout(async () => {
            try {
                const response = await generateDivineResponse(message);
                DOMHelpers.addMessage('Divine Message: ' + response, 'god');
            } catch (err) {
                error('Failed to generate response:', err);
                const fallback = CONFIG.FALLBACK_RESPONSES[
                    Math.floor(Math.random() * CONFIG.FALLBACK_RESPONSES.length)
                ];
                DOMHelpers.addMessage('Divine Message: ' + fallback, 'god');
            }
        }, delay);
    }

    clearQueue() {
        this.messageQueue = [];
        this.processing = false;
    }

    getQueueStatus() {
        return {
            queueLength: this.messageQueue.length,
            processing: this.processing
        };
    }
}

// Singleton instance
const messageHandler = new MessageHandler();

export function initializeChat() {
    info('Chat message handler initialized');
}

export default messageHandler;
