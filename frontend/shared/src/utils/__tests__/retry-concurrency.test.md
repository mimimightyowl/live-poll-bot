# Retry Concurrency Fix Test

## Problem

The `retryContext` was a module-level global variable shared across all retry operations. When multiple API requests with retry logic executed concurrently, they would overwrite each other's retry context, causing incorrect toast suppression behavior.

### Race Condition Example (Before Fix)

```
Time | Operation A                    | Operation B                    | Global retryContext
-----|--------------------------------|--------------------------------|---------------------
0ms  | Start attempt 1               |                                | { isRetrying: false }
1ms  | Set context(true, 1, 3)       |                                | { isRetrying: true, attempt: 1 }
2ms  | API call fails                |                                | { isRetrying: true, attempt: 1 }
3ms  |                               | Start attempt 1                | { isRetrying: true, attempt: 1 }
4ms  |                               | Set context(true, 1, 3)        | { isRetrying: true, attempt: 1 }
5ms  | Check shouldShowToast()       |                                | { isRetrying: true, attempt: 1 }
     | → false (thinks it's retrying)|                                |
6ms  | Toast suppressed (BUG!)       |                                |
7ms  |                               | API call fails                 | { isRetrying: true, attempt: 1 }
8ms  | Start attempt 2               |                                | { isRetrying: true, attempt: 1 }
9ms  | Set context(true, 2, 3)       |                                | { isRetrying: true, attempt: 2 }
10ms |                               | Start attempt 2                | { isRetrying: true, attempt: 2 }
11ms |                               | Set context(true, 2, 3)        | { isRetrying: true, attempt: 2 }
12ms | API call fails                |                                | { isRetrying: true, attempt: 2 }
13ms | Check shouldShowToast()       |                                | { isRetrying: true, attempt: 2 }
     | → false (using B's context!)  |                                |
14ms | Toast suppressed (BUG!)       |                                |
```

**Result**: Operation A's toasts are incorrectly suppressed because Operation B overwrote the shared context.

## Solution

Replaced the single global `retryContext` with a `Map<symbol, RetryContext>` that stores isolated contexts for each retry operation. Each operation gets a unique Symbol ID that travels with the error through the call stack.

### Key Changes

1. **errorHandler.ts**
   - Changed from single `retryContext` object to `Map<symbol, RetryContext>`
   - Added `createRetryOperationId()` to generate unique IDs
   - Updated `setRetryContext()` to accept operation ID
   - Updated `shouldShowErrorToast()` to accept operation ID
   - Auto-cleanup: contexts are removed from map when operation completes

2. **retry.ts**
   - Generate unique operation ID for each retry operation
   - Pass operation ID to `setRetryContext()`
   - Attach operation ID to errors using symbol key `RETRY_OPERATION_ID_KEY`
   - Operation ID follows the error through the promise chain

3. **client.ts**
   - Extract operation ID from error in response interceptor
   - Pass operation ID to `shouldShowErrorToast()`
   - Preserve operation ID when creating `ApiError` objects

### After Fix

```
Time | Operation A                    | Operation B                    | Context Map
-----|--------------------------------|--------------------------------|---------------------
0ms  | Start, ID = Symbol('A')       |                                | {}
1ms  | Set context(A, true, 1, 3)    |                                | { A: {retry:true, att:1} }
2ms  | API call fails                |                                | { A: {retry:true, att:1} }
3ms  |                               | Start, ID = Symbol('B')        | { A: {retry:true, att:1} }
4ms  |                               | Set context(B, true, 1, 3)     | { A: {retry:true, att:1},
     |                               |                                |   B: {retry:true, att:1} }
5ms  | Check shouldShowToast(A)      |                                | { A: {retry:true, att:1},
     | → false (correctly uses A)    |                                |   B: {retry:true, att:1} }
6ms  | Toast suppressed (CORRECT!)   |                                | { A: {retry:true, att:1},
     |                               |                                |   B: {retry:true, att:1} }
7ms  |                               | API call fails                 | { A: {retry:true, att:1},
     |                               |                                |   B: {retry:true, att:1} }
8ms  | Start attempt 2               |                                | { A: {retry:true, att:1},
     |                               |                                |   B: {retry:true, att:1} }
9ms  | Set context(A, true, 2, 3)    |                                | { A: {retry:true, att:2},
     |                               |                                |   B: {retry:true, att:1} }
10ms |                               | Start attempt 2                | { A: {retry:true, att:2},
     |                               |                                |   B: {retry:true, att:1} }
11ms |                               | Set context(B, true, 2, 3)     | { A: {retry:true, att:2},
     |                               |                                |   B: {retry:true, att:2} }
12ms | API call fails (final)        |                                | { A: {retry:true, att:2},
     |                               |                                |   B: {retry:true, att:2} }
13ms | Check shouldShowToast(A)      |                                | { A: {retry:true, att:2},
     | → false (still retrying)      |                                |   B: {retry:true, att:2} }
14ms | Attempt 3 (final)             |                                | { A: {retry:true, att:3},
     |                               |                                |   B: {retry:true, att:2} }
15ms | Clear context(A)              |                                | { B: {retry:true, att:2} }
16ms | Check shouldShowToast(A)      |                                | { B: {retry:true, att:2} }
     | → true (no context for A)     |                                |
17ms | Toast shown (CORRECT!)        |                                | { B: {retry:true, att:2} }
```

**Result**: Each operation maintains its own isolated context. No race conditions!

## Testing

### Manual Test

To verify the fix works with concurrent requests:

```typescript
// In browser console or test file
import { pollsApi } from '@shared/api/polls';
import { retryWithNotification } from '@shared/utils';

// Simulate concurrent retry operations
async function testConcurrentRetries() {
  console.log('Starting concurrent retry test...');

  // Make sure backend is stopped to trigger retries
  const promise1 = retryWithNotification(() => pollsApi.getAll(), {
    maxRetries: 2,
    resourceName: 'polls-1',
  }).catch(e => console.log('Request 1 failed:', e));

  // Start second request after small delay
  await new Promise(r => setTimeout(r, 100));

  const promise2 = retryWithNotification(() => pollsApi.getById(1), {
    maxRetries: 2,
    resourceName: 'poll-1',
  }).catch(e => console.log('Request 2 failed:', e));

  await Promise.all([promise1, promise2]);

  console.log('Both requests completed');
  // Should see only 2 error toasts (one per final failure)
  // NOT 4 or 6 toasts
}
```

### Expected Behavior

With backend stopped:

1. Request 1 starts, attempts 3 times (initial + 2 retries)
2. Request 2 starts while Request 1 is still retrying
3. Each request maintains its own retry context
4. **Only 2 error toasts appear** (one per request's final failure)
5. No duplicate toasts, no cross-contamination

### Verification

1. Stop the backend API server
2. Navigate to poll-app or admin-app
3. Rapidly click multiple buttons that trigger API calls
4. Observe that each operation shows exactly ONE error toast on final failure
5. Check console logs to see retry attempts for each operation
6. Verify no duplicate toasts appear

## Edge Cases Handled

1. **Rapid concurrent requests**: Each gets unique operation ID
2. **Staggered requests**: New requests don't affect ongoing ones
3. **Memory cleanup**: Map entries removed when operations complete
4. **Backward compatibility**: `shouldShowErrorToast()` works without operation ID (always shows toast)
5. **Error propagation**: Operation ID preserved through error chain

## Performance

- **Memory**: Map only stores active retry contexts, auto-cleaned on completion
- **Lookup**: O(1) Map lookups by Symbol key
- **Overhead**: Minimal - one Symbol creation per retry operation
- **GC**: Symbols and contexts are garbage collected when operations complete
