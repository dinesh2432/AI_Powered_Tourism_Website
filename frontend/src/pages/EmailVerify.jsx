import React, { useState } from 'react';
import { Mail, ArrowRight, Map, ShieldCheck } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const EmailVerify = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const backend_url = import.meta.env.VITE_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${backend_url}/api/auth/emailVerify`, { email },{withCredentials:true,headers: { "Content-Type": "application/json" }});
      if (res.status === 200) {
        toast.success("Reset link sent to your email!", { theme: "dark" });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#05070a] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="w-full max-w-md bg-[#0c0f14] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-white/5 relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="bg-cyan-500 p-2 rounded-xl text-black">
              <Map size={24} />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">TRAVELX</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
            <p className="text-gray-500 text-sm">We'll send a password reset link to your inbox.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="email" 
                  placeholder="johndoe@gmail.com"
                  className="w-full bg-[#161a21] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98] disabled:opacity-50 group"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => window.history.back()} className="text-sm text-gray-500 hover:text-white transition-colors">
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;