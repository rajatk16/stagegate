import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    statusCode: number,
    readonly code: string,
    readonly publicMessage: string,
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        code,
        message: [publicMessage],
      },
      statusCode,
      options,
    );
  }
}
