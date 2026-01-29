import { HotelModel, IHotel } from "../models/hotel.model";
import { CreateHotelDTO, UpdateHotelDTO } from "../dtos/hotel.dto";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

export class HotelService {
  /**
   * Get all hotels with optional filtering
   */
  async getAllHotels(filters?: {
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  }): Promise<IHotel[]> {
    const query: any = {};

    if (filters?.city) {
      query.city = { $regex: filters.city, $options: "i" };
    }
    if (filters?.country) {
      query.country = { $regex: filters.country, $options: "i" };
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }
    if (filters?.minRating !== undefined) {
      query.rating = { $gte: filters.minRating };
    }

    return await HotelModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get a single hotel by ID
   */
  async getHotelById(id: string): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const hotel = await HotelModel.findById(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }

    return hotel;
  }

  /**
   * Create a new hotel
   */
  async createHotel(hotelData: CreateHotelDTO): Promise<IHotel> {
    const hotel = new HotelModel(hotelData);
    return await hotel.save();
  }

  /**
   * Update an existing hotel
   */
  async updateHotel(id: string, hotelData: UpdateHotelDTO): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const hotel = await HotelModel.findByIdAndUpdate(
      id,
      { $set: hotelData },
      { new: true, runValidators: true },
    );

    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }

    return hotel;
  }

  /**
   * Delete a hotel
   */
  async deleteHotel(id: string): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const hotel = await HotelModel.findByIdAndDelete(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }

    return hotel;
  }

  /**
   * Search hotels by name
   */
  async searchHotelsByName(searchTerm: string): Promise<IHotel[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new HttpError(400, "Search term is required");
    }

    return await HotelModel.find({
      hotelname: { $regex: searchTerm, $options: "i" },
    });
  }

  /**
   * Get hotels by availability
   */
  async getAvailableHotels(minRooms: number = 1): Promise<IHotel[]> {
    if (minRooms < 0) {
      throw new HttpError(400, "Minimum rooms cannot be negative");
    }

    return await HotelModel.find({
      availableRooms: { $gte: minRooms },
    });
  }

  /**
   * Update available rooms (e.g., after booking)
   */
  async updateAvailableRooms(
    id: string,
    roomsToDeduct: number,
  ): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    if (roomsToDeduct < 1) {
      throw new HttpError(400, "Rooms to deduct must be at least 1");
    }

    const hotel = await HotelModel.findById(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }

    if (hotel.availableRooms < roomsToDeduct) {
      throw new HttpError(
        400,
        `Not enough available rooms. Only ${hotel.availableRooms} rooms available`,
      );
    }

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      { $inc: { availableRooms: -roomsToDeduct } },
      { new: true },
    );

    if (!updatedHotel) {
      throw new HttpError(500, "Failed to update hotel");
    }

    return updatedHotel;
  }
}
