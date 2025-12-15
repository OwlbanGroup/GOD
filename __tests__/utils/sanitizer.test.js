/**
 * @jest-environment jsdom
 */

const Sanitizer = require('../../utils/sanitizer.js');

describe('Sanitizer', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      expect(Sanitizer.escapeHtml('<script>alert("xss")</script>'))
        .toBe('<script>alert("xss")<&#x2F;script>');
    });

    test('should escape ampersands', () => {
      expect(Sanitizer.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape quotes', () => {
      expect(Sanitizer.escapeHtml('"Hello" \'World\'')).toBe('"Hello" &#x27;World&#x27;');
    });

    test('should escape forward slashes', () => {
      expect(Sanitizer.escapeHtml('</script>')).toBe('<&#x2F;script>');
    });

    test('should handle empty string', () => {
      expect(Sanitizer.escapeHtml('')).toBe('');
    });

    test('should handle normal text', () => {
      expect(Sanitizer.escapeHtml('Hello World')).toBe('Hello World');
    });

    test('should handle non-string input', () => {
      expect(Sanitizer.escapeHtml(123)).toBe('');
      expect(Sanitizer.escapeHtml(null)).toBe('');
      expect(Sanitizer.escapeHtml(undefined)).toBe('');
      expect(Sanitizer.escapeHtml({})).toBe('');
    });

    test('should escape all special characters in one string', () => {
      expect(Sanitizer.escapeHtml('<>&"\'/'))
        .toBe('<>&amp;"&#x27;&#x2F;');
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      expect(Sanitizer.sanitizeInput('  hello  ')).toBe('hello');
    });

    test('should enforce max length', () => {
      const longString = 'a'.repeat(2000);
      expect(Sanitizer.sanitizeInput(longString, 100).length).toBe(100);
    });

    test('should use default max length of 1000', () => {
      const longString = 'a'.repeat(2000);
      expect(Sanitizer.sanitizeInput(longString).length).toBe(1000);
    });

    test('should handle non-string input', () => {
      expect(Sanitizer.sanitizeInput(123)).toBe('');
      expect(Sanitizer.sanitizeInput(null)).toBe('');
      expect(Sanitizer.sanitizeInput(undefined)).toBe('');
    });

    test('should remove null bytes', () => {
      expect(Sanitizer.sanitizeInput('hello\0world')).toBe('helloworld');
    });

    test('should remove control characters except newlines and tabs', () => {
      expect(Sanitizer.sanitizeInput('hello\x01world')).toBe('helloworld');
      expect(Sanitizer.sanitizeInput('hello\nworld')).toBe('hello\nworld');
      expect(Sanitizer.sanitizeInput('hello\tworld')).toBe('hello\tworld');
    });

    test('should handle empty string', () => {
      expect(Sanitizer.sanitizeInput('')).toBe('');
    });

    test('should handle string with only whitespace', () => {
      expect(Sanitizer.sanitizeInput('   ')).toBe('');
    });
  });

  describe('validateName', () => {
    test('should accept valid names', () => {
      const result = Sanitizer.validateName('John Doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
      expect(result.error).toBeNull();
    });

    test('should accept names with numbers', () => {
      const result = Sanitizer.validateName('User123');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('User123');
    });

    test('should accept names with hyphens and underscores', () => {
      expect(Sanitizer.validateName('Mary-Jane').valid).toBe(true);
      expect(Sanitizer.validateName('user_name').valid).toBe(true);
    });

    test('should reject empty names', () => {
      const result = Sanitizer.validateName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name cannot be empty');
    });

    test('should reject names with only whitespace', () => {
      const result = Sanitizer.validateName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name cannot be empty');
    });

    test('should reject names that are too short', () => {
      const result = Sanitizer.validateName('A');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name must be at least 2 characters');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = Sanitizer.validateName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name must be less than 50 characters');
    });

    test('should reject names with invalid characters', () => {
      expect(Sanitizer.validateName('John@Doe').valid).toBe(false);
      expect(Sanitizer.validateName('John<script>').valid).toBe(false);
      expect(Sanitizer.validateName('John!Doe').valid).toBe(false);
    });

    test('should trim and validate', () => {
      const result = Sanitizer.validateName('  John  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John');
    });
  });

  describe('validateMessage', () => {
    test('should accept valid messages', () => {
      const result = Sanitizer.validateMessage('Dear God, please help me.');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Dear God, please help me.');
      expect(result.error).toBeNull();
    });

    test('should reject empty messages', () => {
      const result = Sanitizer.validateMessage('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    test('should reject messages with only whitespace', () => {
      const result = Sanitizer.validateMessage('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(5001);
      const result = Sanitizer.validateMessage(longMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Message is too long (max 5000 characters)');
    });

    test('should accept messages up to 5000 characters', () => {
      const maxMessage = 'a'.repeat(5000);
      const result = Sanitizer.validateMessage(maxMessage);
      expect(result.valid).toBe(true);
    });

    test('should sanitize control characters', () => {
      const result = Sanitizer.validateMessage('Hello\x01World');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('HelloWorld');
    });

    test('should preserve newlines and tabs', () => {
      const result = Sanitizer.validateMessage('Hello\nWorld\tTest');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Hello\nWorld\tTest');
    });
  });

  describe('validateRole', () => {
    test('should accept valid roles', () => {
      expect(Sanitizer.validateRole('believer').valid).toBe(true);
      expect(Sanitizer.validateRole('angel').valid).toBe(true);
      expect(Sanitizer.validateRole('prophet').valid).toBe(true);
    });

    test('should accept roles in uppercase', () => {
      expect(Sanitizer.validateRole('BELIEVER').valid).toBe(true);
      expect(Sanitizer.validateRole('Angel').valid).toBe(true);
      expect(Sanitizer.validateRole('PROPHET').valid).toBe(true);
    });

    test('should reject invalid roles', () => {
      expect(Sanitizer.validateRole('admin').valid).toBe(false);
      expect(Sanitizer.validateRole('user').valid).toBe(false);
      expect(Sanitizer.validateRole('').valid).toBe(false);
    });

    test('should return sanitized lowercase role', () => {
      const result = Sanitizer.validateRole('BELIEVER');
      expect(result.sanitized).toBe('believer');
    });

    test('should trim whitespace', () => {
      const result = Sanitizer.validateRole('  angel  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('angel');
    });
  });

  describe('sanitizeForStorage', () => {
    test('should convert object to JSON string', () => {
      const data = { name: 'John', age: 30 };
      const result = Sanitizer.sanitizeForStorage(data);
      expect(result).toBe('{"name":"John","age":30}');
    });

    test('should remove functions', () => {
      const data = { name: 'John', greet: function() {} };
      const result = Sanitizer.sanitizeForStorage(data);
      expect(result).toBe('{"name":"John"}');
    });

    test('should remove undefined values', () => {
      const data = { name: 'John', age: undefined };
      const result = Sanitizer.sanitizeForStorage(data);
      expect(result).toBe('{"name":"John"}');
    });

    test('should handle arrays', () => {
      const data = [1, 2, 3];
      const result = Sanitizer.sanitizeForStorage(data);
      expect(result).toBe('[1,2,3]');
    });

    test('should handle circular references gracefully', () => {
      const data = { name: 'John' };
      data.self = data; // Create circular reference
      const result = Sanitizer.sanitizeForStorage(data);
      expect(result).toBe('{}'); // Should return empty object on error
    });

    test('should handle null', () => {
      const result = Sanitizer.sanitizeForStorage(null);
      expect(result).toBe('null');
    });
  });

  describe('checkRateLimit', () => {
    test('should allow requests within limit', () => {
      const result = Sanitizer.checkRateLimit('test', 5, 60000);
      expect(result).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        Sanitizer.checkRateLimit('test', 5, 60000);
      }
      const result = Sanitizer.checkRateLimit('test', 5, 60000);
      expect(result).toBe(false);
    });

    test('should use separate counters for different keys', () => {
      for (let i = 0; i < 5; i++) {
        Sanitizer.checkRateLimit('key1', 5, 60000);
      }
      const result = Sanitizer.checkRateLimit('key2', 5, 60000);
      expect(result).toBe(true);
    });

    test('should reset after time window', () => {
      // Mock Date.now
      const originalNow = Date.now;
      Date.now = jest.fn(() => 1000);
      
      // Fill up the rate limit
      for (let i = 0; i < 5; i++) {
        Sanitizer.checkRateLimit('test', 5, 1000);
      }
      
      // Should be blocked
      expect(Sanitizer.checkRateLimit('test', 5, 1000)).toBe(false);
      
      // Simulate time passing beyond window
      Date.now = jest.fn(() => 3000);
      
      // Should be allowed again
      const result = Sanitizer.checkRateLimit('test', 5, 1000);
      expect(result).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });

    test('should handle localStorage errors gracefully', () => {
      // Save the original mock implementation
      const originalGetItem = localStorage.getItem;
      
      // Temporarily replace with error-throwing implementation
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });
      
      const result = Sanitizer.checkRateLimit('test', 5, 60000);
      expect(result).toBe(true); // Should allow on error
      
      // Restore original mock
      localStorage.getItem = originalGetItem;
    });

    test('should use default parameters', () => {
      const result = Sanitizer.checkRateLimit('test');
      expect(result).toBe(true);
    });
  });

  describe('validateNumber', () => {
    test('should accept valid numbers', () => {
      const result = Sanitizer.validateNumber(42);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBeNull();
    });

    test('should accept string numbers', () => {
      const result = Sanitizer.validateNumber('42');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });

    test('should accept zero', () => {
      const result = Sanitizer.validateNumber(0);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0);
    });

    test('should accept negative numbers when min allows', () => {
      const result = Sanitizer.validateNumber(-5, -10, 10);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(-5);
    });

    test('should accept decimal numbers', () => {
      const result = Sanitizer.validateNumber(3.14);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(3.14);
    });

    test('should reject invalid numbers', () => {
      const result = Sanitizer.validateNumber('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid number');
    });

    test('should reject NaN', () => {
      const result = Sanitizer.validateNumber(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid number');
    });

    test('should enforce minimum value', () => {
      const result = Sanitizer.validateNumber(5, 10, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Number must be at least 10');
    });

    test('should enforce maximum value', () => {
      const result = Sanitizer.validateNumber(150, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Number must be at most 100');
    });

    test('should accept number at min boundary', () => {
      const result = Sanitizer.validateNumber(10, 10, 100);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(10);
    });

    test('should accept number at max boundary', () => {
      const result = Sanitizer.validateNumber(100, 0, 100);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(100);
    });

    test('should use default min and max', () => {
      const result = Sanitizer.validateNumber(1000000);
      expect(result.valid).toBe(true);
    });
  });
});
