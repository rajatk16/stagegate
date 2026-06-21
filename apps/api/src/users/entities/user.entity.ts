import { Timestamp } from 'firebase-admin/firestore';

import { UserStatus } from '../enums';

export class User {
  id: string;

  firebaseUid: string;

  email: string;

  displayName: string;

  photoUrl?: string | null;

  status: UserStatus;

  createdAt: Timestamp;

  updatedAt: Timestamp;
}
