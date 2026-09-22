import { Module } from "@nestjs/common";

import { UsersService } from "./services";
import { FirebaseModule } from "../firebase";
import { UsersController } from "./controllers";
import { UsersRepository } from "./repositories";

@Module({
  exports: [UsersService],
  imports: [FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
