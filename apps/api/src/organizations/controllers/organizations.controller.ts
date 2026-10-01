import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { OrganizationsService } from '../services';
import { CurrentUser, SensitiveAction } from '../../auth/decorators';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { CreateOrganizationDto, OrganizationResponseDto } from '../dtos';
import { toOrganizationResponseDto } from '../mappers';

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
}
