import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui';

interface InviteMembersButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const InviteMembersButton = (props: InviteMembersButtonProps) => {
  return (
    <Button onClick={props.onClick} disabled={props.disabled}>
      <UserPlus className="mr-2 h-4 w-4" />
      Invite Member
    </Button>
  );
};
