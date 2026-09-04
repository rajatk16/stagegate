import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../../auth';
import type { Membership } from '../types';
import type { MembershipRepository } from '../repositories';
import { MembershipService } from './membership.service';

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const membership = (organizationId: string): Membership => ({
  membershipId: `${organizationId}_user-123`,
  organizationId,
  userId: 'user-123',
  role: 'OWNER',
  status: 'ACTIVE',
  version: 1,
  createdAt,
  updatedAt,
});

describe('MembershipService', () => {
  it('returns active memberships sorted by organization id', async () => {
    const repository: jest.Mocked<Pick<MembershipRepository, 'listActiveForUser'>> = {
      listActiveForUser: jest.fn<MembershipRepository['listActiveForUser']>().mockResolvedValue([
        membership('org-b'),
        membership('org-a'),
      ]),
    };
    const service = new MembershipService(repository as unknown as MembershipRepository);

    await expect(service.listMine(actor)).resolves.toEqual([
      {
        membershipId: 'org-a_user-123',
        organizationId: 'org-a',
        userId: 'user-123',
        role: 'OWNER',
        status: 'ACTIVE',
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        membershipId: 'org-b_user-123',
        organizationId: 'org-b',
        userId: 'user-123',
        role: 'OWNER',
        status: 'ACTIVE',
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);
    expect(repository.listActiveForUser).toHaveBeenCalledWith('user-123');
  });
});
