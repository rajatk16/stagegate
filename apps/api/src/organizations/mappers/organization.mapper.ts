import {
  MyOrganizationsPage,
  OrganizationCreation,
  OrganizationWithMembership,
} from '../types';
import {
  organizationSchema,
  organizationSlugSchema,
  organizationMembershipSchema,
} from '../models';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MyOrganizationsResponseDto,
  OrganizationMembershipResponseDto,
} from '../dtos';

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

export const toOrganizationWithMembershipResponseDto = ({
  organization,
  membership,
}: OrganizationWithMembership): OrganizationResponseDto =>
  Object.assign(new OrganizationResponseDto(), {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
    membership: Object.assign(new OrganizationMembershipResponseDto(), {
      uid: membership.uid,
      role: membership.role,
    }),
  });

export const toOrganizationResponseDto = (
  creation: OrganizationCreation,
): OrganizationResponseDto =>
  toOrganizationWithMembershipResponseDto({
    organization: creation.organization,
    membership: creation.ownerMembership,
  });

export const toMyOrganizationsResponseDto = (
  page: MyOrganizationsPage,
): MyOrganizationsResponseDto =>
  Object.assign(new MyOrganizationsResponseDto(), {
    items: page.items.map(toOrganizationWithMembershipResponseDto),
    nextCursor: page.nextCursor,
  });
