import { Mail } from 'lucide-react';

import { EmptyState } from '@/components/states';

export const PendingInvitationsEmptyState = () => (
  <EmptyState
    icon={Mail}
    title="No pending invitations"
    description="Everyone you've invited has already responded"
  />
);
