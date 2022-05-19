import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, connect, ConsumeMessage } from 'amqplib';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './reservation.schema';
import { Model } from 'mongoose';
import { ReservationDTO } from './dtos';

@Injectable()
export class ReservationsService implements OnModuleInit {
  private channel: Channel;

  constructor(@InjectModel(Reservation.name) private readonly reservationModel: Model<ReservationDocument>) {}

  async onModuleInit(): Promise<void> {
    const connection = await connect('amqp://guest:guest@localhost:5672');
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('reservations_queue');
    await this.consumeFromQueue();
  }

  private async consumeFromQueue() {
    await this.channel.consume('reservations_queue', async (message: ConsumeMessage) => {
      await this.handleMessage(message);
      this.channel.ack(message);
    });
  }

  private async handleMessage(message: ConsumeMessage) {
    if (message === null) {
      console.log(`Message NULL received -> queue deleted from server. Closing application`);
      process.emit('SIGTERM', 'SIGTERM');
    }

    const stringContent = message.content.toString();
    const reservationData: ReservationDTO = JSON.parse(stringContent);
    await this.saveReservation(reservationData);
    await this.sendMailToUsers(reservationData);
  }

  private async saveReservation(reservationData: ReservationDTO) {
    const doc = new this.reservationModel(reservationData);
    return await doc.save();
  }

  private async sendMailToUsers(reservationData: ReservationDTO) {
    //TODO
  }
}
