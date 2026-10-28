import z from 'zod';
import {
  Timestamp,
  type SetOptions,
  type FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { assertInvitationState } from '../utils';
import { DiagnosticError } from '../../observalibility/errors';
import { ORGANIZATION_INVITATIONS_COLLECTION } from '../constants';
import { eventInvitationSchema, Invitation, invitationSchema } from '../models';
import { organizationInvitationSchema } from '../models/organizationInvitation.model';

const timestampFields = {
  createdAt: z.instanceof(Timestamp),
  expiresAt: z.instanceof(Timestamp),
  acceptedAt: z.instanceof(Timestamp).nullable(),
  revokedAt: z.instanceof(Timestamp).nullable(),
};

const invitationDocumentSchema = z.union([
  organizationInvitationSchema.extend(timestampFields),
  eventInvitationSchema.extend(timestampFields),
]);

type InvitationDocument = z.infer<typeof invitationDocumentSchema>;

export const organizationInvitationConverter: FirestoreDataConverter<
  Invitation,
  InvitationDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): InvitationDocument {
    if (options !== undefined) {
      throw new DiagnosticError('INVITATION_PARTIAL_WRITE_UNSUPPORTED');
    }

    const invitation = invitationSchema.parse(value);

    assertInvitationState(invitation);

    return {
      ...invitation,
      createdAt: Timestamp.fromDate(invitation.createdAt),
      expiresAt: Timestamp.fromDate(invitation.expiresAt),
      acceptedAt: invitation.acceptedAt
        ? Timestamp.fromDate(invitation.acceptedAt)
        : null,
      revokedAt: invitation.revokedAt
        ? Timestamp.fromDate(invitation.revokedAt)
        : null,
    };
  },

  fromFirestore(snapshot): Invitation {
    const document = invitationDocumentSchema.parse(snapshot.data());

    if (
      snapshot.ref.path !==
      `${ORGANIZATION_INVITATIONS_COLLECTION}/${document.id}`
    ) {
      throw new DiagnosticError('INVITATION_STORAGE_INVARIANT_FAILED');
    }

    const invitation = invitationSchema.parse({
      ...document,
      createdAt: document.createdAt.toDate(),
      expiresAt: document.expiresAt.toDate(),
      acceptedAt: document.acceptedAt ? document.acceptedAt.toDate() : null,
      revokedAt: document.revokedAt ? document.revokedAt.toDate() : null,
    });

    assertInvitationState(invitation);

    return invitation;
  },
};
