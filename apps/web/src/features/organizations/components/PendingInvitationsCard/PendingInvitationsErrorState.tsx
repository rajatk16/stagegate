import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui';
import { EmptyState } from '@/components/states';

interface Props {
  onRetry: () => void;
}

export const PendingInvitationsErrorState = ({ onRetry }: Props) => (
  <EmptyState
    icon={AlertCircle}
    title="Failed to load pending invitations"
    action={<Button onClick={onRetry}>Retry</Button>}
    description="Something went wrong while loading your pending invitations."
  />
);
