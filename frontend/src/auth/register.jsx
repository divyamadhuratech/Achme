import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// import bgvidieo from "../images/crm.mp4";
import "../Styles/tailwind.css";
export default function Register() {
  const navigate = useNavigate();
const [, setLoading] = useState(false);
  const [, setOtpSent] = useState(false);
  
// const API = "https://crm-backend-347y.onrender.com";

const API = "http://localhost:3000";

  const [form, setForm] = useState({
    first_name: "",
    user_password: "",
    email:"",
    otp:"",
    role: "user",
  });

 const sendOtp = async () => {
    if (!form.email) {
      alert("Enter email");
      return;
    }

    try {
      setLoading(true);
   await axios.post(`${API}/api/auth/send-email-otp`, { email: form.email });
      alert("OTP sent to email");
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

//  Register

   const submit = async () => {
    if (!form.otp) { alert("Please enter OTP"); return; }
    if (form.user_password.length < 6) { alert("Password must be at least 6 characters"); return; }
    try {
      await axios.post(`${API}/api/auth/register`, form);
      alert("Registration submitted! Your account is pending admin approval. You will be notified once approved.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center background-register">
       <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute  w-full h-full object-cover"
      >
        {/* <source src={bgvidieo} type="video/mp4" /> */}
      </video>
      <div className="grid w-full overflow-hidden z-50">

        {/* LEFT FORM */}
        <div className="p-10 text-white bg-black/20 backdrop-blur-[0] w-[45%] mr-[120px] h-[100%] rounded-xl">
          <div className="flex items-center gap-2 ">
            <div className="w-10 h-3"/>
            <span className="font-semibold text-yellow-300  relative right-[48px]">Madhura Softwares</span>
          </div>

          <p className="text-sm text-white mt-2 ">START FOR FREE</p>
          <h1 className="text-3xl font-bold mt-2">
            Create new account<span className="text-blue-500">.</span>
          </h1>

          <p className="text-white-400 mt-2">
            Already a member?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-8 space-y-4 px-20 relative right-20 text-black">
            <input
              placeholder="First name"
              className="w-full text-black px-4 py-3 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-[270px]"
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
            />
          <div className="flex gap-5 items-center ">
            <input
              placeholder="Enter Email"
              type="email"
              name="email"
              className=" text-black px-4 py-3 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 "
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
             <button onClick={sendOtp} className="py-3 bg-blue-500 text-white rounded-lg w-full">
                Get Otp
             </button>
             </div>

             <div className="flex gap-4">
             <input
              placeholder="Enter Otp"
              type="text"
              name="otp"
              className="w-full text-black px-4 py-3 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
              onChange={(e) =>
                setForm({ ...form, user_password: e.target.value })
              }
            />
            </div>
            <select
              className="w-full px-4 py-3 bg-white text-black rounded-lg outline-none w-[300px]"
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={submit}
              className="w-full py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition w-[300px]"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
