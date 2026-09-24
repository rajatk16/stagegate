import { Timestamp } from "firebase-admin/firestore";

export interface UserProfileDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  biography: string | null;
  affiliation: string | null;
  timezone: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}