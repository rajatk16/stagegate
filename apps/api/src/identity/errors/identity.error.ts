import { HttpStatus } from '@nestjs/common';
import { IDENTITY_ERROR_CODES } from '@stagegate/contracts';

import { ApiError } from '../../common/errors/api.error';

export class IdentityError extends ApiError {
  constructor(
    status: HttpStatus,
    readonly code: IDENTITY_ERROR_CODES,
    message: string,
  ) {
    super(status, code, message);
  }
}
