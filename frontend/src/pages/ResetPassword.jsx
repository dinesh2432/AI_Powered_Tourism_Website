import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Map, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const backend_url = import.meta.env.VITE_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.warning("Passwords do not match!", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${backend_url}/api/auth/resetPassword`, 
        { token:token, password:formData.password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' },}
        );
      
      if (res.status === 200) {
        toast.success("Password reset successfully!", { theme: "dark" });
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#05070a] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="w-full max-w-md bg-[#0c0f14] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-white/5 relative">
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="bg-cyan-500 p-2 rounded-xl text-black">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black text-white tracking-tighter tracking-widest">SECURE</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Set New Password</h2>
            <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[#161a21] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm New Password</label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[#161a21] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button 
              className="w-full bg-cyan-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;