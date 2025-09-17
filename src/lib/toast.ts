'use client';

type ToastFunction = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

let toastInstance: ToastFunction | null = null;

if (typeof window !== 'undefined') {
  import('sonner').then((module) => {
    toastInstance = module.toast;
  });
}

export const toast: ToastFunction = {
  success: (message: string) => {
    if (toastInstance) {
      toastInstance.success(message);
    } else {
      console.log('[Toast Success]:', message);
    }
  },
  error: (message: string) => {
    if (toastInstance) {
      toastInstance.error(message);
    } else {
      console.error('[Toast Error]:', message);
    }
  },
  info: (message: string) => {
    if (toastInstance) {
      toastInstance.info(message);
    } else {
      console.info('[Toast Info]:', message);
    }
  },
  warning: (message: string) => {
    if (toastInstance) {
      toastInstance.warning(message);
    } else {
      console.warn('[Toast Warning]:', message);
    }
  },
};