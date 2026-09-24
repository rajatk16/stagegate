export const PROFILE_FIELDS = [
  'displayName',
  'photoURL',
  'biography',
  'affiliation',
  'timezone',
] as const;

export type ProfileField = typeof PROFILE_FIELDS[number];
