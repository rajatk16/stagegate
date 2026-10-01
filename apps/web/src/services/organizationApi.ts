import { User } from "firebase/auth";

import { ApiError, authenticatedApiRequest } from "@/lib";

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
  };
};

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
