import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Location, LocationDocument} from "./location.schema";
import {FilterQuery, Model} from "mongoose";
import {CreateLocationDTO, LocationFilterDTO} from "./dtos";

export const LOCATIONS_SERVICE = Symbol('LocationsService');


@Injectable()
export class LocationsService {
    private static buildQuery(locationFilterDTO: LocationFilterDTO): FilterQuery<Location> {
        const query: FilterQuery<Location> = {};

        for (const key in locationFilterDTO) {
            if (!locationFilterDTO.hasOwnProperty(key)) {
                continue;
            }
            query[key] = locationFilterDTO[key];
        }

        return query;
    }

    constructor(@InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>) {
    }

    async create(createLocationDTO: CreateLocationDTO): Promise<Location> {
        const doc = new this.locationModel(createLocationDTO);
        return await doc.save();
    }

    async findAll(locationFilterDTO: LocationFilterDTO): Promise<Array<Location>> {
        const query = LocationsService.buildQuery(locationFilterDTO);
        console.log(query);
        return await this.locationModel.find(query).exec();
    }

    async findOne(locationFilterDTO: LocationFilterDTO): Promise<Location> {
        const query = LocationsService.buildQuery(locationFilterDTO);
        return await this.locationModel.findOne(query).exec();
    }

    async findByOwnerId(ownerId: string): Promise<Array<Location>> {
        return await this.locationModel.find({userId: ownerId}).exec();
    }

}