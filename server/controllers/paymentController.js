import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
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

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        status: paymentIntent.status,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus = "completed";
    booking.bookingStatus = "confirmed";
    booking.paymentId = paymentIntentId;
    await booking.save();

    const show = await Show.findById(booking.showId);
    if (show) {
      const seatsToAdd = booking.seats.filter(
        (seat) => !show.seats.booked.includes(seat),
      );

      if (seatsToAdd.length > 0) {
        show.seats.booked.push(...seatsToAdd);
        show.seats.available = Math.max(
          0,
          show.seats.total - show.seats.booked.length,
        );
        await show.save();
      }
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

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: "Payment cancelled and booking removed",
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
        booking.paymentStatus = "completed";
        booking.bookingStatus = "confirmed";
        await booking.save();

        const show = await Show.findById(booking.showId);
        if (show && !show.seats.booked.some((s) => booking.seats.includes(s))) {
          show.seats.booked.push(...booking.seats);
          show.seats.available -= booking.seats.length;
          await show.save();
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
        await failedBooking.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
