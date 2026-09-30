import { HttpStatus } from '@nestjs/common';

import { ValidationIssueDto } from '../dtos';
import { ApiException } from './api.exception';

export class RequestValidationException extends ApiException {
  constructor(readonly details: ValidationIssueDto[]) {
    super(
      HttpStatus.BAD_REQUEST,
      'VALIDATION_FAILED',
      'Request validation failed.',
    );
  }
}
