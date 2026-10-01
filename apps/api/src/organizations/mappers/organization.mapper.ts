import {
  CreateOrganizationDto,
  OrganizationMembershipResponseDto,
  OrganizationResponseDto,
} from '../dtos';
import {
  organizationMembershipSchema,
  organizationSchema,
  organizationSlugSchema,
} from '../models';
import { OrganizationCreation } from '../types';

export const toNewOrganization = (
  dto: CreateOrganizationDto,
  organizationId: string,
  actorUid: string,
  now: Date,
): OrganizationCreation => ({
  organization: organizationSchema.parse({
    id: organizationId,
    name: dto.name,
    slug: dto.slug,
    createdByUid: actorUid,
    createdAt: now,
    updatedAt: now,
  }),
  ownerMembership: organizationMembershipSchema.parse({
    organizationId,
    uid: actorUid,
    role: 'OWNER',
    createdAt: now,
    updatedAt: now,
  }),

  slugReservation: organizationSlugSchema.parse({
    slug: dto.slug,
    organizationId,
    createdAt: now,
  }),
});

export const toOrganizationResponseDto = (
  creation: OrganizationCreation,
): OrganizationResponseDto => {
  const { organization, ownerMembership } = creation;

  return Object.assign(new OrganizationResponseDto(), {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
    membership: Object.assign(new OrganizationMembershipResponseDto(), {
      uid: ownerMembership.uid,
      role: ownerMembership.role,
    }),
  });
};
