import { isNetworkError } from './errorHandler';

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
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
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
