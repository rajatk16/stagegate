import { User } from 'firebase/auth';

import { normalizeEventSlug, parseOrganizationEvent } from '../utils';
import {
  CreateEventInput,
  OrganizationEvent,
  OrganizationEventsPage,
} from '../types';

import { isRecord } from '@/app/utils';
import { ApiError, authenticatedApiRequest } from '@/lib';

export const listOrganizationEvents = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<OrganizationEventsPage> => {
  const query = new URLSearchParams({ limit: '20' });

  if (cursor !== null) {
    query.set('cursor', cursor);
  }

  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/events${query}`,
    { signal },
  );

  if (!isRecord(result) || !Array.isArray(result.items)) {
    throw new ApiError(
      'The API returned an unexpected event response.',
      'response',
    );
  }

  const nextCursor = result.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== 'string' ||
      nextCursor.length > 2_048 ||
      !/^[A-Za-z0-9_-]+$/.test(nextCursor))
  ) {
    throw new ApiError(
      'The API returned an unexpected event response.',
      'response',
    );
  }

  if (result.items.length === 0 && nextCursor !== null) {
    throw new ApiError(
      'The API returned an unexpected event response.',
      'response',
    );
  }

  return {
    items: result.items.map((item) =>
      parseOrganizationEvent(item, organizationId),
    ),
    nextCursor,
  };
};

export const createOrganizationEvent = async (
  user: User,
  organizationId: string,
  input: CreateEventInput,
  signal: AbortSignal,
): Promise<OrganizationEvent> => {
  const slug = normalizeEventSlug(input.slug);

  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/events`,
    {
      method: 'POST',
      json: {
        name: input.name.trim(),
        slug,
      },
      signal,
    },
  );

  const event = parseOrganizationEvent(result, organizationId);

  if (event.slug !== slug) {
    throw new ApiError(
      'The API returned an unexpected event response.',
      'response',
    );
  }

  return event;
};
