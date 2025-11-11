import express from "express";
import {
  createBooking,
  getUserBookings,
  getActiveBookings,
  getPastBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  updatePaymentStatus,
  getBookingSummary,
  verifyBooking,
} from "../controllers/bookingController.js";

const bookingRoutes = express.Router();

bookingRoutes.get("/verify", verifyBooking);
bookingRoutes.get("/summary/:bookingId", getBookingSummary);
bookingRoutes.get("/:bookingId", getBookingById);
bookingRoutes.get("/user/:userId", getUserBookings);
bookingRoutes.get("/user/:userId/active", getActiveBookings);
bookingRoutes.get("/user/:userId/past", getPastBookings);
bookingRoutes.post("/", createBooking);

bookingRoutes.put("/:bookingId", updateBooking);
bookingRoutes.put("/:bookingId/payment", updatePaymentStatus);

bookingRoutes.delete("/:bookingId", cancelBooking);

export default bookingRoutes;
