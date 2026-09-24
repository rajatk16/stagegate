import { DecodedIdToken } from "firebase-admin/auth"

import { UserProfile } from "../models"
import { MeResponseDto } from "../dtos";

export const toNewUserProfile = (
  user: DecodedIdToken,
  now: Date
): UserProfile => ({
  uid: user.uid,
  email: typeof user.email === 'string' ? user.email : null,
  displayName: typeof user.name === 'string' ? user.name : null,
  photoURL: typeof user.picture === 'string' ? user.picture : null,
  biography: null,
  affiliation: null,
  timezone: null,
  createdAt: now,
  updatedAt: now,
});

export const toMeResponseDto = (profile: UserProfile, user: DecodedIdToken): MeResponseDto => {
  if (profile.uid !== user.uid) {
    throw new Error('Profile identity mismatch');
  }

  return Object.assign(new MeResponseDto(), {
    uid: user.uid,
    email: typeof user.email === 'string' ? user.email : null,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    biography: profile.biography,
    affiliation: profile.affiliation,
    timezone: profile.timezone,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  });
};
  
