import { Check, Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { CommandItem } from '@/components/ui';

import type { OrganizationSummary } from '../../types';

interface OrganizationSwitcherItemProps {
  organization: OrganizationSummary;

  isSelected: boolean;

  onSelect: (organization: OrganizationSummary) => void;
}

export const OrganizationSwitcherItem = ({
  organization,
  isSelected,
  onSelect,
}: OrganizationSwitcherItemProps) => (
  <CommandItem
    onSelect={() => onSelect(organization)}
    value={`${organization.name} ${organization.slug}`}
  >
    <div className="flex w-full items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border">
        {organization.logoUrl ? (
          <img
            alt={organization.name}
            src={organization.logoUrl}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{organization.name}</span>

        <span className="truncate text-xs text-muted-foreground">
          {organization.slug}
        </span>
      </div>

      <Check className={cn('h-4 w-4', !isSelected && 'invisible')} />
    </div>
  </CommandItem>
);
