import { HttpException, HttpStatus } from '@nestjs/common';

export type AuthenticationErrorCode = 'AUTH_REQUIRED' | 'AUTH_INVALID_TOKEN' | 'AUTH_UNAVAILABLE';

export class AuthenticationError extends HttpException {
  constructor(readonly code: AuthenticationErrorCode) {
    const unavailable = code === 'AUTH_UNAVAILABLE';

    super(
      unavailable
        ? 'Authentication is temporarily unavailable'
        : 'A valid Firebase ID token is required',
      unavailable ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.UNAUTHORIZED,
    );
  }
}
