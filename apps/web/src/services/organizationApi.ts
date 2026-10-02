import { User } from "firebase/auth";

import { ApiError, authenticatedApiRequest } from "@/lib";

export const ORGANIZATION_CAPABILITIES = [
  "organization:read",
  "organization:update",
  "organization:members:manage"
];

export type OrganizationCapability = (typeof ORGANIZATION_CAPABILITIES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  membership: {
    uid: string;
    role: "OWNER";
  };
  capabilities: readonly OrganizationCapability[];
};

type OrganizationPage = {
  items: Organization[];
  nextCursor: string | null;
};

export type CreateOrganizationInput = {
  name: string;
  slug: string;
};

export const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const normalizeOrganizationSlug = (value: string): string =>
  value.trim().toLowerCase();

export const suggestOrganizationSlug = (name: string): string =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isDateString = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const parseOrganizationCapabilities = (
  value: unknown
): OrganizationCapability[] => {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new ApiError(
      "The API returned invalid organization capabilities.",
      'response'
    );
  }

  const knownCapabilities = value.filter(
    (item): item is OrganizationCapability => ORGANIZATION_CAPABILITIES.some((capability) => capability === item)
  );

  return [...new Set(knownCapabilities)];
};

const parseOrganization = (
  value: unknown,
  expectedUid: string,
): Organization => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    typeof value.slug !== "string" ||
    value.slug.length < 3 ||
    value.slug.length > 63 ||
    !ORGANIZATION_SLUG_PATTERN.test(value.slug) ||
    !isDateString(value.createdAt) ||
    !isDateString(value.updatedAt) ||
    !isRecord(value.membership) ||
    value.membership.uid !== expectedUid ||
    value.membership.role !== "OWNER"
  ) {
    throw new ApiError(
      "The API returned an unexpected organization response.",
      "response",
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
      role: "OWNER",
    },
    capabilities: parseOrganizationCapabilities(value.capabilities)
  };
};

export const hasOrganizationCapability = (
  organization: Pick<Organization, 'capabilities'>,
  capability: OrganizationCapability
): boolean => organization.capabilities.includes(capability)

export const createOrganization = async (
  user: User,
  values: CreateOrganizationInput,
  signal: AbortSignal,
): Promise<Organization> => {
  const result = await authenticatedApiRequest(user, "/organizations", {
    method: "POST",
    json: {
      name: values.name.trim(),
      slug: normalizeOrganizationSlug(values.slug),
    },
    signal,
  });

  return parseOrganization(result, user.uid);
};

export const getOrganizationErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session could not be verified. Sign out and sign in again.";
    }

    if (error.code === "AUTH_EMAIL_NOT_VERIFIED") {
      return "Verify your email before creating an organization.";
    }

    if (error.status === 403) {
      return "You do not have permission to create an organization.";
    }

    if (error.status === 400) {
      return "Check the organization name and slug, then try again.";
    }

    if (error.status === 429) {
      return "Too many attempts. Wait a moment before trying again.";
    }

    if (
      error.kind === "network" ||
      error.kind === "timeout" ||
      error.kind === "response" ||
      (error.status !== undefined && error.status >= 500)
    ) {
      return (
        "We could not confirm whether your organization was created. " +
        "Keep the same slug if you retry. If it is now taken, " +
        "the earlier request may have succeeded."
      );
    }
  }

  return "We could not create your organization. Please try again.";
};

const pargeOrganizationPage = (
  value: unknown,
  expectedUid: string,
): OrganizationPage => {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new ApiError(
      "The API returned an unexpected organization list.",
      "response",
    );
  }

  const nextCursor = value.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== "string" ||
      nextCursor.length === 0 ||
      nextCursor.length > 1024 ||
      !/^[A-Za-z0-9_-]+$/.test(nextCursor))
  ) {
    throw new ApiError(
      "The API returned an unexpected organization cursor.",
      "response",
    );
  }

  return {
    items: value.items.map((item) => parseOrganization(item, expectedUid)),
    nextCursor,
  };
};

export const listMyOrganizations = async (
  user: User,
  signal: AbortSignal,
): Promise<Organization[]> => {
  const organizations = new Map<string, Organization>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;

  do {
    signal.throwIfAborted();

    const query = new URLSearchParams();

    if (cursor !== null) {
      query.set("cursor", cursor);
    }

    const suffix = query.size > 0 ? `?${query.toString()}` : "";

    const result = await authenticatedApiRequest(
      user,
      `/organizations/me${suffix}`,
      { signal },
    );

    const page = pargeOrganizationPage(result, user.uid);

    for (const organization of page.items) {
      organizations.set(organization.id, organization);
    }

    if (page.nextCursor !== null) {
      if (seenCursors.has(page.nextCursor)) {
        throw new ApiError(
          "The API returned a repeated organization cursor.",
          "response",
        );
      }

      seenCursors.add(page.nextCursor);
    }

    cursor = page.nextCursor;
  } while (cursor !== null);

  return [...organizations.values()].sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.id.localeCompare(right.id),
  );
};

export const getOrganizationListErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session could not be verified. Sign out and sign in again.";
    }

    if (error.code === "AUTH_EMAIL_NOT_VERIFIED") {
      return "Verify your email to access your organizations.";
    }

    if (error.status === 403) {
      return "You do not have permission to load these organizations.";
    }

    if (error.status === 429) {
      return "Too many requests. Wait a moment and try again.";
    }

    if (error.kind === "network" || error.kind === "timeout") {
      return "We could not reach the server. Check your connection and try again.";
    }
  }

  return "We could not load your organizations. Please try again.";
};
