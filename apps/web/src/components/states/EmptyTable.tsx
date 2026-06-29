import { Table2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from './EmptyState';

interface EmptyTableProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyTable = ({
  title = 'No data available',
  description = 'There are no records to display yet.',
  action,
}: EmptyTableProps) => {
  return (
    <EmptyState
      compact
      title={title}
      action={action}
      description={description}
      icon={Table2}
    />
  );
};
