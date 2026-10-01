import { randomUUID } from 'node:crypto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiException } from '../../common';
import { toNewOrganization } from '../mappers';
import { DiagnosticError } from '../../observalibility';
import { RESERVED_ORGANIZATION_SLUGS } from '../constants';
import { MyOrganizationsPage, OrganizationCreation } from '../types';
import { CreateOrganizationDto, ListMyOrganizationsQueryDto } from '../dtos';
import {
  OrganizationRepository,
  OrganizationmembershipRepository,
} from '../repositories';
import {
  decodeOrganizationCursor,
  encodeOrganizationCursor,
  normalizeOrganizationSlug,
} from '../utils';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMembershipRepository: OrganizationmembershipRepository,
  ) {}

  create(
    user: DecodedIdToken,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationCreation> {
    const slug = normalizeOrganizationSlug(dto.slug);

    if (RESERVED_ORGANIZATION_SLUGS.has(slug)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_SLUG_RESERVED',
        'This organization slug is reserved',
      );
    }

    const creation = toNewOrganization(
      {
        slug,
        name: dto.name,
      },
      randomUUID(),
      user.uid,
      new Date(),
    );

    return this.organizationRepository.create(creation);
  }

  async listMine(
    user: DecodedIdToken,
    dto: ListMyOrganizationsQueryDto,
  ): Promise<MyOrganizationsPage> {
    const afterOrganizationId = decodeOrganizationCursor(dto.cursor, user.uid);

    const page = await this.organizationMembershipRepository.listByUser(
      user.uid,
      dto.limit,
      afterOrganizationId,
    );

    const organizations = await this.organizationRepository.findByIds(
      page.items.map((membership) => membership.organizationId),
    );

    const items = page.items.map((membership) => {
      const organization = organizations.get(membership.organizationId);

      if (!organization || membership.uid !== user.uid) {
        throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
      }

      return {
        organization,
        membership,
      };
    });

    const lastMembership = page.items.at(-1);

    return {
      items,
      nextCursor:
        page.hasMore && lastMembership
          ? encodeOrganizationCursor(user.uid, lastMembership.organizationId)
          : null,
    };
  }
}
