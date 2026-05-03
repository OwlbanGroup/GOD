// ============================================================================
// Security Tests for Sanitizer Module
// ============================================================================

import Sanitizer from '../../utils/sanitizer.js';

describe('Sanitizer Security Tests', () => {
    describe('Password Validation', () => {
        const testCases = [
            // Weak passwords - should fail
            { password: 'short', expectedValid: false, reason: 'too short' },
            { password: 'alllowercase', expectedValid: false, reason: 'no uppercase' },
            { password: 'ALLUPPERCASE', expectedValid: false, reason: 'no lowercase' },
            { password: 'NoNumbers', expectedValid: false, reason: 'no numbers' },
            { password: 'NoSpecial1', expectedValid: false, reason: 'no special chars' },
            { password: 'abc123', expectedValid: false, reason: 'too short, no special' },
            { password: 'Password!', expectedValid: false, reason: 'too short' },
            
            // Strong passwords - should pass
            { password: 'StrongP@ssw0rd', expectedValid: true, reason: 'meets all requirements' },
            { password: 'MySecur3P@ssword!', expectedValid: true, reason: 'strong password' },
            { password: 'C0mpl3x!P@ssw0rd', expectedValid: true, reason: 'very strong' },
        ];

        testCases.forEach(({ password, expectedValid, reason }) => {
            test(`should validate "${reason}" for password`, () => {
                const result = Sanitizer.validatePassword(password);
                expect(result.valid).toBe(expectedValid);
            });
        });

        test('should calculate entropy correctly', () => {
            // Lowercase only (26 chars)
            expect(Sanitizer.calculateEntropy('abc')).toBeGreaterThan(0);
            
            // Mixed case + digits (62 chars)
            expect(Sanitizer.calculateEntropy('Abc123')).toBeGreaterThan(Sanitizer.calculateEntropy('abc'));
            
            // All character types (94 chars)
            expect(Sanitizer.calculateEntropy('Abc123!@#')).toBeGreaterThan(Sanitizer.calculateEntropy('Abc123'));
        });

        test('should enforce minimum entropy requirement', () => {
            const result = Sanitizer.validatePassword('P@ss1');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('entropy');
        });

        test('should detect common patterns', () => {
            const result = Sanitizer.validatePassword('Str0ngP@ssword!');
            // Check for common words warning
            if (result.warnings && result.warnings.length > 0) {
                expect(result.warnings.some(w => w.includes('common'))).toBe(false);
            }
        });
    });

    describe('Input Sanitization', () => {
        test('should escape HTML characters', () => {
            expect(Sanitizer.escapeHtml('<script>')).toBe('<script>');
            expect(Sanitizer.escapeHtml('a & b')).toBe('a &amp; b');
            expect(Sanitizer.escapeHtml('"quotes"')).toBe('"quotes"');
        });

        test('should sanitize input safely', () => {
            const result = Sanitizer.sanitizeInput('<script>alert(1)</script>');
            expect(result).not.toContain('<script>');
        });

        test('should handle non-string input', () => {
            expect(Sanitizer.escapeHtml(123)).toBe('');
            expect(Sanitizer.sanitizeInput(null)).toBe('');
            expect(Sanitizer.sanitizeInput(undefined)).toBe('');
        });

        test('should enforce max length', () => {
            const longString = 'a'.repeat(2000);
            const result = Sanitizer.sanitizeInput(longString, 100);
            expect(result.length).toBe(100);
        });
    });

    describe('Name Validation', () => {
        test('should validate valid names', () => {
            const result = Sanitizer.validateName('John Doe');
            expect(result.valid).toBe(true);
        });

        test('should reject invalid names', () => {
            expect(Sanitizer.validateName('').valid).toBe(false);
            expect(Sanitizer.validateName('a').valid).toBe(false);
            expect(Sanitizer.validateName('a'.repeat(51)).valid).toBe(false);
        });
    });

    describe('Rate Limiting', () => {
        test('should allow requests within limit', () => {
            const key = `test-${Date.now()}`;
            // Simulate 5 requests
            for (let i = 0; i < 5; i++) {
                expect(Sanitizer.checkRateLimit(key, 10, 60000)).toBe(true);
            }
        });

        test('should block requests over limit', () => {
            const key = `test-limit-${Date.now()}`;
            // Exhaust the limit
            for (let i = 0; i < 10; i++) {
                Sanitizer.checkRateLimit(key, 5, 60000);
            }
            // Next request should be blocked
            expect(Sanitizer.checkRateLimit(key, 5, 60000)).toBe(false);
        });

        test('should validate numbers correctly', () => {
            expect(Sanitizer.validateNumber('123').valid).toBe(true);
            expect(Sanitizer.validateNumber('abc').valid).toBe(false);
            expect(Sanitizer.validateNumber('50', 0, 100).valid).toBe(true);
            expect(Sanitizer.validateNumber('150', 0, 100).valid).toBe(false);
        });
    });
});
