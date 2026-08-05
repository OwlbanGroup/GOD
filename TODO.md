# Sanitizer SonarLint Fix — Implementation Steps

- [x] 1. Simplify HTML tag-strip regex (S5843) — line 57
- [x] 2. Use replaceAll for angle brackets (S7781) — line 60
- [x] 3. Simplify SQL-injection regex (S5843) — line 63
- [x] 4. Replace alternation with char class (S6035) — line 66
- [x] 5. Use structuredClone (S7784) — line 145
- [x] 6. Use Number.parseFloat / Number.isNaN (S7773) — lines 194/196
- [x] 7. Use \d instead of [0-9] (S6353) — lines 226/275
- [x] 8. Remove unnecessary escapes (S6535) — lines 227/282
- [x] 9. Refactor validatePassword cognitive complexity (S3776) — line 240
- [x] 10. Replace nested ternary (S3358) — line 334
- [x] 11. Update test for structuredClone behavior change
- [x] 12. Run test suites to verify

## Notes

- All SonarLint issues in `utils/sanitizer.js` have been resolved.
- `sanitizeForStorage` uses `structuredClone` when available with a JSON round-trip fallback (preserves original behavior in environments without `structuredClone`, e.g. some jsdom setups).
- One pre-existing test failure remains: `validateName('John<script>')` expects `valid: false`, but the `<script>` tag is stripped entirely by the tag-stripping sanitizer, leaving `'John'` which is valid. This is a pre-existing behavior in the original code, not a regression from these changes.
