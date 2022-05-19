import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    OnModuleInit,
    Param,
    Post
} from '@nestjs/common';
import {USERS_SERVICE, UsersService} from "./users.service";
import {Roles, Unprotected} from "nest-keycloak-connect";
import {CreateUserDTO, LoginDTO, UpdateUserDTO} from "./dtos";
import axios from 'axios';
import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;


@Controller('users')
export class UsersController implements OnModuleInit {
    private roleIDs: any;
    private adminToken: string;

  constructor(@Inject(USERS_SERVICE) private readonly usersService: UsersService) {}

    @Post('/register')
    @Unprotected()
    async register(@Body() body: CreateUserDTO) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.adminToken}`
                }
            };

            if (this.adminToken) {
                const users_url = `http://localhost:${env.KEYCLOAK_PORT}/admin/realms/Warbnb/users`;
                const data = {
                    username: body.email,
                    enabled: true,
                    credentials: [{
                        type: 'password',
                        value: body.password,
                        temporary: false
                    }]
                };

                let res = await axios.post(users_url, data, config);

                if (res.status === HttpStatus.CREATED) {
                    const userRoleURL = res.headers.location + '/role-mappings/realm';
                    const roles = this.roleIDs.filter(role => role.name === `app_${body.role}`);

                    res = await axios.post(userRoleURL, roles, config);

                    await this.usersService.createUser(body);
                    return await this.usersService.login(body.email, body.password);
                }
            }
        } catch (e) {
            throw new BadRequestException('Invalid user!');
        }
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
        const response = await this.usersService.login(env.KEYCLOAK_ADMIN_USERNAME, env.KEYCLOAK_ADMIN_PASSWORD);
        this.adminToken = response.token

        const res = await axios.get(`http://localhost:${env.KEYCLOAK_PORT}/admin/realms/Warbnb/roles`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.adminToken}`
                }
            });

        this.roleIDs = res.data;
    }
}
