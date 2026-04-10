import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Download, X, Edit2, MinusCircle, PlusCircle, Trash2, Mail } from "lucide-react";
import Invoice from "../components/invoicetemplate";
import { calculateItemTotal, calculateTotals } from "../utils/invoicecal";
import axios from "axios";
import html2pdf from "html2pdf.js";

const Proposal = () => {
  const [quotations, setQuotations] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [showinvoice, setShowInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mail modal
  const [mailOpen, setMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailSending, setMailSending] = useState(false);

  const [items, setItems] = useState([
    { name: "", price: 0, qty: 1, tax: 18, discount: 0 },
  ]);

  const [customer, setCustomer] = useState({
    customer_name: "", mobile_number: "", email: "", location_city: "",
  });

  const [quotation, setQuotation] = useState({
    quotation_date: new Date().toISOString().slice(0, 10),
  });

  const invoiceRef = useRef(null);

  const formatQTNumber = (id, dateStr) => {
    const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
    return `QT-${year}-${String(id).padStart(3, "0")}`;
  };

  const downloadPDF = () => {
    if (!invoiceRef.current) return;
    const opt = {
      margin: 10,
      filename: `Quotation_${viewId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(invoiceRef.current).set(opt).save();
  };

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/quotations");
      setQuotations(res.data);
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/quotations/${id}`);
      const rows = res.data;
      const h = rows[0];
      setCustomer({ customer_name: h.customer_name, mobile_number: h.mobile_number, email: h.email, location_city: h.location_city });
      setQuotation({ quotation_date: h.quotation_date?.split("T")[0] || "" });
      setItems(rows.map(r => ({
        name: r.description,
        price: Number(r.price) || 0,
        qty: Number(r.quantity) || 1,
        tax: 18,
        discount: Number(r.discount) || 0,
      })));
      setEditId(id);
      setOpen(true);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quotation.quotation_date) return alert("Please select quotation date");
    if (items.some(i => !i.name.trim())) return alert("Item description cannot be empty");

    try {
      const totals = calculateTotals(items);
      const payload = {
        customer,
        quotation: {
          quotation_date: quotation.quotation_date,
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
        await axios.put(`http://localhost:3000/api/quotations/${editId}`, payload);
        alert("Quotation updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/quotations/create", payload);
        alert("Quotation created successfully");
      }

      setOpen(false);
      resetForm();
      fetchQuotations();
    } catch (err) {
      console.error(err);
      alert("Error saving quotation");
    }
  };

  const resetForm = () => {
    setCustomer({ customer_name: "", mobile_number: "", email: "", location_city: "" });
    setItems([{ name: "", price: 0, qty: 1, tax: 18, discount: 0 }]);
    setQuotation({ quotation_date: new Date().toISOString().slice(0, 10) });
    setEditId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Select a quotation to delete");
    if (!window.confirm("Delete this quotation?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/quotations/${selectedId}`);
      alert("Deleted successfully");
      setSelectedId(null);
      setViewId(null);
      fetchQuotations();
    } catch (error) { console.error(error); }
  };

  const openMailModal = () => {
    if (!selectedId) return alert("Select a quotation to send");
    const q = quotations.find(x => x.id === selectedId);
    setMailTo(q?.email || "");
    setMailSubject(`Quotation ${formatQTNumber(selectedId, q?.quotation_date)}`);
    setMailOpen(true);
  };

  const handleSendEmail = async () => {
    if (!mailTo) return alert("Please enter recipient email");
    setMailSending(true);
    try {
      await axios.post(`http://localhost:3000/api/quotations/send-email/${selectedId}`, {
        to: mailTo,
        subject: mailSubject,
      });
      alert("Email sent successfully");
      setMailOpen(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send email");
    } finally {
      setMailSending(false);
    }
  };

  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const addItem = () => setItems(p => [...p, { name: "", price: 0, qty: 1, tax: 18, discount: 0 }]);
  const removeItem = () => setItems(p => (p.length > 1 ? p.slice(0, -1) : p));
  const formatDate = (date) => date ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium" }) : "---";

  useEffect(() => {
    document.body.classList.toggle("modal-open", open || mailOpen);
    return () => document.body.classList.remove("modal-open");
  }, [open, mailOpen]);

  const filteredQuotations = quotations.filter(q =>
    q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="invoice-heading-tab flex gap-4 justify-between items-center flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[#1694CE]">Quotation</h2>
          <span className="text-sm text-gray-500">Dashboard &gt; Proposals</span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-lg border h-10 mt-2">
            <Search size={18} className="text-gray-500" />
            <input type="text" placeholder="Search customer..." className="outline-none text-sm w-40 bg-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={downloadPDF} title="Download" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition"><Download size={20} /></button>
            <button onClick={openMailModal} title="Email" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition"><Mail size={18} /></button>
            <button onClick={() => { if (!selectedId) return alert("Select an item"); handleEdit(selectedId); }} title="Edit" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition"><Edit2 size={18} /></button>
            <button onClick={handleDelete} title="Delete" className="w-10 h-10 bg-white border rounded-lg shadow-sm flex justify-center items-center hover:bg-gray-50 transition"><Trash2 size={18} className="text-red-500" /></button>
          </div>
          <div className="mt-2">
            <button onClick={() => { resetForm(); setOpen(true); }} className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] transition"><Plus size={24} /></button>
          </div>
        </div>
      </div>

      {!viewId && (
        <div className="bg-white shadow-sm rounded-xl mt-6 overflow-hidden border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse min-w-[600px]">
            <thead className="bg-[#f8fafc]">
              <tr className="text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                <th className="px-4 py-4 border-r">QT Number</th>
                <th className="px-4 py-4 border-r">Customer Name</th>
                <th className="px-4 py-4 border-r">Email</th>
                <th className="px-4 py-4 border-r">Mobile</th>
                <th className="px-4 py-4 border-r">Date</th>
                <th className="px-4 py-4 border-r">Total</th>
                <th className="px-4 py-4 border-r">City</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(q => (
                <tr key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  onDoubleClick={() => { setViewId(q.id); setTimeout(() => setShowInvoice(true), 50); }}
                  className={`cursor-pointer border-b hover:bg-gray-50 transition ${selectedId === q.id ? "bg-blue-50/50" : ""}`}
                >
                  <td className="px-4 py-4 border-r font-medium text-blue-600">{formatQTNumber(q.id, q.quotation_date)}</td>
                  <td className="px-4 py-4 border-r">{q.customer_name}</td>
                  <td className="px-4 py-4 border-r text-gray-500">{q.email || "---"}</td>
                  <td className="px-4 py-4 border-r">{q.mobile_number}</td>
                  <td className="px-4 py-4 border-r">{formatDate(q.quotation_date)}</td>
                  <td className="px-4 py-4 border-r font-bold text-gray-900">₹{q.grand_total?.toLocaleString()}</td>
                  <td className="px-4 py-4 border-r">{q.location_city}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-3 text-xs text-gray-400 italic text-left">Double-click a row to preview quotation</p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <div className={`overlay ${open ? "show" : ""} flex justify-center items-start overflow-y-auto pt-10 pb-10`}>
        <div className="bg-white rounded-xl shadow-2xl w-[95%] max-w-5xl p-8 relative">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">{editId ? "Edit Quotation" : "New Quotation"}</h2>
            <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => { setOpen(false); resetForm(); }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Customer Name*</label>
                  <input type="text" value={customer.customer_name} onChange={e => setCustomer({ ...customer, customer_name: e.target.value })} className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number*</label>
                  <input type="text" value={customer.mobile_number} onChange={e => setCustomer({ ...customer, mobile_number: e.target.value })} className="border rounded-lg px-4 py-2 outline-none bg-gray-50" required />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Location / City</label>
                  <input type="text" value={customer.location_city} onChange={e => setCustomer({ ...customer, location_city: e.target.value })} className="border rounded-lg px-4 py-2 outline-none bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="border rounded-lg px-4 py-2 outline-none bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Quotation Date*</label>
                  <input type="date" value={quotation.quotation_date} onChange={e => setQuotation({ ...quotation, quotation_date: e.target.value })} className="border rounded-lg px-4 py-2 outline-none bg-gray-50" required />
                </div>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm border-gray-200 overflow-x-auto">
              <table className="w-full text-center text-sm border-collapse min-w-[500px]">
                <thead className="bg-[#f1f5f9] border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left w-[40%]">Product Description</th>
                    <th className="px-4 py-3">Price (₹)</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 text-gray-400">Tax (%)</th>
                    <th className="px-4 py-3">Disc (₹)</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <textarea value={item.name} onChange={e => updateItem(i, "name", e.target.value)} rows={2} className="w-full outline-none bg-transparent resize-none focus:bg-white p-1 rounded" placeholder="Product name, specs..." />
                      </td>
                      <td className="px-4 py-3"><input type="number" value={item.price} onChange={e => updateItem(i, "price", Number(e.target.value))} className="w-24 text-center outline-none bg-transparent focus:bg-white p-1 rounded border border-transparent focus:border-gray-200" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} className="w-16 text-center outline-none bg-transparent focus:bg-white p-1 rounded border border-transparent focus:border-gray-200" /></td>
                      <td className="px-4 py-3"><input type="number" value={18} readOnly className="w-16 text-center text-gray-400 bg-transparent outline-none cursor-not-allowed" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.discount} onChange={e => updateItem(i, "discount", Number(e.target.value))} className="w-24 text-center outline-none bg-transparent focus:bg-white p-1 rounded border border-transparent focus:border-gray-200" /></td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 pr-6">₹{calculateItemTotal(item).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-[#f8fafc] p-3 flex gap-4 border-t border-gray-200">
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"><PlusCircle size={14} /> Add New Row</button>
                <button type="button" onClick={removeItem} disabled={items.length === 1} className={`flex items-center gap-2 font-bold text-xs px-3 py-1.5 rounded-lg border transition ${items.length === 1 ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-red-500 border-red-100 hover:bg-red-50"}`}><MinusCircle size={14} /> Remove Last</button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 pt-4 pr-6">
              {(() => {
                const totals = calculateTotals(items);
                return (
                  <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between text-sm text-gray-600 font-medium italic"><span>Subtotal (Net)</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-red-500 font-medium"><span>Discount Applied</span><span>-₹{totals.total_discount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-gray-600 font-semibold border-t pt-2"><span>CGST (9%)</span><span>₹{totals.total_cgst.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-gray-600 font-semibold"><span>SGST (9%)</span><span>₹{totals.total_sgst.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-gray-300 pt-3 text-xl font-black text-[#1694CE] tracking-tight"><span>Grand Total</span><span>₹{totals.grand_total.toLocaleString()}</span></div>
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="bg-[#1694CE] text-white px-12 py-3 rounded-xl hover:bg-[#1279a8] font-bold shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0">Save & Close</button>
              <button type="button" onClick={() => { setOpen(false); resetForm(); }} className="bg-white text-gray-500 px-12 py-3 rounded-xl border hover:bg-gray-50 font-bold transition">Discard</button>
            </div>
          </form>
        </div>
      </div>

      {/* Mail Modal */}
      <div className={`overlay ${mailOpen ? "show" : ""} flex justify-center items-center`}>
        <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-lg p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Mail size={20} /> Send Quotation</h2>
            <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setMailOpen(false)} />
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">To (Email)</label>
              <input type="email" value={mailTo} onChange={e => setMailTo(e.target.value)} className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100" placeholder="recipient@email.com" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
              <input type="text" value={mailSubject} onChange={e => setMailSubject(e.target.value)} className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <p className="text-xs text-gray-400 italic">The full quotation document will be included in the email.</p>
          </div>
          <div className="flex gap-4 pt-6">
            <button onClick={handleSendEmail} disabled={mailSending} className="bg-[#1694CE] text-white px-8 py-2.5 rounded-lg hover:bg-[#1279a8] font-bold shadow transition disabled:opacity-60">
              {mailSending ? "Sending..." : "Send Email"}
            </button>
            <button onClick={() => setMailOpen(false)} className="bg-gray-200 text-gray-600 px-8 py-2.5 rounded-lg hover:bg-gray-300 font-bold transition">Cancel</button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      {viewId && (
        <div key={viewId} ref={invoiceRef} className={`invoicewrapper w-full mt-10 bg-white shadow-2xl p-8 relative overflow-y-auto ${showinvoice ? "See" : ""}`}>
          <div className="flex gap-3 absolute right-8 top-8 z-50">
            <X className="cursor-pointer text-gray-400 hover:text-red-500 bg-white rounded-full p-1" onClick={() => { setShowInvoice(false); setTimeout(() => setViewId(null), 400); }} />
          </div>
          <Invoice quotationId={viewId} />
        </div>
      )}
    </div>
  );
};

export default Proposal;
