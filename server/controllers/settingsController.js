import Notification from "../models/Notification.js";
import AdminSettings from "../models/AdminSettings.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

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
        limit: parseInt(limit),
        skip: parseInt(skip),
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

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

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

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      icon: icon || "bell",
      actionUrl,
      actionLabel,
      severity: severity || "info",
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

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
      await settings.save();
    }

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

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId, ...updateData });
    } else {
      Object.assign(settings, updateData);
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
    const { mode, primaryColor, accentColor } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (mode) settings.theme.mode = mode;
    if (primaryColor) settings.theme.primaryColor = primaryColor;
    if (accentColor) settings.theme.accentColor = accentColor;

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
    const { layout, itemsPerPage, showSummary } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (layout) settings.dashboard.layout = layout;
    if (itemsPerPage) settings.dashboard.itemsPerPage = itemsPerPage;
    if (typeof showSummary === "boolean")
      settings.dashboard.showSummary = showSummary;

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
    const {
      defaultCity,
      defaultLanguage,
      defaultFormat,
      standardPrice,
      premiumPrice,
      vipPrice,
    } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (defaultCity) settings.theater.defaultCity = defaultCity;
    if (defaultLanguage) settings.theater.defaultLanguage = defaultLanguage;
    if (defaultFormat) settings.theater.defaultFormat = defaultFormat;
    if (standardPrice) settings.theater.standardPrice = standardPrice;
    if (premiumPrice) settings.theater.premiumPrice = premiumPrice;
    if (vipPrice) settings.theater.vipPrice = vipPrice;

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
    const { currency, taxPercentage, convenienceFee } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (currency) settings.pricing.currency = currency;
    if (typeof taxPercentage === "number")
      settings.pricing.taxPercentage = taxPercentage;
    if (typeof convenienceFee === "number")
      settings.pricing.convenienceFee = convenienceFee;

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
    const {
      email,
      push,
      sms,
      bookingNotifications,
      revenueAlerts,
      showUpdates,
      systemNotifications,
    } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (typeof email === "boolean") settings.notifications.email = email;
    if (typeof push === "boolean") settings.notifications.push = push;
    if (typeof sms === "boolean") settings.notifications.sms = sms;
    if (typeof bookingNotifications === "boolean")
      settings.notifications.bookingNotifications = bookingNotifications;
    if (typeof revenueAlerts === "boolean")
      settings.notifications.revenueAlerts = revenueAlerts;
    if (typeof showUpdates === "boolean")
      settings.notifications.showUpdates = showUpdates;
    if (typeof systemNotifications === "boolean")
      settings.notifications.systemNotifications = systemNotifications;

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
    const { twoFactorEnabled, sessionTimeout } = req.body;

    let settings = await AdminSettings.findOne({ userId });

    if (!settings) {
      settings = new AdminSettings({ userId });
    }

    if (typeof twoFactorEnabled === "boolean")
      settings.security.twoFactorEnabled = twoFactorEnabled;
    if (sessionTimeout) settings.security.sessionTimeout = sessionTimeout;

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
