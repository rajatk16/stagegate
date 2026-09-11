import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Body, Controller, Param, Post, Res, UseFilters } from '@nestjs/common';

import { InvitationService } from '../services';
import { CreateInvitationResponse } from '../types';
import { TenancyExceptionFilter } from '../../tenancy';
import {
  type AuthenticatedUser,
  CurrentActor,
  RequireVerifiedEmail,
} from '../../auth';

const prepareResponse = (response: Response): string => {
  const existing = response.getHeader('X-Request-Id');
  const requestId = typeof existing === 'string' ? existing : randomUUID();

  response.setHeader('X-Request-Id', requestId);
  response.setHeader('Cache-Control', 'no-store');

  return requestId;
};

@Controller('organizations/:organizationId/invitations')
@RequireVerifiedEmail()
@UseFilters(TenancyExceptionFilter)
export class OrganizationInvitationsController {
  constructor(private readonly invitations: InvitationService) {}

  @Post()
  create(
    @CurrentActor() actor: AuthenticatedUser,
    @Param('organizationId') organizationId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CreateInvitationResponse> {
    return this.invitations.create(
      actor,
      organizationId,
      body,
      prepareResponse(response),
    );
  }
}
