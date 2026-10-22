import { User } from 'firebase/auth';

import { ApiError } from '@/lib';

import { useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  isAccessError,
  useMembersQuery,
  hasRepeatedCursor,
} from '@/app/query';

import { getOrganizationMembersErrorMessage } from '../services';

export const useOrganizationMembers = (user: User, organizationId: string) => {
  const client = useQueryClient();
  const query = useMembersQuery(user, organizationId);

  const key = queryKeys.resources(user.uid, organizationId, 'members');
  const accessChanged = isAccessError(query.error);
  const repeatedCursor = hasRepeatedCursor(query.data);

  const restartRequired =
    repeatedCursor ||
    (query.error instanceof ApiError &&
      (query.error.status === 400 || query.error.kind === 'response'));

  const message = query.error
    ? getOrganizationMembersErrorMessage(query.error)
    : repeatedCursor
      ? 'The server repeated a page cursor. Refresh the team.'
      : null;

  const items = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.items) ?? []).map((member) => [
        member.uid,
        member,
      ]),
    ).values(),
  ];

  const state =
    accessChanged || (query.isError && !query.data)
      ? {
          status: 'error' as const,
          message: message ?? 'Could not load the team.',
          accessChanged,
        }
      : query.isPending
        ? { status: 'loading' as const }
        : {
            status: 'ready' as const,
            items,
            nextCursor: query.hasNextPage
              ? (query.data?.pages.at(-1)?.nextCursor ?? null)
              : null,
            loadingMore: query.isFetching,
            pageError: message,
            restartRequired,
          };

  return {
    state,
    refresh: () => {
      void client.resetQueries({ queryKey: key, exact: true });
    },
    loadMore: () => {
      if (
        query.hasNextPage &&
        !query.isFetching &&
        !restartRequired &&
        !accessChanged
      ) {
        void query.fetchNextPage({ cancelRefetch: false });
      }
    },
  };
};
