import { Router } from "express";
import { HotelController } from "../controllers/hotel.controller";

const router = Router();
const hotelController = new HotelController();

/**
 * @route   GET /api/hotels
 * @desc    Get all hotels (with optional filters: city, country, minPrice, maxPrice, minRating)
 * @access  Public
 */
router.get("/", hotelController.getAllHotels);

/**
 * @route   GET /api/hotels/search/:searchTerm
 * @desc    Search hotels by name
 * @access  Public
 */
router.get("/search/:searchTerm", hotelController.searchHotels);

/**
 * @route   GET /api/hotels/available/:minRooms?
 * @desc    Get available hotels with minimum rooms
 * @access  Public
 */
router.get("/available/:minRooms?", hotelController.getAvailableHotels);

/**
 * @route   GET /api/hotels/:id
 * @desc    Get a single hotel by ID
 * @access  Public
 */
router.get("/:id", hotelController.getHotelById);

/**
 * @route   POST /api/hotels
 * @desc    Create a new hotel
 * @access  Private (add authentication middleware as needed)
 */
router.post("/", hotelController.createHotel);

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update a hotel
 * @access  Private (add authentication middleware as needed)
 */
router.put("/:id", hotelController.updateHotel);

/**
 * @route   PATCH /api/hotels/:id/rooms
 * @desc    Update available rooms
 * @access  Private (add authentication middleware as needed)
 */
router.patch("/:id/rooms", hotelController.updateAvailableRooms);

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete a hotel
 * @access  Private (add authentication middleware as needed)
 */
router.delete("/:id", hotelController.deleteHotel);

export default router;
