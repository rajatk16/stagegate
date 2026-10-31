import { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';
import { queryKeys, useApiMutation } from '@/app/query';

import { useEventWorkspace } from './useEventWorkspace';

const getWriteError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'EVENT_MEMBERSHIP_ADMIN_REQUIRED':
      case 'EVENT_MEMBER_CHANGE_FORBIDDEN':
        return 'Only organization owners and administrators can manage event assignments.';

      case 'EVENT_SELF_MEMBERSHIP_CHANGE_FORBIDDEN':
        return 'You cannot change your own event membership.';

      case 'EVENT_TARGET_ORGANIZATION_MEMBERSHIP_REQUIRED':
        return 'This person must join the organization before they can be added to the event.';

      case 'EVENT_TARGET_ORGANIZATION_MEMBERSHIP_INACTIVE':
        return 'Reactivate this person’s organization membership first.';

      case 'EVENT_ALREADY_MEMBER':
        return 'This person already has an event assignment. Refresh the team and use the role or status controls.';

      case 'EVENT_MEMBER_NOT_FOUND':
        return 'This assignment is no longer current. Refresh the team.';

      case 'EVENT_MEMBER_INACTIVE':
        return 'Reactivate this event assignment before changing its role.';

      case 'EVENT_ORGANIZATION_ADMIN_ASSIGNMENT_UNNECESSARY':
        return 'Organization owners and administrators already have access to this event.';

      case 'EVENT_ORGANIZATION_ADMIN_CHANGE_FORBIDDEN':
        return 'Manage this person’s access from the organization members page.';

      case 'EVENT_ARCHIVED':
        return 'Archived events only allow assignment suspension.';
    }

    if (error.status === 401) {
      return 'Sign in again to continue.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'This operation is unavailable or your access has changed.';
    }

    if (error.status === 400) {
      return 'Check the submitted values.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait and try again.';
    }
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
      queryKeys.resources(user.uid, organizationId, 'events'),
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
