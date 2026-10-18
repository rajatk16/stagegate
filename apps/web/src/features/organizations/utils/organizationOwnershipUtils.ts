import { ApiError, firebaseAuth } from '@/lib';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import { ORGANIZATION_MEMBERSHIP_STATUSES, ORGANIZATION_ROLES } from '../types';
import { isDateString, isRecord } from '@/app/utils';

const assertSession = (user: User, signal: AbortSignal) => {
  signal.throwIfAborted();

  if (firebaseAuth.currentUser !== user) {
    throw new ApiError('Your session changed. Sign in again.', 'http', 401);
  }
};

export const reauthenticateOwner = async (
  user: User,
  password: string,
  signal: AbortSignal,
): Promise<void> => {
  assertSession(user, signal);

  if (!user.email) {
    throw new Error('The account has no email address.');
  }

  const credential = EmailAuthProvider.credential(user.email, password);

  await reauthenticateWithCredential(user, credential);
  assertSession(user, signal);
};

export const matchesMembership = (
  value: unknown,
  uid: string,
  role: ORGANIZATION_ROLES.ADMIN | ORGANIZATION_ROLES.OWNER,
): boolean =>
  isRecord(value) &&
  value.uid === uid &&
  value.role === role &&
  value.status === ORGANIZATION_MEMBERSHIP_STATUSES.ACTIVE &&
  isDateString(value.createdAt) &&
  isDateString(value.updatedAt);
