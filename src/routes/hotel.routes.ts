import { Router } from "express";
import { HotelController } from "../controllers/hotel.controller";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const hotelController = new HotelController();

// Upload middleware instances for different file types
const uploadImage = uploads;
const uploadVideo = uploads;

router.get("/", hotelController.getAllHotels);
router.get("/search/:searchTerm", hotelController.searchHotels);
router.get("/available/:minRooms", hotelController.getAvailableHotels);
router.get("/:id", hotelController.getHotelById);
router.post("/", uploads.single("image"), hotelController.createHotel);
router.put("/:id", uploads.single("image"), hotelController.updateHotel);
router.patch(
  "/:id/image",
  uploads.single("image"),
  hotelController.updateHotelImage,
);
router.patch("/:id/rooms", hotelController.updateAvailableRooms);
router.post(
  "/upload-photo",
  uploadImage.single("itemPhoto"),
  hotelController.uploadHotelPhoto,
);
router.post(
  "/upload-video",
  uploadVideo.single("itemVideo"),
  hotelController.uploadHotelVideo,
);
router.delete("/:id", hotelController.deleteHotel);

export default router;
