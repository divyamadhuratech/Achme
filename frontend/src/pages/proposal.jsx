import React, { useState,useEffect,useRef} from "react";
import {Plus,Search,Download ,X,Edit2,MinusCircle,PlusCircle, Trash2} from "lucide-react";
import Invoice from "../components/invoicetemplate";
import { calculateItemTotal , calculateTotals} from "../utils/invoicecal";
import axios from "axios";
import html2pdf from "html2pdf.js";


const Proposal = () => {
    const [quotations, setQuotations] = useState([]);
     const [open, setOpen] = useState(false);        
      const tabopen = () => {
      setOpen(true);
    };

   
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
   const [viewId, setViewId] = useState(null);
   const [showinvoice, setShowInvoice] = useState(false);



  const [items, setItems] = useState([
    { name: "", price: 0, qty: 1, tax: 0, discount: 0 },
  ]);

  const [customer, setCustomer] = useState({
    customer_name: "",
    mobile_number: "",
    email: "",
    location_city: "",
  });

  const [quotation, setQuotation] = useState({
    quotation_date: "",
  });

  // 
  const invoiceRef = useRef(null);
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

 
  /* -------------------- FETCH ALL -------------------- */
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    const res = await axios.get("http://localhost:3000/api/quotations");
    setQuotations(res.data);
  };

  /* -------------------- EDIT -------------------- */
  const handleEdit = async (id) => {
    const res = await axios.get(
      `http://localhost:3000/api/quotations/${id}`
    );

    const rows = res.data;
    const h = rows[0];

    setCustomer({
      customer_name: h.customer_name,
      mobile_number: h.mobile_number,
      email: h.email,
      location_city: h.location_city,
    });

    setQuotation({ quotation_date: h.quotation_date });

    setItems(
      rows.map((r) => ({
           name: r.description,
           price: Number(r.price) || 0,
           qty: Number(r.quantity) || 1,
           tax: Number(r.tax) || 0,
           discount: Number(r.discount) || 0,
      }))
    );

    setEditId(id);
    setOpen(true);
  };

  /* SAVE  */
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!quotation.quotation_date) {
    alert("Please select quotation date");
    return;
  }

  if (items.some(i => !i.name.trim())) {
    alert("Item description cannot be empty");
    return;
  }

  if (items.some(i => i.price <= 0 || i.qty <= 0)) {
    alert("Item price and quantity must be greater than 0");
    return;
  }

  try {
    const totals = calculateTotals(items);

    if (isNaN(totals.grand_total)) {
      alert("Invalid calculation detected");
      return;
    }

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
        tax: i.tax,
        discount: i.discount,
        subtotal: calculateItemTotal(i), // safer
      })),
    };

    if (editId) {
      await axios.put(
        `http://localhost:3000/api/quotations/${editId}`,
        payload
      );
      alert("Quotation updated successfully");
    } else {
      await axios.post(
        "http://localhost:3000/api/quotations/create",
        payload
      );
      alert("Quotation created successfully");
    }

    setOpen(false);
    setEditId(null);
    fetchQuotations();

  } catch (err) {
    console.error("ERROR:", err);
    alert(
      err.response?.data?.message ||
      "Server error. Check backend logs."
    );
  }
};


  /*ITEMS */
  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const addItem = () =>
    setItems((p) => [...p, { name: "", price: 0, qty: 1, tax: 0, discount: 0 }]);

  const removeItem = () =>
    setItems((p) => (p.length > 1 ? p.slice(0, -1) : p));
  
// Format Date
const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
  });


  // Delete items;
const handleDelete = async () => {
  if (!selectedId) {
    alert("Select a quotation to delete");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this quotation?")) {
    return;
  }

  try {
    await axios.delete(
      `http://localhost:3000/api/quotations/${selectedId}`
    );

    alert("Quotation deleted successfully");

    setSelectedId(null);
    setViewId(null);
    fetchQuotations();
  } catch (error) {
    console.error(error.response?.data || error);
    alert("Delete failed. Check backend logs.");
  }
};

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



    return(
      <div className="w-full">
        <div className="invoice-heading-tab  flex gap-4 justify-between item-center">
        <div>
          <h2 className="text-2xl font-[Times-Roman] text-[25px] font-bold text-[#1694CE]">Quotation</h2>
          <a  className="text-[30px] text-black-500 font-['Times_New_Roman',serif] mr-[25px]" href="vii">
            Dashboard
          </a>
        </div>

        <div className="flex gap-3 ">
          <div className="flex items-center gap-3 bg-gray px-2 py-1 rounded-lg  border w-50 h-9 mt-4">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="Search outline-none text-sm w-full bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex gap-2">
              <div onClick={downloadPDF} className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                <Download size={28}/>
              </div>
              
              {/* view */}
              {/* <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer"
               onClick={() => { if (!selectedId) return alert("Select a quotation");
             

            }}>
             <Eye size={28}/>  
             </div> */}

             {/*  */}
             <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer"
            onClick={() => {if(!selectedId) return alert("Select A quotation"); handleEdit(selectedId)}}>
              <Edit2 size={18} />
             </div>

             <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer"
            onClick={ handleDelete }>
              <Trash2 size={18} />
             </div>

            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={() => tabopen(true)}
              className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] " >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
{/* Table */}
{!viewId && (
  <div className="bg-white shadow rounded-xl mt-[20px]">
  <table className="w-full text-sm border border-gray-200 border-collapse">
    
    <thead className="bg-[#f8faf9]">
      <tr className="text-black font-[Times-New-Roman] uppercase text-xs border-b border-gray-300">
        <th className="px-4 py-3 border">ID</th>
        <th className="px-4 py-3 border">Customer Name</th>
        <th className="px-4 py-3 border">Mobile Number</th>
        <th className="px-4 py-3 border">Date</th>
        <th className="px-4 py-3 border">Total</th>
        <th className="px-4 py-3 border">Location City</th>
      </tr>
    </thead>

    <tbody   onClick={() => {
    setViewId(selectedId);
    setTimeout(() => setShowInvoice(true), 50);
  }}
 className="text-sm font-[Times-New-Roman] text-center">
      {quotations.map((q) => (
        <tr
          key={q.id}
          onClick={() => setSelectedId(q.id)}
          className={`
            cursor-pointer
            border-b border-gray-200
            hover:bg-gray-100
            ${selectedId === q.id ? "bg-gray-500 text-white" : ""}
          `}
        >
          <td className="px-4 py-3 border">{q.id}</td>
          <td className="px-4 py-3 border">{q.customer_name}</td>
          <td className="px-4 py-3 border">{q.mobile_number}</td>
          <td className="px-4 py-3 border">{formatDate(q.quotation_date)}</td>
          <td className="px-4 py-3 border">{q.grand_total}</td>
          <td className="px-4 py-3 border">{q.location_city}</td>
        </tr>
      ))}
    </tbody>

  </table>
</div>
)}


      {/* Forms */}
      
         <div className="application-maintab  p-5">
           <div className={`overlay ${open ? "show" : ""} `}>
            <div className="h-[210vh]">
           <div  className={`task-application bg-white shadow ml-[22%] w-[65%]  mb-[50px]   p-10 rounded-lg  ${
             open ? "show" : ""
            }`}>
              {/*  */}

                 <div className="flex justify-between items-center ">
                   <h2 className="text-2xl font-semibold mb-8 text-gray-700 mt-[-20px]">
                      Quotation
                     </h2>
                    <span className="mt-[-20px] x-icon" >
                     <X onClick={() => setOpen(false)} />
                       </span>
                     </div>
             
            <form action="" onSubmit={handleSubmit} className=" invoice-form p-6 space-y-6 relative">
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Customer Name</label>
                   <input type="text" value={customer.customer_name} onChange={e => setCustomer({...customer,customer_name: e.target.value})} name="customer_name"  className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}
                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Mobile Number</label>
                   <input type="text"   value={customer.mobile_number} onChange={e => setCustomer({...customer,mobile_number: e.target.value})}  name="mobile_number" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}

                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Location / City</label>
                   <input type="text" value={customer.location_city} onChange={e => setCustomer({...customer,location_city: e.target.value})}  name="location_city" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>
               
                 {/*  */}

                 <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor=""  className="text-sm text-gray-600 text-left">Email</label>
                   <input type="email" value={customer.email} onChange={e => setCustomer({...customer,email: e.target.value})}  name="email" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

                {/*  */}
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Qutotaion ID</label>
                   <input type="text"  name="Qutotaion_id" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>
                {/*  */}
                <div className="grid grid-cols-4 items-center gap-6">
                   <label htmlFor="" className="text-sm text-gray-600 text-left">Qutation Date</label>
                   <input type="Date" value={quotation.quotation_date} onChange={e => setQuotation({...quotation, quotation_date: e.target.value})}   name="Quotation_date" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                </div>

            {/* Descriptions */}
             
              {items.map((item, i) => (
                 <div key={i} className=" space-y-6 ">
                   <div className="grid grid-cols-4 items-center gap-6">
                        <label htmlFor="" className="text-sm text-gray-600 text-left">Quotation Number</label>
                        <input type="number" readOnly value={i + 1}  name="product_number" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                   </div>
                     {/*  */}
                   <div className="grid grid-cols-4 items-center gap-6">
                        <label htmlFor="" className="text-sm text-gray-600 text-left">Description</label>
                        <input type="text"   value={item.name}   onChange={e => updateItem(i, "name", e.target.value)}  name="description" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                   </div>

                    {/*  */}
                    <div className="grid grid-cols-4 items-center gap-6">
                     <label htmlFor="" className="text-sm text-gray-600 text-left">Price</label>

                     <div className="col-span-3 flex">
                        <div className=" inv flex items-center w-[60px] px-2 bg-[#F5F5F5] border border-r-0 rounded-l-md  text-[#AAB1B5]">
                        <span className="ml-[10px]">₹</span>
                          </div>
                        <input type="number"  value={item.price}    onChange={e => updateItem(i, "price", Number(e.target.value))}  name="price" className="w-full border rounded-r px-3 py-2 outline-none bg-white "/>
                       </div>
                   </div>                  
                   {/*  */}
                    <div className="grid grid-cols-4 items-center gap-6">
                        <label htmlFor="" className="text-sm text-gray-600 text-left">Qty</label>
                        <input type="number"   value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} name="quantity" className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"/>
                   </div>
                   {/*  */}
                    <div className="grid grid-cols-4 items-center gap-6">
                     <label htmlFor="" className="text-sm text-gray-600 text-left">Tax</label>

                     <div className="col-span-3 flex">
                        <div className=" inv flex items-center w-[60px] px-2 bg-[#F5F5F5] border border-r-0 rounded-l-md  text-[#AAB1B5]">
                        <span className="ml-[10px]">%</span>
                          </div>
                        <input type="number"  value={item.tax}   onChange={e => updateItem(i, "tax", Number(e.target.value))}  name="tax" className="w-full border rounded-r px-3 py-2 outline-none bg-white "/>
                       </div>
                   </div> 
                   {/*  */}
                    <div className="grid grid-cols-4 items-center gap-6">
                     <label htmlFor="" className="text-sm text-gray-600 text-left">Discount</label>

                     <div className="col-span-3 flex">
                        <div className=" inv flex items-center w-[60px] px-2 bg-[#F5F5F5] border border-r-0 rounded-l-md  text-[#AAB1B5]">
                        <span className="ml-[10px]">₹</span>
                          </div>
                        <input type="number"   value={item.discount}   onChange={e => updateItem(i, "discount", Number(e.target.value))}  name="discount" className="w-full border rounded-r px-3 py-2 outline-none bg-white "/>
                       </div>
                   </div> 
                   {/*  */}

                   <div className="grid grid-cols-4 items-center gap-6">
                     <label htmlFor="" className="text-sm text-gray-600 text-left">Subtotal</label>

                     <div className="col-span-3 flex">
                        <div className=" inv flex items-center w-[60px] px-2 bg-[#F5F5F5] border border-r-0 rounded-l-md  text-[#AAB1B5]">
                        <span className="ml-[10px]">₹</span>
                          </div>
                        <input readOnly type="number" value={calculateItemTotal(item)}   name="subtotal" className="w-full border rounded-r px-3 py-2 outline-none bg-white "/>
                       </div>
                   </div> 
                   

              </div>
              
            ))}
            <div className="flex gap-4 mt-6">
            <button type="button" onClick={addItem} className="text-blue-600 text-sm"><PlusCircle/></button>
          <button  type="button" onClick={removeItem} disabled={items.length === 1} className={`text-sm ${items.length === 1
        ? "text-gray-400 cursor-not-allowed"
        : "text-red-600"}`}><MinusCircle/></button></div>

                
  {/* submit and  close */}
      <div className="flex gap-4 pt-4 ">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                   >
                  Submit
                </button>

                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-red-500"
                >
                  Close
                </button>
              </div>              
   </form>
  </div>
  </div>
  </div>  
  </div>
    {/* template */}
        {viewId && (
        <div  key={viewId} ref={invoiceRef} className={`invoicewrapper w-[100%] mt-6 bg-white shadow p-4 relative overflow-y-auto ${showinvoice ? "See" : ""}`}>
          <X
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() =>{ setShowInvoice(false);
            setTimeout(() => setViewId(null), 400);
            }}
          />
          <Invoice quotationId={viewId} />
        </div>
  )}
   </div>
  )
};

export default Proposal;
