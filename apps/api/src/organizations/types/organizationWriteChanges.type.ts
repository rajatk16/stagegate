import { Organization, OrganizationSettingsChanges } from '../models';

export type OrganizationWriteChanges = OrganizationSettingsChanges &
  Partial<Pick<Organization, 'logoVersion' | 'logoStoragePath'>>;
