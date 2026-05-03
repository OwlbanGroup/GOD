// ============================================================================
// Security Tests for Quantum Crypto Module
// ============================================================================

import quantumCrypto from '../../src/features/defense/quantumCrypto.js';

describe('QuantumCrypto Security Tests', () => {
    beforeEach(() => {
        // Reset quantum crypto state before each test
        quantumCrypto.deactivate();
        quantumCrypto.keys.clear();
        quantumCrypto.sessions.clear();
    });

    describe('Encryption/Decryption', () => {
        test('should encrypt and decrypt data successfully', async () => {
            // Activate quantum crypto
            await quantumCrypto.activate();
            
            const testData = { message: 'Test prayer', user: 'believer' };
            const encrypted = await quantumCrypto.encrypt(testData);
            
            expect(encrypted).toBeDefined();
            expect(encrypted.encrypted).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            expect(encrypted.hmac).toBeDefined();
            expect(encrypted.algorithm).toBe('AES-256-GCM');
            
            const decrypted = await quantumCrypto.decrypt(encrypted);
            expect(decrypted).toEqual(testData);
        });

        test('should throw error when encrypting while inactive', async () => {
            await expect(quantumCrypto.encrypt({ data: 'test' }))
                .rejects.toThrow('Quantum crypto is not active');
        });

        test('should throw error when decrypting while inactive', async () => {
            await expect(quantumCrypto.decrypt({ encrypted: [], iv: [] }))
                .rejects.toThrow('Quantum crypto is not active');
        });

        test('should detect tampered data via HMAC verification', async () => {
            await quantumCrypto.activate();
            
            const testData = { message: 'Test prayer' };
            const encrypted = await quantumCrypto.encrypt(testData);
            
            // Tamper with the encrypted data
            encrypted.encrypted[0] = (encrypted.encrypted[0] + 1) % 256;
            
            await expect(quantumCrypto.decrypt(encrypted))
                .rejects.toThrow('HMAC integrity verification failed');
        });
    });

    describe('Signature Verification', () => {
        test('should create and verify signature', async () => {
            await quantumCrypto.activate();
            
            const testData = { message: 'Test message' };
            const signature = await quantumCrypto.createSignature(testData);
            
            expect(signature).toBeDefined();
            expect(Array.isArray(signature)).toBe(true);
            
            const isValid = await quantumCrypto.verifySignature(testData, signature);
            expect(isValid).toBe(true);
        });

        test('should reject invalid signature', async () => {
            await quantumCrypto.activate();
            
            const testData = { message: 'Test message' };
            const invalidSignature = [0, 0, 0, 0];
            
            const isValid = await quantumCrypto.verifySignature(testData, invalidSignature);
            expect(isValid).toBe(false);
        });

        test('should reject signature without master key', async () => {
            // Don't activate quantum crypto
            const testData = { message: 'Test message' };
            const signature = [0, 0, 0, 0];
            
            const isValid = await quantumCrypto.verifySignature(testData, signature);
            expect(isValid).toBe(false);
        });
    });

    describe('Key Management', () => {
        test('should generate quantum key', async () => {
            const key = await quantumCrypto.generateQuantumKey();
            
            expect(key).toBeDefined();
            expect(key instanceof Uint8Array).toBe(true);
            expect(key.length).toBeGreaterThan(0);
        });

        test('should track keys correctly', async () => {
            await quantumCrypto.activate();
            
            const status = quantumCrypto.getStatus();
            expect(status.keysGenerated).toBe(1);
        });

        test('should clear keys on deactivate', async () => {
            await quantumCrypto.activate();
            expect(quantumCrypto.keys.size).toBe(1);
            
            quantumCrypto.deactivate();
            expect(quantumCrypto.keys.size).toBe(0);
        });
    });

    describe('Session Management', () => {
        test('should create secure session', async () => {
            const sessionId = await quantumCrypto.createSecureSession('test-session');
            
            expect(sessionId).toBe('test-session');
            expect(quantumCrypto.sessions.has('test-session')).toBe(true);
        });

        test('should validate session', async () => {
            await quantumCrypto.createSecureSession('valid-session');
            
            const session = quantumCrypto.sessions.get('valid-session');
            expect(session.active).toBe(true);
        });
    });

    describe('Status', () => {
        test('should report correct initial status', () => {
            const status = quantumCrypto.getStatus();
            
            expect(status.active).toBe(false);
            expect(status.keysGenerated).toBe(0);
            expect(status.activeSessions).toBe(0);
            expect(status.algorithms).toContain('AES-256-GCM');
        });

        test('should report active status after activation', async () => {
            await quantumCrypto.activate();
            
            const status = quantumCrypto.getStatus();
            expect(status.active).toBe(true);
        });
    });
});
