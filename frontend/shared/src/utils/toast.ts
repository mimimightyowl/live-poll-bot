import { useToast, TYPE, POSITION } from 'vue-toastification';
import type { ToastOptions } from 'vue-toastification/dist/types/types';

// Toast instance - will be initialized by the apps
let toastInstance: ReturnType<typeof useToast> | null = null;

export const initToast = () => {
  toastInstance = useToast();
  return toastInstance;
};

export const getToast = () => {
  if (!toastInstance) {
    // eslint-disable-next-line no-console
    console.warn('Toast not initialized. Call initToast() first.');
  }
  return toastInstance;
};

// Default toast options (without type field to avoid conflicts)
const defaultOptions: Omit<ToastOptions, 'type'> = {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
};

export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    const instance = getToast();
    if (instance) {
      instance.success(message, { ...defaultOptions, ...options });
    }
  },

  error: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    const instance = getToast();
    if (instance) {
      instance.error(message, {
        ...defaultOptions,
        timeout: 7000, // Errors stay a bit longer
        ...options,
      });
    }
  },

  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    const instance = getToast();
    if (instance) {
      instance.warning(message, { ...defaultOptions, ...options });
    }
  },

  info: (message: string, options?: Omit<ToastOptions, 'type'>) => {
    const instance = getToast();
    if (instance) {
      instance.info(message, { ...defaultOptions, ...options });
    }
  },

  // Generic method
  show: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: Omit<ToastOptions, 'type'>
  ) => {
    const instance = getToast();
    if (instance) {
      instance[type](message, { ...defaultOptions, ...options });
    }
  },
};

// Export types
export type { ToastOptions };
export { TYPE, POSITION };
