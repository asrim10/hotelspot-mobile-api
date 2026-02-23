import { Request, Response, NextFunction } from "express";
import z from "zod";
import mongoose from "mongoose";

import { CreateHotelDTO, UpdateHotelDTO } from "../dtos/hotel.dto";
import { HotelService } from "../services/hotel.service";

let hotelService = new HotelService();

export class HotelController {
  async getAllHotels(req: Request, res: Response) {
    try {
      const { city, country, minPrice, maxPrice, minRating } = req.query;

      const filters = {
        city: city as string,
        country: country as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
      };

      const hotels = await hotelService.getAllHotels(filters);

      return res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async getHotelById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      const hotel = await hotelService.getHotelById(id);

      return res.status(200).json({
        success: true,
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async createHotel(req: Request, res: Response) {
    try {
      const parsedData = CreateHotelDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const hotel = await hotelService.createHotel(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async updateHotel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      const hotelPayload = {
        ...req.body,
        ...(req.file && {
          imageUrl: `/uploads/${req.file.filename}`,
        }),
      };

      const parsedData = UpdateHotelDTO.safeParse(hotelPayload);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const hotel = await hotelService.updateHotel(id, parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Hotel updated successfully",
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async updateHotelImage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      const hotel = await hotelService.updateHotel(id, { imageUrl });

      return res.status(200).json({
        success: true,
        message: "Hotel image updated successfully",
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async updateAvailableRooms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { roomsToDeduct } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      const roomsSchema = z.object({
        roomsToDeduct: z.coerce
          .number()
          .positive("Rooms to deduct must be a positive number"),
      });

      const parsedData = roomsSchema.safeParse({ roomsToDeduct });

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const hotel = await hotelService.updateAvailableRooms(
        id,
        parsedData.data.roomsToDeduct,
      );

      return res.status(200).json({
        success: true,
        message: "Available rooms updated successfully",
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async searchHotels(req: Request, res: Response) {
    try {
      const { searchTerm } = req.params;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const hotels = await hotelService.searchHotelsByName(searchTerm);

      return res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async getAvailableHotels(req: Request, res: Response) {
    try {
      const minRooms = req.params.minRooms ? Number(req.params.minRooms) : 1;

      if (minRooms < 1) {
        return res.status(400).json({
          success: false,
          message: "Minimum rooms must be greater than 0",
        });
      }

      const hotels = await hotelService.getAvailableHotels(minRooms);

      return res.status(200).json({
        success: true,
        count: hotels.length,
        data: hotels,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async uploadHotelPhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No photo file provided",
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: { imageUrl },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async uploadHotelVideo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file provided",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        data: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async deleteHotel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      const hotel = await hotelService.deleteHotel(id);

      return res.status(200).json({
        success: true,
        message: "Hotel deleted successfully",
        data: hotel,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }
}
