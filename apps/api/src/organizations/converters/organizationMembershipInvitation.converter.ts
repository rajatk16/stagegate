import {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { OrganizationRole } from '@/auth';
import { toDate, toNullableDate } from '@/common';

import { OrganizationMembershipInvitation } from '../entities';
import { OrganizationMembershipInvitationStatus } from '../enums';

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
        acceptedAt: toNullableDate(data.acceptedAt),
        acceptedBy: (data.acceptedBy as string | null) ?? null,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
