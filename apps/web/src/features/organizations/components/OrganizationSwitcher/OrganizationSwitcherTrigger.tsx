import { Building2, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui';

import type { OrganizationSummary } from '../../types';

interface Props {
  organization: OrganizationSummary | null;
}

export const OrganizationSwitcherTrigger = ({ organization }: Props) => (
  <Button variant="ghost" className="flex w-full items-center justify-between">
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <span className="truncate">
        {organization?.name ?? 'Select Organization'}
      </span>
    </div>
    <ChevronsUpDown className="h-4 w-4 opacity-60" />
  </Button>
);
