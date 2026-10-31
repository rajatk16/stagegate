import { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';
import { queryKeys, useApiMutation } from '@/app/query';

import { useEventWorkspace } from './useEventWorkspace';

const getWriteError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'EVENT_SELF_MEMBERSHIP_CHANGE_FORBIDDEN':
        return 'You cannot change your own event membership.';
      case 'EVENT_MEMBER_CHANGE_FORBIDDEN':
      case 'EVENT_INVITATION_ROLE_FORBIDDEN':
        return 'Your event authority does not permit this change.';
      case 'EVENT_MEMBER_INACTIVE':
        return 'Reactivate this membership before changing its role.';
      case 'EVENT_ARCHIVED':
        return 'Archived events only allow membership suspension and permitted invitation revocation.';
      case 'EVENT_INVITATION_ALREADY_ACCEPTED':
        return 'This invitation has already been accepted. Refresh the team.';
      case 'EVENT_INVITATION_EMAIL_UNCONFIRMED':
        return 'Email delivery could not be confirmed. Refresh pending invitations before trying again.';
    }

    if (error.status === 401) return 'Sign in again to continue.';
    if (error.status === 403 || error.status === 404) {
      return 'This operation is unavailable or your access has changed.';
    }
    if (error.status === 400) return 'Check the submitted values.';
    if (error.status === 429) return 'Too many requests. Wait and try again.';
  }

  return 'The result could not be confirmed. Refresh the team before trying again.';
};

export const useEventTeamWrite = () => {
  const { user, organizationId, event } = useEventWorkspace();

  const controllerRef = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  const mutation = useApiMutation({
    user,
    request: (
      _user: User,
      action: (signal: AbortSignal) => Promise<string>,
      signal: AbortSignal,
    ) => action(signal),
    affected: [
      queryKeys.eventAccess(user.uid, organizationId, event.id),
      queryKeys.eventMembers(user.uid, organizationId, event.id),
      queryKeys.eventInvitations(user.uid, organizationId, event.id),
      queryKeys.resources(user.uid, organizationId, 'activity'),
    ],
  });

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = async (
    action: (signal: AbortSignal) => Promise<string>,
  ): Promise<boolean> => {
    if (controllerRef.current || needsRefresh) return false;

    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    setFeedback(null);

    try {
      const message = await mutation.execute(action, controller.signal);

      if (controller.signal.aborted) return false;

      setFeedback({ tone: 'success', message });
      return true;
    } catch (error: unknown) {
      if (controller.signal.aborted) return false;

      setNeedsRefresh(true);
      setFeedback({
        tone: 'error',
        message: getWriteError(error),
      });

      return false;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (!controller.signal.aborted) setPending(false);
    }
  };

  return {
    run,
    pending,
    needsRefresh,
    feedback,
    clearAfterRefresh: () => {
      setNeedsRefresh(false);
      setFeedback(null);
    },
  };
};
