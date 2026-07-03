import type { ComponentProps } from 'react';
import { Building2, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib';
import { Button } from '@/components/ui';

import type { OrganizationSummary } from '../../types';

type Props = ComponentProps<typeof Button> & {
  organization: OrganizationSummary | null;
};

export const OrganizationSwitcherTrigger = ({
  organization,
  className,
  ...props
}: Props) => (
  <Button
    {...props}
    variant="ghost"
    className={cn('flex w-full items-center justify-between', className)}
  >
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <span className="truncate">
        {organization?.name ?? 'Select Organization'}
      </span>
    </div>
    <ChevronsUpDown className="h-4 w-4 opacity-60" />
  </Button>
);
