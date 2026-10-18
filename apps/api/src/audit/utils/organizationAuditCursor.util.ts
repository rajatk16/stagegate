import z from 'zod';

import type { OrganizationScope } from '../../organizations/types';
import { RequestValidationException } from '../../common/exceptions';
import { organizationMembershipSchema } from '../../organizations/models';

type CursorScope = Pick<OrganizationScope, 'actorUid' | 'organizationId'>;

const cursorSchema = z
  .object({
    version: z.literal(1),
    kind: z.literal('organization-audit'),
    organizationId: z.string().uuid(),
    actorUid: organizationMembershipSchema.shape.uid,
    afterEventId: z.string().uuid(),
  })
  .strict();

export const invalidAuditCursor = (): RequestValidationException =>
  new RequestValidationException([{ field: 'cursor', code: 'INVALID_VALUE' }]);

export const encodeOrganizationAuditCursor = (
  scope: CursorScope,
  afterEventId: string,
): string =>
  Buffer.from(
    JSON.stringify({
      version: 1,
      kind: 'organization-audit',
      organizationId: scope.organizationId,
      actorUid: scope.actorUid,
      afterEventId,
    }),
    'utf8',
  ).toString('base64url');

export const decodeOrganizationAuditCursor = (
  cursor: string | undefined,
  scope: CursorScope,
): string | undefined => {
  if (cursor === undefined) {
    return undefined;
  }

  if (cursor.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(cursor)) {
    throw invalidAuditCursor();
  }

  const buffer = Buffer.from(cursor, 'base64url');

  if (buffer.toString('base64url') !== cursor) {
    throw invalidAuditCursor();
  }

  let payload: unknown;

  try {
    payload = JSON.parse(buffer.toString('utf8'));
  } catch {
    throw invalidAuditCursor();
  }

  const result = cursorSchema.safeParse(payload);

  if (
    !result.success ||
    result.data.organizationId !== scope.organizationId ||
    result.data.actorUid !== scope.actorUid
  ) {
    throw invalidAuditCursor();
  }

  return result.data.afterEventId;
};
