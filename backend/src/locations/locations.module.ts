import { Module } from '@nestjs/common';
import { LOCATIONS_SERVICE, LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './location.schema';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    LocationsService,
    {
      provide: LOCATIONS_SERVICE,
      useClass: LocationsService,
    },
  ],
  controllers: [LocationsController],
})
export class LocationsModule {}
