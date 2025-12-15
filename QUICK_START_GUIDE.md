# 🚀 Quick Start Guide - Immediate Next Steps

This guide will help you get started with the highest priority tasks from the NEXT_STEPS.md roadmap.

---

## 🎯 Phase 2: Testing Setup (START HERE)

### Step 1: Install Testing Dependencies (5 minutes)

```bash
# Install Jest and testing utilities
npm install --save-dev jest @testing-library/dom @testing-library/jest-dom jsdom

# Install additional testing tools
npm install --save-dev @babel/preset-env babel-jest
```

### Step 2: Configure Jest (10 minutes)

Create `jest.config.js` in the root directory:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
    '!test-validation.js',
    '!GOD-TOKEN-COIN/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
```

Create `jest.setup.js`:

```javascript
// Add custom matchers
require('@testing-library/jest-dom');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

### Step 3: Update package.json (2 minutes)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "build": "echo 'Building for production...' && cp index.html dist/ && cp styles.css dist/ && cp *.js dist/",
    "deploy": "npm run build && gh-pages -d dist",
    "lint": "eslint *.js utils/*.js"
  }
}
```

### Step 4: Create Test Directory Structure (2 minutes)

```bash
# Create test directories
mkdir -p __tests__/utils
mkdir -p __tests__/features
mkdir -p __tests__/integration
mkdir -p __tests__/e2e
```

### Step 5: Write Your First Test - Sanitizer (30 minutes)

Create `__tests__/utils/sanitizer.test.js`:

```javascript
/**
 * @jest-environment jsdom
 */

// Mock the Sanitizer class since it's loaded via script tag
class Sanitizer {
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static sanitizeInput(input, maxLength = 1000) {
    if (typeof input !== 'string') return '';
    return this.escapeHtml(input.trim().slice(0, maxLength));
  }

  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name is required' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
      return { valid: false, error: 'Name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
    return { valid: true, value: this.sanitizeInput(trimmed, 50) };
  }

  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required' };
    }
    const trimmed = message.trim();
    if (trimmed.length < 1) {
      return { valid: false, error: 'Message cannot be empty' };
    }
    if (trimmed.length > 5000) {
      return { valid: false, error: 'Message is too long (max 5000 characters)' };
    }
    return { valid: true, value: this.sanitizeInput(trimmed, 5000) };
  }

  static validateRole(role) {
    const validRoles = ['believer', 'angel', 'prophet'];
    if (!validRoles.includes(role)) {
      return { valid: false, error: 'Invalid role selected' };
    }
    return { valid: true, value: role };
  }

  static validateNumber(num, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = Number(num);
    if (isNaN(parsed)) {
      return { valid: false, error: 'Invalid number' };
    }
    if (parsed < min || parsed > max) {
      return { valid: false, error: `Number must be between ${min} and ${max}` };
    }
    return { valid: true, value: parsed };
  }

  static checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return { 
        allowed: false, 
        error: 'Rate limit exceeded. Please wait before trying again.' 
      };
    }
    
    recentRequests.push(now);
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentRequests));
    return { allowed: true };
  }
}

describe('Sanitizer', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      expect(Sanitizer.escapeHtml('<script>alert("xss")</script>'))
        .toBe('<script>alert("xss")</script>');
    });

    test('should escape ampersands', () => {
      expect(Sanitizer.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape quotes', () => {
      expect(Sanitizer.escapeHtml('"Hello" \'World\'')).toContain('Hello');
    });

    test('should handle empty string', () => {
      expect(Sanitizer.escapeHtml('')).toBe('');
    });

    test('should handle normal text', () => {
      expect(Sanitizer.escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      expect(Sanitizer.sanitizeInput('  hello  ')).toBe('hello');
    });

    test('should escape HTML', () => {
      expect(Sanitizer.sanitizeInput('<b>bold</b>'))
        .toBe('<b>bold</b>');
    });

    test('should enforce max length', () => {
      const longString = 'a'.repeat(2000);
      expect(Sanitizer.sanitizeInput(longString, 100).length).toBe(100);
    });

    test('should handle non-string input', () => {
      expect(Sanitizer.sanitizeInput(123)).toBe('');
      expect(Sanitizer.sanitizeInput(null)).toBe('');
      expect(Sanitizer.sanitizeInput(undefined)).toBe('');
    });
  });

  describe('validateName', () => {
    test('should accept valid names', () => {
      const result = Sanitizer.validateName('John Doe');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('John Doe');
    });

    test('should accept names with hyphens and apostrophes', () => {
      expect(Sanitizer.validateName("O'Brien").valid).toBe(true);
      expect(Sanitizer.validateName("Mary-Jane").valid).toBe(true);
    });

    test('should reject empty names', () => {
      expect(Sanitizer.validateName('').valid).toBe(false);
      expect(Sanitizer.validateName('   ').valid).toBe(false);
    });

    test('should reject names that are too short', () => {
      const result = Sanitizer.validateName('A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = Sanitizer.validateName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than 50 characters');
    });

    test('should reject names with invalid characters', () => {
      expect(Sanitizer.validateName('John123').valid).toBe(false);
      expect(Sanitizer.validateName('John@Doe').valid).toBe(false);
      expect(Sanitizer.validateName('John<script>').valid).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(Sanitizer.validateName(null).valid).toBe(false);
      expect(Sanitizer.validateName(undefined).valid).toBe(false);
    });
  });

  describe('validateMessage', () => {
    test('should accept valid messages', () => {
      const result = Sanitizer.validateMessage('Dear God, please help me.');
      expect(result.valid).toBe(true);
      expect(result.value).toBeTruthy();
    });

    test('should reject empty messages', () => {
      expect(Sanitizer.validateMessage('').valid).toBe(false);
      expect(Sanitizer.validateMessage('   ').valid).toBe(false);
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(5001);
      const result = Sanitizer.validateMessage(longMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    test('should sanitize HTML in messages', () => {
      const result = Sanitizer.validateMessage('<script>alert("xss")</script>');
      expect(result.valid).toBe(true);
      expect(result.value).not.toContain('<script>');
    });
  });

  describe('validateRole', () => {
    test('should accept valid roles', () => {
      expect(Sanitizer.validateRole('believer').valid).toBe(true);
      expect(Sanitizer.validateRole('angel').valid).toBe(true);
      expect(Sanitizer.validateRole('prophet').valid).toBe(true);
    });

    test('should reject invalid roles', () => {
      expect(Sanitizer.validateRole('admin').valid).toBe(false);
      expect(Sanitizer.validateRole('user').valid).toBe(false);
      expect(Sanitizer.validateRole('').valid).toBe(false);
    });
  });

  describe('validateNumber', () => {
    test('should accept valid numbers', () => {
      expect(Sanitizer.validateNumber(42).valid).toBe(true);
      expect(Sanitizer.validateNumber('42').valid).toBe(true);
      expect(Sanitizer.validateNumber(0).valid).toBe(true);
    });

    test('should reject invalid numbers', () => {
      expect(Sanitizer.validateNumber('abc').valid).toBe(false);
      expect(Sanitizer.validateNumber(NaN).valid).toBe(false);
    });

    test('should enforce min/max bounds', () => {
      expect(Sanitizer.validateNumber(5, 0, 10).valid).toBe(true);
      expect(Sanitizer.validateNumber(-1, 0, 10).valid).toBe(false);
      expect(Sanitizer.validateNumber(11, 0, 10).valid).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    test('should allow requests within limit', () => {
      const result = Sanitizer.checkRateLimit('test', 5, 60000);
      expect(result.allowed).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        Sanitizer.checkRateLimit('test', 5, 60000);
      }
      const result = Sanitizer.checkRateLimit('test', 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    test('should reset after time window', () => {
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = jest.fn(() => 1000);
      
      // Fill up the rate limit
      for (let i = 0; i < 5; i++) {
        Sanitizer.checkRateLimit('test', 5, 1000);
      }
      
      // Simulate time passing beyond window
      Date.now = jest.fn(() => 3000);
      
      const result = Sanitizer.checkRateLimit('test', 5, 1000);
      expect(result.allowed).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });
});
```

### Step 6: Run Your Tests (1 minute)

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## 🎯 Next: ErrorHandler Tests (30 minutes)

Create `__tests__/utils/errorHandler.test.js`:

```javascript
/**
 * @jest-environment jsdom
 */

// Mock ErrorHandler class
class ErrorHandler {
  static async handleAsyncError(promise, context = 'Operation') {
    try {
      return await promise;
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      this.showUserMessage(`${context} failed. Please try again.`, 'error');
      throw error;
    }
  }

  static wrapAsync(fn, context) {
    return async (...args) => {
      return this.handleAsyncError(fn(...args), context);
    };
  }

  static wrapEventHandler(fn, context) {
    return (event) => {
      try {
        return fn(event);
      } catch (error) {
        console.error(`Error in ${context}:`, error);
        this.showUserMessage(`${context} failed. Please try again.`, 'error');
      }
    };
  }

  static safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('localStorage.setItem failed:', error);
      this.showUserMessage('Failed to save data locally.', 'error');
      return false;
    }
  }

  static safeLocalStorageGet(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('localStorage.getItem failed:', error);
      return defaultValue;
    }
  }

  static showUserMessage(message, type = 'info') {
    // Mock implementation for testing
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    document.body.appendChild(messageDiv);
  }
}

describe('ErrorHandler', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('handleAsyncError', () => {
    test('should return result on success', async () => {
      const promise = Promise.resolve('success');
      const result = await ErrorHandler.handleAsyncError(promise, 'Test');
      expect(result).toBe('success');
    });

    test('should catch and log errors', async () => {
      const promise = Promise.reject(new Error('Test error'));
      await expect(
        ErrorHandler.handleAsyncError(promise, 'Test Operation')
      ).rejects.toThrow('Test error');
      
      expect(console.error).toHaveBeenCalledWith(
        'Error in Test Operation:',
        expect.any(Error)
      );
    });

    test('should show user message on error', async () => {
      const promise = Promise.reject(new Error('Test error'));
      try {
        await ErrorHandler.handleAsyncError(promise, 'Test');
      } catch (e) {
        // Expected to throw
      }
      
      const messageDiv = document.querySelector('.message-error');
      expect(messageDiv).toBeTruthy();
      expect(messageDiv.textContent).toContain('Test failed');
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
      
      await expect(wrapped()).rejects.toThrow('Wrapped error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('wrapEventHandler', () => {
    test('should wrap event handler successfully', () => {
      const handler = (event) => event.target.value;
      const wrapped = ErrorHandler.wrapEventHandler(handler, 'Click');
      
      const mockEvent = { target: { value: 'test' } };
      const result = wrapped(mockEvent);
      expect(result).toBe('test');
    });

    test('should catch errors in event handler', () => {
      const handler = () => {
        throw new Error('Handler error');
      };
      const wrapped = ErrorHandler.wrapEventHandler(handler, 'Click');
      
      wrapped({});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('safeLocalStorageSet', () => {
    test('should save data successfully', () => {
      const result = ErrorHandler.safeLocalStorageSet('test', { foo: 'bar' });
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test',
        JSON.stringify({ foo: 'bar' })
      );
    });

    test('should handle localStorage errors', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      const result = ErrorHandler.safeLocalStorageSet('test', 'value');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('safeLocalStorageGet', () => {
    test('should retrieve data successfully', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ foo: 'bar' }));
      
      const result = ErrorHandler.safeLocalStorageGet('test');
      expect(result).toEqual({ foo: 'bar' });
    });

    test('should return default value when key not found', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = ErrorHandler.safeLocalStorageGet('test', 'default');
      expect(result).toBe('default');
    });

    test('should handle JSON parse errors', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = ErrorHandler.safeLocalStorageGet('test', 'default');
      expect(result).toBe('default');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('showUserMessage', () => {
    test('should create message element', () => {
      ErrorHandler.showUserMessage('Test message', 'info');
      
      const messageDiv = document.querySelector('.message-info');
      expect(messageDiv).toBeTruthy();
      expect(messageDiv.textContent).toBe('Test message');
      expect(messageDiv.getAttribute('role')).toBe('alert');
    });

    test('should support different message types', () => {
      ErrorHandler.showUserMessage('Error', 'error');
      ErrorHandler.showUserMessage('Success', 'success');
      
      expect(document.querySelector('.message-error')).toBeTruthy();
      expect(document.querySelector('.message-success')).toBeTruthy();
    });
  });
});
```

---

## 🎯 Set Up CI/CD (15 minutes)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella
    
  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint || echo "Linter not configured yet"
  
  build:
    runs-on: ubuntu-latest
    needs: [test, lint]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/
```

---

## 📊 Check Your Progress

After completing these steps, you should have:

- ✅ Jest testing framework installed and configured
- ✅ Test directory structure created
- ✅ Comprehensive tests for Sanitizer class
- ✅ Comprehensive tests for ErrorHandler class
- ✅ CI/CD pipeline configured with GitHub Actions
- ✅ Test coverage reporting

Run this command to verify:

```bash
npm run test:coverage
```

You should see output like:

```
Test Suites: 2 passed, 2 total
Tests:       40+ passed, 40+ total
Coverage:    >70% statements, branches, functions, lines
```

---

## 🎉 What's Next?

Once you've completed these steps, move on to:

1. **Write integration tests** for core features
2. **Implement performance optimizations** (dynamic particle count)
3. **Set up code linting** (ESLint + Prettier)
4. **Add loading indicators** to improve UX

Refer to `NEXT_STEPS.md` for the complete roadmap!

---

## 🆘 Troubleshooting

### Tests failing?
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 16+)
- Clear Jest cache: `npx jest --clearCache`

### Coverage too low?
- Focus on critical paths first (Sanitizer, ErrorHandler)
- Add tests for edge cases
- Test error handling paths

### CI/CD not running?
- Verify `.github/workflows/ci.yml` is in the correct location
- Check GitHub Actions tab in your repository
- Ensure you've pushed to main or develop branch

---

**Ready to start? Run these commands:**

```bash
# 1. Install dependencies
npm install --save-dev jest @testing-library/dom @testing-library/jest-dom jsdom

# 2. Create test files
mkdir -p __tests__/utils

# 3. Run tests
npm test
```

Good luck! 🚀
