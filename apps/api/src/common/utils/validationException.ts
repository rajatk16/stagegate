import { HttpStatus, ValidationError } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { ApplicationException } from './applicationException';

const collectFieldErrors = (
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> =>
  errors.reduce<Record<string, string[]>>((fields, error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      fields[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(fields, collectFieldErrors(error.children, path));
    }

    return fields;
  }, {});

export class ValidationException extends ApplicationException {
  constructor(errors: ValidationError[]) {
    super(
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      'One or more fields are invalid',
      {
        fields: collectFieldErrors(errors),
      },
    );
  }
}
