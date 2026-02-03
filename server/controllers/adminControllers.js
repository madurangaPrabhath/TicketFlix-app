import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(today.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrowStart },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyBookings = await Booking.find({
      bookingDate: { $gte: monthStart },
      paymentStatus: "completed",
    });

    const monthlyRevenue = monthlyBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0,
    );

    const activeShows = await Show.countDocuments({
      showDate: { $gte: today },
    });

    const completedShows = await Show.countDocuments({
      showDate: { $lt: today },
    });

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        totalShows,
        totalBookings,
        totalUsers,
        todayBookings,
        monthlyRevenue,
        activeShows,
        completedShows,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

export const createShow = async (req, res) => {
  try {
    const {
      movieId,
      movieDetails,
      theater,
      showDate,
      showTime,
      language,
      format,
      seats,
      pricing,
      status,
    } = req.body;

    if (!movieId || !theater || !showDate || !showTime || !seats || !pricing) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const show = new Show({
      movieId: Number(movieId),
      movieDetails: movieDetails || {},
      theater,
      showDate: new Date(showDate),
      showTime,
      language: language || "English",
      format: format || "2D",
      seats: {
        total: seats.total || 150,
        available: seats.total || 150,
        booked: [],
      },
      pricing,
      status: status || "active",
    });

    await show.save();

    res.status(201).json({
      success: true,
      message: "Show created successfully",
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating show",
      error: error.message,
    });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, movieId, city } = req.query;

    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (movieId) filter.movieId = Number(movieId);
    if (city) filter["theater.city"] = city;

    const shows = await Show.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ showDate: -1 });

    const total = await Show.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: shows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shows",
      error: error.message,
    });
  }
};

export const updateShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const updateData = req.body;

    delete updateData.seats;
    delete updateData.booked;

    const show = await Show.findByIdAndUpdate(showId, updateData, {
      new: true,
      runValidators: true,
    }).populate("movieId");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Show updated successfully",
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating show",
      error: error.message,
    });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const bookingCount = await Booking.countDocuments({ showId });

    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete show with ${bookingCount} existing bookings`,
      });
    }

    const show = await Show.findByIdAndDelete(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Show deleted successfully",
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting show",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 1000,
      status,
      paymentStatus,
      userId,
      movieId,
    } = req.query;

    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.bookingStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (userId) filter.userId = userId;
    if (movieId) filter.movieId = Number(movieId);

    const bookings = await Booking.find(filter)
      .populate("showId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ bookingDate: -1, createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

export const getBookingAnalytics = async (req, res) => {
  try {
    const statusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    const topMovies = await Booking.aggregate([
      {
        $group: {
          _id: "$movieId",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        paymentBreakdown,
        topMovies,
        dailyBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking analytics",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalBookings = await Booking.countDocuments({ userId });
    const totalSpent = await Booking.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          totalBookings,
          totalSpent: totalSpent[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { paymentStatus: "completed" };

    if (startDate && endDate) {
      filter.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(filter);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const avgBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const revenueByMovie = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$movieId",
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        avgBooking,
        revenueByMovie,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating revenue report",
      error: error.message,
    });
  }
};

export const getOccupancyReport = async (req, res) => {
  try {
    const shows = await Show.find().populate("movieId");

    const occupancyData = shows.map((show) => ({
      showId: show._id,
      movieTitle: show.movieId.title,
      theater: show.theater.name,
      showDate: show.showDate,
      showTime: show.showTime,
      totalSeats: show.seats.total,
      bookedSeats: show.seats.booked.length,
      availableSeats: show.seats.available,
      occupancyPercentage: Math.round(
        (show.seats.booked.length / show.seats.total) * 100,
      ),
    }));

    const avgOccupancy =
      occupancyData.length > 0
        ? (
            occupancyData.reduce((sum, d) => sum + d.occupancyPercentage, 0) /
            occupancyData.length
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        avgOccupancy,
        shows: occupancyData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating occupancy report",
      error: error.message,
    });
  }
};
