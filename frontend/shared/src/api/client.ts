import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '../types';

// Get base URL from environment or use default
const getBaseURL = (): string => {
  try {
    // @ts-ignore - import.meta.env is defined in Vite environment
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
    // Handle common errors
    if (error.response) {
      const apiError: ApiError = {
        success: false,
        message: error.response.data?.message || 'An error occurred',
        statusCode: error.response.status,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      const apiError: ApiError = {
        success: false,
        message: 'No response from server',
      };
      return Promise.reject(apiError);
    } else {
      const apiError: ApiError = {
        success: false,
        message: error.message || 'Request failed',
      };
      return Promise.reject(apiError);
    }
  }
);

export { apiClient };
