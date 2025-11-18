# Error Handling Quick Reference Card

## 🚀 Quick Start

```typescript
import { toast, retry, useLoading, handleError } from '@shared';
```

## 📣 Toast Notifications

```typescript
// Success (green, 5s)
toast.success('Created successfully!');

// Error (red, 7s)
toast.error('Failed to save');

// Warning (orange, 5s)
toast.warning('Unsaved changes');

// Info (blue, 5s)
toast.info('Loading...');
```

## 🔄 Retry Mechanism

```typescript
// Simple retry (2 attempts)
const data = await retryWithNotification(() => api.getData(), {
  maxRetries: 2,
  resourceName: 'data',
});

// Custom retry
const result = await retry(() => api.call(), {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: true,
  shouldRetry: error => isNetworkError(error),
});
```

## 📦 Loading State

```typescript
// Manual control
const loading = ref(false);
const error = ref<ApiError | null>(null);

try {
  loading.value = true;
  error.value = null;
  await api.call();
} catch (err) {
  error.value = err;
} finally {
  loading.value = false;
}

// With composable
const { data, loading, error, execute } = useLoading(() => api.getData(), {
  showToast: true,
});

onMounted(() => execute());
```

## 🎯 Common Patterns

### View Component

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { retryWithNotification, type ApiError } from '@shared';

const data = ref(null);
const loading = ref(true);
const error = ref<ApiError | null>(null);

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    data.value = await retryWithNotification(() => api.getData(), {
      maxRetries: 2,
    });
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">
    {{ error.message }}
    <button @click="fetchData">Retry</button>
  </div>
  <div v-else>{{ data }}</div>
</template>
```

### Form Submission

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { toast } from '@shared';

const submitting = ref(false);

const handleSubmit = async data => {
  try {
    submitting.value = true;
    await api.submit(data);
    toast.success('Saved!');
  } catch (err) {
    // API client shows error toast
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <button :disabled="submitting" @click="handleSubmit">
    {{ submitting ? 'Saving...' : 'Save' }}
  </button>
</template>
```

## 🎨 Loading Spinner

```vue
<div
  class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
></div>
```

## ⚠️ Error Display

```vue
<div v-if="error" class="card bg-red-50 border border-red-200">
  <div class="flex items-start">
    <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div class="flex-1">
      <p class="text-red-600 font-medium">{{ error.message }}</p>
      <button @click="retry" class="btn-secondary mt-4">
        Try Again
      </button>
    </div>
  </div>
</div>
```

## 🛠️ Error Handler

```typescript
// Manual error handling
try {
  await operation();
} catch (error) {
  handleError(error, {
    customMessage: 'Custom message',
    showToast: true,
    onError: apiError => {
      // Additional logic
    },
  });
}

// Try-catch helpers
const result = await tryCatch(() => api.call());
const data = await tryCatchWithDefault(() => api.call(), []);
```

## 🎛️ Toast Options

```typescript
import { POSITION } from '@shared';

toast.success('Message', {
  timeout: 10000, // Custom timeout
  position: POSITION.TOP_LEFT, // Position
  hideProgressBar: true, // Hide progress
  closeOnClick: false, // Prevent close on click
  pauseOnHover: true, // Pause on hover
});
```

## 🚨 HTTP Status Codes

| Code | Message             |
| ---- | ------------------- |
| 400  | Invalid request     |
| 401  | Unauthorized        |
| 403  | Permission denied   |
| 404  | Not found           |
| 500  | Server error        |
| 503  | Service unavailable |

## ✅ Best Practices

✅ Always show loading states  
✅ Use retry for critical operations  
✅ Provide retry buttons for errors  
✅ Show success toasts for user actions  
✅ Don't show duplicate toasts  
✅ Use ApiError type for errors  
✅ Handle errors gracefully

## ❌ Common Mistakes

❌ No loading feedback  
❌ No retry mechanism  
❌ Generic error messages  
❌ Double toasts (API + manual)  
❌ No error recovery options  
❌ Using `alert()` instead of toasts

## 📚 Full Documentation

See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for complete guide.

---

**Quick Reference v1.0** | Error Handling System | November 2025
