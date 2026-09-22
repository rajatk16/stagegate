import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { FirebaseModule } from "../firebase";
import { FirebaseTokenGuard } from "./guards";

@Module({
  imports: [FirebaseModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseTokenGuard
    }
  ]
})
export class AuthModule {}
