import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../images/l.png";

// Accepts any of: performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId
const Invoice = ({ performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId }) => {
  const [rows, setRows] = useState([]);

  const getConfig = () => {
    if (performaInvoiceId) return { api: `/api/performainvoice/${performaInvoiceId}`, label: "PERFORMA INVOICE", prefix: "PI", dateField: "invoice_date", idField: "performainvoice_id" };
    if (estimateInvoiceId) return { api: `/api/estimate-invoice/${estimateInvoiceId}`, label: "ESTIMATE INVOICE", prefix: "EI", dateField: "invoice_date", idField: "invoice_id" };
    if (serviceEstimationId) return { api: `/api/service-estimation/${serviceEstimationId}`, label: "SERVICE ESTIMATION", prefix: "SE", dateField: "invoice_date", idField: "invoice_id" };
    if (quotationId) return { api: `/api/quotations/${quotationId}`, label: "QUOTATION", prefix: "QT", dateField: "quotation_date", idField: "quotation_id" };
    return null;
  };

  const config = getConfig();

  useEffect(() => {
    if (!config) return;
    axios.get(`http://localhost:3000${config.api}`).then(res => setRows(res.data)).catch(console.error);
  }, [performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId]); // eslint-disable-line

  if (!rows.length || !config) return <p className="p-4 text-gray-400">Loading invoice...</p>;

  const h = rows[0];
  const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium" }) : "---";
  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // Doc number
  const docDate = h[config.dateField] || h.invoice_date || h.quotation_date;
  const docId = h[config.idField] || h.id;
  const year = docDate ? new Date(docDate).getFullYear() : new Date().getFullYear();
  const docNumber = `${config.prefix}-${year}-${String(docId).padStart(3, "0")}`;

  // Tax rate from stored data
  const taxRate = h.tax_type === "GST5" ? 5 : h.tax_type === "CUSTOM" ? (Number(h.custom_tax) || 0) : 18;

  // Right side: office/from address — now comes directly from the JOIN
  const fromAddrText = h.resolved_from_address || h.from_address_custom || "";

  // Left side: client address from form fields
  const clientAddrParts = [h.client_address1, h.client_address2, h.client_city, h.client_state, h.client_pincode].filter(Boolean);

  // Terms lines — only show what was checked
  const termsLines = [];
  if (h.terms_general) termsLines.push("General Terms & Conditions apply.");
  if (h.terms_tax) termsLines.push("Prices quoted are exclusive of Sales and Service Tax (SEZ – NIL Tax applicable).");
  if (h.terms_project_period) termsLines.push(`Project Period: ${h.terms_project_period}`);
  if (h.terms_validity) termsLines.push("Quote valid for 15 days from the date of quotation.");
  try {
    const so = typeof h.terms_separate_orders === "string" ? JSON.parse(h.terms_separate_orders) : (h.terms_separate_orders || {});
    if (so.material) termsLines.push("A. Material Supply (As per actuals)");
    if (so.installation) termsLines.push("B. Installation / Services");
    if (so.usd) termsLines.push("C. Price may vary based on USD rates");
    if (so.boq) termsLines.push("D. Factory BOQ may vary");
  } catch (e) {}
  if (h.terms_payment) termsLines.push(`Payment Terms: ${h.terms_payment === "Custom" ? h.terms_payment_custom : h.terms_payment}`);
  if (h.terms_warranty) termsLines.push(`Warranty: ${h.terms_warranty}`);

  return (
    <center>
    <div className="p-4 flex justify-center items-start bg-gray-50 min-h-screen">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-gray-200">

        {/* HEADER */}
        <div className="bg-[#6b7fa3] text-white flex justify-between items-center px-8 py-6">
          <div className="text-left flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-[200px] h-auto brightness-150 contrast-125" />
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#a3e635] mb-2 tracking-wide">{config.label}</h1>
            <p className="text-sm font-medium text-white">Invoice No: {docNumber}</p>
            <p className="text-sm font-medium text-white">Date: {formatDate(docDate)}</p>
            {h.reference_no && <p className="text-xs text-blue-200 mt-1">Ref: {h.reference_no}</p>}
          </div>
        </div>

        {/* BILL INFO — Left: Client (To), Right: Office (From) */}
        <div className="grid grid-cols-2 gap-6 px-8 py-5 bg-gray-50 border-b border-gray-200">
          {/* LEFT — Client address */}
          <div className="text-left">
            <h3 className="text-lime-600 font-semibold mb-2 text-sm">{config.label} To:</h3>
            {h.client_company && <p className="font-bold text-sm">{h.client_company}</p>}
            <p className="font-semibold text-sm">{h.customer_name}</p>
            {clientAddrParts.length > 0 && <p className="text-sm text-gray-600">{clientAddrParts.join(", ")}</p>}
            {h.client_country && <p className="text-sm text-gray-600">{h.client_country}</p>}
            <p className="text-sm">📞 {h.mobile_number}</p>
            {h.email && <p className="text-sm">✉ {h.email}</p>}
          </div>

          {/* RIGHT — Office/From address */}
          <div className="text-right">
            <h3 className="text-lime-600 font-semibold mb-2 text-sm">{config.label} From:</h3>
            <p className="font-semibold text-sm">Madhura Technologies</p>
            {fromAddrText
              ? <p className="text-sm text-gray-600 whitespace-pre-line">{fromAddrText}</p>
              : <p className="text-sm text-gray-600">Managing Director, Company Ltd</p>
            }
            {h.exec_name && <p className="text-sm font-medium mt-1">{h.exec_name}</p>}
            {h.exec_phone && <p className="text-sm">📞 {h.exec_phone}</p>}
            {h.exec_email && <p className="text-sm">✉ {h.exec_email}</p>}
          </div>
        </div>

        {/* TABLE */}
        <div className="px-8 py-5">
          <table className="w-full border-collapse">
            <thead className="border">
              <tr className="bg-lime-500 text-white text-sm border-r">
                <th className="p-3 text-left border-r">No</th>
                <th className="p-3 text-left border-r">Product Description</th>
                <th className="p-3 text-left border-r">Brand / Model</th>
                <th className="p-3 text-center border-r">UOM</th>
                <th className="p-3 text-right border-r">Price</th>
                <th className="p-3 text-center border-r">Qty</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="border-l">
              {rows.map((item, i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="p-3 border-r">{item.product_number ?? i + 1}</td>
                  <td className="p-3 border-r">
                    <div className="font-semibold text-left">
                      {(item.description || "").split(",").map((part, idx) => (
                        <div key={idx} className="mb-0.5">{part.trim()}</div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border-r text-gray-500 text-xs">{item.brand_model || "—"}</td>
                  <td className="p-3 text-center border-r text-xs">{item.uom || "Nos"}</td>
                  <td className="p-3 text-right border-r">₹{fmt(item.price)}</td>
                  <td className="p-3 text-center border-r">{item.quantity}</td>
                  <td className="p-3 text-right font-semibold">₹{fmt(item.item_subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS + TERMS */}
        <div className="grid grid-cols-2 gap-6 px-8 pb-6">
          <div className="text-left">
            {termsLines.length > 0 ? (
              <>
                <h4 className="font-semibold text-lime-600 mb-2 text-sm">Terms &amp; Conditions</h4>
                <ul className="space-y-1">
                  {termsLines.map((line, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1">
                      <span className="text-lime-600 mt-0.5">•</span><span>{line}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">No terms selected.</p>
            )}
          </div>

          <div className="text-sm">
            <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹{fmt(h.subtotal)}</span></div>
            <div className="flex justify-between mb-2"><span>Discount</span><span>₹{fmt(h.total_discount)}</span></div>
            <div className="flex justify-between mb-2"><span>CGST ({taxRate / 2}%)</span><span>₹{fmt(h.total_cgst)}</span></div>
            <div className="flex justify-between mb-2 pb-2 border-b"><span>SGST ({taxRate / 2}%)</span><span>₹{fmt(h.total_sgst)}</span></div>
            <div className="bg-lime-500 text-white p-4 mt-3 rounded-md flex justify-between items-center">
              <span className="text-base font-semibold">Grand Total</span>
              <span className="text-xl font-bold">₹{fmt(h.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* COMPANY DETAILS FOOTER ROW */}
        <div className="px-8 py-4 border-t bg-gray-50 text-xs text-gray-600 space-y-2">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-bold text-gray-800 mb-1">Order On: Achme Communication</p>
              <p>Our Certificate of Provisional Registration</p>
              <p>GSTIN: 37634G67435 &nbsp;|&nbsp; TIN No: 76753656</p>
              <p>Service Tax Reg. No: 6768875D1 &nbsp;|&nbsp; PAN: YYYZZ8978</p>
              <p>Central Sales Tax Reg. No: 678436</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Materials</p>
              <p>BOQ considered based on discussion and our previous experience. However, in case of any extra materials required at time of execution will be charged extra.</p>
              <p className="mt-1">Cable and cable laying accessories as per actuals.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <div>
              <p className="font-bold text-gray-800 mb-1">Delay</p>
              <p>In case of delay due to some dependencies from other agencies working at site, then Achme Communication will not be responsible for the same.</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Note</p>
              <p>Civil Works, Electrical Works, and Interior Works are not included in our scope. Related vendors' presence is required during project execution.</p>
            </div>
          </div>
        </div>

        {/* SIGNATURE FOOTER */}
        <div className="bg-slate-800 text-white text-sm flex justify-between items-end px-8 py-4">
          <div>
            <p className="text-xs text-gray-400 mb-3">📞 +123 4567 8910 &nbsp;|&nbsp; ✉ MadhuraTech@gmail.com &nbsp;|&nbsp; 📍 RS Puram</p>
            <strong>Thank You For Your Business</strong>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-4">For Achme Communication</p>
            <p className="font-semibold border-t border-gray-500 pt-2">Krishna Kumar M</p>
            <p className="text-xs text-gray-400">(76442644)</p>
          </div>
        </div>

      </div>
    </div>
    </center>
  );
};

export default Invoice;
