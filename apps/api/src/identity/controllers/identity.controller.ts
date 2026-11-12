import {
  Get,
  Req,
  Body,
  Post,
  Header,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';

import {
  IDENTITY_ERROR_CODES,
  identityResponseSchema,
  accountDetailsResponseSchema,
  activateIdentityRequestSchema,
} from '@stagegate/contracts';

import { IdentityError } from '../errors/identity.error';
import { IdentityService } from '../services/identity.service';
import { type IdentityRequest } from '../types/identityRequest.type';
import { FirebaseIdentityGuard } from '../guards/firebaseIdentity.guard';
import { ApiExceptionFilter } from '../../common/filters/apiException.filter';

@Controller('me')
@UseGuards(FirebaseIdentityGuard)
@UseFilters(ApiExceptionFilter)
export class IdentityController {
  constructor(private readonly identities: IdentityService) {}

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  async activate(@Req() request: IdentityRequest, @Body() body: unknown) {
    if (!activateIdentityRequestSchema.safeParse(body).success) {
      throw new IdentityError(
        HttpStatus.BAD_REQUEST,
        IDENTITY_ERROR_CODES.INVALID_REQUEST,
        'Activation accepts bo body fields.',
      );
    }

    return identityResponseSchema.parse(
      await this.identities.activate(request.firebaseIdentity),
    );
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async getMe(@Req() request: IdentityRequest) {
    return identityResponseSchema.parse(
      await this.identities.getActive(request.firebaseIdentity),
    );
  }

  @Get('account')
  @Header('Cache-Control', 'no-store')
  async getAccountDetails(@Req() request: IdentityRequest) {
    return accountDetailsResponseSchema.parse(
      await this.identities.getAccountDetails(request.firebaseIdentity),
    );
  }
}
