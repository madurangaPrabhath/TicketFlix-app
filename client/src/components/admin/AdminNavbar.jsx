import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Bell, Settings, LogOut, Menu } from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

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
        {/* Logo */}
        <Link
          to="/admin"
          className="flex items-center gap-2.5 text-red-600 text-xl font-extrabold no-underline transition-all duration-300 hover:text-red-500 shrink-0"
        >
          <Film size={28} strokeWidth={2.5} />
          <span className="text-white tracking-tight">TicketFlix Admin</span>
        </Link>

        {/* Center Space */}
        <div className="flex-1"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg">
            <Settings size={20} />
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-6 border-l border-neutral-700">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-gray-400 text-xs">Administrator</p>
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
