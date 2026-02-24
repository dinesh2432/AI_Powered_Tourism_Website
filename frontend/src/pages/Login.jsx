import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Map, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 1. Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false) 
  const backend_url = import.meta.env.VITE_APP_BACKEND_URL
    
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSignup =(e)=>{
    e.preventDefault();
    navigate("/signup")
  }

  const handleEmailVerify =(e)=>{
    e.preventDefault();
    navigate("/emailVerify")
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Example Toast Logic (You can replace this with your actual auth logic)
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password", {
        theme: "dark",
      });
      return;
    }
    
    setLoading(true)
    try{
      const {email,password}=formData;
      const res = await axios.post(`${backend_url}/api/auth/login`,
        {email,password},
        {withCredentials:true,headers:{"Content-Type":"application/json"}
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

  return (
    // Fixed height wrapper to prevent body scroll
    <div className="h-screen w-full bg-[#05070a] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      
      {/* 2. Add ToastContainer here */}
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Main Container - constrained to 90% of the viewport height */}
      <div className="w-full max-w-7xl h-full max-h-[85vh] bg-[#0c0f14] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col lg:flex-row">
        
        {/* --- LEFT SIDE: IMAGE (Height 100% of container) --- */}
        <div className="hidden lg:flex lg:w-1/2 relative h-full">
          <img 
            src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=1200" 
            alt="Adventure" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#05070a]/90 via-transparent to-transparent" />
          
          <div className="relative z-10 p-12 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-500 p-2 rounded-xl text-black">
                <Map size={24} />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">TRAVELX</span>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 border border-cyan-500/30">
                <Sparkles size={14} className="text-cyan-800" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-800">Intelligence in Motion</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                The world is <br /> waiting for you.
              </h2>
              <p className="text-gray-400 max-w-sm text-base leading-relaxed">
                Log in to sync your smart itineraries across all your devices.
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM (Height 100% of container) --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#0c0f14] h-full overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="bg-cyan-500 p-2 rounded-lg text-black">
                <Map size={20} />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">TRAVELX</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    type="email" 
                    placeholder="johndoe@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#161a21] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#161a21] border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-cyan-500 hover:underline" onClick={handleEmailVerify}>
                  Forgot Password?
                </button>
              </div>

              <button className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.97] group">
                SIGN IN
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account? {' '}
                <button className="text-white font-bold hover:text-cyan-400"  onClick={handleSignup}>
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;