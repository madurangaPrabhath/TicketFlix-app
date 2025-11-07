import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Plus, List, FileText, LogOut } from "lucide-react";
import { assets } from "../../assets/assets";

const AdminSidebar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Add Shows",
      path: "/admin/add-shows",
      icon: Plus,
    },
    {
      name: "List Shows",
      path: "/admin/list-shows",
      icon: List,
    },
    {
      name: "List Bookings",
      path: "/admin/list-bookings",
      icon: FileText,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black border-r border-neutral-800 pt-20 overflow-y-auto">
      <div className="px-6 py-8 border-b border-neutral-800">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.imageUrl}
            alt={user.firstName}
            className="w-14 h-14 rounded-full border-2 border-red-600 object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="px-3 py-6 space-y-2">
        <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold px-3 mb-4">
          Main Menu
        </p>
        {adminNavlinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 no-underline ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                    : "text-gray-400 hover:text-white hover:bg-neutral-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="flex-1">{link.name}</span>
                  {isActive && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 mx-3 my-6"></div>

      <div className="px-3 pb-6">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-red-600/20 transition-all duration-300">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
