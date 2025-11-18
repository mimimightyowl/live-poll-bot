import { ref, Ref } from 'vue';
import { handleError, type ErrorHandlerOptions } from '../utils/errorHandler';
import type { ApiError } from '../types';

export interface UseLoadingOptions extends ErrorHandlerOptions {
  initialLoading?: boolean;
}

export interface UseLoadingReturn<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<ApiError | null>;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (value: T | null) => void;
  setError: (error: ApiError | null) => void;
}

/**
 * Composable for managing loading states with error handling
 *
 * Note: Toast notifications are automatically handled by the API client,
 * so you don't need to pass `showToast: true` - it's disabled by default
 * in this composable to prevent duplicate toasts.
 *
 * @example
 * const { data, loading, error, execute } = useLoading(
 *   () => pollsApi.getAll()
 * );
 *
 * // Execute on mount
 * onMounted(() => execute());
 *
 * // Or execute on demand
 * const refresh = () => execute();
 */
export const useLoading = <T>(
  fn: (...args: any[]) => Promise<T>,
  options: UseLoadingOptions = {}
): UseLoadingReturn<T> => {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(options.initialLoading ?? false);
  const error = ref<ApiError | null>(null);

  const execute = async (...args: any[]): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;
      const result = await fn(...args);
      data.value = result;
      return result;
    } catch (err) {
      // Don't show toast here since API client already handles it
      const apiError = handleError(err, { ...options, showToast: false });
      error.value = apiError;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
  };

  const setData = (value: T | null) => {
    data.value = value;
  };

  const setError = (err: ApiError | null) => {
    error.value = err;
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
  };
};

/**
 * Simplified version that auto-executes on mount
 */
export const useAsyncData = <T>(
  fn: () => Promise<T>,
  options: UseLoadingOptions = {}
): UseLoadingReturn<T> => {
  const loadingState = useLoading(fn, options);

  // Auto-execute
  loadingState.execute();

  return loadingState;
};
