import {Body, Controller, Get, Inject, OnModuleInit, Param, Post,} from '@nestjs/common';
import {USERS_SERVICE, UsersService} from './users.service';
import {Roles, Unprotected} from 'nest-keycloak-connect';
import {CreateUserDTO, LoginDTO, UpdateUserDTO} from './dtos';
import axios from 'axios';
import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;

@Controller('users')
export class UsersController implements OnModuleInit {
    private roleIDs: any;
    private adminToken: string;

    constructor(@Inject(USERS_SERVICE) private readonly usersService: UsersService) {
    }

    @Post('/register')
    @Unprotected()
    async register(@Body() body: CreateUserDTO) {
        return await this.usersService.register(body, this.adminToken, this.roleIDs);
    }

    @Post('/login')
    @Unprotected()
    async login(@Body() body: LoginDTO) {
        return await this.usersService.login(body.email, body.password);
    }

    @Get(':id')
    @Roles({roles: ['host']})
    async getUser(@Param('id') id: string) {
        return await this.usersService.getUser(id);
    }

    @Post(':id')
    @Roles({roles: ['host', 'refugee']})
    async updateUser(@Param('id') id: string, @Body() body: UpdateUserDTO) {
        return await this.usersService.updateUser(id, body);
    }

    async onModuleInit(): Promise<void> {
        try {
            const response = await this.usersService.login(env.KEYCLOAK_ADMIN_USERNAME, env.KEYCLOAK_ADMIN_PASSWORD);
            this.adminToken = response.token;

            const res = await axios.get(`http://localhost:${env.KEYCLOAK_PORT}/auth/admin/realms/Warbnb/roles`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.adminToken}`,
                },
            });

            this.roleIDs = res.data;
        } catch (e) {
            console.log(e);
        }
    }
}
