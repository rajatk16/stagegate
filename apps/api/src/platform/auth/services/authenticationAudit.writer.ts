import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';

import { type AuthenticationDenial } from '../types';

export abstract class AuthenticationAuditWriter {
  abstract recordDenied(event: AuthenticationDenial): void;
}

@Injectable()
export class StructuredAuthenticationAuditWriter extends AuthenticationAuditWriter {
  private readonly logger = new Logger(
    StructuredAuthenticationAuditWriter.name,
  );

  override recordDenied(event: AuthenticationDenial): void {
    try {
      this.logger.warn({
        severity: 'WARNING',
        eventKind: 'security_audit',
        schemaVersion: 1,
        eventId: randomUUID(),
        occurredAt: new Date().toISOString(),
        actorId: event.actorId,
        organizationId: null,
        action: 'authentication.denied',
        resourceType: 'http_handler',
        resourceId: event.target,
        outcome: 'denied',
        summary: {
          reason: event.reason,
        },
      });
    } catch {
      return;
    }
  }
}
