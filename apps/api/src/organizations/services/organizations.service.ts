import { createHash } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';

import {
  ORGANIZATION_ROLE,
  OrganizationSummary,
  OrganizationListQuery,
  OrganizationListResponse,
  CreateOrganizationRequest,
} from '@stagegate/contracts';

import { ApiError } from '../../common/errors/api.error';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { OrganizationSlugRepository } from '../repositories/organizationSlug.repository';
import { OrganizationMembershipRepository } from '../repositories/organizationMembership.repository';
import {
  encodeOrganizationCursor,
  decodeOrganizationCursor,
} from '../utils/organizationCursor.util';

type CreateOrganizationResult = {
  organization: OrganizationSummary;
  created: boolean;
};

const createConflict = (): ApiError =>
  new ApiError(
    HttpStatus.CONFLICT,
    'ORGANIZATION_CREATE_CONFLICT',
    'This organization request conflicts with an existing request.',
  );

const organizationNotFound = (): ApiError =>
  new ApiError(
    HttpStatus.NOT_FOUND,
    'ORGANIZATION_NOT_FOUND',
    'Organization not found.',
  );

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly organizationSlugRepository: OrganizationSlugRepository,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  async create(
    userId: string,
    input: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResult> {
    const { id, name, slug } = input;
    const fingerPrint = createHash('sha256')
      .update(JSON.stringify([name, slug]))
      .digest('hex');

    return this.firebase.firestore.runTransaction(async (transaction) => {
      const existing = await this.organizationsRepository.find(transaction, id);

      if (existing) {
        if (
          existing.createdByUserId !== userId ||
          existing.createFingerprint !== fingerPrint
        ) {
          throw createConflict();
        }

        const grant = await this.organizationMembershipRepository.findMember(
          transaction,
          id,
          userId,
        );

        if (
          grant?.status !== 'active' ||
          grant.role !== ORGANIZATION_ROLE.OWNER
        ) {
          throw createConflict();
        }

        return {
          organization: {
            id,
            name: existing.name,
            slug: existing.slug,
            role: grant.role,
          },
          created: false,
        };
      }

      if (
        await this.organizationSlugRepository.isSlugReserved(transaction, slug)
      ) {
        throw new ApiError(
          HttpStatus.CONFLICT,
          'ORGANIZATION_SLUG_TAKEN',
          'Choose a different organization slug.',
        );
      }

      this.organizationsRepository.createWithOwner(
        transaction,
        userId,
        input,
        fingerPrint,
      );

      return {
        organization: {
          id,
          name,
          slug,
          role: ORGANIZATION_ROLE.OWNER,
        },
        created: true,
      };
    });
  }

  async list(
    userId: string,
    { limit, cursor }: OrganizationListQuery,
  ): Promise<OrganizationListResponse> {
    const start =
      cursor === undefined
        ? undefined
        : decodeOrganizationCursor(userId, cursor);

    return this.firebase.firestore.runTransaction(
      async (transaction) => {
        const grants =
          await this.organizationMembershipRepository.listActiveMemberships(
            transaction,
            userId,
            limit + 1,
            start,
          );

        const page = grants.slice(0, limit);

        const organizations = await this.organizationsRepository.findMany(
          transaction,
          page.map(({ orgId }) => orgId),
        );
        const items = page.map(({ orgId, role }) => {
          const organization = organizations.get(orgId);
          if (!organization) {
            throw new Error(
              'Organizaiton membership has not parent organization.',
            );
          }
          return {
            id: orgId,
            name: organization.name,
            slug: organization.slug,
            role,
          };
        });
        const nextCursor =
          grants.length > limit
            ? encodeOrganizationCursor(userId, page[page.length - 1])
            : null;

        return {
          items,
          nextCursor,
        };
      },
      {
        readOnly: true,
      },
    );
  }

  async get(userId: string, id: string): Promise<OrganizationSummary> {
    return this.firebase.firestore.runTransaction(async (transaction) => {
      const grant = await this.organizationMembershipRepository.findMember(
        transaction,
        id,
        userId,
      );

      if (grant?.status !== 'active') throw organizationNotFound();

      const organization = await this.organizationsRepository.find(
        transaction,
        id,
      );

      if (!organization) throw organizationNotFound();

      return {
        id,
        name: organization.name,
        slug: organization.slug,
        role: grant.role,
      };
    });
  }
}
