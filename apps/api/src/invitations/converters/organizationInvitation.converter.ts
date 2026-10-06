import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { DiagnosticError } from '../../observalibility';
import {
  OrganizationInvitation,
  organizationInvitationSchema,
} from '../models';

const invitationDocumentSchema = organizationInvitationSchema.extend({
  createdAt: z.instanceof(Timestamp),
  expiresAt: z.instanceof(Timestamp),
  acceptedAt: z.instanceof(Timestamp).nullable(),
  revokedAt: z.instanceof(Timestamp).nullable(),
});

type invitationDocument = z.infer<typeof invitationDocumentSchema>;

export const organizationInvitationConverter: FirestoreDataConverter<
  OrganizationInvitation,
  invitationDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): invitationDocument {
    if (options !== undefined) {
      throw new DiagnosticError('INVITATION_PARTIAL_WRITE_UNSUPPORTED');
    }

    const invitation = organizationInvitationSchema.parse(value);

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

  fromFirestore(snapshot): OrganizationInvitation {
    const document = invitationDocumentSchema.parse(snapshot.data());

    if (snapshot.ref.path !== `organizationInvitations/${document.id}`) {
      throw new DiagnosticError('INVITATION_STORAGE_INVARIANT_FAILED');
    }

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
      expiresAt: document.expiresAt.toDate(),
      acceptedAt: document.acceptedAt ? document.acceptedAt.toDate() : null,
      revokedAt: document.revokedAt ? document.revokedAt.toDate() : null,
    };
  },
};
