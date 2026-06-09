import { Timestamp } from 'firebase-admin/firestore';

import { UserStatus } from './user-status.enum';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
