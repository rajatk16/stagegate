import { ProfileDetails } from '../types';

export const isProfileComplete = (
  profile: ProfileDetails | null | undefined,
): boolean => Boolean(profile?.displayName?.trim() && profile.timezone?.trim());
