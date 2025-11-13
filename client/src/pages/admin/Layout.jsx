import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Menu, X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-semibold mb-2">Access Denied</p>
          <p className="text-gray-400">You don't have admin privileges</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex min-h-screen bg-black">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 right-6 md:hidden z-40 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Toggle Sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-30 pt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed md:static w-64 h-screen pt-16 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 z-40 md:z-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <AdminSidebar />
        </div>

        <main className="flex-1 pt-16 w-full overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
