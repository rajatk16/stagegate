import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState, type PropsWithChildren } from 'react';

import { appConfig } from '@/config/appConfig';
import { createQueryClient } from '@/lib/queryClient';

const QueryDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('@tanstack/react-query-devtools');

      return {
        default: module.ReactQueryDevtools,
      };
    })
  : null;

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {QueryDevtools && appConfig.features.queryDevtools ? (
        <Suspense fallback={null}>
          <QueryDevtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
};
