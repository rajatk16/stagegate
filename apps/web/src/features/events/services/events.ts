import { User } from 'firebase/auth';

import { isRecord } from '@/app/utils';
import { ApiError, authenticatedApiRequest } from '@/lib';

import { normalizeEventSlug, parseEvent, parseEventSettings } from '../utils';
import {
  Event,
  EventsPage,
  EventSettings,
  CreateEventInput,
  UpdateEventSettingsInput,
} from '../types';

export const listEvents = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<EventsPage> => {
  const query = new URLSearchParams({ limit: '20' });

  if (cursor !== null) {
    query.set('cursor', cursor);
  }

  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/events?${query.toString()}`,
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
    items: result.items.map((item) => parseEvent(item, organizationId)),
    nextCursor,
  };
};

export const createEvent = async (
  user: User,
  organizationId: string,
  input: CreateEventInput,
  signal: AbortSignal,
): Promise<Event> => {
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

  const event = parseEvent(result, organizationId);

  if (event.slug !== slug) {
    throw new ApiError(
      'The API returned an unexpected event response.',
      'response',
    );
  }

  return event;
};

export const getEvent = async (
  user: User,
  organizationId: string,
  eventId: string,
  signal: AbortSignal,
): Promise<EventSettings> => {
  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}`,
    { signal },
  );

  return parseEventSettings(result, organizationId, eventId);
};

export const updateEventSettings = async (
  user: User,
  organizationId: string,
  eventId: string,
  input: UpdateEventSettingsInput,
  signal: AbortSignal,
): Promise<EventSettings> => {
  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      json: input,
      signal,
    },
  );

  return parseEventSettings(result, organizationId, eventId);
};

export const findEventBySlug = async (
  user: User,
  organizationId: string,
  eventSlug: string,
  signal: AbortSignal,
): Promise<Event> => {
  let cursor: string | null = null;
  const seenCursors = new Set<string>();

  while (true) {
    signal.throwIfAborted();

    const page = await listEvents(user, organizationId, signal, cursor);

    const event = page.items.find((item) => item.slug === eventSlug);

    if (event) return event;

    if (page.nextCursor === null) {
      throw new ApiError('Event not found.', 'http', 404, 'EVENT_NOT_FOUND');
    }

    if (seenCursors.has(page.nextCursor)) {
      throw new ApiError('The API repeated an event page cursor', 'response');
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
};
