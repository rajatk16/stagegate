import { HttpException, HttpStatus } from '@nestjs/common';

import { type AuthenticationErrorCode } from '../types';

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
