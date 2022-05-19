import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from "mongoose";

@Schema()
export class User {
    @Prop({required: true, type: String, enum: ['host', 'refugee']})
    role: string;

    @Prop({required: true, type: String})
    email: string;

    @Prop({required: true, type: String})
    fullName: string;

    @Prop({required: false, type: String})
    phoneNumber: string;

    @Prop({required: false, type: [String]})
    locations: [string];
}


export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);