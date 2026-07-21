import { MoreHorizontal } from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui';

import type { OrganizationInvitation } from '../../types';

interface Props {
  isRevoking?: boolean;
  invitation: OrganizationInvitation;

  onRevoke: (invitation: OrganizationInvitation) => void;
}

export const PendingInvitationActions = ({
  isRevoking = false,
  ...props
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open Invitation Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isRevoking}
          onClick={() => props.onRevoke(props.invitation)}
          className="text-destructive focus:text-destructive"
        >
          Revoke Invitation
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>
          Resend Invitation
          <span className="ml-auto text-xs text-muted-foreground">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
