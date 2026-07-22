import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib';
import { Card, CardContent } from '@/components/ui';

import type { OrganizationMember } from '../../types';
import { MemberAvatar, MemberRoleBadge } from '../OrganizationMembers';

interface OrganizationMemberPickerItemProps {
  member: OrganizationMember;
  selected: boolean;
  disabled?: boolean;
  onSelect: (member: OrganizationMember) => void;
}

export const OrganizationMemberPickerItem = (
  props: OrganizationMemberPickerItemProps,
) => (
  <Card
    role="button"
    tabIndex={props.disabled ? -1 : 0}
    aria-disabled={props.disabled}
    aria-pressed={props.selected}
    onClick={() => {
      if (!props.disabled) {
        props.onSelect(props.member);
      }
    }}
    onKeyDown={(event) => {
      if (props.disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        props.onSelect(props.member);
      }
    }}
    className={cn(
      'cursor-pointer transition-all duration-200',
      'border',
      'hover:border-primary hover:bg-accent/30',
      'focus-visible:ring-2 focus-visible:ring-primary',
      props.selected && 'border-primary bg-primary/5 ring-1 ring-primary',
      props.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
    )}
  >
    <CardContent className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <MemberAvatar
          displayName={props.member.displayName}
          photoUrl={props.member.avatarUrl}
        />

        <div className="space-y-1">
          <div className="font-medium leading-none">
            {props.member.displayName}
          </div>

          <div className="text-sm text-muted-foreground">
            {props.member.email}
          </div>

          <MemberRoleBadge role={props.member.roles[0]} />
        </div>
      </div>

      <div className="flex items-center">
        <CheckCircle2
          className={cn(
            'h-5 w-5 transition-all',
            props.selected
              ? 'text-primary opacity-100'
              : 'text-muted-foreground opacity-30',
          )}
        />
      </div>
    </CardContent>
  </Card>
);
