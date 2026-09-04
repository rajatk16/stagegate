import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { Body, Controller, Get, Param, Post, Res, UseFilters } from '@nestjs/common';

import { OrganizationResponse } from '../types';
import { OrganizationService } from '../services';
import { TenancyExceptionFilter } from '../filters';
import { parseCreateOrganization, parseOrganizationId } from '../utils';
import { type AuthenticatedUser, CurrentActor, RequireVerifiedEmail } from '../../auth';

const prepareResponse = (response: Response): string => {
  const existing = response.getHeader('X-Request-Id');
  const requestId = typeof existing === 'string' ? existing : randomUUID();

  response.setHeader('X-Request-Id', requestId);
  response.setHeader('Cache-Control', 'no-store');

  return requestId;
};

@Controller('organizations')
@UseFilters(TenancyExceptionFilter)
export class OrganizationsControllers {
  constructor(private readonly organizations: OrganizationService) {}

  @Post()
  @RequireVerifiedEmail()
  async create(
    @CurrentActor() actor: AuthenticatedUser,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OrganizationResponse> {
    const requestId = prepareResponse(response);
    const input = parseCreateOrganization(body);

    const organization = await this.organizations.create(actor, input.name, requestId);

    response.status(201);
    response.setHeader('Location', `/api/v1/organizations/${organization.organizationId}`);

    return organization;
  }

  @Get()
  list(
    @CurrentActor() actor: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<readonly OrganizationResponse[]> {
    prepareResponse(response);

    return this.organizations.list(actor);
  }

  @Get(':organizationId')
  get(
    @CurrentActor() actor: AuthenticatedUser,
    @Param('organizationId') rawOrganizationId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OrganizationResponse> {
    prepareResponse(response);

    return this.organizations.get(actor, parseOrganizationId(rawOrganizationId));
  }
}
