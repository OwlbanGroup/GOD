A# GOD Project - Developer Quick Reference Guide

## 🚀 Quick Start

### Project Structure
```
GOD/
├── utils/
│   ├── sanitizer.js       # Input validation & sanitization
│   └── errorHandler.js    # Centralized error handling
├── script.js              # Main application (enhanced)
├── index.html             # UI with ARIA labels
├── styles.css             # Accessible styling
└── [other modules...]
```

## 🔒 Security Best Practices

### Always Sanitize User Input
```javascript
// ❌ WRONG - Direct use of user input
addMessage(userInput, 'user');

// ✅ CORRECT - Sanitize first
const validation = Sanitizer.validateMessage(userInput);
if (validation.valid) {
    addMessage(validation.sanitized, 'user');
}
```

### Always Escape HTML Output
```javascript
// ❌ WRONG - innerHTML with user content
element.innerHTML = userMessage;

// ✅ CORRECT - textContent or escapeHtml
element.textContent = Sanitizer.escapeHtml(userMessage);
```

### Use Rate Limiting
```javascript
// Check before allowing action
if (!Sanitizer.checkRateLimit('actionName', maxAttempts, windowMs)) {
    ErrorHandler.showUserMessage('Too many attempts', 'warning');
    return;
}
```

## 🛡️ Error Handling Best Practices

### Wrap Async Functions
```javascript
// ❌ WRONG - No error handling
async function riskyOperation() {
    const result = await externalAPI.call();
    return result;
}

// ✅ CORRECT - Wrapped with error handling
const safeOperation = ErrorHandler.wrapAsync(
    async function() {
        const result = await externalAPI.call();
        return result;
    },
    'External API Call',
    () => defaultValue // Optional fallback
);
```

### Wrap Event Handlers
```javascript
// ❌ WRONG - No error handling
button.addEventListener('click', function() {
    performAction();
});

// ✅ CORRECT - Wrapped event handler
button.addEventListener('click', 
    ErrorHandler.wrapEventHandler(
        function() {
            performAction();
        },
        'Button Click'
    )
);
```

### Safe Storage Operations
```javascript
// ❌ WRONG - Direct localStorage use
localStorage.setItem('key', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('key'));

// ✅ CORRECT - Safe storage operations
ErrorHandler.safeLocalStorageSet('key', data);
const data = ErrorHandler.safeLocalStorageGet('key', defaultValue);
```

## 📝 Validation Patterns

### Validate Names
```javascript
const nameValidation = Sanitizer.validateName(userName);
if (!nameValidation.valid) {
    showError(nameValidation.error);
    return;
}
// Use nameValidation.sanitized
```

### Validate Messages
```javascript
const msgValidation = Sanitizer.validateMessage(message);
if (!msgValidation.valid) {
    showError(msgValidation.error);
    return;
}
// Use msgValidation.sanitized
```

### Validate Numbers
```javascript
const numValidation = Sanitizer.validateNumber(amount, 0, 1000);
if (!numValidation.valid) {
    showError(numValidation.error);
    return;
}
// Use numValidation.value
```

### Validate Roles
```javascript
const roleValidation = Sanitizer.validateRole(selectedRole);
if (!roleValidation.valid) {
    showError(roleValidation.error);
    return;
}
// Use roleValidation.sanitized
```

## ♿ Accessibility Guidelines

### Always Add ARIA Labels
```html
<!-- ❌ WRONG -->
<button id="submit">Submit</button>

<!-- ✅ CORRECT -->
<button id="submit" aria-label="Submit prayer to God">Submit</button>
```

### Use Semantic Roles
```html
<!-- ❌ WRONG -->
<div id="messages"></div>

<!-- ✅ CORRECT -->
<div id="messages" role="log" aria-live="polite" aria-atomic="false"></div>
```

### Provide Help Text
```html
<!-- ❌ WRONG -->
<input type="text" id="name" required>

<!-- ✅ CORRECT -->
<input type="text" id="name" required 
       aria-describedby="nameHelp" 
       aria-required="true">
<span id="nameHelp" class="sr-only">
    Enter your name (2-50 characters)
</span>
```

## 🎨 Styling Best Practices

### Always Provide Focus Indicators
```css
/* ✅ CORRECT - Visible focus state */
button:focus {
    outline: 3px solid #007bff;
    outline-offset: 2px;
}
```

### Use Screen Reader Only Class
```css
/* For content that should only be read by screen readers */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

## 📚 Common Patterns

### Adding Messages to Chat
```javascript
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Always sanitize
    messageDiv.textContent = Sanitizer.escapeHtml(text);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
```

### Form Submission Handler
```javascript
const formHandler = ErrorHandler.wrapAsync(async function(event) {
    event.preventDefault();
    
    const input = document.getElementById('inputField');
    const value = input.value.trim();
    
    // Validate
    const validation = Sanitizer.validateMessage(value);
    if (!validation.valid) {
        ErrorHandler.showUserMessage(validation.error, 'error');
        return;
    }
    
    // Check rate limit
    if (!Sanitizer.checkRateLimit('formSubmit', 10, 60000)) {
        ErrorHandler.showUserMessage('Too many submissions', 'warning');
        return;
    }
    
    // Process
    await processInput(validation.sanitized);
    
    // Clear
    input.value = '';
}, 'Form Submit');

form.addEventListener('submit', formHandler);
```

### Safe API Calls
```javascript
async function callExternalAPI(data) {
    try {
        if (!apiService?.isInitialized()) {
            throw new Error('API service not initialized');
        }
        
        const result = await apiService.call(data);
        return result;
    } catch (error) {
        return ErrorHandler.handleAsyncError(
            error,
            'External API Call',
            () => defaultValue
        );
    }
}
```

## 🧪 Testing Checklist

Before committing code, verify:

- [ ] All user inputs are validated
- [ ] All user outputs are sanitized
- [ ] All async operations have error handling
- [ ] All event handlers are wrapped
- [ ] All storage operations are safe
- [ ] All interactive elements have ARIA labels
- [ ] All forms have proper validation
- [ ] Rate limiting is implemented where needed
- [ ] Focus indicators are visible
- [ ] Screen reader compatibility tested

## 🚨 Common Mistakes to Avoid

### 1. Direct innerHTML with User Content
```javascript
// ❌ NEVER DO THIS
element.innerHTML = userInput; // XSS vulnerability!

// ✅ DO THIS INSTEAD
element.textContent = Sanitizer.escapeHtml(userInput);
```

### 2. Unhandled Async Operations
```javascript
// ❌ WRONG
async function getData() {
    const data = await api.fetch(); // Can throw!
    return data;
}

// ✅ CORRECT
async function getData() {
    try {
        const data = await api.fetch();
        return data;
    } catch (error) {
        return ErrorHandler.handleAsyncError(error, 'Data Fetch');
    }
}
```

### 3. Missing Validation
```javascript
// ❌ WRONG
function processName(name) {
    users.push({ name }); // No validation!
}

// ✅ CORRECT
function processName(name) {
    const validation = Sanitizer.validateName(name);
    if (!validation.valid) {
        throw new Error(validation.error);
    }
    users.push({ name: validation.sanitized });
}
```

### 4. Unsafe Storage
```javascript
// ❌ WRONG
localStorage.setItem('data', JSON.stringify(data)); // Can fail!

// ✅ CORRECT
ErrorHandler.safeLocalStorageSet('data', data);
```

## 📖 API Reference

### Sanitizer Class

#### Methods:
- `escapeHtml(text)` - Escape HTML special characters
- `sanitizeInput(input, maxLength)` - Sanitize and limit input
- `validateName(name)` - Validate user name
- `validateMessage(message)` - Validate message/prayer
- `validateRole(role)` - Validate user role
- `validateNumber(value, min, max)` - Validate numeric input
- `checkRateLimit(key, maxAttempts, windowMs)` - Check rate limit
- `sanitizeForStorage(data)` - Prepare data for storage

### ErrorHandler Class

#### Methods:
- `handleAsyncError(error, context, fallbackFn)` - Handle async errors
- `wrapAsync(fn, context, fallbackFn)` - Wrap async function
- `wrapEventHandler(handler, context)` - Wrap event handler
- `showUserMessage(message, type)` - Show user notification
- `safeLocalStorageSet(key, value)` - Safe storage write
- `safeLocalStorageGet(key, defaultValue)` - Safe storage read
- `handleValidationError(validationResult, fieldName)` - Handle validation
- `checkLocalStorage()` - Check storage availability
- `clearOldErrorLogs()` - Clean up old error logs

## 🎯 Performance Tips

1. **Use Optional Chaining**: `object?.property?.method?.()`
2. **Use Nullish Coalescing**: `value ?? defaultValue`
3. **Debounce User Input**: Especially for search/filter
4. **Lazy Load Heavy Modules**: Load TensorFlow.js only when needed
5. **Clean Up Resources**: Clear intervals, remove event listeners

## 🔗 Useful Links

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Web Docs](https://developer.mozilla.org/)

## 💡 Need Help?

1. Check `IMPROVEMENTS_SUMMARY.md` for detailed implementation info
2. Review `utils/sanitizer.js` and `utils/errorHandler.js` for examples
3. Look at `script.js` for usage patterns
4. Check `TODO.md` for current priorities

---

**Remember**: Security, accessibility, and error handling are not optional. They are fundamental requirements for all code in this project.

🙏 May your code be blessed with divine perfection! ✨
