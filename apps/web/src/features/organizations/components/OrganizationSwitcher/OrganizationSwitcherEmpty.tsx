import { Building2, Plus } from 'lucide-react';

import { Button, DropdownMenuContent } from '@/components/ui';

interface Props {
  onCreateOrganization: () => void;
}

export const OrganizationSwitcherEmpty = (props: Props) => (
  <DropdownMenuContent className="w-80" align="start">
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <Building2 className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <h3 className="font-medium">No organizations found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first organization to get started.
        </p>
      </div>
      <Button className="w-full" onClick={props.onCreateOrganization}>
        <Plus className="mr-2 h-4 w-4" />
        Create Organization
      </Button>
    </div>
  </DropdownMenuContent>
);
