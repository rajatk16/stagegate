import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  DropdownMenuContent,
} from '@/components/ui';

import type { OrganizationSummary } from '../../types';
import { OrganizationSwitcherEmpty } from './OrganizationSwitcherEmpty';
import { OrganizationSwitcherGroup } from './OrganizationSwitcherGroup';
import { OrganizationSwitcherFooter } from './OrganizationSwitcherFooter';
import { OrganizationSwitcherLoading } from './OrganizationSwitcherLoading';

interface Props {
  isLoading: boolean;
  organizations: OrganizationSummary[];
  currentOrganization: OrganizationSummary | null;

  onCreate: () => void;
  onSelect: (organization: OrganizationSummary) => void;
}

export const OrganizationSwitcherContent = (props: Props) => {
  if (props.isLoading) {
    return <OrganizationSwitcherLoading />;
  }

  if (props.organizations.length === 0) {
    return <OrganizationSwitcherEmpty onCreateOrganization={props.onCreate} />;
  }
  const groups = [
    {
      title: 'Organizations',
      organizations: props.organizations,
    },
  ];
  return (
    <DropdownMenuContent className="w-80" align="start">
      <Command>
        <CommandInput placeholder="Search organizations..." />
        <CommandList>
          <CommandEmpty>No organizations found.</CommandEmpty>
          <CommandGroup heading="Organizations">
            {groups.map((group) => (
              <OrganizationSwitcherGroup
                group={group}
                key={group.title}
                onSelect={props.onSelect}
                currentOrganization={props.currentOrganization}
              />
            ))}
          </CommandGroup>
          <OrganizationSwitcherFooter onCreate={props.onCreate} />
        </CommandList>
      </Command>
    </DropdownMenuContent>
  );
};
