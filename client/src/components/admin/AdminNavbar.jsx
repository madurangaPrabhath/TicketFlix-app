import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Bell, Settings, LogOut, X } from "lucide-react";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-neutral-900 to-black border-b border-neutral-800 z-40">
      <div className="max-w-full px-8 h-16 flex items-center justify-between gap-6">
        <Link
          to="/admin"
          className="flex items-center gap-2.5 text-red-600 text-xl font-extrabold no-underline transition-all duration-300 hover:text-red-500 shrink-0"
        >
          <Film size={28} strokeWidth={2.5} />
          <span className="text-white tracking-tight">TicketFlix Admin</span>
        </Link>

        <div className="flex-1"></div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="relative p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="text-white font-semibold text-sm">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 cursor-pointer transition-colors">
                    <p className="text-white text-sm font-medium">
                      New Booking
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      5 new bookings received
                    </p>
                  </div>
                  <div className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 cursor-pointer transition-colors">
                    <p className="text-white text-sm font-medium">
                      Show Updated
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Inception show time changed
                    </p>
                  </div>
                  <div className="p-4 hover:bg-neutral-800/50 cursor-pointer transition-colors">
                    <p className="text-white text-sm font-medium">
                      Revenue Alert
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Daily revenue target reached
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg"
            >
              <Settings size={20} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="text-white font-semibold text-sm">Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-neutral-800/50 hover:text-white rounded-lg transition-colors text-sm">
                    Dashboard Settings
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-neutral-800/50 hover:text-white rounded-lg transition-colors text-sm">
                    Theater Configuration
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-neutral-800/50 hover:text-white rounded-lg transition-colors text-sm">
                    Pricing Settings
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-neutral-800/50 hover:text-white rounded-lg transition-colors text-sm">
                    Notification Preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-neutral-700">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>

            {/* Clerk User Profile Button */}
            <div className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: "flex items-center gap-2",
                    userButtonTrigger:
                      "p-0 hover:opacity-80 transition-opacity",
                    avatarBox:
                      "w-9 h-9 rounded-lg border border-red-600/20 hover:border-red-600/50",
                    userButtonPopoverCard:
                      "bg-neutral-900 border border-neutral-800",
                    userPreviewMainIdentifier: "text-white",
                    userPreviewSecondaryIdentifier: "text-gray-400",
                    profileSectionTitle: "text-gray-400",
                    profileSectionTitleText: "text-xs",
                    organizationPreviewMainIdentifier: "text-white",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-600/10 rounded-lg transition-all duration-300 text-sm"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
