/**
 * @jest-environment jsdom
 */

const ErrorHandler = require('../../utils/errorHandler.js');

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true
    });
    
    // Mock window.location using Object.defineProperty to avoid JSDOM navigation warnings
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000',
        reload: jest.fn()
      }
    });
    
    // Clear console mocks
    console.error.mockClear();
    console.log.mockClear();
  });

  describe('handleAsyncError', () => {
    test('should log error to console', async () => {
      const error = new Error('Test error');
      await ErrorHandler.handleAsyncError(error, 'Test Context');
      
      expect(console.error).toHaveBeenCalledWith(
        'Error in Test Context:',
        error
      );
    });

    test('should return null when no fallback provided', async () => {
      const error = new Error('Test error');
      const result = await ErrorHandler.handleAsyncError(error, 'Test Context');
      
      expect(result).toBeNull();
    });

    test('should execute fallback function', async () => {
      const error = new Error('Test error');
      const fallback = jest.fn().mockResolvedValue('fallback result');
      
      const result = await ErrorHandler.handleAsyncError(error, 'Test Context', fallback);
      
      expect(fallback).toHaveBeenCalled();
      expect(result).toBe('fallback result');
    });

    test('should handle fallback errors gracefully', async () => {
      const error = new Error('Test error');
      const fallback = jest.fn().mockRejectedValue(new Error('Fallback error'));
      
      const result = await ErrorHandler.handleAsyncError(error, 'Test Context', fallback);
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Fallback error in Test Context:',
        expect.any(Error)
      );
    });

    test('should log error to localStorage', async () => {
      const error = new Error('Test error');
      
      // Mock localStorage.getItem to return empty array initially
      localStorage.getItem.mockReturnValueOnce('[]');
      
      await ErrorHandler.handleAsyncError(error, 'Test Context');
      
      // Verify setItem was called
      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCall = localStorage.setItem.mock.calls[0];
      expect(setItemCall[0]).toBe('errorLog');
      
      const errorLog = JSON.parse(setItemCall[1]);
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].context).toBe('Test Context');
      expect(errorLog[0].message).toBe('Test error');
    });
  });

  describe('wrapAsync', () => {
    test('should wrap async function successfully', async () => {
      const asyncFn = async (x) => x * 2;
      const wrapped = ErrorHandler.wrapAsync(asyncFn, 'Multiply');
      
      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    test('should handle errors in wrapped function', async () => {
      const asyncFn = async () => {
        throw new Error('Wrapped error');
      };
      const wrapped = ErrorHandler.wrapAsync(asyncFn, 'Test');
      
      const result = await wrapped();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('should preserve function context', async () => {
      const obj = {
        value: 10,
        asyncMethod: async function() {
          return this.value * 2;
        }
      };
      
      obj.asyncMethod = ErrorHandler.wrapAsync(obj.asyncMethod, 'Method');
      const result = await obj.asyncMethod();
      expect(result).toBe(20);
    });

    test('should pass arguments correctly', async () => {
      const asyncFn = async (a, b, c) => a + b + c;
      const wrapped = ErrorHandler.wrapAsync(asyncFn, 'Sum');
      
      const result = await wrapped(1, 2, 3);
      expect(result).toBe(6);
    });
  });

  describe('getUserFriendlyMessage', () => {
    test('should return specific message for known contexts', () => {
      expect(ErrorHandler.getUserFriendlyMessage(new Error(), 'AI Response'))
        .toBe('Unable to generate AI response. Using divine fallback.');
      
      expect(ErrorHandler.getUserFriendlyMessage(new Error(), 'Prayer Save'))
        .toBe('Prayer saved locally but cloud sync failed.');
      
      expect(ErrorHandler.getUserFriendlyMessage(new Error(), 'WebGL'))
        .toBe('Advanced graphics unavailable. Using standard rendering.');
    });

    test('should return generic message for unknown contexts', () => {
      const message = ErrorHandler.getUserFriendlyMessage(new Error(), 'Unknown Context');
      expect(message).toBe('An error occurred in Unknown Context. Please try again.');
    });

    test('should handle all predefined contexts', () => {
      const contexts = [
        'AI Response', 'Prayer Save', 'User Registration', 'Universe Optimization',
        'Prayer Analysis', 'Prophecy Generation', 'Cloud Sync', 'Encryption',
        'Token Offering', 'WebGL', 'Audio'
      ];
      
      contexts.forEach(context => {
        const message = ErrorHandler.getUserFriendlyMessage(new Error(), context);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('showUserMessage', () => {
    test('should log message when addMessage is not available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      ErrorHandler.showUserMessage('Test message', 'info');
      
      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test message');
      consoleSpy.mockRestore();
    });

    test('should call addMessage if available', () => {
      global.addMessage = jest.fn();
      
      ErrorHandler.showUserMessage('Test message', 'error');
      
      expect(global.addMessage).toHaveBeenCalledWith('[ERROR] Test message', 'god');
      
      delete global.addMessage;
    });

    test('should handle different message types', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      ErrorHandler.showUserMessage('Info', 'info');
      ErrorHandler.showUserMessage('Warning', 'warning');
      ErrorHandler.showUserMessage('Error', 'error');
      ErrorHandler.showUserMessage('Success', 'success');
      
      expect(consoleSpy).toHaveBeenCalledTimes(4);
      consoleSpy.mockRestore();
    });
  });

  describe('logError', () => {
    test('should store error in localStorage', () => {
      const error = new Error('Test error');
      
      // Mock localStorage.getItem to return empty array initially
      localStorage.getItem.mockReturnValueOnce('[]');
      
      ErrorHandler.logError(error, 'Test Context');
      
      // Verify setItem was called
      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCall = localStorage.setItem.mock.calls[0];
      expect(setItemCall[0]).toBe('errorLog');
      
      const errorLog = JSON.parse(setItemCall[1]);
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].context).toBe('Test Context');
      expect(errorLog[0].message).toBe('Test error');
      expect(errorLog[0].timestamp).toBeTruthy();
    });

    test('should limit error log to 50 entries', () => {
      // Mock localStorage to return existing errors
      let currentLog = [];
      localStorage.getItem.mockImplementation(() => JSON.stringify(currentLog));
      localStorage.setItem.mockImplementation((key, value) => {
        currentLog = JSON.parse(value);
      });
      
      // Add 60 errors
      for (let i = 0; i < 60; i++) {
        ErrorHandler.logError(new Error(`Error ${i}`), 'Test');
      }
      
      expect(currentLog.length).toBe(50);
      expect(currentLog[0].message).toBe('Error 59'); // Most recent first
    });

    test('should include error stack trace', () => {
      const error = new Error('Test error');
      
      // Mock localStorage.getItem to return empty array initially
      localStorage.getItem.mockReturnValueOnce('[]');
      
      ErrorHandler.logError(error, 'Test Context');
      
      // Verify setItem was called
      const setItemCall = localStorage.setItem.mock.calls[0];
      const errorLog = JSON.parse(setItemCall[1]);
      expect(errorLog[0].stack).toBeTruthy();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      
      expect(() => {
        ErrorHandler.logError(new Error('Test'), 'Test');
      }).not.toThrow();
    });
  });

  describe('handleWebGLError', () => {
    test('should return true to signal fallback', () => {
      const result = ErrorHandler.handleWebGLError(new Error('WebGL error'));
      expect(result).toBe(true);
    });

    test('should log error to console', () => {
      ErrorHandler.handleWebGLError(new Error('WebGL error'));
      expect(console.error).toHaveBeenCalledWith('WebGL Error:', expect.any(Error));
    });
  });

  describe('handleNetworkError', () => {
    test('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      const result = ErrorHandler.handleNetworkError(new Error('Network error'), 'TestAPI');
      
      expect(result.success).toBe(false);
      expect(result.offline).toBe(true);
      expect(result.error).toContain('No internet connection');
    });

    test('should detect timeout errors', () => {
      const result = ErrorHandler.handleNetworkError(
        new Error('Request timeout'),
        'TestAPI'
      );
      
      expect(result.error).toContain('timed out');
    });

    test('should detect authentication errors', () => {
      const result401 = ErrorHandler.handleNetworkError(
        new Error('401 Unauthorized'),
        'TestAPI'
      );
      expect(result401.error).toContain('Authentication failed');
      
      const result403 = ErrorHandler.handleNetworkError(
        new Error('403 Forbidden'),
        'TestAPI'
      );
      expect(result403.error).toContain('Authentication failed');
    });

    test('should return error response object', () => {
      const result = ErrorHandler.handleNetworkError(new Error('Network error'), 'TestAPI');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('offline');
    });
  });

  describe('checkLocalStorage', () => {
    test('should return true when localStorage is available', () => {
      const result = ErrorHandler.checkLocalStorage();
      expect(result).toBe(true);
    });

    test('should handle quota exceeded errors', () => {
      // Mock localStorage to throw quota error
      localStorage.setItem.mockImplementationOnce(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = ErrorHandler.checkLocalStorage();
      expect(result).toBe(false);
    });

    test('should handle other localStorage errors', () => {
      // Mock localStorage to throw error
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = ErrorHandler.checkLocalStorage();
      expect(result).toBe(false);
    });
  });

  describe('safeLocalStorageSet', () => {
    test('should store string values', () => {
      const result = ErrorHandler.safeLocalStorageSet('key', 'value');
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
    });

    test('should stringify non-string values', () => {
      const obj = { name: 'John', age: 30 };
      const result = ErrorHandler.safeLocalStorageSet('key', obj);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(obj));
    });

    test('should return false when localStorage unavailable', () => {
      // Mock localStorage to throw error
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = ErrorHandler.safeLocalStorageSet('key', 'value');
      expect(result).toBe(false);
    });

    test('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = ErrorHandler.safeLocalStorageSet('key', arr);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(arr));
    });
  });

  describe('safeLocalStorageGet', () => {
    test('should retrieve and parse JSON values', () => {
      const obj = { name: 'John', age: 30 };
      localStorage.getItem.mockReturnValueOnce(JSON.stringify(obj));
      
      const result = ErrorHandler.safeLocalStorageGet('key');
      expect(result).toEqual(obj);
    });

    test('should return string values when JSON parse fails', () => {
      localStorage.getItem.mockReturnValueOnce('plain string');
      
      const result = ErrorHandler.safeLocalStorageGet('key');
      expect(result).toBe('plain string');
    });

    test('should return default value when key not found', () => {
      localStorage.getItem.mockReturnValueOnce(null);
      
      const result = ErrorHandler.safeLocalStorageGet('key', 'default');
      expect(result).toBe('default');
    });

    test('should return default value on error', () => {
      // Mock localStorage to throw error
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = ErrorHandler.safeLocalStorageGet('key', 'default');
      expect(result).toBe('default');
    });

    test('should handle arrays', () => {
      const arr = [1, 2, 3];
      localStorage.getItem.mockReturnValueOnce(JSON.stringify(arr));
      
      const result = ErrorHandler.safeLocalStorageGet('key');
      expect(result).toEqual(arr);
    });
  });

  describe('handleValidationError', () => {
    test('should return true for valid results', () => {
      const validResult = { valid: true, sanitized: 'value', error: null };
      const result = ErrorHandler.handleValidationError(validResult, 'TestField');
      
      expect(result).toBe(true);
    });

    test('should return false and show message for invalid results', () => {
      const invalidResult = { valid: false, sanitized: '', error: 'Invalid input' };
      const result = ErrorHandler.handleValidationError(invalidResult, 'TestField');
      
      expect(result).toBe(false);
    });
  });

  describe('wrapEventHandler', () => {
    test('should wrap event handler successfully', () => {
      const handler = jest.fn((event) => event.target.value);
      const wrapped = ErrorHandler.wrapEventHandler(handler, 'Click');
      
      const mockEvent = { target: { value: 'test' } };
      const result = wrapped(mockEvent);
      
      expect(handler).toHaveBeenCalledWith(mockEvent);
      expect(result).toBe('test');
    });

    test('should catch errors in event handler', () => {
      const handler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const wrapped = ErrorHandler.wrapEventHandler(handler, 'Click');
      
      expect(() => wrapped({})).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    test('should preserve handler context', () => {
      const obj = {
        value: 'test',
        handler: function(event) {
          return this.value;
        }
      };
      
      obj.handler = ErrorHandler.wrapEventHandler(obj.handler, 'Handler');
      const result = obj.handler({});
      expect(result).toBe('test');
    });
  });

  describe('clearOldErrorLogs', () => {
    test('should remove errors older than 24 hours', () => {
      const now = Date.now();
      const oldError = {
        timestamp: new Date(now - 25 * 60 * 60 * 1000).toISOString(),
        message: 'Old error'
      };
      const recentError = {
        timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        message: 'Recent error'
      };
      
      // Mock localStorage to return the error log
      localStorage.getItem.mockReturnValueOnce(JSON.stringify([recentError, oldError]));
      
      ErrorHandler.clearOldErrorLogs();
      
      // Verify setItem was called with filtered errors
      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCall = localStorage.setItem.mock.calls[0];
      const errorLog = JSON.parse(setItemCall[1]);
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].message).toBe('Recent error');
    });

    test('should handle empty error log', () => {
      localStorage.getItem.mockReturnValueOnce('[]');
      
      expect(() => ErrorHandler.clearOldErrorLogs()).not.toThrow();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      expect(() => ErrorHandler.clearOldErrorLogs()).not.toThrow();
    });
  });
});
