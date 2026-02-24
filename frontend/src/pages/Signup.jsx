import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Map, Sparkles, User, ShieldCheck } from 'lucide-react';
// 1. Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
const Signup = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false) 
  const backend_url = import.meta.env.VITE_APP_BACKEND_URL
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    
  });

  const handleSubmit = async(e) => {
    
    e.preventDefault();

    // 2. Logic with Toastify
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required!", { theme: "dark" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.warning("Passwords do not match!", { theme: "dark" });
      return;
    }
    
    setLoading(true)
    try{
      const { name, email, password } = formData;
      const res = await axios.post(`${backend_url}/api/auth/signup`,
      {name,email,password},
      {
        withCredentials:true,
        headers:{"Content-Type":"application/json"}
      })
      if (res.status === 200 || res.status==201) {
        
        toast.success("Signup Successful", { theme: "dark" })
        navigate("/")
      }
    }catch(err){
      const errorMsg = err.response?.data?.message || err.message || "Signup failed";
      toast.error(errorMsg, { theme: "dark" });
    }finally{
      setLoading(false) 
    }
  };

  const handleLogin=(e)=>{
      e.preventDefault();
      navigate("/login")
    }

  return (
    <div className="h-screen w-full bg-[#05070a] flex items-center justify-center p-6 md:p-12 overflow-hidden font-sans">
      
      {/* 3. Add the Toast Container here */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

      <div className="w-full max-w-7xl h-full max-h-[85vh] bg-[#0c0f14] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col lg:flex-row">

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-[#0c0f14] h-full overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            <div className="mb-6 text-left">
              <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm">Join us to start planning your next trip.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-[#161a21] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    className="w-full bg-[#161a21] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#161a21] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#161a21] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors uppercase tracking-widest"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? "Hide" : "Show"} Passwords
              </button>

              <button className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98] group mt-2"  disabled={loading} >
                {loading ? "Signing up..." : "Signup"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Member already? <button className="text-white font-bold hover:underline" onClick={handleLogin}>Log in</button>
            </p>
          </div>
        </div>

        {/* --- LEFT SIDE: IMAGE --- */}
        <div className="hidden lg:flex lg:w-1/2 relative h-full">
          <img 
            src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=1200" 
            alt="Travel" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070a]/90 via-transparent to-transparent" />
          <div className="relative z-10 p-12 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-500 p-2 rounded-xl text-black">
                <Map size={24} />
              </div>
              <span className="text-xl font-black text-black tracking-tighter uppercase">TRAVELX</span>
            </div>
            <div className="mb-6">
              <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">Escape the <br/> ordinary.</h2>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Signup;