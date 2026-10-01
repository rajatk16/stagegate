import { randomUUID } from 'node:crypto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiException } from '../../common';
import { toNewOrganization } from '../mappers';
import { CreateOrganizationDto } from '../dtos';
import { OrganizationCreation } from '../types';
import { normalizeOrganizationSlug } from '../utils';
import { OrganizationRepository } from '../repositories';
import { RESERVED_ORGANIZATION_SLUGS } from '../constants';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
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
}
