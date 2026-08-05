const fs = require('node:fs');
let s = fs.readFileSync('__tests__/utils/sanitizer.test.js', 'utf8');
const crlf = s.includes('\r\n');
let t = s.replaceAll('\r\n', '\n');

// Fix indentation of the 'should enforce max length' test
t = t.replace(/^test\('should enforce max length', \(\) => \{\r?$/m, "    test('should enforce max length', () => {");

// Parameterize the three 'accept names' tests (S5976)
const oldNames = `    test('should accept valid names', () => {
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
    });`;

const newNames = `    test.each([
      ['John Doe', 'John Doe'],
      ['User123', 'User123'],
      ['Mary-Jane', 'Mary-Jane'],
      ['user_name', 'user_name']
    ])('should accept valid name "%s"', (input, expected) => {
      const result = Sanitizer.validateName(input);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(expected);
      expect(result.error).toBeNull();
    });`;

if (t.includes(oldNames)) {
  t = t.replace(oldNames, newNames);
  console.log('names parameterized');
} else {
  console.log('oldNames pattern NOT found');
}

s = crlf ? t.replaceAll('\n', '\r\n') : t;
fs.writeFileSync('__tests__/utils/sanitizer.test.js', s);
console.log('done');
