import { toast } from 'sonner';

import type { NotificationOptions } from './types';

class NotificationService {
  success(title: string, options?: NotificationOptions) {
    toast.success(title, options);
  }

  error(title: string, options?: NotificationOptions) {
    toast.error(title, options);
  }

  info(title: string, options?: NotificationOptions) {
    toast.info(title, options);
  }

  warning(title: string, options?: NotificationOptions) {
    toast.warning(title, options);
  }

  loading(title: string, options?: NotificationOptions) {
    return toast.loading(title, options);
  }

  dismiss(id?: string | number) {
    toast.dismiss(id);
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) {
    return toast.promise(promise, messages);
  }
}

export const notificationService = new NotificationService();
