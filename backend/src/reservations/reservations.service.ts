import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, connect, ConsumeMessage } from 'amqplib';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './reservation.schema';
import mongoose, { Model } from 'mongoose';
import { ReservationDTO } from './dtos';
import { createTestAccount, createTransport, SentMessageInfo, TestAccount, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Location, LocationDocument } from '../locations/location.schema';
import { User, UserDocument } from '../users/users.schema';

const sprintf = require('sprintf-js').sprintf;

@Injectable()
export class ReservationsService implements OnModuleInit {
  private channel: Channel;
  private account: TestAccount;
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private refugeeMailTemplate: string;
  private hostMailTemplate: string;
  private sender: string;

  constructor(
    @InjectModel(Reservation.name) private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Location.name) private readonly locationModel: Model<LocationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initRabbitMq();
    await this.initMailer();
    await this.initMailTemplates();
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
    const refugeeData = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(reservationData.refugeeId) });
    const locationData = await this.locationModel.findOne({
      _id: new mongoose.Types.ObjectId(reservationData.locationId),
    });
    const hostdata = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(locationData.userId) });

    await this.sendMailToHost(hostdata, refugeeData, locationData, reservationData);
    await this.sendMailToRefugee(hostdata, refugeeData, locationData, reservationData);
  }

  private async initRabbitMq(): Promise<void> {
    const connection = await connect('amqp://guest:guest@localhost:5672');
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('reservations_queue');
    await this.consumeFromQueue();
  }

  private async initMailer(): Promise<void> {
    this.account = await createTestAccount();
    this.transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'armando.konopelski87@ethereal.email',
        pass: 'UKUpzzABDkEMXEFyKk',
      },
    });
    this.sender = 'noreply@reservations.warbnb.com';
  }

  private async initMailTemplates() {
    this.refugeeMailTemplate = `<b> Hello %s</b> 
        <br> Your request for location %s from %s between %s and %s has been successfully registered in our systems. Please contact  %s or %s for more information.`;
    this.hostMailTemplate = `<b> Hello %s</b> 
        <br> Your location %s has been successfully renter between %s and %s to %s. Please contact %s or %s for more information.`;
  }

  private async sendMailToHost(hostdata, refugeedata, locationData, reservationData: ReservationDTO) {
    const startDate = new Date(reservationData.fromTimestamp).toISOString();
    const endDate = new Date(reservationData.toTimestamp).toISOString();
    const messasge = sprintf(
      this.hostMailTemplate,
      hostdata.fullName,
      locationData.address,
      startDate,
      endDate,
      refugeedata.fullName,
      refugeedata.email,
      refugeedata.phoneNumber
    );

    return await this.sendMail(hostdata.email, 'Location reserved', messasge);
  }

  private async sendMailToRefugee(hostdata, refugeedata, locationData, reservationData: ReservationDTO) {
    const startDate = new Date(reservationData.fromTimestamp).toISOString();
    const endDate = new Date(reservationData.toTimestamp).toISOString();
    const message = sprintf(
      this.refugeeMailTemplate,
      refugeedata.fullName,
      locationData.address,
      hostdata.fullName,
      startDate,
      endDate,
      hostdata.email,
      hostdata.phoneNumber
    );

    return await this.sendMail(refugeedata.email, 'Location reserved', message);
  }

  private async sendMail(destination, subject, message): Promise<SentMessageInfo> {
    return await this.transporter.sendMail({
      from: this.sender,
      to: destination,
      subject: subject,
      html: message,
    });
  }
}
