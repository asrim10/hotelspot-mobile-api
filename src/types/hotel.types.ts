import z from "zod";

export const HotelSchema = z.object({
  hotelName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  rating: z.number().min(0).max(5).optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  availableRooms: z.number().min(0),
  imageUrl: z.string().optional(),
});

export type HotelType = z.infer<typeof HotelSchema>;
