import { SetMetadata } from '@nestjs/common';

export const ORGANIZATION_CONTEXT_PARAM = 'organizationContextParam';

export const OrganizationContext = (parameterName = 'organizationSlug') =>
  SetMetadata(ORGANIZATION_CONTEXT_PARAM, parameterName);
