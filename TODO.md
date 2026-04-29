# GOD Project - Master TODO Tracker
Status: Approved Plan - Phase 2/8/9 Execution

## Overview
Approved plan to complete next steps:
1. Finish Jest test fixes in OSCAR-BROOME-REVENUE and owlbangroup.io
2. Complete root project integration tests (Phase 2.3)
3. GOD-TOKEN-COIN testnet deployment and restoration system tests

Progress tracked here. Updates after each step.

## 1. Jest Fixes (OSCAR-BROOME-REVENUE & owlbangroup.io) [3/9]
From TODO_PROGRESS.md - Current: 3/9 complete

- [x] 1. Update OSCAR-BROOME-REVENUE/jest.config.cjs ✅
- [ ] 2. Create OSCAR-BROOME-REVENUE/quantum/quantumAIWallet.js stub
- [ ] 3. Create OSCAR-BROOME-REVENUE/public/js/biometric-auth.js stub  
- [ ] 4. Fix OSCAR-BROOME-REVENUE/tests/quantum_ai_wallet.test.js
- [ ] 5. Fix OSCAR-BROOME-REVENUE/tests/quantumSecurity.test.js
- [ ] 6. Mock localhost/increase timeout OSCAR-BROOME-REVENUE/tests/pwa.test.js
- [ ] 7. Update owlbangroup.io/jest.config.mjs
- [ ] 8. Install deps (@noble/hashes etc.)
- [ ] 9. Run npm test in both projects

## 2. Root Project Integration Tests (Phase 2.3) [0/4]
- [ ] Integration: API (Azure, Foundry VTT)
- [ ] Integration: Canvas/WebGL rendering
- [ ] Integration: localStorage persistence
- [ ] Integration: AI features (mocks)

## 3. GOD-TOKEN-COIN Testnet & Restoration Tests [0/8]
From RESTORATION_NEXT_STEPS.md
- [ ] cd GOD-TOKEN-COIN && npx hardhat compile
- [ ] Configure sepolia network
- [ ] npx hardhat run scripts/deploy-saints.js --network sepolia
- [ ] Verify contracts on Etherscan
- [ ] npx hardhat test --network sepolia
- [ ] Update src/core/config.js with addresses
- [ ] Test saint minting flow
- [ ] Test resurrection ritual (5 phases)

## Follow-up Steps
- Installations: npm i deps if needed, foundry/hardhat setup
- Testing: npm test, hardhat test
- Deployment verification

Updated after each completion.

Last Updated: Plan Created
