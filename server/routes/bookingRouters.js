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

const bookingRouter = express.Router();

bookingRouter.get("/verify", verifyBooking);
bookingRouter.get("/summary/:bookingId", getBookingSummary);
bookingRouter.get("/:bookingId", getBookingById);
bookingRouter.get("/user/:userId", getUserBookings);
bookingRouter.get("/user/:userId/active", getActiveBookings);
bookingRouter.get("/user/:userId/past", getPastBookings);
bookingRouter.post("/", createBooking);

bookingRouter.put("/:bookingId", updateBooking);
bookingRouter.put("/:bookingId/payment", updatePaymentStatus);

bookingRouter.delete("/:bookingId", cancelBooking);

export default bookingRouter;
