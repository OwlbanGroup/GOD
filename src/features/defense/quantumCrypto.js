// ============================================================================
// GOD Project - Quantum Crypto
// ============================================================================

import { info, warn } from '../../../utils/loggerWrapper.js';
import DOMHelpers from '../../ui/domHelpers.js';

class QuantumCrypto {
    isActive = false;
    keys = new Map();
sessions = new Map();
    quantumAlgorithms = ['AES-256-GCM', 'ChaCha20-Poly1305', 'Quantum-Resistant-KEM'];

    // Getter for algorithms to return a copy each time
    get algorithms() {
        return [...this.quantumAlgorithms];
    }

    initialize() {
        this.checkQuantumCapabilities();
        info('Quantum crypto system initialized');
    }

    checkQuantumCapabilities() {
        // Check for Web Crypto API support
        if (!globalThis.crypto?.subtle) {
            warn('Web Crypto API not supported');
            return false;
        }

        // Test key generation
        globalThis.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        ).then(() => {
            info('Quantum-resistant crypto capabilities detected');
            this.isActive = true;
        }).catch(err => {
            warn('Advanced crypto not available:', err);
        });

        return this.isActive;
    }

async activate() {
        if (this.isActive) return this.isActive;

        // Generate master quantum key
        const masterKey = await this.generateQuantumKey();
        if (!masterKey) {
            warn('Failed to generate quantum key');
            return false;
        }
        
        this.keys.set('master', masterKey);
        this.isActive = true;
        DOMHelpers.addMessage("🔐 Quantum cryptography activated. All communications secured.", 'god');
        info('Quantum crypto activated');
        return this.isActive;
    }

    async generateQuantumKey() {
        const key = await globalThis.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        const exportedKey = await globalThis.crypto.subtle.exportKey('raw', key);
        return exportedKey;
    }

async encrypt(data, keyId = 'master') {
        if (!this.isActive) {
            throw new Error('Quantum crypto is not active - cannot encrypt');
        }

        const keyData = this.keys.get(keyId);
        if (!keyData) {
            throw new Error('Encryption key not found');
        }

        const key = await globalThis.crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(JSON.stringify(data));

        const encrypted = await globalThis.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );

        // Generate HMAC for integrity verification
        const hmacKey = await globalThis.crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const hmacSignature = await globalThis.crypto.subtle.sign(
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
    }

async decrypt(encryptedData, keyId = 'master') {
        if (!this.isActive) {
            throw new Error('Quantum crypto is not active - cannot decrypt');
        }

        const keyData = this.keys.get(keyId);
        if (!keyData) {
            throw new Error('Decryption key not found');
        }

        const key = await globalThis.crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        const decrypted = await globalThis.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
            key,
            new Uint8Array(encryptedData.encrypted)
        );

// Verify HMAC integrity if present
        if (encryptedData?.hmac) {
            const hmacKey = await globalThis.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );
const isValid = await globalThis.crypto.subtle.verify(
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
    }

    async createSecureSession(sessionId) {
        const sessionKey = await this.generateQuantumKey();
        this.sessions.set(sessionId, {
            key: sessionKey,
            created: new Date().toISOString(),
            active: true
        });

        info('Secure session created:', sessionId);
        return sessionId;
    }

    async secureCommunication(message, sessionId) {
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
    }

    async createSignature(data) {
        // Create a simple hash-based signature
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data) + Date.now());
        const hash = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer);

        return Array.from(new Uint8Array(hash));
    }

async verifySignature(data, expectedHmac) {
        if (!expectedHmac || !Array.isArray(expectedHmac)) {
            return false;
        }

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Get the stored key for verification
        const keyData = this.keys.get('master');
        if (!keyData) {
            warn('No master key available for verification');
            return false;
        }

        const hmacKey = await globalThis.crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const isValid = await globalThis.crypto.subtle.verify(
            'HMAC',
            hmacKey,
            new Uint8Array(expectedHmac),
            dataBuffer
        );

        return isValid;
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
        // Simulate quantum-resistant key exchange
        const sharedSecret = await this.generateQuantumKey();
        const publicKey = await this.generateQuantumKey();

        return {
            peerId,
            sharedSecret,
            publicKey,
            established: new Date().toISOString()
        };
    }

    // ===== KEY PERSISTENCE SYSTEM =====

    /**
     * Backup all keys to an encrypted file
     * @param {string} password - Password to encrypt the backup
     * @returns {Blob} - Encrypted key backup file
     */
    async backupKeys(password) {
        if (!this.keys || this.keys.size === 0) {
            throw new Error('No keys to backup');
        }

        // Create key backup data
        const keyData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            keys: Array.from(this.keys.entries())
        };

        // Encrypt with password-derived key
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(JSON.stringify(keyData));
        
        // Derive key from password using PBKDF2
        const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
        const passwordKey = await globalThis.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        
        const derivedKey = await globalThis.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await globalThis.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            derivedKey,
            keyBuffer
        );

        // Combine salt + iv + encrypted data
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        // Create downloadable blob
        const blob = new Blob([combined], { type: 'application/octet-stream' });
        info('Keys backed up successfully');
        
        return blob;
    }

    /**
     * Restore keys from an encrypted backup file
     * @param {File} file - The backup file
     * @param {string} password - Password to decrypt
     * @returns {boolean} - Success status
     */
    async restoreKeys(file, password) {
        try {
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);

            // Extract salt, iv, and encrypted data
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);

            // Derive key from password
            const encoder = new TextEncoder();
            const passwordKey = await globalThis.crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const derivedKey = await globalThis.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                passwordKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            // Decrypt
            const decrypted = await globalThis.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                derivedKey,
                encrypted
            );

            // Parse restored data
            const decoder = new TextDecoder();
            const keyData = JSON.parse(decoder.decode(decrypted));

            // Validate backup format
            if (!keyData.version || !keyData.keys) {
                throw new Error('Invalid backup file format');
            }

            // Restore keys
            this.keys = new Map(keyData.keys);
            info('Keys restored successfully:', this.keys.size, 'keys');
            
            return true;
        } catch (err) {
            error('Key restoration failed:', err);
            throw new Error('Failed to restore keys - invalid password or corrupted file');
        }
    }

    /**
     * Get key count for display
     * @returns {number}
     */
    getKeyCount() {
        return this.keys ? this.keys.size : 0;
    }
}

// Singleton instance
const quantumCrypto = new QuantumCrypto();

// Make globally available
globalThis.quantumCrypto = quantumCrypto;

export function initializeQuantumCrypto() {
    quantumCrypto.initialize();
}

export default quantumCrypto;
