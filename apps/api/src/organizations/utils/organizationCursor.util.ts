import { HttpStatus } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { organizationIdSchema } from '@stagegate/contracts';

import { ApiError } from '../../common/errors/api.error';
import { stagegateHmac } from '../../common/crypto/stagegateHmac.crypto';

export type OrganizationCursor = {
  orgId: string;
  createdAt: Timestamp;
};

const signature = (userId: string, payload: string): string =>
  stagegateHmac(
    'stagegate.organizations.list.v1',
    JSON.stringify([userId, payload]),
  );

export const encodeOrganizationCursor = (
  userId: string,
  { orgId, createdAt }: OrganizationCursor,
): string => {
  const payload = `${createdAt.seconds}.${createdAt.nanoseconds}.${orgId}`;
  return `${payload}.${signature(userId, payload)}`;
};

const invalidCursor = (): ApiError =>
  new ApiError(
    HttpStatus.BAD_REQUEST,
    'INVALID_REQUEST',
    'Use a valid organization list cursor.',
  );

export const decodeOrganizationCursor = (
  userId: string,
  cursor: string,
): OrganizationCursor => {
  const match =
    /^([0-9]{1,12})\.([0-9]{1,9})\.([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(
      cursor,
    );
  if (!match) throw invalidCursor();

  const [, seconds, nanoseconds, orgId, supplied] = match;
  const expected = signature(userId, `${seconds}.${nanoseconds}.${orgId}`);

  if (
    !timingSafeEqual(
      Buffer.from(supplied, 'hex'),
      Buffer.from(expected, 'hex'),
    ) ||
    !organizationIdSchema.safeParse(orgId).success ||
    Number(seconds) > 253_402_300_799
  ) {
    throw invalidCursor();
  }
  return {
    orgId,
    createdAt: new Timestamp(Number(seconds), Number(nanoseconds)),
  };
};
