import z from 'zod';

import { RequestValidationException } from '../../common';

export const normalizeOrganizationSlug = (value: string): string =>
  value.trim().toLowerCase();

const cursorSchema = z
  .object({
    version: z.literal(1),
    uid: z.string().min(1).max(128),
    organizationId: z.string().uuid(),
  })
  .strict();

const invalidCursor = (): RequestValidationException =>
  new RequestValidationException([
    {
      field: 'cursor',
      code: 'INVALID_VALUE',
    },
  ]);

export const encodeOrganizationCursor = (
  uid: string,
  organizationId: string,
): string =>
  Buffer.from(
    JSON.stringify({
      version: 1,
      uid,
      organizationId,
    }),
    'utf8',
  ).toString('base64url');

export const decodeOrganizationCursor = (
  cursor: string | undefined,
  expectedUid: string,
): string | undefined => {
  if (cursor === undefined) {
    return undefined;
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

  if (!result.success || result.data.uid !== expectedUid) {
    throw invalidCursor();
  }

  return result.data.organizationId;
};
