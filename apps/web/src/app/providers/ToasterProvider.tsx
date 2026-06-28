import { Toaster } from '@/components/ui';

export const ToasterProvider = () => (
  <Toaster expand richColors closeButton position="top-right" duration={3000} />
);
