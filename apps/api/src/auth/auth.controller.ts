import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from './decorators/currentUser.decorator';
import type { AuthenticatedUser } from './interfaces/authenticatedUser.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('firebase-auth')
export class AuthController {
  @Get('/me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
