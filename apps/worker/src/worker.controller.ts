import { Controller, Get } from '@nestjs/common';

interface WorkerRootResponse {
  service: 'stagegate-worker';
  status: 'running';
}

@Controller()
export class WorkerController {
  @Get()
  getRoot(): WorkerRootResponse {
    return {
      service: 'stagegate-worker',
      status: 'running',
    };
  }
}
