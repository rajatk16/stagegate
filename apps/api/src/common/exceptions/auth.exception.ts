import { HttpStatus } from "@nestjs/common";

import { ApiException } from "./api.exception";

const authErrors = {
  AUTH_REQUIRED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Authentication is required.',
  },
  AUTH_INVALID_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'The authentication token is invalid.',
  },
  AUTH_TOKEN_EXPIRED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Your session token has expired.',
  },
  AUTH_TOKEN_REVOKED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Your session has been revoked. Sign in again.',
  },
  AUTH_USER_DISABLED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'This account is disabled.',
  },
  AUTH_UNAVAILABLE: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Authentication is temporarily unavailable.',
  },
}

export type AuthErrorCode = keyof typeof authErrors;

export class AuthException extends ApiException {
  constructor(
    code: AuthErrorCode
  ) {
    const error = authErrors[code];

    super(error.status, code, error.message);
  }
}
