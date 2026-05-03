// ============================================================================
// Integration Tests for Security Features
// ============================================================================

import quantumCrypto from '../../src/features/defense/quantumCrypto.js';
import Sanitizer from '../../utils/sanitizer.js';

describe('Security Integration Tests', () => {
    describe('Quantum Encryption Integration', () => {
        test('should encrypt data and verify decryption integrity', async () => {
            // Activate quantum crypto
            await quantumCrypto.activate();
            
            const prayerData = {
                id: 'prayer-123',
                user: 'believer-1',
                message: 'Please heal the sick',
                timestamp: new Date().toISOString()
            };
            
            // Encrypt the prayer data
            const encrypted = await quantumCrypto.encrypt(prayerData);
            expect(encrypted.algorithm).toBe('AES-256-GCM');
            expect(encrypted.hmac).toBeDefined();
            
            // Decrypt and verify integrity
            const decrypted = await quantumCrypto.decrypt(encrypted);
            expect(decrypted).toEqual(prayerData);
        });

        test('should verify signature across encryption boundary', async () => {
            await quantumCrypto.activate();
            
            const message = { content: 'Test message for signature' };
            const signature = await quantumCrypto.createSignature(message);
            
            // Verify the signature
            const isValid = await quantumCrypto.verifySignature(message, signature);
            expect(isValid).toBe(true);
        });

        test('should maintain session security', async () => {
            const sessionId = 'test-session-' + Date.now();
            await quantumCrypto.createSecureSession(sessionId);
            
            const session = quantumCrypto.sessions.get(sessionId);
            expect(session.active).toBe(true);
            expect(session.key).toBeDefined();
        });
    });

    describe('Sanitization Security Integration', () => {
        test('should sanitize and encrypt user input', async () => {
            const userInput = '<script>alert("XSS")</script>祈粥';
            const sanitized = Sanitizer.sanitizeInput(userInput);
            
            // Verify no XSS
            expect(sanitized).not.toContain('<script>');
            
            // Encrypt sanitized data
            await quantumCrypto.activate();
            const encrypted = await quantumCrypto.encrypt({ data: sanitized });
            expect(encrypted).toBeDefined();
        });

        test('should validate password and use for encryption key', () => {
            const password = 'Str0ngP@ssw0rd!';
            const validation = Sanitizer.validatePassword(password);
            
            expect(validation.valid).toBe(true);
            
            // Calculate entropy for key derivation hint
            const entropy = Sanitizer.calculateEntropy(password);
            expect(entropy).toBeGreaterThan(40); // Minimum 40 bits
        });

        test('should enforce rate limiting on security operations', () => {
            const key = 'rate-limit-test-' + Date.now();
            
            // First 10 requests should pass
            for (let i = 0; i < 10; i++) {
                expect(Sanitizer.checkRateLimit(key, 10, 60000)).toBe(true);
            }
            
            // 11th should fail
            expect(Sanitizer.checkRateLimit(key, 10, 60000)).toBe(false);
        });
    });

    describe('End-to-End Security Flow', () => {
        test('should handle complete secure prayer submission', async () => {
            await quantumCrypto.activate();
            
            // 1. Validate user input
            const prayerInput = 'Lord, please bless our family<Malware>';
            const sanitized = Sanitizer.sanitizeInput(prayerInput);
            
            // 2. Validate password for user authentication
            const passwordValidation = Sanitizer.validatePassword('Secur3P@ss!');
            expect(passwordValidation.valid).toBe(true);
            
            // 3. Encrypt the prayer data
            const prayerData = {
                content: sanitized,
                validated: true,
                timestamp: new Date().toISOString()
            };
            
            const encrypted = await quantumCrypto.encrypt(prayerData);
            const signature = await quantumCrypto.createSignature(prayerData);
            
            // 4. Verify signature
            expect(await quantumCrypto.verifySignature(prayerData, signature)).toBe(true);
            
            // 5. Decrypt and verify
            const decrypted = await quantumCrypto.decrypt(encrypted);
            expect(decrypted.content).toBe(sanitized);
        });

        test('should detect tampering in end-to-end flow', async () => {
            await quantumCrypto.activate();
            
            const originalData = { message: 'Original prayer' };
            const encrypted = await quantumCrypto.encrypt(originalData);
            
            // Tamper with encrypted data
            encrypted.encrypted[0] = (encrypted.encrypted[0] + 1) % 256;
            
            // Decryption should fail due to HMAC verification
            await expect(quantumCrypto.decrypt(encrypted))
                .rejects.toThrow('HMAC integrity verification failed');
        });
    });
});
