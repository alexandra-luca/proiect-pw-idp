import {Module} from '@nestjs/common';
import {LOCATIONS_SERVICE, LocationsService} from './locations.service';
import {LocationsController} from './locations.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Location, LocationSchema} from "./location.schema";

@Module({
    imports: [MongooseModule.forFeature([{name: Location.name, schema: LocationSchema}])],
    providers: [LocationsService, {
        provide: LOCATIONS_SERVICE,
        useClass: LocationsService
    }],
    controllers: [LocationsController]
})
export class LocationsModule {
}
