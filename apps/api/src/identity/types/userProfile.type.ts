import { Timestamp } from 'firebase-admin/firestore';

export type UserProfile = {
  email: string;
  createdAt?: Timestamp;
  activatedAt?: Timestamp;
} & (
  | { status: 'placeholder'; firebaseUid?: never }
  | { status: 'active'; firebaseUid: string }
);
