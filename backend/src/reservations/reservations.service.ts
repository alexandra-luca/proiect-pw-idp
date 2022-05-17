import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {Channel, connect} from "amqplib";

@Injectable()
export class ReservationsService  implements OnModuleInit {
    private channel: Channel;

    async onModuleInit(): Promise<void> {
        const connection = await connect("amqp://guest:guest@localhost:5672");
        this.channel = await connection.createChannel();
        await this.channel.assertQueue('reservations_queue');
    }



}
