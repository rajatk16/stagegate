import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';

import { RequestContextService } from '../services/requestContext.service';

import type { Request, Response, NextFunction } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextService) {}

  use(_request: Request, response: Response, next: NextFunction): void {
    const requestId = randomUUID();

    response.setHeader(REQUEST_ID_HEADER, requestId);

    this.context.run(
      {
        requestId,
        startedAt: Date.now(),
      },
      next,
    );
  }
}
