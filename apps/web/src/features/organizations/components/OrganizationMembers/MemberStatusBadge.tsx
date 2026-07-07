import { Badge } from '@/components/ui';

import { MembershipStatus } from '../../types';

interface MemberStatusBadgeProps {
  status: MembershipStatus;
}

export const MemberStatusBadge = (props: MemberStatusBadgeProps) => {
  if (props.status === MembershipStatus.ACTIVE) {
    return <Badge className="bg-green-500 text-green-700">Active</Badge>;
  } else if (props.status === MembershipStatus.INVITED) {
    return <Badge className="bg-blue-500 text-blue-700">Invited</Badge>;
  } else {
    return <Badge className="bg-red-500 text-red-700">Removed</Badge>;
  }
};
