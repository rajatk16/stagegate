import { HttpStatus } from '@nestjs/common';

import { IDENTITY_ERROR_CODES } from '@stagegate/contracts';

import { IdentityError } from '../errors/identity.error';

const rejectedCredentials = new Set([
  'auth/argument-error',
  'auth/invalid-argument',
  'auth/invalid-id-token',
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/user-disabled',
  'auth/user-not-found',
]);

export const authOperation = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string' &&
      rejectedCredentials.has(error.code)
    ) {
      throw new IdentityError(
        HttpStatus.UNAUTHORIZED,
        IDENTITY_ERROR_CODES.INVALID_ID_TOKEN,
        'Sign in again to continue.',
      );
    }

    throw new IdentityError(
      HttpStatus.SERVICE_UNAVAILABLE,
      IDENTITY_ERROR_CODES.AUTH_UNAVAILABLE,
      'Sign-in is temporarily unavailable.',
    );
  }
};

export const identityConflict = () =>
  new IdentityError(
    HttpStatus.CONFLICT,
    IDENTITY_ERROR_CODES.IDENTITY_CONFLICT,
    'Contact support to resolve this account.',
  );
