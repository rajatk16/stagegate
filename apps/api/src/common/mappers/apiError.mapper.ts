import { STATUS_CODES } from 'http';
import createHttpError from 'http-errors';
import { HttpException } from '@nestjs/common';

import { ApiErrorResponseDto } from '../dtos';
import { ApiException, RequestValidationException } from '../exceptions';

type PublicError = Pick<
  ApiErrorResponseDto,
  'statusCode' | 'error' | 'code' | 'message' | 'details'
>;

export const toPublicApiError = (exception: unknown): PublicError => {
  let proposedStatus = 500;

  if (exception instanceof HttpException) {
    proposedStatus = exception.getStatus();
  } else if (createHttpError.isHttpError(exception)) {
    proposedStatus = exception.statusCode;
  }

  const statusCode =
    Number.isInteger(proposedStatus) &&
    proposedStatus >= 400 &&
    proposedStatus <= 599
      ? proposedStatus
      : 500;

  const error = STATUS_CODES[statusCode] ?? 'Error';

  if (exception instanceof ApiException) {
    return {
      statusCode,
      error,
      code: exception.code,
      message: [exception.publicMessage],
      ...(exception instanceof RequestValidationException
        ? { details: exception.details }
        : {}),
    };
  }

  return {
    statusCode,
    error,
    code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${statusCode}`,
    message: [
      statusCode >= 500
        ? 'Internal server error'
        : (STATUS_CODES[statusCode] ?? 'Request failed'),
    ],
  };
};
