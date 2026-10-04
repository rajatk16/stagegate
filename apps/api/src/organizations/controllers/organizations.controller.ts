import { type DecodedIdToken } from 'firebase-admin/auth';
import {
  Get,
  Body,
  Post,
  Patch,
  Query,
  Header,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
  UploadedFile,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';

import { type OrganizationScope } from '../types';
import {
  OrganizationsService,
  OrganizationLogoService,
  UploadedOrganizationLogo,
} from '../services';
import {
  OrganizationScoped,
  CurrentOrganization,
  RequireOrganizationPermissions,
} from '../decorators';
import {
  toOrganizationResponseDto,
  toMyOrganizationsResponseDto,
  toOrganizationPrivateResponseDto,
  toOrganizationWithMembershipResponseDto,
} from '../mappers';
import {
  CurrentUser,
  SensitiveAction,
  ThrottleUserWrites,
  RequireVerifiedEmail,
} from '../../auth/decorators';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MyOrganizationsResponseDto,
  ListMyOrganizationsQueryDto,
  UpdateOrganizationSettingsDto,
  OrganizationPrivateResponseDto,
} from '../dtos';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly organizationLogoService: OrganizationLogoService,
  ) {}

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

  @Get(':organizationId')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:read')
  @Header('Cache-Control', 'no-store')
  getOrganization(
    @CurrentOrganization() scope: OrganizationScope,
  ): OrganizationResponseDto {
    return toOrganizationWithMembershipResponseDto(scope);
  }

  @Patch(':organizationId/settings')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  async updateSettings(
    @CurrentOrganization() scope: OrganizationScope,
    @Body() dto: UpdateOrganizationSettingsDto,
  ): Promise<OrganizationPrivateResponseDto> {
    const updated = await this.organizationsService.updateSettings(scope, dto);

    return toOrganizationPrivateResponseDto(updated);
  }

  @Post(':organizationId/logo')
  @HttpCode(HttpStatus.OK)
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
        fields: 0,
      },
    }),
  )
  async uploadLogo(
    @CurrentOrganization() scope: OrganizationScope,
    @UploadedFile() file: UploadedOrganizationLogo | undefined,
  ): Promise<OrganizationPrivateResponseDto> {
    return toOrganizationPrivateResponseDto(
      await this.organizationLogoService.upload(scope, file),
    );
  }

  @Get(':organizationId/logo')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:read')
  @Header('Cache-Control', 'private no-store')
  async readLogo(
    @CurrentOrganization() scope: OrganizationScope,
  ): Promise<StreamableFile> {
    return new StreamableFile(await this.organizationLogoService.read(scope), {
      type: 'image/webp',
      disposition: 'inline',
    });
  }

  @Delete(':organizationId/logo')
  @HttpCode(HttpStatus.OK)
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-control', 'no-store')
  async removeLogo(
    @CurrentOrganization() scope: OrganizationScope,
  ): Promise<OrganizationPrivateResponseDto> {
    return toOrganizationPrivateResponseDto(
      await this.organizationLogoService.remove(scope),
    );
  }
}
