import type { Location } from 'react-router';
import { routes } from '../../../app/routes';
import type { SessionEndReason } from '../../../lib';

export interface AuthNavigationState {
  readonly returnTo: string;
  readonly reason: SessionEndReason | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getSafeInternalPath = (value: unknown): string => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return routes.dashboard;
  }

  const parsedUrl = new URL(value, window.location.origin);

  if (parsedUrl.origin !== window.location.origin) {
    return routes.dashboard;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
};

const getSessionEndReason = (value: unknown): SessionEndReason | null => {
  if (value === 'initial' || value === 'signed-out' || value === 'expired') {
    return value;
  }

  return null;
};

export const readAuthNavigationState = (value: unknown): AuthNavigationState => {
  if (!isRecord(value)) {
    return {
      returnTo: routes.dashboard,
      reason: null,
    };
  }

  return {
    returnTo: getSafeInternalPath(value['returnTo']),
    reason: getSessionEndReason(value['reason']),
  };
};

export const getCurrentPath = (location: Location) =>
  `${location.pathname}${location.search}${location.hash}`;
