import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembershipInvitation } from '../entities';
import { OrganizationMembershipInvitationStatus } from '../enums';

const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};

export const organizationMembershipInvitationConverter: FirestoreDataConverter<OrganizationMembershipInvitation> =
  {
    toFirestore: (invitation: OrganizationMembershipInvitation) => ({
      ...invitation,
    }),
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<
        DocumentData,
        OrganizationMembershipInvitation
      >,
    ): OrganizationMembershipInvitation => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        organizationId: data.organizationId as string,
        email: data.email as string,
        userId: (data.userId as string | null) ?? null,
        roles: (data.roles as OrganizationRole[]) ?? [],
        invitedBy: data.invitedBy as string,
        status: data.status as OrganizationMembershipInvitationStatus,
        expiresAt: toDate(data.expiresAt),
        acceptedAt: data.acceptedAt ? toDate(data.acceptedAt) : null,
        acceptedBy: (data.acceptedBy as string | null) ?? null,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
