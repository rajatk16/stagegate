import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";

import { FirebaseModule } from "../firebase";
import { 
  FirebaseTokenGuard, 
  VerifiedEmailGuard, 
  SensitiveIpThrottleGuard, 
  SensitiveUserThrottleGuard 
} from "./guards";

@Module({
  imports: [
    FirebaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'ip',
          limit: 30,
          ttl: 60_000,
        },
        {
          name: 'user',
          limit: 5,
          ttl: 60_000,
        }
      ]
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SensitiveIpThrottleGuard
    },
    {
      provide: APP_GUARD,
      useClass: FirebaseTokenGuard
    },
    {
      provide: APP_GUARD,
      useClass: SensitiveUserThrottleGuard
    },
    {
      provide: APP_GUARD,
      useClass: VerifiedEmailGuard
    }
  ]
})
export class AuthModule {}
