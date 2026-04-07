import React, { useState,useEffect,useRef } from "react";
import {
  Menu,
  Search,
  Star,
  Clock,
  Bell,
  Calendar,
  MessageSquare,
  Settings,
  PlusCircle,
  Globe,
  User,
  Lock,
  LogOut
} from "lucide-react";
import"../Styles/tailwind.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Topbar = () => {
 const [openProfile, setOpenProfile] = useState(false);
 const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);
  const [openBell, setOpenBell] = useState(false);

const [openSettings, setOpenSettings] = useState(false);

const settingsRef = useRef(null);

const changeTheme = (theme) => {
  document.documentElement.classList.remove("theme-dark");

  if (theme === "dark") {
    document.documentElement.classList.add("theme-dark");
  }
    setOpenSettings(false);
};



  // Fetch notification;
 useEffect(() => {
    axios
      .get("http://localhost:3000/api/task/notifications")
      .then(res => setNotifications(res.data))
      .catch(console.error);
  }, []);

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  // close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpenBell(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 
    const handleNotificationClick = async (notification) => {
    await axios.put(
      `http://localhost:3000/api/task/notifications/${notification.id}/read`
    );

    setOpenBell(false);
    navigate(`/dashboard/task?taskId=${notification.task_id}`);
  };




//  login logout
   const profileRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate("/login"); 
  };



  return (
// Change this line in Topbar.js
<header className="flex items-center justify-between px-6 h-16 z-50 bg-shell text-shell-text">       {/*  */}
        <div className="text-yellow-600 font-extrabold text-2xl tracking-wide border-left">
      MADHURA SOFTWARES
    </div>

      {/* Left menu + search */}
      <div className="flex items-center gap-4">
        <button className="text-gray-600"><Menu size={22} /></button>

        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-48"
          />
        </div>
      </div>

      {/* center icons */}

            <div className="menus-tab text-primary-text">
                 <ul className="flex gap-4">
                    <li>
                      <Star size={20}/>
                       
                    </li>
                    <li>
                      <Clock size={20}/>
                    </li>
                    <li ref={bellRef} className="relative cursor-pointer" >
                      <Bell size={20} onClick={() => setOpenBell(!openBell)} className="relative"/>
                          {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                           {unreadCount}
                            </span>
                            )}
                        <div>
                          {openBell && (
                         <div className="absolute left-[131px] top-10 w-72 bg-white shadow-lg rounded-lg border z-50 animate-slide-in-left">
                         <div className="px-4 py-2 border-b font-semibold text-sm">
                          Task Notifications
                        </div>

                        {notifications.length === 0 && (
                        <p className="p-4 text-sm text-primary-text">No notifications</p>)}

                        {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                           className={`px-4 py-3 cursor-pointer border-b ${
                           n.is_read === 0 ? "bg-blue-50" : ""} hover:bg-gray-100`}>
                          <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-primary-text">{n.description}</p>
                         </div>
                        ))}
                     </div>
                        )}
                  </div>
              </li>

                    <li>
                      <Calendar size={20}/>
                    </li>
                    <li>
                      <MessageSquare size={20} />
                    </li>
                     <li ref={settingsRef} >
                      <Settings size={20} 
                       onClick={() => setOpenSettings(!openSettings)}
                       />
                      {openSettings && (
  <div className="absolute top-10 right-0 w-44 bg-primary text-primary-text border shadow-lg rounded-md z-50 animate-slide-in-left">
    <div className="px-4 py-2 text-sm font-semibold border-b">
      Appearance
    </div>

    {/* Default Button */}
    <div
      onClick={() => changeTheme("default")}
      className="flex items-center gap-2 px-4 py-2 text-sm  cursor-pointer"
    >
      <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
      Default (White)
    </div>

    {/* Dark Button */}
    <div
      onClick={() => changeTheme("dark")}
      className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer"
    >
      <div className="w-3 h-3 rounded-full bg-[#0f172a]"></div>
      Dark Mode
    </div>
  </div>
)}
                    </li>
                     <li>
                      <PlusCircle size={20} />
                    </li>
                     <li>
                      <Globe size={20} />
                    </li>
                 </ul>

               
            </div>

         {/*  */}
         
      

      {/* user */}
      <div  ref={profileRef} className=" flex items-center gap-2 border-l pl-4 relative">
        <div
          onClick={() => setOpenProfile(!openProfile)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User size={18} />
          </div>
          <span className="text-sm text-primary-text">
            {user?.name || "Customer"}
          </span>
        </div>
        {/*  */}

          {openProfile && (
          <div className="absolute right-[-20px] top-12 w-52 bg-white shadow-lg rounded-lg border z-50 animate-doorOpen">
            <div className="px-4 py-3 border-b">
              <p className="font-semibold text-gray-800">
                {user?.name || "Customer"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "info@email.com"}
              </p>
            </div>

            <ul className="py-2 text-sm text-primary-text">
              <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <User size={16} /> My Profile
              </li>
              <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Lock size={16} /> Change Password
              </li>
              <hr />
              <li
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={16} /> Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/*  */}
      
      
    </header>
  );
};

export default Topbar;
