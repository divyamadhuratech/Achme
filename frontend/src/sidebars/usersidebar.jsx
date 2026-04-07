import React, { useState } from "react";
import {
  Home,
  Users,
  ListTodo,
  Phone,
  FileText, 
  Users2,
  BarChart2,
  ChevronDown,
  Headphones
} from "lucide-react";
import "../Styles/tailwind.css"
import { Link } from "react-router-dom";


const UserSidebar  = () => {
  const [openMenu, setOpenMenu] = useState(null);

  const menu = [
    { icon: <Home size={20} />, title: "Dashboard",path: "/dashboard" },
    { icon: <Users size={20} />, title: "Customers", subitems: ["Clients", "Client Users"] },
     { icon: <ListTodo size={20} />, title: "Tasks", label:"Task", path:"/dashboard/task" },
     { icon: <Phone size={20} />, title: "Leads", 
      subitems:[
        {label:"Telecalling Summary",path:"/dashboard/telecalling"}, 
        {label:"Walkins Summary",path:"/dashboard/walkins"},
       {label:"Field Work Summary",path:"/dashboard/field"},
     ]
    },
  
    { icon: <FileText size={20} />, title: "Proposals",path:"/dashboard/proposal"},
    { icon: <Headphones size={20} />, title: "Support" ,subitems:[{label: "Chat", path:"/dashboard/chat"}] },
    { icon: <Users2 size={20} />, title: "Team",subitems:["Team Members","Time Sheets" ] },
    { icon: <BarChart2 size={20} />, title: "Reports" }
  ];

  const toggleMenu = (i) => setOpenMenu(openMenu === i ? null : i);

  return (
   <aside className="side-mainbar">
  <ul className="space-y-1">
    {menu.map((item, i) => (
      <li key={i}>

        {/* MAIN ITEM → With direct path (Dashboard) */}
        {item.path ? (
          <Link
            to={item.path}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
          </Link>
        ) : (
          <>
            {/* MAIN ITEM → With sub menu (Projects, Sales, etc.) */}
            <button
              onClick={() => toggleMenu(i)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.title}</span>
              </div>

              {item.subitems && (
                <ChevronDown
                  size={18}
                  className={`${openMenu === i ? "rotate-180" : ""} transition`}
                />
              )}
            </button>

            {/* SUBMENU */}
            {openMenu === i && item.subitems && (
              <ul className="ml-9 mt-1 space-y-1 ">
                {item.subitems.map((s, j) => (
                  <li key={j}>
                    <Link
                      to={s.path}
                      className="text-sm text-gray-700 hover:text-black block submenu font-[Times-Roman] text-[16px]"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      </li>
    ))}
  </ul>
</aside>

  );
};

export default UserSidebar ;
