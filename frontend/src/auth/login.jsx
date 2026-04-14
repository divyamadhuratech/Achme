  import { useState } from "react";
  import { useNavigate, Link } from "react-router-dom";
  import axios from "axios";
  import { useAuth } from "../auth/AuthContext";
  import"../Styles/tailwind.css";
  import Galaxy from "../components/galaxy";
  import { useMemo } from "react";


  export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    // Send Otp;

    const sendOtp = async () => {
  try {
    await axios.post("http://localhost:3000/api/auth/send-email-otp", {
      email: email.trim().toLowerCase(),
    });

    alert("OTP sent to your email");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to send OTP");
  }
};


    const submit = async () => {
      try {
        const res = await axios.post("http://localhost:3000/api/auth/login", {
          email: email.trim().toLowerCase(),
          otp,
        });

        login(res.data.user);
        navigate("/dashboard");
      } catch (err) {
        alert(err.response?.data?.message || "Login failed");
      }
    };

  const galaxyBg = useMemo(() => (
  <Galaxy 
    starSpeed={0.1}
    density={2}
    hueShift={140}
    speed={0.2}
    glowIntensity={0.4}
    saturation={0}
    mouseRepulsion
    repulsionStrength={0.2}
    twinkleIntensity={0.1}
    rotationSpeed={0.1}
    transparent
  />
), []);


    return (
      <div className="justify-items-center">
        {galaxyBg}
        <div className="w-full max-w-md bg-white/20 backdrop-blur-[0] mt-[88px] rounded-3xl shadow-xl p-10 text-white">
          <h1 className="text-3xl font-bold">
            Welcome back<span className="text-blue-500"></span>
          </h1>

          <p className="text-gray-400 mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8 space-y-4">
            <input
             type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-[#1f2233] rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Otp"
              className="w-full px-4 py-3 bg-[#1f2233] rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setOtp(e.target.value)}
            />
            <div className="flex gap-6">
              <button
              onClick={sendOtp}
              className="w-full py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Get Otp
            </button>
            <button
              onClick={submit}
              className="w-full py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Log in
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
