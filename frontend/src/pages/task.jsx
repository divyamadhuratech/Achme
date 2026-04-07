import React, { useState,useEffect } from "react";
import {
  Search,
  Plus,X } from "lucide-react";
 import "../Styles/tailwind.css"
import axios from "axios";

 const Task = () =>{
  const [open, setOpen] = useState(false);
const [tasks, setTasks] = useState([]);

  // Edit
     const [isEdit, setIsEdit] = useState(false);
     const [selectedtaskId, setSelectedtaskId] = useState(null);

    const fetchtask = async () => {
    try {
    const response = await axios.get("http://localhost:3000/api/task");      
    setTasks(response.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };
    useEffect(() => {
      fetchtask();
    }, []);
  

    //  delete project
    const deleteTask = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/api/task/${id}`);
    fetchtask();
  } catch (err) {
    console.log("delete error", err);
  }
};


    // from State
     const [form, setForm] = useState({
        project_name: "",
        task_title: "",
        client_name: "",
        staff_name: "",
        created_date: "",
        due_date: "",
        project_status: "",
        project_priority: "",
      });

     const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  
    //  Save 

  const saveTask = async (e) => {
  e.preventDefault();

  try {
    if (isEdit) {
      await axios.put(
        `http://localhost:3000/api/task/${selectedtaskId}`,
        form
      );
    } else {
      await axios.post("http://localhost:3000/api/task", form);
        console.log("Submitting form:", form);

    }

    setForm({
      project_name: "",
      task_title: "",
      client_name: "",
      staff_name: "",
      created_date: "",
      due_date: "",
      project_status: "",
      project_priority: "",
    });
    

    setOpen(false);
    setIsEdit(false);
    setSelectedtaskId(null);
    fetchtask();
  } catch (err) {
    console.log("Save/Edit Error:", err);
  }
};

const openEditModal = (selectedTask) => {
  setForm({
    project_name: selectedTask.project_name,
    task_title: selectedTask.task_title,
    client_name: selectedTask.client_name,
    staff_name: selectedTask.staff_name,
    created_date: selectedTask.created_date,
    due_date: selectedTask.due_date,
    project_status: selectedTask.project_status,
    project_priority: selectedTask.project_priority,
  });

  setSelectedtaskId(selectedTask.id);
  setIsEdit(true);
  setOpen(true);
};




const tabopen = () => {
  setOpen(true);
};
const newTasks = tasks.filter(t => t.project_status === "New");
const processTasks = tasks.filter(t => t.project_status === "Process");
const completedTasks = tasks.filter(t => t.project_status === "Completed");

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



    return (
       <div className="w-full h-[111vh]">
           <div className="mb-3">
                   <h1 className="text-2xl font-bold text-[#1694CE]">Task</h1>
                  <a className="text-sm text-gray-500" href="/dashboard"> Dashboard&gt; </a>
                 </div>
           
                 {/* ----------------- FILTER & SEARCH BAR ----------------- */}
                 <div className="bg-[#F3F8FA] p-4 rounded-xl flex justify-between items-center shadow mb-4">
           
                   {/* Search */}
                   <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg shadow border w-80">
                     <Search size={18} className="text-gray-500" />
                     <input
                       type="text"
                       placeholder="Search"
                       className="outline-none text-sm w-full"
                     />
                   </div>
           
                   {/* Top-Right Icons */}
                   <div className="flex items-center gap-3">
                     <div className="flex gap-2">
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">📁</div>
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">👤</div>
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">📊</div>
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">⬆️</div>
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">🔽</div>
                       <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">⚙️</div>
                     </div>
                   </div>
           
                   {/* Floating Add Button */}
                   <button   onClick={tabopen} className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] ">
                     <Plus size={24} />
                   </button>
                 </div>
 
                  <div>                 
                 <div className={`overlay ${open ? "show" : ""} justify-items-center`}>
                  
                 {/* task application */}
                   <div className={`${open ? "show" : ""}  task-application bg-white shadow-2xl p-9 rounded-xl w-[60%]  z-50`}>
                     
                     <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-semibold mb-8 text-gray-700">Add A New Task</h2>
                        <span className="mt-[-20px] x-icon" onClick={() => setOpen(false)} ><X/></span>
                   </div>

        <form onSubmit={saveTask} className="task-form space-y-6">
    {/* Project */}
    <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Project*</label>
      <input 
        type="text" 
        name="project_name" 
         value={form.project_name}
         onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>

    {/* Title */}
    <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Title*</label>
      <input 
        type="text" 
        name="task_title" 
         value={form.task_title}
        onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>

    {/* Status */}
    <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Status *</label>
      <select 
        name="project_status" 
         value={form.project_status}
         onChange={handleChange}
         className="form-control w-[60%] border rounded-lg p-2"
      > 
        <option value="" disabled>Select Priority</option>
        <option value="New">New</option>
        <option value="Process">Process</option>
        <option value="Completed">Completed</option>
      </select>
    </div>

    {/* Priority */}
    <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Priority *</label>
      <select 
        name="project_priority" 
        value={form.project_priority}
         onChange={handleChange}
        className="form-control w-[60%] border rounded-lg p-2"
      >
        <option value="" disabled>Select Priority</option> 
        <option value="Normal">Normal</option>
        <option value= "Low">Low</option>
        <option value="High" >High</option>
        <option value="Urgent" >Urgent</option>
      </select>
    </div>
    {/* client name */}
     <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Client*</label>
      <input 
        type="text" 
        name="client_name" 
         value={form.client_name}
        onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>

    {/*  */}

    <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Staff Name*</label>
      <input 
        type="text" 
        name="staff_name" 
         value={form.staff_name}
        onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>
    {/* start date */}
     <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Create Date*</label>
      <input 
        type="Date" 
        name="created_date" 
         value={form.created_date}
        onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>
    {/* due date */}
     <div className="flex items-center gap-6">
      <label className="w-40 text-lg">Due_date*</label>
      <input 
        type="date" 
        name="due_date" 
         value={form.due_date}
        onChange={handleChange} 
        className="form-control w-[60%] border rounded-lg p-2"
      />
    </div>

    {/* Buttons */}
    <div className="flex gap-4 pt-4">
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700" >
        Submit
      </button>

      <button onClick={() => setOpen(false)}
        type="button"
        className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-red-500">
        Close
      </button>
    </div>
    
  </form>
  </div>
</div>
</div>

{/*  */}

   <div className="grid grid-cols-3 gap-6 mt-6">

  {/* NEW */}
  <div className="bg-[#F3F8FA] rounded-xl shadow p-4 min-h-[300px] overflow-y-auto">
    <h3 className="font-semibold text-lg mb-4">New</h3>

    {newTasks.map(t => (
      <div
        key={t.id}
        className="bg-white rounded-lg shadow p-4 mb-4"
      >
        <div className="flex justify-between items-start">
          <p className="font-medium text-sm">{t.task_title}</p>
          <button onClick={() => openEditModal(t)}>⋮</button>
        </div>

        <span className="inline-block mt-2 px-2 py-1 text-xs bg-orange-500 text-white rounded">
          {t.project_priority}
        </span>

        <p className="text-xs text-gray-500 mt-2">
          Project: <span className="text-black">{t.project_name}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Client: <span className="text-black"> {t.client_name}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2" >Create Date: <span className="text-black">{t.created_date?.split("T")[0]} </span></p>
         <p className="text-xs text-gray-500 mt-2">Due Date: <span className="text-black"> {t.due_date?.split("T")[0]}</span></p>


        <div className="flex justify-between mt-3 text-xs">
          <button
            type="button"
           onClick={() => openEditModal(t)}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteTask(t.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* COMPLETED */}
  <div className="bg-[#F3F8FA] rounded-xl shadow p-4 min-h-[100px]">
    <h3 className="font-semibold text-lg mb-4">Completed</h3>

    {completedTasks.map(t => (
      <div
        key={t.id}
        className="bg-white rounded-lg shadow p-4 mb-4"
      >
        <p className="font-medium text-sm">{t.task_title}</p>
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500 text-white rounded">
          {t.project_priority}
        </span>
        <p className="text-xs text-gray-500 mt-2">
          Project: <span className="text-black">{t.project_name}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Client: <span className="text-black">{t.client_name}</span>
        </p>
         <p className="text-xs text-gray-500 mt-2">Create Date: <span className="text-black">{t.created_date?.split("T")[0]}</span></p>
         <p className="text-xs text-gray-500 mt-2">Due Date: <span className="text-black"> {t.due_date?.split("T")[0]}</span></p>

        {/*  */}
         <div className="flex justify-between mt-3 text-xs">
          <button
            type="button"
            onClick={() => openEditModal(t)}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteTask(t.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
    
  </div>

  {/* PROCESS */}
  <div className="bg-[#F3F8FA] rounded-xl shadow p-4 min-h-[100px]">
    <h3 className="font-semibold text-lg mb-4">Process</h3>

    {processTasks.map(t => (
      <div
        key={t.id}
        className="bg-white rounded-lg shadow p-4 mb-4"
      >
        <p className="font-medium text-sm">Title: <span className="text-black">{t.task_title}</span></p>
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded">
          {t.project_priority}
        </span>
          <p className="text-xs text-gray-500 mt-2">
          Project: <span className="text-black">{t.project_name }</span> 
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Client: {t.client_name}
        </p>
        <p className="text-xs text-gray-500 mt-2">Create Date: <span className="text-balck">{t.created_date?.split("T")[0]}</span></p>
        <p className="text-xs text-gray-500 mt-2">Due Date: <span className="text-black">{t.due_date?.split("T")[0]} </span></p>

         <div className="flex justify-between mt-3 text-xs">
          <button
          type="button"
            onClick={() => openEditModal(t)}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteTask(t.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>

</div>

</div>
    )
 }
 export default Task;