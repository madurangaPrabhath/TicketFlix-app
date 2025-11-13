import express from "express";
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getAdminSettings,
  updateAdminSettings,
  updateThemeSettings,
  updateDashboardSettings,
  updateTheaterSettings,
  updatePricingSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  resetSettings,
} from "../controllers/settingsController.js";

const settingsRouter = express.Router();

settingsRouter.get("/notifications/:userId", getNotifications);
settingsRouter.get("/notifications/:userId/unread", getUnreadNotifications);
settingsRouter.put(
  "/notifications/:notificationId/read",
  markNotificationAsRead
);
settingsRouter.put(
  "/notifications/:userId/read-all",
  markAllNotificationsAsRead
);
settingsRouter.delete("/notifications/:notificationId", deleteNotification);
settingsRouter.delete("/notifications/:userId/all", deleteAllNotifications);
settingsRouter.post("/notifications", createNotification);

settingsRouter.get("/admin/:userId", getAdminSettings);
settingsRouter.put("/admin/:userId", updateAdminSettings);

settingsRouter.put("/admin/:userId/theme", updateThemeSettings);

settingsRouter.put("/admin/:userId/dashboard", updateDashboardSettings);

settingsRouter.put("/admin/:userId/theater", updateTheaterSettings);

settingsRouter.put("/admin/:userId/pricing", updatePricingSettings);

settingsRouter.put(
  "/admin/:userId/notification-settings",
  updateNotificationSettings
);

settingsRouter.put("/admin/:userId/security", updateSecuritySettings);

settingsRouter.post("/admin/:userId/reset", resetSettings);

export default settingsRouter;
