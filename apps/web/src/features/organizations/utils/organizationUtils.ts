import { ApiError } from '@/lib';

import {
  isRecord,
  isDateString,
  isNonEmptyString,
  isNullableString,
} from '@/app/utils';

import { isOrganizationRole } from './organizationMembersUtils';
import {
  ORGANIZATION_CAPABILITIES,
  ORGANIZATION_COLOR_PATTERN,
  ORGANIZATION_SLUG_PATTERN,
} from '../constants';
import {
  Organization,
  OrganizationPage,
  OrganizationCapability,
} from '../types';

export const normalizeOrganizationSlug = (value: string): string =>
  value.trim().toLowerCase();

export const suggestOrganizationSlug = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '');

export const isNullableColor = (value: unknown): value is string | null =>
  value === null ||
  (typeof value === 'string' && ORGANIZATION_COLOR_PATTERN.test(value));

const parseOrganizationCapabilities = (
  value: unknown,
): OrganizationCapability[] => {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    throw new ApiError(
      'The API returned invalid organization capabilities.',
      'response',
    );
  }

  const knownCapabilities = value.filter(
    (item): item is OrganizationCapability =>
      ORGANIZATION_CAPABILITIES.some((capability) => capability === item),
  );

  return [...new Set(knownCapabilities)];
};

export const parseOrganization = (
  value: unknown,
  expectedUid: string,
): Organization => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    typeof value.slug !== 'string' ||
    value.slug.length < 3 ||
    value.slug.length > 63 ||
    !ORGANIZATION_SLUG_PATTERN.test(value.slug) ||
    !isDateString(value.createdAt) ||
    !isDateString(value.updatedAt) ||
    !isRecord(value.membership) ||
    value.membership.uid !== expectedUid ||
    !isOrganizationRole(value.membership.role) ||
    !isNullableString(value.description) ||
    !isNullableString(value.websiteURL) ||
    !isNullableColor(value.primaryColor) ||
    !isNullableColor(value.secondaryColor) ||
    !isNullableString(value.logoVersion)
  ) {
    throw new ApiError(
      'The API returned an unexpected organization response.',
      'response',
    );
  }

  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    membership: {
      uid: expectedUid,
      role: value.membership.role,
    },
    capabilities: parseOrganizationCapabilities(value.capabilities),
    description: value.description,
    websiteURL: value.websiteURL,
    primaryColor: value.primaryColor,
    secondaryColor: value.secondaryColor,
    logoVersion: value.logoVersion,
  };
};

export const pargeOrganizationPage = (
  value: unknown,
  expectedUid: string,
): OrganizationPage => {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new ApiError(
      'The API returned an unexpected organization list.',
      'response',
    );
  }

  const nextCursor = value.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== 'string' ||
      nextCursor.length === 0 ||
      nextCursor.length > 1024 ||
      !/^[A-Za-z0-9_-]+$/.test(nextCursor))
  ) {
    throw new ApiError(
      'The API returned an unexpected organization cursor.',
      'response',
    );
  }

  return {
    items: value.items.map((item) => parseOrganization(item, expectedUid)),
    nextCursor,
  };
};

export const hasOrganizationCapability = (
  organization: Pick<Organization, 'capabilities'>,
  capability: OrganizationCapability,
): boolean => organization.capabilities.includes(capability);
