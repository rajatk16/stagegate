import { Shield, ShieldCheck, User } from 'lucide-react';

import { Badge } from '@/components/ui';

import { OrganizationRole } from '../../types';

interface MemberRoleBadgeProps {
  role: OrganizationRole;
}

export const MemberRoleBadge = ({ role }: MemberRoleBadgeProps) => {
  switch (role) {
    case OrganizationRole.OWNER:
      return (
        <Badge className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          Owner
        </Badge>
      );

    case OrganizationRole.ADMIN:
      return (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          Member
        </Badge>
      );
  }
};
