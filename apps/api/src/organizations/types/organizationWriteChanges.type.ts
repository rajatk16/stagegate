import { Organization } from '../models/organization.model';
import { OrganizationSettingsChanges } from '../models/organizationSettingsChanges.model';

export type OrganizationWriteChanges = OrganizationSettingsChanges &
  Partial<Pick<Organization, 'logoVersion' | 'logoStoragePath'>>;
