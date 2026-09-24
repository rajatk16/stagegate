import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { ConsoleLogger, Injectable, NestMiddleware } from "@nestjs/common";

import { RequestContext } from "../types";
import { RequestContextService } from "../services";

const METHODS = new Set([
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
]);

@Injectable()
export class RequestLogginMiddleware implements NestMiddleware {
  private readonly logger = new ConsoleLogger('HTTP', {
    json: true,
    colors: false
  });

  constructor(private readonly contexts: RequestContextService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const context: RequestContext = {
      requestId: randomUUID()
    };

    const startedAt = performance.now();

    response.setHeader('X-Request-ID', context.requestId);

    this.contexts.run(context, () => {
      let recorded = false;

      const record = (outcome: 'completed' | 'aborted'): void => {
        if (recorded) return;

        recorded = true;

        const route: unknown = (
          request.route as { path?: unknown } | undefined
        )?.path;

        const statusCode = response.headersSent ? response.statusCode : null;

        const entry = {
          event: `http.${outcome}`,
          requestId: context.requestId,
          method: METHODS.has(request.method) ? request.method : 'OTHER',
          route: typeof route === 'string' ? route : '<unmatched>',
          statusCode,
          durationMs: Math.round(
            (performance.now() - startedAt) * 100
          ) / 100,
          errorCode: context.errorCode,
          errorKind: context.errorKind
        };

        if ((statusCode !== null && statusCode >= 500) || context.errorKind === 'unexpected') {
          this.logger.error(entry);
        } else if (outcome !== null || (statusCode !== null && statusCode >= 400)) {
          this.logger.warn(entry);
        } else {
          this.logger.log(entry);
        }
      };

      response.once('finish', () => record('completed'));

      response.once('close', () => {
        record(response.writableFinished ? 'completed' : 'aborted');
      });

      next();
    });
  }
}
