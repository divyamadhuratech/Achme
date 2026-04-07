import React,{useState,useEffect} from "react";
import "../Styles/tailwind.css";
import { Search, Plus,ChevronDown,X ,Trash2,Edit} from "lucide-react";
import axios from "axios";
import {getToday} from "../utils/leadutil";


const Telecall = () =>{
     const [outcomeOpen, setOutcomeOpen] = useState(false);
     const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [remainderDetails, setRemainderDetails] = useState(false);
    
    const [followOpen, setFollowOpen] = useState(false);
     const [open, setOpen] = useState(false);
    const tabopen = () => {
    setOpen(true);
  };
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  

  // Date Time
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};



  const [form, setForm] = useState({
       customer_name: "",
       mobile_number: "",
       location_city: "",
       call_date: "",
       service_name: "",
       staff_name: "",
       call_outcome: "New",
      followup_required: "Default",
      followup_date: "",
      followup_notes: "",
      reminder_required: "Default",
      reminder_date: "",
       reminder_notes: "",

  })

  // Background Scroll
 useEffect(() => {
  document.body.style.overflow = open ? "hidden" : "auto";
  return () => (document.body.style.overflow = "auto");
}, [open]);

// 

  const [Telecalls, setTelecall] = useState([]);
 
  // Fetch all data

    const fetchTelecalls = async () => {
    const res = await axios.get("http://localhost:3000/api/Telecalls");
    setTelecall(res.data);
  };

  useEffect(() => {
    fetchTelecalls();
  }, []);


// Handle Change

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


// Save 
const saveTelecall = async (e) => {
  e.preventDefault();
  const today = getToday();

  const payload = {
    ...form,
    call_date: form.call_date || today,
  };

  if (isEdit) {
    await axios.put(
      `http://localhost:3000/api/Telecalls/${editId}`,
      payload );
       alert("Successfully Updated")
  } else {
    await axios.post(
      "http://localhost:3000/api/Telecalls",
      payload
    );
    alert("Successfully Created");
  }

  fetchTelecalls();
  window.dispatchEvent(new Event("refresh-dashboard")); 
  setOpen(false);
  setIsEdit(false);
};

// Edit;
 const openEdit = async (id) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/Telecalls/${id}`);
    const data = res.data;

    setForm({
      customer_name: data.customer_name || "",
      mobile_number: data.mobile_number || "",
      location_city: data.location_city || "",
      call_date: data.call_date || "",
      service_name: data.service_name || "",
      staff_name: data.staff_name || "",
      call_outcome: data.call_outcome || "New",

      followup_required: data.followup_required || "Default",
      followup_date: data.followup_date || "",
      followup_notes: data.followup_notes || "",
      reminder_required: data.reminder_required || "Default",
      reminder_date: data.reminder_date || "",
      reminder_notes: data.reminder_notes || "",
    });

    setEditId(id);
    setIsEdit(true);
    setOpen(true);
  } catch (err) {
    console.error(err);
    alert("Failed to load field data");
  }
};



// delete;

 const deletefield = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/api/Telecalls/${id}`);
    fetchTelecalls();
      window.dispatchEvent(new Event("refresh-dashboard")); 

  } catch (err) {
    alert("message Deleted", err)
  }
};

// 
useEffect(() => {
  if (open) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
  
  // Clean up when component unmounts
  return () => document.body.classList.remove("modal-open");
}, [open]);


   return(
     <center className="">
        <div className="invoice-heading-tab flex gap-4 justify-between item-center">
        <div>
          <h2 className="text-2xl font-[Times-Roman] text-[25px] font-bold text-[#1694CE]">Telecalling Summary</h2>
          <a  className="text-[30px] text-black-500 font-['Times_New_Roman',serif] mr-[110px]" href="vii">
            Leed &gt; Telecalling
          </a>
        </div>

        <div className="flex gap-3 ">
          <div className="flex items-center gap-3 bg-gray px-2 py-1 rounded-lg  border w-50 h-9 mt-4">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="Search outline-none text-sm w-full bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                👤
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                ⬆️
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                🔽
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                ⚙️
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={() => tabopen(true)}
              className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] "
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

     {/*Form */}
        <div className="application-maintab  p-5">
           <div className={`overlay ${open ? "show" : ""} justify-items-center pb-[50px]`}>
           <div  className={`task-application bg-white shadow ml-[50px] mt-20 w-[65%] z-70  p-10 rounded-lg  ${
             open ? "show" : ""
            }`}>
              {/*  */}

                 <div className="flex justify-between items-center ">
                   <h2 className="text-2xl font-semibold mb-8 text-gray-700 mt-[-20px]">
                        Add A Telecalling Summary
                     </h2>
                    <span className="mt-[-20px] x-icon" >
                     <X onClick={() => setOpen(false)} />
                       </span>
                     </div>

                <form  onSubmit={saveTelecall} className=" invoice-form p-6 space-y-6 relative">
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Customer Name</label>
                   <input type="text" value={form.customer_name} onChange={handleChange} name="customer_name"  className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}
                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Mobile Number</label>
                   <input type="text" value={form.mobile_number} onChange={handleChange} name="mobile_number" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}

                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Location / City</label>
                   <input type="text" value={form.location_city} onChange={handleChange} name="location_city" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>
               
                 {/*  */}

                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor=""  className="text-sm text-gray-600 text-left">Call Date</label>
                   <input type="Date" value={form.call_date} onChange={handleChange} name="call_date" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Services</label>
                   <input type="text" value={form.service_name} onChange={handleChange} name="service_name" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>
                {/*  */}
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Asigned Staf</label>
                   <input type="text" value={form.staff_name} onChange={handleChange}  name="staff_name" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>
  
              {/*Call outcome  */}
                 
                <div className="grid grid-cols-4 items-center gap-6">
                 <label className="text-sm text-gray-600 text-left">Call Outcome <span className="text-red-500">*</span>
                </label>
                 <div className="relative col-span-3">
    {/* INPUT */}
                  <input type="text" readOnly value={form.call_outcome} name="call_outcome" placeholder="Select Outcome"   onClick={() => setOutcomeOpen(!outcomeOpen)}
                  className="border rounded-md px-3 py-2 outline-none w-full cursor-pointer "/>

    {/* ICON */}
                 <ChevronDown
                   size={18}
                   className={`absolute top-3.5 right-4 cursor-pointer transition-transform duration-300 ${
                   outcomeOpen ? "rotate-180" : ""
                     }`}
                  onClick={() => setOutcomeOpen(!outcomeOpen)} />

         {/* DROPDOWN OPTIONS */}
              {outcomeOpen && (
                 <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-20">
                 {["New", "Converted", "Disqualified"].map((outcome) => (
          <div
            key={outcome}
            onClick={() => {
              setForm({ ...form, call_outcome: outcome });
              setOutcomeOpen(false);
            }}
            className="px-3 py-2 cursor-pointer hover:bg-blue-600 hover:text-white text-left"
          >
            {outcome}
          </div>
        ))}
      </div>
    )}
  </div>
  </div>

  {/* Follow UP */}
              <div className="flex justify-between items-center text-sm text-gray-600 more">
                <span className="text-black font-[Times-Roman-Serif] text-[22px]">More Details</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer"  checked={showMoreDetails}
                    onChange={() => setShowMoreDetails(!showMoreDetails)} />
                  <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition peer-checked:after:translate-x-5"></div>
                </label>
              </div>
         {showMoreDetails && (
            <div className="items-center pt-[50px] h-[40vh] ">
              <div className="pb-[250px] ">

               <div className=" flex items-center gap-2">
                 <label className="text-sm text-gray-600 text-left ">Follow Up </label>
                 <div className="relative left-[60px]">
    {/* INPUT */}
                  <input type="text"  readOnly value={form.followup_required} name="followup_required" placeholder="Select Follow Up"   onClick={() => setFollowOpen(!followOpen)}
                  className="border rounded-md px-3 py-2 outline-none w-full cursor-pointer "/>

    {/* ICON */}
                 <ChevronDown
                   size={18}
                   className={`absolute top-3.5 right-4 cursor-pointer transition-transform duration-300 ${
                   followOpen ? "rotate-180" : ""
                     }`}
                  onClick={() => setFollowOpen(!followOpen)} />

         {/* DROPDOWN OPTIONS */}
              {followOpen && (
                 <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-20">
                 {["Default","Yes","No"].map((outcome) => (
          <div
            key={outcome}
            onClick={() => {
              setForm({ ...form, followup_required:outcome });
              setFollowOpen(false);
            }}
            className="px-3 py-2 cursor-pointer hover:bg-blue-600 hover:text-white text-left"
          >
            {outcome}
          </div>
        ))}
      </div>
    )}
  </div>
   <div className="flex items-center gap-10 relative left-[80px]">
       <label htmlFor="" className="text-sm text-gray-600 w-[110px] whitespace-nowrap ml-[10px]">Followup Date</label>
       <input onChange={handleChange} value={form.followup_date} type="Date" name="followup_date" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]" />
     </div>
  </div>
   <div className="flex items-center gap-4 mt-[25px]">
        <label className="text-sm text-gray-600 w-[110px] whitespace-nowrap">
          Followup Notes
        </label>

        <input
          type="text"
          onChange={handleChange}
          value={form.followup_notes}
          name="followup_notes"
          className="border outline-none rounded-md px-3 py-2 w-[200px] bg-white ml-[20px]"
        />
      </div>

      {/* Remainder */}


               <div className="items-center more">
               <div className=" flex items-center gap-2">
                 <label className="text-sm text-gray-600 text-left ">Remainder Up </label>
                 <div className="relative left-[30px]">
    {/* INPUT */}
                  <input type="text"   readOnly  value={form.reminder_required} name="reminder_required" placeholder="Select Follow Up"   onClick={() => setRemainderDetails(!remainderDetails)}
                  className="border rounded-md px-3 py-2 outline-none w-full cursor-pointer "/>

    {/* ICON */}
                 <ChevronDown
                   size={18}
                   className={`absolute top-3.5 right-4 cursor-pointer transition-transform duration-300 ${
                   remainderDetails ? "rotate-180" : ""
                     }`}
                  onClick={() => setRemainderDetails(!remainderDetails)} />

         {/* DROPDOWN OPTIONS */}
              {remainderDetails && (
                 <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-20">
                 {["Default","Yes","No"].map((outcome) => (
          <div
            key={outcome}
            onClick={() => {
              setForm({ ...form, reminder_required:outcome });
              setRemainderDetails(false);
            }}
            className="px-3 py-2 cursor-pointer hover:bg-blue-600 hover:text-white text-left"
          >
            {outcome}
          </div>
        ))}
      </div>
    )} 
  </div>
   <div className="flex items-center gap-10 relative left-[50px]">
       <label htmlFor="" className="text-sm text-gray-600 w-[110px] whitespace-nowrap ml-[10px]">Remainder Date</label>
       <input type="Date" value={form.reminder_date} onChange={handleChange} name="reminder_date" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]" />
     </div>
  </div>
   <div className="flex items-center gap-4 mt-[25px]">
        <label className="text-sm text-gray-600 w-[110px] whitespace-nowrap">
          Remainder Notes
        </label>

        <input
          type="text"
          onChange={handleChange}
          value={form.reminder_notes}
          name="reminder_notes"
          className="border outline-none rounded-md px-3 py-2 w-[200px] bg-white ml-[20px]"
        />
      </div>
  </div>   
  </div>   
  </div> 
  
  )}
  
  {/* submit and  close */}
     <div className="flex gap-4 pt-4 more2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Submit
                </button>

                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-red-500"
                >
                  Close
                </button>
              </div>
        </form>
      </div>
      
       {/*Table  */}    
     </div>
     <div className="bg-white shadow rounded-xl overflow-x-auto mt-5 ">
  <table className="w-full text-sm border border-gray-300 table-fixed w-[140%]">
    <thead className="bg-[#f8faf9]">
      <tr className="text-black font-[Times-New-Roman] uppercase text-xs ">
        <th className="border px-4 py-3 w-[50px] text-center">ID</th>
        <th className="border px-4 py-3">Customer Name</th>
        <th className="border px-4 py-3">Mobile Number</th>
        <th className="border px-4 py-3">City</th>
        <th className="border px-4 py-3 w-[140px]">Call Date</th>
        <th className="border px-4 py-3">Service</th>
        <th className="border px-4 py-3">Staff</th>
        <th className="border px-4 py-3 w-[90px] text-center">Actions</th>
      </tr>
    </thead>

    <tbody className="text-sm font-[Times-New-Roman] text-center">
      {Telecalls.map((T) => (
        <tr
          key={T.id}
          className="hover:bg-gray-100 hover:text-black transition"
        >
          <td className="border px-4 py-2 text-center">
            {T.id}
          </td>
          <td className="border px-4 py-2 ">
            {T.customer_name}
          </td>
          <td className="border px-4 py-2 whitespace-nowrap">
            {T.mobile_number}
          </td>
          <td className="border px-4 py-2 truncate">
            {T.location_city}
          </td>
          <td className="border px-4 py-2 ">
            {formatDate(T.call_date)}
          </td>
          <td className="border px-4 py-2">
            {T.service_name}
          </td>
          <td className="border px-4 py-2 truncate">
            {T.staff_name}
          </td>
          <td className="border px-4 py-2 text-center">
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => deletefield(T.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => openEdit(T.id)}
                className="text-green-600 hover:text-green-800"
              >
                <Edit size={16} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  

  </center>
   )
}
export default Telecall;