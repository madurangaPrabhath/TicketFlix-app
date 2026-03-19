import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import AdminSettings from "../models/AdminSettings.js";
import { createNotificationForUser } from "../utils/notificationService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SUPPORTED_STRIPE_CURRENCIES = new Set([
  "inr",
  "usd",
  "eur",
  "gbp",
  "aed",
  "cad",
  "lkr",
]);

const getConfiguredStripeCurrency = async () => {
  const settings = await AdminSettings.findOne(
    {},
    { pricing: 1, _id: 0 },
    { sort: { updatedAt: -1 } }
  );

  const candidate = settings?.pricing?.currency
    ? String(settings.pricing.currency).toLowerCase()
    : "inr";

  return SUPPORTED_STRIPE_CURRENCIES.has(candidate) ? candidate : "inr";
};

const resolvePaymentMethodMeta = (paymentIntent) => {
  const chargeDetails = paymentIntent?.latest_charge?.payment_method_details;
  const chargeType = chargeDetails?.type;
  const walletType = chargeDetails?.card?.wallet?.type;

  if (walletType) {
    return {
      category: "wallet",
      method: walletType,
    };
  }

  const primaryType =
    chargeType || paymentIntent?.payment_method_types?.[0] || "card";

  if (["link", "paypal"].includes(primaryType)) {
    return {
      category: "wallet",
      method: primaryType,
    };
  }

  if (["sepa_debit", "ideal", "bank_transfer"].includes(primaryType)) {
    return {
      category: "bank_local",
      method: primaryType,
    };
  }

  return {
    category: "card",
    method: primaryType,
  };
};

const confirmBookingSeats = async (booking) => {
  const show = await Show.findById(booking.showId);
  if (!show) {
    return;
  }

  const seatsToAdd = booking.seats.filter(
    (seat) => !show.seats.booked.includes(seat)
  );

  if (seatsToAdd.length > 0) {
    show.seats.booked.push(...seatsToAdd);
    show.seats.available = Math.max(0, show.seats.total - show.seats.booked.length);
    await show.save();
  }
};

const markBookingAsCancelled = async (
  booking,
  { paymentStatus = "failed", verificationStatus = "not_required" } = {}
) => {
  if (!booking) {
    return null;
  }

  booking.paymentStatus = paymentStatus;
  booking.bookingStatus = "cancelled";
  booking.paymentVerificationStatus = verificationStatus;
  if (!booking.cancellationDate) {
    booking.cancellationDate = new Date();
  }

  await booking.save();
  return booking;
};

export const createPaymentIntent = async (req, res) => {
  try {
    const {
      userId,
      movieId,
      showId,
      seats,
      seatTypes,
      totalPrice,
      showDate,
      showTime,
      movieDetails,
    } = req.body;

    if (!userId || !movieId || !showId || !seats || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const bookedSeats = show.seats.booked || [];
    const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats not available: ${unavailableSeats.join(", ")}`,
      });
    }

    const stripeCurrency = await getConfiguredStripeCurrency();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: stripeCurrency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        movieId: movieId.toString(),
        showId,
        seats: seats.join(","),
        showDate,
        showTime,
        movieTitle: movieDetails?.title || "Movie Booking",
      },
      description: `Booking for ${movieDetails?.title || "Movie"} - ${
        seats.length
      } seat(s)`,
    });

    const booking = new Booking({
      userId,
      movieId: Number(movieId),
      showId,
      seats,
      seatTypes: seatTypes || seats.map(() => "standard"),
      totalPrice,
      paymentStatus: "pending",
      paymentId: paymentIntent.id,
      bookingDate: new Date(),
      showDate: showDate || show.showDate,
      showTime: showTime || show.showTime,
      theater: show.theater,
      movieDetails: movieDetails || show.movieDetails,
      bookingStatus: "pending",
      paymentMethodCategory: "unknown",
      paymentVerificationStatus: "not_required",
    });

    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking._id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: error.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Missing paymentIntentId or bookingId",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

    if (paymentIntent.status !== "succeeded") {
      await markBookingAsCancelled(booking, { paymentStatus: "failed" });

      await createNotificationForUser({
        userId: booking.userId,
        type: "booking",
        title: "Payment failed",
        message: `${booking.movieDetails?.title || "Your booking"} payment could not be completed and the booking was cancelled automatically.`,
        icon: "alert",
        actionUrl: "/booking",
        actionLabel: "View bookings",
        severity: "error",
      });

      return res.status(400).json({
        success: false,
        message: "Payment not successful. Booking has been cancelled.",
        status: paymentIntent.status,
      });
    }

    const wasCompleted = booking.paymentStatus === "completed";
    const paymentMeta = resolvePaymentMethodMeta(paymentIntent);

    booking.paymentStatus = "completed";
    booking.bookingStatus = "confirmed";
    booking.paymentId = paymentIntentId;
    booking.paymentMethodCategory = paymentMeta.category;
    booking.paymentMethod = paymentMeta.method;
    booking.paymentVerificationStatus = "not_required";
    await booking.save();

    await confirmBookingSeats(booking);

    if (!wasCompleted) {
      await createNotificationForUser({
        userId: booking.userId,
        type: "booking",
        title: "Payment successful",
        message: `${booking.movieDetails?.title || "Your booking"} payment was successful and your seats are confirmed.`,
        icon: "ticket",
        actionUrl: "/booking",
        actionLabel: "View ticket",
        severity: "success",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment confirmed and booking completed",
      data: booking,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message,
    });
  }
};

export const submitBankTransferReference = async (req, res) => {
  try {
    const { bookingId, userId, referenceNumber, bankMethod } = req.body;

    if (!bookingId || !referenceNumber) {
      return res.status(400).json({
        success: false,
        message: "bookingId and referenceNumber are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (userId && booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this booking",
      });
    }

    if (booking.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    if (booking.paymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentId);
        if (
          paymentIntent.status !== "succeeded" &&
          paymentIntent.status !== "canceled"
        ) {
          await stripe.paymentIntents.cancel(booking.paymentId);
        }
      } catch (error) {
        console.error("Error canceling stale payment intent:", error.message);
      }
    }

    booking.paymentStatus = "pending";
    booking.bookingStatus = "pending";
    booking.paymentMethodCategory = "bank_local";
    booking.paymentMethod = "manual_bank_transfer";
    booking.paymentVerificationStatus = "pending_review";
    booking.bankTransferReference = String(referenceNumber).trim();
    booking.bankTransferMethod = bankMethod
      ? String(bankMethod).trim().toLowerCase()
      : "bank_transfer";
    booking.bankTransferSubmittedAt = new Date();

    await booking.save();

    await createNotificationForUser({
      userId: booking.userId,
      type: "booking",
      title: "Bank transfer submitted",
      message: `${booking.movieDetails?.title || "Your booking"} bank transfer reference has been submitted and is pending verification.`,
      icon: "ticket",
      actionUrl: "/booking",
      actionLabel: "View booking",
      severity: "info",
    });

    return res.status(200).json({
      success: true,
      message: "Bank transfer reference submitted successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error submitting bank transfer reference:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting bank transfer reference",
      error: error.message,
    });
  }
};

export const reviewBankTransferPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "bookingId and status are required",
      });
    }

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be either verified or rejected",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentVerificationStatus = status;
    booking.notes = notes || booking.notes;

    if (status === "verified") {
      booking.paymentStatus = "completed";
      booking.bookingStatus = "confirmed";
      await booking.save();
      await confirmBookingSeats(booking);

      await createNotificationForUser({
        userId: booking.userId,
        type: "booking",
        title: "Bank transfer verified",
        message: `${booking.movieDetails?.title || "Your booking"} payment has been verified and seats are confirmed.`,
        icon: "ticket",
        actionUrl: "/booking",
        actionLabel: "View ticket",
        severity: "success",
      });
    } else {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
      await booking.save();

      await createNotificationForUser({
        userId: booking.userId,
        type: "booking",
        title: "Bank transfer rejected",
        message: `${booking.movieDetails?.title || "Your booking"} payment verification was rejected. Please retry payment.`,
        icon: "alert",
        actionUrl: "/payment",
        actionLabel: "Retry payment",
        severity: "error",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "verified"
          ? "Bank transfer verified successfully"
          : "Bank transfer rejected successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error reviewing bank transfer:", error);
    return res.status(500).json({
      success: false,
      message: "Error reviewing bank transfer",
      error: error.message,
    });
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.paymentId,
        );

        if (
          paymentIntent.status !== "succeeded" &&
          paymentIntent.status !== "canceled"
        ) {
          await stripe.paymentIntents.cancel(booking.paymentId);
        }
      } catch (error) {
        console.error("Error canceling payment intent:", error);
      }
    }

    await markBookingAsCancelled(booking, {
      paymentStatus:
        booking.paymentStatus === "completed" ? "refunded" : "failed",
      verificationStatus: "not_required",
    });

    await createNotificationForUser({
      userId: booking.userId,
      type: "booking",
      title: "Payment cancelled",
      message: `${booking.movieDetails?.title || "Your booking"} payment was cancelled and the booking is now marked as cancelled.`,
      icon: "ticket",
      actionUrl: "/booking",
      actionLabel: "View bookings",
      severity: "warning",
    });

    res.status(200).json({
      success: true,
      message: "Payment cancelled and booking marked as cancelled",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling payment",
      error: error.message,
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot refund a booking that is not paid",
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentId,
      reason: reason || "requested_by_customer",
    });

    booking.paymentStatus = "refunded";
    booking.bookingStatus = "cancelled";
    await booking.save();

    const show = await Show.findById(booking.showId);
    if (show) {
      show.seats.booked = show.seats.booked.filter(
        (seat) => !booking.seats.includes(seat),
      );
      show.seats.available += booking.seats.length;
      await show.save();
    }

    await createNotificationForUser({
      userId: booking.userId,
      type: "booking",
      title: "Refund processed",
      message: `${booking.movieDetails?.title || "Your booking"} refund has been processed successfully.`,
      icon: "ticket",
      actionUrl: "/booking",
      actionLabel: "View details",
      severity: "warning",
    });

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: {
        booking,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      },
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    });
  }
};

export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);

      const booking = await Booking.findOne({
        paymentId: paymentIntent.id,
      });

      if (booking) {
        const wasCompleted = booking.paymentStatus === "completed";
        const paymentMeta = resolvePaymentMethodMeta(paymentIntent);

        booking.paymentStatus = "completed";
        booking.bookingStatus = "confirmed";
        booking.paymentMethodCategory = paymentMeta.category;
        booking.paymentMethod = paymentMeta.method;
        booking.paymentVerificationStatus = "not_required";
        await booking.save();

        await confirmBookingSeats(booking);

        if (!wasCompleted) {
          await createNotificationForUser({
            userId: booking.userId,
            type: "booking",
            title: "Payment successful",
            message: `${booking.movieDetails?.title || "Your booking"} payment was successful and your seats are confirmed.`,
            icon: "ticket",
            actionUrl: "/booking",
            actionLabel: "View ticket",
            severity: "success",
          });
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("PaymentIntent failed:", failedPayment.id);

      const failedBooking = await Booking.findOne({
        paymentId: failedPayment.id,
      });

      if (failedBooking) {
        failedBooking.paymentStatus = "failed";
        failedBooking.bookingStatus = "cancelled";
        failedBooking.paymentVerificationStatus = "not_required";
        await failedBooking.save();

        await createNotificationForUser({
          userId: failedBooking.userId,
          type: "booking",
          title: "Payment failed",
          message: `${failedBooking.movieDetails?.title || "Your booking"} payment failed. Please retry to confirm seats.`,
          icon: "alert",
          actionUrl: "/payment",
          actionLabel: "Retry payment",
          severity: "error",
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
