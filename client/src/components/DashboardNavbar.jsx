import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/explore', label: 'Explore', icon: '🎬' },
    { to: '/guides', label: 'Guides', icon: '🧑‍💼' },
    { to: '/trips', label: 'My Trips', icon: '🗺️' },
    { to: '/chatbot', label: 'AI Chat', icon: '💬' },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 h-18 flex items-center">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo & Search Placeholder */}
          <div className="flex items-center gap-12">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-glow-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                ✈
              </div>
              <span className="font-display font-black text-2xl tracking-tighter gradient-text hidden sm:block italic">TravelX</span>
            </Link>

            {/* <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 w-80 group focus-within:border-primary-500/50 transition-all">
                <span className="opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search expeditions..." 
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-white placeholder:text-slate-600 w-full ml-3"
                />
            </div> */}
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-6">
            {/* <Link to="/create-trip" className="hidden sm:flex btn-primary h-11 px-6 text-xs font-black uppercase tracking-widest items-center gap-2 shadow-glow-primary hover:shadow-glow-secondary">
              Launch <span>🚀</span>
            </Link> */}

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 glass-dark hover:bg-white/10 border border-white/5 rounded-2xl p-1.5 pr-4 transition-all duration-300 group shadow-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 p-[2px] shadow-glow-primary rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-xs font-black text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-black text-white leading-none mb-0.5 truncate max-w-20 uppercase tracking-tighter">{user?.name?.split(' ')[0]}</p>
                  {/* <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest leading-none">Pro Plan</p> */}
                </div>
                <svg className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${profileOpen ? 'rotate-180 text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 mt-4 w-64 glass-dark border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 p-2"
                  >
                    <div className="px-5 py-4 mb-2 border-b border-white/5">
                      <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold truncate tracking-tight">{user?.email}</p>
                    </div>

                    <div className="space-y-1">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" onClick={() => setProfileOpen(false)}>
                        <span className="text-lg">👤</span> Account Settings
                      </Link>
                      <Link to="/trips" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" onClick={() => setProfileOpen(false)}>
                        <span className="text-lg">🗺️</span> Mission History
                      </Link>
                      {user?.isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" onClick={() => setProfileOpen(false)}>
                          <span className="text-lg">⚙️</span> Control Center
                        </Link>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-4 text-xs font-black text-red-400 hover:bg-red-500/10 rounded-2xl transition-all uppercase tracking-widest">
                        <span className="text-lg">🚪</span> Terminate Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center glass-dark border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current transition-all duration-300 rounded-full ${mobileOpen ? 'rotate-45 translate-y-1.5' : 'w-full'}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 rounded-full ${mobileOpen ? 'opacity-0' : 'w-2/3'}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 rounded-full ${mobileOpen ? '-rotate-45 -translate-y-1.5' : 'w-full'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed inset-y-0 right-0 w-80 bg-slate-950/95 backdrop-blur-3xl border-l border-white/5 p-6 z-[60] shadow-3xl"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-display font-black text-xl gradient-text italic">NAVIGATION</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-500 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] transition-all ${isActive(link.to) ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20 shadow-glow-primary' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              <div className="pt-6 border-t border-white/5 mt-6">
                <Link to="/create-trip" className="flex items-center justify-center gap-3 h-14 w-full text-white bg-gradient-to-r from-primary-500 to-secondary-600 rounded-[22px] font-black uppercase tracking-widest text-xs shadow-glow-primary" onClick={() => setMobileOpen(false)}>
                  Launch Expedition 🚀
                </Link>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-4 w-full px-6 py-4 text-xs font-black text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-[22px] transition-all uppercase tracking-widest mt-10">
                🚪 Abort Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default DashboardNavbar;
