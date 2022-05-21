import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthGuard, KeycloakConnectModule, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { LocationsModule } from './locations/locations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReservationsModule } from './reservations/reservations.module';
import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;
console.log(env);

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    KeycloakConnectModule.register({
      authServerUrl: `http://localhost:${env.KEYCLOAK_PORT}`,
      realm: 'Warbnb',
      clientId: env.KEYCLOAK_CLIENT_ID,
      secret: env.KEYCLOAK_SECRET,
    }),
    LocationsModule,
    ReservationsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ResourceGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
