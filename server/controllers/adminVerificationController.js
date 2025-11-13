import { clerkClient } from "@clerk/clerk-sdk-node";
import AdminSettings from "../models/AdminSettings.js";

export const verifyAdminStatus = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        isAdmin: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    res.status(200).json({
      success: true,
      isAdmin,
      userId,
      userName:
        user.fullName || user.emailAddresses[0]?.emailAddress || "Admin",
      email: user.emailAddresses[0]?.emailAddress,
      profileImage: user.profileImageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      isAdmin: false,
      message: "Failed to verify admin status",
      error: error.message,
    });
  }
};

export const getAdminStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    const adminSettings = await AdminSettings.findOne({ userId });

    res.status(200).json({
      success: true,
      isAdmin,
      userId,
      userName: user.fullName || user.emailAddresses[0]?.emailAddress,
      email: user.emailAddresses[0]?.emailAddress,
      profileImage: user.profileImageUrl,
      settings: adminSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admin status",
      error: error.message,
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required",
        isAdmin: false,
      });
    }

    req.admin = {
      userId,
      user,
      isAdmin: true,
    };

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not an admin",
      });
    }

    const adminSettings = await AdminSettings.findOne({ userId });

    res.status(200).json({
      success: true,
      data: {
        userId,
        name: user.fullName || "Admin",
        email: user.emailAddresses[0]?.emailAddress,
        profileImage: user.profileImageUrl,
        role: "admin",
        createdAt: user.createdAt,
        settings: adminSettings,
        metadata: user.privateMetadata,
        publicMetadata: user.publicMetadata,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
      error: error.message,
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { firstName, lastName, profileImageUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not an admin",
      });
    }

    const updatedUser = await clerkClient.users.updateUser(userId, {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      profileImageUrl: profileImageUrl || user.profileImageUrl,
    });

    res.status(200).json({
      success: true,
      data: {
        userId: updatedUser.id,
        name: updatedUser.fullName,
        email: updatedUser.emailAddresses[0]?.emailAddress,
        profileImage: updatedUser.profileImageUrl,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getAdminPermissions = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not an admin",
      });
    }

    const permissions = {
      dashboard: true,
      movies: {
        view: true,
        create: true,
        edit: true,
        delete: user.privateMetadata?.permissions?.movies?.delete !== false,
      },
      shows: {
        view: true,
        create: true,
        edit: true,
        delete: user.privateMetadata?.permissions?.shows?.delete !== false,
      },
      bookings: {
        view: true,
        edit: true,
        cancel: user.privateMetadata?.permissions?.bookings?.cancel !== false,
      },
      users: {
        view: true,
        edit: user.privateMetadata?.permissions?.users?.edit !== false,
        delete: user.privateMetadata?.permissions?.users?.delete !== false,
      },
      reports: {
        view: true,
        export: true,
      },
      settings: {
        view: true,
        edit: user.privateMetadata?.permissions?.settings?.edit !== false,
      },
    };

    res.status(200).json({
      success: true,
      data: permissions,
      message: "Admin permissions retrieved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
      error: error.message,
    });
  }
};

export const validateAdminToken = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Invalid or expired token",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    res.status(200).json({
      success: true,
      valid: isAdmin,
      userId,
      isAdmin,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: "Token validation failed",
      error: error.message,
    });
  }
};
