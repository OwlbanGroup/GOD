# Phase A — Fix Failing Jest Test Suites (OSCAR-BROOME-REVENUE)

## Goal
Fix the remaining failing Jest test suites in `GOD/OSCAR-BROOME-REVENUE` per
`TODO_FIX_TESTS.md` (items 6–16, 19–20) and progress Phase A of the master tracker.

## Steps
- [ ] 1. Run full `npx jest` to capture actual failures baseline
- [ ] 2. Check quantum stubs (quantumAIWallet.js, quantumSecurityCommonJS.js) exist
- [ ] 3. Fix Category B async/await + add PMC service fallback (items 6, 7, 8, 9)
- [ ] 4. Fix Category C service fallback consistency (items 10, 11, 12, 13)
- [ ] 5. Fix Category D payroll Map iteration bug + test state reset (items 14, 15)
- [ ] 6. Fix Category E earnings dashboard revenue.json path (item 16)
- [ ] 7. Run per-suite `npx jest` for each fixed suite (item 19)
- [ ] 8. Run full `npx jest` to confirm no regressions (item 20)
- [ ] 9. Update `TODO_FIX_TESTS.md`, `TODO_MASTER_EXECUTION.md`, `NEXT_STEPS_PROGRESS.md`
