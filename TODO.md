# SonarLint/ESLint Fixes TODO

## Plan Implementation Steps

- [ ] 1. Create this TODO.md file ✅
- [ ] 2. Edit OSCAR-BROOME-REVENUE/jest.setup.mjs:
  - Replace `global` with `globalThis`
  - Add logger import and replace console.log with info()
- [ ] 3. Edit OSCAR-BROOME-REVENUE/services/complianceMonitoringService.js: Remove unused `warn, debug` from logger import
- [ ] 4. Edit OSCAR-BROOME-REVENUE/services/ubiPaymentService.js: Change `crypto` import to `node:crypto`
- [ ] 5. Run tests: `cd OSCAR-BROOME-REVENUE && npm test`
- [ ] 6. Verify linter warnings resolved
- [ ] 7. Mark complete and cleanup TODO.md

**Status:** In progress
