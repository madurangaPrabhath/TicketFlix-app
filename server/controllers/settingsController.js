import Notification from "../models/Notification.js";
import AdminSettings from "../models/AdminSettings.js";

const NOTIFICATION_TYPES = ["booking", "show", "revenue", "system", "alert"];
const NOTIFICATION_SEVERITIES = ["info", "warning", "success", "error"];
const THEME_MODES = ["light", "dark"];
const DASHBOARD_LAYOUTS = ["grid", "list"];
const SHOW_FORMATS = ["2D", "3D", "IMAX"];

const getAuthUserId = (req) => req.auth?.userId || null;

const ensureNotificationAccess = (req, res, targetUserId) => {
  const authUserId = getAuthUserId(req);

  if (!authUserId) {
    return true;
  }

  if (authUserId !== targetUserId) {
    res.status(403).json({
      success: false,
      message: "Forbidden: cannot access notifications for another user",
    });
    return false;
  }

  return true;
};

const ensureAdminSettingsAccess = (req, res, targetUserId) => {
  const authUserId = getAuthUserId(req);

  if (!authUserId) {
    return true;
  }

  if (authUserId !== targetUserId) {
    res.status(403).json({
      success: false,
      message: "Forbidden: cannot access settings for another user",
    });
    return false;
  }

  return true;
};

const getOrCreateAdminSettings = async (userId) => {
  let settings = await AdminSettings.findOne({ userId });
  if (!settings) {
    settings = new AdminSettings({ userId });
  }
  return settings;
};

const isHexColor = (value) => /^#([A-Fa-f0-9]{6})$/.test(value);

const applyThemeUpdates = (settings, payload = {}) => {
  const { mode, primaryColor, accentColor } = payload;

  if (mode !== undefined) {
    if (!THEME_MODES.includes(mode)) {
      return "Invalid theme mode. Allowed values: light, dark";
    }
    settings.theme.mode = mode;
  }

  if (primaryColor !== undefined) {
    if (typeof primaryColor !== "string" || !isHexColor(primaryColor)) {
      return "primaryColor must be a valid hex color like #e50914";
    }
    settings.theme.primaryColor = primaryColor;
  }

  if (accentColor !== undefined) {
    if (typeof accentColor !== "string" || !isHexColor(accentColor)) {
      return "accentColor must be a valid hex color like #1f2937";
    }
    settings.theme.accentColor = accentColor;
  }

  return null;
};

const applyDashboardUpdates = (settings, payload = {}) => {
  const { layout, itemsPerPage, showSummary } = payload;

  if (layout !== undefined) {
    if (!DASHBOARD_LAYOUTS.includes(layout)) {
      return "Invalid dashboard layout. Allowed values: grid, list";
    }
    settings.dashboard.layout = layout;
  }

  if (itemsPerPage !== undefined) {
    const parsed = Number(itemsPerPage);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      return "itemsPerPage must be an integer between 1 and 100";
    }
    settings.dashboard.itemsPerPage = parsed;
  }

  if (showSummary !== undefined) {
    if (typeof showSummary !== "boolean") {
      return "showSummary must be boolean";
    }
    settings.dashboard.showSummary = showSummary;
  }

  return null;
};

const applyTheaterUpdates = (settings, payload = {}) => {
  const {
    defaultCity,
    defaultLanguage,
    defaultFormat,
    standardPrice,
    premiumPrice,
    vipPrice,
  } = payload;

  if (defaultCity !== undefined) {
    if (typeof defaultCity !== "string") {
      return "defaultCity must be a string";
    }
    settings.theater.defaultCity = defaultCity.trim();
  }

  if (defaultLanguage !== undefined) {
    if (typeof defaultLanguage !== "string" || !defaultLanguage.trim()) {
      return "defaultLanguage must be a non-empty string";
    }
    settings.theater.defaultLanguage = defaultLanguage.trim();
  }

  if (defaultFormat !== undefined) {
    if (!SHOW_FORMATS.includes(defaultFormat)) {
      return "Invalid defaultFormat. Allowed values: 2D, 3D, IMAX";
    }
    settings.theater.defaultFormat = defaultFormat;
  }

  const priceFields = [
    ["standardPrice", standardPrice],
    ["premiumPrice", premiumPrice],
    ["vipPrice", vipPrice],
  ];

  for (const [key, value] of priceFields) {
    if (value !== undefined) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return `${key} must be a non-negative number`;
      }
      settings.theater[key] = parsed;
    }
  }

  return null;
};

const applyPricingUpdates = (settings, payload = {}) => {
  const { currency, taxPercentage, convenienceFee } = payload;

  if (currency !== undefined) {
    if (typeof currency !== "string" || currency.trim().length < 2) {
      return "currency must be a string (e.g. INR, USD)";
    }
    settings.pricing.currency = currency.trim().toUpperCase();
  }

  if (taxPercentage !== undefined) {
    const parsed = Number(taxPercentage);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return "taxPercentage must be a number between 0 and 100";
    }
    settings.pricing.taxPercentage = parsed;
  }

  if (convenienceFee !== undefined) {
    const parsed = Number(convenienceFee);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return "convenienceFee must be a non-negative number";
    }
    settings.pricing.convenienceFee = parsed;
  }

  return null;
};

const applyNotificationPreferenceUpdates = (settings, payload = {}) => {
  const keys = [
    "email",
    "push",
    "sms",
    "bookingNotifications",
    "revenueAlerts",
    "showUpdates",
    "systemNotifications",
  ];

  for (const key of keys) {
    if (payload[key] !== undefined) {
      if (typeof payload[key] !== "boolean") {
        return `${key} must be boolean`;
      }
      settings.notifications[key] = payload[key];
    }
  }

  return null;
};

const applySecurityUpdates = (settings, payload = {}) => {
  const { twoFactorEnabled, sessionTimeout } = payload;

  if (twoFactorEnabled !== undefined) {
    if (typeof twoFactorEnabled !== "boolean") {
      return "twoFactorEnabled must be boolean";
    }
    settings.security.twoFactorEnabled = twoFactorEnabled;
  }

  if (sessionTimeout !== undefined) {
    const parsed = Number(sessionTimeout);
    if (!Number.isInteger(parsed) || parsed < 300 || parsed > 86400) {
      return "sessionTimeout must be an integer between 300 and 86400 seconds";
    }
    settings.security.sessionTimeout = parsed;
  }

  return null;
};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    if (!ensureNotificationAccess(req, res, userId)) {
      return;
    }

    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
    const safeSkip = Math.max(0, Number(skip) || 0);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .skip(safeSkip);

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      stats: {
        total,
        unread,
        limit: safeLimit,
        skip: safeSkip,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ensureNotificationAccess(req, res, userId)) {
      return;
    }

    const notifications = await Notification.find({
      userId,
      read: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications",
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!ensureNotificationAccess(req, res, notification.userId)) {
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ensureNotificationAccess(req, res, userId)) {
      return;
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!ensureNotificationAccess(req, res, notification.userId)) {
      return;
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ensureNotificationAccess(req, res, userId)) {
      return;
    }

    await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "All notifications deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      icon,
      actionUrl,
      actionLabel,
      severity,
    } = req.body;

    if (!ensureNotificationAccess(req, res, userId)) {
      return;
    }

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, type, title and message are required",
      });
    }

    if (!NOTIFICATION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid notification type. Allowed values: ${NOTIFICATION_TYPES.join(
          ", "
        )}`,
      });
    }

    const safeSeverity = severity || "info";
    if (!NOTIFICATION_SEVERITIES.includes(safeSeverity)) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity. Allowed values: ${NOTIFICATION_SEVERITIES.join(
          ", "
        )}`,
      });
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      icon: icon || "bell",
      actionUrl,
      actionLabel,
      severity: safeSeverity,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const allowedSections = [
      "theme",
      "dashboard",
      "theater",
      "pricing",
      "notifications",
      "security",
    ];

    const unknownKeys = Object.keys(updateData || {}).filter(
      (key) => !allowedSections.includes(key)
    );

    if (unknownKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Unknown settings keys: ${unknownKeys.join(", ")}`,
      });
    }

    const settings = await getOrCreateAdminSettings(userId);

    const themeError = applyThemeUpdates(settings, updateData?.theme);
    if (themeError) {
      return res.status(400).json({ success: false, message: themeError });
    }

    const dashboardError = applyDashboardUpdates(settings, updateData?.dashboard);
    if (dashboardError) {
      return res.status(400).json({ success: false, message: dashboardError });
    }

    const theaterError = applyTheaterUpdates(settings, updateData?.theater);
    if (theaterError) {
      return res.status(400).json({ success: false, message: theaterError });
    }

    const pricingError = applyPricingUpdates(settings, updateData?.pricing);
    if (pricingError) {
      return res.status(400).json({ success: false, message: pricingError });
    }

    const notificationError = applyNotificationPreferenceUpdates(
      settings,
      updateData?.notifications
    );
    if (notificationError) {
      return res
        .status(400)
        .json({ success: false, message: notificationError });
    }

    const securityError = applySecurityUpdates(settings, updateData?.security);
    if (securityError) {
      return res.status(400).json({ success: false, message: securityError });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

export const updateThemeSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applyThemeUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.theme,
      message: "Theme updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update theme",
      error: error.message,
    });
  }
};

export const updateDashboardSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applyDashboardUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.dashboard,
      message: "Dashboard settings updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update dashboard settings",
      error: error.message,
    });
  }
};

export const updateTheaterSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applyTheaterUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.theater,
      message: "Theater settings updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update theater settings",
      error: error.message,
    });
  }
};

export const updatePricingSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applyPricingUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.pricing,
      message: "Pricing settings updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pricing settings",
      error: error.message,
    });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applyNotificationPreferenceUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.notifications,
      message: "Notification settings updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body || {};

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    const settings = await getOrCreateAdminSettings(userId);

    const validationError = applySecurityUpdates(settings, payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.security,
      message: "Security settings updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update security settings",
      error: error.message,
    });
  }
};

export const resetSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ensureAdminSettingsAccess(req, res, userId)) {
      return;
    }

    await AdminSettings.deleteOne({ userId });

    const defaultSettings = new AdminSettings({ userId });
    await defaultSettings.save();

    res.status(200).json({
      success: true,
      data: defaultSettings,
      message: "Settings reset to defaults",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message,
    });
  }
};
