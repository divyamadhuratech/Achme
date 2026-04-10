import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState, createContext, useContext } from "react";

import Topbar from "../components/navbar";
import AdminSidebar from "../sidebars/adminsidebar";
import UserSidebar from "../sidebars/usersidebar";

// Context to pass dashboard search query to the dashboard page
export const DashboardSearchContext = createContext("");

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  return (
    <DashboardSearchContext.Provider value={searchQuery}>
      {/* TOPBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Topbar
          onHamburgerClick={() => setSidebarOpen(prev => !prev)}
          showSearch={isDashboard}
          onSearch={setSearchQuery}
        />
      </div>

      <div className="flex">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed left-0 top-[65px] h-[calc(100vh-65px)] bg-shell text-shell-text z-40 transition-transform duration-300
            w-[250px]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0`}
        >
          {user.role === "admin" ? (
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          ) : (
            <UserSidebar onNavigate={() => setSidebarOpen(false)} />
          )}
        </div>

        {/* CENTER CONTENT */}
        <div className="lg:ml-[250px] mt-[65px] w-full p-4 lg:p-6 min-h-screen text-shell-text bg-content">
          <Outlet />
        </div>
      </div>
    </DashboardSearchContext.Provider>
  );
}
