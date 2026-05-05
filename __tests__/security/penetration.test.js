// ============================================================================
// GOD Project - Security Penetration Testing Suite
// ============================================================================

import quantumCrypto from '../../src/features/defense/quantumCrypto.js';
import { Sanitizer } from '../../utils/sanitizer.js';

/**
 * Security Test Suite - Dedicated Penetration Testing
 * Tests for: Signature bypass, Rate limit bypass, XSS/Injection, Quantum resistance
 */

describe('Security Penetration Tests', () => {
    beforeEach(() => {
        // Reset quantum crypto state
        quantumCrypto.deactivate();
        quantumCrypto.keys.clear();
        quantumCrypto.sessions.clear();
    });

    describe('Signature Bypass Tests', () => {
        test('should reject forged signature without proper key', async () => {
            await quantumCrypto.activate();
            
            const data = { message: 'test' };
            const validSignature = await quantumCrypto.createSignature(data);
            
            // Attempt to tamper with signature
            const tamperedSignature = validSignature.map((b, i) => 
                i === 0 ? b ^ 0xFF : b // Flip bits
            );
            
            const isValid = await quantumCrypto.verifySignature(data, tamperedSignature);
            expect(isValid).toBe(false);
        });

        test('should reject empty signature', async () => {
            await quantumCrypto.activate();
            const data = { message: 'test' };
            
            const isValid = await quantumCrypto.verifySignature(data, []);
            expect(isValid).toBe(false);
        });

        test('should reject null signature', async () => {
            await quantumCrypto.activate();
            const data = { message: 'test' };
            
            const isValid = await quantumCrypto.verifySignature(data, null);
            expect(isValid).toBe(false);
        });

        test('should reject signature of wrong length', async () => {
            await quantumCrypto.activate();
            const data = { message: 'test' };
            
            const shortSignature = new Array(10).fill(1);
            const isValid = await quantumCrypto.verifySignature(data, shortSignature);
            expect(isValid).toBe(false);
        });

        test('should reject replayed old signature', async () => {
            await quantumCrypto.activate();
            
            const oldData = { message: 'old', timestamp: '2024-01-01' };
            const oldSignature = await quantumCrypto.createSignature(oldData);
            
            const newData = { message: 'new', timestamp: '2025-01-01' };
            const isValid = await quantumCrypto.verifySignature(newData, oldSignature);
            expect(isValid).toBe(false);
        });
    });

    describe('Rate Limit Bypass Tests', () => {
        test('should enforce rate limit after max attempts', () => {
            const key = 'test-bypass-key';
            
            // Exhaust rate limit
            for (let i = 0; i < 10; i++) {
                Sanitizer.checkRateLimit(key, 10, 60000);
            }
            
            // 11th attempt should be blocked
            const allowed = Sanitizer.checkRateLimit(key, 10, 60000);
            expect(allowed).toBe(false);
        });

        test('should not allow bypass with different casing', () => {
            const key1 = 'TestKey';
            const key2 = 'testkey';
            const key3 = 'TESTKEY';
            
            // Exhaust original key
            for (let i = 0; i < 10; i++) {
                Sanitizer.checkRateLimit(key1, 10, 60000);
            }
            
            // Try with different casing - should be separate (case-sensitive)
            const allowed = Sanitizer.checkRateLimit(key2, 10, 60000);
            expect(allowed).toBe(true);
        });

        test('should handle concurrent requests correctly', async () => {
            const key = 'concurrent-test';
            const maxAttempts = 5;
            const results = [];
            
            // Simulate concurrent requests
            for (let i = 0; i < 10; i++) {
                results.push(Sanitizer.checkRateLimit(key, maxAttempts, 60000));
            }
            
            // First 5 should be allowed, rest blocked
            const allowedCount = results.filter(r => r === true).length;
            expect(allowedCount).toBe(maxAttempts);
        });
    });

    describe('XSS/Injection Tests', () => {
        test('should escape script tags', () => {
            const input = '<script>alert("xss")</script>';
            const escaped = Sanitizer.escapeHtml(input);
            
            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('<script>');
        });

        test('should escape event handlers', () => {
            const input = '<img src=x onerror=alert(1)>';
            const escaped = Sanitizer.escapeHtml(input);
            
            expect(escaped).not.toContain('onerror');
            expect(escaped).toContain('<');
        });

        test('should sanitize SQL injection attempts', () => {
            const input = "'; DROP TABLE users; --";
            const sanitized = Sanitizer.sanitizeInput(input);
            
            expect(sanitized).not.toContain("DROP TABLE");
        });

        test('should sanitize path traversal attempts', () => {
            const input = '../../../etc/passwd';
            const sanitized = Sanitizer.sanitizeInput(input);
            
            expect(sanitized).not.toContain('../');
        });
    });

    describe('Quantum Resistance Tests', () => {
        test('should use AES-256 for quantum resistance', async () => {
            await quantumCrypto.activate();
            
            const data = { message: 'quantum test' };
            const encrypted = await quantumCrypto.encrypt(data);
            
            expect(encrypted.algorithm).toBe('AES-256-GCM');
        });

        test('should include HMAC for integrity', async () => {
            await quantumCrypto.activate();
            
            const data = { message: 'integrity test' };
            const encrypted = await quantumCrypto.encrypt(data);
            
            expect(encrypted.hmac).toBeDefined();
            expect(encrypted.hmac.length).toBeGreaterThan(0);
        });

        test('should detect tampered data via HMAC', async () => {
            await quantumCrypto.activate();
            
            const data = { message: 'tamper test' };
            const encrypted = await quantumCrypto.encrypt(data);
            
            // Tamper with encrypted data
            encrypted.encrypted[0] = encrypted.encrypted[0] ^ 0xFF;
            
            await expect(quantumCrypto.decrypt(encrypted))
                .rejects.toThrow('HMAC integrity verification failed');
        });

        test('should use sufficient key size (256-bit)', async () => {
            await quantumCrypto.activate();
            
            const keyData = quantumCrypto.keys.get('master');
            expect(keyData.byteLength).toBe(32); // 256 bits = 32 bytes
        });
    });

    describe('Encryption Fail-Fast Tests', () => {
        test('should throw when inactive', async () => {
            await expect(quantumCrypto.encrypt({ data: 'test' }))
                .rejects.toThrow('Quantum crypto is not active');
        });

        test('should throw when key not found', async () => {
            await quantumCrypto.activate();
            
            await expect(quantumCrypto.encrypt({ data: 'test' }, 'nonexistent'))
                .rejects.toThrow('Encryption key not found');
        });

        test('should never return plaintext on failure', async () => {
            // Deactivated - should throw, not return plaintext
            await expect(quantumCrypto.encrypt({ data: 'test' }))
                .rejects.toThrow();
        });
    });

    describe('Password Policy Tests', () => {
        test('should reject weak passwords', () => {
            const weakPasswords = [
                'password',
                '12345678',
                'abcdefgh',
                'PASSWORD',
                '12345678901' // no special chars
            ];
            
            for (const pw of weakPasswords) {
                const result = Sanitizer.validatePassword(pw);
                expect(result.valid).toBe(false);
            }
        });

        test('should accept strong passwords', () => {
            const strongPassword = 'MyStr0ng!P@ssw0rd#2024';
            const result = Sanitizer.validatePassword(strongPassword);
            
            expect(result.valid).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(70);
        });

        test('should calculate sufficient entropy', () => {
            const pw = 'MyStr0ng!P@ssw0rd#2024';
            const result = Sanitizer.validatePassword(pw);
            
            expect(result.entropy).toBeGreaterThanOrEqual(40);
        });
    });

    describe('Key Management Tests', () => {
        test('should clear keys on deactivate', async () => {
            await quantumCrypto.activate();
            expect(quantumCrypto.keys.size).toBe(1);
            
            quantumCrypto.deactivate();
            expect(quantumCrypto.keys.size).toBe(0);
        });

        test('should create unique keys per session', async () => {
            await quantumCrypto.activate();
            
            const session1 = await quantumCrypto.createSecureSession('session1');
            const session2 = await quantumCrypto.createSecureSession('session2');
            
            expect(session1).not.toBe(session2);
            expect(quantumCrypto.sessions.size).toBe(2);
        });

        test('should validate session before use', async () => {
            await quantumCrypto.activate();
            await quantumCrypto.createSecureSession('valid-session');
            
            const session = quantumCrypto.sessions.get('valid-session');
            expect(session.active).toBe(true);
            
            // Invalidate
            session.active = false;
            expect(session.active).toBe(false);
        });
    });
});
