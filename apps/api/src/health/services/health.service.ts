import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';

import { FirebaseHealthService } from '../../firebase/services/firebaseHealth.service';
import { HealthResponseDto } from '../dtos/healthResponse.dto';

@Injectable()
export class HealthService
  implements OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown
{
  private ready = false;

  constructor(private readonly firebaseHealth: FirebaseHealthService) {}

  onApplicationBootstrap() {
    this.ready = true;
  }

  onModuleDestroy() {
    this.markNotReady();
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

  async getReadiness(): Promise<HealthResponseDto> {
    if (!this.ready) {
      return this.unavailable();
    }

    try {
      const dependencies = await this.firebaseHealth.check();

      return {
        status: dependencies.healthy ? 'ok' : 'unavailable',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return this.unavailable();
    }
  }

  private unavailable(): HealthResponseDto {
    return {
      status: 'unavailable',
      timestamp: new Date().toISOString(),
    };
  }
}
