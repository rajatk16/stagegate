import { ApiError } from '@/lib';
import { isDateString, isRecord } from '@/app/utils';

import { OrganizationEvent } from '../types';
import { EVENT_SLUG_PATTERN, UUID_PATTERN } from '../constants';

export const normalizeEventSlug = (value: string): string =>
  value.trim().toLowerCase();

export const suggestEventSlug = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '');

export const parseOrganizationEvent = (
  value: unknown,
  organizationId: string,
): OrganizationEvent => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !UUID_PATTERN.test(value.id) ||
    value.organizationId !== organizationId ||
    typeof value.name !== 'string' ||
    Array.from(value.name.trim()).length < 2 ||
    Array.from(value.name.trim()).length > 120 ||
    typeof value.slug !== 'string' ||
    value.slug.length < 3 ||
    value.slug.length > 63 ||
    !EVENT_SLUG_PATTERN.test(value.slug) ||
    value.status !== 'DRAFT' ||
    !isDateString(value.createdAt) ||
    !isDateString(value.updatedAt)
  ) {
    throw new ApiError(
      'The API returned an unexpected event response',
      'response',
    );
  }

  return {
    id: value.id,
    organizationId,
    name: value.name,
    slug: value.slug,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
};

export const isEventCreationUncertain = (error: unknown): boolean =>
  !(error instanceof ApiError) ||
  error.kind === 'network' ||
  error.kind === 'timeout' ||
  error.kind === 'response' ||
  (error.status !== undefined && error.status >= 500);

export const getEventsError = (
  error: unknown,
  operation: 'list' | 'create' = 'list',
): string => {
  if (error instanceof ApiError) {
    if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Verify your email before creating an event.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'Your organization access may have changed. Refresh access before continuing.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment before trying again.';
    }

    if (error.status === 400) {
      return operation === 'create'
        ? 'Check the event name and slug, then try again.'
        : 'This page request is no longer valid. Refresh events to restart.';
    }
  }

  return operation === 'create'
    ? 'We could not confirm whether the event was created. Check the event list before creating it with a different slug.'
    : 'We could not load the events. Please try again.';
};
