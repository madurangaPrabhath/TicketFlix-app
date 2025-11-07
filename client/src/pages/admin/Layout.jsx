import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Menu, X } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
