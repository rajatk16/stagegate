import { ORGANIZATION_ROLE_PERMISSIONS } from '../constants';
import {
  MyOrganizationsPage,
  OrganizationCreation,
  OrganizationWithMembership,
} from '../types';
import {
  Organization,
  organizationSchema,
  organizationSlugSchema,
  organizationMembershipSchema,
} from '../models';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MyOrganizationsResponseDto,
  OrganizationPublicResponseDto,
  OrganizationPrivateResponseDto,
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

export const toOrganizationWithMembershipResponseDto = (
  value: OrganizationWithMembership,
): OrganizationResponseDto =>
  Object.assign(
    new OrganizationResponseDto(),
    toOrganizationPrivateResponseDto(value),
  );

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

export const toOrganizationPublicResponseDto = (
  organization: Organization,
): OrganizationPublicResponseDto =>
  Object.assign(new OrganizationPublicResponseDto(), {
    id: organization.id,
    slug: organization.slug,
    name: organization.name,
    description: organization.description,
    websiteURL: organization.websiteURL,
    primaryColor: organization.primaryColor,
    secondaryColor: organization.secondaryColor,
    logoVersion: organization.logoVersion,
  });

export const toOrganizationPrivateResponseDto = ({
  organization,
  membership,
}: OrganizationWithMembership): OrganizationPrivateResponseDto =>
  Object.assign(
    new OrganizationPrivateResponseDto(),
    toOrganizationPublicResponseDto(organization),
    {
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
      membership: Object.assign(new OrganizationMembershipResponseDto(), {
        uid: membership.uid,
        role: membership.role,
      }),
      capabilities: [...(ORGANIZATION_ROLE_PERMISSIONS[membership.role] ?? [])],
    },
  );
