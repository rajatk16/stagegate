import { Building2, Check, ChevronsUpDown } from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';

import { useOrganizationStore } from '../store';
import { useCurrentOrganization, useOrganizations } from '../selectors';

export const OrganizationSwitcher = () => {
  const organizations = useOrganizations();

  const currentOrganization = useCurrentOrganization();

  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization,
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
          </div>
          <span>{currentOrganization?.name}</span>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[240px]">
        {organizations.map((organization) => (
          <DropdownMenuItem
            onClick={() => setCurrentOrganization(organization)}
            key={organization.id}
          >
            <div className="flex w-full items-center justify-between">
              <span>{organization.name}</span>
              {organization.id === currentOrganization?.id && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
