import {BadRequestException, Injectable} from '@nestjs/common';
import axios from "axios";
import * as dotenv from "dotenv";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "./users.schema";
import {CreateUserDTO, UpdateUserDTO} from "./dtos";

export const USERS_SERVICE = Symbol('UsersService');

const env = dotenv.config().parsed;

@Injectable()
export class UsersService {
  async getUser(userId: string) {
    // return  Promise.resolve(undefined);
  }constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    }

    async createUser(createUser: CreateUserDTO): Promise<User> {
        const doc = new this.userModel(createUser);
        return await doc.save();
    }

    async updateUser(id: string, updateUser: UpdateUserDTO) {
        try {
            return await this.userModel.findOneAndUpdate({'_id': id}, updateUser, {upsert: true});
        } catch (e) {
            return e;
        }
    }

    async login(username: string, password: string) {
        const url = `http://localhost:${env.KEYCLOAK_PORT}/realms/Warbnb/protocol/openid-connect/token`
        const params = new URLSearchParams()
        params.append('grant_type', 'password');
        params.append('username', username);
        params.append('password', password);
        params.append('client_id', env.KEYCLOAK_CLIENT_ID);
        params.append('client_secret', env.KEYCLOAK_SECRET);

        try {
            const response = await
                axios.post(url, params, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});

            if (response.status === 200) {
                return {token: response.data.access_token}
            }
        } catch (e) {
            throw new BadRequestException('Invalid user!');
        }
    }
}
