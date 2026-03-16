import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";

const VALID_TYPES = ["booking", "show", "revenue", "system", "alert"];
const VALID_SEVERITIES = ["info", "warning", "success", "error"];

export const createNotificationForUser = async ({
  userId,
  type = "system",
  title,
  message,
  icon = "bell",
  actionUrl = null,
  actionLabel = null,
  severity = "info",
}) => {
  if (!userId || !title || !message) {
    return null;
  }

  const safeType = VALID_TYPES.includes(type) ? type : "system";
  const safeSeverity = VALID_SEVERITIES.includes(severity) ? severity : "info";

  try {
    const notification = await Notification.create({
      userId,
      type: safeType,
      title,
      message,
      icon,
      actionUrl,
      actionLabel,
      severity: safeSeverity,
    });

    return notification;
  } catch (error) {
    console.error("Notification create error:", error.message);
    return null;
  }
};

export const notifyUsersForShow = async ({
  showId,
  title,
  message,
  actionUrl = "/booking",
  severity = "info",
}) => {
  if (!showId || !title || !message) {
    return 0;
  }

  try {
    const users = await Booking.distinct("userId", {
      showId,
      bookingStatus: { $in: ["confirmed", "pending"] },
    });

    if (!users.length) {
      return 0;
    }

    await Promise.all(
      users.map((userId) =>
        createNotificationForUser({
          userId,
          type: "show",
          title,
          message,
          icon: "film",
          actionUrl,
          actionLabel: "View booking",
          severity,
        })
      )
    );

    return users.length;
  } catch (error) {
    console.error("Show notification broadcast error:", error.message);
    return 0;
  }
};
