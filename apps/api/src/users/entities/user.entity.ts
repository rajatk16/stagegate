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

  lastAuthenticatedAt: Timestamp;

  suspendedAt?: Timestamp | null;
  suspendedReason?: string | null;

  deactivatedAt?: Timestamp | null;

  deletionRequestedAt?: Timestamp | null;
  deletionScheduledFor?: Timestamp | null;

  anonymizedAt?: Timestamp | null;
}
