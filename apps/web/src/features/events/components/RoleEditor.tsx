import { useState } from 'react';

import { ConfirmDialog, SelectField } from '@/components';

import { EventMember } from '../types';
import { updateEventMemberRole } from '../services';
import { useEventTeamWrite, useEventWorkspace } from '../hooks';
import {
  isEventRole,
  EVENT_ROLE_LABELS,
  getGrantableEventRoles,
} from '../utils';

type Props = {
  member: EventMember;
  disabled: boolean;
  write: ReturnType<typeof useEventTeamWrite>;
};

export const RoleEditor = (props: Props) => {
  const { user, organizationId, event, access } = useEventWorkspace();

  const [role, setRole] = useState(props.member.role);

  const choices = getGrantableEventRoles(access.authority);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <SelectField
        id={`role-${props.member.uid}`}
        label="New role"
        value={role}
        disabled={props.disabled}
        onChange={(changeEvent) => {
          const value = changeEvent.target.value;
          if (isEventRole(value)) setRole(value);
        }}
      >
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {EVENT_ROLE_LABELS[choice]}
          </option>
        ))}
      </SelectField>

      <ConfirmDialog
        triggerLabel='"Change role'
        title="Change this member's event role?"
        description={`${EVENT_ROLE_LABELS[props.member.role]} -> ${EVENT_ROLE_LABELS[role]}`}
        confirmLabel="Change role"
        disabled={props.disabled || role === props.member.role}
        onConfirm={async () => {
          const saved = await props.write.run(async (signal) => {
            await updateEventMemberRole(
              user,
              organizationId,
              event.id,
              props.member.uid,
              role,
              signal,
            );
            return 'Event role updated.';
          });

          if (!saved) throw new Error('Role update failed.');
        }}
      />
    </div>
  );
};
