# Jest Test Fixes Plan

## Step 1: Create Missing Files (Completed)
- ✅ [x] OSCAR-BROOME-REVENUE/utils/loggerWrapper.js
- ✅ [x] OSCAR-BROOME-REVENUE/public/sw.js  
- ✅ [x] OSCAR-BROOME-REVENUE/quantum/quantumAIWallet.js
- ✅ [x] OSCAR-BROOME-REVENUE/public/js/biometric-auth.js (stub exists)

## Step 2: Fix logger.js circular dependency
- [ ] Edit OSCAR-BROOME-REVENUE/utils/logger.js - remove loggerWrapper import

## Step 3: Fix Jest configs
- [ ] OSCAR-BROOME-REVENUE/jest.config.cjs - expand transformIgnorePatterns for puppeteer, mongoose ESM
- [ ] Root jest.config.js - disable ESM or use transform for __tests__/integration/*.test.js

## Step 4: Install missing deps
- [ ] puppeteer in OSCAR-BROOME-REVENUE
- [ ] plaid in OSCAR-BROOME-REVENUE

## Step 5: Fix TextEncoder issues in earnings_dashboard tests
- [ ] Ensure jest.setup.js used

## Step 6: Fix root __tests__/integration ESM syntax
- [ ] Convert to CJS or fix top-level await

## Step 7: Test run & verify
- [ ] cd OSCAR-BROOME-REVENUE && npm test
- [ ] npm test (root)

