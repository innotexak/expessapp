import mongoose, { Schema, model } from "mongoose";

export interface IAccount {
    firstName: string
    lastName: string
    phone: string
    email: string
    emailVerifiedAt: Date
    password: string,
    role: 'USER' | 'SUPERADMIN' | 'STAFF'
    lastLogin: Date
    disabled: boolean
    otp: number
    avatar: string,
    channelUsed: "LOCAL" | "GOOGLE"

}


const Account: Schema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },

    channelUsed: {
        type: String,
        enum: ['LOCAL', 'GOOGLE'],
        default: 'LOCAL'
    },

    otp: {
        type: Number,
    },

    avatar: {
        type: String,
    },

    lastName: {
        type: String,
        trim: true,
        required: true
    },

    password: {
        type: String,
        trim: true,
    },

    phone: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        required: true
    },

    emailVerifiedAt: {
        type: Date
    },


    role: {
        type: String,
        enum: ['USER', 'SUPERADMIN', 'STAFF'],
        default: 'USER'
    },

    lastLogin: {
        type: Date,
    },

    disabled: {
        type: Boolean,
    }



}, { timestamps: true })


const AccountSchema = model<IAccount>('user', Account);

export default AccountSchema