import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '../types';
import { getToast } from '../utils/toast';
import { getErrorMessage, shouldShowErrorToast } from '../utils/errorHandler';
import { RETRY_OPERATION_ID_KEY } from '../utils/retry';

// Get base URL from environment or use default
const getBaseURL = (): string => {
  try {
    return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
  } catch {
    return 'http://localhost:3000/api';
  }
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Get toast instance
    const toast = getToast();

    // Extract operation ID if this error came from a retry operation
    // The retry utility attaches this to track concurrent operations
    const operationId = (error as any)[RETRY_OPERATION_ID_KEY] as
      | symbol
      | undefined;

    // Handle common errors
    if (error.response) {
      const statusCode = error.response.status;
      const message =
        error.response.data?.message || getErrorMessage(statusCode);

      const apiError: ApiError = {
        success: false,
        message,
        statusCode,
      };

      // Preserve operation ID in the API error for tracking
      if (operationId) {
        (apiError as any)[RETRY_OPERATION_ID_KEY] = operationId;
      }

      // Show toast notification for client errors
      // Pass operation ID to prevent duplicate toasts during retries
      if (toast && shouldShowErrorToast(operationId)) {
        // Don't show toast for 401 errors (will be handled by auth flow)
        if (statusCode !== 401) {
          toast.error(message);
        }
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      const apiError: ApiError = {
        success: false,
        message: 'No response from server. Please check your connection.',
      };

      // Preserve operation ID
      if (operationId) {
        (apiError as any)[RETRY_OPERATION_ID_KEY] = operationId;
      }

      if (toast && shouldShowErrorToast(operationId)) {
        toast.error(apiError.message);
      }

      return Promise.reject(apiError);
    } else {
      const apiError: ApiError = {
        success: false,
        message: error.message || 'Request failed',
      };

      // Preserve operation ID
      if (operationId) {
        (apiError as any)[RETRY_OPERATION_ID_KEY] = operationId;
      }

      if (toast && shouldShowErrorToast(operationId)) {
        toast.error(apiError.message);
      }

      return Promise.reject(apiError);
    }
  }
);

export { apiClient };
