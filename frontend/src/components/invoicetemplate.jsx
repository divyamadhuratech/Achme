import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../images/l.png";

// Company details for Achme Communication
const COMPANY_DETAILS = {
  name: "Achme Communication",
  gstin: "33AABCA1234D1Z5", 
  email: "info@achmecommunication.com",
  website: "www.achmecommunication.com",
  phone: "0422-2569966, 4376555",
};

// Accepts any of: performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId
const Invoice = ({ performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId }) => {
  const [rows, setRows] = useState([]);

  const getConfig = () => {
    if (performaInvoiceId) return { api: `/api/performainvoice/${performaInvoiceId}`, label: "PROFORMA INVOICE", prefix: "PI", dateField: "invoice_date", idField: "performainvoice_id" };
    if (estimateInvoiceId) return { api: `/api/estimate-invoice/${estimateInvoiceId}`, label: "ESTIMATION", prefix: "EI", dateField: "invoice_date", idField: "invoice_id" };
    if (serviceEstimationId) return { api: `/api/service-estimation/${serviceEstimationId}`, label: "SERVICE ESTIMATION", prefix: "SE", dateField: "invoice_date", idField: "invoice_id" };
    if (quotationId) return { api: `/api/quotations/${quotationId}`, label: "PROPOSAL", prefix: "QT", dateField: "quotation_date", idField: "quotation_id" };
    return null;
  };

  const config = getConfig();

  useEffect(() => {
    if (!config) return;
    axios.get(`http://localhost:3000${config.api}`).then(res => setRows(res.data)).catch(console.error);
  }, [performaInvoiceId, estimateInvoiceId, serviceEstimationId, quotationId]); // eslint-disable-line

  if (!rows.length || !config) return <p className="p-8 text-center text-gray-500 font-medium text-lg">Loading invoice data...</p>;

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

  // Left side: client address from form fields
  const clientAddrParts = [h.client_address1, h.client_address2, h.client_city, h.client_state, h.client_pincode].filter(Boolean);

  // Dynamic Terms & Conditions from Form Checkboxes/Inputs
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
    <div className="flex justify-center items-start min-h-screen font-sans bg-gray-50 py-8 text-base">
      <div className="bg-white w-full max-w-[1100px] border border-gray-200 overflow-hidden text-left shadow-lg relative" id="invoice-pdf-content">
        
        {/* TOP ACCENT BAR */}
        <div className="h-3 w-full bg-[#1694CE]"></div>

        {/* --- HEADER SECTION --- */}
        <div className="px-10 py-8 bg-white border-b border-gray-200">
          <div className="flex justify-between items-start gap-6">
            {/* Left: Logo & Details */}
            <div className="flex items-center gap-6">
               <img src={logo} alt="Achme Communication" className="w-[200px] h-auto object-contain mix-blend-multiply" />
               <div className="text-sm text-gray-700 border-l-2 border-gray-300 pl-4 space-y-1">
                  <p><strong className="text-gray-900">GSTIN:</strong> {COMPANY_DETAILS.gstin}</p>
                  <p><strong className="text-gray-900">Email:</strong> {COMPANY_DETAILS.email}</p>
                  <p><strong className="text-gray-900">Website:</strong> {COMPANY_DETAILS.website}</p>
                  <p><strong className="text-gray-900">Ph:</strong> {COMPANY_DETAILS.phone}</p>
               </div>
            </div>
            
            {/* Right: Invoice Info */}
            <div className="text-right min-w-[280px]">
              <h1 className="text-3xl font-bold text-[#1694CE] tracking-wide uppercase mb-4">
                {config.label}
              </h1>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left shadow-sm">
                <table className="text-sm w-full text-gray-800">
                  <tbody>
                    <tr>
                      <td className="font-bold py-1.5 w-24">Doc No:</td>
                      <td className="font-semibold text-gray-900 text-right">{docNumber}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-1.5">Date:</td>
                      <td className="font-semibold text-gray-900 text-right">{formatDate(docDate)}</td>
                    </tr>
                    {h.reference_no && (
                      <tr className="border-t border-gray-200">
                        <td className="font-bold py-1.5 mt-1 block">Ref No:</td>
                        <td className="font-bold text-[#1694CE] text-right pt-1.5">{h.reference_no}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- ADDRESSES --- */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-200 bg-white">
          {/* FROM ADDRESS */}
          <div className="p-8 border-r border-gray-200">
            <h3 className="text-sm font-bold text-[#1694CE] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">From Address</h3>
            <p className="font-extrabold text-gray-900 text-xl mb-2">{COMPANY_DETAILS.name}</p>
            {h.resolved_from_address || h.from_address_custom ? (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{h.resolved_from_address || h.from_address_custom}</p>
            ) : (
              <p className="text-sm text-gray-800 leading-relaxed">Head Office, Main Branch</p>
            )}
            
            {(h.exec_name || h.exec_phone || h.exec_email) && (
              <div className="mt-5 pt-3 text-sm border-t border-gray-100 text-gray-700">
                <span className="font-bold text-gray-900 mr-2">Executive:</span>
                {h.exec_name && <span className="font-bold text-gray-800 mr-4">{h.exec_name}</span>}
                {h.exec_phone && <span className="mr-4">📞 {h.exec_phone}</span>}
                {h.exec_email && <span>✉ {h.exec_email}</span>}
              </div>
            )}
          </div>

          {/* TO ADDRESS */}
          <div className="p-8 bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#1694CE] uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Billed To</h3>
            {h.client_company && <p className="font-bold text-gray-900 text-xl mb-1">{h.client_company}</p>}
            <p className="font-bold text-gray-800 text-lg mb-2">{h.customer_name}</p>
            
            {clientAddrParts.length > 0 && <p className="text-sm text-gray-800 leading-relaxed">{clientAddrParts.join(", ")}</p>}
            {h.client_country && <p className="text-sm text-gray-800 leading-relaxed">{h.client_country}</p>}
            
            <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-gray-200/50">
              <span className="flex items-center gap-1.5 font-semibold">📞 {h.mobile_number}</span>
              {h.email && <span className="flex items-center gap-1.5 font-semibold">✉ {h.email}</span>}
            </div>
          </div>
        </div>

        {/* --- ITEMS TABLE --- */}
        <div className="px-10 py-8">
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1694CE] text-white text-xs uppercase tracking-wider font-bold border-b border-[#1694CE]">
                  <th className="py-3 px-4 text-center w-12 border-r border-[#1580B8]">S.No</th>
                  <th className="py-3 px-4 border-r border-[#1580B8]">Description</th>
                  <th className="py-3 px-4 border-r border-[#1580B8] w-48">Brand / Model</th>
                  <th className="py-3 px-4 text-center w-20 border-r border-[#1580B8]">Qty</th>
                  <th className="py-3 px-4 text-center w-20 border-r border-[#1580B8]">UOM</th>
                  <th className="py-3 px-4 text-right w-32 border-r border-[#1580B8]">Price</th>
                  <th className="py-3 px-4 text-right w-36">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {rows.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 last:border-0">
                    <td className="py-4 px-4 text-center text-gray-600 font-semibold border-r border-gray-200">{item.product_number ?? i + 1}</td>
                    <td className="py-4 px-4 border-r border-gray-200">
                      <div className="font-bold text-gray-900 text-base">
                        {(item.description || "").split(",").map((part, idx) => (
                          <div key={idx} className={idx > 0 ? "mt-1 text-gray-700 font-medium text-sm" : ""}>{part.trim()}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm border-r border-gray-200">{item.brand_model || "—"}</td>
                    <td className="py-4 px-4 text-center font-bold text-base border-r border-gray-200">{item.quantity}</td>
                    <td className="py-4 px-4 text-center text-gray-700 text-sm border-r border-gray-200">{item.uom || "Nos"}</td>
                    <td className="py-4 px-4 text-right font-semibold border-r border-gray-200 text-gray-800">₹{fmt(item.price)}</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900 text-base">₹{fmt(item.item_subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TOTALS SUMMARY --- */}
        <div className="flex justify-end px-10 pb-8 border-b border-gray-200">
          <div className="w-1/2 min-w-[350px] max-w-[500px] bg-gray-50 rounded border border-gray-200 p-5 shadow-sm">
            <table className="w-full text-sm text-gray-800">
              <tbody>
                <tr>
                   <td className="py-1.5 font-medium">Subtotal</td>
                   <td className="py-1.5 text-right font-bold text-gray-900 text-base">₹{fmt(h.subtotal)}</td>
                </tr>
                {Number(h.total_discount) > 0 && (
                  <tr>
                     <td className="py-1.5 font-semibold text-red-600">Discount</td>
                     <td className="py-1.5 text-right font-bold text-red-600 text-base">-₹{fmt(h.total_discount)}</td>
                  </tr>
                )}
                <tr>
                   <td className="py-1.5 font-medium">CGST ({taxRate / 2}%)</td>
                   <td className="py-1.5 text-right font-bold text-gray-900 text-base">₹{fmt(h.total_cgst)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                   <td className="py-1.5 pb-3 font-medium">SGST ({taxRate / 2}%)</td>
                   <td className="py-1.5 pb-3 text-right font-bold text-gray-900 text-base">₹{fmt(h.total_sgst)}</td>
                </tr>
                <tr>
                   <td className="py-3 pt-4 text-lg font-bold text-gray-900 uppercase tracking-wide">Grand Total</td>
                   <td className="py-3 pt-4 text-right text-2xl font-black text-[#1694CE]">₹{fmt(h.grand_total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- DYNAMIC TERMS (From the form checkboxes) --- */}
        {termsLines.length > 0 && (
          <div className="px-10 pt-8 pb-4 bg-white">
            <h4 className="text-base font-bold text-[#1694CE] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Terms & Conditions</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-800 font-medium">
              {termsLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* --- FOOTER: BRANCHES, REGISTRATION DETAILS & NOTES --- */}
        <div className="border border-gray-300 mx-10 mb-12 rounded overflow-hidden shadow-sm bg-white">
           
           <div className="grid grid-cols-2">
              
              {/* Left Column: Registration Details & Default Content */}
              <div className="p-6 border-r border-gray-300 bg-gray-50/50">
                 <h4 className="text-sm font-bold text-[#1694CE] uppercase border-b border-gray-300 pb-2 mb-3">Order On</h4>
                 <p className="font-extrabold text-base text-gray-900 mb-1">{COMPANY_DETAILS.name}</p>
                 <p className="text-sm font-semibold text-gray-700 mb-4">Our Certificate of Provisional Registration</p>
                 
                 <table className="text-sm text-gray-800 w-full mb-6 mt-2">
                   <tbody>
                     <tr><td className="w-56 py-1 font-medium">GSTIN</td><td className="font-bold">423523GSDH</td></tr>
                     <tr><td className="py-1 font-medium">TIN NO</td><td className="font-bold">3747387199</td></tr>
                     <tr><td className="py-1 font-medium">SERVICE TAX REG. NO.</td><td className="font-bold">JSDND383JSDJJ</td></tr>
                     <tr><td className="py-1 font-medium">PAN</td><td className="font-bold">UEW3873</td></tr>
                     <tr><td className="py-1 font-medium">CENTRAL SALES TAX REG. NO.</td><td className="font-bold">88325</td></tr>
                   </tbody>
                 </table>

                 <h4 className="text-sm font-bold text-[#1694CE] uppercase border-b border-gray-300 pb-2 mb-3 mt-6">Notes</h4>
                 <div className="text-sm text-gray-800 space-y-4 leading-relaxed">
                    <div>
                       <span className="font-bold text-gray-900 block mb-1">Materials:</span>
                       <p>BOQ considered based on discussion and our previoues experience , however in case of any extra materials are required at time of execution will be charged extra .</p>
                       <p className="font-bold mt-1 uppercase text-gray-900">CABLE AND CABLE LAYING AND LAYING accessories AS PER ACTUALS</p>
                    </div>
                    <div>
                       <span className="font-bold text-gray-900 block mb-1">Delay:</span>
                       <p>In case of delay due to some dependencies from other agencies working at site , then Achme communicaiton will not be responsible for the same.</p>
                    </div>
                    <div>
                       <span className="font-bold text-gray-900 block mb-1">NOTE:</span>
                       <p>Civil Works, Electrical Works, and Interior Works are not included in our scope. Related vendors' presence is required during project execution.</p>
                    </div>
                 </div>
              </div>

              {/* Right Column: Branch Addresses, Bank & Signature */}
              <div className="p-6 flex flex-col justify-between bg-white">
                 <div>
                   <h4 className="text-sm font-bold text-[#1694CE] uppercase border-b border-gray-300 pb-2 mb-4">Our Branches</h4>
                   <div className="space-y-6 text-sm text-gray-800 leading-relaxed">
                      <div>
                        <p className="font-bold text-gray-900 text-base mb-1">Bangalore Branch:</p>
                        <p>14th Main Road, GK Layout, Electronic City Post</p>
                        <p>Bangalore - 560100</p>
                        <p className="mt-1">GSTIN: <span className="font-bold">2635GHHJG</span></p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base mb-1">Chennai Branch:</p>
                        <p>5th Floor, 5CD PM Towers, Dreams Road, Thousand Lights</p>
                        <p>Chennai - 600006</p>
                        <p className="mt-1">GSTIN: <span className="font-bold">423523GSDH</span></p>
                      </div>
                   </div>

                   {/* Bank Details Table */}
                   <div className="mt-8">
                     <h4 className="text-sm font-bold text-[#1694CE] uppercase border-b border-gray-300 pb-2 mb-3">Bank Details</h4>
                     <table className="text-sm text-gray-800 w-full mb-2">
                       <tbody>
                         <tr><td className="w-36 py-1 font-medium">Company name</td><td className="font-bold text-gray-900">Achme communication</td></tr>
                         <tr><td className="py-1 font-medium">Bank</td><td className="font-bold text-gray-900">KOTAK MAHINDRA BANK</td></tr>
                         <tr><td className="py-1 font-medium">Account no</td><td className="font-bold text-gray-900">12345667</td></tr>
                         <tr><td className="py-1 font-medium">IFSC Code</td><td className="font-bold text-gray-900">34DJFHJDH</td></tr>
                         <tr><td className="py-1 font-medium">Branch</td><td className="font-medium text-gray-800">test, coimbatore</td></tr>
                       </tbody>
                     </table>
                   </div>
                 </div>

                 {/* Signature Area */}
                 <div className="text-right mt-16 pt-6">
                    <p className="text-sm text-gray-600 italic font-medium mb-12 flex justify-end">For Achme Communication</p>
                    <div className="inline-block border-t border-gray-400 pt-3 text-center">
                        <p className="font-bold text-base text-gray-900 uppercase">Krishna Kumar M</p>
                        <p className="text-sm text-gray-700 font-bold tracking-wider mt-0.5">( 771234343 )</p>
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
    </center>
  );
};

export default Invoice;
