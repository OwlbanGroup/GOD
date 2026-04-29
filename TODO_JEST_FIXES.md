# Jest Test Fixes - Approved Plan Tracker

## Progress: 0/20 steps complete

### Phase 1: Config Updates & Stubs (Steps 1-5)
- [ ] 1. Read & backup current jest configs
- [ ] 2. Edit owlbangroup.io/jest.config.mjs - expand transformIgnorePatterns
- [ ] 3. Edit OSCAR-BROOME-REVENUE/jest.config.cjs - expand transformIgnorePatterns
- [ ] 4. Create/verify OSCAR-BROOME-REVENUE/quantum/quantumAIWallet.js stub
- [ ] 5. Create/verify OSCAR-BROOME-REVENUE/public/js/biometric-auth.js stub

### Phase 2: Fix Main Project Tests (Steps 6-12)
- [ ] 6. Fix __tests__/integration/ai.test.js - require → dynamic import
- [ ] 7. Fix __tests__/utils/errorHandler.test.js
- [ ] 8. Fix __tests__/integration/api.test.js
- [ ] 9. Fix __tests__/integration/canvas.test.js
- [ ] 10. Fix __tests__/integration/storage.test.js
- [ ] 11. Run npm test in root
- [ ] 12. Verify coverage >50%

### Phase 3: Subproject Fixes (Steps 13-17)
- [ ] 13. Fix OSCAR-BROOME-REVENUE/tests/quantum_ai_wallet.test.js
- [ ] 14. Fix OSCAR-BROOME-REVENUE/tests/quantumSecurity.test.js
- [ ] 15. cd owlbangroup.io && npm test
- [ ] 16. cd OSCAR-BROOME-REVENUE && npm test
- [ ] 17. Install deps if needed: npm i @noble/hashes jsdom-global

### Phase 4: Finalization (Steps 18-20)
- [ ] 18. Update all TODO files (TODO.md, TODO_STEPS.md, TODO_PROGRESS.md)
- [ ] 19. run-projects.ps1 full validation
- [ ] 20. Proceed to Phase 3.4 Caching

**Next Action:** Phase 1 Step 1 - Read configs for exact edits.

