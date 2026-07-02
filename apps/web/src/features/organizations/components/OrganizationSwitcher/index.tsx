import { useNavigate } from 'react-router-dom';

import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui';

import { ORGANIZATION_ROUTES } from '../../constants';
import { useCurrentOrganization, useOrganizations } from '../../hooks';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';
import { OrganizationSwitcherContent } from './OrganizationSwitcherContent';

export const OrganizationSwitcher = () => {
  const navigate = useNavigate();

  const currentOrganization = useCurrentOrganization();
  const { data: organizations = [], isLoading } = useOrganizations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OrganizationSwitcherTrigger organization={currentOrganization} />
      </DropdownMenuTrigger>
      <OrganizationSwitcherContent
        isLoading={isLoading}
        organizations={organizations}
        currentOrganization={currentOrganization}
        onCreate={() => navigate(ORGANIZATION_ROUTES.CREATE)}
        onSelect={(organization) =>
          navigate(ORGANIZATION_ROUTES.DETAIL(organization.slug))
        }
      />
    </DropdownMenu>
  );
};
