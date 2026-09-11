import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';

import { InvitationService } from '../services';
import { AcceptedInvitationResponse } from '../types';
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

@Controller('invitations')
@RequireVerifiedEmail()
@UseFilters(TenancyExceptionFilter)
export class InvitationsController {
  constructor(private readonly invitations: InvitationService) {}

  @Post('accept')
  @HttpCode(200)
  accept(
    @CurrentActor() actor: AuthenticatedUser,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AcceptedInvitationResponse> {
    return this.invitations.accept(actor, body, prepareResponse(response));
  }
}
