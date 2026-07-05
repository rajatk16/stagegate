import { Badge } from '@/components/ui';

import type { OrganizationRole } from '../../types';

interface MemberRoleBadgeProps {
  roles: OrganizationRole[];
}

const ROLE_VARIANTS: Record<
  OrganizationRole,
  'default' | 'secondary' | 'outline'
> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
};

export const MemberRoleBadges = ({ roles }: MemberRoleBadgeProps) => (
  <>
    {roles.map((role: OrganizationRole) => (
      <Badge key={role} variant={ROLE_VARIANTS[role]}>
        {role}
      </Badge>
    ))}
  </>
  // {roles.map((role: OrganizationRole) => (
  //   <Badge key={role} variant={ROLE_VARIANTS[role]}>{role}</Badge>
  // ))}
);
