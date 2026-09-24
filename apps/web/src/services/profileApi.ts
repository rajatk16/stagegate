import { User } from "firebase/auth";

import { ApiError, authenticatedApiRequest } from "@/lib";

export type Profile = {
  uid: string;
  displayName: string | null;
  biography: string | null;
  affiliation: string | null;
  timezone: string | null;
};

export type ProfileUpdate = {
  displayName: string;
  biography: string | null;
  affiliation: string | null;
  timezone: string;
};

const isRecord = (
  value: unknown
): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const parseProfile = (value: unknown, expectedUid: string): Profile => {
  if (
    !isRecord(value) ||
    value.uid !== expectedUid ||
    !isNullableString(value.displayName) ||
    !isNullableString(value.biography) ||
    !isNullableString(value.affiliation) ||
    !isNullableString(value.timezone)
  ) {
    throw new ApiError(
      "The API returned an unexpected profile. Check the profile response fields.",
      "response"
    );
  }

  return {
    uid: expectedUid,
    displayName: value.displayName,
    biography: value.displayName,
    affiliation: value.affiliation,
    timezone: value.timezone
  };
};

export const getProfile = async (
  user: User,
  signal: AbortSignal
): Promise<Profile> => {
  const result = await authenticatedApiRequest(user, "/users/me", {
    signal
  });

  return parseProfile(result, user.uid);
}

export const updateProfile = async (
  user: User,
  changes: ProfileUpdate,
  signal: AbortSignal
): Promise<Profile> => {
  const result = await authenticatedApiRequest(user, "/users/me", {
    method: 'PATCH',
    json: changes,
    signal
  });

  return parseProfile(result, user.uid);
};

export const getProfileErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session could not be verified. Sign out and sign in again."
    }

    if (error.status === 403) {
      return "You do not have permission to access this profile.";
    }

    if (error.status === 400) {
      return "The API rejected these values. Check the fields and profile validation rules."
    }

    if (error.status === 429) {
      return "Too many requests. Wait a moment and try again."
    }

    return error.message;
  }

  return "We could not complete the profule request. Please try again."
};
