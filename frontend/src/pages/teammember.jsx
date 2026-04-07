import React, { useState,useEffect} from "react";
import "../Styles/tailwind.css";
import { Search, Plus, X,Trash2,Edit,Mail } from "lucide-react";
import axios from "axios";

const Team = () => {
  const [open, setOpen] = useState(false);
  //  const [role, setRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);

const [team,setTeam] = useState([]);
 const [isEdit, setIsEdit] = useState(false);
     const [editId, setEditId] = useState(null);
  const tabopen = () => {
    setOpen(true);
  };

//  Fetch All Data;
const fetchTeam = async()=>{
 const res = await axios.get("http://localhost:3000/api/teammember");
 setTeam(res.data);
};

useEffect(()=>{
 fetchTeam();
},[]);

  const [form, setForm] = useState({
         first_name:"",
         last_name: "",
         emp_email: "",
         mobile: "",
         job_title: "",
         emp_role: "",
    });
  

  const handleChange = (e) =>{
    setForm({...form, [e.target.name]: e.target.value});
  };

 const saveTeam = async (e) =>{
  e.preventDefault();

  if(isEdit){
    await axios.put(`http://localhost:3000/api/teammember/${editId}`, form);
    alert("Successfully Updated");
  } else{
    await axios.post("http://localhost:3000/api/teammember/new", form);
    alert("Successfully Created");
  }

  fetchTeam();  
  resetForm();
  setOpen(false);
};



//  Edit
const editTeam = (data)=>{
  setForm({
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    emp_email: data.emp_email || "",
    mobile: data.mobile || "",
    job_title: data.job_title || "",
    emp_role: data.emp_role || ""
  });

  setEditId(data.id);
  setIsEdit(true);
  setOpen(true);
};


// Reset Form:
const resetForm = ()=>{
 setForm({
  first_name:"",
  last_name:"",
  emp_email:"",
  mobile:"",
  job_title:"",
  emp_role:""
 });
 setIsEdit(false);
 setEditId(null);
 setOpen(false);
};



// Delete:
 const deletefield = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/api/teammember/${id}`);
    fetchTeam();
      window.dispatchEvent(new Event("refresh-dashboard")); 

  } catch (err) {
    alert("message Deleted", err)
  }
};


  return (
    <div className="invoices-main-tab">
      <div className="invoice-heading-tab flex gap-4 justify-between item-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1694CE]">Estimates</h2>
          <a className="text-sm text-gray-500" href="vii">
            APP &gt; SALES
          </a>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-gray px-2 py-1 rounded-lg  border w-50 h-9 mt-3">
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
                📁
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                👤
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                📊
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

      <div className="overflow-y-auto ">
        <div className={`overlay ${open ? "show" : ""} overflow-y-auto  `}>
          <div
            className={`task-application bg-white shadow ml-[25%] w-[60%] mt-[60px]  mb-[50px] overflow-y-auto p-5 rounded-lg  ${
              open ? "show" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-700 mt-[10px]">
                Create A New Team Member
              </h2>
              <span className="mt-[-20px] x-icon" onClick={() => setOpen(false)} >
                <X />
              </span>
            </div>
     
          {/* Form */}

            <form onSubmit={saveTeam} className=" invoice-form p-6 space-y-6 relative ">

          {/* First Name */}
          <div className="grid grid-cols-4 items-center gap-6">
            <label className="text-sm text-gray-600 text-left">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
             className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-4 items-center gap-6">
            <label className="text-sm text-gray-600 text-left">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={form.last_name}
              onChange={handleChange}
              className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-6">
            <label  className="text-sm text-gray-600 text-left">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="emp_email"
              value={form.emp_email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-4 items-center gap-6">
            <label className="text-sm text-gray-600 text-left">
              Phone
            </label>
            <input
              type="tel"
               name="mobile"
               value={form.mobile}
               onChange={handleChange}
              placeholder="Enter phone number"
             className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />
          </div>

          {/* Job Title */}
          <div className="grid grid-cols-4 items-center gap-6">
            <label className="text-sm text-gray-600 text-left">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="job_title"
              value={form.job_title}
              onChange={handleChange}
              placeholder="Enter job title"
              className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />
          </div>

          {/* ROLE – CUSTOM DROPDOWN */}
           <div className="grid grid-cols-4 items-center gap-6 ">
               <label className="text-sm text-gray-600 text-left">
                 Role <span className="text-red-500">*</span>
                 </label>

            <div className="select-method-tab relative w-full col-span-3">

           <input
            readOnly
            value={form.emp_role}
             onClick={() => setRoleOpen(!roleOpen)}
             name="emp_role"
            className=" border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
            />

      <div
       className={`
        absolute left-0 right-0 top-full mt-1 bg-white
        border border-[#cfcfcf] z-30 transition-all duration-200
        ${roleOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"}
      `}
    >
      {["Developer", "BDM"].map((item) => (
        <div
          key={item}
          onClick={() => {
            setRoleOpen(false);
           setForm({ ...form, emp_role: item });
          }}
          
    
          className="px-3 py-2 cursor-pointer hover:bg-blue-600 hover:text-white text-left"
        >
          {item}
        </div>
      ))}
    </div>

  </div>
</div>

          <p className="text-[13px] text-[#777">
            * Required
          </p>

          <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>

                <button
                  onClick={resetForm}
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-red-500"
                >
                  Close
                </button>
              </div>
        </form>           
          </div>
          
        </div>
        {/* table */}
       <div className="mt-[60px] ">
    <table className="w-full border-collapse bg-white font-[Times-New-Roman] text-center">
  <thead className="border-b">
    <tr className="text-sm text-[#1694CE]">
      <th className="p-3">ID </th>
      <th className="p-3">Employee Name </th>
      <th className="p-3">Email</th>
      <th className="p-3">Job Title</th>
       <th className="p-3">Job Role</th>
      <th className="p-3">Action</th>
    </tr>
  </thead>

  <tbody>
  {team.length === 0 ? (
    <tr>
      <td colSpan="9" className="text-center py-10 text-gray-400">
        No invoices found
      </td>
    </tr>
  ) : (
    team.map((E) => (
      <tr key={E.id} className="border-b hover:bg-gray-50 text-sm">

          <td className="p-4">
            {E.id}
          </td>
        {/* client name */}
        <td className="p-4 text-[#1694CE]">
          {E.first_name}
        </td>
        {/* project title */}
        <td className="p-4">
          {E.emp_email || "---"}
        </td>
        {/*  */}
        <td className="p-4">
          {E.job_title || "---"}
        </td>
        {/*  */}
        <td className="p-4">
          {E.emp_role || "---"}
        </td>

        <td className="p-4 flex gap-3 ">
         <div className="flex gap-3 ml-[20px] ml-[60px]">
                     <button
                      type="button"
                       onClick={() => deletefield(E.id)}
                       className="text-red-500 hover:text-red-700">
                       <Trash2 size={18} />
                       </button>

                        <button
                         type="button"
                          onClick={() => editTeam(E)}
                          className="text-green-600 hover:text-green-800">
                          <Edit size={18} />
                         </button>

                         <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${E.emp_email}&su=${encodeURIComponent(
                          "Work Information"
                           )}&body=${encodeURIComponent(
                          `Hello ${E.first_name}` )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-800">
                          <Mail size={18} />
                         </a>
                      </div>
        </td>

      </tr>
    ))
  )}
</tbody>
</table>
</div> 
      </div>
    </div>
  );
};

export default Team;
