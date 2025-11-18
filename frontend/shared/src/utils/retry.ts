import { isNetworkError, setRetryContext } from './errorHandler';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: true,
  onRetry: () => {},
  shouldRetry: (error: unknown) => isNetworkError(error),
};

/**
 * Retry a function with exponential backoff
 * Automatically suppresses intermediate error toasts to prevent duplicates
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Set retry context before each attempt (except the first one)
      // This tells the API client whether to show error toasts
      if (attempt > 0) {
        setRetryContext(true, attempt, opts.maxRetries);
      } else {
        setRetryContext(false, 0, opts.maxRetries);
      }

      const result = await fn();

      // Clear retry context on success
      setRetryContext(false, 0, 0);
      return result;
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === opts.maxRetries) {
        // Clear retry context before throwing final error
        // This ensures the toast is shown for the final failure
        setRetryContext(false, 0, 0);
        break;
      }

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        // Clear retry context before throwing
        setRetryContext(false, 0, 0);
        throw error;
      }

      // Call onRetry callback
      opts.onRetry(attempt + 1, error);

      // Calculate delay with optional exponential backoff
      const delay = opts.backoff
        ? opts.retryDelay * Math.pow(2, attempt)
        : opts.retryDelay;

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry with toast notifications
 */
export const retryWithNotification = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions & { resourceName?: string } = {}
): Promise<T> => {
  const resourceName = options.resourceName || 'resource';

  return retry(fn, {
    ...options,
    onRetry: (attempt, error) => {
      console.log(
        `Retry attempt ${attempt}/${options.maxRetries || 3} for ${resourceName}`,
        error
      );
      // You can add toast notification here if needed
      // toast.info(`Retrying... (${attempt}/${options.maxRetries || 3})`);

      if (options.onRetry) {
        options.onRetry(attempt, error);
      }
    },
  });
};
