import { Timestamp } from 'firebase-admin/firestore';

export const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};
