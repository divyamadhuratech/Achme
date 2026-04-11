import React, { useState, useEffect } from "react";
import "../Styles/tailwind.css";
import { Search, Plus, X, Edit2, Trash2, Eye } from "lucide-react";
import axios from "axios";

const Invoice = () => {
  const [open, setOpen] = useState(false);
  const [viewInv, setViewInv] = useState(null);
  const [editId, setEditId] = useState(null);

  const [clientSearch, setClientSearch] = useState("");
  const [clientList, setClientList] = useState([]);
  const [clientType, setClientType] = useState("existing");

  const [companyName, setCompanyName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const [projectNames, setProjectname] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [category, setCategory] = useState("Default");

  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const formatInvoiceId = (id) => `INV-${String(id).padStart(6, "0")}`;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-IN") : "---";

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/invoice/with-payments");
      setInvoices(res.data);
    } catch (err) { console.log("Fetch Error:", err); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const resetForm = () => {
    setClientSearch(""); setClientList([]); setClientType("existing");
    setCompanyName(""); setFirstname(""); setLastname(""); setEmail("");
    setProjectname(""); setInvoiceDate(""); setInvoiceDueDate(""); setCategory("Default");
    setEditId(null); setOpen(false);
  };

  const openEdit = async (inv) => {
    setEditId(inv.id);
    setClientSearch(inv.client_company || "");
    setProjectname(inv.project_names || "");
    setInvoiceDate(inv.invoice_date ? inv.invoice_date.split("T")[0] : "");
    setInvoiceDueDate(inv.invoice_duedate ? inv.invoice_duedate.split("T")[0] : "");
    setCategory(inv.category || "Default");
    setClientType("existing");
    setOpen(true);
  };

  const searchClient = async (value) => {
    setClientSearch(value);
    if (!value) return setClientList([]);
    try {
      const res = await axios.get(`http://localhost:3000/api/client/search?name=${value}`);
      setClientList(res.data);
    } catch (err) { console.log(err); }
  };

  const selectClient = (client) => {
    setClientSearch(client.company_name);
    setClientList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (clientType === "new") {
        if (!companyName || !firstname || !lastname || !email) return alert("Please fill all client details");
        await axios.post("http://localhost:3000/api/client/new", {
          company_name: companyName, client_firstname: firstname,
          client_lastname: lastname, client_email: email,
        });
        alert("Client created successfully");
        resetForm(); return;
      }

      if (editId) {
        await axios.put(`http://localhost:3000/api/invoice/${editId}`, {
          client_company: clientSearch, project_names: projectNames,
          invoice_date: invoiceDate, invoice_duedate: invoiceDueDate, category,
        });
        alert("Invoice updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/invoice/new", {
          client_company: clientSearch, project_names: projectNames,
          invoice_date: invoiceDate, invoice_duedate: invoiceDueDate, category,
        });
        alert("Invoice created successfully");
      }
      fetchInvoices();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Submission failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/invoice/${id}`);
      fetchInvoices();
    } catch (err) { alert("Delete failed"); }
  };

  const filtered = invoices.filter(inv =>
    inv.client_company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="invoices-main-tab">
      <div className="invoice-heading-tab flex gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1694CE]">INVOICES</h2>
          <span className="text-sm text-gray-500">APP &gt; SALES</span>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-lg border h-9 mt-3">
            <Search size={18} className="text-gray-500" />
            <input type="text" placeholder="Search by company name..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-44 bg-transparent" />
          </div>
          <div className="mt-2">
            <button onClick={() => { resetForm(); setOpen(true); }}
              className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848]">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <div className={`overlay ${open ? "show" : ""} overflow-y-auto`}>
        <div className="task-application bg-white shadow ml-[18%] w-[70%] mb-[50px] overflow-y-auto p-5 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">
              {editId ? "Edit Invoice" : "Create A New Invoice"}
            </h2>
            <span className="x-icon cursor-pointer" onClick={resetForm}><X /></span>
          </div>

          <form className="invoice-form p-6 space-y-6 relative" onSubmit={handleSubmit}>
            <div>
              <div className="grid grid-cols-4 items-center gap-6">
                <label className="text-sm text-gray-600">Client<span className="text-red-500">*</span></label>
                {clientType === "existing" && (
                  <input type="text" value={clientSearch} onChange={e => searchClient(e.target.value)}
                    className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-full"
                    placeholder="Search Client Company" />
                )}
              </div>
              {clientList.length > 0 && (
                <div className="absolute bg-white ml-[190px] border shadow-md mt-1 w-[300px] z-10">
                  {clientList.map((c, i) => (
                    <p key={i} onClick={() => selectClient(c)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      {c.company_name}
                    </p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-6 mt-4">
                <label className="text-sm text-gray-600">Project</label>
                <input type="text" value={projectNames} onChange={e => setProjectname(e.target.value)}
                  className={`col-span-3 border rounded-md px-3 py-2 outline-none w-full ${clientType === "new" ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                  disabled={clientType === "new"} />
              </div>
            </div>

            {clientType === "new" && (
              <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-4 items-center gap-6">
                  <label>Company Name<span className="text-red-500">*</span></label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none" />
                </div>
                <div className="grid grid-cols-4 items-center gap-6">
                  <label>First Name<span className="text-red-500">*</span></label>
                  <input value={firstname} placeholder="e.g. Ravi" onKeyDown={e => { if (/[0-9]/.test(e.key)) e.preventDefault(); }}
                    onChange={e => setFirstname(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none" />
                </div>
                <div className="grid grid-cols-4 items-center gap-6">
                  <label>Last Name<span className="text-red-500">*</span></label>
                  <input value={lastname} placeholder="e.g. Kumar" onKeyDown={e => { if (/[0-9]/.test(e.key)) e.preventDefault(); }}
                    onChange={e => setLastname(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none" />
                </div>
                <div className="grid grid-cols-4 items-center gap-6">
                  <label>Email<span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none" />
                </div>
              </div>
            )}

            {!editId && (
              <div className="text-sm text-gray-500 text-right">
                <span onClick={() => setClientType("new")} className="cursor-pointer hover:text-blue-600">New Client</span>
                {" | "}
                <span onClick={() => setClientType("existing")} className="cursor-pointer bg-gray-300 text-white px-2 py-1 rounded">Existing Client</span>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-sm text-gray-600">Invoice Date<span className="text-red-500">*</span></label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none w-full" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-sm text-gray-600">Due Date<span className="text-red-500">*</span></label>
              <input type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-sm text-gray-600">Category<span className="text-red-500">*</span></label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white">
                <option value="Default">Default</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editId ? "Update" : "Submit"}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-red-500">Close</button>
            </div>
          </form>
        </div>
      </div>

      {/* View Modal */}
      {viewInv && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-lg p-8 relative">
            <button onClick={() => setViewInv(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
            <h2 className="text-xl font-bold text-[#1694CE] mb-6">Invoice Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Invoice ID</span><span className="font-semibold">{formatInvoiceId(viewInv.id)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Company</span><span className="font-semibold">{viewInv.client_company}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Project</span><span>{viewInv.project_names || "---"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Invoice Date</span><span>{formatDate(viewInv.invoice_date)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Due Date</span><span>{formatDate(viewInv.invoice_duedate)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Category</span><span>{viewInv.category || "Default"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Payments Received</span><span className="font-bold text-green-600">₹{Number(viewInv.paid_amount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Status</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${viewInv.paid_amount > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {viewInv.paid_amount > 0 ? "Partial" : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto mt-5">
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-[#f8faf9]">
            <tr className="text-black uppercase text-xs">
              <th className="border px-4 py-3 text-center">ID</th>
              <th className="border px-4 py-3">Invoice Date</th>
              <th className="border px-4 py-3">Company Name</th>
              <th className="border px-4 py-3">Project Title</th>
              <th className="border px-4 py-3">Discount Amount</th>
              <th className="border px-4 py-3">Payments</th>
              <th className="border px-4 py-3">Status</th>
              <th className="border px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-center">
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="py-6 text-gray-400">No invoices found</td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition border-b">
                  <td className="border px-3 py-3">{formatInvoiceId(inv.id)}</td>
                  <td className="border px-4 py-2">{formatDate(inv.invoice_date)}</td>
                  <td className="border px-4 py-2">{inv.client_company}</td>
                  <td className="border px-4 py-2">{inv.project_names || "---"}</td>
                  <td className="border px-4 py-2">---</td>
                  <td className="border px-4 py-2">₹{Number(inv.paid_amount || 0).toFixed(2)}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-3 py-1 rounded text-xs ${inv.paid_amount > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {inv.paid_amount > 0 ? "Partial" : "Draft"}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setViewInv(inv)} title="View" className="text-blue-500 hover:text-blue-700 transition">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(inv)} title="Edit" className="text-green-600 hover:text-green-800 transition">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} title="Delete" className="text-red-500 hover:text-red-700 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoice;
