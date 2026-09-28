import { Module } from "@nestjs/common";

import { UsersService } from "./services";
import { FirebaseModule } from "../firebase";
import { UsersController } from "./controllers";
import { UsersRepository } from "./repositories";
import { AuditModule } from "../audit";

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  imports: [FirebaseModule, AuditModule],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
