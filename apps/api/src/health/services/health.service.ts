import { BeforeApplicationShutdown, Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { HealthResponseDto } from '../dtos/healthResponse.dto';

@Injectable()
export class HealthService implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private ready = false;

  onApplicationBootstrap() {
    this.ready = true;
  }

  beforeApplicationShutdown() {
    this.markNotReady();
  }

  markNotReady(): void {
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }

  getLiveness(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness(): HealthResponseDto {
    return {
      status: this.ready ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString(),
    };
  }
}
