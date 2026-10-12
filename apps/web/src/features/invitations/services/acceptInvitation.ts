import { User } from 'firebase/auth';

import { isOrganizationRole, isRecord } from '@/features/organizations';

import { AcceptanceProblem, AcceptedInvitation } from '../types';
import {
  ApiError,
  INVITATION_ID_PATTERN,
  authenticatedApiRequest,
} from '@/lib';

export const acceptInvitation = async (
  user: User,
  invitationId: string,
  token: string,
  signal: AbortSignal,
): Promise<AcceptedInvitation> => {
  const result = await authenticatedApiRequest(
    user,
    `/invitations/${encodeURIComponent(invitationId)}/accept`,
    {
      method: 'POST',
      json: {
        token,
      },
      signal,
    },
  );

  return parseAcceptedInvitation(result, user.uid);
};

export const parseAcceptedInvitation = (
  result: unknown,
  expectedUid: string,
): AcceptedInvitation => {
  if (
    !isRecord(result) ||
    typeof result.organizationId !== 'string' ||
    !INVITATION_ID_PATTERN.test(result.organizationId) ||
    !isRecord(result.membership) ||
    result.membership.uid !== expectedUid ||
    !isOrganizationRole(result.membership.role) ||
    typeof result.alreadyAccepted !== 'boolean'
  ) {
    throw new ApiError(
      'The API returned an unexpected acceptance response.',
      'response',
    );
  }

  return {
    organizationId: result.organizationId,
    membership: {
      uid: result.membership.uid,
      role: result.membership.role,
    },
    alreadyAccepted: result.alreadyAccepted,
  };
};

export const getAcceptanceProblem = (error: unknown): AcceptanceProblem => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'ORGANIZATION_INVITATION_RECIPIENT_MISMATCH':
        return {
          kind: 'wrong-account',
          message:
            'This invitation was sent to a different email address. ' +
            'Sign in with the account that received the invitation.',
        };

      case 'AUTH_EMAIL_NOT_VERIFIED':
        return {
          kind: 'verify-email',
          message:
            'Verify your email address before accepting this invitation.',
        };

      case 'ORGANIZATION_ALREADY_MEMBER':
        return {
          kind: 'already-member',
          message:
            'You already belong to this organization. ' +
            'Your existing membership has not been changed.',
        };

      case 'ORGANIZATION_INVITATION_ALREADY_USED':
        return {
          kind: 'unavailable',
          message: 'This invitation has already been used.',
        };

      case 'ORGANIZATION_INVITATION_INVALID':
        return {
          kind: 'unavailable',
          message:
            'This invitation is invalid, expired, or revoked. ' +
            'Ask an organization administrator for a new invitation.',
        };

      case 'ORGANIZATION_INVITATION_GRANT_UNAVAILABLE':
      case 'ORGANIZATION_INVITATION_ROLE_FORBIDDEN':
      case 'ORGANIZATION_PERMISSION_DENIED':
        return {
          kind: 'unavailable',
          message:
            'The sender can no longer grant this membership. ' +
            'Ask an organization administrator for a new invitation.',
        };
    }

    if (error.status === 401) {
      return {
        kind: 'sign-in',
        message:
          'Your session could not be verified. Sign in again to continue.',
      };
    }

    if (error.status === 400 || error.status === 404) {
      return {
        kind: 'unavailable',
        message:
          'This invitation is unavailable. Reopen the complete email link ' +
          'or ask for a new invitation.',
      };
    }

    if (error.status === 403) {
      return {
        kind: 'unavailable',
        message:
          'This account cannot accept the invitation. ' +
          'Contact the organization administrator.',
      };
    }

    if (error.status === 429) {
      return {
        kind: 'retry',
        message: 'Too many attempts. Wait a moment before trying again.',
      };
    }
  }

  return {
    kind: 'retry',
    message:
      'We could not confirm acceptance. Check your connection and try again. ' +
      'Retrying this invitation will not create a duplicate membership.',
  };
};
