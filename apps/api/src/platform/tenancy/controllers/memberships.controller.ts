import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Controller, Get, Res, UseFilters } from '@nestjs/common';

import { MembershipResponse } from '../types';
import { MembershipService } from '../services';
import { TenancyExceptionFilter } from '../filters';
import { type AuthenticatedUser, CurrentActor } from '../../auth';

const prepareResponse = (response: Response): string => {
  const existing = response.getHeader('X-Request-Id');
  const requestId = typeof existing === 'string' ? existing : randomUUID();

  response.setHeader('X-Request-Id', requestId);
  response.setHeader('Cache-Control', 'no-store');

  return requestId;
};

@Controller('memberships')
@UseFilters(TenancyExceptionFilter)
export class MembershipsController {
  constructor(private readonly memberships: MembershipService) {}

  @Get('me')
  listMine(
    @CurrentActor() actor: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<readonly MembershipResponse[]> {
    prepareResponse(response);
    return this.memberships.listMine(actor);
  }
}
