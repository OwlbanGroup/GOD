/**
 * @jest-environment jsdom
 */

const ErrorHandler = require('../../utils/errorHandler.js');

describe('Integration: localStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should safely store and retrieve user data', () => {
    const user = { name: 'John', role: 'believer' };
    
    ErrorHandler.safeLocalStorageSet('currentUser', user);
    const retrieved = ErrorHandler.safeLocalStorageGet('currentUser');
    
    expect(retrieved).toEqual(user);
  });

  test('should handle storage quota exceeded', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    const result = ErrorHandler.safeLocalStorageSet('key', 'value');
    expect(result).toBe(false);
    
    setItemSpy.mockRestore();
  });

  test('should log errors to localStorage', () => {
    const error = new Error('Test error');
    ErrorHandler.logError(error, 'Test Context');
    
    const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
    expect(log.length).toBe(1);
    expect(log[0].context).toBe('Test Context');
  });

  test('should clear old error logs', () => {
    const oldError = { timestamp: new Date(Date.now() - 25*60*60*1000).toISOString() };
    localStorage.setItem('errorLog', JSON.stringify([oldError]));
    
    ErrorHandler.clearOldErrorLogs();
    
    const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
    expect(log.length).toBe(0);
  });
});
