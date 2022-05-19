import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { USERS_SERVICE, UsersService } from './users.service';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./users.schema";

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_SERVICE,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
