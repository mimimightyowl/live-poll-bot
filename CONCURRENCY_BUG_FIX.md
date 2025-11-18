# Retry Context Concurrency Bug Fix

## Issue

**Critical Race Condition**: The `retryContext` in `errorHandler.ts` was a module-level global variable shared across all retry operations. When multiple API requests with retry logic executed concurrently, they would overwrite each other's retry context, causing incorrect toast suppression behavior.

**Reported by**: Code review feedback
**Severity**: High - affects user experience during concurrent API requests
**Impact**: Users could see duplicate toasts or missing toasts during network errors

## Root Cause

```typescript
// BEFORE (BUGGY):
let retryContext: RetryContext = {
  isRetrying: false,
  currentAttempt: 0,
  maxRetries: 0,
};
```

When two API requests (A and B) retry concurrently:

1. Request A sets `retryContext = { isRetrying: true, attempt: 1 }`
2. Request B overwrites it: `retryContext = { isRetrying: true, attempt: 1 }`
3. Request A checks context and gets B's values → incorrect toast behavior

## Solution

Replace the single global variable with a `Map` keyed by unique operation IDs:

```typescript
// AFTER (FIXED):
const retryContexts = new Map<symbol, RetryContext>();

export const createRetryOperationId = (): symbol => {
  return Symbol('retryOperation');
};
```

Each retry operation:

1. Gets a unique Symbol ID
2. Stores its context in the map with that ID
3. Passes the ID through the error chain
4. Uses the ID to check its own context (isolated from other operations)

## Changes Made

### 1. `frontend/shared/src/utils/errorHandler.ts`

**Changed**:

- Replaced single `retryContext` with `Map<symbol, RetryContext>`
- Added `createRetryOperationId()` to generate unique IDs
- Updated `setRetryContext(operationId, ...)` signature
- Updated `shouldShowErrorToast(operationId?)` signature
- Updated `isInRetryContext(operationId)` signature
- Updated `isLastRetryAttempt(operationId)` signature
- Added automatic cleanup when operations complete

**Key features**:

- Isolated contexts per operation
- Memory efficient (auto-cleanup)
- Backward compatible (operation ID is optional)

### 2. `frontend/shared/src/utils/retry.ts`

**Changed**:

- Generate unique operation ID for each retry operation
- Pass operation ID to all `setRetryContext()` calls
- Attach operation ID to errors using `RETRY_OPERATION_ID_KEY` symbol
- Operation ID travels with error through promise chain

**New export**:

```typescript
export const RETRY_OPERATION_ID_KEY = Symbol('retryOperationId');
```

### 3. `frontend/shared/src/api/client.ts`

**Changed**:

- Import `RETRY_OPERATION_ID_KEY`
- Extract operation ID from errors in response interceptor
- Pass operation ID to `shouldShowErrorToast(operationId)`
- Preserve operation ID when creating `ApiError` objects

**Before**:

```typescript
if (toast && shouldShowErrorToast()) {
  toast.error(message);
}
```

**After**:

```typescript
const operationId = (error as any)[RETRY_OPERATION_ID_KEY] as
  | symbol
  | undefined;
if (toast && shouldShowErrorToast(operationId)) {
  toast.error(message);
}
```

## Technical Details

### Why Symbols?

Symbols provide:

- **Uniqueness**: Every `Symbol()` call creates a new unique value
- **Non-enumerable**: Won't show up in JSON.stringify or Object.keys
- **Type-safe**: TypeScript enforces correct usage
- **Memory-efficient**: Lightweight primitives

### Memory Management

The Map automatically cleans up when:

1. Operation completes successfully → `setRetryContext(id, false, 0, 0)` deletes entry
2. Operation fails finally → `setRetryContext(id, false, 0, 0)` deletes entry
3. Operation fails non-retriably → `setRetryContext(id, false, 0, 0)` deletes entry

### Flow Diagram

```
Component
  ↓
retryWithNotification()
  ↓
retry() creates Symbol ID
  ↓
setRetryContext(id, true, 1, 3) → Map: { [id]: {retry:true, att:1} }
  ↓
API call via axios
  ↓
API error caught
  ↓
Attach ID to error: error[RETRY_OPERATION_ID_KEY] = id
  ↓
Response interceptor
  ↓
Extract ID from error
  ↓
shouldShowErrorToast(id) → checks Map[id]
  ↓
Show/suppress toast based on operation's own context
```

## Testing

### Unit Test Strategy

Test concurrent operations:

```typescript
test('concurrent retries maintain isolated contexts', async () => {
  // Simulate 2 concurrent failing requests
  const promise1 = retry(() => Promise.reject('error1'), { maxRetries: 2 });
  const promise2 = retry(() => Promise.reject('error2'), { maxRetries: 2 });

  await Promise.allSettled([promise1, promise2]);

  // Verify each operation got exactly 1 toast (on final failure)
  expect(toastCalls).toHaveLength(2);
});
```

### Manual Testing

1. Stop backend server
2. Navigate to app
3. Quickly click multiple buttons (triggers concurrent API calls)
4. Expected: Each operation shows exactly ONE error toast
5. Verify: No duplicate toasts, no missing toasts

### Browser Console Test

```javascript
// Make 3 concurrent requests that will retry
Promise.all([
  retryWithNotification(() => pollsApi.getAll(), { maxRetries: 2 }),
  retryWithNotification(() => pollsApi.getById(1), { maxRetries: 2 }),
  retryWithNotification(() => pollsApi.getById(2), { maxRetries: 2 }),
]).catch(() => console.log('All failed'));

// Expected: 3 error toasts (one per request's final failure)
// NOT 9 toasts (3 requests × 3 attempts each)
```

## Edge Cases Handled

1. ✅ **Rapid concurrent requests**: Each gets unique ID
2. ✅ **Staggered requests**: New requests don't affect ongoing ones
3. ✅ **Mixed retry/non-retry**: Non-retry requests work normally
4. ✅ **Memory leaks**: Map entries auto-deleted on completion
5. ✅ **Backward compatibility**: `shouldShowErrorToast()` works without ID
6. ✅ **Error propagation**: Operation ID preserved through async chain
7. ✅ **TypeScript safety**: Symbol types enforced at compile time

## Performance Impact

- **Memory**: Minimal - one Symbol + small object per active retry
- **CPU**: O(1) Map lookups, negligible overhead
- **Network**: No change
- **User experience**: Improved - no duplicate toasts!

## Verification Checklist

- [x] No shared global state (use Map instead)
- [x] Each operation has unique identifier (Symbol)
- [x] Context isolated per operation
- [x] Memory cleanup on operation completion
- [x] Backward compatible (optional operation ID)
- [x] TypeScript types correct
- [x] Linter errors fixed
- [x] Documentation updated
- [x] Test documentation created

## Related Files

- `frontend/shared/src/utils/errorHandler.ts` - Core fix
- `frontend/shared/src/utils/retry.ts` - Operation ID generation
- `frontend/shared/src/api/client.ts` - Operation ID usage
- `frontend/shared/src/utils/__tests__/retry-concurrency.test.md` - Test docs
- `CONCURRENCY_BUG_FIX.md` - This document

## Migration Notes

This is a **non-breaking change**:

- Existing code that doesn't use retry works unchanged
- Retry operations automatically get the fix
- No code changes required in components
- Backward compatible API (operation ID optional)

## Acknowledgments

Thanks to code review for catching this critical race condition before production deployment!
