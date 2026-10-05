import { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';

import {
  OrganizationMember,
  listOrganizationMembers,
  getOrganizationErrorMessage,
} from '../services';

type MembersState =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      message: string;
      accessChanged: boolean;
    }
  | {
      status: 'ready';
      items: OrganizationMember[];
      nextCursor: string | null;
      loadingMore: boolean;
      pageError: string | null;
      restartRequired: boolean;
    };

export const useOrganizationMembers = (user: User, organizationId: string) => {
  const [state, setState] = useState<MembersState>({
    status: 'loading',
  });

  const requestRef = useRef<AbortController | null>(null);
  const seenCursorRef = useRef(new Set<string>());

  const loadPage = useCallback(
    async (cursor: string | null, append: boolean, showLoading = true) => {
      if (append && requestRef.current !== null) {
        return;
      }

      requestRef.current?.abort();

      const controller = new AbortController();
      requestRef.current = controller;

      if (append) {
        setState((current) =>
          current.status === 'ready'
            ? {
                ...current,
                loadingMore: true,
                pageError: null,
              }
            : current,
        );
      } else {
        seenCursorRef.current.clear();

        if (showLoading) {
          setState({ status: 'loading' });
        }
      }

      try {
        const page = await listOrganizationMembers(
          user,
          organizationId,
          controller.signal,
          cursor,
        );

        if (controller.signal.aborted) {
          return;
        }

        if (
          page.nextCursor !== null &&
          seenCursorRef.current.has(page.nextCursor)
        ) {
          throw new ApiError(
            'The API repeated a member pagination cursor.',
            'response',
          );
        }

        if (page.nextCursor !== null) {
          seenCursorRef.current.add(page.nextCursor);
        }

        setState((current) => {
          const previousItems =
            append && current.status === 'ready' ? current.items : [];

          const membersByUid = new Map(
            previousItems.map((member) => [member.uid, member]),
          );

          for (const member of page.items) {
            membersByUid.set(member.uid, member);
          }

          return {
            status: 'ready',
            items: [...membersByUid.values()],
            nextCursor: page.nextCursor,
            loadingMore: false,
            pageError: null,
            restartRequired: false,
          };
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        const message = getOrganizationErrorMessage(error);

        const accessChanged =
          error instanceof ApiError &&
          (error.status === 401 ||
            error.status === 403 ||
            error.status === 404);

        if (!append || accessChanged) {
          setState({
            status: 'error',
            message,
            accessChanged,
          });
          return;
        }

        const restartRequired =
          error instanceof ApiError &&
          (error.status === 400 || error.kind === 'response');

        setState((current) =>
          current.status === 'ready'
            ? {
                ...current,
                loadingMore: false,
                pageError: message,
                restartRequired,
              }
            : current,
        );
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      }
    },
    [user, organizationId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPage(null, false, false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestRef.current?.abort();
    };
  }, [loadPage]);

  const refresh = () => {
    void loadPage(null, false);
  };

  const loadMore = () => {
    if (
      state.status !== 'ready' ||
      state.nextCursor === null ||
      state.loadingMore ||
      state.restartRequired
    ) {
      return;
    }

    void loadPage(state.nextCursor, true);
  };

  return {
    state,
    refresh,
    loadMore,
  };
};
