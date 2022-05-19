import { Injectable } from '@nestjs/common';

export const USERS_SERVICE = Symbol('UsersService');

@Injectable()
export class UsersService {
  async getUser(userId: string) {
    return '33';
    // return Promise.resolve(undefined);
  }
}
