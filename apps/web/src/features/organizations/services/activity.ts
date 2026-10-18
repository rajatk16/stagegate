import { User } from 'firebase/auth';
import { OrganizationActivityPage } from '../types';
import { ApiError, authenticatedApiRequest } from '@/lib';
import { isRecord } from '@/app/utils';
import { parseEvent } from '../utils';

export const listOrganizationActivity = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<OrganizationActivityPage> => {
  const query = new URLSearchParams({ limit: '20' });

  if (cursor !== null) {
    query.set('cursor', cursor);
  }

  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/audit?${query}`,
    { signal },
  );

  if (!isRecord(result) || !Array.isArray(result.items)) {
    throw new ApiError(
      'The API returned an unexpected activity response.',
      'response',
    );
  }

  const nextCursor = result.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== 'string' ||
      nextCursor.length > 2048 ||
      !/^[A-Za-z0-9_-]+$/.test(nextCursor))
  ) {
    throw new ApiError(
      'The API returned an unexpected activity response.',
      'response',
    );
  }

  if (result.items.length === 0 && nextCursor !== null) {
    throw new ApiError(
      'The API returned an unexpected activity response.',
      'response',
    );
  }

  return {
    items: result.items.map((item) => parseEvent(item, organizationId)),
    nextCursor,
  };
};
