import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui';

import { ORGANIZATION_ROUTES } from '../../constants';
import { useCurrentOrganization, useOrganizations } from '../../hooks';

export const OrganizationSwitcher = () => {
  const navigate = useNavigate();

  const currentOrganization = useCurrentOrganization();
  const { data: organizations = [] } = useOrganizations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{currentOrganization?.name}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map((organization) => (
          <DropdownMenuItem
            key={organization.id}
            onClick={() =>
              navigate(ORGANIZATION_ROUTES.DETAIL(organization.slug))
            }
          >
            {organization.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(ORGANIZATION_ROUTES.CREATE)}>
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
