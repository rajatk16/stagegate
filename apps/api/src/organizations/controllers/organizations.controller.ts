import { type DecodedIdToken } from 'firebase-admin/auth';
import {
  Get,
  Body,
  Post,
  Query,
  Header,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { OrganizationsService } from '../services';
import { CurrentUser, SensitiveAction } from '../../auth/decorators';
import {
  toOrganizationResponseDto,
  toMyOrganizationsResponseDto,
} from '../mappers';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MyOrganizationsResponseDto,
  ListMyOrganizationsQueryDto,
} from '../dtos';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @SensitiveAction('createOrganization')
  async create(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const creation = await this.organizationsService.create(user, dto);

    return toOrganizationResponseDto(creation);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async listMine(
    @CurrentUser() user: DecodedIdToken,
    @Query() query: ListMyOrganizationsQueryDto,
  ): Promise<MyOrganizationsResponseDto> {
    const page = await this.organizationsService.listMine(user, query);

    return toMyOrganizationsResponseDto(page);
  }
}
