import { Suspense, type PropsWithChildren, type ReactNode } from 'react';

import { SuspenseFallback } from '@/components/feedback';

interface LazyRouteProps {
  fallback?: ReactNode;
}

export const LazyRoute = (props: PropsWithChildren<LazyRouteProps>) => (
  <Suspense fallback={props.fallback ?? <SuspenseFallback />}>
    {props.children}
  </Suspense>
);
