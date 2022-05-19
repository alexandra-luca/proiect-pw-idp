import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Reservation {
  @Prop({ required: true, type: String })
  hostId: string;

  @Prop({ required: true, type: String })
  refugeeId: string;

  @Prop({ required: true, type: String })
  locationId: string;

  @Prop({ required: true, type: Number })
  fromTimestamp: number;

  @Prop({ required: true, type: Number })
  toTimestamp: number;
}

export type ReservationDocument = Reservation & Document;
export const ReservationSchema = SchemaFactory.createForClass(Reservation);
