import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { Button, InlineAlert, SelectField, SubmitButton } from '@/components';
import { queryKeys, useMembersQuery, hasRepeatedCursor } from '@/app/query';
import { getOrganizationSectionPath } from '@/lib';

import type { AddEventMemberInput, EventRole } from '../types';
import { EVENT_ROLE_LABELS } from '../utils';
import { useEventWorkspace } from '../hooks';

type Props = {
  assignedUids: readonly string[];
  roles: readonly EventRole[];
  disabled: boolean;
  pending: boolean;
  onAdd: (input: AddEventMemberInput) => Promise<boolean>;
};

export const AddEventMemberForm = ({
  assignedUids,
  roles,
  disabled,
  pending,
  onAdd,
}: Props) => {
  const { user, organizationId, organizationSlug } = useEventWorkspace();

  const client = useQueryClient();

  const query = useMembersQuery(user, organizationId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddEventMemberInput>({
    defaultValues: {
      uid: '',
      role: 'REVIEWER',
    },
    mode: 'onBlur',
  });

  const repeatedCursor = hasRepeatedCursor(query.data);

  const assigned = new Set(assignedUids);

  const organizationMembers = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.items) ?? []).map((member) => [
        member.uid,
        member,
      ]),
    ).values(),
  ];

  const candidates = organizationMembers.filter(
    (member) =>
      member.status === 'ACTIVE' &&
      member.role !== 'OWNER' &&
      member.role !== 'ADMIN' &&
      !assigned.has(member.uid),
  );

  const blocked =
    disabled ||
    pending ||
    query.isPending ||
    query.isFetching ||
    Boolean(query.error) ||
    repeatedCursor;

  const refreshMembers = () => {
    void client.resetQueries({
      queryKey: queryKeys.resources(user.uid, organizationId, 'members'),
      exact: true,
    });
  };

  const submit = async (values: AddEventMemberInput) => {
    if (blocked) {
      return;
    }

    if (!candidates.some((member) => member.uid === values.uid)) {
      setError('uid', {
        message: 'Choose an active organization member.',
      });

      return;
    }

    if (!roles.includes(values.role)) {
      setError('role', {
        message: 'Choose a role you can assign.',
      });

      return;
    }

    const saved = await onAdd(values);

    if (saved) {
      reset({
        uid: '',
        role: 'REVIEWER',
      });
    }
  };

  return (
    <form
      noValidate
      className="space-y-4 rounded-2xl border p-5"
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Add organization member</h3>

        <p className="text-sm text-muted-foreground">
          Choose someone who already belongs to this organization and assign
          their event role.
        </p>
      </div>

      {query.isPending && <p role="status">Loading organization members…</p>}

      {(query.error || repeatedCursor) && (
        <InlineAlert tone="error">
          Could not load the organization member list. Refresh members before
          continuing.
        </InlineAlert>
      )}

      <fieldset
        disabled={blocked || roles.length === 0}
        className="min-w-0 space-y-4"
      >
        <legend className="sr-only">Event assignment</legend>

        <SelectField
          id="event-member-uid"
          label="Organization member"
          error={errors.uid?.message}
          {...register('uid', {
            required: 'Choose an organization member.',
          })}
        >
          <option value="">Choose a member</option>

          {candidates.map((member) => (
            <option key={member.uid} value={member.uid}>
              {member.displayName ?? member.email ?? member.uid}
              {member.displayName && member.email ? ` — ${member.email}` : ''}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="event-member-role"
          label="Event role"
          error={errors.role?.message}
          {...register('role', {
            validate: (role) =>
              roles.includes(role) || 'Choose a role you can assign.',
          })}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {EVENT_ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>

        <SubmitButton
          pending={pending}
          pendingLabel="Adding member…"
          disabled={blocked || candidates.length === 0}
        >
          Add to event
        </SubmitButton>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        {query.hasNextPage && (
          <Button
            type="button"
            variant="outline"
            disabled={
              disabled ||
              pending ||
              query.isFetching ||
              Boolean(query.error) ||
              repeatedCursor
            }
            onClick={() => {
              void query.fetchNextPage({
                cancelRefetch: false,
              });
            }}
          >
            {query.isFetchingNextPage
              ? 'Loading members…'
              : 'Load more organization members'}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={disabled || pending || query.isFetching}
          onClick={refreshMembers}
        >
          Refresh members
        </Button>

        <Button asChild variant="outline">
          <Link to={getOrganizationSectionPath(organizationSlug, 'members')}>
            Manage organization members
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        If the person is missing, load more members or invite them to the
        organization first. Organization owners and administrators already have
        event access.
      </p>
    </form>
  );
};
