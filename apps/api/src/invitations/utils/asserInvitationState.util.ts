import { DiagnosticError } from '../../observalibility/errors';
import { OrganizationInvitation } from '../models';

const invalidState = (): never => {
  throw new DiagnosticError('INVITATION_STORAGE_INVARIANT_FAILED');
};

export const assertInvitationState = (
  invitation: OrganizationInvitation,
): void => {
  const createdAt = invitation.createdAt.getTime();
  const expiresAt = invitation.expiresAt.getTime();

  if (expiresAt <= createdAt) {
    invalidState();
  }

  switch (invitation.status) {
    case 'PENDING': {
      if (
        invitation.acceptedByUid !== null ||
        invitation.acceptedAt !== null ||
        invitation.revokedAt !== null
      ) {
        invalidState();
      }

      break;
    }

    case 'ACCEPTED': {
      if (
        invitation.acceptedByUid === null ||
        invitation.acceptedAt === null ||
        invitation.revokedAt !== null
      ) {
        invalidState();
      }

      const acceptedAt = invitation.acceptedAt?.getTime();

      if (acceptedAt && (acceptedAt < createdAt || acceptedAt >= expiresAt)) {
        invalidState();
      }

      break;
    }

    case 'REVOKED': {
      if (
        invitation.acceptedByUid !== null ||
        invitation.acceptedAt !== null ||
        invitation.revokedAt === null
      ) {
        invalidState();
      }

      if (invitation.revokedAt && invitation.revokedAt.getTime() < createdAt) {
        invalidState();
      }

      break;
    }
  }
};
