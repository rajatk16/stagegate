import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ErrorCode } from '@/common/enums';
import { Authorized } from '@/swagger/decorators';
import { ApplicationException } from '@/common/utils';
import { UserRepository } from '@/users/repositories';

import { MeResponseDto } from './dto';
import { CurrentUser } from './decorators';
import type { AuthenticatedUser } from './interfaces';

@ApiTags('Authentication')
@Authorized()
@Controller('auth')
export class AuthController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('/me')
  @ApiOperation({
    description: 'Get authenticated user profile',
  })
  @ApiOkResponse({
    type: MeResponseDto,
  })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    const profile = await this.userRepository.findById(user.userId);

    if (!profile) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      photoUrl: profile.photoUrl,
      status: profile.status,
      createdAt: profile.createdAt,
      organizations: [],
    };
  }
}
