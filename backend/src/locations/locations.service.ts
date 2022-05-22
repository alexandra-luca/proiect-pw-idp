import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Location, LocationDocument} from './location.schema';
import * as mongoose from 'mongoose';
import {FilterQuery, Model} from 'mongoose';
import {CreateLocationDTO, LocationFilterDTO, UpdateLocationDTO} from './dtos';
import {Channel, connect} from 'amqplib';
import {ReservationDTO} from '../reservations/dtos';
import {User, UserDocument} from '../users/users.schema';

export const LOCATIONS_SERVICE = Symbol('LocationsService');

@Injectable()
export class LocationsService {
    private channel: Channel;

    constructor(
        @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {
    }

    async onModuleInit(): Promise<void> {
        const connection = await connect('amqp://guest:guest@localhost:5672');
        this.channel = await connection.createChannel();
        await this.channel.assertQueue('reservations_queue');
    }

    private static buildQuery(locationFilterDTO: LocationFilterDTO): FilterQuery<Location> {
        const query: FilterQuery<Location> = {};

        for (const key in locationFilterDTO) {
            if (!locationFilterDTO.hasOwnProperty(key)) {
                continue;
            }
            if (key === "fromTimestamp") {
                query["availability.fromTimestamp"] = {
                    $lte: +locationFilterDTO[key]
                }
                continue;
            }
            if (key === "toTimestamp") {
                query["availability.toTimestamp"] = {
                    $gte: +locationFilterDTO[key]
                }
                continue;
            }
            if (key === "city") {
                query[key] = {
                    $regex: locationFilterDTO[key],
                    $options: 'i'
                }
                continue;
            }
            query[key] = locationFilterDTO[key];
        }

        return query;
    }

    async create(createLocationDTO: CreateLocationDTO): Promise<Location> {
        try {
            const doc = new this.locationModel(createLocationDTO);
            await doc.save();

            await this.userModel.findOneAndUpdate(
                {_id: new mongoose.Types.ObjectId(createLocationDTO.userId)},
                {$push: {locations: doc._id}}
            );
            return doc;
        } catch (e) {
            throw new BadRequestException('Invalid request!');
        }
    }

    async updateLocation(id: string, updateLocationDTO: UpdateLocationDTO) {
        try {
            await this.locationModel.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)}, updateLocationDTO);
            return await this.locationModel.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)});
        } catch (e) {
            throw new BadRequestException('Invalid request!');
        }
    }

    async deleteLocation(id: string) {
        try {
            await this.locationModel.findByIdAndDelete(new mongoose.Types.ObjectId(id));
            return {'status': 'deleted'};
        } catch (e) {
            throw new BadRequestException('Invalid request!');
        }
    }

    async findAll(locationFilterDTO: LocationFilterDTO): Promise<Array<Location>> {
        const query = LocationsService.buildQuery(locationFilterDTO);
        console.log(JSON.stringify(query, null, 2));
        return await this.locationModel.find(query).exec();
    }

    async findOne(locationFilterDTO: LocationFilterDTO): Promise<Location> {
        const query = LocationsService.buildQuery(locationFilterDTO);
        return await this.locationModel.findOne(query).exec();
    }

    async reserveLocation(body: ReservationDTO) {
        // get message data from request
        const message: ReservationDTO = body;
        const data = Buffer.from(JSON.stringify(message));

        this.channel.sendToQueue('reservations_queue', data);

        return this.locationModel.updateOne(
            {_id: new mongoose.Types.ObjectId(body.locationId)},
            {
                $set: {
                    reserved: true,
                    reservationTimeframe: {
                        fromTimestamp: message.fromTimestamp,
                        toTimestamp: message.toTimestamp,
                    },
                },
            }
        );
    }
}
