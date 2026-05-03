# QuantumCrypto.js SonarLint Fixes Plan

## Issues to Fix

### 1. S1128 - Remove unused debug import (Line 5)

- **Fix**: Remove `debug` from import statement
- **Change**: `import { info, error, warn, debug }` → `import { info, error, warn }`

### 2. S7757 - Use class field declarations (Line 10)

- **Fix**: Convert constructor assignments to class fields
- **Change**:
  - `this.keys = new Map()` → `keys = new Map()` (class field)
  - `this.sessions = new Map()` → `sessions = new Map()` (class field)
  - Keep `this.isActive = false` as instance property since it's not static

### 3. S6582 - Use optional chaining (Lines 23, 213)

- **Fix**: Add optional chaining for window.crypto
- **Change**: `window.crypto.subtle` → `window.crypto?.subtle`

### 4. S7764 - Replace window with globalThis (~17 occurrences)

- **Locations**: Lines 23, 31, 68, 77, 96, 104, 107, 114, 121, 151, 159, 167, 174, 234, 259, 267, 322
- **Fix**: Replace all `window.crypto` with `globalThis.crypto`
- **Note**: At line 322, `window` is used standalone - change to `globalThis`

### 5. S4822 - Remove redundant try-catch (Line 29)

- **Fix**: Remove try-catch since promise rejection is captured by .catch()
- **Context**: The try-catch wraps a promise chain that already has .catch()

## Implementation Order

1. Fix imports (S1128) ✅
2. Convert to class fields (S7757) ✅
3. Replace window with globalThis (S7764) ✅
4. Add optional chaining (S6582) ✅
5. Remove redundant try-catch (S4822) ✅

## COMPLETED - All fixes applied successfully
