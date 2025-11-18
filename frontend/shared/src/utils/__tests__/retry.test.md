# Retry Error Toast Deduplication Test

## Problem

The retry mechanism was causing duplicate error toasts. Each retry attempt triggered the API client's response interceptor, which showed a toast notification. With `maxRetries: 2`, users would see 3 identical error toasts (initial attempt + 2 retries) for the same network error.

## Solution

Implemented a retry context tracking system that:

1. **Tracks retry state** in `errorHandler.ts`:
   - `setRetryContext()` - Sets the current retry state
   - `shouldShowErrorToast()` - Determines if a toast should be shown
   - Only shows toasts when NOT retrying OR on the last retry attempt

2. **Updated API client** in `client.ts`:
   - Checks `shouldShowErrorToast()` before displaying error toasts
   - Suppresses toasts during intermediate retry attempts

3. **Updated retry utility** in `retry.ts`:
   - Sets retry context before each attempt
   - Clears context on success or final failure
   - Ensures the final error always shows a toast

## Behavior

### Before Fix

```
Network error occurs with maxRetries: 2
Attempt 1: ❌ Error toast shown
Attempt 2: ❌ Error toast shown
Attempt 3: ❌ Error toast shown
Result: User sees 3 identical toasts 😞
```

### After Fix

```
Network error occurs with maxRetries: 2
Attempt 1: ❌ Toast suppressed (will retry)
Attempt 2: ❌ Toast suppressed (will retry)
Attempt 3: ❌ Error toast shown (final attempt)
Result: User sees 1 toast 😊
```

## Testing

To test this fix manually:

1. Stop the backend API server
2. Navigate to the poll-app or admin-app
3. Try to load polls (which will fail due to no backend)
4. Observe that only ONE error toast appears, not multiple
5. Check the console logs to see retry attempts

## Edge Cases Handled

1. **Non-retriable errors**: Toast shown immediately, no retries
2. **Successful retry**: No toast shown (success feedback elsewhere)
3. **Network errors**: Only final failure shows toast
4. **First attempt success**: No retry context set, works normally
