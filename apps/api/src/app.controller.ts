import { Controller, Get } from '@nestjs/common';

interface ApiRootResponse {
  service: 'stagegate-api';
  status: 'running';
}

@Controller()
export class AppController {
  @Get()
  getRoot(): ApiRootResponse {
    return {
      service: 'stagegate-api',
      status: 'running',
    };
  }
}
