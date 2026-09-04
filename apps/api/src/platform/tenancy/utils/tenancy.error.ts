export type TenancyErrorCode =
  | 'VALIDATION_ERROR'
  | 'ACTOR_NOT_BOOTSTRAPPED'
  | 'ORGANIZATION_NOT_FOUND'
  | 'TENANCY_DATA_INVALID'
  | 'TENANCY_UNAVAILABLE';

export interface TenancyFieldError {
  readonly path: string;
  readonly code: 'INVALID_FIELD';
  readonly message: string;
}

export class TenancyError extends Error {
  constructor(
    readonly code: TenancyErrorCode,
    readonly fields: readonly TenancyFieldError[] = [],
  ) {
    super(code);
    this.name = 'TenancyError';
  }
}
