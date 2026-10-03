import { OrganizationDocument } from './organizationDocument.type';

export type OrganizationSettingsUpdateDocument = Pick<
  OrganizationDocument,
  'updatedAt'
> &
  Partial<
    Pick<
      OrganizationDocument,
      | 'name'
      | 'description'
      | 'websiteURL'
      | 'primaryColor'
      | 'secondaryColor'
      | 'logoVersion'
      | 'logoStoragePath'
    >
  >;
