import { HttpStatus, ValidationPipe } from '@nestjs/common';

import { ERROR_CODES } from '../constants/errorCodes';
import { ApiException } from '../exceptions/api.exception';

import type { ValidationErrorDetail } from '../interfaces/apiResponse.interface';
import type { ValidationError } from '@nestjs/common';

export const flattenValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorDetail[] => {
  const details: ValidationErrorDetail[] = [];

  for (const error of errors) {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      details.push({
        field,
        messages: Object.values(error.constraints),
      });
    }

    if (error.children && error.children.length > 0) {
      details.push(...flattenValidationErrors(error.children, field));
    }
  }

  return details;
};

export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    stopAtFirstError: false,
    transformOptions: {
      enableImplicitConversion: false,
    },
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors: ValidationError[]) =>
      new ApiException({
        status: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Request validation failed.',
        details: flattenValidationErrors(errors),
      }),
  });
