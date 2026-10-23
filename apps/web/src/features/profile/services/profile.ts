import { User } from 'firebase/auth';

import { isNullableString, isRecord } from '@/app/utils';
import { ApiError, authenticatedApiRequest } from '@/lib';

import { ProfileDetails, ProfileUpdate } from '../types';

const parseProfile = (value: unknown, expectedUid: string): ProfileDetails => {
  if (
    !isRecord(value) ||
    value.uid !== expectedUid ||
    !isNullableString(value.displayName) ||
    !isNullableString(value.biography) ||
    !isNullableString(value.affiliation) ||
    !isNullableString(value.timezone)
  ) {
    throw new ApiError(
      'The API returned an unexpected profile. Check the profile response fields.',
      'response',
    );
  }

  return {
    uid: expectedUid,
    displayName: value.displayName,
    biography: value.biography,
    affiliation: value.affiliation,
    timezone: value.timezone,
  };
};

export const getProfileDetails = async (
  user: User,
  signal: AbortSignal,
): Promise<ProfileDetails> => {
  const result = await authenticatedApiRequest(user, '/users/me', {
    signal,
  });

  return parseProfile(result, user.uid);
};

export const updateProfile = async (
  user: User,
  changes: ProfileUpdate,
  signal: AbortSignal,
): Promise<ProfileDetails> => {
  const result = await authenticatedApiRequest(user, '/users/me', {
    method: 'PATCH',
    json: changes,
    signal,
  });

  return parseProfile(result, user.uid);
};

export const getProfileErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Your session could not be verified. Sign out and sign in again.';
    }

    if (error.status === 403) {
      return 'You do not have permission to access this profile.';
    }

    if (error.status === 400) {
      return 'The API rejected these values. Check the fields and profile validation rules.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment and try again.';
    }

    return error.message;
  }

  return 'We could not complete the profile request. Please try again.';
};
