import axios from "axios";
import { InitiatePaymentDtoType } from "../dtos/payment.dto";
import { PaymentRepository } from "../repositories/payment.repositories";
import { PaymentModel } from "../models/payment.model";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;
const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2";

const paymentRepo = new PaymentRepository();

export class PaymentService {
  async initiatePayment(payload: InitiatePaymentDtoType) {
    const { bookingId, totalPrice, fullName, email } = payload;

    try {
      const response = await axios.post(
        `${KHALTI_BASE_URL}/epayment/initiate/`,
        {
          return_url: `${process.env.CLIENT_URL}/user/booking/verify`,
          website_url: process.env.CLIENT_URL,
          amount: totalPrice * 100,
          purchase_order_id: bookingId,
          purchase_order_name: `Hotel Booking - ${bookingId}`,
          customer_info: { name: fullName, email },
        },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { pidx, payment_url } = response.data;
      await paymentRepo.savePidx(bookingId, pidx);
      return { pidx, payment_url };
    } catch (error: any) {
      console.error(" Khalti error status:", error?.response?.status);
      console.error(
        " Khalti error data:",
        JSON.stringify(error?.response?.data, null, 2),
      );
      throw new Error(
        JSON.stringify(error?.response?.data) || "Khalti initiation failed",
      );
    }
  }

  async verifyPayment(pidx: string) {
    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { status, transaction_id, total_amount } = response.data;

    console.log("Khalti lookup response:", response.data);

    if (status?.toLowerCase() === "completed") {
      const existingBooking = await paymentRepo.getByPidx(pidx);

      if (!existingBooking) {
        throw new Error("Booking not found for pidx: " + pidx);
      }

      const bookingId = existingBooking._id.toString();

      // ✅ Confirm payment
      const booking = await paymentRepo.confirmPayment(pidx, transaction_id);

      await PaymentModel.create({
        bookingId: bookingId, // ← from DB not from Khalti response
        pidx,
        transactionId: transaction_id,
        amount: total_amount / 100,
        status: "paid",
        paymentMethod: "online",
        khaltiResponse: response.data,
      });

      return {
        success: true,
        transactionId: transaction_id,
        bookingId: bookingId,
        amount: total_amount / 100,
        booking,
      };
    }

    await paymentRepo.failPayment(pidx);
    return { success: false, status };
  }
}
