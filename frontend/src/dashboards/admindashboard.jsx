import React, { useState,useEffect } from "react";
import"../Styles/tailwind.css";
import Followup from "../components/followupsummary";
import Remainder from "../components/remaindersummary";
import {BarChart,Bar,XAxis,YAxis,Tooltip, ResponsiveContainer} from "recharts";
import {
  departmentCount,
  bottomText,
  getToday,
  normalizeDate,
  isThisMonth,
} from "../utils/leadutil";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";



const Dashboard = () => {

const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [walkins, setWalkins] = useState([]);
  const [fields, setFields] = useState([]);
  const [team, setTeam] = useState([]);

  const [activeTelecall, setActiveTelecall] = useState("New");
  const [activeWalkin, setActiveWalkin] = useState("New");
  const [activeField, setActiveField] = useState("New");
  const [activeTab1 , setActiveTab1] = useState("New");

  const today = getToday();

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    const [t, w, f, tm] = await Promise.all([
      axios.get("http://localhost:3000/api/Telecalls"),
      axios.get("http://localhost:3000/api/Walkins"),
      axios.get("http://localhost:3000/api/Fields"),
      axios.get("http://localhost:3000/api/teammember"),
    ]);

    setLeads(t.data);
    setWalkins(w.data);
    setFields(f.data);
    setTeam(tm.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  //  Auto refresh from forms
  useEffect(() => {
    const refresh = () => fetchAll();
    window.addEventListener("refresh-dashboard", refresh);
    return () =>
      window.removeEventListener("refresh-dashboard", refresh);
  }, []);

  /* TODAY COUNTS (RESET DAILY)  */

  const todaysTelecallsData = leads.filter(
  l => normalizeDate(l.call_date) === today
);
const todaysWalkinsData = walkins.filter(
  w => normalizeDate(w.walkin_date) === today
);
const todaysFieldsData = fields.filter(
  f => normalizeDate(f.visit_date) === today
);

const telecallToday = departmentCount(
  todaysTelecallsData,
  "call_outcome"
);
const walkinToday = departmentCount(
  todaysWalkinsData,
  "walkin_status"
);
const fieldToday = departmentCount(
  todaysFieldsData,
  "field_outcome"
);

  /* MONTHLY OVERALL (RESET MONTHLY) */

  const telecallMonth = departmentCount(
    leads.filter(l => isThisMonth(l.call_date)),
    "call_outcome"
  );

  const walkinMonth = departmentCount(
    walkins.filter(w => isThisMonth(w.walkin_date)),
    "walkin_status"
  );

  const fieldMonth = departmentCount(
    fields.filter(f => isThisMonth(f.visit_date)),
    "field_outcome"
  );

  const overallMonthly = {
    New: telecallMonth.New + walkinMonth.New + fieldMonth.New,
    Converted:
      telecallMonth.Converted +
      walkinMonth.Converted +
      fieldMonth.Converted,
    Disqualified:
      telecallMonth.Disqualified +
      walkinMonth.Disqualified +
      fieldMonth.Disqualified,
  };

  // 

  const leadTabs = [
  {
    label: "New",
    count: overallMonthly.New,
    color: "bg-orange-500",
  },
  {
    label: "Converted",
    count: overallMonthly.Converted,
    color: "bg-green-600",
  },
  {
    label: "Disqualified",
    count: overallMonthly.Disqualified,
    color: "bg-red-600",
  },
];



const followupNotes = {
  Todays: leads.filter(
    l =>
      l.followup_required === "Yes" &&
      normalizeDate(l.followup_date) === today &&
      l.followup_notes
      
  ),

  Due: leads.filter(
    l =>
      l.followup_required === "Yes" &&
       normalizeDate(l.followup_date) > today &&
      l.followup_notes
  ),

  Overdue: leads.filter(
    l =>
      l.followup_required === "Yes" &&
       normalizeDate(l.followup_date ) < today &&
      l.followup_notes
  ),
};

  const followupSummary = {
  Todays: followupNotes.Todays.length,
  Due: followupNotes.Due.length,
  Overdue: followupNotes.Overdue.length,
};

// remainder Notes

const remainderNotes = {
  Todays: leads.filter(
    l =>
      l.reminder_required === "Yes" &&
      normalizeDate(l.reminder_date) === today &&
      l.reminder_notes
  ),

  Due: leads.filter(
    l =>
      l.reminder_required === "Yes" &&
      normalizeDate(l.reminder_date) > today &&
      l.reminder_notes
  ),

  Overdue: leads.filter(
    l =>
      l.reminder_required === "Yes" &&
      normalizeDate(l.reminder_date) < today &&
      l.reminder_notes
  ),
};


  const remainderSummary = {
  Todays: remainderNotes.Todays.length,
  Due: remainderNotes.Due.length,
  Overdue: remainderNotes.Overdue.length,
};




// Status Colors;

 const statusColors = {
  New: {
    text: "text-orange-500",
    bg: "bg-orange-500",
  },
  Converted: {
    text: "text-green-600",
    bg: "bg-green-600",
  },
  Disqualified: {
    text: "text-red-600",
    bg: "bg-red-600",
  },
};

  // piechart Data

  const data = [
  { month: "Jan", profit: 7500, loss: 6000 },
  { month: "Feb", profit: 11500, loss: 9000 },
  { month: "Mar", profit: 8500, loss: 6500 },
  { month: "Apr", profit: 16500, loss: 13000 },
  { month: "May", profit: 12000, loss: 9000 },
  { month: "Jun", profit: 7500, loss: 6000 }
];


const Card = ({ title, value, percent, sub, positive }) => (
  <div className="rounded-xl p-6 bg-shell text-shell-text shadow-lg h-[180px] ">
    <p className=" text-sm">{title}</p>
    <h2 className=" text-2xl font-semibold mt-2">{value}</h2>
    <p className={`text-sm mt-1 ${positive ? "text-green-400" : "text-red-400"}`}>
      {percent} <span className="text-shell-text">{sub}</span>
    </p>
    <button className="text-sm  mt-4 flex items-center gap-1">
      View Report →
    </button>   
  </div>
);

  return (
    <div className="w-full p-8 lead-summary-main ">

       {/* admin dashboard */}
        
        <div className="p-6">
      <h1 className="text-2xl font-bold text-primary-text">
        Welcome back,{" "}
        <span className="text-blue-600">
          {user?.name || "User"}
        </span>{" "}
        👋
      </h1>

      <p className="text-primary-text mt-1">
        {user?.role === "admin"
          ? "You have admin access"
          : "Here’s your dashboard overview"}
      </p>
    </div>


      {/*  LEAD SUMMARY CARD */}
      <div className=" max-w-4xl mx-auto p-8 rounded-xl bg-shell text-shell-text shadow-lg  ">
        
        <h2 className="text-center  font-semibold text-lg mb-6">
          Lead Summary
        </h2>

        <div className="flex justify-center gap-14 ">
          {leadTabs.map((item) => (
            <div
              key={item.label}
              className="cursor-pointer text-center"
              onClick={() => setActiveTab1(item.label)}
            >
              <span
                className={`reaminder-font ${
                  activeTab1 === item.label ? "text-orange-500" : ""
                }`}
              >
                {item.label}
              </span>

              <span
                className={`ml-2 text-white px-2 py-[2px] text-sm rounded-full ${item.color}`}
              >
                {item.count}
              </span>

              {activeTab1 === item.label && (
                <div className="active-line"></div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t w-full mt-6 mb-6"></div>

        <div className="flex justify-center items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <p className=" font-medium text-[15px]">{bottomText(overallMonthly[activeTab1],activeTab1)}</p>
        </div>
      </div>
        
        {/* telecalling  */}

        <div className="flex mt-10 gap-8 justify-center ">
        <div className="w-[45%] bg-shell text-shell-text p-8 rounded-xl shadow-lg mr-10">

          <h2 className="text-center font-semibold text-lg mb-6">
            Tellecalling Summary
          </h2>

           {/*  */}

           <div className="flex justify-center gap-10">
          {["New", "Converted", "Disqualified"].map(status => (
            <div
              key={status}
              onClick={() => setActiveTelecall(status)}
              className="cursor-pointer text-center"
            >
              <span
                className={`reaminder-font ${
                  activeTelecall === status
                    ? statusColors[status].text
                    : ""
                }`}
              >
                {status}
              </span>

              <span className={`ml-2 text-white px-2 py-1 rounded-[50%]   w-10 h-5 text-xs  badge] 
               ${statusColors[status].bg
              }`}>
                {telecallToday[status]}
              </span>

              {activeTelecall === status && (
                <div className={`active-line mt-1 ${statusColors[status].bg}`}></div>
              )}
            </div>
          ))}
        </div>

          <div className="border-t w-full mt-6 mb-6"></div>

          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <p className=" font-medium text-[15px]">
                {bottomText(telecallToday[activeTelecall],activeTelecall)}
            </p>
          </div>
        </div>

        {/*  Walkin summary */}

       <div className="w-[50%]  p-8 rounded-xl bg-shell text-shell-text shadow-lg">

          <h2 className="text-center font-semibold text-lg mb-6">
            Walkin Summary
          </h2>

           {/*  */}

           <div className="flex justify-center gap-6">
          {["New", "Converted", "Disqualified"].map(status => (
            <div
              key={status}
              onClick={() => setActiveWalkin  (status)}
              className="cursor-pointer text-center"
            >
              <span
                className={`reaminder-font ${
                  activeWalkin === status
                    ? statusColors[status].text
                    :""
                }`}
              >
                {status}
              </span>

              <span className={`ml-2 text-white px-2 py-1 rounded-[50%] w-10 h-5 text-xs  badge] 
               ${statusColors[status].bg
              }`}>
                {walkinToday[status]}
              </span>

              {activeWalkin === status && (
                <div className={`active-line mt-1 ${statusColors[status].bg}`}></div>
              )}
            </div>
          ))}
        </div>

          <div className="border-t w-full mt-6 mb-6"></div>

          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <p className="font-medium text-[15px]">
                {bottomText(walkinToday[activeWalkin], activeWalkin)}
            </p>
          </div>
        </div>
      </div>



       {/* Field work summary */}


        <div className="justify-items-center mt-10  ">
         <div className="w-[50%]  p-8 bg-shell text-shell-text  rounded-xl shadow-lg ">

          <h2 className="text-center font-semibold text-lg mb-6">
            Fieldwork Summary
          </h2>

           {/*  */}

           <div className="flex justify-center gap-6">
          {["New", "Converted", "Disqualified"].map(status => (
            <div
              key={status}
              onClick={() => setActiveField  (status)}
              className="cursor-pointer text-center"
            >
              <span
                className={`reaminder-font ${
                  activeField  === status
                    ? statusColors[status].text
                    : ""
                }`}
              >
                {status}
              </span>

              <span className={`ml-2 text-white px-2 py-1 rounded-[50%]   w-10 h-5 text-xs  badge] 
               ${statusColors[status].bg
              }`}>
                {fieldToday[status]}
              </span>

              {activeField === status && (
                <div className={`active-line mt-1 ${statusColors[status].bg}`}></div>
              )}
            </div>
          ))}
        </div>

          <div className="border-t w-full mt-6 mb-6"></div>

          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <p className=" font-medium text-[15px]">
                {bottomText(fieldToday[activeField], activeField)}
            </p>
          </div>
        </div>
        </div>

        {/*  */}
          <div className="grid grid-cols-2 gap-6 mt-10 w-full">
               <Remainder data={remainderSummary} notes={remainderNotes} />
               <Followup data={followupSummary} notes={followupNotes} />

      </div>

         {/* cards */}
           <div className="grid grid-cols-2 gap-9 mt-20 ">
        <div className="grid grid-cols-2 gap-6 mb-6  ">
          <Card 
            title="Total Sales"
            value="$120,784.02"
            percent="↑ 12.3%"
            sub="+$1,453.89 today"
            positive
          />
          <Card
            title="Visitors"
            value="18,896"
            percent="↓ 5.6%"
            sub="-876 today"
            positive={false}
          />
          <Card
            title="Total Calls"
            value="18,896"
            percent="↓ 5.6%"
            sub="-876 today"
            positive={false}
          />
          <Card
            title="Field Work"
            value="18,896"
            percent="↓ 5.6%"
            sub="-876 today"
            positive={false}
          />
        </div>

       {/* Revenue Section */}
       <div className="mt-20">
        {/* Revenue Chart */}
        <div className="rounded-xl p-6 bg-shell text-shell-text shadow-lg w-full h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Revenue</h2>
              <p className="text-2xl font-bold">$16,400.12
                <span className="text-green-400 text-sm ml-2">↑ 10%</span>
              </p>
            </div>
            <select className="bg-orange-500 text-white px-3 py-2 rounded-md outline-none">
              <option>Month</option>
            </select>
          </div>

          <div className="flex gap-4 mb-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Profit
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span> Loss
            </span>
          </div>

          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="profit" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="loss" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Section - New Row */}
      <div className="mt-10 mb-10">
        <div className="rounded-xl p-6 bg-shell text-shell-text shadow-lg w-full min-h-[380px] overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-center border-b pb-2 uppercase tracking-wider">Team Member Quotation Summary</h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-center border-collapse">
              <thead className="sticky top-0 bg-[#2d3748] z-10">
                <tr className="text-xs uppercase text-gray-400 font-bold border-b border-gray-700">
                  <th className="p-3">Team Member Name</th>
                  <th className="p-3">Quotation Count</th>
                </tr>
              </thead>
              <tbody>
                {team.length === 0 ? (
                  <tr><td colSpan="2" className="py-10 text-gray-500 italic">No team data available</td></tr>
                ) : (
                  team.map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{t.first_name} {t.last_name}</td>
                      <td className="p-4">
                        <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold ring-1 ring-blue-500/30">
                          {t.quotation_count || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
