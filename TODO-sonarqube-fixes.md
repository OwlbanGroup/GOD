# TODO: Fix SonarQube/SonarLint Issues

## utils/sanitizer.js

- [x] 1. S5843/S8786 (line 57): Simplify `dangerousTags` regex complexity (22 -> <=20) and remove backtracking risk
- [x] 2. S7784 (line 163): Prefer `structuredClone` over `JSON.parse(JSON.stringify(...))` fallback
- [x] 3. S3776 (line 259): Refactor `validatePassword` to reduce cognitive complexity (16 -> <=15)

## _fix_test_tmp.js

- [x] 4. S7772 (line 1): Use `node:fs` instead of `fs`
- [x] 5. S7781 (line 4): Use `replaceAll` instead of `replace` for CRLF conversion
- [x] 6. S7781 (line 47): Use `replaceAll` instead of `replace` for CRLF conversion

## __tests__/utils/sanitizer.test.js

- [x] 7. S5976 (line 105): Already parameterized with `test.each` — verify via test run

## Verify

- [ ] 8. Run `npx jest __tests__/utils/sanitizer.test.js`
- [ ] 9. Run `npx jest __tests__/security/sanitizer.test.js`
