import { HttpException, HttpStatus } from '@nestjs/common';

import { type AuthenticationErrorCode } from '../types';

const authenticationProblems = {
  AUTH_REQUIRED: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'A valid Firebase ID token is required.',
  },
  AUTH_INVALID_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'The authentication token is invalid.',
  },
  AUTH_TOKEN_EXPIRED: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'The authentication token has expired.',
  },
  AUTH_TOKEN_REVOKED: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'The authentication session is no longer valid.',
  },
  AUTH_USER_DISABLED: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'The authenticated account is disabled.',
  },
  EMAIL_VERIFICATION_REQUIRED: {
    status: HttpStatus.FORBIDDEN,
    detail: 'Verify your email address before performing this action.',
  },
  AUTH_UNAVAILABLE: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    detail: 'Authentication is temporarily unavailable.',
  },
} as const satisfies Record<
  AuthenticationErrorCode,
  { status: number; detail: string }
>;

export class AuthenticationError extends HttpException {
  constructor(readonly code: AuthenticationErrorCode) {
    const problem = authenticationProblems[code];

    super(problem.detail, problem.status);
  }
}
