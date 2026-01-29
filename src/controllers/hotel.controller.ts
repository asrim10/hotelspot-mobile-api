import { Request, Response, NextFunction } from "express";
import { HotelService } from "../services/hotel.service";
import { CreateHotelDTO, UpdateHotelDTO } from "../dtos/hotel.dto";
import { HttpError } from "../errors/http-error";
import { ZodError } from "zod";

export class HotelController {
  private hotelService: HotelService;

  constructor() {
    this.hotelService = new HotelService();
  }

  /**
   * GET /api/hotels
   * Get all hotels with optional filters
   */
  getAllHotels = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { city, country, minPrice, maxPrice, minRating } = req.query;

      const filters = {
        city: city as string,
        country: country as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
      };

      const hotels = await this.hotelService.getAllHotels(filters);

      res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/hotels/:id
   * Get a single hotel by ID
   */
  getHotelById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const hotel = await this.hotelService.getHotelById(id);

      res.status(200).json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/hotels
   * Create a new hotel with optional image upload
   */
  createHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Add image URL if file was uploaded
      const hotelData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      };

      const validatedData = CreateHotelDTO.parse(hotelData);
      const hotel = await this.hotelService.createHotel(validatedData);

      res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: hotel,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(400, "Validation error"));
        return;
      }
      next(error);
    }
  };

  /**
   * PUT /api/hotels/:id
   * Update an existing hotel with optional image upload
   */
  updateHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Add image URL if file was uploaded
      const hotelData = {
        ...req.body,
        ...(req.file && { imageUrl: `/uploads/${req.file.filename}` }),
      };

      const validatedData = UpdateHotelDTO.parse(hotelData);

      const hotel = await this.hotelService.updateHotel(id, validatedData);

      res.status(200).json({
        success: true,
        message: "Hotel updated successfully",
        data: hotel,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(400, "Validation error"));
        return;
      }
      next(error);
    }
  };

  /**
   * PATCH /api/hotels/:id/image
   * Update hotel image only
   */
  updateHotelImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        throw new HttpError(400, "No image file provided");
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const hotel = await this.hotelService.updateHotel(id, { imageUrl });

      res.status(200).json({
        success: true,
        message: "Hotel image updated successfully",
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/hotels/:id
   * Delete a hotel
   */
  deleteHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const hotel = await this.hotelService.deleteHotel(id);

      res.status(200).json({
        success: true,
        message: "Hotel deleted successfully",
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/hotels/search/:searchTerm
   * Search hotels by name
   */
  searchHotels = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { searchTerm } = req.params;
      const hotels = await this.hotelService.searchHotelsByName(searchTerm);

      res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/hotels/available/:minRooms?
   * Get available hotels
   */
  getAvailableHotels = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const minRooms = req.params.minRooms ? parseInt(req.params.minRooms) : 1;
      const hotels = await this.hotelService.getAvailableHotels(minRooms);

      res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/hotels/:id/rooms
   * Update available rooms
   */
  updateAvailableRooms = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { roomsToDeduct } = req.body;

      if (!roomsToDeduct || roomsToDeduct < 1) {
        throw new HttpError(400, "Invalid number of rooms to deduct");
      }

      const hotel = await this.hotelService.updateAvailableRooms(
        id,
        roomsToDeduct,
      );

      res.status(200).json({
        success: true,
        message: "Available rooms updated successfully",
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  };
}
