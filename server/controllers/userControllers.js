import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Favorite from "../models/Favorite.js";
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
      },
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "TMDB API Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, address, city, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating preferences",
      error: error.message,
    });
  }
};

export const getUserBookingHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId })
      .populate("movieId", "title poster_path")
      .populate("showId", "showDate showTime theater")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ bookingDate: -1 });

    const total = await Booking.countDocuments({ userId });

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
      message: "Error fetching booking history",
      error: error.message,
    });
  }
};

export const getUpcomingBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const bookings = await Booking.getActiveBookings(userId);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming bookings",
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

    const bookings = await Booking.getPastBookings(userId);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching past bookings",
      error: error.message,
    });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log("Server: getUserFavorites called -", { userId, page, limit });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const skip = (page - 1) * limit;

    // Count all favorites first
    const total = await Favorite.countDocuments({ userId });
    console.log("Server: Total favorites for user:", total);

    // Fetch favorites WITHOUT populate since movieId can be Mixed type (TMDB ID or ObjectId)
    const favorites = await Favorite.find({ userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ addedAt: -1 })
      .lean();

    console.log("Server: Found favorites count:", favorites.length);

    // Enrich favorites with full movie data from TMDB
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        try {
          // If movieId is a number (TMDB ID), fetch from TMDB
          if (typeof fav.movieId === "number" || /^\d+$/.test(fav.movieId)) {
            const tmdbMovie = await fetchFromTMDB(`/movie/${fav.movieId}`);
            return {
              ...fav,
              movieId: {
                id: tmdbMovie.id,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview,
                genres: tmdbMovie.genres?.map((g) => g.name) || [],
                vote_average: tmdbMovie.vote_average,
                release_date: tmdbMovie.release_date,
                poster_path: `${IMAGE_BASE_URL}${tmdbMovie.poster_path}`,
                backdrop_path: `${IMAGE_BASE_URL}${tmdbMovie.backdrop_path}`,
                runtime: tmdbMovie.runtime,
              },
            };
          }
          return fav;
        } catch (err) {
          console.log(
            "Could not fetch TMDB data for movieId:",
            fav.movieId,
            err.message
          );
          return fav;
        }
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedFavorites,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Server: Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching favorites",
      error: error.message,
    });
  }
};

export const addToFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { movieId } = req.body;

    console.log("Server: addToFavorites called -", {
      userId,
      movieId,
      movieIdType: typeof movieId,
    });

    if (!userId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "userId and movieId are required",
      });
    }

    // Check for existing favorite - use strict equality for all types
    const existing = await Favorite.findOne({ userId, movieId }).exec();

    if (existing) {
      console.log("Server: Movie already in favorites");
      return res.status(400).json({
        success: false,
        message: "Movie already in favorites",
      });
    }

    const favorite = new Favorite({
      userId,
      movieId,
      addedAt: new Date(),
    });

    const savedFavorite = await favorite.save();
    console.log("Server: Favorite saved successfully:", savedFavorite);

    try {
      await savedFavorite.populate("movieId");
      console.log("Server: Favorite populated:", savedFavorite);
    } catch (err) {
      console.log(
        "Server: Could not populate movieId (likely TMDB ID string):",
        movieId,
        err.message
      );
    }

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: savedFavorite,
    });
  } catch (error) {
    console.error("Server: Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to favorites",
      error: error.message,
    });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { userId, favoriteId } = req.params;

    if (!userId || !favoriteId) {
      return res.status(400).json({
        success: false,
        message: "userId and favoriteId are required",
      });
    }

    const favorite = await Favorite.findByIdAndDelete(favoriteId);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing from favorites",
      error: error.message,
    });
  }
};

export const isFavorite = async (req, res) => {
  try {
    const { userId, movieId } = req.query;

    if (!userId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "userId and movieId are required",
      });
    }

    const favorite = await Favorite.findOne({ userId, movieId });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite,
      data: favorite || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking favorite",
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const totalBookings = await Booking.countDocuments({ userId });

    const spendingData = await Booking.aggregate([
      { $match: { userId, paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalSpent = spendingData[0]?.total || 0;

    const upcomingBookings = await Booking.countDocuments({
      userId,
      bookingStatus: "confirmed",
      showDate: { $gte: new Date() },
    });

    const cancelledBookings = await Booking.countDocuments({
      userId,
      bookingStatus: "cancelled",
    });

    const favoritesCount = await Favorite.countDocuments({ userId });

    const avgPrice = totalBookings > 0 ? totalSpent / totalBookings : 0;

    const topGenres = await Booking.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      { $unwind: "$movie.genres" },
      {
        $group: {
          _id: "$movie.genres",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalSpent: totalSpent.toFixed(2),
        upcomingBookings,
        cancelledBookings,
        favoritesCount,
        avgBookingPrice: avgPrice.toFixed(2),
        topGenres,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const upcomingBookings = await Booking.find({
      userId,
      bookingStatus: "confirmed",
      showDate: { $gte: new Date() },
    })
      .populate("movieId", "title poster_path")
      .populate("showId", "showDate showTime theater")
      .limit(5)
      .sort({ showDate: 1 });

    const favoriteMovies = await Favorite.find({ userId })
      .populate("movieId")
      .limit(6)
      .sort({ addedAt: -1 });

    const stats = await Booking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        upcomingBookings,
        favoriteMovies,
        stats: stats[0] || { totalBookings: 0, totalSpent: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user dashboard",
      error: error.message,
    });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, sms, push } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const notificationSettings = {};
    if (email !== undefined)
      notificationSettings["preferences.notifications.email"] = email;
    if (sms !== undefined)
      notificationSettings["preferences.notifications.sms"] = sms;
    if (push !== undefined)
      notificationSettings["preferences.notifications.push"] = push;

    const user = await User.findByIdAndUpdate(userId, notificationSettings, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification settings updated",
      data: user.preferences.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating notification settings",
      error: error.message,
    });
  }
};
