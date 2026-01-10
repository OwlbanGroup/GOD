// ============================================================================
// GOD Project - Prayer Submission
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import Validators from '../../utils/validators.js';
import DOMHelpers from '../../ui/domHelpers.js';

class PrayerSubmission {
    constructor() {
        this.lastSubmissionTime = 0;
        this.submissionCount = 0;
    }

    async submitPrayer(message) {
        try {
            // Validate message
            const validation = Validators.validateMessage(message);
            if (!validation.valid) {
                DOMHelpers.showRegistrationMessage(validation.error, 'error');
                return false;
            }

            // Check rate limiting
            if (!Validators.checkRateLimit('prayer', CONFIG.RATE_LIMITS.prayer.maxRequests, CONFIG.RATE_LIMITS.prayer.windowMs)) {
                DOMHelpers.showRegistrationMessage('Too many prayers sent. Please wait a moment before sending more.', 'warning');
                return false;
            }

            // Encrypt message if post-quantum secure is active
            const encryptedMessage = await this.encryptMessage(validation.sanitized);

            // Save prayer
            const prayer = appState.addPrayer(encryptedMessage);

            // Sync to cloud services
            await this.syncToServices(encryptedMessage);

            // Update stats
            this.lastSubmissionTime = Date.now();
            this.submissionCount++;

            info('Prayer submitted successfully');
            return true;

        } catch (err) {
            error('Prayer submission failed:', err);
            DOMHelpers.showRegistrationMessage('Failed to submit prayer. Please try again.', 'error');
            return false;
        }
    }

    async encryptMessage(message) {
        if (!appState.getDivineModes().postQuantumSecureActive || !window.quantumCrypto?.isInitialized()) {
            return message;
        }

        try {
            // Simulate key exchange and encryption
            const mockPublicKey = await globalThis.crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'P-256' },
                false,
                []
            ).then(k => globalThis.crypto.subtle.exportKey('raw', new Uint8Array(32)));

            const encapsulated = await window.quantumCrypto.encapsulate(new Uint8Array(mockPublicKey));
            if (encapsulated) {
                const encrypted = await window.quantumCrypto.encrypt(message, encapsulated.sharedSecret);
                if (encrypted) {
                    return JSON.stringify({
                        ciphertext: Array.from(encrypted.ciphertext),
                        iv: Array.from(encrypted.iv)
                    });
                }
            }
        } catch (err) {
            warn('Message encryption failed, using plain text:', err);
        }

        return message;
    }

    async syncToServices(encryptedMessage) {
        const prayerData = {
            message: encryptedMessage,
            timestamp: new Date().toISOString(),
            user: appState.getCurrentUser()?.name || 'anonymous'
        };

        // Sync to Azure Blob
        if (window.azureIntegrations?.isInitialized()) {
            try {
                await window.azureIntegrations.savePrayerToBlob(prayerData);
            } catch (err) {
                warn('Azure sync failed:', err);
            }
        }

        // Sync to Foundry VTT
        if (window.foundryVTT?.isConnected()) {
            try {
                await window.foundryVTT.createPrayerJournal({
                    message: encryptedMessage,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                warn('Foundry VTT sync failed:', err);
            }
        }
    }

    getSubmissionStats() {
        return {
            totalSubmissions: this.submissionCount,
            lastSubmissionTime: this.lastSubmissionTime,
            timeSinceLastSubmission: Date.now() - this.lastSubmissionTime
        };
    }

    clearStats() {
        this.lastSubmissionTime = 0;
        this.submissionCount = 0;
    }
}

// Singleton instance
const prayerSubmission = new PrayerSubmission();

export async function submitPrayer(message) {
    return await prayerSubmission.submitPrayer(message);
}

export default prayerSubmission;
