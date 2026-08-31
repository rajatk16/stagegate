import type { FieldError, IdentityErrorCode } from '../types';

export class IdentityError extends Error {
  constructor(
    readonly code: IdentityErrorCode,
    readonly fields: readonly FieldError[] = [],
  ) {
    super(code);
    this.name = 'IdentityError';
  }
}
