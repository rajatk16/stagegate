import {
  Timestamp,
  PartialWithFieldValue,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import {
  ORGANIZATION_ROLE,
  organizationIdSchema,
  organizationRoleSchema,
} from '@stagegate/contracts';

export type OrganizationMembership = {
  orgId: string;
  userId: string;
  role: ORGANIZATION_ROLE;
  status: 'active' | 'revoked';
  createdAt: Timestamp;
};

const isUserId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);

export const organizationMembershipConverter: FirestoreDataConverter<
  OrganizationMembership,
  OrganizationMembership
> = {
  toFirestore<T extends PartialWithFieldValue<OrganizationMembership>>(
    value: T,
  ): T {
    return value;
  },
  fromFirestore(snapshot) {
    const orgId = organizationIdSchema.parse(snapshot.get('orgId'));
    const role = organizationRoleSchema.parse(snapshot.get('role'));
    const userId: unknown = snapshot.get('userId');
    const status: unknown = snapshot.get('status');
    const createdAt: unknown = snapshot.get('createdAt');
    if (
      !isUserId(userId) ||
      snapshot.ref.path !== `orgs/${orgId}/members/${userId}` ||
      (status !== 'active' && status !== 'revoked') ||
      !(createdAt instanceof Timestamp)
    ) {
      throw new Error('Invalid stored organization membership.');
    }
    return { orgId, userId, role, status, createdAt };
  },
};
