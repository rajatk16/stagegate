import { Controller, Get, Header } from '@nestjs/common';

import { type AuthenticatedUser, CurrentActor, Public } from './platform/auth';

interface ApiRootResponse {
  service: 'stagegate-api';
  status: 'running';
}

@Controller()
export class AppController {
  @Get()
  @Public()
  getRoot(): ApiRootResponse {
    return {
      service: 'stagegate-api',
      status: 'running',
    };
  }

  @Get('auth/session')
  @Header('Cache-Control', 'no-store')
  getSession(@CurrentActor() actor: AuthenticatedUser): AuthenticatedUser {
    return actor;
  }
}
