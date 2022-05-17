import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UsersModule} from './users/users.module';
import {KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard} from "nest-keycloak-connect";
import {APP_GUARD} from "@nestjs/core";
import {LocationsModule} from './locations/locations.module';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as dotenv from 'dotenv';
import {ReservationsModule} from "./reservations/reservations.module";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot(),
        UsersModule,
        KeycloakConnectModule.register({
            authServerUrl: 'http://localhost:8080',
            realm: 'Warbnb',
            clientId: 'warbnb-backend-nest',
            secret: 'PF5JfUfuzywzMxSJPgViFR3HcBlEgFDY',
            // Secret key of the client taken from keycloak server
        }),
        LocationsModule,
        ReservationsModule,
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
                useNewUrlParser: true,
                useUnifiedTopology: true
            }), inject: [ConfigService]
        })
    ],
    controllers: [AppController],
    providers: [AppService,
        {provide: APP_GUARD, useClass: AuthGuard},
        {provide: APP_GUARD, useClass: ResourceGuard},
        {provide: APP_GUARD, useClass: RoleGuard}
    ],
})
export class AppModule {
}
