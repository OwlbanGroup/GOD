# Security Fixes TODO

## 1. utils/sanitizer.js  ✅

- [x] Fix `escapeHtml()` entity map (`<script>` now escaped to `<script>`)
- [x] Make `sanitizeInput()` neutralize HTML tags (strip script/img/onerror etc.)
- [x] Strip SQL injection and path traversal patterns

## 2. src/features/defense/quantumCrypto.js  ✅

- [x] Verify HMAC over ciphertext BEFORE AES-GCM decrypt (throws clear HMAC error on tamper)
- [x] Fix signature create/verify to use keyed HMAC over same input (deterministic, unforgeable)
- [x] Add `error` to logger import

## Follow-up ✅

- [x] Re-run security jest tests to confirm fixes
  - sanitizer.test.js: 22/22 passed
  - quantum crypto verification: 4/4 passed (roundtrip, HMAC tamper, signature verify, forged rejection)
