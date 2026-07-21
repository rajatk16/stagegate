export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface OrganizationDetails extends OrganizationSummary {
  description?: string | null;
  websiteUrl?: string | null;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface CreateOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface TransferOrganizationOwnershipRequest {
  userId: string;
}
