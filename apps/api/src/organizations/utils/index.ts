import z from 'zod';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';

import { OrganizationPermission } from '../types';
import { OrganizationMembership } from '../models';
import { ApiException } from '../../common/exceptions';
import { DiagnosticError } from '../../observalibility/errors';
import { RequestValidationException } from '../../common/exceptions';
import { ORGANIZATION_MEMBERSHIP_STATUS, ORGANIZATION_ROLES } from '../enums';
import {
  ORGANIZATION_ROLE_PERMISSIONS,
  ORGANIZATION_ROLE_CHANGE_TARGETS,
} from '../constants';

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

export const assertOrganizationPermissions = (
  membership: OrganizationMembership,
  required: readonly OrganizationPermission[],
): void => {
  assertActiveOrganizationMembership(membership);
  if (required.length === 0) {
    throw new InternalServerErrorException(
      'An organization operation must declare a permission.',
    );
  }

  const allowed = ORGANIZATION_ROLE_PERMISSIONS[membership.role] ?? [];

  if (!required.every((permission) => allowed.includes(permission))) {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_PERMISSION_DENIED',
      'You do not have permission to perform this operation.',
    );
  }
};

export const getOrganizationLogoPath = (
  organizationId: string,
  version: string,
): string => `organizations/${organizationId}/logos/${version}.webp`;

export const assertOrganizationRoleChange = (
  actor: OrganizationMembership,
  target: OrganizationMembership,
  nextRole: ORGANIZATION_ROLES,
): void => {
  if (actor.organizationId !== target.organizationId) {
    throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
  }

  assertOrganizationPermissions(actor, ['organization:members:manage']);
  assertActiveOrganizationMembership(target);

  if (actor.uid === target.uid) {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_SELF_ROLE_CHANGE_FORBIDDEN',
      'You cannot change your own organization role.',
    );
  }

  if (target.role === 'OWNER' || nextRole === 'OWNER') {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_OWNERSHIP_CHANGE_FORBIDDEN',
      'Ownership changes require a separate operation.',
    );
  }

  const manageableRoles = ORGANIZATION_ROLE_CHANGE_TARGETS[actor.role] ?? [];

  if (
    !manageableRoles.includes(target.role) ||
    !manageableRoles.includes(nextRole)
  ) {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_ROLE_CHANGE_FORBIDDEN',
      'You cannot perform this role change.',
    );
  }
};

export const assertActiveOrganizationMembership = (
  membership: OrganizationMembership,
): void => {
  if (membership.status !== ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE) {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_MEMBERSHIP_INACTIVE',
      'An active organization membership is required.',
    );
  }
};

export const canManageOrganizationMemberStatus = (
  actor: OrganizationMembership,
  target: OrganizationMembership,
): boolean => {
  if (
    actor.organizationId !== target.organizationId ||
    actor.uid === target.uid ||
    actor.status !== ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE
  ) {
    return false;
  }

  const permissions = ORGANIZATION_ROLE_PERMISSIONS[actor.role] ?? [];

  if (!permissions.includes('organization:members:manage')) {
    return false;
  }

  return (
    actor.role === ORGANIZATION_ROLES.OWNER ||
    (actor.role === ORGANIZATION_ROLES.ADMIN &&
      (target.role === ORGANIZATION_ROLES.MEMBER ||
        target.role === ORGANIZATION_ROLES.VIEWER))
  );
};

export const canTransferOrganizationOwnership = (
  actor: OrganizationMembership,
  target: OrganizationMembership,
): boolean => {
  const permissions = ORGANIZATION_ROLE_PERMISSIONS[actor.role] ?? [];

  return (
    actor.organizationId === target.organizationId &&
    actor.uid !== target.uid &&
    actor.status === ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE &&
    permissions.includes('organization:ownership:transfer') &&
    target.status === ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE &&
    target.role !== ORGANIZATION_ROLES.OWNER
  );
};
