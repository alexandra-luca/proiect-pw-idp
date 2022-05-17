import {BadRequestException, Body, Controller, Get, Inject, Param, Post} from '@nestjs/common';
import {USERS_SERVICE, UsersService} from "./users.service";
import {Roles, Unprotected} from "nest-keycloak-connect";
import {LoginCredentials} from "./dtos";
import axios from 'axios';
import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;


@Controller('users')
export class UsersController {
    constructor(@Inject(USERS_SERVICE) private readonly usersService: UsersService) {
    }

    @Get(':id')
    @Roles({roles: ['host']})
    async getUser(@Param('id') id: string) {
        return await this.usersService.getUser(id);
    }

    @Post('/register')
    @Unprotected()
    async register(@Body() body: LoginCredentials) {
        try {
            const response = await this.usersService.login(env.KEYCLOAK_ADMIN_USERNAME, env.KEYCLOAK_ADMIN_PASSWORD);

            if (response.token) {
                const users_url = `http://localhost:${env.KEYCLOAK_PORT}/admin/realms/Warbnb/users`;
                const data = {
                    username: body.username,
                    enabled: true,
                    credentials: [{
                        type: 'password',
                        value: body.password,
                        temporary: false
                    }]
                };

                const res = await axios.post(users_url, data,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${response.token}`
                        }
                    }
                );

                if (res.status === 201) {
                    return await this.usersService.login(body.username, body.password);
                }
            }
        } catch (e) {
            throw new BadRequestException('Invalid user!');
        }
    }

    @Post('/login')
    @Unprotected()
    async login(@Body() body: LoginCredentials) {
        return await this.usersService.login(body.username, body.password);
    }
}
