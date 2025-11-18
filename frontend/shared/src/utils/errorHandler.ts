import type { ApiError } from '../types';
import { toast } from './toast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  onError?: (error: ApiError) => void;
  logToConsole?: boolean;
}

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
};

/**
 * Centralized error handler for API and application errors
 */
export const handleError = (
  error: ApiError | Error | unknown,
  options: ErrorHandlerOptions = {}
): ApiError => {
  const opts = { ...defaultOptions, ...options };

  // Convert to ApiError format
  let apiError: ApiError;

  if (isApiError(error)) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = {
      success: false,
      message: error.message,
    };
  } else if (typeof error === 'string') {
    apiError = {
      success: false,
      message: error,
    };
  } else {
    apiError = {
      success: false,
      message: 'An unexpected error occurred',
    };
  }

  // Use custom message if provided
  if (opts.customMessage) {
    apiError.message = opts.customMessage;
  }

  // Log to console if enabled
  if (opts.logToConsole) {
    console.error('Error:', apiError, error);
  }

  // Show toast notification if enabled
  if (opts.showToast) {
    toast.error(apiError.message);
  }

  // Call custom error handler if provided
  if (opts.onError) {
    opts.onError(apiError);
  }

  return apiError;
};

/**
 * Type guard to check if error is ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'message' in error &&
    error.success === false
  );
};

/**
 * Get user-friendly error message based on status code
 */
export const getErrorMessage = (statusCode?: number): string => {
  if (!statusCode) return 'An error occurred';

  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. The resource already exists or has been modified.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Request timeout. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
};

/**
 * Network error checker
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('No response from server') ||
      error.message.includes('timeout')
    );
  }
  if (isApiError(error)) {
    return error.message.includes('No response from server');
  }
  return false;
};

/**
 * Error handler for async functions - returns null on error
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return null;
  }
};

/**
 * Error handler for async functions - returns default value on error
 */
export const tryCatchWithDefault = async <T>(
  fn: () => Promise<T>,
  defaultValue: T,
  options: ErrorHandlerOptions = {}
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return defaultValue;
  }
};
