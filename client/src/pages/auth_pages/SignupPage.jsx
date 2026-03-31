import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-accent-500', 'bg-yellow-500', 'bg-green-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left panel — Immersive Adventure Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85"
          alt="Adventure background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-950/90 via-slate-950/40 to-primary-950/80" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary-500/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center z-10">
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all">✈</div>
            <span className="font-display font-black text-3xl text-white tracking-tighter">TravelX</span>
          </Link>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-display font-black text-white mb-6 leading-tight tracking-tighter italic"
          >
            YOUR ADVENTURE <br />STARTS <span className="gradient-text">HERE.</span>
          </motion.h2>
          
          <p className="text-slate-300 text-lg font-medium max-w-sm leading-relaxed mb-12">
            Join 10,000+ explorers worldwide who have reclaimed their time through AI-powered travel.
          </p>

          {/* <div className="grid grid-cols-2 gap-6 max-w-sm w-full">
            {[
              { v: '10K+', l: 'Trips Planned', c: 'border-primary-500/20' },
              { v: '150+', l: 'Countries', c: 'border-secondary-500/20' },
              { v: '500+', l: 'Local Experts', c: 'border-accent-500/20' },
              { v: '99%', l: 'Accuracy', c: 'border-slate-500/20' },
            ].map(({ v, l, c }) => (
              <motion.div 
                key={l}
                whileHover={{ y: -5 }}
                className={`glass-dark p-5 rounded-[24px] text-center border ${c} shadow-xl`}
              >
                <div className="text-2xl font-display font-black text-white">{v}</div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">{l}</div>
              </motion.div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Right panel — Luxury Signup Form */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen flex flex-col justify-center p-6 md:p-12 relative bg-slate-950 overflow-y-auto custom-scrollbar">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="w-full max-w-md mx-auto relative z-10 py-10 lg:py-12" 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo (mobile) */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden text-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-glow-primary">✈</div>
            <span className="font-display font-black text-2xl tracking-tighter gradient-text">TRAVELX</span>
          </Link>

          <div className="mt-8 mb-10 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tighter italic">SIGN  UP HERE!!</h1>
            {/* <p className="text-slate-400 font-medium text-lg leading-relaxed">Create your global passport for smarter travel.</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="input-label">FULL NAME</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  className="input-field pl-12"
                  placeholder="JOHN DAVIS"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">👤</span>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">EMAIL ID</label>
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
              <label className="input-label">PASSWORD</label>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="Create password"
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
              
              {form.password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`h-1.5 flex-1 rounded-full border border-white/5 transition-all duration-500 ${n <= strength ? strengthColor : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${['', 'text-red-400', 'text-accent-400', 'text-yellow-400', 'text-green-400'][strength]}`}>
                      {strengthLabel} Security
                    </p>
                    <p className="text-slate-600 text-[10px] italic">Powered by Vault™</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">CONFORM PASSWORD</label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  className="input-field pl-12"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔄</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-5 text-lg font-bold shadow-glow-primary transition-all duration-300 mt-6 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating ID...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                    SIGN UP <span>→</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-slate-950 px-4 text-slate-600">Or Continue With</span></div>
            </div>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const result = await googleLogin(credentialResponse.credential);
                  if (result.success) {
                    toast.success('Account created! Welcome aboard 🎉');
                    navigate('/dashboard');
                  } else {
                    toast.error(result.message);
                  }
                }}
                onError={() => {
                  toast.error('Google Signup Failed');
                }}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signup_with"
              />
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-slate-950 px-4 text-slate-600">Already a Member?</span></div>
            </div>
            
            <Link to="/login" className="group text-white font-bold text-lg hover:text-secondary-400 transition-colors inline-block">
                LOGIN <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
