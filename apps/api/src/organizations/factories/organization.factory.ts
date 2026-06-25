import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { normalizeSlug } from '@/common/utils';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';
import { CreateOrganizationDto } from '../dtos';

export const createOrganizationFactory = (
  dto: CreateOrganizationDto,
  createdBy: string,
): Organization => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    name: dto.name,
    slug: dto.slug ?? normalizeSlug(dto.name),
    description: dto.description ?? null,
    websiteUrl: dto.websiteUrl ?? null,
    logoUrl: dto.logoUrl ?? null,
    status: OrganizationStatus.ACTIVE,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
};
