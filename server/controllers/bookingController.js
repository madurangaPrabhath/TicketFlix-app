import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import { createNotificationForUser } from "../utils/notificationService.js";

export const createBooking = async (req, res) => {
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
      specialRequests,
    } = req.body;

    if (!userId || !movieId || !showId || !seats || !totalPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, movieId, showId, seats, totalPrice",
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Seats must be a non-empty array",
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

    const booking = new Booking({
      userId,
      movieId: Number(movieId),
      showId,
      seats,
      seatTypes,
      totalPrice,
      paymentStatus: "pending",
      bookingDate: new Date(),
      showDate: showDate || show.showDate,
      showTime: showTime || show.showTime,
      theater: show.theater,
      movieDetails: show.movieDetails || {
        title: "Unknown Movie",
        poster_path: "",
        duration: 0,
      },
      specialRequests,
    });

    await booking.save();

    show.seats.booked.push(...seats);
    show.seats.available -= seats.length;
    await show.save();

    await createNotificationForUser({
      userId,
      type: "booking",
      title: "Booking created",
      message: `${booking.movieDetails?.title || "Your movie"} booking is created. Complete payment to confirm your seats.`,
      icon: "ticket",
      actionUrl: "/payment",
      actionLabel: "Complete payment",
      severity: "info",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const bookings = await Booking.getUserBookings(userId);
    const visibleBookings = bookings.filter((booking) => {
      const bookingStatus = String(booking.bookingStatus || "").toLowerCase();
      const paymentMethodCategory = String(
        booking.paymentMethodCategory || ""
      ).toLowerCase();
      const paymentVerificationStatus = String(
        booking.paymentVerificationStatus || ""
      ).toLowerCase();

      const isPendingBankTransferReview =
        bookingStatus === "pending" &&
        paymentMethodCategory === "bank_local" &&
        paymentVerificationStatus === "pending_review";

      return (
        ["confirmed", "cancelled"].includes(bookingStatus) ||
        isPendingBankTransferReview
      );
    });

    res.status(200).json({
      success: true,
      data: visibleBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user bookings",
      error: error.message,
    });
  }
};

export const getActiveBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const activeBookings = await Booking.getActiveBookings(userId);

    res.status(200).json({
      success: true,
      data: activeBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active bookings",
      error: error.message,
    });
  }
};

export const getPastBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const pastBookings = await Booking.getPastBookings(userId);

    res.status(200).json({
      success: true,
      data: pastBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching past bookings",
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "movieId showId"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { specialRequests, notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (specialRequests) booking.specialRequests = specialRequests;
    if (notes) booking.notes = notes;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await booking.cancelBooking();

    const show = await Show.findById(booking.showId);
    if (show) {
      show.seats.booked = show.seats.booked.filter(
        (seat) => !booking.seats.includes(seat)
      );
      show.seats.available += booking.seats.length;
      await show.save();
    }

    await createNotificationForUser({
      userId: booking.userId,
      type: "booking",
      title: "Booking cancelled",
      message: `${booking.movieDetails?.title || "Your movie"} booking has been cancelled.`,
      icon: "ticket",
      actionUrl: "/booking",
      actionLabel: "View bookings",
      severity: "warning",
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

export const deleteCancelledBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const bookingStatus = String(booking.bookingStatus || "").toLowerCase();
    const paymentStatus = String(booking.paymentStatus || "").toLowerCase();

    const isCancelledBooking = bookingStatus === "cancelled";
    const isUnpaidPendingBooking =
      bookingStatus === "pending" && paymentStatus === "pending";

    if (!isCancelledBooking && !isUnpaidPendingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "Only cancelled bookings or unpaid pending bookings can be deleted permanently",
      });
    }

    const show = await Show.findById(booking.showId);
    if (show) {
      // Ensure no cancelled booking seats remain blocked before deleting.
      show.seats.booked = show.seats.booked.filter(
        (seat) => !booking.seats.includes(seat)
      );
      show.seats.available = Math.max(0, show.seats.total - show.seats.booked.length);
      await show.save();
    }

    await Booking.findByIdAndDelete(bookingId);

    await createNotificationForUser({
      userId: booking.userId,
      type: "booking",
      title: "Booking deleted",
      message: `${booking.movieDetails?.title || "Your booking"} has been deleted permanently.`,
      icon: "trash",
      actionUrl: "/booking",
      actionLabel: "View bookings",
      severity: "info",
    });

    res.status(200).json({
      success: true,
      message: "Booking deleted permanently",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting cancelled booking",
      error: error.message,
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentId } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "paymentStatus is required",
      });
    }

    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const previousStatus = booking.paymentStatus;
    booking.paymentStatus = paymentStatus;
    booking.paymentId = paymentId || booking.paymentId || null;

    if (paymentStatus === "completed" && booking.bookingStatus === "pending") {
      booking.bookingStatus = "confirmed";
    }

    await booking.save();

    if (previousStatus !== paymentStatus) {
      const statusSeverityMap = {
        pending: "info",
        completed: "success",
        failed: "error",
        refunded: "warning",
      };

      await createNotificationForUser({
        userId: booking.userId,
        type: "booking",
        title: "Payment status updated",
        message: `${booking.movieDetails?.title || "Your booking"} payment is now ${paymentStatus}.`,
        icon: "dollar",
        actionUrl: "/booking",
        actionLabel: "View booking",
        severity: statusSeverityMap[paymentStatus] || "info",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

export const getBookingSummary = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("showId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const summary = {
      bookingId: booking._id,
      movieTitle: booking.movieDetails.title,
      theaterName: booking.theater.name,
      theaterCity: booking.theater.city,
      showDate: booking.showDate,
      showTime: booking.showTime,
      seats: booking.seats,
      seatTypes: booking.seatTypes,
      totalPrice: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      bookingDate: booking.bookingDate,
      daysUntilShow: booking.daysUntilShow,
      canCancel: booking.canCancel,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking summary",
      error: error.message,
    });
  }
};

export const verifyBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.query;

    if (!bookingId || !userId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and userId are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Booking belongs to different user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking verified",
      data: {
        bookingId: booking._id,
        isValid: true,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying booking",
      error: error.message,
    });
  }
};
