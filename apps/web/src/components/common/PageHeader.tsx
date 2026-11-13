import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = (props: Props) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{props.title}</h1>

      {props.description && <p className="text-sm text-muted-foreground">{props.description}</p>}
    </div>

    {props.actions && <div className="flex items-center gap-2">{props.actions}</div>}
  </div>
);
