import { HotelModel, IHotel } from "../models/hotel.model";
import { Types } from "mongoose";

export interface IHotelRepository {
  createHotel(hotelData: Partial<IHotel>): Promise<IHotel>;
  getHotelById(id: string): Promise<IHotel | null>;
  getAllHotels(): Promise<IHotel[]>;
  searchHotels(searchTerm: string): Promise<IHotel[]>;
  getAvailableHotels(minRooms: number): Promise<IHotel[]>;
  updateHotel(id: string, updateData: Partial<IHotel>): Promise<IHotel | null>;
  deleteHotelById(id: string): Promise<boolean>;
}

export class HotelRepository implements IHotelRepository {
  async createHotel(hotelData: Partial<IHotel>): Promise<IHotel> {
    const hotel = new HotelModel(hotelData);
    return await hotel.save();
  }

  async getHotelById(id: string): Promise<IHotel | null> {
    // Validate ObjectId format before querying
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await HotelModel.findById(id).lean().exec();
  }

  async getAllHotels(): Promise<IHotel[]> {
    // Consider adding pagination parameters
    return await HotelModel.find().lean().exec();
  }

  async searchHotels(searchTerm: string): Promise<IHotel[]> {
    // Escape special regex characters to prevent regex injection
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Consider searching multiple fields
    return await HotelModel.find({
      $or: [
        { hotelName: { $regex: escapedTerm, $options: "i" } },
        { city: { $regex: escapedTerm, $options: "i" } },
        { address: { $regex: escapedTerm, $options: "i" } },
      ],
    })
      .lean()
      .exec();
  }

  async getAvailableHotels(minRooms: number): Promise<IHotel[]> {
    // Add validation
    if (minRooms < 0) {
      throw new Error("Minimum rooms cannot be negative");
    }

    return await HotelModel.find({
      availableRooms: { $gte: minRooms },
    })
      .lean()
      .exec();
  }

  async updateHotel(
    id: string,
    updateData: Partial<IHotel>,
  ): Promise<IHotel | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return await HotelModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // Run schema validators on update
    })
      .lean()
      .exec();
  }

  async deleteHotelById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await HotelModel.findByIdAndDelete(id).exec();
    return !!result; // More concise boolean conversion
  }
}
