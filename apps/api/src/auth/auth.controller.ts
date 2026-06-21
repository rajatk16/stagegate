import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserRepository } from '@/users/repositories/user.repository';
import { Authorized } from '@/swagger/decorators/authorized.decorators';

import { MeResponseDto } from './dto';
import { CurrentUser } from './decorators/currentUser.decorator';
import type { AuthenticatedUser } from './interfaces/authenticatedUser.interface';

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
      throw new NotFoundException('User not found');
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
