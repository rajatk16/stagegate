import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../../auth';
import type { Membership, Organization } from '../types';
import type { MembershipRepository, OrganizationRepository } from '../repositories';
import type { TenancyError } from '../utils';
import { OrganizationService } from './organization.service';

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const organization = (organizationId: string, name: string): Organization => ({
  organizationId,
  name,
  version: 1,
  createdAt,
  updatedAt,
});

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

function createRepositories(): {
  organizations: jest.Mocked<OrganizationRepository>;
  memberships: jest.Mocked<MembershipRepository>;
} {
  return {
    organizations: {
      createWithOwner: jest.fn<OrganizationRepository['createWithOwner']>(),
      find: jest.fn<OrganizationRepository['find']>(),
      findMany: jest.fn<OrganizationRepository['findMany']>(),
    },
    memberships: {
      findActive: jest.fn<MembershipRepository['findActive']>(),
      listActiveForUser: jest.fn<MembershipRepository['listActiveForUser']>(),
    },
  };
}

describe('OrganizationService', () => {
  it('creates an organization and returns its owner membership context', async () => {
    const { memberships, organizations } = createRepositories();
    organizations.createWithOwner.mockResolvedValue({
      organization: organization('org-a', 'StageGate Conf'),
      membership: membership('org-a'),
    });
    const service = new OrganizationService(organizations, memberships);

    await expect(service.create(actor, 'StageGate Conf', 'request-123')).resolves.toEqual({
      organizationId: 'org-a',
      name: 'StageGate Conf',
      version: 1,
      membership: {
        membershipId: 'org-a_user-123',
        role: 'OWNER',
        status: 'ACTIVE',
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(organizations.createWithOwner).toHaveBeenCalledWith(
      'StageGate Conf',
      'user-123',
      'request-123',
    );
  });

  it('lists organizations in name and id order', async () => {
    const { memberships, organizations } = createRepositories();
    memberships.listActiveForUser.mockResolvedValue([
      membership('org-b'),
      membership('org-a'),
      membership('org-c'),
    ]);
    organizations.findMany.mockResolvedValue([
      organization('org-b', 'Zeta Org'),
      organization('org-a', 'Alpha Org'),
      organization('org-c', 'Alpha Org'),
    ]);
    const service = new OrganizationService(organizations, memberships);

    await expect(service.list(actor)).resolves.toMatchObject([
      {
        organizationId: 'org-a',
        name: 'Alpha Org',
      },
      {
        organizationId: 'org-c',
        name: 'Alpha Org',
      },
      {
        organizationId: 'org-b',
        name: 'Zeta Org',
      },
    ]);
    expect(organizations.findMany).toHaveBeenCalledWith(['org-b', 'org-a', 'org-c']);
  });

  it('throws when a listed membership has no organization data', async () => {
    const { memberships, organizations } = createRepositories();
    memberships.listActiveForUser.mockResolvedValue([membership('org-a')]);
    organizations.findMany.mockResolvedValue([]);
    const service = new OrganizationService(organizations, memberships);

    await expect(service.list(actor)).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('returns an organization when the actor has an active membership', async () => {
    const { memberships, organizations } = createRepositories();
    memberships.findActive.mockResolvedValue(membership('org-a'));
    organizations.find.mockResolvedValue(organization('org-a', 'StageGate Conf'));
    const service = new OrganizationService(organizations, memberships);

    await expect(service.get(actor, 'org-a')).resolves.toMatchObject({
      organizationId: 'org-a',
      name: 'StageGate Conf',
      membership: {
        membershipId: 'org-a_user-123',
      },
    });
    expect(memberships.findActive).toHaveBeenCalledWith('org-a', 'user-123');
  });

  it('throws when the actor has no active membership', async () => {
    const { memberships, organizations } = createRepositories();
    memberships.findActive.mockResolvedValue(null);
    const service = new OrganizationService(organizations, memberships);

    await expect(service.get(actor, 'org-a')).rejects.toMatchObject({
      code: 'ORGANIZATION_NOT_FOUND',
    } satisfies Partial<TenancyError>);
    expect(organizations.find).not.toHaveBeenCalled();
  });

  it('throws when membership exists but organization data is missing', async () => {
    const { memberships, organizations } = createRepositories();
    memberships.findActive.mockResolvedValue(membership('org-a'));
    organizations.find.mockResolvedValue(null);
    const service = new OrganizationService(organizations, memberships);

    await expect(service.get(actor, 'org-a')).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });
});
