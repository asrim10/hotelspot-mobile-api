import z from "zod";
import { HotelSchema } from "../types/hotel.types";

export const CreateHotelDTO = HotelSchema.pick({
  hotelname: true,
  address: true,
  city: true,
  country: true,
  rating: true,
  description: true,
  price: true,
  availableRooms: true,
  imageUrl: true,
});

export type CreateHotelDTO = z.infer<typeof CreateHotelDTO>;

export const UpdateHotelDTO = HotelSchema.pick({
  hotelname: true,
  address: true,
  city: true,
  country: true,
  rating: true,
  description: true,
  price: true,
  availableRooms: true,
  imageUrl: true,
}).partial();

export type UpdateHotelDTO = z.infer<typeof UpdateHotelDTO>;

export const DeleteHotelDTO = z.object({
  id: z.string().uuid(),
});

export type DeleteHotelDTO = z.infer<typeof DeleteHotelDTO>;
