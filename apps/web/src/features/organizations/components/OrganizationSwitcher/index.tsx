import { useNavigate } from 'react-router-dom';

import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui';

import { ORGANIZATION_ROUTES } from '../../constants';
import { useCurrentOrganization, useOrganizations } from '../../hooks';
import { OrganizationSwitcherContent } from './OrganizationSwitcherContent';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

export const OrganizationSwitcher = () => {
  const navigate = useNavigate();

  const currentOrganization = useCurrentOrganization();
  const { data, isLoading } = useOrganizations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OrganizationSwitcherTrigger organization={currentOrganization} />
      </DropdownMenuTrigger>
      <OrganizationSwitcherContent
        isLoading={isLoading}
        organizations={data ?? []}
        currentOrganization={currentOrganization}
        onCreate={() => navigate(ORGANIZATION_ROUTES.CREATE)}
        onSelect={(organization) =>
          navigate(ORGANIZATION_ROUTES.DASHBOARD(organization.slug))
        }
      />
    </DropdownMenu>
  );
};
