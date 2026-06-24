import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators';
import { Authorized } from '@/swagger/decorators';
import { AuthenticatedUser } from '@/auth/interfaces';

import { CreateOrganizationDto } from './dto';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationResponseDto } from './memberships/dto';

@Authorized()
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization',
  })
  @ApiCreatedResponse({
    type: CreateOrganizationResponseDto,
  })
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<CreateOrganizationResponseDto> {
    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    const organization = await this.organizationsService.createOrganization(
      dto,
      user.userId,
    );

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
    };
  }
}
