import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema({_id: false})
export class LocationAvailability {
  @Prop({required: true, type: Number})
  fromTimestamp: number;

  @Prop({required: true, type: Number})
  toTimestamp: number;
}

@Schema({_id: false})
export class GeoLocation {
  @Prop({required: true, type: String})
  latitude: string;

  @Prop({required: true, type: String})
  longitude: string;
}

@Schema({_id: false})
export class ReservationTimeFrame {
  @Prop({required: true, type: Number})
  fromTimestamp: number;

  @Prop({required: true, type: Number})
  toTimestamp: number;
}

@Schema()
export class Location {
  @Prop({required: true, type: String})
  userId: string;

  @Prop({required: true, type: String})
  address: string;

  @Prop({required: true, type: Object})
  geolocation: GeoLocation;

  @Prop({required: true, type: Number})
  roomsNumber: number;

  @Prop({required: true, type: Number})
  totalAreaSquaredMeters: number;

  @Prop({required: true, type: Number})
  guestsNumber: number;

  @Prop({required: true, type: Object})
  availability: LocationAvailability;

  @Prop({required: true, type: Boolean})
  reserved: boolean;

  @Prop({required: false, type: Object})
  reservationTimeframe?: ReservationTimeFrame;
}

export type LocationDocument = Location & Document;
export const LocationSchema = SchemaFactory.createForClass(Location);
