import { useCallback, useEffect, useRef, useState } from 'react';
import { InvitationPage } from '../types';
import { User } from 'firebase/auth';
import { getInvitationErrorMessage } from '../utils';
import { listOrganizationInvitations } from '../services';

type State =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'ready';
      page: InvitationPage;
    };

export const useOrganizationInvitation = (
  user: User,
  organizationId: string,
) => {
  const [state, setState] = useState<State>({ status: 'loading' });
  const request = useRef<AbortController | null>(null);

  const load = useCallback(
    async (cursor: string | null = null, showLoading = true) => {
      request.current?.abort();

      const controller = new AbortController();
      request.current = controller;

      if (showLoading) {
        setState({ status: 'loading' });
      }

      try {
        const page = await listOrganizationInvitations(
          user,
          organizationId,
          controller.signal,
          cursor,
        );

        if (!controller.signal.aborted) {
          setState({ status: 'ready', page });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: getInvitationErrorMessage(error),
          });
        }
      } finally {
        if (request.current === controller) {
          request.current = null;
        }
      }
    },
    [user, organizationId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load(null, false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      request.current?.abort();
    };
  }, [load]);

  const invalidate = (message: string) => {
    request.current?.abort();
    setState({ status: 'error', message });
  };

  return {
    state,
    invalidate,
    refresh: () => void load(),
    nextPage: () => {
      if (state.status === 'ready' && state.page.nextCursor !== null) {
        void load(state.page.nextCursor);
      }
    },
  };
};
