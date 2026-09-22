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
  createdAt: now,
  updatedAt: now,
});

export const toMeResponseDto = (profile: UserProfile): MeResponseDto => 
  Object.assign(new MeResponseDto(), {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  })
