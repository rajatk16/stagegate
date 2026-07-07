import { UserIcon } from 'lucide-react';

import { Badge } from '@/components/ui';

export const CurrentUserBadge = () => {
  return (
    <Badge variant="secondary" className="ml-2">
      <UserIcon className="h-4 w-4" />
    </Badge>
  );
};
