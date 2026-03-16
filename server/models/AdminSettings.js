import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
    },
    theme: {
      mode: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      primaryColor: {
        type: String,
        default: "#e50914",
        match: /^#([A-Fa-f0-9]{6})$/,
      },
      accentColor: {
        type: String,
        default: "#1f2937",
        match: /^#([A-Fa-f0-9]{6})$/,
      },
    },
    dashboard: {
      layout: {
        type: String,
        enum: ["grid", "list"],
        default: "grid",
      },
      itemsPerPage: {
        type: Number,
        default: 10,
        min: 1,
        max: 100,
      },
      showSummary: {
        type: Boolean,
        default: true,
      },
    },
    theater: {
      defaultCity: {
        type: String,
        default: "",
      },
      defaultLanguage: {
        type: String,
        default: "English",
      },
      defaultFormat: {
        type: String,
        default: "2D",
      },
      standardPrice: {
        type: Number,
        default: 200,
        min: 0,
      },
      premiumPrice: {
        type: Number,
        default: 350,
        min: 0,
      },
      vipPrice: {
        type: Number,
        default: 500,
        min: 0,
      },
    },
    pricing: {
      currency: {
        type: String,
        default: "INR",
      },
      taxPercentage: {
        type: Number,
        default: 18,
        min: 0,
        max: 100,
      },
      convenienceFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      bookingNotifications: {
        type: Boolean,
        default: true,
      },
      revenueAlerts: {
        type: Boolean,
        default: true,
      },
      showUpdates: {
        type: Boolean,
        default: true,
      },
      systemNotifications: {
        type: Boolean,
        default: true,
      },
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number,
        default: 3600,
        min: 300,
        max: 86400,
      },
      lastPasswordChange: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminSettings", adminSettingsSchema);
