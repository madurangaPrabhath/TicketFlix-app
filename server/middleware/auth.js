import { clerkClient } from "@clerk/clerk-sdk-node";

export const protectAdmin = async (req, res, next) => {
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
      });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};
