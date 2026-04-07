import React,{useState,useEffect} from "react";
 import axios from "axios";
 import Logo from "../images/logo.svg";
const Invoice = ({quotationId}) => {
   const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/quotations/${quotationId}`)
      .then((res) => setRows(res.data));
  }, [quotationId]);

  if (!rows.length) return <p>No invoice found</p>;

  const header = rows[0];


//  Date Format
const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
  });





  return (
    <center>
    <div className="p-6 flex ">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#1F2A44] text-white flex justify-between items-center p-6">
          <div className="text-left">
              <img src={Logo} alt="" className="w-[300px]" />
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-lime-400">QUOTATION</h1>
            <p className="text-sm ">Quotaion No: #{header.quotation_id}</p>
            <p className="text-sm"> Quotation Date: {formatDate(header.quotation_date)}</p>
          </div>
        </div>

        {/* BILL INFO */}
        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="text-left">
            <h3 className="text-lime-600 font-semibold mb-2">Quotation To:</h3>
            <p className="font-semibold">{header.customer_name}</p>
            <p className="text-sm text-gray-600">{header.location_city}</p>
            <p className="text-sm">📞 {header.mobile_number}</p>
            <p className="text-sm">✉ {header.email}</p>
          </div>

          <div className="text-right ">
            <h3 className="text-lime-600 font-semibold mb-2">Quotation From:</h3>
            <p className="font-semibold">Madhura Technologies</p>
            <p className="text-sm text-gray-600">Managing Director, Company Ltd</p>
            <p className="text-sm">📞 +123 4567 8910</p>
            <p className="text-sm">✉ Madhuratech@mail.com</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="px-6">
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
                    <p className="font-semibold ">{item.description}</p>
                  </td>
                  <td className="p-3 text-right border-r">{item.price}</td>
                  <td className="p-3 text-center border-r">{item.quantity}</td>
                  <td className="p-3 text-right border-r ">{item.item_subtotal   }</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-9 p-6 ">
            <div className="px-6 pb-6 mt-[80px] text-left relative right-[26px]">
          <h4 className="font-semibold text-lime-600 mb-2">
            Terms & Conditions
          </h4>
          <p className="text-xs text-left text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{header.subtotal}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount</span>
              <span>₹{header.total_discount}</span>
            </div>
            <div className="flex justify-between mb-2">
            <span>CGST</span>
             <span>₹{header.total_cgst}</span>
             </div>

             <div className="flex justify-between mb-2">
             <span>SGST</span>
              <span>₹{header.total_sgst}</span>
             </div>

            <div className="bg-lime-500 text-white p-4 mt-4 rounded-md flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">₹{header.grand_total}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-800 text-white text-sm flex justify-between p-4">
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
