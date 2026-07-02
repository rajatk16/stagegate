import { CommandGroup } from '@/components/ui';
import type { OrganizationSummary } from '../../types';
import { OrganizationSwitcherItem } from './OrganizationSwitcherItem';

interface OrganizationSwitcherGroupProps {
  group: {
    title: string;
    organizations: OrganizationSummary[];
  };
  currentOrganization: OrganizationSummary;

  onSelect: (organization: OrganizationSummary) => void;
}

export const OrganizationSwitcherGroup = (
  props: OrganizationSwitcherGroupProps,
) => {
  if (props.group.organizations.length === 0) {
    return null;
  }
  return (
    <CommandGroup heading={props.group.title}>
      {props.group.organizations.map((organization) => (
        <OrganizationSwitcherItem
          key={organization.id}
          organization={organization}
          isSelected={props.currentOrganization?.id === organization.id}
          onSelect={props.onSelect}
        />
      ))}
    </CommandGroup>
  );
};
