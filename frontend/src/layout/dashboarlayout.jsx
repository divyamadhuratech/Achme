import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import Topbar from "../components/navbar";
import AdminSidebar from "../sidebars/adminsidebar";
import UserSidebar from "../sidebars/usersidebar";

export default function DashboardLayout() {
  const { user } = useAuth();
  

  if (!user) return <Navigate to="/login" />;

  return (
    <>
      {/* TOPBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Topbar />
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <div className="fixed left-0 top-[65px] w-[250px] h-[calc(100vh-60px)] bg-shell text-shell-text">
          {user.role === "admin" ? <AdminSidebar /> : <UserSidebar />}
        </div>

        {/* CENTER CONTENT */}
        <div className="ml-[250px] mt-[60px] w-full p-6 min-h-screen text-shell-text bg-content text-shell-text">
         <Outlet />
         </div>
      </div>
    </>
  );
}
