import { Profile } from '../services';

export const isProfileComplete = (
  profile: Profile | null | undefined,
): boolean => Boolean(profile?.displayName?.trim() && profile.timezone?.trim());
