# TODO: Fix SonarLint Issues in utils/sanitizer.js

- [x] 1. Line 1: Remove unused imports (info, warn, debug)
- [x] 2. Line 51: Use replaceAll for null byte removal (S7781)
- [x] 3. Line 57: Simplify HTML tag-stripping regex complexity (S5843)
- [x] 4. Line 60: Use replaceAll for angle bracket encoding (S7781)
- [x] 5. Line 63: Simplify SQL-injection keyword regex (S5843)
- [x] 6. Line 66: Replace alternation with char class (S6035)
- [x] 7. Line 145: Use structuredClone (S7784)
- [x] 8. Lines 194/196: Use Number.parseFloat / Number.isNaN (S7773)
- [x] 9. Lines 226/275: Use \d instead of [0-9] (S6353)
- [x] 10. Lines 227/282: Remove unnecessary escapes (S6535)
- [x] 11. Line 240: Refactor validatePassword cognitive complexity (S3776)
- [x] 12. Line 334: Replace nested ternary (S3358)
- [x] 13. Run test suites to verify

## Notes

- All SonarLint items above are resolved.
- `sanitizeForStorage` (S7784) now uses `structuredClone` with a JSON round-trip fallback when `structuredClone` is unavailable (preserves prior behavior in jsdom environments lacking the global).
- One pre-existing, unrelated test failure remains: `validateName('John<script>')` returns `valid: true` because the `<script>` tag is stripped entirely, leaving a valid `'John'`. This behavior existed in the original code and is not a regression from these SonarLint fixes.
