import { Logger } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';

import { StructuredAuthenticationAuditWriter } from './authenticationAudit.writer';

describe('StructuredAuthenticationAuditWriter', () => {
  it('writes a structured authentication denial audit event', () => {
    const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const writer = new StructuredAuthenticationAuditWriter();

    writer.recordDenied({
      requestId: 'request-123',
      target: 'UsersController.updateProfile',
      actorId: 'user-123',
      reason: 'email_unverified',
    });

    expect(loggerWarn).toHaveBeenCalledWith({
      severity: 'WARNING',
      eventKind: 'security_audit',
      schemaVersion: 1,
      eventId: expect.any(String),
      occurredAt: expect.any(String),
      actorId: 'user-123',
      organizationId: null,
      action: 'authentication.denied',
      resourceType: 'http_handler',
      resourceId: 'UsersController.updateProfile',
      outcome: 'denied',
      summary: {
        reason: 'email_unverified',
      },
    });
  });

  it('does not throw if audit logging fails', () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {
      throw new Error('logger unavailable');
    });
    const writer = new StructuredAuthenticationAuditWriter();

    expect(() =>
      writer.recordDenied({
        requestId: 'request-123',
        target: 'FirebaseTokenGuard.canActivate',
        actorId: null,
        reason: 'token_invalid',
      }),
    ).not.toThrow();
  });
});
