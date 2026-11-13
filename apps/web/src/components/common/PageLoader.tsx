import { Skeleton } from '../ui/Skeleton';

export const PageLoader = () => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="mx-auto w-full max-w-7xl space-y-6 p-6"
  >
    <span className="sr-only">Loading page</span>

    <div className="space-y-3">
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>

    <Skeleton className="h-64 w-full" />
  </div>
);
