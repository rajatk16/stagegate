import { User } from 'firebase/auth';
import { Organization } from '../types';
import { useNavigate } from 'react-router';
import { useOrganizations } from '../hooks';
import { useRef, useState } from 'react';
import { hasOrganizationCapability } from '../utils';
import { Button } from '@/components';
import { leaveOrganization } from '../services';
import { MembershipActionDialog } from './MembershiActionDialog';
import { queryKeys, useApiMutation } from '@/app/query';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  user: User;
  organization: Organization;
};

export const LeaveOrganizationPanel = (props: Props) => {
  const navigate = useNavigate();
  const { reload } = useOrganizations();
  const [pending, setPending] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const client = useQueryClient();

  const leaveMutation = useApiMutation({
    user: props.user,
    request: leaveOrganization,
    affected: [
      queryKeys.organizations(props.user.uid),
      queryKeys.organization(props.user.uid, props.organization.id),
    ],
    onSuccess: () => {
      void navigate('/dashboard', {
        replace: true,
        state: {
          leftOrganization: {
            uid: props.user.uid,
            name: props.organization.name,
          },
        },
      });

      client.setQueryData<Organization[]>(
        queryKeys.organizations(props.user.uid),
        (current) =>
          current?.filter(
            (organization) => organization.id !== props.organization.id,
          ),
      );

      client.removeQueries({
        queryKey: queryKeys.organization(props.user.uid, props.organization.id),
      });
    },
  });

  const canLeave = hasOrganizationCapability(
    props.organization,
    'organization:read',
  );

  if (!canLeave) {
    return null;
  }

  return (
    <section
      aria-labelledby="leave-organization-heading"
      className="space-y-4 rounded-2xl border border-destructive/30 bg-card p-6"
    >
      <div className="space-y-2">
        <h2
          id="leave-organization-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold"
        >
          Leave organization
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Leaving removes your membership and access to{' '}
          {props.organization.name}. Your account and existing organization data
          remain. You will need a new invitation to return.
        </p>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          An organization must retain at least one active owner. The last active
          owner cannot leave.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <MembershipActionDialog
          context="leave"
          triggerLabel="Leave organization"
          title={`Leave ${props.organization.name}?`}
          description={
            `Your membership will be removed and you will lose access to ` +
            `${props.organization.name}. The organization and its data will remain. ` +
            `You will need a new invitation to return. ` +
            `If you are its last active owner, this request will be blocked.`
          }
          confirmLabel="Leave organization"
          pendingLabel="Leaving…"
          destructive
          disabled={pending}
          restoreFocus={() => headingRef.current?.focus()}
          onPendingChange={setPending}
          run={(signal) => leaveMutation.execute(props.organization.id, signal)}
          onSuccess={() => {}}
        />

        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={reload}
        >
          Refresh access
        </Button>
      </div>
    </section>
  );
};
