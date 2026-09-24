import { Timestamp } from "firebase-admin/firestore";

import { UpdateProfileDto } from "../dtos";
import { UserProfileChanges, UserProfileUpdateDocument } from "../types";

export const toUserProfileChanges = (dto: UpdateProfileDto): UserProfileChanges => {
  const changes: UserProfileChanges = {};

  if (dto.displayName !== undefined) {
    changes.displayName = dto.displayName;
  }

  if (dto.photoURL !== undefined) {
    changes.photoURL = dto.photoURL;
  }

  if (dto.biography !== undefined) {
    changes.biography = dto.biography;
  }

  if (dto.affiliation !== undefined) {
    changes.affiliation = dto.affiliation;
  }

  if (dto.timezone !== undefined) {
    changes.timezone = dto.timezone;
  }

  return changes;
}

export const toUserProfileUpdateDocument = (
  changes: UserProfileChanges,
  updatedAt: Date
): UserProfileUpdateDocument => {
  const document: UserProfileUpdateDocument = {
    updatedAt: Timestamp.fromDate(updatedAt)
  }

  if (changes.displayName !== undefined) {
    document.displayName = changes.displayName;
  }

  if (changes.photoURL !== undefined) {
    document.photoURL = changes.photoURL;
  }

  if (changes.biography !== undefined) {
    document.biography = changes.biography;
  }

  if (changes.affiliation !== undefined) {
    document.affiliation = changes.affiliation;
  }

  if (changes.timezone !== undefined) {
    document.timezone = changes.timezone;
  }

  return document;
}
