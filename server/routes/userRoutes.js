import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updatePreferences,
  getUserBookingHistory,
  getUpcomingBookings,
  getPastBookings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  getUserStats,
  getUserDashboard,
  updateNotificationSettings,
  syncFavoritesToClerk,
} from "../controllers/userControllers.js";

import {
  getDashboardStats,
  createShow,
  getAllShows,
  updateShow,
  deleteShow,
  getAllBookings,
  getBookingAnalytics,
  getAllUsers,
  getUserDetails,
  getRevenueReport,
  getOccupancyReport,
} from "../controllers/adminControllers.js";

const userRoutes = express.Router();

// Admin routes - MUST come before /:userId routes to avoid conflicts
userRoutes.get("/admin/dashboard", getDashboardStats);
userRoutes.post("/admin/shows", createShow);
userRoutes.get("/admin/shows", getAllShows);
userRoutes.put("/admin/shows/:showId", updateShow);
userRoutes.delete("/admin/shows/:showId", deleteShow);
userRoutes.get("/admin/bookings", getAllBookings);
userRoutes.get("/admin/bookings/analytics", getBookingAnalytics);
userRoutes.get("/admin/users", getAllUsers);
userRoutes.get("/admin/users/:userId", getUserDetails);
userRoutes.get("/admin/reports/revenue", getRevenueReport);
userRoutes.get("/admin/reports/occupancy", getOccupancyReport);

// Static routes before dynamic :userId routes
userRoutes.get("/favorite/check", isFavorite);

// User routes with dynamic :userId parameter
userRoutes.get("/:userId", getUserProfile);
userRoutes.put("/:userId", updateUserProfile);
userRoutes.put("/:userId/preferences", updatePreferences);
userRoutes.get("/:userId/bookings", getUserBookingHistory);
userRoutes.get("/:userId/upcoming", getUpcomingBookings);
userRoutes.get("/:userId/past", getPastBookings);
userRoutes.get("/:userId/favorites", getUserFavorites);
userRoutes.post("/:userId/favorites", addToFavorites);
userRoutes.delete("/:userId/favorites/:favoriteId", removeFromFavorites);
userRoutes.post("/:userId/favorites/sync-clerk", syncFavoritesToClerk);
userRoutes.get("/:userId/stats", getUserStats);
userRoutes.get("/:userId/dashboard", getUserDashboard);
userRoutes.put("/:userId/notifications", updateNotificationSettings);

export default userRoutes;
