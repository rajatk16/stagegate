import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { normalizeSlug } from '@/common';

import { EventStatus } from '../enums';
import { CreateEventDto } from '../dtos';

export const createEventFactory = (
  organizationId: string,
  createdBy: string,
  dto: CreateEventDto,
) => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    organizationId,
    name: dto.name.trim(),
    slug: normalizeSlug(dto.slug ?? dto.name),
    publicId: randomUUID(),
    description: dto.description ?? null,
    timezone: dto.timezone,
    startsAt: dto.startsAt ? Timestamp.fromDate(new Date(dto.startsAt)) : null,
    endsAt: dto.endsAt ? Timestamp.fromDate(new Date(dto.endsAt)) : null,
    status: EventStatus.DRAFT,
    publishedAt: null,
    archivedAt: null,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
};
