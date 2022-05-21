import { Body, Controller, Get, Inject, Post, Query, Headers } from '@nestjs/common';
import { Location } from './location.schema';
import { LOCATIONS_SERVICE, LocationsService } from './locations.service';
import { Roles, Unprotected } from 'nest-keycloak-connect';
import { CreateLocationDTO, LocationFilterDTO } from './dtos';

@Controller('locations')
export class LocationsController {
  constructor(@Inject(LOCATIONS_SERVICE) private readonly locationsService: LocationsService) {}

  @Post()
  @Roles({ roles: ['host'] })
  async createLocation(@Body() body: CreateLocationDTO): Promise<Location> {
    return await this.locationsService.create(body);
  }

  @Get()
  @Unprotected()
  async getDocuments(@Query() query: LocationFilterDTO) {
    console.log(JSON.stringify(query, null, 2));
    return this.locationsService.findAll(query);
  }

  @Post('reserve')
  @Unprotected()
  async reserveLocation() {
    return await this.locationsService.reserveLocation();
  }
}
