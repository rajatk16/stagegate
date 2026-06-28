import type { ReactNode } from 'react';

import { PageTitle } from './PageTitle';
import { PageActions } from './PageActions';
import { PageDescription } from './PageDescription';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = (props: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <PageTitle>{props.title}</PageTitle>
        {props.description && (
          <PageDescription>{props.description}</PageDescription>
        )}
        {props.actions && <PageActions>{props.actions}</PageActions>}
      </div>
    </header>
  );
};
