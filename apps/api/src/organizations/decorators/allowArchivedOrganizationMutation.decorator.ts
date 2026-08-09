import { SetMetadata } from '@nestjs/common';

export const ALLOW_ARCHIVED_ORGANIZATION_MUTATION =
  'allowArchivedOrganizationMutation';

export const AllowArchivedOrganizationMutation = () =>
  SetMetadata(ALLOW_ARCHIVED_ORGANIZATION_MUTATION, true);
