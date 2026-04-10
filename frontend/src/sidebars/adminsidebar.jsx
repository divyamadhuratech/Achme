import React, { useState } from "react";
import {
  Home,
  Users,
  FolderKanban,
  ListTodo,
  Phone,
  ShoppingCart,
  FileText,
  Briefcase,
  Headphones,
  Users2,
  BarChart2,
  ChevronDown,
   Wrench
} from "lucide-react";
import "../Styles/tailwind.css"
import { Link } from "react-router-dom";


const Sidebar = ({ onNavigate }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const menu = [
    { icon: <Home size={20} />, title: "Dashboard",path: "/dashboard" },
    { icon: <Users size={20} />, title: "Customers", subitems: [{label: "Clients", path: "/dashboard/clients"}] },
    { icon: <FolderKanban size={20} />, title: "Projects",  subitems: [
        { label: "Project", path: "/project" },
        { label: "Templates", path: "/project-templates" }
      ]},
     { icon: <ListTodo size={20} />, title: "Tasks", label:"Task", path:"/dashboard/task" },
    { icon: <Phone size={20} />, title: "Leads", 
     subitems:[
        {label:"Telecalling Summary",path:"/dashboard/telecalling"}, 
        {label:"Walkins Summary",path:"/dashboard/walkins"},
       {label:"Field Work Summary",path:"/dashboard/field"},
     ]
    },

    { icon: <ShoppingCart size={20} />, title: "Sales",subitems: [
      {label:"Invoice",path:"/dashboard/invoice"}, 
      {label:"Payments",path:"/dashboard/payments"},
      {label:"Estimates",path:"/dashboard/estimates"},
      {label:"Performa Invoice",path:"/dashboard/performainvoice"}
    ] },
      
    { icon: <FileText size={20} />, title: "Proposals",path:"/dashboard/proposal"},
    {
  icon: <Wrench size={20} />,
  title: "Services",
  subitems: [
    { label: "products", path: "/dashboard/products" }
  ]
},
    { icon: <Briefcase size={20} />, title: "Contracts",
     subitems:[{label:"Contracts", path:"/dashboard/contracts"}] },
    { icon: <Users2 size={20} />, title: "Team",subitems:[{label: "Team Member", path:"/dashboard/team"},"Time Sheets" ] },
    { icon: <BarChart2 size={20} />, title: "Reports", path: "/dashboard/reports" }
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
            onClick={onNavigate}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-primary-text hover:hover:text-blue-500"
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
              className="w-full flex items-center justify-between px-3 py-2 text-primary-text hover:text-blue-500"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.title}</span>
              </div>

              {item.subitems && (
                <ChevronDown
                  size={18}
                  className={`${openMenu === i ? "rotate-180" : ""} transition  `}
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
                      onClick={onNavigate}
                      className="text-sm text-primary-text hover:text-blue-500 block submenu font-[Times-Roman] text-[16px]"
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

export default Sidebar;
