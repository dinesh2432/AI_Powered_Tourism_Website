import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left panel — Immersive Travel Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85"
          alt="Travel background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-slate-950/40 to-secondary-950/80" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all">✈</div>
            <span className="font-display font-black text-3xl text-white tracking-tighter">TravelX</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-md"
          >
            <blockquote className="text-white text-3xl font-display font-medium italic leading-tight mb-8">
              "To travel is to live, and to return is to have changed forever."
            </blockquote>
            <p className="text-primary-300 font-bold uppercase tracking-[0.3em] text-xs">— Wanderer's Manifesto</p>
          </motion.div>

          {/* Premium Testimonial Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-20 glass-dark p-6 rounded-[32px] max-w-sm text-left border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              {/* <div className="relative">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Sarah" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary-500/30" />
                <div className="absolute -bottom-1 -right-1 bg-primary-500 w-4 h-4 rounded-full border-2 border-slate-900" />
              </div> */}
              {/* <div>
                <p className="text-white font-bold text-sm">Sarah Mitchell</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Adventure Architect</p>
              </div> */}
              {/* <div className="ml-auto flex text-accent-400 text-[10px]">★★★★★</div> */}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "TravelX transformed my planning process. It's like having a world-class travel agent in my pocket 24/7."
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — Luxury Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative bg-slate-950">
        {/* Subtle Background Elements for Mobile/Right Panel */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo (mobile) */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-glow-primary">✈</div>
            <span className="font-display font-black text-2xl tracking-tighter gradient-text">TravelX</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tighter italic">Welcome Back.</h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">Sign in to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="input-label">Email ID</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="john@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">✉</span>
              </div>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="input-label mb-0">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:text-white transition-all">
                  Forgot Password
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔐</span>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all text-xl outline-none"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-5 text-lg font-bold shadow-glow-primary transition-all duration-300 mt-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                    Unlock Journey <span>→</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-slate-950 px-4 text-slate-600">New around here?</span></div>
            </div>
            
            <Link to="/signup" className="group text-white font-bold text-lg hover:text-primary-400 transition-colors inline-block">
                Create your new account <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          <div className="mt-12 text-center lg:hidden">
            <Link to="/" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span>←</span> Back to Exploration
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
