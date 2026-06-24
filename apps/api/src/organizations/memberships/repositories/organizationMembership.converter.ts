import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembership } from '../entities';

const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};

export const organizationMembershipConverter: FirestoreDataConverter<OrganizationMembership> =
  {
    toFirestore: (membership: OrganizationMembership) => ({
      ...membership,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        organizationId: data.organizationId as string,
        userId: data.userId as string,
        roles: (data.roles as OrganizationRole[]) ?? [],
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
