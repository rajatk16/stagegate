import { STATUS_CODES } from "http";
import { HttpException } from "@nestjs/common";

import { ApiException } from "../exceptions";
import { ApiErrorResponseDto } from "../dtos";

type PublicError = Pick<ApiErrorResponseDto, 'statusCode' | 'error' | 'code' | 'message'>;

export const toPublicApiError = (exception: unknown): PublicError => {
  const proposedStatus = exception instanceof HttpException
    ? exception.getStatus()
    : 500;

  const statusCode = Number.isInteger(proposedStatus) &&
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
      message: [exception.publicMessage]
    };
  }

  return {
    statusCode,
    error,
    code: statusCode >= 500
      ? 'INTERNAL_SERVER_ERROR'
      : `HTTP_${statusCode}`,
    message: [
      statusCode >= 500
        ? 'Internal server error'
        : STATUS_CODES[statusCode] ?? 'Request failed'
    ],
  };
}
