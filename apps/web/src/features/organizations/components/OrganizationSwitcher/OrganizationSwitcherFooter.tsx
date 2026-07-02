import { Plus } from 'lucide-react';

import { CommandGroup, CommandItem, CommandSeparator } from '@/components/ui';

interface Props {
  onCreate: () => void;
}

export const OrganizationSwitcherFooter = (props: Props) => (
  <>
    <CommandSeparator />
    <CommandGroup>
      <CommandItem onSelect={props.onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Organization
      </CommandItem>
    </CommandGroup>
  </>
);
