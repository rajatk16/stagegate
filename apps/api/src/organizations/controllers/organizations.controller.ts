import { type Response } from 'express';
import {
  Get,
  Req,
  Res,
  Body,
  Post,
  Param,
  Query,
  Header,
  UseGuards,
  Controller,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';

import {
  organizationIdSchema,
  organizationSummarySchema,
  organizationListQuerySchema,
  organizationListResponseSchema,
  createOrganizationRequestSchema,
} from '@stagegate/contracts';

import { ApiError } from '../../common/errors/api.error';
import { OrganizationsService } from '../services/organizations.service';
import { ApiExceptionFilter } from '../../common/filters/apiException.filter';
import { ActiveIdentityGuard } from '../../identity/guards/activeIdentity.guard';
import { FirebaseIdentityGuard } from '../../identity/guards/firebaseIdentity.guard';
import { type ActiveIdentityRequest } from '../../identity/types/activeIdentityRequest.type';

const parseRequest = <T>(
  schema: {
    safeParse(value: unknown): { success: true; data: T } | { success: false };
  },
  input: unknown,
  message: string,
) => {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new ApiError(HttpStatus.BAD_REQUEST, 'INVALID_REQUEST', message);
  return result.data;
};

@Controller('orgs')
@UseGuards(FirebaseIdentityGuard, ActiveIdentityGuard)
@UseFilters(ApiExceptionFilter)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(
    @Req() request: ActiveIdentityRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const input = parseRequest(
      createOrganizationRequestSchema,
      body,
      'Use a UUID, a name, and a lowercase slug.',
    );

    const result = await this.organizationsService.create(
      request.stageGateUserId,
      input,
    );

    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    return organizationSummarySchema.parse(result.organization);
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Req() request: ActiveIdentityRequest, @Query() query: unknown) {
    const input = parseRequest(
      organizationListQuerySchema,
      query,
      'Use a limit from 1 to 100 and an optional cursor.',
    );

    return organizationListResponseSchema.parse(
      await this.organizationsService.list(request.stageGateUserId, input),
    );
  }

  @Get(':orgId')
  @Header('Cache-Control', 'no-store')
  async get(
    @Req() request: ActiveIdentityRequest,
    @Param('orgId') orgId: string,
  ) {
    const id = parseRequest(
      organizationIdSchema,
      orgId,
      'Use a valid organization UUID.',
    );

    return organizationSummarySchema.parse(
      await this.organizationsService.get(request.stageGateUserId, id),
    );
  }
}
