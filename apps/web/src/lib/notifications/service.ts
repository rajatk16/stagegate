import { toast } from 'sonner';

import { NotificationDuration } from './duration';
import type { NotificationOptions } from './types';

class NotificationService {
  success(title: string, options?: NotificationOptions) {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? NotificationDuration.MEDIUM,
      action: options?.action,
    });
  }

  error(title: string, options?: NotificationOptions) {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? NotificationDuration.MEDIUM,
      action: options?.action,
    });
  }

  info(title: string, options?: NotificationOptions) {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration ?? NotificationDuration.MEDIUM,
      action: options?.action,
    });
  }

  warning(title: string, options?: NotificationOptions) {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? NotificationDuration.MEDIUM,
      action: options?.action,
    });
  }

  loading(title: string, options?: NotificationOptions) {
    return toast.loading(title, {
      description: options?.description,
      duration: NotificationDuration.PERSISTENT,
    });
  }

  dismiss(id?: string | number) {
    toast.dismiss(id);
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((result: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) {
    return toast.promise(promise, messages);
  }
}

export const notificationService = new NotificationService();
