import { Request, Response, NextFunction } from "express";
import z from "zod";
import { HotelService } from "../services/hotel.service";
import { HttpError } from "../errors/http-error";
import { CreateHotelDTO, UpdateHotelDTO } from "../dtos/hotel.dto";

export class HotelController {
  private hotelService: HotelService;

  constructor() {
    this.hotelService = new HotelService();
  }

  /**
   * GET /api/hotels
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
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
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
   */
  getHotelById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpError(400, "Hotel ID is required");
      }

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
   */
  createHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const hotelPayload = {
        ...req.body,
        imageUrl: req.file ? `/uploads/images/${req.file.filename}` : undefined,
      };

      // Validate using Zod schema
      const validatedData = CreateHotelDTO.parse(hotelPayload);

      const hotel = await this.hotelService.createHotel(validatedData);

      res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: hotel,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, error.issues[0].message));
      } else {
        next(error);
      }
    }
  };

  /**
   * PUT /api/hotels/:id
   */
  updateHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpError(400, "Hotel ID is required");
      }

      const hotelPayload = {
        ...req.body,
        ...(req.file && {
          imageUrl: `/uploads/images/${req.file.filename}`,
        }),
      };

      // Validate using Zod schema
      const validatedData = UpdateHotelDTO.parse(hotelPayload);

      const hotel = await this.hotelService.updateHotel(id, validatedData);

      res.status(200).json({
        success: true,
        message: "Hotel updated successfully",
        data: hotel,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, error.issues[0].message));
      } else {
        next(error);
      }
    }
  };

  /**
   * PATCH /api/hotels/:id/image
   */
  updateHotelImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpError(400, "Hotel ID is required");
      }

      if (!req.file) {
        throw new HttpError(400, "No image file provided");
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

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
   */
  deleteHotel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpError(400, "Hotel ID is required");
      }

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
   */
  searchHotels = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { searchTerm } = req.params;

      if (!searchTerm) {
        throw new HttpError(400, "Search term is required");
      }

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
   * GET /api/hotels/available/:minRooms
   */
  getAvailableHotels = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const minRooms = req.params.minRooms ? Number(req.params.minRooms) : 1;

      if (minRooms < 1) {
        throw new HttpError(400, "Minimum rooms must be greater than 0");
      }

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
   */
  updateAvailableRooms = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { roomsToDeduct } = req.body;

      if (!id) {
        throw new HttpError(400, "Hotel ID is required");
      }

      const roomsSchema = z.object({
        roomsToDeduct: z.coerce
          .number()
          .positive("Rooms to deduct must be a positive number"),
      });

      const validatedRooms = roomsSchema.parse({ roomsToDeduct });

      const hotel = await this.hotelService.updateAvailableRooms(
        id,
        validatedRooms.roomsToDeduct,
      );

      res.status(200).json({
        success: true,
        message: "Available rooms updated successfully",
        data: hotel,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, error.issues[0].message));
      } else {
        next(error);
      }
    }
  };
}
