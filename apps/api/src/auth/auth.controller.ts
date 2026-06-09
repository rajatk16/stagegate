import { Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { type FirebaseUser } from './interfaces';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async sync(@CurrentUser() firebaseUser: FirebaseUser) {
    return this.authService.syncUser(firebaseUser);
  }
}
