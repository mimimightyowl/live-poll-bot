# Frontend Error Handling System

## Overview

This document describes the comprehensive error handling system implemented across the frontend applications (poll-app and admin-app). The system provides consistent, user-friendly error notifications, loading states, and automatic retry mechanisms.

## Features

✅ **Toast Notifications** - Beautiful, auto-dismissing notifications for all error types  
✅ **Centralized Error Handler** - Consistent error processing across the application  
✅ **Loading States** - Visual feedback during async operations  
✅ **Retry Mechanism** - Automatic retry for failed requests with exponential backoff  
✅ **Network Resilience** - Smart detection and handling of network errors  
✅ **Type Safety** - Full TypeScript support for error handling

## Architecture

### Core Components

1. **Toast Service** (`@shared/utils/toast.ts`)
   - Wrapper around vue-toastification
   - Provides simple API for showing notifications
   - Auto-dismiss with configurable timeouts

2. **Error Handler** (`@shared/utils/errorHandler.ts`)
   - Centralized error processing
   - Converts various error types to ApiError
   - User-friendly error messages based on HTTP status codes

3. **Retry Utility** (`@shared/utils/retry.ts`)
   - Automatic retry with exponential backoff
   - Configurable retry attempts and delays
   - Network error detection

4. **Loading Composable** (`@shared/composables/useLoading.ts`)
   - Reactive loading state management
   - Integrated error handling
   - Simplified async data fetching

5. **API Client Integration** (`@shared/api/client.ts`)
   - Automatic toast notifications for API errors
   - HTTP status code handling
   - Network error detection

## Usage Guide

### 1. Toast Notifications

#### Basic Usage

```typescript
import { toast } from '@shared';

// Success message
toast.success('Poll created successfully!');

// Error message (stays longer)
toast.error('Failed to load data');

// Warning message
toast.warning('This action cannot be undone');

// Info message
toast.info('New version available');
```

#### Custom Options

```typescript
import { toast, POSITION } from '@shared';

toast.success('Saved!', {
  timeout: 3000,
  position: POSITION.BOTTOM_RIGHT,
  hideProgressBar: true,
});
```

### 2. Error Handling

#### Manual Error Handling

```typescript
import { handleError } from '@shared';

try {
  await someAsyncOperation();
} catch (error) {
  // Shows toast and logs error
  handleError(error);
}
```

#### Custom Error Handler

```typescript
import { handleError } from '@shared';

try {
  await someAsyncOperation();
} catch (error) {
  handleError(error, {
    customMessage: 'Failed to process request',
    showToast: true,
    logToConsole: true,
    onError: apiError => {
      // Custom error handling logic
      console.log('Status code:', apiError.statusCode);
    },
  });
}
```

#### Try-Catch Helpers

```typescript
import { tryCatch, tryCatchWithDefault } from '@shared';

// Returns null on error
const result = await tryCatch(() => pollsApi.getAll());
if (result) {
  // Use result
}

// Returns default value on error
const polls = await tryCatchWithDefault(
  () => pollsApi.getAll(),
  [] // default value
);
```

### 3. Retry Mechanism

#### Basic Retry

```typescript
import { retry } from '@shared';

const data = await retry(() => pollsApi.getAll(), {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: true, // exponential backoff
});
```

#### Retry with Notifications

```typescript
import { retryWithNotification } from '@shared';

const poll = await retryWithNotification(() => pollsApi.getById(pollId), {
  maxRetries: 2,
  resourceName: 'poll', // for logging
});
```

#### Custom Retry Logic

```typescript
import { retry, isNetworkError } from '@shared';

const data = await retry(() => fetchData(), {
  maxRetries: 5,
  retryDelay: 2000,
  shouldRetry: error => {
    // Custom retry logic
    return isNetworkError(error) || error.statusCode === 503;
  },
  onRetry: (attempt, error) => {
    console.log(`Retry attempt ${attempt}`, error);
  },
});
```

### 4. Loading State Management

#### Using useLoading Composable

```typescript
import { useLoading } from '@shared';
import { onMounted } from 'vue';

const { data, loading, error, execute, reset } = useLoading(
  () => pollsApi.getAll(),
  { showToast: true }
);

// Execute on mount
onMounted(() => execute());

// Or execute on demand
const refresh = () => execute();
```

#### In Template

```vue
<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
      ></div>
      <p class="text-gray-600 mt-4">Loading...</p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <div class="flex items-start">
        <svg
          class="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <p class="text-red-600 font-medium">{{ error.message }}</p>
          <button @click="execute" class="btn-secondary mt-4">Try Again</button>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Your content -->
    </div>
  </div>
</template>
```

#### Auto-execute on Mount

```typescript
import { useAsyncData } from '@shared';

// Automatically executes on component mount
const { data, loading, error } = useAsyncData(() => pollsApi.getAll());
```

### 5. Component Patterns

#### View Component Pattern

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { retryWithNotification, type ApiError } from '@shared';

const data = ref<DataType | null>(null);
const loading = ref(true);
const error = ref<ApiError | null>(null);

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    data.value = await retryWithNotification(() => api.getData(), {
      maxRetries: 2,
      resourceName: 'data',
    });
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());
</script>
```

#### Form Submission Pattern

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { toast } from '@shared';

const submitting = ref(false);

const handleSubmit = async (formData: FormData) => {
  try {
    submitting.value = true;

    await api.submit(formData);

    toast.success('Submitted successfully!');
    router.push('/success');
  } catch (err: any) {
    // API client already shows error toast
    // Additional error handling if needed
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <button :disabled="submitting" @click="handleSubmit">
    <span v-if="submitting" class="flex items-center">
      <svg class="animate-spin h-5 w-5 mr-2" ...>...</svg>
      Submitting...
    </span>
    <span v-else>Submit</span>
  </button>
</template>
```

## API Client Integration

The API client (`@shared/api/client.ts`) is configured to automatically:

1. **Show toast notifications** for all API errors
2. **Convert errors** to ApiError format
3. **Provide user-friendly messages** based on HTTP status codes
4. **Handle network errors** gracefully

### Automatic Error Handling

All API calls automatically show toast notifications on error:

```typescript
// This will automatically show a toast on error
const polls = await pollsApi.getAll();
```

### Disable Automatic Toast

If you need to handle errors manually without showing a toast:

```typescript
try {
  await api.create(data);
} catch (err) {
  // API client still shows toast
  // To prevent this, you'd need to configure the API call
  // or handle at a higher level
}
```

## Error Message Mapping

The error handler provides user-friendly messages based on HTTP status codes:

| Status Code | Message                                                     |
| ----------- | ----------------------------------------------------------- |
| 400         | Invalid request. Please check your input.                   |
| 401         | Unauthorized. Please log in again.                          |
| 403         | You do not have permission to perform this action.          |
| 404         | The requested resource was not found.                       |
| 409         | Conflict. The resource already exists or has been modified. |
| 422         | Validation error. Please check your input.                  |
| 429         | Too many requests. Please try again later.                  |
| 500         | Server error. Please try again later.                       |
| 502/503     | Service unavailable. Please try again later.                |
| 504         | Request timeout. Please try again.                          |

## Best Practices

### 1. Always Use Loading States

```typescript
// ✅ Good
const loading = ref(false);
try {
  loading.value = true;
  await fetchData();
} finally {
  loading.value = false;
}

// ❌ Bad
await fetchData(); // No loading feedback
```

### 2. Use Retry for Critical Operations

```typescript
// ✅ Good - User won't see transient network errors
const data = await retryWithNotification(() => api.getData(), {
  maxRetries: 2,
});

// ❌ Bad - Fails on first network hiccup
const data = await api.getData();
```

### 3. Provide Retry Buttons for Errors

```vue
<!-- ✅ Good -->
<div v-if="error">
  <p>{{ error.message }}</p>
  <button @click="retry">Try Again</button>
</div>

<!-- ❌ Bad - User has no way to recover -->
<div v-if="error">
  <p>{{ error.message }}</p>
</div>
```

### 4. Use Success Toasts for User Actions

```typescript
// ✅ Good - User gets feedback
await api.create(data);
toast.success('Created successfully!');

// ❌ Bad - Silent success
await api.create(data);
```

### 5. Don't Show Multiple Toasts for the Same Error

```typescript
// ✅ Good - API client shows toast
try {
  await api.create(data);
} catch (err) {
  // Don't show another toast here
  // Just handle state
}

// ❌ Bad - Double toast
try {
  await api.create(data);
} catch (err) {
  toast.error(err.message); // API client already showed toast!
}
```

## Toast Notification Types

### Success (Green)

- Use for successful operations
- Auto-dismiss after 5 seconds
- Examples: "Created successfully", "Saved", "Deleted"

### Error (Red)

- Use for errors and failures
- Auto-dismiss after 7 seconds (longer than success)
- Automatically shown by API client

### Warning (Orange)

- Use for warnings and cautions
- Auto-dismiss after 5 seconds
- Examples: "Unsaved changes", "This action cannot be undone"

### Info (Blue)

- Use for informational messages
- Auto-dismiss after 5 seconds
- Examples: "Loading...", "Connecting..."

## Accessibility

The toast notifications are:

- **Screen reader friendly** - Announced to screen readers
- **Keyboard accessible** - Can be dismissed with keyboard
- **Pause on hover** - Pauses auto-dismiss when user hovers
- **Pause on focus loss** - Pauses when window loses focus

## Customization

### Custom Toast Options

```typescript
import { toast, POSITION } from '@shared';

// Custom timeout
toast.success('Message', { timeout: 10000 });

// Different position
toast.info('Message', { position: POSITION.BOTTOM_LEFT });

// Disable auto-dismiss
toast.warning('Important', { timeout: false });

// Hide progress bar
toast.error('Error', { hideProgressBar: true });
```

### Theme Customization

The toast styles can be customized by importing and modifying the CSS:

```css
/* In your main.css or component */
.Vue-Toastification__toast--success {
  background-color: #10b981;
}

.Vue-Toastification__toast--error {
  background-color: #ef4444;
}
```

## Testing

When testing components that use the error handling system:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { initToast } from '@shared';

describe('MyComponent', () => {
  beforeEach(() => {
    // Mock toast
    vi.mock('@shared', () => ({
      toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
      },
    }));
  });

  it('shows error toast on failure', async () => {
    // Test implementation
  });
});
```

## Migration Guide

### From Old Error Handling

**Before:**

```typescript
try {
  const data = await api.getData();
} catch (err: any) {
  error.value = err.message || 'Failed';
  console.error(err);
}
```

**After:**

```typescript
try {
  const data = await retryWithNotification(() => api.getData(), {
    maxRetries: 2,
  });
} catch (err: any) {
  error.value = err; // ApiError type
  // Toast already shown, console already logged
}
```

### From alert() to toast

**Before:**

```typescript
try {
  await api.delete(id);
} catch (err: any) {
  alert(err.message || 'Failed to delete');
}
```

**After:**

```typescript
try {
  await api.delete(id);
  toast.success('Deleted successfully');
} catch (err: any) {
  // API client shows error toast automatically
}
```

## Troubleshooting

### Toast not showing

1. Ensure `initToast()` is called in `main.ts`
2. Check that vue-toastification CSS is imported
3. Verify Toast plugin is registered with the app

### Errors not caught

1. Ensure you're using try-catch blocks
2. Check that API client interceptors are working
3. Verify error is being thrown, not silently failing

### Retry not working

1. Check `shouldRetry` logic
2. Verify `maxRetries` is > 0
3. Ensure function returns a Promise

## Performance Considerations

- Toast notifications are lightweight and don't impact performance
- Retry mechanism respects exponential backoff to prevent API hammering
- Loading states are reactive and efficient
- Error handling is synchronous and doesn't block rendering

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11+ (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Summary

The error handling system provides:

✅ **Consistent UX** - Same error handling across all components  
✅ **User-Friendly** - Clear messages and visual feedback  
✅ **Developer-Friendly** - Simple API and patterns  
✅ **Type-Safe** - Full TypeScript support  
✅ **Resilient** - Automatic retries for transient errors  
✅ **Accessible** - Screen reader support and keyboard navigation

For questions or issues, please contact the development team.
