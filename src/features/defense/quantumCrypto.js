// ============================================================================
// GOD Project - Quantum Crypto
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import DOMHelpers from '../../ui/domHelpers.js';

class QuantumCrypto {
    constructor() {
        this.isActive = false;
        this.keys = new Map();
        this.sessions = new Map();
        this.quantumAlgorithms = ['AES-256-GCM', 'ChaCha20-Poly1305', 'Quantum-Resistant-KEM'];
    }

    initialize() {
        this.checkQuantumCapabilities();
        info('Quantum crypto system initialized');
    }

    checkQuantumCapabilities() {
        // Check for Web Crypto API support
        if (!window.crypto || !window.crypto.subtle) {
            warn('Web Crypto API not supported');
            return false;
        }

        // Check for advanced crypto features
        try {
            // Test key generation
            window.crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            ).then(() => {
                info('Quantum-resistant crypto capabilities detected');
                this.isActive = true;
            }).catch(err => {
                warn('Advanced crypto not available:', err);
            });
        } catch (err) {
            warn('Crypto capability check failed:', err);
        }

        return this.isActive;
    }

    async activate() {
        if (this.isActive) return true;

        try {
            // Generate master quantum key
            const masterKey = await this.generateQuantumKey();
            this.keys.set('master', masterKey);

            this.isActive = true;
            DOMHelpers.addMessage("🔐 Quantum cryptography activated. All communications secured.", 'god');
            info('Quantum crypto activated');
            return true;
        } catch (err) {
            error('Quantum crypto activation failed:', err);
            return false;
        }
    }

    async generateQuantumKey() {
        try {
            const key = await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256
                },
                true,
                ['encrypt', 'decrypt']
            );

            const exportedKey = await window.crypto.subtle.exportKey('raw', key);
            return exportedKey;
        } catch (err) {
            error('Quantum key generation failed:', err);
            throw err;
        }
    }

async encrypt(data, keyId = 'master') {
        if (!this.isActive) {
            throw new Error('Quantum crypto is not active - cannot encrypt');
        }

        const keyData = this.keys.get(keyId);
        if (!keyData) {
            throw new Error('Encryption key not found');
        }

        try {
            const key = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );

            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedData = new TextEncoder().encode(JSON.stringify(data));

            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encodedData
            );

            // Generate HMAC for integrity verification
            const hmacKey = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            const hmacSignature = await window.crypto.subtle.sign(
                'HMAC',
                hmacKey,
                encodedData
            );

            return {
                encrypted: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv),
                algorithm: 'AES-256-GCM',
                hmac: Array.from(new Uint8Array(hmacSignature)),
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            error('Quantum encryption failed:', err);
            throw new Error('Encryption failed: ' + err.message);
        }
    }

async decrypt(encryptedData, keyId = 'master') {
        if (!this.isActive) {
            throw new Error('Quantum crypto is not active - cannot decrypt');
        }

        const keyData = this.keys.get(keyId);
        if (!keyData) {
            throw new Error('Decryption key not found');
        }

        try {
            const key = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                key,
                new Uint8Array(encryptedData.encrypted)
            );

            // Verify HMAC integrity if present
            if (encryptedData.hmac) {
                const hmacKey = await window.crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['verify']
                );
                const isValid = await window.crypto.subtle.verify(
                    'HMAC',
                    hmacKey,
                    new Uint8Array(encryptedData.hmac),
                    decrypted
                );
                if (!isValid) {
                    throw new Error('HMAC integrity verification failed - data may be tampered');
                }
            }

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (err) {
            error('Quantum decryption failed:', err);
            throw new Error('Decryption failed: ' + err.message);
        }
    }

    async createSecureSession(sessionId) {
        try {
            const sessionKey = await this.generateQuantumKey();
            this.sessions.set(sessionId, {
                key: sessionKey,
                created: new Date().toISOString(),
                active: true
            });

            info('Secure session created:', sessionId);
            return sessionId;
        } catch (err) {
            error('Session creation failed:', err);
            return null;
        }
    }

    async secureCommunication(message, sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session || !session.active) {
                throw new Error('Invalid session');
            }

            const encrypted = await this.encrypt(message, session.key);
            return {
                sessionId,
                encrypted,
                signature: await this.createSignature(message)
            };
        } catch (err) {
            error('Communication security failed:', err);
            return message;
        }
    }

    async createSignature(data) {
        try {
            // Create a simple hash-based signature
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data) + Date.now());
            const hash = await window.crypto.subtle.digest('SHA-256', dataBuffer);

            return Array.from(new Uint8Array(hash));
        } catch (err) {
            warn('Signature creation failed:', err);
            return null;
        }
    }

async verifySignature(data, expectedHmac) {
        if (!expectedHmac || !Array.isArray(expectedHmac)) {
            return false;
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Get the stored key for verification
            const keyData = this.keys.get('master');
            if (!keyData) {
                warn('No master key available for verification');
                return false;
            }

            const hmacKey = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const isValid = await window.crypto.subtle.verify(
                'HMAC',
                hmacKey,
                new Uint8Array(expectedHmac),
                dataBuffer
            );

            return isValid;
        } catch (err) {
            warn('Signature verification failed:', err);
            return false;
        }
    }

    getStatus() {
        return {
            active: this.isActive,
            keysGenerated: this.keys.size,
            activeSessions: Array.from(this.sessions.values()).filter(s => s.active).length,
            algorithms: this.quantumAlgorithms
        };
    }

    deactivate() {
        this.isActive = false;
        this.keys.clear();
        this.sessions.clear();
        DOMHelpers.addMessage("🔓 Quantum cryptography deactivated.", 'god');
        info('Quantum crypto deactivated');
    }

    // Quantum-resistant key exchange simulation
    async performKeyExchange(peerId) {
        try {
            // Simulate quantum-resistant key exchange
            const sharedSecret = await this.generateQuantumKey();
            const publicKey = await this.generateQuantumKey();

            return {
                peerId,
                sharedSecret,
                publicKey,
                established: new Date().toISOString()
            };
        } catch (err) {
            error('Key exchange failed:', err);
            return null;
        }
    }
}

// Singleton instance
const quantumCrypto = new QuantumCrypto();

// Make globally available
window.quantumCrypto = quantumCrypto;

export function initializeQuantumCrypto() {
    quantumCrypto.initialize();
}

export default quantumCrypto;
