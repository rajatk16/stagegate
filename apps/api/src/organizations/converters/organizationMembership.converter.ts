import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/auth';
import { toDate, toNullableDate } from '@/common';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';

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
        status: (data.status as MembershipStatus) ?? MembershipStatus.ACTIVE,
        joinedAt: toDate(data.joinedAt),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        removedAt: toNullableDate(data.removedAt),
        removedBy: data.removedBy as string | null,
      };
    },
  };
