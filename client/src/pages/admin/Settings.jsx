import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";

const defaultSettings = {
  theme: {
    mode: "dark",
    primaryColor: "#e50914",
    accentColor: "#1f2937",
  },
  dashboard: {
    layout: "grid",
    itemsPerPage: 10,
    showSummary: true,
  },
  theater: {
    defaultCity: "",
    defaultLanguage: "English",
    defaultFormat: "2D",
    standardPrice: 200,
    premiumPrice: 350,
    vipPrice: 500,
  },
  pricing: {
    currency: "INR",
    taxPercentage: 18,
    convenienceFee: 0,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    bookingNotifications: true,
    revenueAlerts: true,
    showUpdates: true,
    systemNotifications: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 3600,
  },
};

const tabs = [
  { key: "theme", label: "Theme" },
  { key: "dashboard", label: "Dashboard" },
  { key: "theater", label: "Theater" },
  { key: "pricing", label: "Pricing" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userId,
    fetchAdminSettings,
    updateAdminThemeSettings,
    updateAdminDashboardSettings,
    updateAdminTheaterSettings,
    updateAdminPricingSettings,
    updateAdminNotificationSettings,
    updateAdminSecuritySettings,
    resetAdminSettings,
  } = useAppContext();

  const initialTab = useMemo(() => {
    const hashTab = (location.hash || "").replace("#", "");
    return tabs.some((tab) => tab.key === hashTab) ? hashTab : "theme";
  }, [location.hash]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const settings = await fetchAdminSettings(userId);
      if (settings) {
        setForm({
          theme: { ...defaultSettings.theme, ...(settings.theme || {}) },
          dashboard: {
            ...defaultSettings.dashboard,
            ...(settings.dashboard || {}),
          },
          theater: { ...defaultSettings.theater, ...(settings.theater || {}) },
          pricing: { ...defaultSettings.pricing, ...(settings.pricing || {}) },
          notifications: {
            ...defaultSettings.notifications,
            ...(settings.notifications || {}),
          },
          security: {
            ...defaultSettings.security,
            ...(settings.security || {}),
          },
        });
      }
      setIsLoading(false);
    };

    load();
  }, [userId]);

  const setTab = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/admin/settings#${tabKey}`);
  };

  const updateSection = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const saveCurrentTab = async () => {
    setIsSaving(true);
    let result = null;

    if (activeTab === "theme") {
      result = await updateAdminThemeSettings({ mode: form.theme.mode }, userId);
    }
    if (activeTab === "dashboard") {
      result = await updateAdminDashboardSettings(form.dashboard, userId);
    }
    if (activeTab === "theater") {
      result = await updateAdminTheaterSettings(form.theater, userId);
    }
    if (activeTab === "pricing") {
      result = await updateAdminPricingSettings(form.pricing, userId);
    }
    if (activeTab === "notifications") {
      result = await updateAdminNotificationSettings(form.notifications, userId);
    }
    if (activeTab === "security") {
      result = await updateAdminSecuritySettings(form.security, userId);
    }

    setIsSaving(false);

    if (result) {
      toast.success("Settings saved");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all admin settings to defaults?")) {
      return;
    }

    setIsSaving(true);
    const next = await resetAdminSettings(userId);
    setIsSaving(false);

    if (next) {
      setForm({
        theme: { ...defaultSettings.theme, ...(next.theme || {}) },
        dashboard: { ...defaultSettings.dashboard, ...(next.dashboard || {}) },
        theater: { ...defaultSettings.theater, ...(next.theater || {}) },
        pricing: { ...defaultSettings.pricing, ...(next.pricing || {}) },
        notifications: {
          ...defaultSettings.notifications,
          ...(next.notifications || {}),
        },
        security: { ...defaultSettings.security, ...(next.security || {}) },
      });
      toast.success("Reset complete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto">
      <Title text1="Admin" text2="Settings" />

      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3 md:p-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-red-600 text-white"
                : "bg-neutral-900 text-gray-300 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 md:p-6 space-y-6">
        {activeTab === "theme" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Mode</p>
              <select
                value={form.theme.mode}
                onChange={(e) => updateSection("theme", "mode", e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="md:col-span-2 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-gray-400">
              Theme mode switches full app appearance between dark and light.
              Brand colors stay unchanged.
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Layout</p>
              <select
                value={form.dashboard.layout}
                onChange={(e) =>
                  updateSection("dashboard", "layout", e.target.value)
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Items Per Page</p>
              <input
                type="number"
                min="1"
                max="100"
                value={form.dashboard.itemsPerPage}
                onChange={(e) =>
                  updateSection(
                    "dashboard",
                    "itemsPerPage",
                    Number(e.target.value || 1)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={form.dashboard.showSummary}
                onChange={(e) =>
                  updateSection("dashboard", "showSummary", e.target.checked)
                }
              />
              Show summary cards
            </label>
          </div>
        )}

        {activeTab === "theater" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Default City</p>
              <input
                type="text"
                value={form.theater.defaultCity}
                onChange={(e) =>
                  updateSection("theater", "defaultCity", e.target.value)
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Default Language</p>
              <input
                type="text"
                value={form.theater.defaultLanguage}
                onChange={(e) =>
                  updateSection("theater", "defaultLanguage", e.target.value)
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Default Format</p>
              <select
                value={form.theater.defaultFormat}
                onChange={(e) =>
                  updateSection("theater", "defaultFormat", e.target.value)
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Standard Price</p>
              <input
                type="number"
                min="0"
                value={form.theater.standardPrice}
                onChange={(e) =>
                  updateSection(
                    "theater",
                    "standardPrice",
                    Number(e.target.value || 0)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Premium Price</p>
              <input
                type="number"
                min="0"
                value={form.theater.premiumPrice}
                onChange={(e) =>
                  updateSection(
                    "theater",
                    "premiumPrice",
                    Number(e.target.value || 0)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">VIP Price</p>
              <input
                type="number"
                min="0"
                value={form.theater.vipPrice}
                onChange={(e) =>
                  updateSection(
                    "theater",
                    "vipPrice",
                    Number(e.target.value || 0)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Currency</p>
              <input
                type="text"
                value={form.pricing.currency}
                onChange={(e) =>
                  updateSection("pricing", "currency", e.target.value)
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Tax Percentage</p>
              <input
                type="number"
                min="0"
                value={form.pricing.taxPercentage}
                onChange={(e) =>
                  updateSection(
                    "pricing",
                    "taxPercentage",
                    Number(e.target.value || 0)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Convenience Fee</p>
              <input
                type="number"
                min="0"
                value={form.pricing.convenienceFee}
                onChange={(e) =>
                  updateSection(
                    "pricing",
                    "convenienceFee",
                    Number(e.target.value || 0)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {Object.entries(form.notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-gray-300"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) =>
                    updateSection("notifications", key, e.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <label className="flex items-center justify-between bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-gray-300">
              <span>Two-factor authentication</span>
              <input
                type="checkbox"
                checked={form.security.twoFactorEnabled}
                onChange={(e) =>
                  updateSection(
                    "security",
                    "twoFactorEnabled",
                    e.target.checked
                  )
                }
              />
            </label>
            <div>
              <p className="text-sm text-gray-400 mb-2">Session Timeout (seconds)</p>
              <input
                type="number"
                min="300"
                value={form.security.sessionTimeout}
                onChange={(e) =>
                  updateSection(
                    "security",
                    "sessionTimeout",
                    Number(e.target.value || 300)
                  )
                }
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-700 flex flex-wrap items-center gap-3">
          <button
            onClick={saveCurrentTab}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
