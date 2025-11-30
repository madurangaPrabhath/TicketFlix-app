import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (seats) {
          return seats && seats.length > 0;
        },
        message: "At least one seat must be selected",
      },
    },
    seatTypes: {
      type: [String],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentId: {
      type: String,
      default: null,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    showDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    theater: {
      name: String,
      location: String,
      city: String,
    },
    movieDetails: {
      title: String,
      poster_path: String,
      duration: Number,
    },
    specialRequests: {
      type: String,
      default: null,
    },
    cancellationDate: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ showId: 1 });
bookingSchema.index({ movieId: 1 });
bookingSchema.index({ showDate: 1 });

bookingSchema.virtual("daysUntilShow").get(function () {
  const now = new Date();
  const showDate = new Date(this.showDate);
  const timeDiff = showDate - now;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
});

bookingSchema.virtual("canCancel").get(function () {
  return (
    this.bookingStatus === "confirmed" || this.bookingStatus === "cancelled"
  );
});

bookingSchema.methods.cancelBooking = function () {
  if (!this.canCancel) {
    throw new Error("Booking cannot be cancelled");
  }
  this.bookingStatus = "cancelled";
  this.cancellationDate = new Date();
  this.refundAmount = this.totalPrice * 0.8;
  this.paymentStatus = "refunded";
  return this.save();
};

bookingSchema.statics.getUserBookings = function (userId) {
  return this.find({ userId })
    .sort({ bookingDate: -1 })
    .populate("movieId showId");
};

bookingSchema.statics.getActiveBookings = function (userId) {
  return this.find({
    userId,
    bookingStatus: "confirmed",
    showDate: { $gte: new Date() },
  })
    .sort({ showDate: 1 })
    .populate("movieId showId");
};

bookingSchema.statics.getPastBookings = function (userId) {
  return this.find({
    userId,
    showDate: { $lt: new Date() },
  })
    .sort({ showDate: -1 })
    .populate("movieId showId");
};

bookingSchema.statics.getShowBookings = function (showId) {
  return this.find({ showId }).populate("userId");
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
