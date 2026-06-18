import { Controller, Get } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

@Controller('health')
export class HealthController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get()
  async getHealth() {
    try {
      await this.firebaseService.firestore.collection('_health').limit(1).get();

      return {
        status: 'UP',
        firestore: 'CONNECTED',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(error, 'Failed to connect to Firestore');
      return {
        status: 'DOWN',
        firestore: 'DISCONNECTED',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
