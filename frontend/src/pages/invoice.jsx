import React, { useState,useEffect} from "react";
import "../Styles/tailwind.css";
import { Search, Plus, X } from "lucide-react";
import axios from "axios";

const Invoice = () => {
  const [open, setOpen] = useState(false);

  const tabopen = () => {
    setOpen(true);
  };

  //
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

  const formatInvoiceId = (id) => `INV-${String(id).padStart(6, "0")}`;

  const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN");


  // Fetch 
  

    const fetchInvoices = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/invoice/with-payments"
    );
    console.log("INVOICES:", response.data); 
    setInvoices(response.data);
  } catch (err) {
    console.log("Fetch Error:", err);
  }
};
useEffect(() => {
  fetchInvoices();
}, []);



  // Search client
  const searchClient = async (value) => {
    setClientSearch(value);
    if (!value) return setClientList([]);

    try {
      const res = await axios.get(
        `http://localhost:3000/api/client/search?name=${value}`
      );
      setClientList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const selectClient = (client) => {
    setClientSearch(client.company_name);
    setClientList([]);
    setClientType("existing");
  };

  // Save Client + Invoice
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    //  NEW CLIENT 
if (clientType === "new") {
  if (!companyName || !firstname || !lastname || !email) {
    alert("Please fill all client details");
    return;
  }

  await axios.post("http://localhost:3000/api/client/new", {
    company_name: companyName,
    client_firstname: firstname,
    client_lastname: lastname,
    client_email: email,
  });

  alert("Client created successfully");
  setOpen(false);
  return;
}

    await axios.post("http://localhost:3000/api/invoice/new", {
      client_company: clientSearch,
      project_names: projectNames,
      invoice_date: invoiceDate,
      invoice_duedate: invoiceDueDate,
      category,
    });
    fetchInvoices(); 
    alert("Invoice Created Successfully");
    setOpen(false);

  }   catch (err) {
  const msg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Submission failed";

  console.error("SUBMIT ERROR:", msg);
  alert(msg);
}


};



  return (
    <div className="invoices-main-tab">
      <div className="invoice-heading-tab flex gap-4 justify-between item-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1694CE]">INVOICES</h2>
          <a className="text-sm text-gray-500" href="vii">
            APP &gt; SALES
          </a>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-gray px-2 py-1 rounded-lg  border w-50 h-9 mt-3">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="Search outline-none text-sm w-full bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                📁
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                👤
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                📊
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                ⬆️
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                🔽
              </div>
              <div className="w-9 h-9 bg-white border rounded-lg shadow flex justify-center items-center cursor-pointer">
                ⚙️
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={() => tabopen(true)}
              className="bg-[#FF3355] text-white w-12 h-12 rounded-full flex justify-center items-center shadow-lg hover:bg-[#e62848] "
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto ">
        <div className={`overlay ${open ? "show" : ""} overflow-y-auto  `}>
          <div
            className={`task-application bg-white shadow ml-[18%] w-[70%]  mb-[50px] overflow-y-auto p-5 rounded-lg  ${
              open ? "show" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-700 mt-[-20px]">
                Create A New Invoice
              </h2>
              <span className="mt-[-20px] x-icon" onClick={() => setOpen(false)}>
                <X />
              </span>
            </div>

            <form className="invoice-form p-6 space-y-6 relative " onSubmit ={handleSubmit}>
              <div>
                <div className="grid grid-cols-4 items-center gap-6">
                  <label className="text-sm text-gray-600">
                    Client<span className="text-red-500">*</span>
                  </label>

                    {clientType === "existing" && (
                    <input
                     type="text"
                      name="client_company"
                      value={clientSearch}
                   onChange={(e) => searchClient(e.target.value)}
                className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white w-[100%]"
               placeholder="Search Client Company" />
                )}  
                {/*  */}
                </div>

                {clientList.length > 0 && (
                  <div className="absolute bg-white top-[-15px] ml-[190px] border shadow-md col-span-3 mt-[90px] w-[300px] z-10">
                    {clientList.map((c, index) => (
                      <p
                        key={index}
                        onClick={() => selectClient(c)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {c.company_name}
                      </p>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-6 mt-[15px]">
                  <label className="text-sm text-gray-600">Project</label>
                 <input
                  type="text"
                  name="project_names"
                  value={projectNames}
                  onChange={(e) => setProjectname(e.target.value)}
                  className={`col-span-3 border rounded-md px-3 py-2 outline-none w-[100%] ${
                  clientType === "new" ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                  disabled={clientType === "new"}/>

                </div>
              </div>

              {clientType === "new" && (
                <div className="bg-gray-100 p-6 rounded-lg space-y-4 new-clienttab transition-all">
                  <div className="grid grid-cols-4 items-center gap-6">
                    <label>
                      Company Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="company_name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="col-span-3 border rounded-md px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-6">
                    <label>
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="client_firstname"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      className="col-span-3 border rounded-md px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-6">
                    <label>
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="client_lastname"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="col-span-3 border rounded-md px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-6">
                    <label>
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="client_email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="col-span-3 border rounded-md px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="col-span-3 text-sm text-gray-500 text-right mt-[20px]">
                <span
                  onClick={() => setClientType("new")}
                  className="cursor-pointer "
                >
                  New Client
                </span>{" "}
                |{" "}
                <span
                  onClick={() => setClientType("existing")}
                  className=" cursor-pointer bg-gray-300 text-white px-2 py-1 rounded"
                >
                  Existing Client
                </span>
              </div>

              <div className="grid grid-cols-4 items-center gap-6 ">
                <label className="text-sm text-gray-600">
                  Invoice Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="col-span-3 border rounded-md px-3 py-2 outline-none w-[100%]"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-6 ">
                <label className="text-sm text-gray-600">
                  Due Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="invoice_duedate"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="col-span-3 border rounded-md px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-6 ">
                <label className="text-sm text-gray-600">
                  Category<span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="col-span-3 border rounded-md px-3 py-2 outline-none bg-white"
                >
                  <option value="Default">Default</option>
                </select>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="">Additional Information</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <p className="text-xs text-gray-500">* Required</p>

              <div className="flex gap-4 pt-4">
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

        {/* Table */}

        <div className="bg-white shadow rounded-xl overflow-x-auto mt-5 ">
        <table className="w-full text-sm border border-gray-300 table-fixed w-[130%]">
       <thead className="bg-[#f8faf9]">
      <tr className="text-black font-[Times-New-Roman] uppercase text-xs ">
        <th className="border px-4 py-3 text-center">ID</th>
        <th className="border px-4 py-3 ">Invoice Date</th>
        <th className="border px-4 py-3">Company Name</th>
        <th className="border px-4 py-3">Project Title </th>
        <th className="border px-4 py-3">Discount Amount</th>
        <th className="border px-4 py-3">Payments</th>
        <th className="border px-4 py-3">Status</th>
        <th className="border px-4 py-3 w-[90px] text-center">Actions</th>
      </tr>
    </thead>

    <tbody className="text-sm font-[Times-New-Roman] text-center">
  {invoices.length === 0 ? (
    <tr>
      <td colSpan="8" className="py-6 text-gray-400">
        No invoices found
      </td>
    </tr>
  ) : (
    invoices.map((inv) => (
      <tr key={inv.id} className="hover:bg-gray-100 transition">
        <td className="border px-3 py-3 ">
          {formatInvoiceId(inv.id)}
        </td>

        <td className="border px-4 py-2">
          {formatDate(inv.invoice_date)}
        </td>

        <td className="border px-4 py-2">
          {inv.client_company}
        </td>

        <td className="border px-4 py-2">
          {inv.project_names || "---"}
        </td>

        <td className="border px-4 py-2">---</td>

        <td className="border px-4 py-2">
          ₹{Number(inv.paid_amount || 0).toFixed(2)}
        </td>

        <td className="border px-4 py-2">
          <span
            className={`px-3 py-1 rounded text-xs ${
              inv.paid_amount > 0
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {inv.paid_amount > 0 ? "Partial" : "Draft"}
          </span>
        </td>

        <td className="border px-4 py-2 text-center">
          <button className="text-blue-600 hover:underline">
            View
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

  </table>
</div>

      </div>
    </div>
  );
};

export default Invoice;
