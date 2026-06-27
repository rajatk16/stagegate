import { Suspense, type PropsWithChildren, type ReactNode } from 'react';

interface LazyRouteProps extends PropsWithChildren {
  fallback?: ReactNode;
}

export const LazyRoute = (props: LazyRouteProps) => (
  <Suspense fallback={props.fallback ?? null}>{props.children}</Suspense>
);
