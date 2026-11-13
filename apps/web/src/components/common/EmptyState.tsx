import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, ...props }: Props) => (
  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
    </div>

    <h2 className="text-lg font-semibold">{props.title}</h2>

    <p className="mt-2 max-w-md text-sm text-muted-foreground">{props.description}</p>

    {props.action && <div className="mt-6">{props.action}</div>}
  </div>
);
