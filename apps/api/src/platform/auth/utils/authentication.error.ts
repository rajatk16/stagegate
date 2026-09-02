import { HttpException, HttpStatus } from '@nestjs/common';

import { type AuthenticationErrorCode } from '../types';

const authenticationProblems = {
  AUTH_REQUIRED: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'A valid Firebase ID token is required.',
  },
  AUTH_INVALID_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    detail: 'A valid Firebase ID token is required.',
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
