import { Timestamp } from 'firebase-admin/firestore';

export class User {
  id: string;

  firebaseUid: string;

  email: string;

  displayName: string;

  photoUrl?: string | null;

  isActive: boolean;

  createdAt: Timestamp;

  updatedAt: Timestamp;
}
