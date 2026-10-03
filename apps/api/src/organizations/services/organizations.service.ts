import { randomUUID } from 'node:crypto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { HttpStatus, Injectable } from '@nestjs/common';

import { toNewOrganization } from '../mappers';
import { DiagnosticError } from '../../observalibility';
import { RESERVED_ORGANIZATION_SLUGS } from '../constants';
import { ApiException, RequestValidationException } from '../../common';
import {
  MyOrganizationsPage,
  OrganizationCreation,
  OrganizationScope,
  OrganizationWithMembership,
} from '../types';
import {
  CreateOrganizationDto,
  ListMyOrganizationsQueryDto,
  UpdateOrganizationSettingsDto,
} from '../dtos';
import {
  OrganizationRepository,
  OrganizationmembershipRepository,
} from '../repositories';
import {
  decodeOrganizationCursor,
  encodeOrganizationCursor,
  normalizeOrganizationSlug,
} from '../utils';
import { organizationSettingsChangesSchema } from '../models';

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

  updateSettings(
    scope: OrganizationScope,
    dto: UpdateOrganizationSettingsDto,
  ): Promise<OrganizationWithMembership> {
    const result = organizationSettingsChangesSchema.safeParse(dto);

    if (!result.success) {
      throw new RequestValidationException([
        {
          field: '$body',
          code: 'INVALID_VALUE',
        },
      ]);
    }

    const changes = result.data;

    if (Object.values(changes).every((value) => value === undefined)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_SETTINGS_UPDATE_EMPTY',
        'Provide at least one setting to update.',
      );
    }

    return this.organizationRepository.updateSettings(scope, changes);
  }
}
