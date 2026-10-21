import z from 'zod';

import { OrganizationScope } from '../../organizations/types';
import { RequestValidationException } from '../../common/exceptions';

const cursorSchema = z
  .object({
    version: z.literal(1),
    kind: z.literal('organization-events'),
    organizationId: z.string().uuid(),
    actorUid: z.string().min(1).max(128),
    eventId: z.string().uuid(),
  })
  .strict();

export const invalidEventCursor = (): RequestValidationException =>
  new RequestValidationException([
    {
      field: 'cursor',
      code: 'INVALID_VALUE',
    },
  ]);

export const encodeEventCursor = (
  scope: OrganizationScope,
  eventId: string,
): string =>
  Buffer.from(
    JSON.stringify({
      version: 1,
      kind: 'organization-events',
      organizationId: scope.organizationId,
      actorUid: scope.actorUid,
      eventId,
    }),
    'utf8',
  ).toString('base64url');

export const decodeEventCursor = (
  cursor: string | undefined,
  scope: OrganizationScope,
): string | undefined => {
  if (cursor === undefined) return undefined;

  if (cursor.length > 2_048 || !/^[A-Za-z0-9_-]+$/.test(cursor)) {
    throw invalidEventCursor();
  }

  const buffer = Buffer.from(cursor, 'base64url');

  if (buffer.toString('base64url') !== cursor) {
    throw invalidEventCursor();
  }

  let payload: unknown;

  try {
    payload = JSON.parse(buffer.toString('utf8'));
  } catch {
    throw invalidEventCursor();
  }

  const result = cursorSchema.safeParse(payload);

  if (
    !result.success ||
    result.data.organizationId !== scope.organizationId ||
    result.data.actorUid !== scope.actorUid
  ) {
    throw invalidEventCursor();
  }

  return result.data.eventId;
};
