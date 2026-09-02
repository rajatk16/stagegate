import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Body, Controller, Get, Patch, Post, Res, UseFilters } from '@nestjs/common';

import { IdentityExceptionFilter } from '../filters';
import { type AuthenticatedUser, CurrentActor, RequireVerifiedEmail } from '../../auth';
import { IdentityService, type ProfileResponse } from '../services';
import { parseProfilePatch, validateBootstrapBody } from '../utils';

@Controller('users')
@UseFilters(IdentityExceptionFilter)
export class UsersController {
  constructor(private readonly identity: IdentityService) {}

  @Post('me/bootstrap')
  async bootstrap(
    @CurrentActor() actor: AuthenticatedUser,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProfileResponse> {
    const requestId = this.prepareResponse(response);
    validateBootstrapBody(body);

    const result = await this.identity.bootstrap(actor, requestId);

    response.status(result.created ? 201 : 200);

    if (result.created) {
      response.setHeader('Location', '/api/v1/users/me');
    }

    return result.profile;
  }

  @Get('me')
  getProfile(
    @CurrentActor() actor: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProfileResponse> {
    this.prepareResponse(response);
    return this.identity.getProfile(actor);
  }

  @Patch('me')
  @RequireVerifiedEmail()
  updateProfile(
    @CurrentActor() actor: AuthenticatedUser,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProfileResponse> {
    const requestId = this.prepareResponse(response);
    const patch = parseProfilePatch(body);

    return this.identity.updateProfile(actor, patch, requestId);
  }

  private prepareResponse(response: Response): string {
    const requestId = randomUUID();

    response.setHeader('X-Request-Id', requestId);
    response.setHeader('Cache-Control', 'no-store');

    return requestId;
  }
}
