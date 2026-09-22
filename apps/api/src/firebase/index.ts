import { Module } from "@nestjs/common";

import { FirebaseService } from "./services";

@Module({
  exports: [FirebaseService],
  providers: [FirebaseService]
})
export class FirebaseModule{}