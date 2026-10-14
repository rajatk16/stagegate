import { ORGANIZATION_ROLES } from './organizationRole';
import { OrganizationCapability } from './organizationCapability';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteURL: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoVersion: string | null;
  createdAt: string;
  updatedAt: string;
  membership: {
    uid: string;
    role: ORGANIZATION_ROLES;
  };
  capabilities: readonly OrganizationCapability[];
};
