import z from 'zod';

import { OrganizationScope } from '../types';
import { organizationMembershipSchema } from '../models';
import { RequestValidationException } from '../../common';

const cursorSchema = z
  .object({
    version: z.literal(1),
    kind: z.literal('organization-members'),
    organizationId: organizationMembershipSchema.shape.organizationId,
    actorUid: organizationMembershipSchema.shape.uid,
    afterUid: organizationMembershipSchema.shape.uid,
  })
  .strict();

const invalidCursor = (): RequestValidationException =>
  new RequestValidationException([
    {
      field: 'cursor',
      code: 'INVALID_VALUE',
    },
  ]);

export const encodeOrganizationMembersCursor = (
  scope: OrganizationScope,
  afterUid: string,
): string =>
  Buffer.from(
    JSON.stringify({
      version: 1,
      kind: 'organization-members',
      organizationId: scope.organizationId,
      actorUid: scope.actorUid,
      afterUid,
    }),
    'utf8',
  ).toString('base64url');

export const decodeOrganizationMembersCursor = (
  cursor: string | undefined,
  scope: OrganizationScope,
): string | undefined => {
  if (cursor === undefined) return undefined;

  if (cursor.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(cursor)) {
    throw invalidCursor();
  }

  const buffer = Buffer.from(cursor, 'base64url');

  if (buffer.toString('base64url') !== cursor) {
    throw invalidCursor();
  }

  let payload: unknown;

  try {
    payload = JSON.parse(buffer.toString('utf8'));
  } catch {
    throw invalidCursor();
  }

  const result = cursorSchema.safeParse(payload);

  if (
    !result.success ||
    result.data.organizationId !== scope.organizationId ||
    result.data.actorUid !== scope.actorUid
  ) {
    throw invalidCursor();
  }

  return result.data.afterUid;
};
