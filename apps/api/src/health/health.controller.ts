import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { Public } from '@/auth/decorators';
import { FirebaseService } from '@/firebase/firebase.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get health status of the application',
  })
  @ApiOkResponse({
    description: 'The health status of the application',
  })
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
