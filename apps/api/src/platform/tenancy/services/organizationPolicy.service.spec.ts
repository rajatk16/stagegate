import { describe, expect, it, jest } from '@jest/globals';

import type { TenancyError } from '../utils';
import type { AuthenticatedUser } from '../../auth';
import type { MembershipRepository } from '../repositories';
import { OrganizationPolicyService } from './organizationPolicy.service';
import {
  MembershipRole,
  type Membership,
  MembershipStatus,
  OrganizationPermission,
} from '../types';

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const membership = (overrides: Partial<Membership> = {}): Membership => ({
  membershipId: 'org-a_user-123',
  organizationId: 'org-a',
  userId: 'user-123',
  role: MembershipRole.OWNER,
  status: MembershipStatus.ACTIVE,
  version: 1,
  createdAt,
  updatedAt,
  ...overrides,
});

function createMembershipRepository(): jest.Mocked<
  Pick<MembershipRepository, 'findActive'>
> {
  return {
    findActive: jest.fn<MembershipRepository['findActive']>(),
  };
}

describe('OrganizationPolicyService', () => {
  it('authorizes by loading the actor membership from the repository', async () => {
    const memberships = createMembershipRepository();
    const ownerMembership = membership();
    memberships.findActive.mockResolvedValue(ownerMembership);
    const service = new OrganizationPolicyService(
      memberships as unknown as MembershipRepository,
    );

    await expect(
      service.authorize(
        actor,
        'org-a',
        OrganizationPermission.ORGANIZATION_READ,
      ),
    ).resolves.toBe(ownerMembership);
    expect(memberships.findActive).toHaveBeenCalledWith('org-a', 'user-123');
  });

  it.each([
    [
      MembershipRole.OWNER,
      [
        OrganizationPermission.ORGANIZATION_READ,
        OrganizationPermission.ORGANIZATION_UPDATE,
        OrganizationPermission.MEMBERSHIP_READ,
        OrganizationPermission.INVITATION_CREATE,
        OrganizationPermission.OWNERSHIP_TRANSFER,
      ],
    ],
    [
      MembershipRole.ADMIN,
      [
        OrganizationPermission.ORGANIZATION_READ,
        OrganizationPermission.ORGANIZATION_UPDATE,
        OrganizationPermission.MEMBERSHIP_READ,
        OrganizationPermission.INVITATION_CREATE,
      ],
    ],
    [MembershipRole.EVENT_MANAGER, [OrganizationPermission.MEMBERSHIP_READ]],
    [MembershipRole.REVIEWER, [OrganizationPermission.ORGANIZATION_READ]],
    [MembershipRole.SUBMITTER, [OrganizationPermission.MEMBERSHIP_READ]],
    [MembershipRole.OBSERVER, [OrganizationPermission.MEMBERSHIP_READ]],
  ] as const)(
    'allows %s to use its configured permissions',
    (role, permissions) => {
      const service = new OrganizationPolicyService(
        createMembershipRepository() as unknown as MembershipRepository,
      );
      const currentMembership = membership({ role });

      for (const permission of permissions) {
        expect(
          service.assertAllowed(
            currentMembership,
            'user-123',
            'org-a',
            permission,
          ),
        ).toBe(currentMembership);
        expect(
          service.can(currentMembership, 'user-123', 'org-a', permission),
        ).toBe(true);
      }
    },
  );

  it('throws permission denied when the role lacks a requested permission', () => {
    const service = new OrganizationPolicyService(
      createMembershipRepository() as unknown as MembershipRepository,
    );
    const reviewerMembership = membership({ role: MembershipRole.REVIEWER });

    expect(() =>
      service.assertAllowed(
        reviewerMembership,
        'user-123',
        'org-a',
        OrganizationPermission.ORGANIZATION_UPDATE,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PERMISSION_DENIED',
      } satisfies Partial<TenancyError>),
    );
  });

  it.each([
    ['missing membership', null],
    [
      'suspended membership',
      membership({ status: MembershipStatus.SUSPENDED }),
    ],
    ['removed membership', membership({ status: MembershipStatus.REMOVED })],
    [
      'wrong user',
      membership({ userId: 'other-user', membershipId: 'org-a_other-user' }),
    ],
    [
      'wrong organization',
      membership({ organizationId: 'org-b', membershipId: 'org-b_user-123' }),
    ],
    ['wrong composite id', membership({ membershipId: 'org-a_other-user' })],
  ] as const)('treats %s as not found', (_name, currentMembership) => {
    const service = new OrganizationPolicyService(
      createMembershipRepository() as unknown as MembershipRepository,
    );

    expect(() =>
      service.assertAllowed(
        currentMembership,
        'user-123',
        'org-a',
        OrganizationPermission.ORGANIZATION_READ,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'ORGANIZATION_NOT_FOUND',
      } satisfies Partial<TenancyError>),
    );
    expect(
      service.can(
        currentMembership,
        'user-123',
        'org-a',
        OrganizationPermission.ORGANIZATION_READ,
      ),
    ).toBe(false);
  });

  it('returns false for roles that are not configured', () => {
    const service = new OrganizationPolicyService(
      createMembershipRepository() as unknown as MembershipRepository,
    );
    const currentMembership = membership({
      role: 'UNKNOWN_ROLE' as MembershipRole,
    });

    expect(
      service.can(
        currentMembership,
        'user-123',
        'org-a',
        OrganizationPermission.ORGANIZATION_READ,
      ),
    ).toBe(false);
  });
});
