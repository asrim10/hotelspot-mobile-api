import { HotelType } from "../types/hotel.types";

import mongoose, { Document, Schema } from "mongoose";

const HotelSchema: Schema = new Schema<HotelType>(
  {
    hotelName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    rating: { type: Number, required: false },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    availableRooms: { type: Number, required: true },
    imageUrl: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);
export interface IHotel extends HotelType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const HotelModel = mongoose.model<IHotel>("Hotel", HotelSchema);
