import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import favourtieRoutes from "./routes/favourite.routes";
import hotelRoutes from "./routes/hotel.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";

import path from "path";
import { HttpError } from "./errors/http-error";
dotenv.config();

console.log(process.env.PORT);

const app: Application = express();

app.use(
  cors({
    origin: "*", // restrict to your domain in production
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/uploads", express.static("uploads"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/favourites", favourtieRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/review", reviewRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }
  return res
    .status(500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;
