import slugify from 'slugify';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { Organization } from './entities';
import { OrganizationStatus } from './enums';
import { CreateOrganizationDto } from './dto';

export const createOrganizationFactory = (
  dto: CreateOrganizationDto,
  createdBy: string,
): Organization => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    name: dto.name,
    slug: slugify(dto.name, {
      lower: true,
      strict: true,
    }),
    description: dto.description ?? null,
    websiteUrl: dto.websiteUrl ?? null,
    logoUrl: dto.logoUrl ?? null,
    status: OrganizationStatus.ACTIVE,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
};
