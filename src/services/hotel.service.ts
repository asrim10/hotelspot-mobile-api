import { HotelModel, IHotel } from "../models/hotel.model";
import { CreateHotelDTO, UpdateHotelDTO } from "../dtos/hotel.dto";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";
import { geocodeAddress } from "../config/geocode";

export class HotelService {
  async getAllHotels(filters?: {
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  }): Promise<IHotel[]> {
    const query: any = {};

    if (filters?.city) query.city = { $regex: filters.city, $options: "i" };
    if (filters?.country)
      query.country = { $regex: filters.country, $options: "i" };
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

  async getHotelById(id: string): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const hotel = await HotelModel.findById(id);
    if (!hotel) throw new HttpError(404, "Hotel not found");

    return hotel;
  }

  async createHotel(hotelData: CreateHotelDTO): Promise<IHotel> {
    // Auto-geocode if coordinates not provided
    if (!hotelData.coordinates) {
      const coords = await geocodeAddress(
        hotelData.address,
        hotelData.city,
        hotelData.country,
      );
      if (coords) hotelData.coordinates = coords;
    }

    const hotel = new HotelModel(hotelData);
    return await hotel.save();
  }

  async updateHotel(id: string, hotelData: UpdateHotelDTO): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const locationChanged =
      hotelData.address || hotelData.city || hotelData.country;
    if (locationChanged && !hotelData.coordinates) {
      const existing = await HotelModel.findById(id);
      if (existing) {
        const coords = await geocodeAddress(
          hotelData.address ?? existing.address,
          hotelData.city ?? existing.city,
          hotelData.country ?? existing.country,
        );
        if (coords) hotelData.coordinates = coords;
      }
    }

    const hotel = await HotelModel.findByIdAndUpdate(
      id,
      { $set: hotelData },
      { new: true, runValidators: true },
    );

    if (!hotel) throw new HttpError(404, "Hotel not found");

    return hotel;
  }

  async deleteHotel(id: string): Promise<IHotel> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid hotel ID format");
    }

    const hotel = await HotelModel.findByIdAndDelete(id);
    if (!hotel) throw new HttpError(404, "Hotel not found");

    return hotel;
  }

  async searchHotelsByName(searchTerm: string): Promise<IHotel[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new HttpError(400, "Search term is required");
    }

    return await HotelModel.find({
      hotelName: { $regex: searchTerm, $options: "i" },
    });
  }

  async getAvailableHotels(minRooms: number = 1): Promise<IHotel[]> {
    if (minRooms < 0)
      throw new HttpError(400, "Minimum rooms cannot be negative");

    return await HotelModel.find({ availableRooms: { $gte: minRooms } });
  }

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
    if (!hotel) throw new HttpError(404, "Hotel not found");

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

    if (!updatedHotel) throw new HttpError(500, "Failed to update hotel");

    return updatedHotel;
  }
}
