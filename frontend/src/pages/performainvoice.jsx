import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Download, X, Edit2, MinusCircle, PlusCircle, Trash2, Send } from "lucide-react";
import Invoice from "../components/invoicetemplate";
import { calculateItemTotal, calculateTotals } from "../utils/invoicecal";
import axios from "axios";
import html2pdf from "html2pdf.js";

const PerformaInvoice = () => {
  const [performaInvoices, setPerformaInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [showinvoice, setShowInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Description raw input for comma-split
  const [descInput, setDescInput] = useState("");

  const [items, setItems] = useState([
    { name: "", price: 0, qty: 1, tax: 18, discount: 0 },
  ]);

  const [customer, setCustomer] = useState({
    customer_name: "", mobile_number: "", email: "", location_city: "",
  });

  const [performaInvoice, setPerformaInvoice] = useState({
    invoice_date: new Date().toISOString().slice(0, 10),
  });

  const invoiceRef = useRef(null);

  const downloadPDF = () => {
    if (!invoiceRef.current) return;
    const opt = {
      margin: 10,
      filename: `Performa_Invoice_${viewId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(invoiceRef.current).set(opt).save();
  };

  useEffect(() => {
    fetchPerformaInvoices();
    fetchQuotations();
  }, []);

  const fetchPerformaInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/performainvoice");
      setPerformaInvoices(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/quotations");
      setQuotations(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSelectProposal = async (proposalId) => {
    if (!proposalId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/quotations/${proposalId}`);
      const rows = res.data;
      if (rows.length > 0) {
        const h = rows[0];
        setCustomer({
          customer_name: h.customer_name,
          mobile_number: h.mobile_number,
          email: h.email,
          location_city: h.location_city,
        });
        const loadedItems = rows.map(r => ({
          name: r.description,
          price: Number(r.price) || 0,
          qty: Number(r.quantity) || 1,
          tax: 18,
          discount: Number(r.discount) || 0,
        }));
        setItems(loadedItems);
        setDescInput(loadedItems.map(i => i.name).join(", "));
      }
    } catch (err) {
      console.error(err);
      alert("Error loading proposal data");
    }
  };

  const handleEdit = async (id) => {
    const res = await axios.get(`http://localhost:3000/api/performainvoice/${id}`);
    const rows = res.data;
    const h = rows[0];
    setCustomer({
      customer_name: h.customer_name,
      mobile_number: h.mobile_number,
      email: h.email,
      location_city: h.location_city,
    });
    setPerformaInvoice({ invoice_date: h.invoice_date?.split("T")[0] || "" });
    const loadedItems = rows.map(r => ({
      name: r.description,
      price: Number(r.price) || 0,
      qty: Number(r.quantity) || 1,
      tax: 18,
      discount: Number(r.discount) || 0,
    }));
    setItems(loadedItems);
    setDescInput(loadedItems.map(i => i.name).join(", "));
    setEditId(id);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!performaInvoice.invoice_date) return alert("Please select date");
    if (items.some(i => !i.name.trim())) return alert("Description cannot be empty");

    try {
      const totals = calculateTotals(items);
      const payload = {
        customer,
        performaInvoice: {
          invoice_date: performaInvoice.invoice_date,
          subtotal: totals.subtotal,
          total_discount: totals.total_discount,
          total_cgst: totals.total_cgst,
          total_sgst: totals.total_sgst,
          total_tax: totals.total_cgst + totals.total_sgst,
          grand_total: totals.grand_total,
        },
        items: items.map(i => ({
          description: i.name,
          price: i.price,
          quantity: i.qty,
          tax: 18,
          discount: i.discount,
          subtotal: calculateItemTotal(i),
        })),
      };

      if (editId) {
        await axios.put(`http://localhost:3000/api/performainvoice/${editId}`, payload);
        alert("Updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/performainvoice/create", payload);
        alert("Created successfully");
      }

      setOpen(false);
      resetForm();
      fetchPerformaInvoices();
    } catch (err) {
      console.error(err);
      alert("Error saving Performa Invoice");
    }
  };

  const resetForm = () => {
    setCustomer({ customer_name: "", mobile_number: "", email: "", location_city: "" });
    setItems([{ name: "", price: 0, qty: 1, tax: 18, discount: 0 }]);
    setDescInput("");
    setPerformaInvoice({ invoice_date: new Date().toISOString().slice(0, 10) });
    setEditId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Select an item to delete");
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/performainvoice/${selectedId}`);
      alert("Deleted successfully");
      setSelectedId(null);
      setViewId(null);
      fetchPerformaInvoices();
    } catch (error) { console.error(error); }
  };

  const handleSendEmail = async () => {
    if (!selectedId) return alert("Select an invoice to send");
    if (!window.confirm("Send this Performa Invoice via email?")) return;
    try {
      await axios.post(`http://localhost:3000/api/performainvoice/send-email/${selectedId}`);
      alert("Email sent successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send email");
    }
  };

  const handleDescInput = (value) => {
    setDescInput(value);
    const parts = value.split(",").map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length === 0) {
      setItems([{ name: "", price: 0, qty: 1, tax: 18, discount: 0 }]);
    } else {
      setItems(prev => parts.map((part, i) => ({
        name: part,
        price: prev[i]?.price || 0,
        qty: prev[i]?.qty || 1,
        tax: 18,
        discount: prev[i]?.discount || 0,
      })));
    }
  };

  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const addItem = () => {
    setItems(p => [...p, { name: "", price: 0, qty: 1, tax: 18, discount: 0 }]);
    setDescInput(prev => prev ? prev + ", " : "");
  };

  const removeItem = () => {
    if (items.length <= 1) return;
    const newItems = items.slice(0, -1);
    setItems(newItems);
    setDescInput(newItems.map(i => i.name).join(", "));
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium" }) : "---";

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  const filteredInvoices = performaInvoices.filter(q =>
    q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="invoice-heading-tab flex gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1694CE]">Proforma Invoice</h2>
          <nav className="text-sm text-gray-500">Dashboard &gt; Finance &gt; Proforma Invoice</nav>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-lg border h-10 mt-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer..."
              className="outline-none text-sm w-40 bg-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button onClick={downloadPDF} title="Download PDF" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition">
              <Download size={20} />
            </button>
            <button onClick={handleSendEmail} title="Send Email" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition">
              <Send size={18} />
            </button>
            <button onClick={() => { if (!selectedId) return alert("Select an item"); handleEdit(selectedId); }} title="Edit" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition">
              <Edit2 size={18} />
            </button>
            <button onClick={handleDelete} title="Delete" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition">
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>

          <div className="mt-2">
            <button onClick={() => { resetForm(); setOpen(true); }} className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] transition">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {!viewId && (
        <div className="bg-white shadow-sm rounded-xl mt-6 overflow-hidden border border-gray-100">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-[#f8fafc]">
              <tr className="text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                <th className="px-4 py-4 border-r">ID</th>
                <th className="px-4 py-4 border-r">Customer Name</th>
                <th className="px-4 py-4 border-r">Mobile</th>
                <th className="px-4 py-4 border-r">Date</th>
                <th className="px-4 py-4 border-r">Total</th>
                <th className="px-4 py-4 border-r">City</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(p => (
                <tr key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  onDoubleClick={() => { setViewId(p.id); setTimeout(() => setShowInvoice(true), 50); }}
                  className={`cursor-pointer border-b hover:bg-gray-50 transition ${selectedId === p.id ? "bg-blue-50/50" : ""}`}
                >
                  <td className="px-4 py-4 border-r font-medium text-blue-600">#{p.id}</td>
                  <td className="px-4 py-4 border-r">{p.customer_name}</td>
                  <td className="px-4 py-4 border-r">{p.mobile_number}</td>
                  <td className="px-4 py-4 border-r">{formatDate(p.invoice_date)}</td>
                  <td className="px-4 py-4 border-r font-bold text-gray-900">₹{p.grand_total?.toLocaleString()}</td>
                  <td className="px-4 py-4 border-r">{p.location_city}</td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan="6" className="py-10 text-gray-400 italic">No invoices found</td></tr>
              )}
            </tbody>
          </table>
          <p className="p-3 text-xs text-gray-400 italic text-left">Double-click a row to preview invoice</p>
        </div>
      )}

      <div className={`overlay ${open ? "show" : ""} flex justify-center items-start overflow-y-auto pt-10 pb-10`}>
        <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-4xl p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{editId ? "Edit Proforma Invoice" : "Create Proforma Invoice"}</h2>
            <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => { setOpen(false); resetForm(); }} />
          </div>

          <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-center gap-4 border border-blue-100">
            <span className="text-sm font-semibold text-blue-800">Quick Fill from Proposal:</span>
            <select onChange={(e) => handleSelectProposal(e.target.value)} className="bg-white border text-sm rounded-md px-3 py-1.5 outline-none flex-1 max-w-xs">
              <option value="">Select a Proposal</option>
              {quotations.map(q => <option key={q.id} value={q.id}>{q.customer_name} (#{q.id})</option>)}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                  <input type="text" value={customer.customer_name} onChange={e => setCustomer({ ...customer, customer_name: e.target.value })} className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                  <input type="text" value={customer.mobile_number} onChange={e => setCustomer({ ...customer, mobile_number: e.target.value })} className="border rounded-lg px-4 py-2 outline-none" required />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="border rounded-lg px-4 py-2 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Invoice Date</label>
                  <input type="date" value={performaInvoice.invoice_date} onChange={e => setPerformaInvoice({ ...performaInvoice, invoice_date: e.target.value })} className="border rounded-lg px-4 py-2 outline-none" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Description (Comma-Split items)</label>
              <textarea
                value={descInput}
                onChange={e => handleDescInput(e.target.value)}
                placeholder="e.g. Service A, Service B, Product C"
                className="border rounded-lg px-4 py-2 outline-none min-h-[80px]"
              />
              <p className="text-[10px] text-orange-500 italic mt-1 font-medium italic">Use commas (,) to split items automatically</p>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-center text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-gray-600 font-bold uppercase text-[10px]">
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 text-gray-400">Tax (%)</th>
                    <th className="px-4 py-3">Disc (₹)</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3"><input type="text" value={item.name} onChange={e => updateItem(i, "name", e.target.value)} className="w-full outline-none bg-transparent" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.price} onChange={e => updateItem(i, "price", Number(e.target.value))} className="w-20 text-center outline-none bg-transparent" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} className="w-12 text-center outline-none bg-transparent" /></td>
                      <td className="px-4 py-3"><input type="number" value={18} readOnly className="w-12 text-center text-gray-400 bg-transparent outline-none cursor-not-allowed" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.discount} onChange={e => updateItem(i, "discount", Number(e.target.value))} className="w-20 text-center outline-none bg-transparent" /></td>
                      <td className="px-4 py-3 text-right font-bold">₹{calculateItemTotal(item).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 p-3 flex gap-4">
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline"><PlusCircle size={14} /> Add Line</button>
                <button type="button" onClick={removeItem} className="flex items-center gap-2 text-red-500 font-bold text-xs hover:underline"><MinusCircle size={14} /> Remove Line</button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-72 space-y-3">
                {(() => {
                  const totals = calculateTotals(items);
                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Discount</span><span>-₹{totals.total_discount.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm text-gray-600 font-medium"><span>CGST (9%)</span><span>₹{totals.total_cgst.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm text-gray-600 font-medium"><span>SGST (9%)</span><span>₹{totals.total_sgst.toLocaleString()}</span></div>
                      <div className="flex justify-between border-t pt-3 text-lg font-bold text-blue-700"><span>Grand Total</span><span>₹{totals.grand_total.toLocaleString()}</span></div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="bg-blue-600 text-white px-10 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition">Save Invoice</button>
              <button type="button" onClick={() => { setOpen(false); resetForm(); }} className="bg-gray-200 text-gray-600 px-10 py-2.5 rounded-lg hover:bg-gray-300 font-bold transition">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {viewId && (
        <div key={viewId} ref={invoiceRef} className={`invoicewrapper w-full mt-6 bg-white shadow-xl p-6 relative overflow-y-auto ${showinvoice ? "See" : ""}`}>
          <X className="absolute right-6 top-6 cursor-pointer text-gray-400 hover:text-red-500 z-10" onClick={() => { setShowInvoice(false); setTimeout(() => setViewId(null), 400); }} />
          <Invoice performaInvoiceId={viewId} />
        </div>
      )}
    </div>
  );
};

export default PerformaInvoice;
