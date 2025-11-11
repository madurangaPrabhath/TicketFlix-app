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

userRoutes.get("/:userId", getUserProfile);
userRoutes.put("/:userId", updateUserProfile);
userRoutes.put("/:userId/preferences", updatePreferences);
userRoutes.get("/:userId/bookings", getUserBookingHistory);
userRoutes.get("/:userId/upcoming", getUpcomingBookings);
userRoutes.get("/:userId/past", getPastBookings);
userRoutes.get("/favorite/check", isFavorite);
userRoutes.get("/:userId/favorites", getUserFavorites);
userRoutes.post("/:userId/favorites", addToFavorites);
userRoutes.delete("/:userId/favorites/:favoriteId", removeFromFavorites);
userRoutes.get("/:userId/stats", getUserStats);
userRoutes.get("/:userId/dashboard", getUserDashboard);
userRoutes.put("/:userId/notifications", updateNotificationSettings);
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

export default userRoutes;