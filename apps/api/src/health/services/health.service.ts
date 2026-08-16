import { BeforeApplicationShutdown, Injectable, Logger } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

@Injectable()
export class HealthService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(HealthService.name);

  private acceptingTraffic = true;

  constructor(private readonly firebaseService: FirebaseService) {}

  beforeApplicationShutdown(): void {
    this.acceptingTraffic = false;
  }

  async isReady(): Promise<boolean> {
    if (!this.acceptingTraffic) {
      return false;
    }

    try {
      await this.checkFirestore();

      return true;
    } catch (error) {
      this.logger.error(
        'Readiness check failed: Firestore is unavailable.',
        error instanceof Error ? error.message : String(error),
      );

      return false;
    }
  }

  private async checkFirestore(): Promise<void> {
    await this.firebaseService.firestore.collection('_health').limit(1).get();
  }
}
