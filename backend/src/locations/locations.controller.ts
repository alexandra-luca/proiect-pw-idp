import {Body, Controller, Get, Inject, Post, Query} from '@nestjs/common';
import {Location} from './location.schema';
import {LOCATIONS_SERVICE, LocationsService} from './locations.service';
import {Unprotected} from 'nest-keycloak-connect';
import {CreateLocationDTO, LocationFilterDTO} from './dtos';

@Controller('locations')
export class LocationsController {
  constructor(@Inject(LOCATIONS_SERVICE) private readonly locationsService: LocationsService) {
  }

  @Post()
  @Unprotected() //TODO: change when authorization done
  async createLocation(@Body() createLocationDTO: CreateLocationDTO): Promise<Location> {
    return await this.locationsService.create(createLocationDTO);
  }

  @Get()
  @Unprotected()
  async getDocuments(@Query() query: LocationFilterDTO) {
    console.log(JSON.stringify(query, null, 2));
    return this.locationsService.findAll(query);
  }
}
