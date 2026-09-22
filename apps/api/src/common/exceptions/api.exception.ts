import { HttpException } from "@nestjs/common";

export class ApiException extends HttpException {
  constructor(
    statusCode: number,
    readonly code: string,
    readonly publicMessage: string
  ) {
    super(
      {
        code,
        message: [publicMessage]
      },
      statusCode
    );
  }
}
