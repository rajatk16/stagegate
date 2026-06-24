export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface CreateOrganizationRequest {
  name: string;
}
