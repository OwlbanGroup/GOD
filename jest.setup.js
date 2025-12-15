// Add custom matchers
require('@testing-library/jest-dom');

// Create a more robust localStorage mock that simulates real behavior
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Create the mock instance
const localStorageMock = new LocalStorageMock();

// Create mock functions
const getItemMock = jest.fn((key) => localStorageMock.getItem(key));
const setItemMock = jest.fn((key, value) => localStorageMock.setItem(key, value));
const removeItemMock = jest.fn((key) => localStorageMock.removeItem(key));
const clearMock = jest.fn(() => localStorageMock.clear());
const keyMock = jest.fn((index) => localStorageMock.key(index));

// Spy on the methods so they can be tracked by Jest
global.localStorage = {
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  clear: clearMock,
  get length() {
    return localStorageMock.length;
  },
  key: keyMock
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  // Clear the storage
  localStorageMock.clear();
  
  // Clear mock call history but keep the mock implementations
  // Use mockClear() instead of jest.clearAllMocks() to preserve implementations
  if (getItemMock.mockClear) getItemMock.mockClear();
  if (setItemMock.mockClear) setItemMock.mockClear();
  if (removeItemMock.mockClear) removeItemMock.mockClear();
  if (clearMock.mockClear) clearMock.mockClear();
  if (keyMock.mockClear) keyMock.mockClear();
  
  // Clear console mocks
  if (global.console.error.mockClear) global.console.error.mockClear();
  if (global.console.warn.mockClear) global.console.warn.mockClear();
  if (global.console.log.mockClear) global.console.log.mockClear();
});
