import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

const Layout = () => {
  return (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 pt-16 bg-black min-h-screen">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
