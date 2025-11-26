import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
  refundPayment,
  getPaymentStatus,
  webhookHandler,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

paymentRoutes.post("/create-payment-intent", createPaymentIntent);
paymentRoutes.post("/confirm-payment", confirmPayment);
paymentRoutes.post("/cancel/:bookingId", cancelPayment);
paymentRoutes.post("/refund/:bookingId", refundPayment);
paymentRoutes.get("/status/:paymentIntentId", getPaymentStatus);

export default paymentRoutes;
