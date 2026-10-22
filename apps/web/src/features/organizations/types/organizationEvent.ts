export type OrganizationEvent = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
};
