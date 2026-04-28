# Correct PowerShell script to run project commands (use ; for chaining in PS5.1)

Write-Host "GOD-TOKEN-COIN Compile:"
Set-Location GOD-TOKEN-COIN
npx hardhat compile

Write-Host "GOD-TOKEN-COIN Test:"
npm test

Write-Host "OSCAR-BROOME-REVENUE Type Check:"
Set-Location ..\OSCAR-BROOME-REVENUE
npx tsc --noEmit

Write-Host "OSCAR-BROOME-REVENUE Test:"
npm test

Write-Host "Done. Check PROJECT_RUN_CHECKLIST.md for details."
