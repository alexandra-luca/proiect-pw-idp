import {Controller, Get, Inject, Param} from '@nestjs/common';
import {USERS_SERVICE, UsersService} from './users.service';
import {Roles} from 'nest-keycloak-connect';

@Controller('users')
export class UsersController {
  constructor(@Inject(USERS_SERVICE) private readonly usersService: UsersService) {
  }

  @Get(':id')
  @Roles({roles: ['host']})
  async getUser(@Param('id') id: string) {
    console.log(id);

    return await this.usersService.getUser(id);
  }
}
