import {Module} from '@nestjs/common';
import {UsersController} from './users.controller';
import {USERS_SERVICE, UsersService} from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_SERVICE,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
