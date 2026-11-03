import { ORGANIZATION_ROLE_PERMISSIONS } from '../constants';
import { randomUUID } from 'node:crypto';
import { Organization, organizationSchema } from '../models/organization.model';
import { organizationMembershipSchema } from '../models/organizationMembership.model';
import { organizationSlugSchema } from '../models/organizationSlug.model';
import { CreateOrganizationDto } from '../dtos/createOrganization.dto';
import { OrganizationCreation } from '../types/organizationCreation.type';
import { ORGANIZATION_ROLES } from '../enums/organizationRoles.enum';
import { ORGANIZATION_MEMBERSHIP_STATUS } from '../enums/organizationMembershipStatus.enum';
import {
  MyOrganizationsPage,
  OrganizationWithMembership,
} from '../types/organizationPage.type';
import { OrganizationResponseDto } from '../dtos/organizationResponse.dto';
import { MyOrganizationsResponseDto } from '../dtos/myOrganizationsResponse.dto';
import { OrganizationPrivateResponseDto } from '../dtos/organizationPrivateResponse.dto';
import { OrganizationMembershipResponseDto } from '../dtos/organizationMembershipResponse.dto';
import { OrganizationPublicResponseDto } from '../dtos/organizationPublicResponse.dto';

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
    role: ORGANIZATION_ROLES.OWNER,
    status: ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE,
    membership: randomUUID(),
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
      capabilities:
        membership.status === ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE
          ? [...(ORGANIZATION_ROLE_PERMISSIONS[membership.role] ?? [])]
          : [],
    },
  );
