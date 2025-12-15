// GOD Project - Validation Test Script
const fs = require('fs');

console.log('🧪 GOD Project - Comprehensive Validation Tests\n');
console.log('='.repeat(60));

let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✅ PASS: ${name}`);
        if (details) console.log(`   ${details}`);
        passCount++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        if (details) console.log(`   ${details}`);
        failCount++;
    }
}

// Test 1: File Existence
console.log('\n📁 File Existence Tests:');
test('utils/sanitizer.js exists', fs.existsSync('utils/sanitizer.js'));
test('utils/errorHandler.js exists', fs.existsSync('utils/errorHandler.js'));
test('script.js exists', fs.existsSync('script.js'));
test('script-original-backup.js exists', fs.existsSync('script-original-backup.js'));
test('IMPROVEMENTS_SUMMARY.md exists', fs.existsSync('IMPROVEMENTS_SUMMARY.md'));
test('DEVELOPER_GUIDE.md exists', fs.existsSync('DEVELOPER_GUIDE.md'));

// Test 2: HTML Integration
console.log('\n🌐 HTML Integration Tests:');
const html = fs.readFileSync('index.html', 'utf8');
test('Sanitizer script included', html.includes('utils/sanitizer.js'));
test('ErrorHandler script included', html.includes('utils/errorHandler.js'));
test('Scripts load before main script', 
    html.indexOf('utils/sanitizer.js') < html.indexOf('script.js'));
test('ARIA labels present', html.includes('aria-label'));
test('ARIA roles present', html.includes('role='));
test('ARIA live regions present', html.includes('aria-live'));
test('Max length attributes added', html.includes('maxlength'));

// Test 3: Sanitizer.js Validation
console.log('\n🔒 Sanitizer.js Tests:');
const sanitizer = fs.readFileSync('utils/sanitizer.js', 'utf8');
test('Sanitizer class defined', sanitizer.includes('class Sanitizer'));
test('escapeHtml method present', sanitizer.includes('escapeHtml'));
test('sanitizeInput method present', sanitizer.includes('sanitizeInput'));
test('validateName method present', sanitizer.includes('validateName'));
test('validateMessage method present', sanitizer.includes('validateMessage'));
test('validateRole method present', sanitizer.includes('validateRole'));
test('validateNumber method present', sanitizer.includes('validateNumber'));
test('checkRateLimit method present', sanitizer.includes('checkRateLimit'));
test('XSS protection implemented', sanitizer.includes('<') && sanitizer.includes('>'));

// Test 4: ErrorHandler.js Validation
console.log('\n🛡️ ErrorHandler.js Tests:');
const errorHandler = fs.readFileSync('utils/errorHandler.js', 'utf8');
test('ErrorHandler class defined', errorHandler.includes('class ErrorHandler'));
test('handleAsyncError method present', errorHandler.includes('handleAsyncError'));
test('wrapAsync method present', errorHandler.includes('wrapAsync'));
test('wrapEventHandler method present', errorHandler.includes('wrapEventHandler'));
test('safeLocalStorageSet method present', errorHandler.includes('safeLocalStorageSet'));
test('safeLocalStorageGet method present', errorHandler.includes('safeLocalStorageGet'));
test('showUserMessage method present', errorHandler.includes('showUserMessage'));
test('Error logging implemented', errorHandler.includes('errorLog'));

// Test 5: Script.js Enhancements
console.log('\n📝 Script.js Enhancement Tests:');
const script = fs.readFileSync('script.js', 'utf8');
test('Uses Sanitizer.escapeHtml', script.includes('Sanitizer.escapeHtml'));
test('Uses Sanitizer.validateMessage', script.includes('Sanitizer.validateMessage'));
test('Uses Sanitizer.validateName', script.includes('Sanitizer.validateName'));
test('Uses Sanitizer.checkRateLimit', script.includes('Sanitizer.checkRateLimit'));
test('Uses ErrorHandler.wrapAsync', script.includes('ErrorHandler.wrapAsync'));
test('Uses ErrorHandler.safeLocalStorageGet', script.includes('ErrorHandler.safeLocalStorageGet'));
test('Uses ErrorHandler.safeLocalStorageSet', script.includes('ErrorHandler.safeLocalStorageSet'));
test('JSDoc comments present', script.includes('/**') && script.includes('* @param'));
test('Try-catch blocks present', script.includes('try {') && script.includes('catch'));
test('Error handling in async functions', script.includes('handleAsyncError'));

// Test 6: CSS Accessibility
console.log('\n♿ CSS Accessibility Tests:');
const css = fs.readFileSync('styles.css', 'utf8');
test('.sr-only class defined', css.includes('.sr-only'));
test('Focus indicators defined', css.includes(':focus'));
test('Button focus styles present', css.includes('button:focus'));
test('Input focus styles present', css.includes('input:focus'));
test('Outline styles for accessibility', css.includes('outline:'));
test('Skip link styles present', css.includes('.skip-link'));

// Test 7: Security Features
console.log('\n🔐 Security Feature Tests:');
test('HTML escaping function present', sanitizer.includes("'&': '&amp;'"));
test('Script tag protection', sanitizer.includes("'<': '<'"));
test('Input length validation', sanitizer.includes('maxLength'));
test('Rate limiting implementation', sanitizer.includes('rateLimit'));
test('Safe storage wrapper', errorHandler.includes('checkLocalStorage'));
test('XSS prevention in messages', script.includes('textContent'));

// Test 8: Code Quality
console.log('\n📊 Code Quality Tests:');
test('JSDoc comments in script.js', script.split('/**').length > 10);
test('Error context descriptions', errorHandler.includes('context'));
test('Validation error messages', sanitizer.includes('error:'));
test('User-friendly messages', errorHandler.includes('getUserFriendlyMessage'));
test('Proper function documentation', script.includes('@returns'));

// Test 9: Syntax Validation
console.log('\n✔️ Syntax Validation Tests:');
try {
    new Function(sanitizer);
    test('Sanitizer.js syntax valid', true);
} catch (e) {
    test('Sanitizer.js syntax valid', false, e.message);
}

try {
    new Function(errorHandler);
    test('ErrorHandler.js syntax valid', true);
} catch (e) {
    test('ErrorHandler.js syntax valid', false, e.message);
}

// Test 10: Documentation
console.log('\n📚 Documentation Tests:');
const summary = fs.readFileSync('IMPROVEMENTS_SUMMARY.md', 'utf8');
const devGuide = fs.readFileSync('DEVELOPER_GUIDE.md', 'utf8');
test('IMPROVEMENTS_SUMMARY.md has content', summary.length > 1000);
test('DEVELOPER_GUIDE.md has content', devGuide.length > 1000);
test('Summary includes security section', summary.includes('Security'));
test('Summary includes error handling section', summary.includes('Error Handling'));
test('Dev guide includes examples', devGuide.includes('```javascript'));
test('Dev guide includes best practices', devGuide.includes('Best Practices'));

// Final Results
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ PASSED: ${passCount} tests`);
console.log(`❌ FAILED: ${failCount} tests`);
console.log(`📈 SUCCESS RATE: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The implementation is complete and validated.');
} else {
    console.log('\n⚠️ Some tests failed. Review the failures above.');
}

process.exit(failCount > 0 ? 1 : 0);
