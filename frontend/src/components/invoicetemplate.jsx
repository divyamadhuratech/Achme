import React,{useState,useEffect} from "react";
 import axios from "axios";
 import Logo from "../images/logo.svg";
const Invoice = ({quotationId, performaInvoiceId}) => {
   const [rows, setRows] = useState([]);

  useEffect(() => {
    if (quotationId) {
      axios
        .get(`http://localhost:3000/api/quotations/${quotationId}`)
        .then((res) => setRows(res.data));
    } else if (performaInvoiceId) {
      axios
        .get(`http://localhost:3000/api/performainvoice/${performaInvoiceId}`)
        .then((res) => setRows(res.data));
    }
  }, [quotationId, performaInvoiceId]);

  if (!rows.length) return <p>No invoice found</p>;

  const header = rows[0];


//  Date Format
const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
  });





  return (
    <center>
    <div className="p-6 flex justify-center items-start bg-gray-50 min-h-screen">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-gray-200">

        {/* HEADER */}
        <div className="bg-[#6b7fa3] text-white flex justify-between items-center px-8 py-6">
          <div className="text-left flex items-center gap-4">
              <img src={Logo} alt="Madhura Logo" className="w-[260px] h-auto brightness-150 contrast-125" />
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#a3e635] mb-2 tracking-wide">{quotationId ? "QUOTATION" : "PERFORMA INVOICE"}</h1>
            <p className="text-sm font-medium text-white">{quotationId ? "Quotation" : "Invoice"} No: {quotationId ? `QT-${new Date(header.quotation_date || Date.now()).getFullYear()}-${String(header.quotation_id).padStart(3, "0")}` : `PI-${new Date(header.invoice_date || Date.now()).getFullYear()}-${String(header.performainvoice_id).padStart(3, "0")}`}</p>
            <p className="text-sm font-medium text-white">Date: {formatDate(header.quotation_date || header.invoice_date)}</p>
          </div>
        </div>

        {/* BILL INFO */}
        <div className="grid grid-cols-2 gap-6 px-8 py-5 bg-gray-50 border-b border-gray-200">
          <div className="text-left">
            <h3 className="text-lime-600 font-semibold mb-2 text-sm">{quotationId ? "Quotation" : "Performa Invoice"} To:</h3>
            <p className="font-semibold text-sm">{header.customer_name}</p>
            <p className="text-sm text-gray-600">{header.location_city}</p>
            <p className="text-sm">📞 {header.mobile_number}</p>
            <p className="text-sm">✉ {header.email}</p>
          </div>

          <div className="text-right">
            <h3 className="text-lime-600 font-semibold mb-2 text-sm">{quotationId ? "Quotation" : "Performa Invoice"} From:</h3>
            <p className="font-semibold text-sm">Madhura Technologies</p>
            <p className="text-sm text-gray-600">Managing Director, Company Ltd</p>
            <p className="text-sm">📞 +123 4567 8910</p>
            <p className="text-sm">✉ Madhuratech@mail.com</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="px-8 py-5">
          <table className="w-full border-collapse">
            <thead className="border">
              <tr className="bg-lime-500 text-white text-sm border-r">
                <th className="p-3 text-left border-r">No</th>
                <th className="p-3 text-left border-r">Product Description</th>
                <th className="p-3 text-right border-r">Price</th>
                <th className="p-3 text-center border-r">Qty</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="border-l">
              {rows.map((item,i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="p-3 border-r">{item.product_number ?? i+1}</td>
                  <td className="p-3 border-r">
                    <div className="font-semibold text-left">
                      {item.description.split(",").map((part, index) => (
                        <div key={index} className="mb-0.5">{part.trim()}</div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right border-r">{item.price}</td>
                  <td className="p-3 text-center border-r">{item.quantity}</td>
                  <td className="p-3 text-right border-r">{item.item_subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-6 px-8 pb-6">
          <div className="text-left">
            <h4 className="font-semibold text-lime-600 mb-2 text-sm">Terms & Conditions</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="text-sm">
            <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹{header.subtotal}</span></div>
            <div className="flex justify-between mb-2"><span>Discount</span><span>₹{header.total_discount}</span></div>
            <div className="flex justify-between mb-2"><span>CGST (9%)</span><span>₹{header.total_cgst}</span></div>
            <div className="flex justify-between mb-2 pb-2 border-b"><span>SGST (9%)</span><span>₹{header.total_sgst}</span></div>
            <div className="bg-lime-500 text-white p-4 mt-3 rounded-md flex justify-between items-center">
              <span className="text-base font-semibold">Grand Total</span>
              <span className="text-xl font-bold">₹{header.grand_total}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-800 text-white text-sm flex justify-between px-8 py-4">
          <span>📞 +123 4567 8910</span>
          <span>✉ MadhuraTech@gmail.com</span>
          <span>📍 RS Puram</span>
          <strong>Thank You For Your Business</strong>
        </div>
      </div>
    </div>
    </center>
  );
};

export default Invoice;
