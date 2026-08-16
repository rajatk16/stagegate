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

export const toNullableDate = (value: unknown): Timestamp | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return toDate(value);
};

export const toIso = (
  value: FirebaseFirestore.Timestamp | null | undefined,
): string | null => (value ? value.toDate().toISOString() : null);
