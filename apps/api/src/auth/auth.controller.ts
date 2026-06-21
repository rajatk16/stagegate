import { Controller, Get } from '@nestjs/common';

import { Authorized } from '@/swagger/decorators/authorized.decorators';

import { CurrentUser } from './decorators/currentUser.decorator';
import type { AuthenticatedUser } from './interfaces/authenticatedUser.interface';

@Controller('auth')
@Authorized()
export class AuthController {
  @Get('/me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
