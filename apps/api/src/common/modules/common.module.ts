import { Module } from '@nestjs/common';

import { ServerClock } from '../services/serverClock.service';

@Module({
  providers: [ServerClock],
  exports: [ServerClock],
})
export class CommonModule {}
