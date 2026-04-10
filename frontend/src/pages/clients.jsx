import React, { useState, useEffect } from "react";
import { Search, Plus, X, Edit, Trash2 } from "lucide-react";
import "../Styles/tailwind.css";
import axios from "axios";

const Clients = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit
  const [isEdit, setIsEdit] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/client");
      setClients(response.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  //  delete client
  const deleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/client/${id}`);
      fetchClients();
    } catch (err) {
      console.log("delete error", err);
    }
  };

  // form State
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Save
  const saveClient = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/api/client/${selectedClientId}`, form);
        alert("Client updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/client", form);
        alert("Client added successfully");
      }

      resetForm();
      setOpen(false);
      fetchClients();
    } catch (err) {
      console.log("Save/Edit Error:", err);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      company_name: "",
      email: "",
      phone: "",
      address: "",
      state: "",
      pincode: "",
    });
    setIsEdit(false);
    setSelectedClientId(null);
  };

  const openEditModal = (selectedClient) => {
    setForm({
      name: selectedClient.name || "",
      company_name: selectedClient.company_name || "",
      email: selectedClient.email || "",
      phone: selectedClient.phone || "",
      address: selectedClient.address || "",
      state: selectedClient.state || "",
      pincode: selectedClient.pincode || "",
    });

    setSelectedClientId(selectedClient.id);
    setIsEdit(true);
    setOpen(true);
  };

  const tabopen = () => {
    resetForm();
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  // Filter clients by name
  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-[111vh]">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-[#1694CE]">Clients</h1>
        <a className="text-sm text-gray-500" href="/dashboard">
          Dashboard &gt; Customers &gt; Clients
        </a>
      </div>

      {/* ----------------- FILTER & SEARCH BAR ----------------- */}
      <div className="bg-[#F3F8FA] p-4 rounded-xl flex justify-between items-center shadow mb-4">
        {/* Search */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg shadow border w-80">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search Clients"
            className="outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Floating Add Button */}
        <button
          onClick={tabopen}
          className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848]"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl mt-[20px] overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#f8faf9]">
            <tr className="text-black font-[Times-New-Roman] uppercase text-xs border-b">
              <th className="px-4 py-3 border text-left">ID</th>
              <th className="px-4 py-3 border text-left">Name</th>
              <th className="px-4 py-3 border text-left">Company</th>
              <th className="px-4 py-3 border text-left">Email</th>
              <th className="px-4 py-3 border text-left">Phone</th>
              <th className="px-4 py-3 border text-left">Address</th>
              <th className="px-4 py-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-[Times-New-Roman]">
            {filteredClients.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 border">{c.id}</td>
                <td className="px-4 py-3 border font-medium">{c.name}</td>
                <td className="px-4 py-3 border">{c.company_name}</td>
                <td className="px-4 py-3 border">{c.email}</td>
                <td className="px-4 py-3 border">{c.phone}</td>
                <td className="px-4 py-3 border">{c.address}, {c.state} - {c.pincode}</td>
                <td className="px-4 py-3 border">
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteClient(c.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <div className={`overlay ${open ? "show" : ""} justify-items-center`}>
        <div className={`${open ? "show" : ""} task-application bg-white shadow-2xl p-9 rounded-xl w-[60%] z-50 mt-10`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-700">
              {isEdit ? "Edit Client" : "Add A New Client"}
            </h2>
            <span
              className="x-icon cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X />
            </span>
          </div>

          <form onSubmit={saveClient} className="task-form space-y-6">
            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Name*</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Email*</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="w-40 text-lg">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="form-control w-[60%] border rounded-lg p-2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Submit
              </button>
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="bg-gray-400 text-white px-8 py-2 rounded-lg hover:bg-red-500 transition shadow-md"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Clients;
