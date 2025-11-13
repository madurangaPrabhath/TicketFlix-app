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

import {
  verifyAdminStatus,
  getAdminStatus,
  getAdminProfile,
  updateAdminProfile,
  getAdminPermissions,
  validateAdminToken,
} from "../controllers/adminVerificationController.js";

import { protectAdmin } from "../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.get("/verify/admin-status", verifyAdminStatus);
userRoutes.post("/verify/admin-token", validateAdminToken);
userRoutes.get("/admin/:userId/status", getAdminStatus);

userRoutes.get("/admin/profile", protectAdmin, getAdminProfile);
userRoutes.put("/admin/profile", protectAdmin, updateAdminProfile);
userRoutes.get("/admin/permissions", protectAdmin, getAdminPermissions);

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

userRoutes.get("/admin/dashboard", protectAdmin, getDashboardStats);
userRoutes.post("/admin/shows", protectAdmin, createShow);
userRoutes.get("/admin/shows", protectAdmin, getAllShows);
userRoutes.put("/admin/shows/:showId", protectAdmin, updateShow);
userRoutes.delete("/admin/shows/:showId", protectAdmin, deleteShow);
userRoutes.get("/admin/bookings", protectAdmin, getAllBookings);
userRoutes.get("/admin/bookings/analytics", protectAdmin, getBookingAnalytics);
userRoutes.get("/admin/users", protectAdmin, getAllUsers);
userRoutes.get("/admin/users/:userId", protectAdmin, getUserDetails);
userRoutes.get("/admin/reports/revenue", protectAdmin, getRevenueReport);
userRoutes.get("/admin/reports/occupancy", protectAdmin, getOccupancyReport);

export default userRoutes;
