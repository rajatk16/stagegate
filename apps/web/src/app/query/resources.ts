import type { User } from 'firebase/auth';
import type { QueryKey } from '@tanstack/react-query';
import {
  useQuery,
  queryOptions,
  useInfiniteQuery,
  infiniteQueryOptions,
} from '@tanstack/react-query';

import { queryKeys } from './keys';

import { getProfile } from '@/features/profile/services';
import { listReceivedInvitations } from '@/features/invitations/services';
import {
  getOrganizationLogo,
  listMyOrganizations,
  listOrganizationEvents,
  listOrganizationMembers,
  listOrganizationActivity,
  listOrganizationInvitations,
} from '@/features/organizations/services';

type CursorPage = {
  items: unknown[];
  nextCursor: string | null;
};

const cursorOptions = <TPage extends CursorPage>(
  queryKey: QueryKey,
  read: (signal: AbortSignal, cursor: string | null) => Promise<TPage>,
) =>
  infiniteQueryOptions({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: ({ signal, pageParam }) => read(signal, pageParam),
    getNextPageParam: (lastPage, _pages, _lastPageParam, pageParams) => {
      const next = lastPage.nextCursor;

      if (next === null || pageParams.includes(next)) return undefined;

      return next;
    },
  });

export const hasRepeatedCursor = (
  data:
    | {
        pages: { nextCursor: string | null }[];
        pageParams: unknown[];
      }
    | undefined,
): boolean => {
  const next = data?.pages.at(-1)?.nextCursor;

  return (
    next !== undefined &&
    next !== null &&
    data !== undefined &&
    data.pageParams.includes(next)
  );
};

export const profileOptions = (user: User) =>
  queryOptions({
    queryKey: queryKeys.profile(user.uid),
    queryFn: ({ signal }) => getProfile(user, signal),
  });

export const organizationsOptions = (user: User) =>
  queryOptions({
    queryKey: queryKeys.organizations(user.uid),
    queryFn: ({ signal }) => listMyOrganizations(user, signal),

    // Membership and capabilities should refresh on each new mount.
    staleTime: 0,
  });

export const useProfileQuery = (user: User) => useQuery(profileOptions(user));

export const useMyOrganizationsQuery = (user: User) =>
  useQuery(organizationsOptions(user));

export const useMembersQuery = (user: User, organizationId: string) =>
  useInfiniteQuery(
    cursorOptions(
      queryKeys.resources(user.uid, organizationId, 'members'),
      (signal, cursor) =>
        listOrganizationMembers(user, organizationId, signal, cursor),
    ),
  );

export const useEventsQuery = (user: User, organizationId: string) =>
  useInfiniteQuery(
    cursorOptions(
      queryKeys.resources(user.uid, organizationId, 'events'),
      (signal, cursor) =>
        listOrganizationEvents(user, organizationId, signal, cursor),
    ),
  );

export const useActivityQuery = (user: User, organizationId: string) =>
  useInfiniteQuery(
    cursorOptions(
      queryKeys.resources(user.uid, organizationId, 'activity'),
      (signal, cursor) =>
        listOrganizationActivity(user, organizationId, signal, cursor),
    ),
  );

export const useSentInvitationsQuery = (user: User, organizationId: string) =>
  useInfiniteQuery(
    cursorOptions(
      queryKeys.resources(user.uid, organizationId, 'invitations'),
      (signal, cursor) =>
        listOrganizationInvitations(user, organizationId, signal, cursor),
    ),
  );

export const useReceivedInvitationsQuery = (user: User) =>
  useInfiniteQuery(
    cursorOptions(
      queryKeys.receivedInvitations(user.uid, user.email),
      (signal, cursor) => listReceivedInvitations(user, signal, cursor),
    ),
  );

export const useOrganizationLogoQuery = (
  user: User,
  organizationId: string,
  version: string | null,
) =>
  useQuery({
    queryKey: queryKeys.logo(user.uid, organizationId, version),
    queryFn: ({ signal }) => getOrganizationLogo(user, organizationId, signal),
    enabled: version !== null,
  });
