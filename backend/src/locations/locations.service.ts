import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location, LocationDocument } from './location.schema';
import * as mongoose from 'mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateLocationDTO, LocationFilterDTO } from './dtos';
import { Channel, connect } from 'amqplib';
import { ReservationDTO } from '../reservations/dtos';

export const LOCATIONS_SERVICE = Symbol('LocationsService');

@Injectable()
export class LocationsService {
  private channel: Channel;

  constructor(@InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>) {}

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
      query[key] = locationFilterDTO[key];
    }

    return query;
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
    return await this.locationModel.find({ userId: ownerId }).exec();
  }

  async reserveLocation() {
    // get message data from request
    const message: ReservationDTO = {
      hostId: 'dummyUserId',
      refugeeId: 'dummyrefugeeid',
      locationId: '628693fca3c429d300be07bc',
      fromTimestamp: Date.now(),
      toTimestamp: Date.now(),
    };
    const data = Buffer.from(JSON.stringify(message));

    this.channel.sendToQueue('reservations_queue', data);

    await this.locationModel.updateOne(
      { _id: new mongoose.Types.ObjectId('628693fca3c429d300be07bc') },
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
    return {};
  }
}
