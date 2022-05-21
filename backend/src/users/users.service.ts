import {BadRequestException, HttpStatus, Injectable} from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User, UserDocument} from './users.schema';
import {CreateUserDTO, UpdateUserDTO} from './dtos';
import jwt_decode from 'jwt-decode';

export const USERS_SERVICE = Symbol('UsersService');


const env = dotenv.config().parsed;

@Injectable()
export class UsersService {
    async getUser(userId: string) {
        // return  Promise.resolve(undefined);
    }

    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    }

    async createUser(createUser: CreateUserDTO): Promise<User> {
        const doc = new this.userModel(createUser);
        return await doc.save();
    }

    async register(body: CreateUserDTO, adminToken: string, roleIDs) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`,
                },
            };

            if (adminToken) {
                const users_url = `http://localhost:${env.KEYCLOAK_PORT}/auth/admin/realms/Warbnb/users`;
                const data = {
                    username: body.email,
                    enabled: true,
                    credentials: [
                        {
                            type: 'password',
                            value: body.password,
                            temporary: false,
                        },
                    ],
                };

                let res = await axios.post(users_url, data, config);

                if (res.status === HttpStatus.CREATED) {
                    const userRoleURL = res.headers.location + '/role-mappings/realm';
                    const roles = roleIDs.filter(role => role.name === `app_${body.role}`);

                    await axios.post(userRoleURL, roles, config);

                    await this.createUser(body);
                    return await this.login(body.email, body.password);
                }
            }
        } catch (e) {
            throw new BadRequestException('Invalid user!');
        }
    }

    async updateUser(id: string, updateUser: UpdateUserDTO) {
        try {
            return await this.userModel.findOneAndUpdate({_id: id}, updateUser, {upsert: true});
        } catch (e) {
            return e;
        }
    }

    async login(username: string, password: string) {
        const url = `http://localhost:${env.KEYCLOAK_PORT}/auth/realms/Warbnb/protocol/openid-connect/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', username);
        params.append('password', password);
        params.append('client_id', env.KEYCLOAK_CLIENT_ID);
        params.append('client_secret', env.KEYCLOAK_SECRET);

        try {
            const response = await axios.post(url, params, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            });

            if (response.status === 200) {
                // @ts-ignore
                const {preferred_username} = jwt_decode(response.data.access_token);
                const user = await this.userModel.findOne({email: preferred_username});

                if (user) {
                    return {token: response.data.access_token, user_id: user._id};
                }

                return {token: response.data.access_token}
            }
        } catch (e) {
            throw new BadRequestException('Invalid user!');
        }
    }
}
