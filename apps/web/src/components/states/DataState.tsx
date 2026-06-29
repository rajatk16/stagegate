import type { ReactNode } from 'react';

import { EmptyState } from './EmptyState';
import { InlineLoader, PageError } from '../feedback';

interface DataStateProps<T> {
  error?: unknown;
  isLoading?: boolean;
  emptyState?: ReactNode;
  data: T | null | undefined;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

export const DataState = <T,>({
  data,
  isLoading,
  error,
  isEmpty,
  emptyState,
  children,
}: DataStateProps<T>) => {
  if (isLoading) {
    return <InlineLoader text="loading..." />;
  }

  if (error) {
    return <PageError />;
  }

  if (!data) {
    return (
      emptyState ?? (
        <EmptyState title="No Data" description="Nothing to see here folks." />
      )
    );
  }

  if (isEmpty?.(data)) {
    return (
      emptyState ?? (
        <EmptyState title="No Data" description="Nothing to see here folks." />
      )
    );
  }

  return <>{children(data)}</>;
};
