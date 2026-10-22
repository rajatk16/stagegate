import { useState } from 'react';
import { InvitationPage } from '../types';
import { User } from 'firebase/auth';
import { getInvitationErrorMessage } from '../utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  hasRepeatedCursor,
  isAccessError,
  queryKeys,
  useSentInvitationsQuery,
} from '@/app/query';
import { ApiError } from '@/lib';

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
  const client = useQueryClient();
  const query = useSentInvitationsQuery(user, organizationId);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const key = queryKeys.resources(user.uid, organizationId, 'invitations');

  const accessChanged = isAccessError(query.error);
  const repeatedCursor = hasRepeatedCursor(query.data);

  const restartRequired =
    repeatedCursor ||
    (query.error instanceof ApiError &&
      (query.error.status === 400 || query.error.kind === 'response'));

  const pageError = query.error
    ? getInvitationErrorMessage(query.error)
    : repeatedCursor
      ? 'The server repeated a page cursor. Refresh invitations.'
      : null;

  const lastPage = query.data?.pages.at(-1);
  let state: State;

  if (blockedMessage !== null) {
    state = { status: 'error', message: blockedMessage };
  } else if (accessChanged || (query.isError && lastPage === undefined)) {
    state = {
      status: 'error',
      message: pageError ?? 'Could not load invitations.',
    };
  } else if (lastPage !== undefined) {
    const items = [
      ...new Map(
        query
          .data!.pages.flatMap((page) => page.items)
          .map((invitation) => [invitation.id, invitation]),
      ).values(),
    ];

    state = {
      status: 'ready',
      page: {
        items,
        allowedRoles: lastPage.allowedRoles,
        nextCursor: query.hasNextPage ? lastPage.nextCursor : null,
      },
    };
  } else {
    state = { status: 'loading' };
  }

  return {
    state,
    pageError,
    fetching: query.isFetching,
    restartRequired,
    invalidate: (message: string) => {
      void client.cancelQueries({ queryKey: key, exact: true });
      setBlockedMessage(message);
    },

    refresh: () => {
      setBlockedMessage(null);
      void client.resetQueries({ queryKey: key, exact: true });
    },

    nextPage: () => {
      if (
        query.hasNextPage &&
        !query.isFetching &&
        !accessChanged &&
        !restartRequired &&
        blockedMessage === null
      ) {
        void query.fetchNextPage({ cancelRefetch: false });
      }
    },
  };
};
